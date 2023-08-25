function paramToString(param) {
  if (param == undefined || param == null) {
    return "";
  }
  if (param instanceof Date) {
    return param.toJSON();
  }
  return param.toString();
}
function normalizeParams(params) {
  var newParams = {};
  for (var key in params) {
    if (
      params.hasOwnProperty(key) &&
      params[key] != undefined &&
      params[key] != null
    ) {
      var value = params[key];
      if (Array.isArray(value)) {
        newParams[key] = value;
      } else {
        newParams[key] = paramToString(value);
      }
    }
  }
  return newParams;
}

module.exports = { normalizeParams };
