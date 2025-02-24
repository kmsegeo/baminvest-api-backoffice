const response = require('../middlewares/response');
const Session = require('../models/Session');
const Systeme = require('../models/Systeme');
const Utils = require('../utils/utils.methods');

const getAllSystemes = async (req, res, next) => {
    console.log(`Chargement de la liste des éléments système..`)
    await Systeme.findAll().then(results => {
        return response(res, 200, `Chargement terminé`, results)})
    .catch(err => next(err));
}

const createSysteme = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Vérification du tag de systems, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */
    console.log(`Création d'un élément système..`)
    const {session_ref, tag, valeur} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, tag, valeur}).then(async () => {
        await Session.findByRef(session_ref).then(async () => {
            await Systeme.checkExists(tag).then(async exists => {
                if (exists) return response(res, 409, `Le tag ${tag} est déjà utilisée !`, exists);
                await Systeme.create({...req.body}).then(result => response(res, 201, `Elément système créé avec succès`, result))
                .catch(err => next(err))
            }).catch(err => next(err))
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
    
}

const getSysteme = async (req, res, next) => {
    console.log(`Chargement de système par tag..`)
    const tag = req.params.tag;
    await Systeme.findByTag(tag).then(result => {
        if (!result) return response(res, 404, `Element système ${tag} non trouvé !`, result)
        response(res, 200, `Chargement de l'élément système ${tag}`, result)
    }).catch(err => next(err));
}

const updateSysteme = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour du systeme
     */
    
    console.log(`Mise à jour d'un élément système..`);
    const {session_ref, valeur, description} = req.body;
    const tag = req.params.tag;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, tag, valeur}).then(async () => {
        await Session.findByRef(session_ref).then(async () => {
            await Systeme.update(tag, {valeur, description}).then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                return response(res, 200, `Mise à jour d'élément système ${tag} terminé`, result);
            }).catch(error => next(error));
    
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

module.exports = {
    getAllSystemes,
    createSysteme,
    getSysteme,
    updateSysteme
}