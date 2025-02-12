const response = require('../middlewares/response');
const Acteur = require("../models/Acteur");
const Portefeuille = require("../models/Portefeuille");

const loadAllPortefeuilles = async (req, res, next) => {
    
    await Portefeuille.findAll()
        .then(portefeuilles => response(res, 200, `Chargement de tous les portefeuilles`, portefeuilles))
        .catch(err => next(err));
}

const loadActeurPortefeuilles = async (req, res, next) => {
    const id = req.params.id;
    await Acteur.findById(id).then(async acteur => {
        if (!acteur) response(res, 404, `Acteur inconnu`);
        await Portefeuille.findAllByActeur(id)
            .then(portefeuilles => response(res, 200, `Chargement des portefeuilles du client`, portefeuilles))
            .catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    loadAllPortefeuilles,
    loadActeurPortefeuilles
}