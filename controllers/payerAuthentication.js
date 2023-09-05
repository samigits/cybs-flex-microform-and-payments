const superagent = require("superagent");
const {
  generateHttpSignature,
  digestGenerator,
} = require("../services/HashServices");
const { normalizeParams } = require("../services/formatService");

const config = require("../config/defualt");

exports.setupAuthentication = async (req, res, next) => {
  try {
    var isTransinetToken = req.body.isTransientToken;
    var payloadAuth = {
      clientReferenceInformation: {
        code: "cybs_test",
        partner: {
          developerId: "7891234",
          solutionId: "89012345",
        },
      },
      ...(!isTransinetToken
        ? {
            paymentInformation: {
              card: {
                type: "001",
                expirationMonth: "12",
                expirationYear: "2026",
                number: "4242424242424242",
              },
            },
          }
        : {
            tokenInformation: {
              transientToken: "",
            },
          }),
    };
    var trxPayload = JSON.stringify(payloadAuth);
    var resource = "/risk/v1/authentication-setups/";
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
      var data = response.body;

      if (
        data == null ||
        (typeof data === "object" &&
          typeof data.length === "undefined" &&
          !Object.keys(data).length)
      ) {
        // SuperAgent does not always produce a body; use the unparsed response as a fallback
        data = response.text;
      }

      console.log("\n -- Response Message for POST call --");
      console.log("\tResponse Code : " + response["status"]);
      console.log(
        "\tv-c-correlation-id : " + response.headers["v-c-correlation-id"]
      );
      console.log("\tResponse Data :");
      console.log(JSON.stringify(data));

      var _status = -1;
      if (response["status"] >= 200 && response["status"] <= 299) {
        _status = 0;
      }

      res.json({
        ok: true,
        header: response.header,
        data: data,
      });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.checkEnrollement = async (req, res, next) => {
  try {
    var isTransientToken = req.body.isTransientToken;
    var currency = req.body.currency;
    var totalAmount = req.body.totalAmount;

    //expected request: John Doe
    var cardHolder = req.body.cardHolderName;
    var nameHasSpace = false;
    cardHolder.indexOf(" ") != -1 ? (nameHasSpace = true) : "";
    cardHolder = cardHolder.split(" ");
    var payloadAuth = {
      clientReferenceInformation: {
        code: "cybs_test",
      },
      orderInformation: {
        amountDetails: {
          currency: currency,
          totalAmount: totalAmount,
        },
        billTo: {
          address1: "1 Market St",
          address2: "Address 2",
          administrativeArea: "CA",
          country: "US",
          locality: "san francisco",
          firstName: nameHasSpace ? cardHolder[0] : cardHolder,
          lastName: nameHasSpace ? cardHolder[1] : "",
          phoneNumber: "4158880000",
          email: "test@cybs.com",
          postalCode: "94105",
        },
      },
      paymentInformation: {
        card: {
          type: "001",
          expirationMonth: "12",
          expirationYear: "2026",
          number: "4242424242424242",
        },
      },
      buyerInformation: {
        mobilePhone: 1245789632,
      },
      consumerAuthenticationInformation: {
        returnUrl: "http://localhost:3000",
        referenceId: "e43c5523-f729-4080-954b-5b48cad0f99d",
        transactionMode: "MOTO",
      },
    };
    var trxPayload = JSON.stringify(payloadAuth);
    var resource = "/risk/v1/authentications/";
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

    // Set header parameters
    request.set(normalizeParams(headerParams));
    // Set request timeout
    request.timeout(5000);

    request.type(contentType);
    request.send(bodyParam);

    request.accept(acceptType);
    request.end((error, response) => {
      var data = response.body;
      if (
        data == null ||
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
        data: data,
      });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.validateAuthentication = async (req, res, next) => {
  try {
    res.json({
      ok: true,
    });
  } catch (err) {
    console.log(err);
  }
};
