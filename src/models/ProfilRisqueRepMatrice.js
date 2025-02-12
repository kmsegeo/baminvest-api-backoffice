const db = require('../config/database');

const ProfilRisqueRepMatrice = {

    tableName: `t_reponse_matrice`,

    async findAll() {
        const queryString = `
            SELECT * ROM ${this.tableName}`;
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

    async create(ref, question, acteur, {ordre, intitule, details, type}) {
        const queryString = `
            INSERT INTO ${this.tableName} (
                r_reference, 
                r_ordre, 
                r_intitule, 
                r_details, 
                r_type, 
                r_date_creer, 
                r_date_modif, 
                r_statut,
                e_risques_questions, 
                e_acteur) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`;
        const date = new Date();
        const res = db.query(queryString, [ref, ordre, intitule, details, type, date, date, 1, question, acteur]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = `
            SELECT r_reference, 
                r_ordre, 
                r_intitule, 
                r_details, 
                r_type, 
                r_statut,
                e_risques_questions, 
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

    async findAllByQuestion(question) {
        const queryString = `SELECT * FROM ${this.tableName} WHERE e_risques_questions=$1`;
        const res = db.query(queryString, [question]);
        return (await res).rows;
    },

    async update(ref, question, {ordre, intitule, details, type}) {
        const queryString = `
            UPDATE ${this.tableName} 
            SET r_ordre=$1, 
                r_intitule=$2, 
                r_details=$3, 
                r_type=$4, 
                e_risques_questions=$5
            WHERE r_reference=$6
            RETURNING *`;
        const res = db.query(queryString, [ordre, intitule, details, type, question, ref]);
        return (await res).rows[0];
    }
}

module.exports = ProfilRisqueRepMatrice;