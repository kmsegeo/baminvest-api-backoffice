const response = require('../middlewares/response');
const Profil = require('../models/Profil');
const Session = require('../models/Session');
const Utils = require('../utils/utils.methods');

const getAllProfils = async (req, res, next) => {
    /**
     * [x] Chargement de la liste des pofils
     */
    console.log('Chargement des profils..');
    await Profil.findAll()
        .then(results => response(res, 200, 'Chargement terminé', results))
        .catch(error => next(error));
 }

const createProfil = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création du code du profil
     * [x] Vérification du code du profil, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */
    console.log("Creation de profil..");
    const {session_ref, intitule} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, intitule}).then(async () => {
        if (!session_ref) return response(res, 400, 'session_ref attendu');
        await Session.findByRef(session_ref).then(async () => {
            await Utils.generateCode("PRFA", 't_profil', 'r_code', '-').then(async code => {
                await Profil.create(code, {...req.body})
                .then(result => response(res, 201, 'Profil créé avec succès', result))
                .catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

const getProfil = async (req, res, next) => { 
    /**
     * [x] Récupération des informations d'un profil
     */
    const code = req.params.code;
    console.log('Chargement de profil..');
    await Profil.findByCode(code).then(result => {
        if (!result) return response(res, 404, `Profil ${code} non trouvé !`);
        return response(res, 200, `Chargement du profil ${code}`, result);
    }).catch(error => next(error));
} 

const updateProfil = async (req, res, next) => {
    
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour d'un profil
     */
    
    console.log('Mise à jour de profil..');
    const {session_ref, intitule, description} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, intitule}).then(async () => {

        const code = req.params.code;
        await Session.findByRef(session_ref).then(async () => {
            await Profil.update(code, {intitule, description, habilitation}).then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                return response(res, 200, `Mise à jour du profil ${code} terminé`, result);
            }).catch(error => next(error));
    
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));

}

const deleteProfil = async (req, res, next) => {
    /**
     * [x] Vérifier que le profil existe 
     * [x] Suppresion d'un profil 
     */
    const code = req.params.code;
    console.log('Suppression de profil..');
    await Profil.findByCode(code).then(async result => {
        if (!result) return response(res, 404, `Profil ${code} non trouvé !`);
        await Profil.delete(code).then(() => {
            return response(res, 200, `Suppression du profil ${code} terminé`);
        }).catch(error => next(error));
    }).catch(error => next(error));    
}

module.exports = {
    getAllProfils,
    createProfil,
    getProfil,
    updateProfil,
    deleteProfil,
}