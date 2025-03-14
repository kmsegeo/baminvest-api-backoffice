const Systeme = require("../models/Systeme")

const iniAuthData = async () => {
    
    console.log(`Initialisation de l'autehntification d'api de ATSGO..`)

    await Systeme.findByTag('atsgo_api_key').then(async authdata => {
        if (authdata) return;

        const data = {
            "userNameOrEmailAddress": process.env.ATSGO_AUTH_USER,
            "password": process.env.ATSGO_AUTH_PASSWORD
        }

        fetch(process.env.ATSGO_URL_AUTHENTICATE, { 
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(async result => {
            if (result.status!=200) return response(res, result.status,`Une erreur s'est produite !`)
            console.log(`Enregistrement de l'apiKey`)
            await Systeme.create({
                r_tag: 'atsgo_api_key', 
                r_valeur: result.payLoad.apiKey, 
                r_description: result.payLoad.expirationDate
            })
        })
    })
}

module.exports = {
    iniAuthData
}