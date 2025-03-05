const db = require('../config/database');

const PersonnelEntreprise = {

    tableName: 't_personnel_entreprise',

    async findById(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows;
    }, 

    async findByEntrepriseId(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_entreprise=$1`, [id]);
        return (await res).rows;
    }
}

module.exports = PersonnelEntreprise;