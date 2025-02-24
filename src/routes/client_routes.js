const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const clientController = require('../controllers/client_controller');
const portefeuilleController = require('../controllers/portefeuille_controller');
const operationController = require('../controllers/operation_controller');

// router.get('/clients', app_auth, session_verify, clientController.loadAllClients);

router.get('/particuliers', app_auth, session_verify, clientController.loadIndividualClients);
router.get('/particuliers/:id', app_auth, session_verify, clientController.getIndividualClientData);

router.get('/entreprises', app_auth, session_verify, clientController.loadCorporateClients);
router.get('/entreprises/:id', app_auth, session_verify, clientController.getCorporateClientData);

router.get('/portefeuilles', app_auth, session_verify, portefeuilleController.loadAllPortefeuilles);
router.get('/:id/portefeuilles', app_auth, session_verify, portefeuilleController.loadActeurPortefeuilles);

router.get('/operations', app_auth, session_verify, operationController.loadAllOperations)
router.get('/:id/operations', app_auth, session_verify, operationController.loadAllByActeur);
router.get('/operations/souscription', app_auth, session_verify, operationController.getOpSouscription);
router.get('/operations/rachat', app_auth, session_verify, operationController.getOpRachat);
router.get('/operations/transfert', app_auth, session_verify, operationController.getOpTransfert);
router.get('/operations/:ref/details', app_auth, session_verify, operationController.loadOperation);

module.exports = router;