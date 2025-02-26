const response = require('../middlewares/response');
const Session = require('../models/Session');
const PrQuestion = require('../models/ProfilRisqueQuestion');
const PrPartie = require('../models/ProfilRisquePartie');
const Utils = require('../utils/utils.methods');
const Acteur = require('../models/Acteur');

const getAllPrQuestions = async (req, res, next) => {
    console.log(`Chargement de la liste des questions..`)
    await PrQuestion.findAll()
        .then(results => response(res, 200, `Chargement terminé`, results))
        .catch(err => next(err));
}

const getAllPrPartieQuestions = async (req, res, next) => {
    console.log(`Chargement des questions de la partie..`)
    await PrPartie.findByRef(req.params.p_ref).then(async partie => {
        if (!partie) return response(res, 404, `Partie non trouvé !`);
        await PrQuestion.findAllByPartie(partie.r_i)
            .then(async results => {
                if (results) {
                    for(let result of results) {
                        await Acteur.findById(result.e_acteur).then(acteur => {
                            result['acteur'] = acteur;
                            delete result.e_acteur;
                        }).catch(err => next(err));
                        delete result.e_profil_partie;
                    }
                }
                return response(res, 200, `Chargement terminé`, results);
            }).catch(err => next(err))
    }).catch(err => next(err));
}

const createPrQuestion = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création de la reference de question
     * [x] Vérification de la reference de question, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */

    console.log(`Création de question..`);
    const {session_ref, partie_ref, r_ordre, r_intitule, r_avec_colonne, r_points_totale} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, partie_ref, r_ordre, r_intitule, r_avec_colonne, r_points_totale}).then(async () => {
        await Session.findByRef(session_ref).then(async session => {
            Utils.generateCode(PrQuestion.codePrefix, PrQuestion.tableName, PrQuestion.codeColumn, PrQuestion.codeSpliter).then(async ref => {
                await PrQuestion.checkExists(ref).then(async exists => {
                    if (exists) return response(res, 409, `La reférence ${ref} est déjà utilisée !`, exists);
                    console.log(`Récupération de la partie`)
                    await PrPartie.findByRef(partie_ref).then(async partie => { 
                        if (!partie) return response(res, 404, `Partie non trouvé !`); 
                        await PrQuestion.create(ref, partie.r_i, session.e_acteur, {...req.body})
                        .then(result => response(res, 201, `question créé avec succès`, result))
                        .catch(err => next(err))
                    }).catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

const getPrQuestion = async (req, res, next) => {
    console.log(`Chargement de la question par reference..`)
    const ref = req.params.q_ref;
    await PrQuestion.findByRef(ref).then(async result => {
        if (!result) return response(res, 404, `PrQuestion ${ref} non trouvé !`, result)
        await Acteur.findById(result.e_acteur).then(acteur => {
            result['acteur'] = acteur;
            delete result.e_acteur;
        }).catch(err => next(err));
        return response(res, 200, `Chargement de la question ${ref}`, result)
    }).catch(err => next(err));
}

const updatePrQuestion = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour de la question
     */

    console.log(`Mise à jour de la question..`);
    const {session_ref, partie_ref, r_ordre, r_intitule, r_avec_colonne, r_points_totale} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, partie_ref, r_ordre, r_intitule, r_avec_colonne, r_points_totale}).then(async () => {

        await Session.findByRef(session_ref).then(async () => {
            
            const q_ref = req.params.q_ref;
            await PrPartie.findByRef(partie_ref).then(async partie => {
                if (!partie) return response(res, 404, `Partie non trouvé !`);
                await PrQuestion.update(q_ref, partie.r_i, {...req.body})
                .then(result => {
                    if (!result) return response(res, 400, `Une erreur s'est produite !`);
                    return response(res, 200, `Mise à jour de la question ${q_ref} terminé`, result);
                }).catch(error => next(error));
            }).catch(error => next(error));
    
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));

}

module.exports = {
    getAllPrQuestions,
    getAllPrPartieQuestions,
    createPrQuestion,
    getPrQuestion,
    updatePrQuestion
}