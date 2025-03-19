const response = require('../middlewares/response');
const Acteur = require("../models/Acteur");
const Fonds = require('../models/Fonds');
const Portefeuille = require("../models/Portefeuille");
const Analytics = require("../utils/analytics.methods");

const loadAllPortefeuilles = async (req, res, next) => {
    
    await Portefeuille.findAll().then(async portefeuilles => {

        if (portefeuilles) for(let portefeuille of portefeuilles) {
            await Acteur.findById(portefeuille.e_acteur).then(acteur => {
                portefeuille['acteur'] = acteur;
                delete portefeuille.e_acteur;
            }).catch(err => next(err));
            await Fonds.findById(portefeuille.e_fonds).then(fonds => {
                portefeuille['fonds'] = fonds;
                delete portefeuille.e_fonds;
            }).catch(err => next(err));
        }
        
        let best = 0, average = 0, lowest = 0;
        await Analytics.average(portefeuilles, 'r_val_placement').then(async result => {
            best = result.best;  average = result.average; lowest = result.average;
        }).catch(err => response(res, 400, err));
        let analytics = { total: portefeuilles.length, best, average, lowest}

        return response(res, 200, `Chargement de tous les portefeuilles`, portefeuilles, null, analytics)
    }).catch(err => next(err));
}

const loadActeurPortefeuilles = async (req, res, next) => {
    const acteur_id = req.params.id;
    await Acteur.findById(acteur_id).then(async acteur => {
        if (!acteur) response(res, 404, `Acteur inconnu`);
        await Portefeuille.findAllByActeur(acteur_id).then(async portefeuilles => {
            if (portefeuilles) for(let portefeuille of portefeuilles) {
                await Fonds.findById(portefeuille.e_fonds).then(fonds => {
                    portefeuille['fonds'] = fonds;
                    delete portefeuille.e_fonds;
                }).catch(err => next(err));
            }
            return response(res, 200, `Chargement des portefeuilles du client`, portefeuilles);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    loadAllPortefeuilles,
    loadActeurPortefeuilles
}