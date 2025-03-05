const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const typeOperationController = require('../controllers/type_operation_controller')

router.get('/', app_auth, session_verify, typeOperationController.getAllTypeOperations);
router.post('/', app_auth, session_verify, typeOperationController.createTypeOperation);
router.get('/:code', app_auth, session_verify, typeOperationController.getTypeOperation);
router.put('/:code', app_auth, session_verify, typeOperationController.updateTypeOperation);

router.put('/:code/desactiver', app_auth, session_verify, typeOperationController.disableTypeOperation);
router.put('/:code/activer', app_auth, session_verify, typeOperationController.enableTypeOperation);

module.exports = router;