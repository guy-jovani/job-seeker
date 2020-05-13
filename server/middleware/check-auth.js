

const jwt = require('jsonwebtoken');

const handleServerErrors = require('../utils/errorHandling').handleServerErrors;
 
/**
 * Check for a valid JWT.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req headers need to have an authorization
 *                                 property with the token in the template of "Bearer <%TOKEN_VALUE%>"
 * @param {express respond object} res
 */
module.exports = (req, res, next) => {
  try {
    if(req.method === "OPTIONS") return next();
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_TOKEN_KEY);
    next();
  } catch (error) {
    if ( error.name === 'TokenExpiredError' ) {
      res.status(401).json({
        messages: ['The JWT is Expired.'],
        type: 'TokenExpiredError'
      });
    } else {
      next(handleServerErrors(error, 403, "Auth Fail. You need to login."));
    }
  }
};


















