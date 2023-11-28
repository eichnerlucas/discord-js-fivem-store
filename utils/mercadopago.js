const mercadopago = require("mercadopago");
const config = require("../config.json");

mercadopago.configurations.setAccessToken(config.mercadopago.prod.token);


module.exports = mercadopago;