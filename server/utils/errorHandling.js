



exports.handleServerErrors = ( error, statusCode, message ) => {
  if (!error.statusCode) {
    error.statusCode = statusCode;
  }
  error.errors = [{'msg': message}];
  return error;
};
