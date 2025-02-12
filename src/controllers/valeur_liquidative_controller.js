const response = require('../middlewares/response');
const Fonds = require("../models/Fonds");
const Session = require("../models/Session");
const ValeurLiquidative = require("../models/ValeurLiquidative");
const Utils = require("../utils/utils.methods");

const getAllValLiquidative = async (req, res, next) => {
    await ValeurLiquidative.findAll()
        .then(results => response(res, 200, `Chargement de toutes les valeurs liquidatives`, results))
        .catch(err => next(err));
}

const getAllFondsValLiquidative = async (req, res, next) => {
    /**
     * [x] Chargement du fonds avec la reférence données
     * [x] Chargement des valeurs liquidatives à partir de l'id de fonds récupéré
     */
    console.log(`Récupération du FCP via la reférence`);
    const ref = req.params.ref;
    await Fonds.findByRef(ref).then(async fonds => {
        if (!fonds) return response(res, 404, `FCP introuvable`);
        await ValeurLiquidative.findAllByFonds(fonds.r_i)
            .then(results => response(res, 200, `Chargement des valeurs liquidatives de ${ref}`, results))
            .catch(err => next(err));
    }).catch(err => next(err));
}

const createValLiquidative = async (req, res, next) => {
    /**
     * [x] Vérification des paramètres en entré
     * [x] Vérification du code de session
     * [x] Chargement du fonds avec la reférence données
     * [x] Enregistrement de la valeur liquidative
     */
    console.log(`Création de valeur liquidative de fonds`);
    const {session_ref, fonds_ref, date, date_precedente, description, valeur_actuelle, valeur_precedente, performance_hebdo, performance_jour, performance_mois} = req.body;
    console.log(`Vérification des paramètres`);
    Utils.expectedParameters({session_ref, fonds_ref, date, date_precedente, valeur_actuelle, valeur_precedente, performance_hebdo, performance_jour, performance_mois}).then(async () => {
        await Session.findByRef(session_ref).then(async () => {
            await Fonds.findByRef(fonds_ref).then(async fonds => {
                if (!fonds) return response(res, 404, `FCP introuvable`);
                await ValeurLiquidative.create(fonds.r_i, {...req.body}).then( vl => {
                    if (!vl) return response(res, 400, `Une erreur s'est produite`);
                    return response(res, 201, `Création de valeur liquidative de fonds`, vl);
                }).catch(err => next(err));
            }).catch(err => next(err));
        }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}

const getOneValLiquidative = async (req, res, next) => {
    await ValeurLiquidative.findById(req.params.id).then(vl => {
        if (!vl) return response(res, 404, `Valeur liquidative non trouvé`);
        return response(res, 200, `Chargement d'une valeur liquidative`, vl);
    }).catch(err => next(err));
}

const updateValLiquidative = async (req, res, next) => {
    /**
     * [x] Vérification des paramètres en entré
     * [x] Vérification du code de session
     * [x] Chargement du fonds avec la reférence données
     * [x] Mise à jour de la valeur liquidative
     */
        console.log(`Création de valeur liquidative de fonds`);
        const {session_ref, fonds_ref, date, date_precedente, description, valeur_actuelle, valeur_precedente, performance_hebdo, performance_jour, performance_mois} = req.body;
        console.log(`Vérification des paramètres`);
        Utils.expectedParameters({session_ref, fonds_ref, date, date_precedente, valeur_actuelle, valeur_precedente, performance_hebdo, performance_jour, performance_mois}).then(async () => {
            await Session.findByRef(session_ref).then(async () => {
                await Fonds.findByRef(fonds_ref).then(async fonds => {
                    if (!fonds) return response(res, 404, `FCP introuvable`);
                    await ValeurLiquidative.update(req.params.id, fonds.r_i, {...req.body})
                        .then(vl => response(res, 200, `Mise à jour de la valeur liquidative`, vl))
                        .catch(err => next(err));
                }).catch(err => next(err));
            }).catch(err => response(res, 400, err));
        }).catch(err => response(res, 400, err));
}


module.exports = {
    getAllValLiquidative,
    getAllFondsValLiquidative,
    createValLiquidative,
    getOneValLiquidative,
    updateValLiquidative
}