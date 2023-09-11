const superagent = require("superagent");
const {
  generateHttpSignature,
  digestGenerator,
} = require("../services/HashServices");
const { normalizeParams } = require("../services/formatService");
const config = require("../config/defualt");

exports.paymentAuthorization = async (req, res, next) => {
  try {
    console.log("Body: ", req.body)
    var totalAmount = req.body.itemPrice;
    var currency = req.body.currency;

    //expected request: John Doe
    var cardHolder = req.body.cardHolderName;
    var nameHasSpace = false;
    cardHolder.indexOf(" ") != -1 ? (nameHasSpace = true) : "";
    cardHolder = cardHolder.split(" ");

    var paReference = req.body.paReference ? req.body.paReference : "";
    var returnUrl = req.body.returnUrl
      ? req.body.returnUrl
      : "http://localhost:3000";
    var merchantReference = req.body.referenceNumber
      ? req.body.referenceNumber
      : Math.random() * (9999999 - 1000000 + 1) + 1000000;
    var cavvAuth = req.body.cavvAuth ? req.body.cavvAuth : "";
    var xidAuth = req.body.xidAuth ? req.body.xidAuth : "";
    var authDirectoryServeTrxId = req.body.authDirectoryServeTrxId
      ? req.body.authDirectoryServeTrxId
      : "";
    var authSpecificationVersion = req.body.authSpecificationVersion
      ? req.body.authSpecificationVersion
      : "";
    var ecommerceIndicatorAuth = req.body.ecommerceIndicatorAuth
      ? req.body.ecommerceIndicatorAuth
      : "vbv";
    var payload = {
      clientReferenceInformation: {
        code: "test_payment",
      },
      processingInformation: {
        commerceIndicator: ecommerceIndicatorAuth,
      },
      orderInformation: {
        billTo: {
          firstName: nameHasSpace ? cardHolder[0] : cardHolder,
          lastName: nameHasSpace ? cardHolder[1] : "",
          address1: "1 Market St",
          postalCode: "94105",
          locality: "san francisco",
          administrativeArea: "CA",
          country: "US",
          phoneNumber: "4158880000",
          company: "Visa",
          email: "test@cybs.com",
        },
        amountDetails: {
          totalAmount: totalAmount,
          currency: currency,
        },
      },
      paymentInformation: {
        card: {
          expirationYear: "2026",
          number: "4242424242424242",
          securityCode: "123",
          expirationMonth: "12",
        },
      },
      consumerAuthenticationInformation: {
        returnUrl: returnUrl,
        referenceId: paReference,
        transactionMode: "MOTO",
        cavv: cavvAuth,
        xid: xidAuth,
        directoryServerTransactionId: authDirectoryServeTrxId,
        paSpecificationVersion: authSpecificationVersion,
      },
    };
    console.log("Payload: ", payload)
    var trxPayload = JSON.stringify(payload);
    var resource = "/pts/v2/payments";
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
  } catch (err) {}
};

exports.authWithTransientToken = (req, res, next) => {
  try {
    console.log("Body: ", req.body);
    let tToken = req.body.flexresponse ? req.body.flexresponse : "";
    var payload = {
      clientReferenceInformation: {
        code: "TC50171_3",
      },
      orderInformation: {
        amountDetails: {
          totalAmount: "102.21",
          currency: "USD",
        },
        billTo: {
          firstName: "RTS",
          lastName: "VDP",
          address1: "201 S. Division St.",
          locality: "Ann Arbor",
          administrativeArea: "MI",
          postalCode: "48104-2201",
          country: "US",
          district: "MI",
          buildingNumber: "123",
          email: "test@cybs.com",
          phoneNumber: "999999999",
        },
      },
      tokenInformation: {
        transientTokenJwt: tToken,
      },
    };
    var trxPayload = JSON.stringify(payload);
    var resource = "/pts/v2/payments";
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
    console.log("Auth with TntToken:", err);
  }
};
