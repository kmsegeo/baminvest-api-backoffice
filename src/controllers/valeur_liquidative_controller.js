const response = require('../middlewares/response');
const Fonds = require("../models/Fonds");
const Session = require("../models/Session");
const ValeurLiquidative = require("../models/ValeurLiquidative");
const Analytics = require('../utils/analytics.methods');
const Utils = require("../utils/utils.methods");

const getAllValLiquidativeAtDate = async (req, res, next) => {

    const from = req.params.date_debut;
    const to = req.params.date_fin;

    await ValeurLiquidative.findAllBetween2Date(from, to).then(async results => {

        let fond_list = {};

        await Fonds.findAll().then(async fonds => {
            
            for (let result of results) {
                for(let fd of fonds) {
                    if (result.e_fonds==fd.r_i) {
                        result['fonds'] = fd;
                        delete result.e_fonds;
                    }
                }
            }

            for(let fd of fonds)
                fond_list[fd.r_intitule] = 0;       // ## A faire : Recupérer la dernière valeur du fond 
            
        }).catch(err => next(err));

        return response(res, 200, `Chargement de toutes les valeurs liquidatives`, results, null, fond_list);
    }).catch(err => next(err));
}

const getAllFondsValLiquidativeAtDate = async (req, res, next) => {
    /**
     * [x] Chargement du fonds avec la reférence données
     * [x] Chargement des valeurs liquidatives à partir de l'id de fonds récupéré
     */

    const from = req.params.date_debut;
    const to = req.params.date_fin;

    console.log(`Récupération du FCP via la reférence`);
    const fonds_ref = req.params.ref;

    await Fonds.findByRef(fonds_ref).then(async fonds => {
        if (!fonds) return response(res, 404, `FCP introuvable`);
        await ValeurLiquidative.findAllByFondsBetween2Date(fonds.r_i, from, to)
            .then(results => response(res, 200, `Chargement des valeurs liquidatives de ${fonds_ref}`, results))
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
    const {session_ref, fonds_ref, r_date, r_date_precedente, r_description, r_valeur_actuelle, r_valeur_precedente, r_performance_hebdo, r_performance_jour, r_performance_mois} = req.body;
    console.log(`Vérification des paramètres`);
    Utils.expectedParameters({session_ref, fonds_ref, r_date, r_date_precedente, r_valeur_actuelle, r_valeur_precedente, r_performance_hebdo, r_performance_jour, r_performance_mois}).then(async () => {
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
    await ValeurLiquidative.findById(req.params.id).then(async vl => {
        if (!vl) return response(res, 404, `Valeur liquidative non trouvé`);
        await Fonds.findById(vl.e_fonds).then(async fonds => {
            if (fonds) {
                vl['fonds'] = fonds;
                delete vl.e_fonds;
            }
        }).catch(err => next(err));
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
        const {session_ref, fonds_ref, r_date, r_date_precedente, r_description, r_valeur_actuelle, r_valeur_precedente, r_performance_hebdo, r_performance_jour, r_performance_mois} = req.body;
        console.log(`Vérification des paramètres`);
        Utils.expectedParameters({session_ref, fonds_ref, r_date, r_date_precedente, r_valeur_actuelle, r_valeur_precedente, r_performance_hebdo, r_performance_jour, r_performance_mois}).then(async () => {
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
    getAllValLiquidativeAtDate,
    getAllFondsValLiquidativeAtDate,
    createValLiquidative,
    getOneValLiquidative,
    updateValLiquidative
}