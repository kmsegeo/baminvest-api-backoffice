const response = require('../middlewares/response');
const Fonds = require("../models/Fonds");
const Session = require("../models/Session");
const Utils = require("../utils/utils.methods")

const getAllFonds = async (req, res, next) => {
    await Fonds.findAll()
    .then(fonds => response(res, 200, `Chargement de la liste des fonds`, fonds))
    .catch(error => next(error));
}

const createFonds = async (req, res, next) => {
    console.log(`Création d'un FCP..`);
    const {session_ref, intitule, description, commission_souscription, commission_sortie} = req.body;
    console.log(`Vérification des paramètres`);
    Utils.expectedParameters({session_ref, intitule, commission_souscription, commission_sortie}).then( async () => {
        // await Session.findByRef(session_ref).then(async session => {
        console.log(`Création de code de reference`);
        Utils.generateCode("FCP", 't_fonds', 'r_reference', '-').then(async ref => {
            console.log(`Vérification de la reférence du FCP`);
            await Fonds.findByRef(ref).then(async exists => {
                if (exists) return response(res, 409, `La reférence du FCP exite déjà !`);
                console.log(`Début de création du FCP`);
                await Fonds.create(ref, {...req.body})
                .then(async fonds => response(res, 200, `Création de fonds terminé`, fonds))
                .catch(err => next(err));
            }).catch(error => next(error));
        }).catch(err => next(err));
        // }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}

const getFondsById = async (req, res, next) => {
    const id = req.params.id;
    await Fonds.findById(id).then(fonds => {
        if (!fonds) return response(res, 404, `Le FCP est introuvable !`);
        return response(res, 200, `Chargement du FCP`, fonds);
    }).catch(err => next(err));
}
const getFondsByRef = async (req, res, next) => {
    const ref = req.params.ref;
    await Fonds.findByRef(ref).then(fonds => {
        if (!fonds) return response(res, 404, `Le FCP ${ref} est introuvable !`);
        return response(res, 200, `Chargement du FCP`, fonds);
    }).catch(err => next(err));
}
const updateFonds = (req, res, next) => {
    console.log(`Mise à jour d'un FCP..`);
    const {session_ref, intitule, description, commission_souscription, commission_sortie} = req.body;
    console.log(`Vérification des paramètres`);
    Utils.expectedParameters({session_ref, intitule, commission_souscription, commission_sortie}).then( async () => {
        // await Session.findByRef(session_ref).then(async session => {
        console.log(`Création de code de reference`);
        const ref = req.params.ref;
        console.log(`Vérification de la reférence du FCP`);
        await Fonds.findByRef(ref).then(async exists => {
            if (!exists) return response(res, 404, `Le FCP n'existe pas !`);
            console.log(`Début de mise à jours du FCP`);
            await Fonds.update(ref, {...req.body})
            .then(async fonds => response(res, 200, `Mise à jours de fonds terminé`, fonds))
            .catch(err => next(err));
        }).catch(error => next(error));
        // }).catch(err => response(res, 400, err));
    }).catch(err => response(res, 400, err));
}
const deleteFondsByRef = async (req, res, next) => {
    const ref = req.params.ref;
    await Fonds.findByRef(ref).then(async fonds => {
        if (!fonds) return response(res, 404, `Le FCP ${ref} est introuvable !`);
        await Fonds.delete(ref).then(() => {
            return response(res, 200, `Supression du FCP effectuée`);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

module.exports = {
    getAllFonds,
    createFonds,
    getFondsById,
    getFondsByRef,
    updateFonds,
    deleteFondsByRef
}