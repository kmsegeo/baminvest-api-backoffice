const Systeme = require("../models/Systeme");
const response = require("./response");

module.exports = async (req, res, next) => {
    
    await Systeme.findByTag('atsgo_api_key').then(async apikey => {
        
        if (new Date(apikey.r_description) < new Date()) {

            const data = {
                "userNameOrEmailAddress": "inexa.api.expose",
                "password": "Api@inexa2025"
            }
    
            const url = process.env.ATSGO_URL + process.env.URI_AUTHENTICATE
    
            await fetch(url, { 
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(async data => {
                if (data.status!=200) return response(res, data.status, `Erreur d'authentification api !`)
                await Systeme.update('atsgo_api_key', {
                    r_valeur: data.payLoad.apiKey, 
                    r_description: data.payLoad.expirationDate
                }).then(async apikey => {
                    req.apikey = apikey;
                })
            });
        } else {
            req.apikey = apikey;
        }

        await next();
    })
}