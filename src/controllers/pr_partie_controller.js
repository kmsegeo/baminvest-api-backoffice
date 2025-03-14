const response = require('../middlewares/response');
const Session = require('../models/Session');
const PrPartie = require('../models/ProfilRisquePartie');
const Campagne = require('../models/Campagne');
const Utils = require('../utils/utils.methods');
const Acteur = require('../models/Acteur');

const getAllPrParties = async (req, res, next) => {
    console.log(`Chargement de la liste de profil risque partie..`)
    await PrPartie.findAll()
        .then(async results => {
            if (results) {
                for(let result of results) {
                    await Acteur.findById(result.e_acteur).then(acteur => {
                        result['acteur'] = acteur;
                        delete result.e_acteur;
                    }).catch(err => next(err));
                }
            }
            return response(res, 200, `Chargement terminé`, results)
        }).catch(err => next(err));
}

const getAllCampagnePrParties = async (req, res, next) => {
    console.log(`Chargement de la liste de PRP de campagne..`);
    await Campagne.findByCode(req.params.code)
    .then(async campagne => {
        if (!campagne) return response(res, 404, `Campagne non trouvé !`);
        await PrPartie.findAllByCampgagne(campagne.r_i)
            .then(async results => {
                if (results) {
                    for(let result of results) {
                //         await Acteur.findById(result.e_acteur).then(acteur => {
                //             result['acteur'] = acteur;
                            delete result.e_acteur;
                //         }).catch(err => next(err));
                        delete result.e_campagne;
                    }
                }
                return response(res, 200, `Chargement terminé`, results)
            }).catch(err => next(err))
    }).catch(err => next(err));
}

const createPrPartie = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création du code de profil risque partie
     * [x] Vérification du code de profil risque partie, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */
    console.log(`Création de profil risque partie..`);
    const {session_ref, campagne_code, r_ordre, r_intitule, r_points_totale} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, campagne_code, r_ordre, r_intitule, r_points_totale}).then(async () => {
        
        await Session.findByRef(session_ref).then(async session => {
            Utils.generateCode(PrPartie.codePrefix, PrPartie.tableName, PrPartie.codeColumn, PrPartie.codeSpliter).then(async ref => {
                await PrPartie.checkExists(ref).then(async exists => {
                    if (exists) return response(res, 409, `La reférence ${ref} est déjà utilisée !`, exists);
                    console.log(`Récupération de la campagne`)
                    await Campagne.findByCode(campagne_code).then(async campagne => {
                        if (!campagne) return response(res, 404, `Campagne non trouvé !`); 
                        await PrPartie.create(ref, campagne.r_i, session.e_acteur, {...req.body})
                        .then(result => response(res, 201, `Profil risque partie créé avec succès`, result))
                        .catch(err => next(err))
                    }).catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

const getPrPartie = async (req, res, next) => {
    console.log(`Chargement de PRP par reference..`)
    const ref = req.params.p_ref;
    await PrPartie.findByRef(ref).then(async result => {
        if (!result) return response(res, 404, `PrPartie ${ref} non trouvé !`, result)
        await Acteur.findById(result.e_acteur).then(acteur => {
            result['acteur'] = acteur;
            delete result.e_acteur;
        }).catch(err => next(err));
        response(res, 200, `Chargement de profil risque partie ${ref}`, result)
    }).catch(err => next(err));
}

const updatePrPartie = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour de profil risque partie
     */

    console.log(`Mise à jour de profil risque partie..`);
    const {session_ref, campagne_code, r_ordre, r_intitule, r_points_totale} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, campagne_code, r_ordre, r_intitule, r_points_totale}).then(async () => {
        
        const ref = req.params.p_ref;
        await Session.findByRef(session_ref).then(async () => {
            await Campagne.findByCode(campagne_code).then(async campagne => {
                if (!campagne) return response(res, 404, `Campagne non trouvé !`);
                await PrPartie.update(ref, campagne.r_i, {...req.body}).then(result => {
                    if (!result) return response(res, 400, `Une erreur s'est produite !`);
                    return response(res, 200, `Mise à jour de PRP ${ref} terminé`, result);
                }).catch(error => next(error));
            }).catch(error => next(error));

        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

module.exports = {
    getAllPrParties,
    getAllCampagnePrParties,
    createPrPartie,
    getPrPartie,
    updatePrPartie
}