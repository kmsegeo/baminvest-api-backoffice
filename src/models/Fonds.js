const db = require('../config/database');

const Fonds = {

    tableName: 't_fonds',

    async findAll() {
        const res = db.query(`SELECT * FROM ${this.tableName}`, []);
        return (await res).rows;
    },

    async create(ref, {intitule, description, commission_souscription, commission_sortie}) {
        const create_date = new Date();
        const res = db.query(`INSERT INTO ${this.tableName}
            (r_reference,
            r_intitule,
            r_description,
            r_date_creer,
            r_date_modif,
            r_statut,
            commission_souscription,
            commission_sortie)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [ref, intitule, description, create_date, create_date, 1, commission_souscription, commission_sortie]);

        return (await res).rows[0];
    },

    async findById(id) {
        const res = db.query(`
            SELECT 
                r_reference, 
                r_intitule, 
                r_description, 
                r_statut, 
                commission_souscription, 
                commission_sortie
            FROM ${this.tableName}
            WHERE r_i=$1`, [id]);
        return (await res).rows[0];
    },

    async findByRef(ref) {
        const res = db.query(`
            SELECT r_i,
                r_reference, 
                r_intitule, 
                r_description, 
                r_statut, 
                commission_souscription, 
                commission_sortie
            FROM ${this.tableName}
            WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

    async update(ref, {intitule, description, commission_souscription, commission_sortie}) {

        const res = db.query(`UPDATE ${this.tableName} 
            SET r_intitule = $1,
                r_description = $2,
                r_date_modif = $4,
                commission_souscription = $5,
                commission_sortie = $6
            WHERE r_reference=$7 
            RETURNING *`, [intitule, description, new Date(), commission_souscription, commission_sortie, ref]);
    },
    
    async delete(ref) {
        const res = db.query(`UPDATE ${this.tableName} 
            SET r_statut = $1
            WHERE r_reference=$1
            RETURNING *`, [-1, ref]);
        return (await res).rows[0];
    }
}

module.exports = Fonds;