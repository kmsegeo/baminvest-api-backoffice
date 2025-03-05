const db = require('../config/database');
const { findAll } = require('./TypeActeur');

const Operation = {

    tableName: 't_operation',

    async findAll() {
        const res = db.query(`SELECT * FROM ${this.tableName}`);
        return (await res).rows;
    },

    async findAllBetween2Date(from, to) {
        const start = from.toString() + ' 00:00';
        const end = to.toString() +' 23:59';
        const res = db.query(`SELECT * FROM ${this.tableName}  WHERE r_date_creer BETWEEN $1 AND $2`, [start, end]);
        return (await res).rows;
    },

    async findAllByActeur(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_acteur=$1`, [id]);
        return (await res).rows;
    },

    async findAllByTypeOperateurBetween2Date(id, from, to) {
        const start = from.toString() + ' 00:00';
        const end = to.toString() +' 23:59';
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_type_operation=$1 AND r_date_creer BETWEEN $2 AND $3`, [id, start, end]);
        return (await res).rows;
    },

    async findById(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

    // async valid(id) {
    //     const res = db.query(`UPDATE ${this.tableName} SET r_statut=$1 WHERE r_i=$2 RETURNING *`, [1, id]);
    //     return (await res).rows[0];
    // },

    async updateStatus(id, status) {
        const res = db.query(`UPDATE ${this.tableName} SET r_statut=$1 WHERE r_i=$2 RETURNING *`, [status, id]);
        return (await res).rows[0];
    }
}

module.exports = Operation;