const superagent = require("superagent");
const cybersourceRestApi = require("cybersource-rest-client");
const jwt = require("jsonwebtoken");
const {
  generateHttpSignature,
  digestGenerator,
} = require("../services/HashServices");
const { normalizeParams } = require("../services/formatService");
const config = require("../config/defualt");

exports.generateCaptureContext = async (req, res, next) => {
  try {
    var payload = {
      targetOrigins: ["http://localhost/"],
      allowedCardNetworks: [
        "VISA",
        "MAESTRO",
        "MASTERCARD",
        "AMEX",
        "DISCOVER",
        "DINERSCLUB",
        "JCB",
        "CUP",
        "CARTESBANCAIRES",
      ],
      clientVersion: "v2.0",
    };
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
    headerParams["accept"] = "*/*";
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
      console.log("auth response", response);
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
        data: data ? data : JSON.parse(response.text),
      });
    });
  } catch (err) {
    console.log("capture-context-error: ", err);
  }
};

exports.captureContextFromSdk = (req, res, next) => {
  try {
    const configObject = {
      authenticationType: config.authenticationType,
      runEnvironment: config.runEnvironment,

      merchantID: config.merchant.merchantId,
      merchantKeyId: config.merchant.merchantKeyId,
      merchantsecretKey: config.merchant.merchantSecretKey,

      keyAlias: config.merchant.keyAlias,
      keyPass: config.merchant.keyPass,
      keyFileName: config.merchant.keyFileName,
      keysDirectory: config.merchant.keysDirectory,

      useMetaKey: false,
      portfolioID: "",

      logConfiguration: {
        enableLog: config.logging.enableLog,
        logFileName: config.logging.LogFileName,
        logDirectory: config.logging.logDirectory,
        logFileMaxSize: config.logging.logfileMaxSize,
        loggingLevel: "debug",
        enableMasking: true,
      },
    };
    var apiClient = new cybersourceRestApi.ApiClient();
    var requestObj = new cybersourceRestApi.GenerateCaptureContextRequest();

    requestObj.clientVersion = "v2.0";
    requestObj.targetOrigins = ["http://localhost"];
    requestObj.allowedCardNetworks = ["VISA", "MASTERCARD"];

    var instance = new cybersourceRestApi.MicroformIntegrationApi(
      configObject,
      apiClient
    );

    instance.generateCaptureContext(
      requestObj,
      function (error, data, response) {
        if (error) {
          console.log("\nError: ", JSON.stringify(error));
        } else if (data) {
          console.log("\n Capture Context: " + JSON.stringify(data));
        }
        res.json({
          success: true,
          data: data
        });
      }
    );
  } catch (err) {
    console.log("ccSdk: ", err);
  }
};


exports.validateToken = (req, res, next) => {
  try{
    let flexToken =  req.body.flexToken;
    flexToken = flexToken.replace(/["]/g, '')
    console.log("\n\n Transient Token: ",flexToken)
    const verificationResult = jwt.decode(flexToken, { complete: true });
    console.log("\n\n Verified Result: ", verificationResult)
    res.json({
      success: true,
      data: verificationResult
    })
  }catch(err){
    console.log("Error: ", err)
    res.status(500).json({
      success: false,
      error: "Token verification failed",
    });
  }
}
exports.payWithTransientToken = (req, res, next) => {
  try {
    console.log({
      name: req.body.cardHolderName,
      currency: req.body.currency,
      price: req.body.itemPrice,
    });
    const configObject = {
      authenticationType: config.authenticationType,
      runEnvironment: config.runEnvironment,

      merchantID: config.merchant.merchantId,
      merchantKeyId: config.merchant.merchantKeyId,
      merchantsecretKey: config.merchant.merchantSecretKey,

      keyAlias: config.merchant.keyAlias,
      keyPass: config.merchant.keyPass,
      keyFileName: config.merchant.keyFileName,
      keysDirectory: config.merchant.keysDirectory,

      useMetaKey: false,
      portfolioID: "",

      logConfiguration: {
        enableLog: config.logging.enableLog,
        logFileName: config.logging.LogFileName,
        logDirectory: config.logging.logDirectory,
        logFileMaxSize: config.logging.logfileMaxSize,
        loggingLevel: "debug",
        enableMasking: true,
      },
    };

    var instance = new cybersourceRestApi.PaymentsApi(configObject);
    var clientReferenceInformation =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientReferenceInformation.code = req.body.merchantReference
      ? req.body.merchantReference
      : Math.random();
    var processingInformation =
      new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.commerceIndicator = "internet";

    var amountDetails =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
    amountDetails.totalAmount = req.body.itemPrice;
    amountDetails.currency = req.body.currency;

    //expected request: John Doe
    var cardHolder = req.body.cardHolderName;
    var nameHasSpace = false;
    cardHolder.indexOf(" ") != -1 ? (nameHasSpace = true) : "";
    cardHolder = cardHolder.split(" ");
    var billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    billTo.country = "US";
    billTo.firstName = nameHasSpace ? cardHolder[0] : cardHolder;
    billTo.lastName = nameHasSpace ? cardHolder[1] : "";
    billTo.phoneNumber = "4158880000";
    billTo.address1 = "test";
    billTo.postalCode = "94105";
    billTo.locality = "San Francisco";
    billTo.administrativeArea = "MI";
    billTo.email = "test@cybs.com";
    billTo.address2 = "Address 2";
    billTo.district = "MI";
    billTo.buildingNumber = "123";
    var orderInformation =
      new cybersourceRestApi.Ptsv2paymentsOrderInformation();
    orderInformation.amountDetails = amountDetails;
    orderInformation.billTo = billTo;
    var tokenInformation =
      new cybersourceRestApi.Ptsv2paymentsTokenInformation();
    tokenInformation.transientTokenJwt = req.body.flexresponse;

    var request = new cybersourceRestApi.CreatePaymentRequest();
    request.clientReferenceInformation = clientReferenceInformation;
    request.processingInformation = processingInformation;
    request.orderInformation = orderInformation;
    request.tokenInformation = tokenInformation;

    instance.createPayment(request, function (error, data, response) {
      if (error) {
        console.log("\nError in process a payment : " + JSON.stringify(error));
        res.json({ error: error });
      } else if (data) {
        console.log("\nData of process a payment : " + JSON.stringify(data));
        res.json({ paymentStatus: data });
      }
    });
  } catch (err) {
    console.log("Pay With Transient Token Error: ", err);
  }
};
