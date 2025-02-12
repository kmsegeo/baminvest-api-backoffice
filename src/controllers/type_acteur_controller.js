const response = require('../middlewares/response');
const Session = require('../models/Session');
const TypeActeur = require('../models/TypeActeur');
const Utils = require('../utils/utils.methods');

const getAllTypeActeurs = async (req, res, next) => {
    console.log(`Chargement de la liste de type acteur..`)
    await TypeActeur.findAll()
        .then(results => response(res, 200, `Chargement terminé`, results))
        .catch(err => next(err));
}

const createTypeActeur = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création du code du type acteur
     * [x] Vérification du code de type acteur, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */
    console.log(`Création de type acteur..`)
    const {session_ref, intitule} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, intitule}).then(async () => {
        
        await Session.findByRef(session_ref).then(async () => {
            Utils.generateCode("TYAC", 't_type_acteur', 'r_code', '-').then(async code => {
                await TypeActeur.checkExists(code).then(async exists => {
                    if (exists) return response(res, 409, `La reference ${code} est déjà utilisée !`, exists);
                    await TypeActeur.create(code, {...req.body})
                    .then(result => response(res, 201, `Type acteur créé avec succès`, result))
                    .catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

const getTypeActeur = async (req, res, next) => {
    console.log(`Chargement de type acteur par code..`)
    const code = req.params.code;
    await TypeActeur.findByCode(code).then(result => {
        if (!result) return response(res, 404, `Type acteur ${code} non trouvé !`, result);
        response(res, 200, `Chargement du type acteur ${code}`, result)
    }).catch(err => next(err));
}

const updateTypeActeur = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour du type acteur
     */

    console.log(`Mise à jour de type acteur..`);
    const {session_ref, intitule, description} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, intitule}).then(async () => {

        const code = req.params.code;
        await Session.findByRef(session_ref).then(async () => {
            await TypeActeur.update(code, {intitule, description}).then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                return response(res, 200, `Mise à jour du type acteur ${code} terminé`, result);
            }).catch(error => next(error));

        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

module.exports = {
    getAllTypeActeurs,
    createTypeActeur,
    getTypeActeur,
    updateTypeActeur
}