const response = require('../middlewares/response');
const Acteur = require("../models/Acteur");
const CircuitAffectation = require('../models/CircuitAffectation');
const Fonds = require('../models/Fonds');
const MoyPaiementActeur = require('../models/MoyPaiementActeur');
const Operation = require("../models/Operation");
const TypeOperation = require("../models/TypeOperation");
const Utils = require("../utils/utils.methods");

const loadAllOperations = async (req, res, next) => {
    await Operation.findAll().then(async operations => {
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
        return response(res, 200, `Chargement de la liste des opération`, operations, 'operation_status');
    }).catch(err => next(err));
}

const loadAllByTypeOperation = async (req, res, next) => {
    Utils.selectTypeOperation(req.params.op).then(async op_code => {
        await TypeOperation.findByCode(op_code).then(async typeop => {
            if (!typeop) return response(res, 404, `Type opération inconnu !`);
            await Operation.findAllByTypeOperateur(typeop.r_i).then(async operations => {
                if (operations) for(let operation of operations) {
                    await MoyPaiementActeur.findById(operation.e_moyen_paiement).then(moyen_paiement => {
                        operation['moyen_paiement'] = moyen_paiement;
                        delete operation.e_moyen_paiement;
                    }).catch(err => next(err));
                    await Fonds.findById(operation.e_fonds).then(fonds => {
                        operation['fonds'] = fonds;
                        delete operation.e_fonds;
                    }).catch(err => next(err));
                    delete operation.e_acteur;
                    delete operation.e_type_operation;
                }
                return response(res, 200, `Chargement des opération de ${typeop.r_intitule}`, operations, 'operation_status');
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => response(res, 400, err));
}

const loadAllByActeur = async (req, res, next) => {
    const id = req.params.id;
    await Acteur.findById(id).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur inconnu !`);
        await Operation.findAllByActeur(id).then(async operations => {
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
            return response(res, 200, `Chargement des opération d'un acteur`, operations, 'operation_status');
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
    const { session_ref } = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref}).then(async session => {
        console.log(`Charger l'affectation`)
        await CircuitAffectation.findById(req.params.id).then(async affectation => {
            if (!affectation) return response(res, 404, `Affectation introuvable !`);
            await Operation.valid(affectation.e_operation).then(async operation => {
                if (!operation) return response(res, 404, `Opération introuvable !`);
                await CircuitAffectation.delete(affectation.r_i).then(result => {
                    if (!result) return response(res, 400, `Erreur d'affectation !`);
                    result['operation'] = operation;
                    delete result.e_operation;
                    if (operation.r_statut==1 && result.r_statut==0) return response(res, 200, `Mise à jour terminé`, result);
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => next(arr));
    }).catch(err => next(err));
}

const validOperationByCode = async(req, res, next) => {

}

module.exports = {
    loadAllOperations,
    loadAllByTypeOperation,
    loadAllByActeur,
    loadOperation,
    validOperation,
    validOperationByCode,
}