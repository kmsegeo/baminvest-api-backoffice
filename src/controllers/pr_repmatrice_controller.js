const response = require('../middlewares/response');
const Session = require('../models/Session');
const RepMatrice = require('../models/ProfilRisqueRepMatrice');
const PrQuestion = require('../models/ProfilRisqueQuestion');
const Utils = require('../utils/utils.methods');
const Acteur = require('../models/Acteur');

const type_matrice = ['ligne', 'colonne']

const getAllRepMatrices = async (req, res, next) => {
    console.log(`Chargement de la liste des réponses matricées..`)
    await RepMatrice.findAll()
        .then(async results => {
            if (results) {
                for(let result of results) {
                    await Acteur.findById(result.e_acteur).then(acteur => {
                        result['acteur'] = acteur;
                        delete result.e_acteur;
                    }).catch(err => next(err));
                    delete result.e_risques_questions;
                }
            }
            return response(res, 200, `Chargement terminé`, results)
        }).catch(err => next(err));
}

const getAllPrQuestRepMatrice = async (req, res, next) => {
    console.log(`Chargement des réponses matricées de question..`)
    await PrQuestion.findByRef(req.params.q_ref).then(async question => {
        if (!question) return response(res, 404, `Question non trouvé !`);
        await RepMatrice.findAllByQuestion(question.r_i)
            .then(async results => {
                if (results) {
                    for(let result of results) {
                        // await Acteur.findById(result.e_acteur).then(acteur => {
                        //     result['acteur'] = acteur;
                            delete result.e_acteur;
                        // }).catch(err => next(err));
                        delete result.e_risques_questions;
                        result['type_matrice'] = type_matrice[result.r_type]
                    }
                }
                return response(res, 200, `Chargement terminé`, results)
            }).catch(err => next(err))
    }).catch(err => next(err));
}

const createRepMatrice = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création de la reference de reponse matricée
     * [x] Vérification de la reference de reponse matricée, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */

    console.log(`Création de reponse..`);
    const {session_ref, question_ref, r_ordre, r_intitule, r_type} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, question_ref, r_ordre, r_intitule, r_type}).then(async () => {
        await Session.findByRef(session_ref).then(async session => {
            Utils.generateCode(RepMatrice.codePrefix, RepMatrice.tableName, RepMatrice.codeColumn, RepMatrice.codeSpliter).then(async ref => {
                await RepMatrice.checkExists(ref).then(async exists => {
                    if (exists) return response(res, 409, `La reférence ${ref} est déjà utilisée !`, exists);
                    console.log(`Récupération de la question`)
                    await PrQuestion.findByRef(question_ref).then(async question => {  
                        if (!question) return response(res, 404, `Question non trouvé !`);
                        console.log(question)
                        await RepMatrice.create(ref, question.r_i, session.e_acteur, {...req.body})
                        .then(result => response(res, 201, `Réponse créé avec succès`, result))
                        .catch(err => next(err))
                    }).catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

const getRepMatrice = async (req, res, next) => {
    console.log(`Chargement de la réponce matricée par reference..`)
    const ref = req.params.rm_ref;
    await RepMatrice.findByRef(ref).then(async result => {
        if (!result) return response(res, 404, `Reponse ${ref} non trouvé !`, result);
        await Acteur.findById(result.e_acteur).then(acteur => {
            result['acteur'] = acteur;
            delete result.e_acteur;
        }).catch(err => next(err));
        return response(res, 200, `Chargement de la réponse matricée ${ref}`, result);
    }).catch(err => next(err));
}

const updateRepMatrice = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour de la réponse matricée
     */

    console.log(`Mise à jour de la réponse matricée..`);
    const {session_ref, question_ref, r_ordre, r_intitule, r_type} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, question_ref, r_ordre, r_intitule, r_type}).then(async () => {
        await Session.findByRef(session_ref).then(async () => {
            const rm_ref = req.params.rm_ref;
            await PrQuestion.findByRef(question_ref).then(async question => {
                if (!question) return response(res, 404, `Question non trouvé !`);
                await RepMatrice.update(rm_ref, question.r_i, {...req.body}).then(result => {
                    if (!result) return response(res, 400, `Une erreur s'est produite !`);
                    return response(res, 200, `Mise à jour de la réponse ${rm_ref} terminé`, result);
                }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

module.exports = {
    getAllRepMatrices,
    getAllPrQuestRepMatrice,
    createRepMatrice,
    getRepMatrice,
    updateRepMatrice
}