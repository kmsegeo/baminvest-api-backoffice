const response = require('../middlewares/response');
const Session = require('../models/Session');
const TypeOperation = require('../models/TypeOperation');
const Utils = require('../utils/utils.methods');
const CircuitValidation = require('../models/CircuitValidation');
const Profil = require('../models/Profil');
const TypeActeur = require('../models/TypeActeur');
const Acteur = require('../models/Acteur');
const CircuitEtape = require('../models/CircuitEtape');
const CircuitAffectation = require('../models/CircuitAffectation');
const Operation = require('../models/Operation');

const scalable = [`Respecter l'ordre`, `Sans respecter l'ordre`];
const type_etape = [``, `Validation sur profil`, `Validation par un type acteur`, `Validation par un acteur`];

const getAllCircuit = async (req, res, next) => {
    console.log(`Chargement de la liste de circuit de validation..`);
    await CircuitValidation.findAll().then(async results => {
        await TypeOperation.findAll().then(typeop => {
            results.forEach(r => {
                for(t of typeop)
                    if (r.e_type_operation==t.r_i)
                        r['type_operation']=t;
                    delete r.e_type_operation;
                if (r) r['scalable_intitule'] = scalable[r.r_scalable];
            });
            return response(res, 200, `Chargement terminé`, results)
        }).catch(err => next(err));
    }).catch(err => next(err));
}
const createCircuit = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création du code de circuit de validation
     * [x] Vérification du code de circuit de validation, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */
    console.log(`Création de circuit de validation..`);
    const {session_ref, type_op_code, r_intitule, r_scalable} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, type_op_code, r_intitule, r_scalable}).then(async () => {
        
        await Session.findByRef(req.body.session_ref).then(async () => {
            Utils.generateCode("CVAL", 't_circuit_validation', 'r_reference', '-').then(async ref => {
                await CircuitValidation.checkExists(ref).then(async exists => {
                    if (exists) return response(res, 400, `La reférence ${ref} est déjà utilisée !`, exists);
                    console.log(`Récupération du type operation`)
                    await TypeOperation.findByCode(type_op_code).then(async type_operation => {
                        if (!type_operation) return response(res, 404, 'Type opération non trouvé !');
                        await CircuitValidation.create(ref, type_operation.r_i, {...req.body})
                        .then(result => {
                            if (result) result['scalable_intitule'] = scalable[result.r_scalable];
                            return response(res, 201, `Circuit de validation créé avec succès`, result)})
                        .catch(err => next(err))
                    }).catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));
        }).catch(error => response(res, 400, error));

    }).catch(err => response(res, 400, err));
}
const getOneCircuit = async (req, res, next) => {
    console.log(`Chargement de circuit de validation par reference..`)
    const ref = req.params.ref;
    await CircuitValidation.findByRef(ref).then(async result => {
        if (!result) return response(res, 404, `Circuit de validation ${ref} non trouvé !`, result)
        await TypeOperation.findAll().then(typeop => {
            for(t of typeop)
                if (result.e_type_operation==t.r_i)
                    result['type_operation']=t;
                delete result.e_type_operation;
            result['scalable_intitule'] = scalable[result.r_scalable];
            return response(res, 200, `Chargement de circuit de validation ${ref}`, result)
        }).catch(err => next(err));
    }).catch(err => next(err));
}
const updateCircuit = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour de circuit de validation
     */

    console.log(`Mise à jour de circuit de validation..`);
    const {session_ref, type_op_code, r_intitule, r_scalable} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, type_op_code, r_intitule, r_scalable}).then(async () => {

        await Session.findByRef(session_ref).then(async () => {
            await TypeOperation.findByCode(type_op_code).then(async type_operation => {
                if (!type_operation) return response(res, 404, 'Type opération non trouvé !');
                const ref = req.params.ref;
                await CircuitValidation.update(ref, type_operation.r_i, {...req.body}).then(result => {
                    if (!result) return response(res, 400, `Une erreur s'est produite !`);
                    result['scalable_intitule'] = scalable[result.r_scalable];
                    return response(res, 200, `Mise à jour de circuit ${ref} terminé`, result);
                }).catch(error => next(error));
            }).catch(error => next(error));

        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

const getAllCircuitEtape = async (req, res, next) => {
    const ref = req.params.ref;
    await CircuitValidation.findByRef(ref).then(async circuit => {
        if (!circuit) return response(res, 404, `Circuit non trouvé !`);
        await CircuitEtape.findAllByCircuitId(circuit.r_i)
            .then(etapes => {
                etapes.forEach(etape => {
                    if (etape) etape['type_intitule'] = type_etape[etape.r_type];
                })
                return response(res, 200, `Chargement des étapes du circuit ${ref}`, etapes)})
            .catch(err => next(err));
    }).catch(err => next(err));
}
const createCircuitEtape = async (req, res, next) => {
    console.log(`Création dune étape de circuit..`)
    const {session_ref, circuit_ref, r_intitule, r_ordre, r_description, r_type, profil_code, type_acteur_code, e_acteur} = req.body;
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, circuit_ref, r_intitule, r_ordre, r_type}).then(async () => {
        console.log(`Chargement de la session`)
        await Session.findByRef(session_ref).then(async session => {
            console.log(`Chargement du circuit de validation`)
            await CircuitValidation.findByRef(circuit_ref).then(async circuit => {
                if (!circuit) return response(res, 404, `Circuit de validation introuvable !`);
                
                let e_profil = 0;
                let e_type_acteur = 0;

                if (r_type=='1') {
                    console.log(`Chargement du profil`)
                    await Profil.findByCode(profil_code).then(async profil => {
                        if (!profil) return response(res, 404, `Profil introuvable !`);
                        e_profil = profil.r_i;
                    }).catch(err => next(err));
                }

                if (r_type=='2') {
                    console.log(`Chargement du type acteur`)
                    await TypeActeur.findByCode(type_acteur_code).then(async typeActeur => {
                        if (!typeActeur) return response(res, 404, `Type acteur introuvable`);
                        e_type_acteur = typeActeur.r_i;                       
                    }).catch(err => next(err));
                }

                if (r_type=='3') {
                    console.log(`Vérification de l'acteur`)
                    await Acteur.findById(e_acteur).then(acteur => {
                        if (!acteur) return response(res, 404, `Acteur introuvable`)
                    }).catch(err => next(err));
                }

                console.log(`Création du code d'enregistrement`)
                Utils.generateCode(CircuitEtape.codePrefix, CircuitEtape.tableName, CircuitEtape.codeColumn, CircuitEtape.codeSpliter).then(async ref => {
                    console.log(`Enregistrement de l'étape de circuit`)
                    await CircuitEtape.create(circuit.r_i, ref, e_profil, e_type_acteur, {r_intitule, r_ordre, r_description, r_type, e_acteur})
                        .then(etape => {
                            if (etape) etape['type_intitule'] = type_etape[etape.r_type];
                            return response(res, 201, `Enregistrement de l'etape du circuit`, etape)})
                        .catch(err => next(err));
                }).catch(err => next(err));

            }).catch(err => next(err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}
const getOneCircuitEtape = async (req, res, next) => {
    await CircuitEtape.findByRef(req.params.ref).then(etape => {
        if (!etape) return response(res, 404, `Etape de circuit introuvable`);
        etape['type_intitule'] = type_etape[etape.r_type];
        return response(res, 200, `Chargement d'une étape de circuit`, etape);
    }).catch(err => next(err));
}
const updateCircuitEtape = async (req, res, next) => {
    console.log(`Création dune étape de circuit..`)
    const {session_ref, circuit_ref, r_intitule, r_ordre, r_description, r_type, profil_code, type_acteur_code, e_acteur} = req.body;
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, circuit_ref, r_intitule, r_ordre, r_type}).then(async () => {
        console.log(`Chargement de la session`)
        await Session.findByRef(session_ref).then(async session => {
            console.log(`Chargement de l'étape du circuit`)
            const ref = req.params.ref;
            await CircuitEtape.findByRef(ref).then(async etape => {
                if (!etape) response(res, 404, `Etape du circuit introuvable`);
                console.log(`Chargement du circuit de validation`)
                await CircuitValidation.findByRef(circuit_ref).then(async circuit => {
                    if (!circuit) return response(res, 404, `Circuit de validation introuvable !`);

                    let e_profil = 0;
                    let e_type_acteur = 0;
                    
                    if (r_type=='1') {
                        console.log(`Chargement du profil`)
                        await Profil.findByCode(profil_code).then(async profil => {
                            if (!profil) return response(res, 404, `Profil introuvable !`);
                            e_profil = profil.r_i;
                        }).catch(err => next(err));
                    }
                    
                    if (r_type=='2') {
                        console.log(`Chargement du type acteur`)
                        await TypeActeur.findByCode(type_acteur_code).then(async typeActeur => {
                            if (!typeActeur) return response(res, 404, `Type acteur introuvable`);
                            e_type_acteur = typeActeur.r_i;                       
                        }).catch(err => next(err));
                    }

                    if (r_type=='3') {
                        console.log(`Vérification de l'acteur`)
                        await Acteur.findById(e_acteur).then(acteur => {
                            if (!acteur) return response(res, 404, `Acteur introuvable`)
                        }).catch(err => next(err));
                    }
                    
                    console.log(`Mise à jour de l'étape de circuit`)
                    await CircuitEtape.update(circuit.r_i, ref, e_profil, e_type_acteur, {r_intitule, r_ordre, r_description, r_type, e_acteur})
                        .then(update => {
                            if (etape) etape['type_intitule'] = type_etape[etape.r_type];
                            return response(res, 201, `Mise à jour de l'etape du circuit`, update)})
                        .catch(err => next(err));

                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}

// const getAllCircuitAffectation = async (req, res, next) => {
//     const ref = req.params.ref;
//     await CircuitValidation.findByRef(ref).then(async circuit => {
//         if (!circuit) return response(res, 404, `Circuit non trouvé !`);
//         await CircuitAffectation.findAllByCircuitId(circuit.r_i)
//             .then(affectations => response(res, 200, `Chargement des affectations`, affectations))
//             .catch(err => next(err));
//     }).catch(err => next(err));
// }
// const createCircuitAffectation = async (req, res, next) => {
//     console.log(`Création dune étape de circuit..`)
//     const {session_ref, circuit_ref, op_ref, e_acteur} = req.body;
//     console.log(`Vérification des paramètres`)
//     Utils.expectedParameters({session_ref, circuit_ref, op_ref, e_acteur}).then(async () => {
//         console.log(`Chargement de la session`)
//         await Session.findByRef(session_ref).then(async session => {
//             console.log(`Chargement du circuit de validation`)
//             await CircuitValidation.findByRef(circuit_ref).then(async circuit => {
//                 if (!circuit) return response(res, 404, `Circuit de validation introuvable !`);
//                 await Operation.findByRef(op_ref).then(async operation => {
//                     if (!operation) return response(res, 404, `Opération non trouvé !`);
//                     await CircuitAffectation.create(circuit.r_i, operation.r_i, {e_acteur})
//                         .then(affectations => response(res, 201, `Enregistrement de l'affectation`, affectations))
//                         .catch(err => next(err));
//                 }).catch(err => next(err));
//             }).catch(err => next(err));
//         }).catch(err => response(res, 400, err));
//     }).catch(err => response(res, 400, err));
// }
// const getOneCircuitAffectation = async (req, res, next) => {
//     await CircuitAffectation.findByRef(req.params.ref).then(affectation => {
//         if (!affectation) return response(res, 404, `Affectation introuvable`);
//         return response(res, 200, `Chargement d'une affectation`, affectation);
//     }).catch(err => next(err));
// }
// const updateCircuitAffectation = async (req, res, next) => {
//     console.log(`Création dune étape de circuit..`)
//     const {session_ref, circuit_ref, op_ref, e_acteur} = req.body;
//     console.log(`Vérification des paramètres`)
//     Utils.expectedParameters({session_ref, circuit_ref, op_ref, e_acteur}).then(async () => {
//         console.log(`Chargement de la session`)
//         await Session.findByRef(session_ref).then(async session => {
//             console.log(`Chargement du circuit de validation`)
//             await CircuitValidation.findByRef(circuit_ref).then(async circuit => {
//                 if (!circuit) return response(res, 404, `Circuit de validation introuvable !`);
//                 console.log(`Mise à jour de l'affectation`)
//                 await Operation.findByRef(op_ref).then(async operation => {
//                     if (!operation) return response(res, 404, `Opération non trouvé !`);
//                     await CircuitAffectation.update(req.params.ref, circuit.r_i, operation.r_i, {e_acteur})
//                         .then(affectations => response(res, 200, `Mise à jour de l'affectation`, affectations))
//                         .catch(err => next(err));
//                 }).catch(err => next(err));
//             }).catch(err => next(err));
//         }).catch(err => response(res, 400, err));
//     }).catch(err => response(res, 400, err));
// }

module.exports = {
    getAllCircuit,
    createCircuit,
    getOneCircuit,
    updateCircuit,
    getAllCircuitEtape,
    createCircuitEtape,
    getOneCircuitEtape,
    updateCircuitEtape,
    // getAllCircuitAffectation,
    // createCircuitAffectation,
    // getOneCircuitAffectation,
    // updateCircuitAffectation
}