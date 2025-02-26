const db = require('../config/database');

const Campagne = {

    tableName: `t_campagne_demande`,
    codePrefix: 'CAMP',
    codeColumn: 'r_code',
    codeSpliter: '-',

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

    async create(code, e_acteur, {r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible}) {
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
        const res = db.query(queryString, [code, r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible, date, date, 1, e_acteur]);
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

    async update(code, {r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_intitule=$1, r_description=$2, r_periodicite=$3, r_date_debut=$4, r_date_fin=$5, r_cible=$6, r_date_modif=$7  
            WHERE r_code=$8
            RETURNING r_code, r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible, r_statut`;
        const res = db.query(queryString, [r_intitule, r_description, r_periodicite, r_date_debut, r_date_fin, r_cible, new Date(), code]);
        return (await res).rows[0];
    }
}

module.exports = Campagne;