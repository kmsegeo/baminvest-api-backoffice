const db = require('../config/database');

const Campagne = {

    tableName: `t_campagne_demande`,

    async findAll() {
        const queryString = `
            SELECT * FROM ${this.tableName}`;
        const res = db.query(queryString, []);
        return (await res).rows;
    },

    async checkExists(code) {
        const res = db.query(`
            SELECT r_code, r_intitule, r_statut 
            FROM ${this.tableName} 
            WHERE r_code=$1`, [code]);
        return (await res).rows[0];
    },

    async create(code, acteur, {intitule, description, periodicite, date_debut, date_fin, cible}) {
        const queryString = `
            INSERT INTO ${this.tableName} (
                r_code, 
                r_intitule, 
                r_description, 
                r_periodicite, 
                r_date_debut, 
                r_date_fin, 
                r_cible, 
                r_date_creer, 
                r_date_modif, 
                r_statut, 
                e_acteur) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [code, intitule, description, periodicite, date_debut, date_fin, cible, date, date, 1, acteur]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByCode(code) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE r_code=$1`;
        const res = db.query(queryString, [code]);
        return (await res).rows[0];
    },

    async update(code, {intitule, description, periodicite, date_debut, date_fin, cible}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_intitule=$1, r_description=$2, r_periodicite=$3, r_date_debut=$4, r_date_fin=$5, r_cible=$6  
            WHERE r_code=$7
            RETURNING r_code, r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible, r_statut`;
        const res = db.query(queryString, [intitule, description, periodicite, date_debut, date_fin, cible, code]);
        return (await res).rows[0];
    }
}

module.exports = Campagne;