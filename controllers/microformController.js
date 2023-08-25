const superagent = require('superagent')
const cybersourceRestApi = require('cybersource-rest-client')
const {
    generateHttpSignature,
    digestGenerator,
  } = require("../services/HashServices");
  const { normalizeParams } = require("../services/formatService");
  const config = require("../config/defualt");

  exports.generateCaptureContext = async(req, res, next) =>{
    try{
        var payload = {
            "targetOrigins": [
              "http://localhost/"
            ],
            "allowedCardNetworks": [
              "VISA",
              "MAESTRO",
              "MASTERCARD",
              "AMEX",
              "DISCOVER",
              "DINERSCLUB",
              "JCB",
              "CUP",
              "CARTESBANCAIRES"
            ],
            "clientVersion": "v2.0"
          }
          var trxPayload = JSON.stringify(payload);
          var resource = "/microform/v2/sessions";
          var method = "post";
          var statusCode = -1;
          var url = "https://apitest.cybersource.com" + resource;
      
          var headerParams = {};
          var contentType = "application/json;charset=utf-8";
          var acceptType = "application/hal+json;charset=utf-8";
          var request = superagent(method, url);
          var bodyParam = trxPayload;
      
          var signature = generateHttpSignature(resource, method, bodyParam);
          var date = new Date(Date.now()).toUTCString();
          var digest = digestGenerator(trxPayload);
          digest = "SHA-256=" + digest;
      
          headerParams["digest"] = digest;
          headerParams["accept"] = '*/*';
          headerParams["v-c-merchant-id"] = config.merchant.merchantId;
          headerParams["date"] = date;
          headerParams["host"] = config.runEnvironment;
          headerParams["signature"] = signature;
          headerParams["User-Agent"] = "Mozilla/5.0";
          //set header parameters
          request.set(normalizeParams(headerParams));
      
          //set timeout
          request.timeout(5000);
      
          request.type(contentType);
      
          request.send(bodyParam);
      
          request.accept(acceptType);
      
          request.end((err, response) => {
            console.log("auth response", response)
            var data = response.body ? response.body : response.text;
            if (
              data === null ||
              (typeof data === "object" &&
                typeof data.length === "undefined" &&
                !Object.keys(data).length)
            ) {
              // SuperAgent does not always produce a body; use the unparsed response as a fallback
              data = response.text;
            }
      
            var _status = -1;
            if (response["status"] >= 200 && response["status"] <= 299) {
              _status = 0;
            }
            res.json({
              ok: true,
              header: response.header,
              data: data ? data :JSON.parse(response.text),
            });
        });
    }catch(err){
        console.log("capture-context-error: ", err)
    }
  }

  exports.captureContextFromSdk = (req, res, next) =>{
    try{
        var instance = new cybersourceRestApi.KeyGenerationApi(config)

        var request = new cybersourceRestApi.GeneratePublicKeyRequest();
        request.encryptionType = "RsaOaep256"
        request.targetOrigin = "http://localhost:3000"

        var opts = []
        opts['format'] = 'JWT'

        console.log("\n******* Generate Key *******");

        instance.generatePublicKey(request, opts, function(error, data, response){
            if(error){
                console.log("Error : " + error);
                console.log("Error status code : " + error.statusCode);
            } else if (data){
                console.log("Data : " + JSON.stringify(data));
                console.log("CaptureContext: " + data.keyId);
            }

            res.json({
                success: true,
                data: JSON.parse(data)
            })
        })
    }catch(err) {
        console.log("ccSdk: ", err)
    }
  }