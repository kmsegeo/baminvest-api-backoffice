const response = require('../middlewares/response');
const Acteur = require("../models/Acteur");
const Operation = require("../models/Operation");
const TypeOperation = require("../models/TypeOperation");
const Utils = require("../utils/utils.methods");

const loadAllOperations = async (req, res, next) => {
    await Operation.findAll()
        .then(operations => response(res, 200, `Chargement de la liste des opération`, operations))
        .catch(err => next(err));
}

const loadAllByTypeOperation = async (req, res, next) => {
    // const code = req.params.code;
    Utils.selectTypeOperation(req.params.op).then(async op_code => {
        await TypeOperation.findByCode(op_code).then(async typeop => {
            if (!typeop) return response(res, 404, `Type opération inconnu !`);
            await Operation.findAllByTypeOperateur(typeop.r_i)
                .then(operations => response(res, 200, `Chargement des opération de ${typeop.r_intitule}`, operations))
                .catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => response(res, 400, err));
}

const loadAllByActeur = async (req, res, next) => {
    const id = req.params.id;
    await Acteur.findById(id).then(async acteur => {
        if (!acteur) return response(res, 404, `Acteur inconnu !`);
        await Operation.findAllByActeur(id)
            .then(operations => response(res, 200, `Chargement des opération d'un acteur`, operations))
            .catch(err => next(err));
    }).catch(err => next(err));
}

const loadOperation = async (req, res, next) => {
    await Operation.findByRef(req.params.ref).then(operation => {
        if (!operation) return response(res, 404, `Opération introuvable`);
        return response(res, 200, `Chargement d'une opération`, operation);
    }).catch(err => next(err));
}

module.exports = {
    loadAllOperations,
    loadAllByTypeOperation,
    loadAllByActeur,
    loadOperation
}