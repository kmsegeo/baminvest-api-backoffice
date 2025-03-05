const db = require('../config/database');

const Document = {

    tableName: 't_document',

    async findAllByActeurId(id) {
        const res = db.query(`
            SELECT 
                td.r_i,
                tt.r_intitule,
                td.r_reference,
                td.r_nom_fichier,
                td.r_date_creer,
                td.r_date_modif
            FROM ${this.tableName} As td, t_type_document As tt  
            WHERE td.e_type_document=tt.r_i AND td.e_acteur=$1`, [id]);
        return (await res).rows;
    }
}

module.exports = Document;