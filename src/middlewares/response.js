const statuts = require('../config/default_statuts')

const response = async (res, statut_code, message, data, data_status, analytics) => {
    
    const type = data_status ? data_status : 'default_status';

    if (data)
        try {
            for(let d of data)
                d['statut_intitule'] = statuts[type][d.r_statut];
        } catch (error) {
            data['statut_intitule'] = statuts[type][data.r_statut];
        }

    await res.status(statut_code).json({
        statut: statut_code==200 || statut_code==201 ? "SUCCESS" : "ERROR", 
        message, 
        analytics,
        data
    })

    (statut_code==200 || statut_code==201) ? console.log(message) : console.error(message);
}

module.exports = response;