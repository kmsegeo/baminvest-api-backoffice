const db = require('../config/database');

const ValeurLiquidative = {

    tableName: 't_val_liquidative_fonds',

    async findAll() {
        const res = db.query(`SELECT * FROM ${this.tableName}`, []);
        return (await res).rows;
    },

    async findAllByFonds(fonds) {
        const res = db.query(`SELECT * FROM ${this.tableName} WHERE e_fonds=$1`, [fonds]);
        return (await res).rows;
    },

    async create(fonds, {date, date_precedente, description, valeur_actuelle, valeur_precedente, performance_hebdo, performance_jour, performance_mois}) {
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
                date,
                date_precedente,
                description,
                now,
                now,
                1,
                fonds,
                valeur_actuelle,
                valeur_precedente,
                performance_hebdo,
                performance_jour,
                performance_mois
            ]);
        return (await res).rows[0];
    },

    async findById(id) {
        const res = db.query(`SELECt * FROM ${this.tableName} WHERE r_i=$1`, [id]);
        return (await res).rows[0]
    },
    
    async update(id, fonds, {date, date_precedente, description, valeur_actuelle, valeur_precedente, performance_hebdo, performance_jour, performance_mois}) {
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
                date, 
                date_precedente, 
                description, 
                new Date(), 
                fonds, 
                valeur_actuelle, 
                valeur_precedente, 
                performance_hebdo, 
                performance_jour, 
                performance_mois, 
                id]);
        return (await res).rows[0];
    }
}

module.exports = ValeurLiquidative;