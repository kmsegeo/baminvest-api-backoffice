const db = require('../config/database');

const Personne = {

    tableName: 't_personne_contacter',

    async findAllByParticulierId(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_particulier=$1`, [id]);
        return (await res).rows
    }
}

module.exports = Personne;