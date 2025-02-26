const db = require('../config/database');

const Systeme = {

    tableName: `t_sys`,

    async findAll() {
        const queryString = `
            SELECT * FROM ${this.tableName}`;
        const res = db.query(queryString, []);
        return (await res).rows;
    },

    async checkExists(tag) {
        const res = db.query(`
            SELECT 
                r_tag, 
                r_valeur, 
                r_statut 
            FROM ${this.tableName} 
            WHERE r_tag=$1`, [tag]);
        return (await res).rows[0];
    },

    async create( {r_tag, r_valeur, r_description}) {
        const queryString = `
            INSERT INTO ${this.tableName} (r_tag, r_valeur, r_description, r_date_creer, r_date_modif, r_statut) 
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [r_tag, r_valeur, r_description, date, date, 1]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT 
                r_tag, 
                r_valeur, 
                r_description 
            FROM ${this.tableName} 
            WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByTag(tag) {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE r_tag=$1`;
        const res = db.query(queryString, [tag]);
        return (await res).rows[0];
    },

    async update(r_tag, {r_valeur, r_description}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_valeur=$1, r_description=$2, r_date_modif=$3 
            WHERE r_tag=$4
            RETURNING *`;
        const res = db.query(queryString, [r_valeur, r_description, new Date(), r_tag]);
        return (await res).rows[0];
    }
}

module.exports = Systeme;