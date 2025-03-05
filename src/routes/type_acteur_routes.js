const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const typeActeurController = require('../controllers/type_acteur_controller')

router.get('/', app_auth, session_verify, typeActeurController.getAllTypeActeurs);
router.post('/', app_auth, session_verify, typeActeurController.createTypeActeur);
router.get('/:code', app_auth, session_verify, typeActeurController.getTypeActeur);
router.put('/:code', app_auth, session_verify, typeActeurController.updateTypeActeur);
router.put('/:code/desactiver', app_auth, session_verify, typeActeurController.disableTypeActeur);
router.put('/:code/activer', app_auth, session_verify, typeActeurController.enableTypeActeur);

module.exports = router;