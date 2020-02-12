

const jwt = require('jsonwebtoken');

const handleServerErrors = require('../utils/errorHandling').handleServerErrors
// const globalVars = require('../utils/globalVars');


module.exports = (req, res, next) => {
  try {
    if(req.method === "OPTIONS") return next();
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECERT_TOKEN_KEY);
    next();
  } catch (error) {
    if ( error.name === 'TokenExpiredError' ) {
      res.status(401).json({
        messages: ['Only logged in users can do that.'],
        type: 'failure'
      });
    } else {
      next(handleServerErrors(error, 500, "Auth Fail"));
    }
  }
};


















