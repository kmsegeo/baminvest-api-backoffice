const express = require('express');
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify')
const fileController = require('../controllers/file_controller')
const upload = require('../middlewares/multer-config');

const router = express.Router();

router.post('/:intitule', app_auth, session_verify, upload.single('file'), fileController.saveOneFile);

router.get('/', app_auth, session_verify, fileController.getAllFiles);
router.get('/:ref', app_auth, session_verify, fileController.getOneFile);

module.exports = router;