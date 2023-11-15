const mercadopago = require("mercadopago");
const config = require("../config.json");

mercadopago.configurations.setAccessToken(config.mercadopago.test.token);


module.exports = mercadopago;