const db = require('../config/database');
const uuid = require('uuid');

const Validaton = {
    
    tableName: 't_validation',

    async findAll() {
        const res = db.query(`SELECT * FROM ${this.tableName}`, []);
        return (await res).rows
    },

    async create(e_acteur, e_affectation, {r_description, r_motif}) {
        const date = new Date();
        const res = db.query(`
            INSERT INTO ${this.tableName}
                (r_reference,
                r_description,
                r_motif,
                r_date_creer,
                r_date_modif,
                e_acteur,
                r_statut,
                e_affectation)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8) 
            RETURNING *`, [uuid.v4(), r_description, r_motif, date, date, e_acteur, 1, e_affectation]);
        return (await res).rows[0];
    },

    async findAllByActeur(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_acteur=$1`, [id]);
        return (await res).rows
    }
}

module.exports = Validaton;