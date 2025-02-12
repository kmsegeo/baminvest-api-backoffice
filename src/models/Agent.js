const db = require('../config/database');

const Agent = {  

  tableName: 't_agent',

  async findAll() {
    const queryString = `SELECT * FROM ${this.tableName}`;
    const res = db.query(queryString);
    return (await res).rows;
  },

  async create({civilite, nom, prenom, profil}) {
    const queryString = `INSERT INTO ${this.tableName} (r_civilite, r_nom, r_prenom, e_profil)
      VALUES($1, $2, $3, (SELECT r_i FROM t_profil WHERE r_code=$4)) RETURNING *`;
    const res = db.query(queryString, [civilite, nom, prenom, profil]);
    return (await res).rows[0];
  },

  async findById(id) {
    const queryString = `SELECT * FROM ${this.tableName} WHERE r_i = $1`;
    const res = db.query(queryString, [id]);
    return (await res).rows[0];
  },
  
  async update(id, {civilite, nom, prenom}) {
    const queryString = `UPDATE ${this.tableName} SET r_civilite=$1, r_nom=$2, r_prenom=$3 WHERE r_i=$4 RETURNING *`;
    const res = db.query(queryString, [civilite, nom, prenom, id])
    return (await res).rows[0];
  }

}

module.exports = Agent;