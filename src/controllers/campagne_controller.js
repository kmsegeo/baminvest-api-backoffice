const response = require('../middlewares/response');
const Session = require('../models/Session');
const Campagne = require('../models/Campagne');
const Utils = require('../utils/utils.methods');
const Acteur = require('../models/Acteur');

const periodicite = ['Indeterminée', 'Limitée'];
const cible = ['Particulier', 'Entreprise', 'Les deux'];

const getAllCampagnes = async (req, res, next) => {
    console.log(`Chargement de la liste de campagne..`)
    await Campagne.findAll()
        .then(async results => {
            if (results) {
                for(let result of results) {
                    await Acteur.findById(result.e_acteur).then(acteur => {
                        result['acteur'] = acteur;
                        delete result.e_acteur;
                    }).catch(err => next(err));
                    result['periodicite_intitule'] = periodicite[result.r_periodicite];
                    result['cible_intitule'] = cible[result.r_cible];
                }
            }
            return response(res, 200, `Chargement terminé`, results)
        }).catch(err => next(err));
}

const createCampagne = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création du code de campagne
     * [x] Vérification du code de campagne, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */
    console.log(`Création de campagne..`)
    const {session_ref, intitule, periodicite, date_debut, date_fin, cible} = req.body;

    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, intitule, periodicite, date_debut, date_fin, cible}).then(async () => {

        await Session.findByRef(req.body.session_ref).then(async session => {
            Utils.generateCode("CAMP", 't_campagne_demande', 'r_code', '-').then(async code => {
                await Campagne.checkExists(code).then(async exists => {
                    if (exists) return response(res, 409, `Le code ${code} est déjà utilisée !`, exists);
                    await Campagne.create(code, session.e_acteur, {...req.body})
                    .then(result => {
                        if (!result) return response(res, 400, `Une erreur s'est produite !`);
                        result['periodicite_intitule'] = periodicite[result.r_periodicite];
                        result['cible_intitule'] = cible[result.r_cible];
                        return response(res, 201, `Campagne créé avec succès`, result)})
                    .catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));
        }).catch(error => response(res, 400, error));
        
    }).catch(err => response(res, 400, err));
}

const getCampagne = async (req, res, next) => {
    console.log(`Chargement de campagne par code..`)
    const code = req.params.code;
    await Campagne.findByCode(code).then(async result => {
        if (!result) return response(res, 404, `Campagne ${code} non trouvé !`, result)
        await Acteur.findById(result.e_acteur).then(acteur => {
            result['acteur'] = acteur;
            delete result.e_acteur;
        }).catch(err => next(err));
        if (!result) return response(res, 400, `Une erreur s'est produite`)
            result['periodicite_intitule'] = periodicite[result.r_periodicite];
            result['cible_intitule'] = cible[result.r_cible];
        return response(res, 200, `Chargement de campagne ${code}`, result)
    }).catch(err => next(err));
}

const updateCampagne = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour de campagne
     */
    console.log(`Mise à jour de campagne..`);

    const code = req.params.code;
    const {session_ref, intitule, periodicite, date_debut, date_fin, cible} = req.body;

    console.log(`Vérification des paramètres..`);
    Utils.expectedParameters({session_ref, intitule, periodicite, date_debut, date_fin, cible}).then(async () => {

        await Session.findByRef(session_ref).then(async () => {
            await Campagne.update(code, {...req.body})
            .then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                result['periodicite_intitule'] = periodicite[result.r_periodicite];
                result['cible_intitule'] = cible[result.r_cible];
                return response(res, 200, `Mise à jour de campagne ${code} terminé`, result);
            }).catch(error => next(error));

        }).catch(error => response(res, 400, error));
    }).catch(err => response(res, 400, err));
}

module.exports = {
    getAllCampagnes,
    createCampagne,
    getCampagne,
    updateCampagne
}