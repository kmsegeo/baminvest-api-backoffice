const response = require('../middlewares/response');
const Acteur = require("../models/Acteur");
const Fonds = require('../models/Fonds');
const Portefeuille = require("../models/Portefeuille");

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
        return response(res, 200, `Chargement de tous les portefeuilles`, portefeuilles)
    }).catch(err => next(err));
}

const loadActeurPortefeuilles = async (req, res, next) => {
    const id = req.params.id;
    await Acteur.findById(id).then(async acteur => {
        if (!acteur) response(res, 404, `Acteur inconnu`);
        await Portefeuille.findAllByActeur(id).then(async portefeuilles => {
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