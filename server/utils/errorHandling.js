



exports.handleServerErrors = ( error, statusCode, message ) => {
  if (typeof(error) !== "object"){
    error = {}
  }
  error.messages = error.messages ? error.messages : [message];
  if (!error.statusCode) {
    error.statusCode = statusCode;
  }
  return error;
};
