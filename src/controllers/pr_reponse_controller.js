const response = require('../middlewares/response');
const Session = require('../models/Session');
const MReponse = require('../models/ProfilRisqueReponse');
const RMatrice = require('../models/ProfilRisqueRepMatrice');
const Utils = require('../utils/utils.methods');
const Acteur = require('../models/Acteur');
const ProfilRisqueQuestion = require('../models/ProfilRisqueQuestion');

const getAllMReponses = async (req, res, next) => {
    console.log(`Chargement des réponses de matrice..`)
    const rm_ref= req.params.rm_ref;
    await RMatrice.findByRef(rm_ref).then(async matrice => {
        if (!matrice) return response(res, 404, 'Matrice non trouvé !');
        await MReponse.findAllByMatrice(matrice.r_i).then(async results => {
            if (results) {
                for(let result of results) {
                    await Acteur.findById(result.e_acteur).then(acteur => {
                        result['acteur'] = acteur;
                        delete result.e_acteur;
                    }).catch(err => next(err));
                    delete result.e_ligne_colonne;
                }
            }
            return response(res, 200, `Chargement terminé`, results)
        }).catch(err => next(err))
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
    const {session_ref, matrice_ref, r_ordre, r_intitule, r_points} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, matrice_ref, r_ordre, r_intitule, r_points}).then(async () => {

        await Session.findByRef(session_ref).then(async session => {
            Utils.generateCode(MReponse.codePrefix, MReponse.tableName, MReponse.codeColumn, MReponse.codeSpliter).then(async ref => {
                await MReponse.checkExists(ref).then(async exists => {
                    if (exists) return response(res, 409, `La reférence ${ref} est déjà utilisée !`, exists);
                    await RMatrice.findByRef(matrice_ref).then(async matrice => {
                        if (!matrice) return response(res, 404, `Matrice ${matrice_ref} non trouvé !`);
                        console.log(`Récupération de la question`);
                        await ProfilRisqueQuestion.findById(matrice.e_risques_questions).then(async question => {  
                            if (!question) return response(res, 404, 'Question non trouvé !');
                            await MReponse.create(ref, matrice.r_i, session.e_acteur, {...req.body})
                                .then(result => response(res, 201, `Réponse créé avec succès`, result))
                                .catch(err => next(err))
                        }).catch(err => next(err))
                    }).catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));

        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));

}

const getMReponse = async (req, res, next) => {
    console.log(`Chargement de la réponse par reference..`);
    const ref = req.params._ref;
    await MReponse.findByRef(req.params._ref).then(async result => {
        if (!result) return response(res, 404, `Reponse ${ref} non trouvé !`);
        await Acteur.findById(result.e_acteur).then(acteur => {
            result['acteur'] = acteur;
            delete result.e_acteur;
        }).catch(err => next(err));
        return response(res, 200, `Chargement de la réponse ${ref}`, result);
    }).catch(err => next(err));
}

const updateMReponse = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour de la réponse
     */

    console.log(`Mise à jour de la réponse..`);
    const {session_ref, question_ref, r_ordre, r_intitule, r_points} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, question_ref, r_ordre, r_intitule, r_points}).then(async () => {
        await Session.findByRef(req.body.session_ref).then(async () => {
            const _ref = req.params._ref;            
            await ProfilRisqueQuestion.findByRef(question_ref).then(async question => {
                if (!question) return response(res, 404, 'Question non trouvé !');
                await MReponse.update(_ref, question.r_i, {...req.body}).then(result => {
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