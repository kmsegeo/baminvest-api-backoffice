const db = require('../config/database');

const Document = {

    tableName: 't_document',

    async findAllByActeurId(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_acteur=$1`, [id]);
        return (await res).rows;
    }
}

module.exports = Document;