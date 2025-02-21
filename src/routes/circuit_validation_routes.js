const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const validationController = require('../controllers/circuit_validation_controller');

router.get('/circuits', app_auth, session_verify, validationController.getAllCircuit);
router.post('/circuits', app_auth, session_verify, validationController.createCircuit);
router.get('/circuits/:ref', app_auth, session_verify, validationController.getOneCircuit);
router.put('/circuits/:ref', app_auth, session_verify, validationController.updateCircuit);

router.get('/circuits/:ref/etapes', app_auth, session_verify, validationController.getAllCircuitEtape);
router.post('/circuits/etapes', app_auth, session_verify, validationController.createCircuitEtape);
router.get('/circuits/etapes/:ref', app_auth, session_verify, validationController.getOneCircuitEtape);
router.put('/circuits/etapes/:ref', app_auth, session_verify, validationController.updateCircuitEtape);

module.exports = router;