const db = require('../config/database');

const Profil = {

  tableName: 't_profil',

  async findAll() {
    const queryString = `SELECT * FROM ${this.tableName}`;
    const res = db.query(queryString, []);
    return (await res).rows;
  },

  async create(code, {intitule, description, habilitation}) {
    const queryString = `
      INSERT INTO ${this.tableName}
        (r_code, r_intitule, r_date_creer, r_date_modif, r_description, r_statut, r_habilitation)
      VALUES($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`;
    const createDate = new Date();
    const res = db.query(queryString, [code, intitule, createDate, createDate, description, 1, habilitation]);
    return (await res).rows[0];
  },

  async findById(id) {
    const queryString = `SELECT 
        r_code, 
        r_intitule, 
        r_description, 
        r_statut, 
        r_habilitation 
      FROM ${this.tableName} 
      WHERE r_i=$1`;
    const res = db.query(queryString, [id]);
    return (await res).rows[0];
  },

  async findByCode(code) {
    const queryString = `SELECT * FROM ${this.tableName} WHERE r_code=$1`;
    const res = db.query(queryString, [code]);
    return (await res).rows[0];
  },
  
  async update(code, {intitule, description, habilitation}) {
    const queryString = `
      UPDATE ${this.tableName} 
      SET r_intitule=$1, r_description=$2, r_habilitation=$3 
      WHERE r_code=$4 
      RETURNING *`;
    const res = db.query(queryString, [intitule, description, habilitation, code])
    return (await res).rows[0];
  },

  async delete(code) {
    const queryString = `
      UPDATE ${this.tableName} 
      SET r_statut=$1 
      WHERE r_code=$2`;
    db.query(queryString, [2, code])
    return null;
  }

}

module.exports = Profil;