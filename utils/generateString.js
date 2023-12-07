const crypto = require('crypto');
const base64url = require('base64url');

function randomStringAsBase64Url(size) {
    return base64url(crypto.randomBytes(size));
}

module.exports = randomStringAsBase64Url;