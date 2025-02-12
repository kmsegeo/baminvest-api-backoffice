const db = require('../config/database');

const TypeActeur = {

    tableName: `t_type_acteur`,

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

    async create(code, {intitule, description}) {
        const queryString = `
            INSERT INTO ${this.tableName} (r_code, r_intitule, r_description, r_date_creer, r_date_modif, r_statut) 
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [code, intitule, description, date, date, 1]);
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

    async update(code, {intitule, description}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_intitule=$1, r_description=$2 
            WHERE r_code=$3
            RETURNING *`;
        const res = db.query(queryString, [intitule, description, code]);
        return (await res).rows[0];
    }
}

module.exports = TypeActeur;