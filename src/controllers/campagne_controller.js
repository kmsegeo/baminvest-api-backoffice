const response = require('../middlewares/response');
const Session = require('../models/Session');
const Campagne = require('../models/Campagne');
const Utils = require('../utils/utils.methods');
const Acteur = require('../models/Acteur');
const ProfilRisquePartie = require('../models/ProfilRisquePartie');
const ProfilRisqueQuestion = require('../models/ProfilRisqueQuestion');
const ProfilRisqueReponse = require('../models/ProfilRisqueReponse');
const ProfilRisqueRepMatrice = require('../models/ProfilRisqueRepMatrice');

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
    const {session_ref, r_intitule, r_periodicite, r_date_debut, r_date_fin, r_cible} = req.body;

    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, r_intitule}).then(async () => {

        await Session.findByRef(req.body.session_ref).then(async session => {
            Utils.generateCode(Campagne.codePrefix, Campagne.tableName, Campagne.codeColumn, Campagne.codeSpliter).then(async code => {
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
    const {session_ref, r_intitule, r_periodicite, r_date_debut, r_date_fin, r_cible} = req.body;

    console.log(`Vérification des paramètres..`);
    Utils.expectedParameters({session_ref, r_intitule}).then(async () => {

        await Session.findByRef(session_ref).then(async () => {
            await Campagne.update(code, {...req.body}).then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                result['periodicite_intitule'] = periodicite[result.r_periodicite];
                result['cible_intitule'] = cible[result.r_cible];
                return response(res, 200, `Mise à jour de campagne ${code} terminé`, result);
            }).catch(error => next(error));

        }).catch(error => response(res, 400, error));
    }).catch(err => response(res, 400, err));
}

const getCampagneDetails = async (req, res, next) => {
    const code = req.params.code;
    console.log(`Chargement de campagne par code..`)
    await Campagne.findByCode(code).then(async campagne => {
        if (!campagne) return response(res, 404, `Campagne ${code} non trouvé !`, campagne)
        console.log(`Chargement des parties de la campagne`)
        await ProfilRisquePartie.findAllByCampgagne(campagne.r_i).then(async parties => {
            console.log(`Charger les question de chaque parties`);
            for(let partie of parties) {
                await ProfilRisqueQuestion.findAllByPartie(partie.r_i).then(async questions => {
                    for (let question of questions) {
                        await ProfilRisqueRepMatrice.findAllByQuestion(question.r_i).then(async matrices => {
                            for(let matrice of matrices) {
                                await ProfilRisqueReponse.findAllByLineColumn(matrice.r_i).then(async reponses => {
                                    if (question.r_avec_colonne==1) {       // Matrice
                                        console.log(matrice.r_type)
                                        if (matrice.r_type==1) {
                                            matrice.r_type='colonnes' 
                                            matrice['proposition_reponses'] = reponses;
                                        } else {
                                            matrice.r_type='lignes' 
                                            matrice['proposition_reponses'] = reponses;
                                        }
                                        question['matrice'] = matrices
                                    } else {                                // Reponses simple
                                        question['proposition_reponses'] = reponses;
                                    }
                                }).catch(err => next(err));
                            }
                        }).catch(err => next(err));
                    }
                    partie['questions'] = questions;
                }).catch(err => next(err));
            }
            campagne['parties'] = parties;
            return response(res, 200, `Chargement des questionnaires ${campagne.r_code}`, campagne);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    getAllCampagnes,
    createCampagne,
    getCampagne,
    updateCampagne,
    getCampagneDetails
}