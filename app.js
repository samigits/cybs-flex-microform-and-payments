var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var cybersourceRestApi = require("cybersource-rest-client");
const superagent = require("superagent");
const config = require("./config/defualt");
const {
  generateHttpSignature,
  digestGenerator,
} = require("./services/HashServices");
const { normalizeParams } = require("./services/formatService");

const indexRouter = require("./routes/index");
const payerAuthRoute = require("./routes/authRoute")
const cybsPayments = require('./routes/payments')
const flexMicroform = require('./routes/flexRoute')

var configObj = {
  authenticationType: config.authenticationType,
  runEnvironment: config.runEnvironment,

  merchantID: config.merchant.merchantId,
  merchantKeyId: config.merchant.merchantKeyId,
  merchantsecretKey: config.merchant.merchantSecretKey,

  keyAlias: config.merchant.keyAlias,
  keyPass: config.merchant.keyPass,
  keyFileName: config.merchant.keyFileName,
  keysDirectory: config.merchant.keysDirectory,

  enableLog: config.logging.enableLog,
  logFilename: config.logging.LogFileName,
  logDirectory: config.logging.LogDirectory,
  logFileMaxSize: config.logging.logfileMaxSize,
};

var app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/payerAuthentication",payerAuthRoute)
app.use("/payments", cybsPayments)
app.use("/flex", flexMicroform)
//catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//error handler
app.use(function (err, req, res, next) {
  //set locals, only providing errors in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  //render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
