const db = require('../config/database');
const uuid = require('uuid');

const Document = {

    tableName: 't_document',

    async findAll() {
        const res = await db.query(`
            SELECT 
                td.r_i,
                tt.r_intitule,
                td.r_reference,
                td.r_nom_fichier,
                td.r_date_creer,
                td.r_date_modif
            FROM ${this.tableName} As td, t_type_document As tt  
            WHERE td.e_type_document=tt.r_i AND td.r_statut=$1`, [1]);
        return (await res).rows;
    },

    async create({acteur_id, type_document, nom_fichier, chemin_fichier}) {
        const date = new Date();
        const res = db.query(`
            INSERT INTO ${this.tableName} (
                r_reference,
                r_date_creer,
                r_date_modif,
                r_statut,
                e_type_document,
                e_acteur,
                r_nom_fichier,
                r_chemin_fichier) 
            VALUES($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING 
                r_reference,
                r_nom_fichier, 
                r_chemin_fichier,
                r_date_creer, 
                r_date_modif`, [uuid.v4(), date, date, 1, type_document, acteur_id, nom_fichier, chemin_fichier]);
        return (await res).rows[0];
    },

    async findAllByIntitule(intitule) {
        const res = db.query(`
            SELECT 
                td.r_i,
                tt.r_intitule,
                td.r_reference,
                td.r_nom_fichier,
                td.r_date_creer,
                td.r_date_modif
            FROM ${this.tableName} As td, t_type_document As tt  
            WHERE td.e_type_document=tt.r_i AND tt.r_intitule=$1 AND td.r_statut=$2`, [intitule, 1]);
            
        return (await res).rows;
    },

    async findAllByActeurId(id) {
        const res = db.query(`
            SELECT 
                td.r_i,
                tt.r_intitule,
                td.r_reference,
                td.r_nom_fichier,
                td.r_date_creer,
                td.r_date_modif
            FROM ${this.tableName} As td, t_type_document As tt  
            WHERE td.e_type_document=tt.r_i AND td.e_acteur=$1`, [id]);
        return (await res).rows;
    },

    async findById(id) {
        const res = await db.query(`
            SELECT 
                td.r_i,
                tt.r_intitule,
                td.r_reference,
                td.r_nom_fichier,
                td.r_date_creer,
                td.r_date_modif
            FROM ${this.tableName} As td, t_type_document As tt  
            WHERE td.e_type_document=tt.r_i AND td.r_i=$1 AND td.r_statut=$2`, [id, 1]);
        return res.rows[0];
    },

    async findByRef(ref) {
        const res = await db.query(`SELECT 
                td.r_i,
                tt.r_intitule,
                td.r_reference,
                td.r_nom_fichier,
                td.r_date_creer,
                td.r_date_modif
            FROM ${this.tableName} As td, t_type_document As tt  
            WHERE td.e_type_document=tt.r_i AND td.r_reference=$1 AND td.r_statut=$2`, [ref, 1]);
        return res.rows[0]
    },
}

module.exports = Document;