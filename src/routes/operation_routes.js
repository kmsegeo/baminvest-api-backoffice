const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const operationController = require('../controllers/operation_controller');
const atsgo_auth = require('../middlewares/atsgo_auth');

router.get('/:date_debut/:date_fin', app_auth, session_verify, operationController.loadAllOperationsAtDate);
router.get('/souscription/:date_debut/:date_fin', app_auth, session_verify, operationController.getOpSouscriptionAtDate);
router.get('/rachat/:date_debut/:date_fin', app_auth, session_verify, operationController.getOpRachatAtDate);
router.get('/transfert/:date_debut/:date_fin', app_auth, session_verify, operationController.getOpTransfertAtDate);
router.get('/:ref', app_auth, session_verify, operationController.loadOperation);

router.get('/:date_debut/:date_fin/commissions', app_auth, session_verify, operationController.getCommissionsAtDate);

// ATSGO

router.post('/valider/mouvement', app_auth, session_verify, atsgo_auth, operationController.validateMouvment);
router.post('/valider/souscription', app_auth, session_verify, atsgo_auth, operationController.validateSouscription);
router.post('/valider/rachat', app_auth, session_verify, atsgo_auth, operationController.validateRachat);

module.exports = router;