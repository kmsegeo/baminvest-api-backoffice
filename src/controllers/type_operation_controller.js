const response = require('../middlewares/response');
const Session = require('../models/Session');
const TypeOperation = require('../models/TypeOperation');
const Utils = require('../utils/utils.methods');

const getAllTypeOperations = async (req, res, next) => {
    console.log(`Chargement de la liste de type operation..`)
    await TypeOperation.findAll()
    .then(results => response(res, 200, `Chargement terminé`, results))
    .catch(err => next(err));
}

const createTypeOperation = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création du code du type operation
     * [x] Vérification du code de type operation, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */
    console.log(`Création de type operation..`)
    const {session_ref, r_intitule} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, r_intitule}).then(async () => {
        
        await Session.findByRef(session_ref).then(async () => {
            Utils.generateCode(TypeOperation.code_prefix, TypeOperation.tableName, TypeOperation.code_colunm, TypeOperation.code_spliter).then(async code => {
                await TypeOperation.checkExists(code).then(async exists => {
                    if (exists) return response(res, 409, `La reference ${code} est déjà utilisée !`, exists);
                    await TypeOperation.create(code, {...req.body})
                    .then(result => response(res, 201, `Type operation créé avec succès`, result))
                    .catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err))
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));

}

const getTypeOperation = async (req, res, next) => {
    console.log(`Chargement de type operation par code..`)
    const code = req.params.code;
    await TypeOperation.findByCode(code).then(result => {
        if (!result) return response(res, 404, `Type operation ${code} non trouvé !`)
        return response(res, 200, `Chargement du type operation ${code}`, result)
    }).catch(err => next(err));
}

const updateTypeOperation = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour du type operation
     */

    console.log(`Mise à jour de type operation..`);
    const {session_ref, r_intitule} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, r_intitule}).then(async () => {
        
        const code = req.params.code;
        await Session.findByRef(session_ref).then(async () => {
            await TypeOperation.update(code, {...req.body}).then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                return response(res, 200, `Mise à jour du type operation ${code} terminé`, result);
            }).catch(error => next(error));
    
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

const disableTypeOperation = async (req, res, next) => {
    const code = req.params.code;
    await TypeOperation.findByCode(code).then(async result => {
        if (!result) return response(res, 404, `Type operation ${code} non trouvé !`);
        await TypeOperation.updateStatus(result.r_i, 2).catch(err => next(err));
        return response(res, 200, `Type operation ${code} désactivé`)
    }).catch(err => next(err));
}

const enableTypeOperation = async (req, res, next) => {
    const code = req.params.code;
    await TypeOperation.findByCode(code).then(async result => {
        if (!result) return response(res, 404, `Type operation ${code} non trouvé !`);
        await TypeOperation.updateStatus(result.r_i, 1).catch(err => next(err));
        return response(res, 200, `Type operation ${code} activé`);
    }).catch(err => next(err));
}


module.exports = {
    getAllTypeOperations,
    createTypeOperation,
    getTypeOperation,
    updateTypeOperation,
    disableTypeOperation,
    enableTypeOperation
}