const db = require('../config/database');

const ProfilRisquePartie = {

    tableName: `t_profil_risque_partie`,

    async findAll() {
        const queryString = `
            SELECT * FROM ${this.tableName}`;
        const res = db.query(queryString, []);
        return (await res).rows;
    },

    async checkExists(ref) {
        const res = db.query(`
            SELECT r_reference, r_ordre, r_intitule, r_statut 
            FROM ${this.tableName} 
            WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

    async create(ref, campagne, acteur, {ordre, intitule, description, points_totale}) {
        const queryString = `
            INSERT INTO ${this.tableName} (
                r_reference, 
                r_ordre, 
                r_intitule, 
                r_description, 
                r_points_totale, 
                r_date_creer, 
                r_date_modif, 
                r_statut,
                e_campagne, 
                e_acteur) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [ref, ordre, intitule, description, points_totale, date, date, 1, campagne, acteur]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT r_reference, r_ordre, r_intitule, r_description, r_points_totale, r_statut, e_campagne, e_acteur 
            FROM ${this.tableName} 
            WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByRef(ref) {
        const queryString = `
            SELECT *
            FROM ${this.tableName} 
            WHERE r_reference=$1`;
        const res = db.query(queryString, [ref]);
        return (await res).rows[0];
    },

    async findAllByCampgagne(campagne) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_campagne=$1`;
        const res = db.query(queryString, [campagne]);
        return (await res).rows;
    },

    async update(ref, campagne, {ordre, intitule, description, points_totale}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_ordre=$1, r_intitule=$2, r_description=$3, r_points_totale=$4, e_campagne=$5
            WHERE r_reference=$6
            RETURNING r_reference, r_ordre, r_intitule, r_description, r_points_totale, r_statut, e_campagne, e_acteur`;
        const res = db.query(queryString, [ordre, intitule, description, points_totale, campagne, ref]);
        return (await res).rows[0];
    }
}

module.exports = ProfilRisquePartie;