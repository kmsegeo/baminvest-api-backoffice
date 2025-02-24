const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const systemeController = require('../controllers/systeme_controller')
const canalController = require('../controllers/canal_controller')

router.get('/sys/', app_auth, session_verify, systemeController.getAllSystemes);
router.post('/sys/', app_auth, session_verify, systemeController.createSysteme);
router.get('/sys/:tag', app_auth, session_verify, systemeController.getSysteme);
router.put('/sys/:tag', app_auth, session_verify, systemeController.updateSysteme);

router.get('/canal/list', app_auth, session_verify, canalController.getAllCanals);
router.post('/canal', app_auth, session_verify, canalController.createCanal);
router.get('/canal/:code', app_auth, session_verify, canalController.getOneCanal);
router.put('/canal/:code', app_auth, session_verify, canalController.updateCanal);

module.exports = router;