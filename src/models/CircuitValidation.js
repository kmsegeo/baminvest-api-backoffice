const db = require('../config/database');

const CircuitValidation = {

    tableName: `t_circuit_validation`,

    async findAll() {
        const queryString = `SELECT * FROM ${this.tableName}`;
        const res = db.query(queryString, []);
        return (await res).rows;
    },

    async checkExists(ref) {
        const res = db.query(`
            SELECT r_reference, r_intitule, r_statut
            FROM ${this.tableName} 
            WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

    async create(ref, e_type_operation, {r_intitule, r_description, r_scalable}) {
        const queryString = `
            INSERT INTO ${this.tableName} (
                r_reference, 
                r_intitule, 
                r_description, 
                r_scalable,
                r_date_creer, 
                r_date_modif, 
                r_statut,
                e_type_operation) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [ref, r_intitule, r_description, r_scalable, date, date, 1, e_type_operation]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT r_reference, 
                r_intitule, 
                r_description, 
                r_scalable, 
                r_statut,
                e_type_operation 
            FROM ${this.tableName} 
            WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByRef(ref) {
        const queryString = `
            SELECT * FROM ${this.tableName} 
            WHERE r_reference=$1`;
        const res = db.query(queryString, [ref]);
        return (await res).rows[0];
    },

    async findAllByTypeOperation(type_operation) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_type_operation=$1`;
        const res = db.query(queryString, [type_operation]);
        return (await res).rows;
    },

    async update(ref, e_type_operation, {r_intitule, r_description, r_scalable}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_intitule=$1, 
                r_description=$2, 
                r_scalable=$3, 
                e_type_operation=$4,
                r_date_modif=$5
            WHERE r_reference=$6
            RETURNING *`;
        const res = db.query(queryString, [r_intitule, r_description, r_scalable, e_type_operation, new Date(), ref]);
        return (await res).rows[0];
    }
}

module.exports = CircuitValidation;