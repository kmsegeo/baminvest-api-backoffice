const response = require('../middlewares/response');
const Document = require('../models/Document');
const News = require('../models/News');
const Utils = require('../utils/utils.methods');

const getAllNews = async (req, res, next) => {
    await News.findAll().then(async results => {
        for(let result of results) {
            await Document.findById(result.e_document).then(async doc => {
                delete doc.r_i
                delete doc.r_date_creer
                delete doc.r_date_modif
                result['fichier'] = doc;
                delete result.r_statut
                delete result.e_document
                delete result.e_acteur
            }).catch(err => next(err));
        }
        return response(res, 200, `Chargement des news terminé`, results)
    }).catch(err => next(err));
}

const createNews = async (req, res, next) => {
    console.log(`Création d'un acrticle..`);
    const acteur_id = req.session.e_acteur;
    const {r_titre, r_article, document_ref} = req.body;
    Utils.expectedParameters({r_titre, r_article, document_ref}).then(async () => {
        await Document.findByRef(document_ref).then(async document => {
            if (!document) return response(res, 404, `Fichier non trouvé !`);
            await News.save(acteur_id, {r_titre, r_article, e_document: document.r_i}).then(async result => {
                if (!result) return response(res, 400, `Une erreur s'est produite !`);
                await Document.findById(result.e_document).then(async doc => {
                    delete doc.r_i
                    delete doc.r_date_creer
                    delete doc.r_date_modif
                    result['fichier'] = doc;
                    delete result.r_statut
                    delete result.e_document
                    delete result.e_acteur
                }).catch(err => next(err));
                return response(res, 200, `Enregistrement de l'article terminé`, result);
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => response(res, 400, err));
}

const getOneNews = async (req, res, next) => {
    const id = req.params.id;
    await News.findById(id).then(async result => {
        if (!result) return response(res, 404, 'Article non trouvé !');
        await Document.findById(result.e_document).then(async doc => {
            delete doc.r_i
            delete doc.r_date_creer
            delete doc.r_date_modif
            result['fichier'] = doc;
            delete result.r_statut
            delete result.e_document
            delete result.e_acteur
        }).catch(err => next(err));
        return response(res, 200, `Chargement de l'article`, result);
    }).catch(err => next(err));
}

const updateNews = async (req, res, next) => {
    const id = req.params.id;
    console.log(`Mise à jour de l'article ${id}..`);    
    const {r_titre, r_article, document_ref} = req.body;
    Utils.expectedParameters({r_titre, r_article, document_ref}).then(async () => {
        await Document.findByRef(document_ref).then(async document => {
            if (!document) return response(res, 404, `Fichier non trouvé !`);
            await News.update(id, {r_titre, r_article, e_document: document.r_i}).then(async result => {
                if (!result) return response(res, 404, 'Article non trouvé !');
                await Document.findById(result.e_document).then(async doc => {
                    delete doc.r_i
                    delete doc.r_date_creer
                    delete doc.r_date_modif
                    result['fichier'] = doc;
                    delete result.r_statut
                    delete result.e_document
                    delete result.e_acteur
                }).catch(err => next(err));
                return response(res, 200, `Mise à jour de l'article terminé`, result);
            }).catch(err => next(err));
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const deleteNews = async (req, res, next) => {
    const id = req.params.id;
    console.log(`Suppression de l'article ${id}..`);
    await News.delete(id).then(async result => {
        if (!result) return response(res, 404, 'Article non trouvé !');
        return response(res, 200, `Suppression de l'article terminé`);
    }).catch(err => next(err));
}


module.exports = {
    getAllNews,
    createNews,
    getOneNews,
    updateNews,
    deleteNews
}