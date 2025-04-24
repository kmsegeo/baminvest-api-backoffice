const errorhandling = require('./src/middlewares/error_handler');
const express = require('express');
const cors = require('cors')
require('dotenv').config();

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger-outpout.json');
const authRoutes = require('./src/routes/auth_routes');
const profilRoutes = require('./src/routes/profil_routes');
const agentRoutes = require('./src/routes/agent_routes');
const defaultController = require('./src/controllers/default_controller') 
const clientRoutes = require('./src/routes/client_routes')
const typeActeurRoutes = require('./src/routes/type_acteur_routes');
const typeDocumentRoutes = require('./src/routes/type_document_routes');
const typeOperationRoutes = require('./src/routes/type_operation_routes');
const typeMoypaiementRoutes = require('./src/routes/type_moypaiement_routes');
const systemeRoutes = require('./src/routes/systeme_routes');
const campagneRoutes = require('./src/routes/campagne_routes');
const circuitRoutes = require('./src/routes/circuit_validation_routes');
const fondsRoutes = require('./src/routes/fonds_routes');
const operationRoutes = require('./src/routes/operation_routes');
const atsgoDefaultController = require('./src/controllers/atsgo_default_controller');
const path = require('path');
const fichierRoutes = require('./src/routes/fichier_routes')
const newsRoutes = require('./src/routes/news_routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes

const base_path = '/v1'

app.use(`${base_path}/auth`, authRoutes);
app.use(`${base_path}/config`, systemeRoutes);

app.use(`${base_path}/t-acteurs`, typeActeurRoutes);
app.use(`${base_path}/t-documents`, typeDocumentRoutes);
app.use(`${base_path}/t-operations`, typeOperationRoutes);
app.use(`${base_path}/t-moypaiement`, typeMoypaiementRoutes);
app.use(`${base_path}/profils`, profilRoutes);
app.use(`${base_path}/agents`, agentRoutes);
app.use(`${base_path}/acteurs`, clientRoutes);
app.use(`${base_path}/p-risques`, campagneRoutes);
app.use(`${base_path}/fonds`, fondsRoutes);
app.use(`${base_path}/operations`, operationRoutes);
app.use(`${base_path}/validations`, circuitRoutes);
app.use(`${base_path}/fichiers`, fichierRoutes);
app.use(`${base_path}/news`, newsRoutes);

app.use(`/uploads`, express.static(path.join(__dirname, 'uploads')));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use(base_path + '/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Error handling middlware

app.use(errorhandling);

// Default data

defaultController.defaultCanals();
defaultController.defaultTypeActeur();
defaultController.defaultAdmin();
defaultController.defaultOperations();
defaultController.defaultTypeDocument();
defaultController.defaultCampagneRisque();
atsgoDefaultController.iniAuthData();

module.exports = app;