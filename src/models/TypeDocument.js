const db = require('../config/database');

const TypeDocument = {

    tableName: `t_type_document`,
    code_colunm: `r_code`,
    code_prefix: `TYDC`,
    code_spliter: `-`,

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

    async create(code, {intitule, description, format}) {
        const queryString = `
            INSERT INTO ${this.tableName} (r_code, r_intitule, r_description, r_date_creer, r_date_modif, r_statut, r_format) 
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [code, intitule, description, date, date, 1, format]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT r_code, r_intitule, r_description, r_format
            FROM ${this.tableName} 
            WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByCode(code) {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE r_code=$1`;
        const res = db.query(queryString, [code]);
        return (await res).rows[0];
    },

    async update(code, {intitule, description, format}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_intitule=$1, r_description=$2, r_format=$3 
            WHERE r_code=$4
            RETURNING *`;
        const res = db.query(queryString, [intitule, description, format, code]);
        return (await res).rows[0];
    }
}

module.exports = TypeDocument;