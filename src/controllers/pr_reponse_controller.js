const response = require('../middlewares/response');
const Session = require('../models/Session');
const MReponse = require('../models/ProfilRisqueReponse');
const RMatrice = require('../models/ProfilRisqueRepMatrice');
const Utils = require('../utils/utils.methods');

const getAllMReponses = async (req, res, next) => {
    console.log(`Chargement des réponses de matrice..`)
    const rm_ref= req.params.rm_ref;
    await RMatrice.findByRef(rm_ref).then(async matrice => {
        if (!matrice) return response(res, 404, 'Matrice non trouvé !');
        await MReponse.findAllByMatrice(matrice.r_i)
        .then(results => response(res, 200, `Chargement terminé`, results))
        .catch(err => next(err))
    }).catch(err => next(err));
}

const createMReponse = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création de la reference de reponse
     * [x] Vérification de la reference de reponse, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */

    console.log(`Création de reponse..`);
    const {session_ref, matrice_ref, ordre, intitule, points} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, matrice_ref, ordre, intitule, points}).then(async () => {

        await Session.findByRef(session_ref).then(async session => {
            Utils.generateCode("MTRP", 't_risque_reponses', 'r_reference', '-').then(async ref => {
                await MReponse.checkExists(ref).then(async exists => {
                    if (exists) return response(res, 409, `La reférence ${ref} est déjà utilisée !`, exists);
                    console.log(`Récupération de la question`)
                    await RMatrice.findByRef(matrice_ref).then(async matrice => {  
                        if (!matrice) return response(res, 404, 'Matrice non trouvé !');
                        console.log(matrice)
                        await MReponse.create(ref, matrice.r_i, session.e_acteur, {...req.body})
                        .then(result => response(res, 201, `Réponse créé avec succès`, result))
                        .catch(err => next(err))
                    }).catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));

        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));

}

const getMReponse = async (req, res, next) => {
    console.log(`Chargement de la réponse par reference..`);
    const ref = req.params._ref;
    await MReponse.findByRef(req.params._ref).then(result => {
        if (!result) return response(res, 404, `Reponse ${ref} non trouvé !`);
        response(res, 200, `Chargement de la réponse ${ref}`, result);
    }).catch(err => next(err));
}

const updateMReponse = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour de la réponse
     */

    console.log(`Mise à jour de la réponse..`);
    const {session_ref, matrice_ref, ordre, intitule, points} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, matrice_ref, ordre, intitule, points}).then(async () => {
        await Session.findByRef(req.body.session_ref).then(async () => {
            const _ref = req.params._ref;
            await RMatrice.findByRef(matrice_ref).then(async matrice => {
                if (!matrice) return response(res, 404, 'Matrice non trouvé !');
                await MReponse.update(_ref, matrice.r_i, {...req.body})
                .then(result => {
                    if (!result) return response(res, 409, `Une erreur s'est produite !`);
                    return response(res, 200, `Mise à jour de la réponse ${_ref} terminé`, result);
                }).catch(error => next(error));
            }).catch(error => next(error));
    
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

module.exports = {
    getAllMReponses,
    createMReponse,
    getMReponse,
    updateMReponse
}