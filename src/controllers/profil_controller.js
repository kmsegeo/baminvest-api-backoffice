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
    const {session_ref, r_intitule, r_habilitation} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, r_intitule}).then(async () => {
        if (!session_ref) return response(res, 400, 'session_ref attendu');
        await Session.findByRef(session_ref).then(async () => {
            await Utils.generateCode(Profil.codePrefix, Profil.tableName, Profil.codeColumn, Profil.codeSpliter).then(async code => {
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
    const {session_ref, r_intitule, r_description, r_habilitation} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, r_intitule}).then(async () => {

        const code = req.params.code;
        await Session.findByRef(session_ref).then(async () => {
            await Profil.update(code, {r_intitule, r_description, r_habilitation}).then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                return response(res, 200, `Mise à jour du profil ${code} terminé`, result);
            }).catch(error => next(error));
    
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));

}

const disableProfil = async (req, res, next) => {
    const code = req.params.code;
    console.log('Suppression de profil..');
    await Profil.findByCode(code).then(async result => {
        if (!result) return response(res, 404, `Profil ${code} non trouvé !`);
        await Profil.updateStatus(result.r_i, 2).then().catch(error => next(error));
        return response(res, 200, `Profil ${code} désactivé`);
    }).catch(error => next(error));    
}

const enableProfil = async (req, res, next) => {
    const code = req.params.code;
    console.log('Suppression de profil..');
    await Profil.findByCode(code).then(async result => {
        if (!result) return response(res, 404, `Profil ${code} non trouvé !`);
        await Profil.updateStatus(result.r_i, 1).then().catch(error => next(error));
        return response(res, 200, `Profil ${code} activé`);
    }).catch(error => next(error));    
}


module.exports = {
    getAllProfils,
    createProfil,
    getProfil,
    updateProfil,
    disableProfil,
    enableProfil
}