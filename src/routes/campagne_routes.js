const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const campagne_controller = require('../controllers/campagne_controller');
const pr_partie_controller = require('../controllers/pr_partie_controller')
const pr_question_controller = require('../controllers/pr_question_controller')
const pr_repmatrice_controller = require('../controllers/pr_repmatrice_controller')
const pr_reponse_controller = require('../controllers/pr_reponse_controller')

router.get('/', app_auth, session_verify, campagne_controller.getAllCampagnes);
router.post('/', app_auth, session_verify, campagne_controller.createCampagne);
router.get('/:code', app_auth, session_verify, campagne_controller.getCampagneDetails);
router.put('/:code', app_auth, session_verify, campagne_controller.updateCampagne);

router.post('/parties', app_auth, session_verify, pr_partie_controller.createPrPartie);
router.get('/parties/:p_ref', app_auth, session_verify, pr_partie_controller.getPrPartie);
router.put('/parties/:p_ref', app_auth, session_verify, pr_partie_controller.updatePrPartie);

router.post('/parties/questions', app_auth, session_verify, pr_question_controller.createPrQuestion);
router.get('/parties/questions/:q_ref', app_auth, session_verify, pr_question_controller.getPrQuestion);
router.put('/parties/questions/:q_ref', app_auth, session_verify, pr_question_controller.updatePrQuestion);

router.post('/questions/matrices', app_auth, session_verify, pr_repmatrice_controller.createRepMatrice);
router.get('/questions/matrices/:rm_ref', app_auth, session_verify, pr_repmatrice_controller.getRepMatrice);
router.put('/questions/matrices/:rm_ref', app_auth, session_verify, pr_repmatrice_controller.updateRepMatrice);

router.post('/matrices/reponses', app_auth, session_verify, pr_reponse_controller.createMReponse);
router.get('/matrices/reponses/:_ref', app_auth, session_verify, pr_reponse_controller.getMReponse);
router.put('/matrices/reponses/:_ref', app_auth, session_verify, pr_reponse_controller.updateMReponse);

module.exports = router;