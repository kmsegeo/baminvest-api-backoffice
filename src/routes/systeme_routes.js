const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const typeDocumentController = require('../controllers/type_document_controller')
const systemeController = require('../controllers/systeme_controller')

router.get('/', app_auth, session_verify, systemeController.getAllSystemes);
router.post('/', app_auth, session_verify, systemeController.createSysteme);
router.get('/:tag', app_auth, session_verify, systemeController.getSysteme);
router.put('/:tag', app_auth, session_verify, systemeController.updateSysteme);

module.exports = router;