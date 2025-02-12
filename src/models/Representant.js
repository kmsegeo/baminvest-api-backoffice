const db = require('../config/database');

const Representant = {

    tableName: 't_representant',

    async findById(id) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }
}

module.exports = Representant;