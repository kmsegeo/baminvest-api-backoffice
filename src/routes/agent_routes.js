const express = require('express');
const router = express.Router();

const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const agentController = require('../controllers/agent_controller');
const sessionController = require('../controllers/session_controller');
const operationController = require('../controllers/operation_controller')

// ACTEUR AGENT 

router.post('/login', app_auth, sessionController.login);
router.get('/:id/sessions', app_auth, session_verify, sessionController.loadActiveSsessions);
router.delete('/:id/sessions/:ref', app_auth, session_verify, sessionController.destroySession);

// AGENT

router.get('/', app_auth, session_verify, agentController.getAllAgents);
router.post('/', app_auth, session_verify, agentController.createAgent);
router.get('/:id', app_auth, session_verify, agentController.getAgent);
router.put('/:id', app_auth, session_verify, agentController.updateAgent);
router.put('/:id/motdepasse', app_auth, session_verify, agentController.setpassword);

router.put('/:id/desactiver', app_auth, session_verify, agentController.disableAgent);
router.put('/:id/activer', app_auth, session_verify, agentController.enableAgent);

router.get('/:id/panier', app_auth, session_verify, agentController.getAllAgentAffectation);
router.put('/affectation/:id/valider', app_auth, session_verify, operationController.validOperation);
router.get('/validation/historique', app_auth, session_verify, operationController.validHistorique);

module.exports = router;