const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const typeMoypaiementController = require('../controllers/type_moypaiement_controller')

router.get('/', app_auth, session_verify, typeMoypaiementController.getAllTypeMoypaiement);
router.post('/', app_auth, session_verify, typeMoypaiementController.createTypeMoypaiement);
router.get('/:code', app_auth, session_verify, typeMoypaiementController.getTypeMoypaiement);
router.put('/:code', app_auth, session_verify, typeMoypaiementController.updateTypeMoypaiement);

router.put('/:code/desactiver', app_auth, session_verify, typeMoypaiementController.disableTypeMoypaiement);
router.put('/:code/activer', app_auth, session_verify, typeMoypaiementController.enableTypeMoypaiement);

module.exports = router;