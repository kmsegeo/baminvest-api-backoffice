const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const profilCotroller = require('../controllers/profil_controller');

router.get('/', app_auth, session_verify, profilCotroller.getAllProfils);
router.post('/', app_auth, session_verify, profilCotroller.createProfil);
router.get('/:code', app_auth, session_verify, profilCotroller.getProfil);
router.put('/:code', app_auth, session_verify, profilCotroller.updateProfil);

router.put('/:code/desactiver', app_auth, session_verify, profilCotroller.disableProfil);
router.put('/:code/activer', app_auth, session_verify, profilCotroller.enableProfil);

module.exports = router;