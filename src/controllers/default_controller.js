const default_canal = require('../config/default_canals');
const default_document_type = require('../config/default_document_type');
const default_operation_type = require('../config/default_operation_type');
const Acteur = require('../models/Acteur');
const Agent = require('../models/Agent');
const Canal = require('../models/Canal');
const Profil = require('../models/Profil');
const TypeDocument = require('../models/TypeDocument');
const TypeOperation = require('../models/TypeOperation');
const Utils = require('../utils/utils.methods');
const bcrypt = require('bcryptjs');
const Encryption = require('../utils/encryption.methods');

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
                await Utils.generateCanalCode(Canal.code_prefix, Canal.tableName, Canal.code_colunm).then(code => {
                    Canal.findByCode(code).then(async exists => {
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
            await Utils.generateCode("PRFA", Profil.tableName, 'r_code', '-').then(async code => {
                await Profil.create(code, {
                    intitule: `Admin`, 
                    description: `Administrateur principal`,
                    habilitation: ''
                }).then(async profil => {
                    console.log(profil);
                    console.log(`Création d'un agent par défaut: `);
                    await Agent.create({
                        civilite : 1, 
                        nom : `Médiasoft`, 
                        prenom : `Admin`, 
                        profil : profil.r_code
                    }).then(async admin => {
                        console.log(admin);
                        console.log("Cryptage du mot passe");
                        bcrypt.hash("admin", 10).then(async hash => {
                            console.log(hash);
                            console.log("Mise en place du compte acteur");
                            await Acteur.createAgent({
                                nom_complet: admin.r_nom + ' ' + admin.r_prenom,
                                email: `admin@mediasoftci.net`,
                                telephone: `+0000000000`,
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
        await Utils.sleep(1000);
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
        await Utils.sleep(1000);
        console.log(`Vérification des types document existants`);
        for (let typedoc of typeDocumentList) {
            let create = true;
            for (let td of typeDocuments) 
                if (td.r_intitule && typedoc.intitule.toLowerCase()==td.r_intitule.toLowerCase())
                    create = false;

            if (create) {
                console.log(`Creation du type document`, typedoc.intitule);
                await Utils.generateCanalCode(TypeDocument.code_prefix, TypeDocument.tableName, TypeDocument.code_colunm, TypeDocument.code_spliter).then(async code => {
                    await TypeDocument.create(code, {
                        intitule: typedoc.intitule, 
                        description: typedoc.description,
                        format: typedoc.format
                    }).then(async result => {
                        console.log(result);
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
                await Utils.sleep(1000);
            }
        }
        
    }).catch(err => console.log(err));
}

module.exports = {
    defaultCanals,
    defaultAdmin,
    defaultTypeDocument,
    defaultOperations,
}