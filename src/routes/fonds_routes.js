const express = require('express');
const router = express.Router();
const app_auth = require('../middlewares/app_auth');
const session_verify = require('../middlewares/session_verify');
const fondsController = require('../controllers/fonds_controller');
const vlController = require('../controllers/valeur_liquidative_controller')
const atsgo_auth = require('../middlewares/atsgo_auth');

router.get('/', app_auth, session_verify, atsgo_auth, fondsController.getAllFonds);
// router.post('/', app_auth, session_verify, fondsController.createFonds);
// router.get('/:ref', app_auth, session_verify, fondsController.getFondsByRef);
// router.put('/:ref', app_auth, session_verify, fondsController.updateFonds);
// router.delete('/:ref', app_auth, session_verify, fondsController.deleteFondsByRef);

router.get('/val_liquidatives', app_auth, session_verify, atsgo_auth, vlController.getAllValeurLiquidatives);

// router.get('/:ref/val_liquidatives/:date_debut/:date_fin', app_auth, session_verify, vlController.getAllFondsValLiquidativeAtDate);
// router.get('/val_liquidatives/:date_debut/:date_fin', app_auth, session_verify, vlController.getAllValLiquidativeAtDate);
// router.post('/val_liquidatives', app_auth, session_verify, vlController.createValLiquidative);
// router.get('/val_liquidatives/:id', app_auth, session_verify, vlController.getOneValLiquidative);
// router.put('/val_liquidatives/:id', app_auth, session_verify, vlController.updateValLiquidative);

module.exports = router;