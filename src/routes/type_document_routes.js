const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const typeDocumentController = require('../controllers/type_document_controller')

router.get('/', app_auth, session_verify, typeDocumentController.getAllTypeDocuments);
router.post('/', app_auth, session_verify, typeDocumentController.createTypeDocument);
router.get('/:code', app_auth, session_verify, typeDocumentController.getTypeDocument);
router.put('/:code', app_auth, session_verify, typeDocumentController.updateTypeDocument);

router.put('/:code/desactiver', app_auth, session_verify, typeDocumentController.disableTypeDocument);
router.put('/:code/activer', app_auth, session_verify, typeDocumentController.enableTypeDocument);

module.exports = router;