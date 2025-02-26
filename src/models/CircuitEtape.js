const db = require('../config/database');

const CircuitEtape = {

    tableName: 't_etape_validation',
    codePrefix: 'CETP',
    codeColumn: 'r_reference',
    codeSpliter: '-',

    async findAllByCircuitId(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_circuit_validation=$1`, [id]);
        return (await res).rows;
    },

    async create(e_circuit_validation, r_reference, e_profil, e_type_acteur, {
        r_intitule,
        r_ordre,
        r_description,
        r_type, 
        e_acteur}) {

        const date = new Date();

        const res = db.query(`
            INSERT INTO ${this.tableName}
                (r_reference,
                r_intitule,
                r_ordre,
                r_description,
                r_type,
                r_date_creer,
                r_date_modif,
                e_acteur,
                e_profil,
                e_circuit_validation,
                r_statut,
                e_type_acteur)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`, [
                r_reference,
                r_intitule,
                r_ordre,
                r_description,
                r_type,
                date,
                date,
                e_acteur,
                e_profil,
                e_circuit_validation,
                1,
                e_type_acteur]);
                
        return (await res).rows[0];
    },

    async findById(id) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

    async update(e_circuit_validation, r_reference, e_profil, e_type_acteur, {
        r_intitule,
        r_ordre,
        r_description,
        r_type, 
        e_acteur}) {

        const res = db.query(`
            UPDATE ${this.tableName}
            SET r_intitule=$1,
                r_ordre=$2,
                r_description=$3,
                r_type=$4,
                r_date_modif=$5,
                e_acteur=$6,
                e_profil=$7,
                e_circuit_validation=$8,
                e_type_acteur=$9
            WHERE r_reference=$10
            RETURNING *`, [
                r_intitule, 
                r_ordre, 
                r_description, 
                r_type, 
                new Date(), 
                e_acteur, 
                e_profil, 
                e_circuit_validation, 
                e_type_acteur,
                r_reference]);

        return (await res).rows[0];
    }
}

module.exports = CircuitEtape;