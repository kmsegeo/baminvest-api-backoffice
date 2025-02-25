const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const operationController = require('../controllers/operation_controller')

router.get('/:date_debut/:date_fin', app_auth, session_verify, operationController.loadAllOperationsAtDate);
router.get('/souscription/:date_debut/:date_fin', app_auth, session_verify, operationController.getOpSouscriptionAtDate);
router.get('/rachat/:date_debut/:date_fin', app_auth, session_verify, operationController.getOpRachatAtDate);
router.get('/transfert/:date_debut/:date_fin', app_auth, session_verify, operationController.getOpTransfertAtDate);
router.get('/:ref/details', app_auth, session_verify, operationController.loadOperation);

router.get('/:date_debut/:date_fin/commissions', app_auth, session_verify, operationController.getCommissionsAtDate);

module.exports = router;