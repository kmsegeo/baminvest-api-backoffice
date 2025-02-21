const response = require('../middlewares/response');
const Session = require('../models/Session');
const TypeDocument = require('../models/TypeDocument');
const Utils = require('../utils/utils.methods');

const getAllTypeDocuments = async (req, res, next) => {
    console.log(`Chargement de la liste de type document..`)
    await TypeDocument.findAll()
        .then(results => response(res, 200, `Chargement terminé`, results))
        .catch(err => next(err));
}

const createTypeDocument = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Création du code du type document
     * [x] Vérification du code de type document, s'il existe : stoper la création, sinon..
     * [x] Lancement de la création.
     */
    console.log(`Création de type document..`)
    const {session_ref, intitule} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, intitule, format}).then(async () => {

        await Session.findByRef(session_ref).then(async () => {
            Utils.generateCode(TypeDocument.code_prefix, TypeDocument.tableName, TypeDocument.code_colunm, TypeDocument.code_spliter).then(async code => {
                await TypeDocument.checkExists(code).then(async exists => {
                    if (exists) return response(res, 409, `La reference ${code} est déjà utilisée !`, exists);
                    await TypeDocument.create(code, {...req.body})
                    .then(result => response(res, 201, `type document créé avec succès`, result))
                    .catch(err => next(err))
                }).catch(err => next(err))
            }).catch(err => next(err));
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
    
}

const getTypeDocument = async (req, res, next) => {
    console.log(`Chargement de type document par code..`)
    const code = req.params.code;
    await TypeDocument.findByCode(code).then(result => {
        if (!result) return response(res, 404, `Type document ${code} non trouvé !`, result)
        response(res, 200, `Chargement du type document ${code}`, result)
    })
    .catch(err => next(err));
}

const updateTypeDocument = async (req, res, next) => {
    /**
     * [x] Vérification de la présence et de la validité de la session
     * [x] Mise à jour du type document
     */

    console.log(`Mise à jour de type document..`);
    const {session_ref, intitule, description} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({session_ref, intitule, format}).then(async () => {
        
        const code = req.params.code;
        await Session.findByRef(session_ref).then(async () => {
            await TypeDocument.update(code, {intitule, description, format}).then(result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                return response(res, 200, `Mise à jour du type document ${code} terminé`, result);
            }).catch(error => next(error));
    
        }).catch(error => response(res, 400, error));
    }).catch(error => response(res, 400, error));
}

module.exports = {
    getAllTypeDocuments,
    createTypeDocument,
    getTypeDocument,
    updateTypeDocument
}