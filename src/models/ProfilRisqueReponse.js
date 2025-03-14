const db = require('../config/database');

const ProfilRisqueReponse = {

    tableName: `t_risque_reponses`,
    codePrefix: 'QREP',
    codeColumn: 'r_reference',
    codeSpliter: '-',

    async checkExists(ref) {
        const res = db.query(`
            SELECT * FROM ${this.tableName} WHERE r_reference=$1`, [ref]);
        return (await res).rows[0];
    },

    async create(ref, e_ligne_colonne, e_acteur, {r_ordre, r_intitule, r_details, r_points}) {
        const queryString = `
            INSERT INTO ${this.tableName} (
                r_reference, 
                r_ordre, 
                r_intitule, 
                r_details, 
                r_points, 
                r_date_creer, 
                r_date_modif, 
                r_statut,
                e_ligne_colonne, 
                e_acteur) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [ref, r_ordre, r_intitule, r_details, r_points, date, date, 1, e_ligne_colonne, e_acteur]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT r_reference, 
                r_ordre, 
                r_intitule, 
                r_details, 
                r_points, 
                r_statut,
                e_ligne_colonne, 
                e_acteur 
            FROM ${this.tableName} 
            WHERE r_i=$1`;
        const res = db.query(queryString, [id]);
        return (await res).rows[0];
    }, 

    async findByRef(ref) {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE r_reference=$1`;
        const res = db.query(queryString, [ref]);
        return (await res).rows[0];
    },

    async findAllByMatrice(matrice) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_ligne_colonne=$1`;
        const res = db.query(queryString, [matrice]);
        return (await res).rows;
    },

    async findAllByLineColumn(q) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_ligne_colonne=$1 ORDER BY r_i ASC`;
        const res = db.query(queryString, [q]);
        return (await res).rows;
    },

    async update(ref, e_ligne_colonne, {r_ordre, r_intitule, r_details, r_points}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_ordre=$1, 
                r_intitule=$2, 
                r_details=$3, 
                r_points=$4, 
                e_ligne_colonne=$5,
                r_date_modif=$6
            WHERE r_reference=$7
            RETURNING *`;
        const res = db.query(queryString, [r_ordre, r_intitule, r_details, r_points, e_ligne_colonne, new Date(), ref]);
        return (await res).rows[0];
    }
}

module.exports = ProfilRisqueReponse;