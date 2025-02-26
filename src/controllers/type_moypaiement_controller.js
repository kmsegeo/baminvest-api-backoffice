const response = require('../middlewares/response');
const Session = require('../models/Session');
const TypeMoypaiement = require('../models/TypeMoypaiement');
const Utils = require('../utils/utils.methods');

const type_moyen_paiement = ['', 'Compte Bancaire', 'Mobile Money', 'Wallet', 'Carte Bancaire'];

const getAllTypeMoypaiement = async (req, res, next) => {
    await TypeMoypaiement.findAll().then(typemp => {
        typemp.forEach(tmp => {
            tmp['type_moyen_paiement'] = type_moyen_paiement[tmp.r_type]
        })
        return response(res, 200, `Chargement des types moyen de paiement`, typemp)})
    .catch(err => next(err));
}

const createTypeMoypaiement = async (req, res, next) => {

    console.log(`Creation de type moyen de paiement..`);
    const {session_ref, r_intitule, r_type} = req.body;
    
    console.log(`Vérification des paramètres`);
    Utils.expectedParameters({session_ref, r_intitule, r_type}).then( async () => {
        console.log(`Chargement de session`);
        await Session.findByRef(session_ref).then( async () => {
            console.log(`Création de code de type moyen de paiement`);
            Utils.generateCode(TypeMoypaiement.codePrefix, TypeMoypaiement.tableName, TypeMoypaiement.codeColumn, TypeMoypaiement.codeSpliter).then(async code => {
                console.log(`Enregistrement de type moyen de paiement`);
                await TypeMoypaiement.create(code, {...req.body})
                .then(typemp => {
                    if (typemp) typemp['type_moyen_paiement'] = type_moyen_paiement[typemp.r_type];
                    return response(res, 200, `Création de type moyen de paiement`,typemp)})
                .catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
    
}

const getTypeMoypaiement = async (req, res, next) => {
    await TypeMoypaiement.findByCode(req.params.code).then(async typemp => {
        if (!typemp) return response(res, 404, `Type moyen de paiement non trouvé !`);
        typemp['type_moyen_paiement'] = type_moyen_paiement[typemp.r_type];
        return response(res, 200, `Chargement du type moyen de paiement`, typemp);
    }).catch(err => next(err));
}

const updateTypeMoypaiement = async (req, res, next) => {

    console.log(`Mise à jour de type moyen de paiement..`);
    const {session_ref, r_intitule, r_type} = req.body;
    
    console.log(`Vérification des paramètres`);
    Utils.expectedParameters({session_ref, r_intitule, r_type}).then( async () => {
        console.log(`Chargement de session`);
        await Session.findByRef(session_ref).then( async () => {
            const code = req.params.code;
            console.log(`Mise à jour de type moyen de paiement ${code}`);
            await TypeMoypaiement.update(code, {...req.body})
                .then(async typemp => {
                    if (typemp) typemp['type_moyen_paiement'] = type_moyen_paiement[typemp.r_type];
                    return response(res, 200, `Mise à jour de type moyen de paiement ${code}`, typemp)})
                .catch(err => next(err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
    
}

module.exports = {
    getAllTypeMoypaiement,
    createTypeMoypaiement,
    getTypeMoypaiement,
    updateTypeMoypaiement
}