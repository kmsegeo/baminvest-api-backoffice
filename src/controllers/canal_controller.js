const response = require("../middlewares/response");
const Canal = require("../models/Canal");
const Utils = require("../utils/utils.methods");

const getAllCanals = async (req, res, next) => {
    await Canal.findAll().then(async canals => {
        for (let canal of canals)
            if (canal) delete canal.r_pass;
        return response(res, 200, `Chargement des canaux`, canals);
    }).catch(err => next(err));
}
const createCanal = async (req, res, next) => {

    console.log(`Création de canal..`);
    const {session_ref, intitule, pass} = req.body;

    await Utils.expectedParameters({session_ref, intitule, pass}).then(async () => {
        await Session.findByRef(session_ref).then(async session => {
            await Utils.generateCanalCode(Canal.code_prefix, Canal.tableName, Canal.code_colunm).then(code => {
                Canal.findByCode(code).then(async exists => {
                    if(exists) return response(res, 409, `Le code du canal existe déjà !`);
                    console.log("Cryptage du mot passe");
                    await bcrypt.hash(pass, 10).then(async hash => {
                        console.log(hash);
                        console.log(`Creation du canal`);
                        await Canal.create(code, {intitule, description, pass:hash}).then(async canal => {
                            if (canal) delete canal.r_pass;
                            return response(res, 201, `Création du canal effcetuée`, canal);
                        }).catch(err => next(err));
                    }).catch(err => next(err));
                }).catch(err=>next(err));
            }).catch(err => response(res, 400, err));
        }).catch(err => response(res, 400, err))
    }).catch(error => response(res, 400, error));
}

const getOneCanal = async (req, res, next) => {
    const code = req.params.code;
    await Canal.findByCode(code).then(async canal => {
        if (!canal) return response(res, 404, `Canal non trouvé !`);
        delete canal.r_pass;
        return response(res, 200, `Chargement du canal ${code}`, canal);
    }).catch(err => next(err))
}

const updateCanal = async (req, res, next) => {
    
    console.log(`Mise à jour de canal..`);
    const {session_ref, intitule} = req.body;

    await Utils.expectedParameters({session_ref, intitule}).then(async () => {
        await Session.findByRef(session_ref).then(async session => {
            await Canal.findByCode(code).then(async canal => {
                if(!canal) return response(res, 404, `Canal non trouvé !`);
                console.log(`Mise à jour du canal`);
                await Canal.update(code, {intitule, description}).then(async result => {
                    if (result) delete result.r_pass;
                    return response(res, 201, `Mise à jour du canal effcetuée`, result);
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => response(res, 400, err))
    }).catch(error => response(res, 400, error));
}

module.exports ={
    getAllCanals,
    createCanal,
    getOneCanal,
    updateCanal
}