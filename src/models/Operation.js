const db = require('../config/database');
const { findAll } = require('./TypeActeur');

const Operation = {

    tableName: 't_operation',

    async findAll() {
        const res = db.query(`SELECT * FROM ${this.tableName}`);
        return (await res).rows;
    },

    async findAllByActeur(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_acteur=$1`, [id]);
        return (await res).rows;
    },

    async findAllByTypeOperateur(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_type_operation=$1`, [id]);
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

    async valid(id) {
        const res = db.query(`UPDATE ${this.tableName} SET r_statut=$1 WHERE r_i=$2 RETURNING *`, [1, id]);
        return (await res).rows[0];
    }
}

module.exports = Operation;