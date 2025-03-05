const db = require('../config/database');

const TypeActeur = {

    tableName: `t_type_acteur`,
    codePrefix: 'TYAC',
    codeSpliter: '-',
    codeColumn: 'r_code',

    async findAll() {
        const queryString = `SELECT * FROM ${this.tableName}`;
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

    async create(code, {r_intitule, r_description}) {
        const queryString = `
            INSERT INTO ${this.tableName} (r_code, r_intitule, r_description, r_date_creer, r_date_modif, r_statut) 
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [code, r_intitule, r_description, date, date, 1]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT r_code, r_intitule, r_description 
            FROM ${this.tableName} 
            WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByCode(code) {
        const queryString = `
            SELECT * 
            FROM ${this.tableName} 
            WHERE r_code=$1`;
        const res = db.query(queryString, [code]);
        return (await res).rows[0];
    },

    async update(code, {r_intitule, r_description}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_intitule=$1, r_description=$2, r_date_modif=$3
            WHERE r_code=$4
            RETURNING *`;
        const res = db.query(queryString, [r_intitule, r_description, new Date(), code]);
        return (await res).rows[0];
    },

    async updateStatus(id, status) {
        const res = db.query(`UPDATE ${this.tableName} SET r_statut=$1 WHERE r_i=$2 RETURNING *`, [status, id]);
        return (await res).rows[0];
    }
    
}

module.exports = TypeActeur;