const response = require('../middlewares/response');
const Document = require('../models/Document');
const TypeDocument = require('../models/TypeDocument');

const getAllFiles = async (req, res, next) => {
    
    const intitule = req.query.intitule;

    if (!intitule) 
        await Document.findAll().then(async documents => {
            return response(res, 200, `Chargement terminé`, documents);
        }).catch(err => next(err));
    else
        await Document.findAllByIntitule(intitule).then(async documents => {
            return response(res, 200, `Chargement terminé`, documents);
        }).catch(err => next(err));

}

const saveOneFile = async (req, res, next) => {

    console.log(`Chargememnt de fichier..`);

    const acteur = req.session.e_acteur;
    const typedoc_intitule = req.params.intitule;
    const nom_fichier = `${req.protocol}://${req.get('host')}/apibam/uploads/${req.file.filename}`;

    await TypeDocument.findByIntitule(typedoc_intitule).then(async typedoc => {
        if(!typedoc) return response(res, 404, `Le type document '${typedoc_intitule}' introuvable !`);
        await Document.create({acteur_id: acteur, type_document: typedoc.r_i, nom_fichier}).then(async document => {
            document['type_document'] = typedoc.r_intitule;
            delete document.e_type_document
            return response(res, 201, `Uploads terminé`, document);
        }).catch(err => next(err));
    }).catch(err => next(err));
}

const getOneFile = async (req, res, next) => {
    const ref = req.params.ref;
    await Document.findByRef(ref).then(async document => {
        if (!document) return response(res, 404, `Document non trouvé !`);
        return response(res, 200, `Chargement terminé`, document);
    }).catch(err => next(err));
}

module.exports = {
    getAllFiles,
    saveOneFile,
    getOneFile
}