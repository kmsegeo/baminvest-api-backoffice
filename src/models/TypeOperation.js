const db = require('../config/database');

const TypeOperation = {

    tableName: `t_type_operation`,
    code_colunm: `r_code`,
    code_prefix: `TYOP`,
    code_spliter: `-`,

    async findAll() {
        const queryString = `SELECT * FROM ${this.tableName}`;
        const res = db.query(queryString, []);
        return (await res).rows;
    },

    async checkExists(code) {
        const res = db.query(`
            SELECT  r_code, r_intitule, r_transaction, r_statut 
            FROM ${this.tableName} 
            WHERE r_code=$1`, [code]);
        return (await res).rows[0];
    },

    async create(code, {r_intitule, r_description, r_transaction}) {
        const queryString = `
            INSERT INTO ${this.tableName} (r_code, r_intitule, r_description, r_transaction, r_date_creer, r_date_modif, r_statut) 
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [code, r_intitule, r_description, r_transaction, date, date, 1]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByCode(code) {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE r_code=$1`;
        const res = db.query(queryString, [code]);
        return (await res).rows[0];
    },

    async update(code, {r_intitule, r_description, r_transaction}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_intitule=$1, r_description=$2,  r_transaction=$3, r_date_modif=$4
            WHERE r_code=$5
            RETURNING *`;
        const res = db.query(queryString, [r_intitule, r_description, r_transaction, new Date(), code]);
        return (await res).rows[0];
    },
    
    async findCodeByIntitule(intitule) {
        const queryStrind = `SELECT r_code FROM ${this.tableName} WHERE r_intitule=$1`;
        const result = await db.query(queryStrind, [intitule]);
        const row = result.rows[0];
        if (!row) return;
        return row['r_code'];
    }
}

module.exports = TypeOperation;