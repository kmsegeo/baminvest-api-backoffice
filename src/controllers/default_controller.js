const default_canal = require('../config/default_canals');
const default_document_type = require('../config/default_document_type');
const default_operation_type = require('../config/default_operation_type');
const default_acteur_type = require('../config/default_acteur_type');
const Acteur = require('../models/Acteur');
const Agent = require('../models/Agent');
const Canal = require('../models/Canal');
const Profil = require('../models/Profil');
const TypeDocument = require('../models/TypeDocument');
const TypeOperation = require('../models/TypeOperation');
const Utils = require('../utils/utils.methods');
const bcrypt = require('bcryptjs');
const Encryption = require('../utils/encryption.methods');
const TypeActeur = require('../models/TypeActeur');
const Campagne = require('../models/Campagne');

const defaultCanals = async () => {
    /**
     * [x] Vérifier un par un que les canaux (applications satélites) par défauts listés existent dans la base de données
     * [x] Si oui: ne rien faire ; Sinon: Créer le canal par défaut inexistant
     */

    console.log(`Vérification des canaux par défaut..`);
    const canauxList = default_canal.defaultList;
    
    await Canal.findAll().then(async canaux => {
        await Utils.sleep(1000);
        console.log(`Vérification des canaux inexistants`)
        for(let new_canal of canauxList) {
            let create = true;
            for(let cur_canal of canaux) {
                if (cur_canal.r_intitule && new_canal.intitule.toLowerCase()==cur_canal.r_intitule.toLowerCase())
                    create = false;
            }
            if (create) {
                console.log(`Creation du canal`, new_canal.intitule);
                await Utils.generateCanalCode(Canal.code_prefix, Canal.tableName, Canal.code_colunm).then(async code => {
                    await Canal.findByCode(code).then(async exists => {
                        if(exists) return;
                        let intitule = new_canal.intitule; 
                        let description = new_canal.description; 
                        console.log("Cryptage du mot passe");
                        let pass = Encryption.encrypt(new_canal.pass);
                        console.log(pass);
                        await Canal.create(code, {intitule, description, pass}).then(async canal => {
                            console.log(canal);
                        }).catch(err => console.log(err));
                    }).catch(err=>console.log(err));
                }).catch(err => console.log(err));
                await Utils.sleep(1000);
            }
        }
    }).catch(err => console.log(err));
}

const defaultTypeActeur = async () => {
    /**
     * [x] Vérifier un par un que les type acteur par défauts listés existent dans la base de données
     * [x] Si oui: ne rien faire ; Sinon: Créer les type acteur par défaut inexistant
     */

    console.log(`Vérification des type-opérations par défaut..`)

    const typeActeursList = default_acteur_type.defaultList;

    await TypeActeur.findAll().then(async type_acteurs => {
        console.log(`Vérification des type-acteurs inexistants`);
        for(let new_type_acteur of typeActeursList) {
            let create = true;
            for(let cur_type_acteur of type_acteurs) {
                if (cur_type_acteur.r_intitule && new_type_acteur.intitule.toLowerCase()==cur_type_acteur.r_intitule.toLowerCase())
                    create = false;
            }
            if (create) {
                console.log(`Creation du type-opération`, new_type_acteur.intitule);
                await Utils.generateCode(TypeActeur.codePrefix, TypeActeur.tableName, TypeActeur.codeColumn, TypeActeur.codeSpliter).then(async code => {
                    let intitule = new_type_acteur.intitule; 
                    let description = new_type_acteur.description;
                    await TypeActeur.create(code, {intitule, description}).catch(err => console.log(err));
                }).catch(err => console.log(err));
                await Utils.sleep(1000);
            }
        }
    }).catch(err => console.log(err));
}

const defaultAdmin = async () => {

    /**
     * [x] Vérifier qu'un agent/administrateur existe dans la base de données
     * [x] Si oui: ne rien faire ; Sinon: Créer un agent/administrateur par défaut
     *  __ login: admin@mediasoftci.net
     *  __ mdp: admin
     * [x] En passant, créer un profil Administrateur
     */
    console.log(`Vérification du compte admin par défaut..`)

    await Agent.findAll().then(async results => {
        await Utils.sleep(1000);
        if (results.length==0) {
            console.log("Création d'un profil par défaut: ");
            await Utils.generateCode(Profil.codePrefix, Profil.tableName, Profil.codeColumn, Profil.codeSpliter).then(async code => {
                await Profil.create(code, {
                    r_intitule: `Admin`, 
                    r_description: `Administrateur principal`,
                    r_habilitation: ''
                }).then(async profil => {
                    console.log(profil);
                    console.log(`Création d'un agent par défaut: `);
                    await Agent.create({
                        r_civilite : 1, 
                        r_nom : `Médiasoft`, 
                        r_prenom : `Admin`, 
                        profil_code : profil.r_code
                    }).then(async admin => {
                        console.log(admin);
                        console.log("Cryptage du mot passe");
                        bcrypt.hash("admin", 10).then(async hash => {
                            console.log(hash);
                            console.log("Mise en place du compte acteur");
                            await Acteur.createAgent({
                                nom_complet: admin.r_nom + ' ' + admin.r_prenom,
                                email: `admin@mediasoftci.net`,
                                telephone: `2250000000000`,
                                adresse: "Abidjan - Deux plateaux les vallons",
                                agent: admin.r_i,
                                mdp : hash
                            }).then(async acteur => {
                                console.log(acteur)
                                console.log("Création de l'agent/administrateur par défaut terminé.")
                            }).catch(error => console.log(error.stack))
                        }).catch(error => console.log(error.stack))
                    }).catch(error => console.log(error.stack))
                }).catch(error => console.log(error.stack))
            }).catch(error => console.log(error.stack))
        }
    }).catch(error => console.log(error.stack));
}

const defaultOperations = async () => {
    /**
     * [x] Vérifier un par un que les opérations par défauts listés existent dans la base de données
     * [x] Si oui: ne rien faire ; Sinon: Créer l'opération par défaut inexistant
     */

    console.log(`Vérification des type-opérations par défaut..`)

    const typeOperationsList = default_operation_type.defaultList;

    await TypeOperation.findAll().then(async type_operations => {
        console.log(`Vérification des type-opérations inexistants`)
        for(let new_type_op of typeOperationsList) {
            let create = true;
            for(let cur_type_op of type_operations) {
                if (cur_type_op.r_intitule && new_type_op.intitule.toLowerCase()==cur_type_op.r_intitule.toLowerCase())
                    create = false;
            }
            if (create) {
                console.log(`Creation du type-opération`, new_type_op.intitule);
                await Utils.generateCode(TypeOperation.code_prefix, TypeOperation.tableName, TypeOperation.code_colunm, TypeOperation.code_spliter).then(async code => {
                    let intitule = new_type_op.intitule; let description = new_type_op.description; let transaction = new_type_op.transaction ? 1 : 0;
                    await TypeOperation.create(code, {intitule, description, transaction}).then(async tyop => {
                        console.log(tyop)
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
                await Utils.sleep(1000);
            }
        }
    }).catch(err => console.log(err.stack));
}

const defaultTypeDocument = async () => {
    /**
     * [x] Vérifier un par un que les types document par défauts listés existent dans la base de données
     * [x] Si oui: ne rien faire ; Sinon: Créer le type document par défaut inexistant
     */

    console.log(`Vérification des types document par défaut..`);

    const typeDocumentList = default_document_type.defaultList

    await TypeDocument.findAll().then(async typeDocuments => {
        console.log(`Vérification des types document existants`);
        for (let typedoc of typeDocumentList) {
            let create = true;
            for (let td of typeDocuments) 
                if (td.r_intitule && typedoc.intitule.toLowerCase()==td.r_intitule.toLowerCase())
                    create = false;

            if (create) {
                console.log(`Creation du type document`, typedoc.intitule);
                await Utils.generateCode(TypeDocument.code_prefix, TypeDocument.tableName, TypeDocument.code_colunm, TypeDocument.code_spliter).then(async code => {
                    await TypeDocument.create(code, {
                        r_intitule: typedoc.intitule, 
                        r_description: typedoc.description,
                        r_format: typedoc.format
                    }).then(async result => {
                        console.log(result);
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
                await Utils.sleep(1000);
            }
        }
        // await Utils.sleep(1000);
    }).catch(err => console.log(err));
}

const defaultCampagneRisque = async () => {
    /**
     * [x] Vérifier un par un que les campagnes par défauts listés existent dans la base de données
     * [x] Si oui: ne rien faire ; Sinon: Créer les campagnes par défaut inexistant
     */

    console.log(`Vérification des campagnes par défaut..`)

    const new_intitule = 'agent';
    const new_description = 'Description du type agent';

    await Campagne.findAll().then(async campagnes => {
        console.log(`Vérification des campagnes inexistants`);
        for(let cur_campagne of campagnes) {
            if (cur_campagne.r_intitule && new_intitule.toLowerCase()==cur_campagne.r_intitule.toLowerCase())
                create = false;
        }
        if (create) {
            console.log(`Creation du type-opération`, new_intitule);
            await Utils.generateCode(Campagne.codePrefix, Campagne.tableName, Campagne.codeColumn, Campagne.codeSpliter).then(async code => {
                let intitule = new_intitule; 
                let description = new_description;
                await Campagne.create(code, {intitule, description}).catch(err => console.log(err));
            }).catch(err => console.log(err));
            await Utils.sleep(1000);
        }
    }).catch(err => console.log(err));
}

module.exports = {
    defaultCanals,
    defaultTypeActeur,
    defaultAdmin,
    defaultTypeDocument,
    defaultOperations,
    defaultCampagneRisque,
}