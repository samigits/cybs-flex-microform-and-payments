const config = require("../config/defualt");
const crypto = require('crypto')

function digestGenerator (payload){
    var data = payload;
    var buffer = Buffer.from(data, 'utf8');
    const hash = crypto.createHash("sha256")
    hash.update(buffer)
    var digest = hash.digest('base64')
    return digest;
}

function generateHttpSignature(resource, method, payload) {
  
  var signatureHeader = "";
  var signatureValue = "";
  console.log("sign: ", resource)
  // KeyId is the key obtained from EBC
  signatureHeader += 'keyid="' + config.merchant.merchantKeyId + '"';

  // Algorithm should be always HmacSHA256 for http signature
  signatureHeader += ', algorithm="HmacSHA256"';
  // Headers - list is choosen based on HTTP method.
  // Digest is not required for GET Method
  if (method === "get") {
    var headersForGetMethod = "host date (request-target) v-c-merchant-id";
    signatureHeader += ', headers="' + headersForGetMethod + '"';
  } else if (method === "post") {
    var headersForPostMethod =
      "host date (request-target) digest v-c-merchant-id";
    signatureHeader += ', headers="' + headersForPostMethod + '"';
  }

  var signatureString = "host: " + config.runEnvironment;
  signatureString += "\ndate: " + new Date(Date.now()).toUTCString();
  signatureString += "\n(request-target): ";

  if (method === "get") {
    var targetUrlForGet = "get " + resource;
    signatureString += targetUrlForGet + "\n";
  } else if (method === "post") {
    // Digest for POST call
    var digest = digestGenerator(payload);

    var targetUrlForPost = "post " + resource;
    signatureString += targetUrlForPost + "\n";

    signatureString += "digest: SHA-256=" + digest + "\n";
  }

  signatureString += "v-c-merchant-id: " + config.merchant.merchantId;

  var data = new Buffer.from(signatureString, "utf8");

  // Decoding scecret key
  var key = new Buffer.from(config.merchant.merchantSecretKey, "base64");
  signatureValue = crypto
    .createHmac("sha256", key)
    .update(data)
    .digest("base64");

  signatureHeader += ', signature="' + signatureValue + '"';
  return signatureHeader;
}

module.exports = {generateHttpSignature, digestGenerator };
