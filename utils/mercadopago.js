const mercadopago = require("mercadopago");

mercadopago.configurations.setAccessToken(process.env.MERCADOPAGO_PROD_TOKEN);


module.exports = mercadopago;