module.exports = {
    authenticationType : "http_signature",
    runEnvironment: "apitest.cybersource.com",
    merchant: {
        merchantId : "aby_0001",

        _commnet: "the following two parameters are used for authentication using HTTP signature",
        merchantKeyId : "f47ee8f5-8c1f-4d2d-b2a1-1f8e2cacab2a",
        merchantSecretKey: "HiWRDNwl7O0LCIuoSrLMUry/ufdiNV8tt33/BzZxdIg=",

        _comment: "the followint 3 parameter are used for authentication using jwt",
        keysDirectory: "Resource",
        keyFileName:"testrest",
        keyAlias:"testrest",
        keyPass:"testrest"
    },
    logging:{
        enableLog : false,
        LogFileName:"cybs",
        LogDirectory:"../../log",
        logfileMaxSize :5242880
    }
}

