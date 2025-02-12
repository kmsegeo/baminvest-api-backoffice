const db = require('../config/database');

const Portefeuille = {

    tableName: 't_portefeuille_acteur',

    async findAll() {
        const res = db.query(`SELECT * FROM ${this.tableName}`, []);
        return (await res).rows;
    },

    async findAllByActeur(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_acteur=$1`, [id]);
        return (await res).rows;
    }
}

module.exports = Portefeuille;