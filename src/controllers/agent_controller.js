const response = require('../middlewares/response');
const Profil = require('../models/Profil');
const Agent = require('../models/Agent');
const Acteur = require('../models/Acteur');
const bcrypt = require('bcryptjs');
const Session = require('../models/Session');
const Utils = require('../utils/utils.methods');
const CircuitAffectation = require('../models/CircuitAffectation');
const Operation = require('../models/Operation');
const TypeOperation = require('../models/TypeOperation');
const MoyPaiementActeur = require('../models/MoyPaiementActeur');
const Fonds = require('../models/Fonds');

const getAllAgents = async (req, res, next) => {
    /**
     * [x] Récupérer la liste de tous les agents
     */
    console.log("Chargement des agents..");
    await Agent.findAll().then(async results => {
        await Profil.findAll().then(async profils => {

            let pending = 0;
            let valid = 0;
            let disabled = 0;

            results.forEach(r =>{

                if (r.r_statut==0) pending += 1;
                if (r.r_statut==1) valid += 1;
                if (r.r_statut==2) disabled += 1;

                for(p of profils) 
                    if (p.r_i==r.e_profil) {
                        r['profil'] = p;
                    }
                delete r.e_profil;
            })

            analytics = {
                "total": results.length,
                "pending": pending,
                "valid" : valid,
                "disabled": disabled
            };

            return response(res, 200, "Chargement terminé", results, null, analytics);
        }).catch(error => next(error));
    }).catch(error => next(error));
}

const createAgent = async (req, res, next) => {
    /**
     * [x] Vérifier que l'agent n'est pas déjà enregistré
     * [x] Lancer les création de l'agent
     * [x] Si Effectué: Lancer la création du compte acteur attaché
     */
    console.log("Création d'un agent..");
    const {session_ref, r_civilite, r_nom, r_prenom, r_email, r_telephone, r_adresse, profil_code, r_mdp} = req.body;

    console.log(`Vérification des paramètres`)
    await Utils.expectedParameters({session_ref, r_civilite, r_nom, r_prenom, r_email, r_telephone, profil_code, r_mdp}).then(async () => {

        console.log(`Vérification de session`);
        await Session.findByRef(session_ref).then(async () => {
            console.log("Vérification de l'existance de l'acteur");
            await Acteur.findByEmail(r_email).then(async acteur =>  {
                if (acteur) return response(res, 409, "Cet agent existe déjà !");
                console.log("Vérification de l'existance du profil");
                await Profil.findByCode(profil_code).then(async profil => {
                    if (!profil) return response(res, 404, `Le profil ${profil_code} n'existe pas !`);
                    console.log("Début de création");
                    await Agent.create({ ...req.body }).then(agent => {
                        console.log("Cryptage du mot passe");
                        bcrypt.hash(r_mdp, 10).then(async hash => {
                            console.log("Mise en place du compte acteur");
                            await Acteur.createAgent({
                                r_nom_complet: agent.r_nom + ' ' + agent.r_prenom,
                                r_email: r_email,
                                r_telephone: r_telephone,
                                r_adresse: r_adresse,
                                e_agent: agent.r_i,
                                r_mdp: hash
                            }).then(() => response(res, 201, "Agent créé avec succès", agent))
                            .catch(error => next(error));
                        }).catch(error => next(error));
                    }).catch(error => next(error));
                }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

const getAgent = async (req, res, next) => { 
    /**
     * [x] Récupérer les informations d'un agent pas sont id
     */
    console.log("Chargement d'un agent..");
    const id = req.params.id;
    await Agent.findById(id).then(async result => {
        if (!result) return response(res, 404, "Agent introuvale !")
        await Profil.findById(result.e_profil).then(profil => {
            delete result.e_profil;
            result.profil = profil;
            return response(res, 200, "Chargement terminé", result)
        }).catch(error => next(error));
    }).catch(error => next(error));
}

const updateAgent = async (req, res) => {
    /**
     * [x] Mise à jour des information de l'agent
     * [ ] Mise à jour sistématique des information acteur de l'agent
     */
    console.log("Mise à jour d'un agent..");
    const {session_ref, r_civilite, r_nom, r_prenom} = req.body;

    console.log(`Vérification des paramètres`)
    await Utils.expectedParameters({session_ref, r_civilite, r_nom, r_prenom}).then(async () => {
        
        console.log(`Vérification de session`);
        await Session.findByRef(session_ref).then(async () => {

            await Agent.update(req.params.id, {r_civilite, r_nom, r_prenom}).then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                return response(res, 200, "Mise à jour de l'agent terminé", result)
            }).catch(error => next(error));

        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

// const deleteAgent = async (req, res) => {
//     /**
//      * [x] Supression logique d'un agent
//      */
//     const code = req.params.id;
//     await Agent.delete(code).then(result => {
//         if (!result) return response(res, 404, `Agent intégration !`);
//         return response(res, 200, "Suppression de l'agent terminé", result)
//     }).catch(error => next(error));
// }

const getAllAgentAffectation = async (req, res, next) => {
    const id = req.params.id;
    await Acteur.findByAgentId(id).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur introuvable !`);
        await CircuitAffectation.findByActeurId(acteur.r_i).then(async affectations => {
            if (!affectations) return response(res, 404, `Panier vide !`)
            
            let analytics = {
                total: affectations.length
            }

            for(let affectation of affectations) {
                await Operation.findById(affectation.e_operation).then(async op => {

                    await Acteur.findById(op.e_acteur).then(acteur => {
                        op['acteur'] = acteur;
                        delete op.e_acteur;
                    }).catch(err => next(err));
                    await TypeOperation.findById(op.e_type_operation).then(type_operation => {
                        op['type_operation'] = type_operation;
                        delete op.e_type_operation;
                    }).catch(err => next(err));
                    await MoyPaiementActeur.findById(op.e_moyen_paiement).then(moyen_paiement => {
                        op['moyen_paiement'] = moyen_paiement;
                        delete op.e_moyen_paiement;
                    }).catch(err => next(err));
                    await Fonds.findById(op.e_fonds).then(fonds => {
                        op['fonds'] = fonds;
                        delete op.e_fonds;
                    }).catch(err => next(err));

                    affectation['operation'] = op;
                    delete affectation.e_operation;

                }).catch(err => next(err));
            } 
            
            return response(res, 200, `Chargement du panier de validation`, affectations, 'default_status', analytics);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    // defautAgent,
    getAllAgents,
    createAgent,
    getAgent,
    updateAgent,
    // deleteAgent,
    getAllAgentAffectation
}