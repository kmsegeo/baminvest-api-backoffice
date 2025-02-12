const db = require('../config/database');

const TypeMoypaiement = {

    tableName: 't_moyen_paiement',

    async findAll() {
        const res = db.query(`SELECT * FROM ${this.tableName}`, []);
        return (await res).rows;
    },

    async create(code, {intitule, type}) {
        const date = new Date();
        const res = db.query(`
            INSERT INTO ${this.tableName} (
                r_code,
                r_intitule,
                r_type,
                r_date_creer,
                r_date_modif,
                r_statut)
            VALUES($1, $2, $3, $4, $5, $6) RETURNING *`, [
                code,
                intitule,
                type,
                date,
                date,
                1
            ]);

        return (await res).rows[0];
    },

    async findByCode(code) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_code=$1`, [code]);
        return (await res).rows;
    },

    async findById(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows;
    },

    async update(code, {intitule, type}) {
        const res = db.query(`UPDATE ${this.tableName} SET r_intitule=$1, r_type=$2, r_date_modif=$3 WHERE r_code=$4 RETURNING *`, [intitule, type, new Date(), code]);
        return (await res).rows[0];
    }
}

module.exports = TypeMoypaiement;