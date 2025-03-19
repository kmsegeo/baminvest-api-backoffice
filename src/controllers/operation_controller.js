const response = require('../middlewares/response');
const Acteur = require("../models/Acteur");
const CircuitAffectation = require('../models/CircuitAffectation');
const Fonds = require('../models/Fonds');
const MoyPaiementActeur = require('../models/MoyPaiementActeur');
const Operation = require("../models/Operation");
const TypeMoypaiement = require('../models/TypeMoypaiement');
const TypeOperation = require("../models/TypeOperation");
const Validaton = require('../models/Validation');
const Analytics = require('../utils/analytics.methods');
const Utils = require("../utils/utils.methods");

const loadAllOperationsAtDate = async (req, res, next) => {

    const from = req.params.date_debut;
    const to = req.params.date_fin;

    await Operation.findAllBetween2Date(from, to).then(async operations => {
        
        if (operations) for(let operation of operations) {
            await Acteur.findById(operation.e_acteur).then(acteur => {
                operation['acteur'] = acteur;
                delete operation.e_acteur;
            }).catch(err => next(err));
            await TypeOperation.findById(operation.e_type_operation).then(type_operation => {
                operation['type_operation'] = type_operation;
                delete operation.e_type_operation;
            }).catch(err => next(err));
            await MoyPaiementActeur.findById(operation.e_moyen_paiement).then(moyen_paiement => {
                operation['moyen_paiement'] = moyen_paiement;
                delete operation.e_moyen_paiement;
            }).catch(err => next(err));
            await Fonds.findById(operation.e_fonds).then(fonds => {
                operation['fonds'] = fonds;
                delete operation.e_fonds;
            }).catch(err => next(err));
        }
        
        let best = 0, average = 0, lowest = 0;
        await Analytics.average(operations, 'r_montant').then(async result => {
            best = result.best; average = result.average; lowest = result.lowest;
        }).catch(err => response(res, 400, err));
        let analytics = { total: operations.length, best, average, lowest }

        return response(res, 200, `Chargement de la liste des opération`, operations, 'operation_status', analytics);
    }).catch(err => next(err));
}

const getOpSouscriptionAtDate = async (req, res, next) => {
    console.log(`Chargement du type opération`);
    // Utils.selectTypeOperation('souscription').then(async op_code => {
        await loadAllByTypeOperation('TYOP-006', req, res, next);
    // }).catch(err => response(res, 400, err));
};

const getOpRachatAtDate = async (req, res, next) => {
    console.log(`Chargement du type opération`);
    // Utils.selectTypeOperation('rachat').then(async op_code => {
        await loadAllByTypeOperation('TYOP-007', req, res, next);
    // }).catch(err => response(res, 400, err));
};

const getOpTransfertAtDate = async (req, res, next) => {
    console.log(`Chargement du type opération`);
    // Utils.selectTypeOperation('transfert').then(async op_code => {
        await loadAllByTypeOperation('TYOP-008', req, res, next);
    // }).catch(err => response(res, 400, err));
};

async function loadAllByTypeOperation (op_code, req, res, next) {

    const from = req.params.date_debut;
    const to = req.params.date_fin;

    await TypeOperation.findByCode(op_code).then(async typeop => {
        if (!typeop) return response(res, 404, `Type opération inconnu !`);
        await Operation.findAllByTypeOperateurBetween2Date(typeop.r_i, from, to).then(async operations => {

            if (operations) for(let operation of operations) {
                await Acteur.findById(operation.e_acteur).then(acteur => {
                    operation['acteur'] = acteur;
                    delete operation.e_acteur;
                }).catch(err => next(err));
                await MoyPaiementActeur.findById(operation.e_moyen_paiement).then(moyen_paiement => {
                    operation['moyen_paiement'] = moyen_paiement;
                    delete operation.e_moyen_paiement;
                }).catch(err => next(err));
                await Fonds.findById(operation.e_fonds).then(fonds => {
                    operation['fonds'] = fonds;
                    delete operation.e_fonds;
                }).catch(err => next(err));
                await TypeOperation.findById(operation.e_type_operation).then(type_operation => {
                    operation['type_operation'] = type_operation;
                    delete operation.e_type_operation;
                }).catch(err => next(err));
            }

            let best = 0, average = 0, lowest = 0;
            await Analytics.average(operations, 'r_montant').then(async result => {
                best = result.best; average = result.average; lowest = result.lowest;
            }).catch(err => response(res, 400, err));
            let analytics = { total: operations.length, best, average, lowest }

            return response(res, 200, `Chargement des opération de ${typeop.r_intitule}`, operations, 'operation_status', analytics);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const loadAllByActeur = async (req, res, next) => {
    const acteur_id = req.params.id;
    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur inconnu !`);
        await Operation.findAllByActeur(acteur_id).then(async operations => {
            if (operations) for(let operation of operations) {
                await TypeOperation.findById(operation.e_type_operation).then(type_operation => {
                    operation['type_operation'] = type_operation;
                    delete operation.e_type_operation;
                }).catch(err => next(err));
                await MoyPaiementActeur.findById(operation.e_moyen_paiement).then(moyen_paiement => {
                    operation['moyen_paiement'] = moyen_paiement;
                    delete operation.e_moyen_paiement;
                }).catch(err => next(err));
                await Fonds.findById(operation.e_fonds).then(fonds => {
                    operation['fonds'] = fonds;
                    delete operation.e_fonds;
                }).catch(err => next(err));
                delete operation.e_acteur;
            }

            let best = 0, average = 0, lowest = 0;
            await Analytics.average(operations, 'r_montant').then(async result => {
                best = result.best; average = result.average; lowest = result.lowest;
            }).catch(err => response(res, 400, err));
            let analytics = { total: operations.length, best, average, lowest }

            return response(res, 200, `Chargement des opération d'un acteur`, operations, 'operation_status', analytics);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const loadOperation = async (req, res, next) => {
    await Operation.findByRef(req.params.ref).then(async operation => {
        if (!operation) return response(res, 404, `Opération introuvable`);
        
        await Acteur.findById(operation.e_acteur).then(acteur => {
            operation['acteur'] = acteur;
            delete operation.e_acteur;
        }).catch(err => next(err));
        
        await TypeOperation.findById(operation.e_type_operation).then(type_operation => {
            operation['type_operation'] = type_operation;
            delete operation.e_type_operation;
        }).catch(err => next(err));

        await MoyPaiementActeur.findById(operation.e_moyen_paiement).then(moyen_paiement => {
            operation['moyen_paiement'] = moyen_paiement;
            delete operation.e_moyen_paiement;
        }).catch(err => next(err));

        await Fonds.findById(operation.e_fonds).then(fonds => {
            operation['fonds'] = fonds;
            delete operation.e_fonds
        }).catch(err => next(err));

        return response(res, 200, `Chargement d'une opération`, operation, 'operation_status');
    }).catch(err => next(err));
}

const validOperation = async(req, res, next) => {

    /**
     * - Vérification des paramètres
     * - Chargement de la session
     * - Charger l'affectation
     * - Mise à jour du statut de l'operation à 1
     * - Mise à jour du statut de l'affectation à 0 (supprimé)
     */

    console.log(`Vérification des paramètres`)
    const { session_ref, r_description, r_motif } = req.body;
    const acteur_id = req.session.e_acteur;
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref}).then(async session => {
        console.log(`Charger l'affectation`)
        await CircuitAffectation.findById(req.params.id).then(async affectation => {
            if (!affectation) return response(res, 404, `Affectation introuvable !`);
            await Operation.updateStatus(affectation.e_operation, 1).then(async operation => {
                if (!operation) return response(res, 404, `Opération introuvable !`);
                await CircuitAffectation.delete(affectation.r_i).then(result => {
                    if (!result) return response(res, 400, `Erreur d'affectation !`);
                    result['operation'] = operation;
                    delete result.e_operation;
                    Validaton.create(acteur_id, affectation.r_i, {r_description, r_motif}).then(async validation => {
                        if (!validation) return response(res, 400, `Enregistrement de l'historique echoué !`);
                        if (operation.r_statut==1 && result.r_statut==2) return response(res, 200, `Mise à jour terminé`, validation);
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(arr));
    }).catch(err => next(err));
}

const validHistorique = async (req, res, next) => {
    const acteur_id = req.session.e_acteur;
    await Validaton.findAllByActeur(acteur_id)
        .then(async validations => {
            for (let validation of validations) {
                await CircuitAffectation.findById(validation.e_affectation).then(async affectation => {
                    if (!affectation) return response(res, 404, `Affectation introuvable !`);
                    await Operation.updateStatus(affectation.e_operation, 1).then(async operation => {
                        await TypeOperation.findById(operation.e_type_operation).then(async type_operation => {
                            operation['type_operation'] = type_operation;
                        }).catch(err => next(err));
                        await Acteur.findById(operation.e_acteur).then(async acteur => {
                            operation['acteur'] = acteur;
                        }).catch(err => next(err));
                        await Fonds.findById(operation.e_fonds).then(async fonds => {
                            operation['fonds'] = fonds;
                        }).catch(err => next(err));
                        await MoyPaiementActeur.findById(operation.e_moyen_paiement).then(async moyen_paiement => {
                            operation['moyen_paiement'] = moyen_paiement;
                        }).catch(err => next(err));
                        validation['operation'] = operation;
                        delete operation.e_type_operation;
                        delete operation.e_acteur;
                        delete operation.e_fonds;
                        delete operation.e_moyen_paiement;
                    }).catch(err => next(err));
                }).catch(err => next(err));

                delete validation.e_affectation;
                delete validation.e_acteur;
            }
            return response(res, 200, `Chargement de l'hitorique de validation`, validations)
        })
        .catch(err => next(err));
}

const validOperationByCode = async(req, res, next) => {

}

const getCommissionsAtDate = async (req, res, next) => {

    const from = req.params.date_debut;
    const to = req.params.date_fin;

    await Operation.findAllBetween2Date(from, to).then(async operations => {
        
        let frais_operation = 0;
        let frais_operateur = 0;
        
        for (let operation of operations) {
            frais_operation += Number(operation.r_frais_operation);
            frais_operateur += Number(operation.r_frais_operateur);
        }

        const frais = {frais_operation, frais_operateur};

        let best = 0, average = 0, lowest = 0;
        await Analytics.average(operations, 'r_frais_operation').then(async result => {
            best = result.best; average = result.average; lowest = result.lowest;
        }).catch(err => response(res, 400, err));
        let analytics = { total: operations.length, best, average, lowest }

        return response(res, 200, `Chargement des commissions du ${from} au ${to}`, frais, null, analytics);

    }).catch(err => next(err));
}

module.exports = {
    loadAllOperationsAtDate,
    getOpSouscriptionAtDate,
    getOpRachatAtDate,
    getOpTransfertAtDate,
    loadAllByActeur,
    loadOperation,
    validOperation,
    validHistorique,
    validOperationByCode,
    getCommissionsAtDate
}