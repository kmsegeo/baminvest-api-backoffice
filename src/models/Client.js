const db = require('../config/database')

const acteur_table = 't_acteur';

// const Acteur = {

//     async findAllInactive() {
//         const queryString = `SELECT * FROM ${acteur_table} WHERE r_statut=$1`;
//         const res = db.query(queryString, [0]);
//         return (await res).rows;
//     }
// }

const Particulier = {

    tableName: 't_particulier',
    
    async findAll() {
        const queryString = `
            SELECT 
                tp.r_i,
                tp.r_civilite, 
                tp.r_nom,
                tp.r_nom_jeune_fille,
                tp.r_prenom,
                tp.r_date_naissance,
                tp.r_nationalite,
                tp.r_type_piece,
                tp.r_num_piece,
                tp.r_type_compte,
                tp.r_ncompte_titre,
                tp.r_ncompte_espece,
                tp.r_atsgo_id_client,
                ta.r_i as acteur_id,
                ta.r_email, 
                ta.r_telephone_prp, 
                ta.r_telephone_scd, 
                ta.r_adresse, 
                ta.r_statut,
                ta.profil_investisseur,
                ta.r_langue,
                ta.r_date_creer, 
                ta.r_date_modif, 
                ta.r_date_activation,
                ta.e_type_acteur,
                ta.e_signataire,
                ta.e_particulier,
                ta.e_entreprise,
                ta.e_represantant
            FROM ${this.tableName} As tp, ${acteur_table} As ta 
            WHERE ta.e_particulier=tp.r_i`;
        const res = db.query(queryString);
        return (await res).rows;
    }, 

    async findById(id) {
        const res = db.query(`
            SELECT 
                tp.r_i,
                tp.r_civilite, 
                tp.r_nom,
                tp.r_nom_jeune_fille,
                tp.r_prenom,
                tp.r_date_naissance,
                tp.r_nationalite,
                tp.r_type_piece,
                tp.r_num_piece,
                tp.r_type_compte,
                tp.r_ncompte_titre,
                tp.r_ncompte_espece,
                tp.r_atsgo_id_client,
                ta.r_i as acteur_id,
                ta.r_email, 
                ta.r_telephone_prp, 
                ta.r_telephone_scd, 
                ta.r_adresse, 
                ta.r_statut,
                ta.profil_investisseur,
                ta.r_langue,
                ta.r_date_creer, 
                ta.r_date_modif, 
                ta.r_date_activation,
                ta.e_type_acteur,
                ta.e_signataire,
                ta.e_particulier,
                ta.e_entreprise,
                ta.e_represantant
            FROM ${this.tableName} As tp, ${acteur_table} As ta 
            WHERE ta.e_particulier=tp.r_i AND tp.r_i=$1`, [id]);
        return (await res).rows[0];
    }
}

const Entrepise = {

    tableName: 't_entreprise',

    async findAll() {
        const queryString = `
            SELECT 
                te.r_i,
                te.r_raison_sociale,
                te.r_forme_juridique,
                te.r_capital_social,
                te.r_siege_social,
                te.r_compte_contribuable,
                te.r_registre_com,
                te.r_ncompte_titre,
                te.r_ncompte_espece,
                ta.r_i as acteur_id,
                ta.r_email, 
                ta.r_telephone_prp, 
                ta.r_telephone_scd, 
                ta.r_adresse, 
                ta.r_statut,
                ta.profil_investisseur,
                ta.r_langue,
                ta.r_date_creer, 
                ta.r_date_modif, 
                ta.r_date_activation,
                ta.e_type_acteur,
                ta.e_signataire,
                ta.e_particulier,
                ta.e_entreprise,
                ta.e_represantant
            FROM ${this.tableName} As te, ${acteur_table} As ta WHERE ta.e_entreprise=te.r_i`;
        const res = db.query(queryString)
        return (await res).rows;
    },

    async findById(id) {
        const res = db.query(`
            SELECT 
                te.r_i,
                te.r_raison_sociale,
                te.r_forme_juridique,
                te.r_capital_social,
                te.r_siege_social,
                te.r_compte_contribuable,
                te.r_registre_com,
                te.r_ncompte_titre,
                te.r_ncompte_espece,
                ta.r_i as acteur_id,
                ta.r_email, 
                ta.r_telephone_prp, 
                ta.r_telephone_scd, 
                ta.r_adresse, 
                ta.r_statut,
                ta.profil_investisseur,
                ta.r_langue,
                ta.r_date_creer, 
                ta.r_date_modif, 
                ta.r_date_activation,
                ta.e_type_acteur,
                ta.e_signataire,
                ta.e_particulier,
                ta.e_entreprise,
                ta.e_represantant
            FROM ${this.tableName} As te, ${acteur_table} As ta 
            WHERE ta.e_entreprise=te.r_i AND te.r_i=$1`, [id]);
        return (await res).rows[0];
    }
}

module.exports = {
    // Acteur,
    Particulier, 
    Entrepise
};