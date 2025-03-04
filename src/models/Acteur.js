const db = require('../config/database');

const Acteur = {  

  tableName: 't_acteur',

  async createAgent({r_nom_complet, r_email, r_telephone, r_adresse, e_agent, r_mdp }) {
    
    const createDate = new Date();
    const queryString = `
      INSERT INTO ${this.tableName} (\
        r_nom_complet,
        r_email,
        r_telephone_prp,
        r_telephone_scd,
        r_adresse,
        r_statut,
        r_date_creer,
        r_date_modif,
        r_date_activation,
        e_agent,
        r_mdp) 
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING 
        r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut, 
        r_date_creer, 
        r_date_modif, 
        r_date_activation, 
        e_agent`;
      const res = db.query(queryString, [r_nom_complet, r_email, r_telephone, r_telephone, r_adresse, 1, createDate, createDate, createDate, e_agent, r_mdp]);
      return (await res).rows[0];
  },

  async findById(id) {
      const queryString = `SELECT 
        r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut,
        r_rib, 
        profil_investisseur,
        r_langue,
        r_date_creer, 
        r_date_modif, 
        r_date_activation,
        e_type_acteur,
        e_signataire,
        e_particulier,
        e_entreprise,
        e_represantant
      FROM ${this.tableName} WHERE r_i = $1`;
      const res = db.query(queryString, [id]);
      return (await res).rows[0];
  },

  async findByEmail(email) {
    const queryString = `SELECT 
        r_i,
        r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut,
        r_rib, 
        profil_investisseur,
        r_langue,
        r_date_creer, 
        r_date_modif, 
        r_date_activation,
        e_agent,
        r_mdp 
      FROM ${this.tableName} WHERE r_email = $1`;
    const res = db.query(queryString, [email]);
    return (await res).rows[0];
  },

  async findByIndividualId(clientId) {
    const queryString = `SELECT 
        r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut,
        r_rib, 
        profil_investisseur,
        r_langue,
        r_date_creer, 
        r_date_modif, 
        r_date_activation,
        e_type_acteur,
        e_signataire,
        e_particulier,
        e_entreprise,
        e_represantant
      FROM ${this.tableName} WHERE e_particulier=$1`;
    const res = db.query(queryString, [clientId]);
    return (await res).rows[0];
  },
  
  async findByCorporateId(clientId) {
    const queryString = `SELECT 
        r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut,
        r_rib, 
        profil_investisseur,
        r_langue,
        r_date_creer, 
        r_date_modif, 
        r_date_activation,
        e_type_acteur,
        e_signataire,
        e_particulier,
        e_entreprise,
        e_represantant
      FROM ${this.tableName} WHERE e_entreprise=$1`;
    const res = db.query(queryString, [clientId]);
    return (await res).rows[0];
  },
  
  async update(id, {civilite, nom, prenom}) {
    const queryString = `UPDATE ${this.tableName} SET ... WHERE r_i=$4 RETURNING r_civilite, r_nom, r_prenom, e_profil`;
    const res = db.query(queryString, [civilite, nom, prenom, id])
    return (await res).rows[0];
  },

  async findByAgentId(id) {
    const queryString = `SELECT * FROM ${this.tableName} WHERE e_agent=$1`;
    const res = db.query(queryString, [id]);
    return (await res).rows[0];
  },

  // async findMdpById(id) {
  //   const queryString = `SELECT r_email, r_mdp FROM ${this.tableName} WHERE r_i=$1`;
  //   const res = db.query(queryString, [id]);
  //   return (await res).rows[0];
  // },

  async updateMdp(acteur_id, mdp) {
    const queryString = `UPDATE ${this.tableName} SET r_mdp=$1 WHERE r_i=$2 
    RETURNING  r_nom_complet, 
        r_email, 
        r_telephone_prp, 
        r_telephone_scd, 
        r_adresse, 
        r_statut,
        r_rib, 
        profil_investisseur,
        r_langue,
        r_date_creer, 
        r_date_modif, 
        r_date_activation,
        e_type_acteur,
        e_signataire,
        e_particulier,
        e_entreprise,
        e_represantant`;
    const res = db.query(queryString, [mdp, acteur_id]);
    return (await res).rows[0];
  }
}

module.exports = Acteur;