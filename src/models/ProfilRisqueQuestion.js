const db = require('../config/database');

const ProfilRisqueQuestion = {

    tableName: `t_risque_questions`,

    async findAll() {
        const queryString = `
            SELECT * FROM ${this.tableName}`;
        const res = db.query(queryString, []);
        return (await res).rows;
    },

    async checkExists(ref) {
        const res = db.query(`
            SELECT r_reference, r_ordre, r_intitule, r_statut 
            FROM ${this.tableName} 
            WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

    async create(ref, partie, acteur, {ordre, intitule, description, avec_colonne, points_totale}) {
        const queryString = `
            INSERT INTO ${this.tableName} (
                r_reference, 
                r_ordre, 
                r_intitule, 
                r_description, 
                r_avec_colonne,
                r_points_totale, 
                r_date_creer, 
                r_date_modif, 
                r_statut,
                e_profil_partie, 
                e_acteur) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [
            ref, ordre, intitule, description, avec_colonne, points_totale, date, date, 1, partie, acteur]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT r_reference, 
                r_ordre, 
                r_intitule, 
                r_description, 
                r_avec_colonne, 
                r_points_totale, 
                r_statut,
                e_profil_partie, 
                e_acteur 
            FROM ${this.tableName} 
            WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByRef(ref) {
        const queryString = `SELECT * ROM ${this.tableName} WHERE r_reference=$1`;
        const res = db.query(queryString, [ref]);
        return (await res).rows[0];
    },

    async findAllByPartie(partie) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_profil_partie=$1`;
        const res = db.query(queryString, [partie]);
        return (await res).rows;
    },

    async update(ref, partie, {ordre, intitule, description, avec_colonne, points_totale}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_ordre=$1, 
                r_intitule=$2, 
                r_description=$3, 
                r_avec_colonne=$4, 
                r_points_totale=$5, 
                e_profil_partie=$6
            WHERE r_reference=$7
            RETURNING *`;
        const res = db.query(queryString, [ordre, intitule, description, avec_colonne, points_totale, partie, ref]);
        return (await res).rows[0];
    }
}

module.exports = ProfilRisqueQuestion;