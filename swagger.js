const swaggerAutogen = require('swagger-autogen');

const doc = {
    info: {
        title: 'BAM API Backoffice',
        version: process.env.VERSION,
        description: `Api backoffice de l'application de fonds commun de placement de Bridge Asset Management`,
    },
    host: 'bam.mediasoftci.net/api/bambckoff',
    schemes: ['http']
};

const outpoutFile = './swagger-outpout.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outpoutFile, endpointsFiles, doc).then(()=>{
    require('./app.js');
});