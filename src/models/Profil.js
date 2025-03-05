const db = require('../config/database');

const Profil = {

  tableName: 't_profil',
  codePrefix: 'PRFA',
  codeColumn: 'r_code',
  codeSpliter: '-',

  async findAll() {
    const queryString = `SELECT * FROM ${this.tableName}`;
    const res = db.query(queryString, []);
    return (await res).rows;
  },

  async create(code, {r_intitule, r_description, r_habilitation}) {
    const queryString = `
      INSERT INTO ${this.tableName}
        (r_code, r_intitule, r_date_creer, r_date_modif, r_description, r_statut, r_habilitation)
      VALUES($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`;
    const createDate = new Date();
    const res = db.query(queryString, [code, r_intitule, createDate, createDate, r_description, 1, r_habilitation]);
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
  
  async update(code, {r_intitule, r_description, r_habilitation}) {
    const queryString = `
      UPDATE ${this.tableName} 
      SET r_intitule=$1, r_description=$2, r_habilitation=$3, r_date_modif=$4  
      WHERE r_code=$5 
      RETURNING *`;
    const res = db.query(queryString, [r_intitule, r_description, r_habilitation, new Date(), code])
    return (await res).rows[0];
  },

  async updateStatus(id, status) {
    const res = db.query(`UPDATE ${this.tableName} SET r_statut=$1 WHERE r_i=$2 RETURNING *`, [status, id]);
    return (await res).rows[0];
  }

}

module.exports = Profil;