const db = require('../config/database');

const Particulier = {

    tableName: 't_kyc_particulier',

    async findByParticulierId(id) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_particulier=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }
}

const Entreprise = {

    tableName: 't_kyc_entreprise',

    async findByEntrepriseId(id) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_entreprise=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }
}

module.exports = {
    Particulier,
    Entreprise
}