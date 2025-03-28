const response = require('../middlewares/response');
const Acteur = require('../models/Acteur');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utils = require('../utils/utils.methods');
const Agent = require('../models/Agent');
const Profil = require('../models/Profil');

const login = async (req, res, next) => {

    /**
     * [x] Récupérer les données de l'acteur à partir de l'adresse e-mail
     * [x] Comparer le mot pas entré avec celui enregistré avec les données récupérées
     * [x] Si valid: créer une session avec les information entrée dans le header
     */

    console.log(`Connexion..`)
    const {email, mdp} = req.body;
    
    console.log(`Vérification des paramètres`)
    Utils.expectedParameters({email, mdp}).then(async () => {

        console.log(`Chargement de l'acteur`)
        await Acteur.findByEmail(req.body.email).then(async acteur => {
            if (!acteur) return response(res, 401, `Login ou mot de passe incorrect !`);
            if (acteur.e_agent==0) return response(res, 401, `Ce compte n'est pas enregistré en tant que agent`);
            console.log(`Vérification de mot de passe`)
            bcrypt.compare(req.body.mdp, acteur.r_mdp).then(async valid => {
                if(!valid) return response(res, 401, `Login ou mot de passe incorrect !`);
                console.log(`Ouverture de session`)
                await Session.create({
                    os: req.headers.os,
                    adresse_ip: req.headers.adresse_ip,
                    marque_device: req.headers.marque_device,
                    model_device: req.headers.model_device,
                    autres: "",
                    acteur: acteur.r_i
                }).then(async session => {
                    await Agent.findById(acteur.e_agent).then(async agent => {
                        await Profil.findById(agent.e_profil).then(async profil =>{
                            agent['profil'] = profil;
                            delete agent.e_profil;
                        }).catch(err => next(err));
                        return response(res, 200, 'Ouverture de session', {
                            auth_token: jwt.sign({session: session.r_reference}, process.env.SESSION_KEY, /*{ expiresIn: '24h' }*/ ),
                            session: session,
                            agent: agent
                        });
                    }).catch(err => next(err));
                }).catch(error => next(error));
            }).catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => response(res, 400, error));
}

const loadActiveSsessions = async (req, res, next) => {
    /**
     * [x] Charger les sessions actives de l'agent
     */
    await Acteur.findByAgentId(req.params.id).then(async acteur => {
        if (!acteur) return response(res, 404, `Cet agent n'existe pas !`);
        if (req.session.e_acteur!=acteur.r_i) return response(res, 401, `L'agent ne correspond pas à l'acteur connecté !`)
        const acteur_id = req.session.e_acteur;

        console.log(`Chargement des sessions de l'acteur`);
        await Session.findAllByActeur(acteur_id).then(sessions => {
            for (let index = 0; index < sessions.length; index++)
                delete sessions[index].r_statut;
            return response(res, 200, "Chargement terminé", sessions);
        }).catch(error => next(error));

    }).catch(error => next(error));


}

const destroySession = async (req, res, next) => {
    /**
     * [x] Vérifier que la session reférencée existe
     * [x] Destruuire la session active selectionnée de l'agent
     */
    await Acteur.findByAgentId(req.params.id).then(async acteur => {
        if (!acteur) return response(res, 404, `Cet agent n'existe pas !`);
        if (req.session.e_acteur!=acteur.r_i) return response(res, 401, `L'agent ne correspond pas à l'acteur connecté !`)
        const acteur_id = req.session.e_acteur;
        console.log(`Destruction de la session: ${req.params.ref}`);
        await Session.findByRef(req.params.ref).then(async session => {
            if (!session) return response(res, 404, "Session active non trouvée");
            await Session.destroy({
                acteur: acteur_id, 
                ref: req.params.ref
            }).then(() => response(res, 200, "Session détruite"))
            .catch(error => next(error));
        }).catch(error => next(error));
    }).catch(error => next(error));
}

module.exports = {
    login,
    loadActiveSsessions,
    destroySession
}