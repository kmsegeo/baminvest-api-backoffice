const db = require('../config/database');

const ProfilRisquePartie = {

    tableName: `t_profil_risque_partie`,
    codePrefix: 'PRPT',
    codeColumn: 'r_reference',
    codeSpliter: '-',

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

    async create(ref, e_campagne, e_acteur, {r_ordre, r_intitule, r_description, r_points_totale}) {
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
        const res = db.query(queryString, [ref, r_ordre, r_intitule, r_description, r_points_totale, date, date, 1, e_campagne, e_acteur]);
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
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_campagne=$1 ORDER BY r_i ASC`;
        const res = db.query(queryString, [campagne]);
        return (await res).rows;
    },

    async update(ref, e_campagne, {r_ordre, r_intitule, r_description, r_points_totale}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_ordre=$1, r_intitule=$2, r_description=$3, r_points_totale=$4, e_campagne=$5, r_date_modif=$6
            WHERE r_reference=$7
            RETURNING r_reference, r_ordre, r_intitule, r_description, r_points_totale, r_statut, e_campagne, e_acteur`;
        const res = db.query(queryString, [r_ordre, r_intitule, r_description, r_points_totale, e_campagne, new Date(), ref]);
        return (await res).rows[0];
    }
}

module.exports = ProfilRisquePartie;