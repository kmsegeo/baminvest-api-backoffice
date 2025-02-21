const db = require('../config/database');

const MoyPaiementActeur = {

    tableName: `t_moyen_paiement_acteur`,

    async findAll() {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE r_statut=$1`;
        const res = db.query(queryString, [1]);
        return (await res).rows;
    },

    async findById(id) {
        const queryString = ` SELECT * FROM ${this.tableName} WHERE r_i=$1 AND r_statut=$2`;
        const res = db.query(queryString, [id, 1]);
        return (await res).rows[0];
    },

    async findByValeur(valeur) {
        const queryString = `
            SELECT r_i, r_valeur, r_intitule, e_acteur, e_type_moypaiement
            FROM ${this.tableName} 
            WHERE r_valeur=$1`;
        const res = db.query(queryString, [valeur]);
        return (await res).rows[0];
    },

    async findAllByActeur(id) {
        const queryString = `
            SELECT * FROM ${this.tableName} WHERE e_acteur=$1 AND r_statut=$2`;
        const res = db.query(queryString, [id, 1]);
        return (await res).rows;
    }
}

module.exports = MoyPaiementActeur;