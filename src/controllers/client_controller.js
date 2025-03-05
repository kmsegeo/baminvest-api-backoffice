const response = require('../middlewares/response');
const Client = require("../models/Client");
const TypeActeur = require("../models/TypeActeur");
const Signataire = require("../models/Signataire");
const KYC = require('../models/KYC');
const ActeurReponse = require("../models/ProfilRisqueActeurReponse");
const Document = require("../models/Document");
const Representant = require("../models/Representant");
const PersonneContacter = require('../models/PersonneContacter');
const PersonnelEntreprise = require('../models/PersonnelEntreprise');
const Acteur = require('../models/Acteur');

const type_piece = [``, `cni`,`Passport`,`permis`];
const type_compte = [``, `Compte Individuel`, `Compte indivis`, `Compte conjoint`];

// const loadWaitingActivation = async (req, res, next) => {
//     await Client.Acteur.findAllInactive()
//     .then(clients => response(res, 200, `Chargement terminé`, clients))
//     .catch(error => next(error));
// }

const loadAllClients = async (req, res, next) => {
    
    let clients = {};
    clients['particuliers'] = [];
    clients['entreprises'] = [];
    
    await Client.Particulier.findAll().then(particuliers => {
        if (particuliers) clients['particuliers'] = particuliers;
    }).catch(error => next(error));

    await Client.Entrepise.findAll().then(entreprises => {
        if (entreprises) clients['entreprises'] = entreprises;
    }).catch(error => next(error));
    
    return response(res, 200, `Chargemement des clients`, clients)
}

const loadIndividualClients = async (req, res, next) => {
    await Client.Particulier.findAll().then(async clients => {

        let pending = 0;
        let valid = 0;
        let disabled = 0;

        for (let particulier of clients) {

            if (particulier.r_statut==0) pending += 1;
            if (particulier.r_statut==1) valid += 1;
            if (particulier.r_statut==2) disabled += 1;

            particulier['type_piece_intitule'] = type_piece[particulier.r_type_piece];
            particulier['type_compte_intitule'] = type_compte[particulier.r_type_compte];

            console.log(`Chargement du type acteur`);
            await TypeActeur.findById(particulier.e_type_acteur).then(async type_acteur => {
                particulier['type_acteur'] = type_acteur;
            }).catch(err => next(err));
            
            console.log(`Chargement du KYC de compte particulier`);
            await KYC.Particulier.findByParticulierId(particulier.e_particulier).then(async kyc => {
                particulier['kyc'] = kyc ? kyc : {};
            }).catch(err => next(err));

            console.log(`Chargement des documents du particulier`)
            await Document.findAllByActeurId(particulier.acteur_id).then(async documents => {
                particulier['documents'] = documents;
            }).catch(err => next(err));
            
            console.log(`Chargement des signataires`);
            await Signataire.findById(particulier.e_signataire).then(async signataire => {
                particulier['signataire'] = signataire ? signataire : {};
            }).catch(err => next(err));

            console.log(`Chargement des personnes à contacter`);
            await PersonneContacter.findAllByParticulierId(particulier.e_particulier).then(async personnes => {
                particulier['personnes_contacter'] = personnes;
            }).catch(err => next(err));

            // console.log(`Chargement des réponses du profil risque`);
            // await ActeurReponse.findAllByActeurId(particulier.).then(acteurReponses => {
            //     particulier['p_risque_reponses'] = acteurReponses;
            // }).catch(err => next(err));

            delete particulier.e_type_acteur;
            delete particulier.e_particulier;
            delete particulier.e_entreprise;
            delete particulier.e_signataire;
            delete particulier.e_represantant;
        }

        analytics = {
            "total": clients.length,
            "pending": pending,
            "valid" : valid,
            "disabled": disabled
        };

        return response(res, 200, `Chargement terminé`, clients, null, analytics)})
    .catch(error => next(error));
}

const loadCorporateClients = async (req, res, next) => {
    await Client.Entrepise.findAll().then(async clients => {

        let pending = 0;
        let valid = 0;
        let disabled = 0;

        for(let entreprise of clients) {

            if (entreprise.r_statut==0) pending += 1;
            if (entreprise.r_statut==1) valid += 1;
            if (entreprise.r_statut==2) disabled += 1;

            console.log(`Chargement des représentants`);
            entreprise['representants'] = [];

            console.log(`Chargement du type acteur`);
            await TypeActeur.findById(entreprise.e_type_acteur).then(async type_acteur => {
                entreprise['type_acteur'] = type_acteur;
            }).catch(err => next(err));
            
            console.log(`Chargement du KYC de compte entreprise`);
            await KYC.Entreprise.findByEntrepriseId(entreprise.e_entreprise).then(async kyc => {
                entreprise['kyc'] = kyc ? kyc : {};
            }).catch(err => next(err));

            console.log(`Chargement des documents du entreprise`)
            await Document.findAllByActeurId(entreprise.acteur_id).then(async documents => {
                entreprise['documents'] = documents;
            }).catch(err => next(err));

            console.log(`Chargement des représentants`);
            await Representant.findById(entreprise.e_represantant).then(async representant => {
                entreprise['representant'] = representant ? representant : {};
            }).catch(err => next(err));

            console.log(`Chargement des membres du personnel`);
            await PersonnelEntreprise.findByEntrepriseId(entreprise.e_entreprise).then(async personnels => {
                entreprise['personnels'] = personnels;
            }).catch(err => next(err));

            delete entreprise.e_type_acteur;
            delete entreprise.e_particulier;
            delete entreprise.e_signataire;
            delete entreprise.e_entreprise;
            delete entreprise.e_represantant;
            delete entreprise.profil_investisseur;
        }

        analytics = {
            "total": clients.length,
            "pending": pending,
            "valid" : valid,
            "disabled": disabled
        };

        return response(res, 200, `Chargement terminé`, clients, null, analytics);
    }).catch(error => next(error));
}

const getIndividualClientData = async (req, res, next) => {
    
    console.log(`Chargement du compte client..`);

    // await Acteur.findByIndividualId(req.params.id).then(async acteur => {
    await Client.Particulier.findById(req.params.id).then(async particulier => {
        if (!particulier) return response(res, 404, 'Compte particulier non trouvé !');
        
        if (particulier) {
            particulier['type_piece_intitule'] = type_piece[particulier.r_type_piece];
            particulier['type_compte_intitule'] = type_compte[particulier.r_type_compte];
        }

        console.log(`Chargement du type acteur`);
        await TypeActeur.findById(particulier.e_type_acteur).then(type_acteur => {
            particulier['type_acteur'] = type_acteur;
        }).catch(err => next(err));
        
        console.log(`Chargement du KYC de compte particulier`);
        await KYC.Particulier.findByParticulierId(particulier.e_particulier).then(kyc => {
            particulier['kyc'] = kyc ? kyc : {};
        }).catch(err => next(err));

        console.log(`Chargement des documents du particulier`)
        await Document.findAllByActeurId(particulier.acteur_id).then(documents => {
            particulier['documents'] = documents;
        }).catch(err => next(err));

        console.log(`Chargement des signataires`);
        await Signataire.findById(particulier.e_signataire).then(signataire => {
            particulier['signataire'] = signataire ? signataire : {};
        }).catch(err => next(err));

        console.log(`Chargement des personnes à contacter`);
        await PersonneContacter.findAllByParticulierId(particulier.e_particulier).then(personnes => {
            particulier['personnes_contacter'] = personnes;
        }).catch(err => next(err));

        delete particulier.e_type_acteur;
        delete particulier.e_particulier;
        delete particulier.e_entreprise;
        delete particulier.e_signataire;
        delete particulier.e_represantant;

        return response(res, 200, 'Chargement de compte particulier terminé', particulier);
    }).catch(err => next(err));

}

const getCorporateClientData = async (req, res, next) => {

    console.log(`Chargement du compte client..`);

    // await Acteur.findByCorporateId(req.params.id).then(async client => {
    await Client.Entrepise.findById(req.params.id).then(async entreprise => {
        if (!entreprise) return response(res, 404, 'entreprise non trouvé !');

        console.log(`Chargement du type acteur`);
        await TypeActeur.findById(entreprise.e_type_acteur).then(type_acteur => {
            entreprise['type_acteur'] = type_acteur;
        }).catch(err => next(err));

        console.log(`Chargement du KYC de compte entreprise`);
        await KYC.Entreprise.findByEntrepriseId(entreprise.e_entreprise).then(kyc => {
            entreprise['kyc'] = kyc ? kyc : {};
        }).catch(err => next(err));
        
        console.log(`Chargement des documents du entreprise`)
        await Document.findAllByActeurId(entreprise.acteur_id).then(documents => {
            entreprise['documents'] = documents;
        }).catch(err => next(err));

        console.log(`Chargement des représentants`);
        await Representant.findById(entreprise.e_represantant).then(representant => {
            entreprise['representant'] = representant ? representant : {};
        }).catch(err => next(err));

        console.log(`Chargement des membres du personnel`);
        await PersonnelEntreprise.findByEntrepriseId(entreprise.e_entreprise).then(async personnels => {
            entreprise['personnels'] = personnels;
        }).catch(err => next(err));

        delete entreprise.e_type_acteur;
        delete entreprise.e_particulier;
        delete entreprise.e_signataire;
        delete entreprise.e_entreprise;
        delete entreprise.e_represantant;
        delete entreprise.profil_investisseur;

        return response(res, 200, 'Chargement de compte entreprise terminé', entreprise);
    }).catch(err => next(err));
}

const disableParticulier = async (req, res, next) => {
    const particulierId = req.params.id;
    await Acteur.findByIndividualId(particulierId).then(async result => {
        if (!result) return response(res, 404, "Particulier introuvale !")  
        await Acteur.updateStatus(result.r_i, 2).catch(error => next(error));
        return response(res, 200, `Particulier ${particulierId} désactivé`)
    }).catch(error => next(error));
}

const enableParticulier = async (req, res, next) => {
    const particulierId = req.params.id;
    await Acteur.findByIndividualId(particulierId).then(async result => {
        if (!result) return response(res, 404, "Particulier introuvale !")
        await Acteur.updateStatus(result.r_i, 1).catch(error => next(error));
        return response(res, 200, `Particulier ${particulierId} activé`)
    }).catch(error => next(error));
}

const disableEntreprise = async (req, res, next) => {
    const entrepriseId = req.params.id;
    await Acteur.findByCorporateId(entrepriseId).then(async result => {
        if (!result) return response(res, 404, "entreprise introuvale !")  
        await Acteur.updateStatus(result.r_i, 2).catch(error => next(error));
        return response(res, 200, `Entreprise ${entrepriseId} désactivé`)
    }).catch(error => next(error));
}

const enableEntreprise = async (req, res, next) => {
    const entrepriseId = req.params.id;
    await Acteur.findByCorporateId(entrepriseId).then(async result => {
        if (!result) return response(res, 404, "entreprise introuvale !")
        await Acteur.updateStatus(result.r_i, 1).catch(error => next(error));
        return response(res, 200, `Entreprise ${entrepriseId} activé`)
    }).catch(error => next(error));
}

module.exports = {
    // loadWaitingActivation,
    loadAllClients,
    loadIndividualClients,
    getIndividualClientData,
    loadCorporateClients,
    getCorporateClientData,
    disableParticulier,
    enableParticulier,
    disableEntreprise,
    enableEntreprise
}