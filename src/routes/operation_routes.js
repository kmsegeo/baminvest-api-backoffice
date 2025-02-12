const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const operationController = require('../controllers/operation_controller')

// router.get('/souscriptions', app_auth, session_verify, operationController.getAllOpSoucription);
// router.get('/souscriptions/:code', app_auth, session_verify, operationController.getOpSoucription);



// router.get('/rachats', app_auth, session_verify, operationController.getAllOpRachat);
// router.get('/rachats/:code', app_auth, session_verify, operationController.getOpRachat);
// router.put('/:code', app_auth, session_verify, operationController.);

module.exports = router;