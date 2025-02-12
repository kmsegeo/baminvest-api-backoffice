const response = require('../middlewares/response');
const Client = require("../models/Client");
const TypeActeur = require("../models/TypeActeur");
const Signataire = require("../models/Signataire");
const KYC = require('../models/KYC');
const ActeurReponse = require("../models/ProfilRisqueActeurReponse");
const Personne = require("../models/PersonneContacter");
const Document = require("../models/Document");
const Representant = require("../models/Representant");

// const loadWaitingActivation = async (req, res, next) => {
//     await Client.Acteur.findAllInactive()
//     .then(clients => response(res, 200, `Chargement terminé`, clients))
//     .catch(error => next(error));
// }

const loadAllClients = async (req, res, next) => {
    
    let clients = {};
    clients['particuliers'] = [];
    clients['entreprises'] = [];
    
    await Client.Particulier.findAll()
    .then(particuliers => {
        if (particuliers) clients['particuliers'] = particuliers;
    }).catch(error => next(error));

    await Client.Entrepise.findAll()
    .then(entreprises => {
        if (entreprises) clients['entreprises'] = entreprises;
    }).catch(error => next(error));

    return response(res, 200, `Chargemement des clients`, clients)
}

const loadIndividualClients = async (req, res, next) => {
    await Client.Particulier.findAll()
    .then(clients => response(res, 200, `Chargement terminé`, clients))
    .catch(error => next(error));
}

const loadCorporateClients = async (req, res, next) => {
    await Client.Entrepise.findAll()
    .then(clients => response(res, 200, `Chargement terminé`, clients))
    .catch(error => next(error));
}

const getIndividualClientData = async (req, res, next) => {
    
    console.log(`Chargement du compte client..`);

    // await Acteur.findByIndividualId(req.params.id).then(async acteur => {
    await Client.Particulier.findById(req.params.id).then(async client => {
        if (!client) return response(res, 404, 'Compte client non trouvé !');
        
        console.log(`Chargement du type acteur`);
        await TypeActeur.findById(client.e_type_acteur).then(type_acteur => {
            client['type_acteur'] = type_acteur;
        }).catch(err => next(err));

        console.log(`Chargement des signataires`);
        await Signataire.findById(client.e_signataire).then(signataire => {
            client['signataire'] = signataire;
        }).catch(err => next(err));
        
        console.log(`Chargement du KYC de compte particulier`);
        await KYC.Particulier.findByParticulierId(client.e_particulier).then(kyc => {
            client['kyc'] = kyc;
        }).catch(err => next(err));

        console.log(`Chargement des personnes à contacter`);
        await Personne.findAllByParticulierId(client.e_particulier).then(personnes => {
            client['personnes_contacter'] = personnes;
        }).catch(err => next(err));

        console.log(`Chargement des réponses du profil risque`);
        await ActeurReponse.findAllByActeurId(client.e_type_acteur).then(acteurReponses => {
            client['p_risque_reponses'] = acteurReponses;
        }).catch(err => next(err));

        console.log(`Chargement des documents du client`)
        await Document.findAllByActeurId(client.e_type_acteur).then(documents => {
            client['documents'] = documents;
        }).catch(err => next(err));

        // delete client.e_type_acteur;
        // delete client.e_particulier;
        // delete client.e_entreprise;
        // delete client.e_signataire;
        // delete client.e_represantant;

        return response(res, 200, 'Chargement de compte particulier terminé', client);
    }).catch(err => next(err));

}

const getCorporateClientData = async (req, res, next) => {

    console.log(`Chargement du compte client..`);

    // await Acteur.findByCorporateId(req.params.id).then(async client => {
    await Client.Entrepise.findById(req.params.id).then(async client => {
        if (!client) return response(res, 404, 'Client non trouvé !');

        console.log(`Chargement des représentants`);
        client['representants'] = [];

        console.log(`Chargement du type acteur`);
        await TypeActeur.findById(client.e_type_acteur).then(type_acteur => {
            client['type_acteur'] = type_acteur;
        }).catch(err => next(err));

        console.log(`Chargement des signataires`);
        await Signataire.findById(client.e_signataire).then(signataire => {
            client['signataire'] = signataire;
        }).catch(err => next(err));
        
        console.log(`Chargement du KYC de compte entreprise`);
        await KYC.Entreprise.findByEntrepriseId(client.e_entreprise).then(kyc => {
            client['kyc'] = kyc;
        }).catch(err => next(err));

        console.log(`Chargement des représentants`);
        await Representant.findById(client.e_represantant).then(representant => {
            client['representant'] = representant;
        }).catch(err => next(err));

        console.log(`Chargement des documents du client`)
        await Document.findAllByActeurId(client.e_type_acteur).then(documents => {
            client['documents'] = documents;
        }).catch(err => next(err));

        // delete client.e_type_acteur;
        // delete client.e_particulier;
        // delete client.e_signataire;
        // delete client.e_entreprise;
        // delete client.e_represantant;
        // delete client.profil_investisseur;

        return response(res, 200, 'Chargement de compte entreprise terminé', client);
    }).catch(err => next(err));
}

module.exports = {
    // loadWaitingActivation,
    loadAllClients,
    loadIndividualClients,
    getIndividualClientData,
    loadCorporateClients,
    getCorporateClientData
}