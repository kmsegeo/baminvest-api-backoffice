const db = require('../config/database');

const ValeurLiquidative = {

    tableName: 't_val_liquidative_fonds',

    async findAllBetween2Date(from, to) {
        
        const start = from.toString() + ' 00:00';
        const end = to.toString() +' 23:59';

        const res = db.query(`SELECT * FROM ${this.tableName} WHERE r_date_creer BETWEEN $1 AND $2`, [start, end]);
        return (await res).rows;
    },

    async findAllByFondsBetween2Date(fonds, from, to) {

        const start = from.toString() + ' 00:00';
        const end = to.toString() +' 23:59';
        
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_fonds=$1 AND r_date_creer BETWEEN $2 AND $3`, [fonds, start, end]);
        return (await res).rows;
    },

    async create(e_fonds, {r_date, r_date_precedente, r_description, r_valeur_actuelle, r_valeur_precedente, r_performance_hebdo, r_performance_jour, r_performance_mois}) {
        const now = new Date();
        const res = db.query(`
            INSERT INTO ${this.tableName} (
                r_date,
                r_date_precedente,
                r_description,
                r_date_creer,
                r_date_modif,
                r_statut,
                e_fonds,
                r_valeur_actuelle,
                r_valeur_precedente,
                r_performance_hebdo,
                r_performance_jour,
                r_performance_mois
            ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, [
                r_date,
                r_date_precedente,
                r_description,
                now,
                now,
                1,
                e_fonds,
                r_valeur_actuelle,
                r_valeur_precedente,
                r_performance_hebdo,
                r_performance_jour,
                r_performance_mois
            ]);
        return (await res).rows[0];
    },

    async findById(id) {
        const res = db.query(`SELECt * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows[0]
    },
    
    async update(id, e_fonds, {r_date, r_date_precedente, r_description, r_valeur_actuelle, r_valeur_precedente, r_performance_hebdo, r_performance_jour, r_performance_mois}) {
        const res = db.query(`
            UPDATE ${this.tableName} 
            SET r_date=$1,
                r_date_precedente=$2,
                r_description=$3,
                r_date_modif=$4,
                e_fonds=$5,
                r_valeur_actuelle=$6,
                r_valeur_precedente=$7,
                r_performance_hebdo=$8,
                r_performance_jour=$9,
                r_performance_mois=$10
            WHERE r_i=$11 RETURNING *`, [
                r_date, 
                r_date_precedente, 
                r_description, 
                new Date(), 
                e_fonds, 
                r_valeur_actuelle, 
                r_valeur_precedente, 
                r_performance_hebdo, 
                r_performance_jour, 
                r_performance_mois, 
                id]);
        return (await res).rows[0];
    }
}

module.exports = ValeurLiquidative;