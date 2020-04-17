const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const Employee = require('../models/employee');
const Job = require('../models/job');
const Company = require('../models/company');
const validation = require('../utils/validation');
const handleServerErrors = require('../utils/errorHandling').handleServerErrors;
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse;
const checkCompanyUpdateSignupValidation = require('../utils/shared').checkCompanyUpdateSignupValidation;

const getAndCreateAccessToken = require('../utils/shared').getAndCreateAccessToken;
const getAndCreateTokens = require('../utils/shared').getAndCreateTokens;


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jobs.seeker.for.your.needs@gmail.com',
    pass: 'jobseekerjobseeker'
  }
});


/**
 * Creates a user (Company or Employee) based on the email, password and name.
 * @param {string} email - the user email
 * @param {string} password - the user password
 * @param {string} name - the company name (null if its a Employee)
 * @return { [(Company | Employee), string] } - an array in which the first var is the user object, 
 *                                             and the second is a string representing its kind ("company" | "employee")
 */
createUserSignup = async (email, password, name = null) => {
  let user, kind;
  if(name){
    // user = new Company({ email: email, password: password, name: name });
    user = await Company.create({ email: email, password: password, name: name });
    kind = "company";
  } else {
    // user = new Employee({ email: email, password: password });
    user = await Employee.create({ email: email, password: password });
    kind = "employee";
  }
  return [user, kind];
};


/**
 * Signing a user up and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the signup succeeded
 *    {string} accessToken - a JWT related to the user
 *    {string} refreshToken - a JWT related to the user to refresh the accessToken
 *    {string} expiresInSeconds - the number of seconds until the token expires
 *    {object} user - the user object of who that signed up (Company | Employee)
 *    {string} kind - representing the user kind ("company" | "employee")
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have a body with: 
 *                                        {string} email - the email of the new user
 *                                        {string} password - the password of the new user
 * @param {express respond object} res
 */
exports.signup = async (req, res, next) => {
  try {
    req.body.email = req.body.email ? req.body.email.toLowerCase() : null;
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    const companyValid = await checkCompanyUpdateSignupValidation(req);
    if(companyValid.type === 'failure'){
      return sendMessagesResponse(res, 422, companyValid.messages, 'failure');
    }
    const password = await bcrypt.hash(req.body.password, 12);
    let [user, kind] = await createUserSignup(req.body.email, password, req.body.name);

    const [accessToken, refreshToken] = await getAndCreateTokens(user, kind);
    user = user.toObject();
    Reflect.deleteProperty(user, 'password');
    res.status(201).json({
      type: 'success',
      accessToken,
      expiresInSeconds: process.env.JWT_TOKEN_EXPIRATION_SECONDS,
      refreshToken,
      user,
      kind
    });
  } catch (error) {
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to signup."));
  }
};


/**
 * Get the logged user (Company or Employee).
 * @param {string} email - the email of the user.
 * @return { [(Company | Employee), string] } - an array in which the first var is the user object, 
 *           and the second is a string representing its kind ("company" | "employee").
 *      employee obj - with jobs array populated with the job info, and the job company name 
 *      company obj - with the jobs populated,
 *                    with applicants array populated with the employee info,
 *                    with the applicants jobs populated with the job info 
 */
getUserLogin = async email => {
  let user = await Employee.findOne({email: email}).select('-__v')
                            .populate({
                              path: 'jobs.job', 
                              populate: { path: 'company', select: 'name' }
                            });
  let kind = "employee";
  if(!user) {
    user = await Company.findOne({email: email}).select(
                '-__v -createdAt -updatedAt -resetPassToken -resetPassTokenExpiration -refreshToken'
            ).populate({ path: 'jobs', select: '-__v' });
    user = await Company.populate(user, { path: 'applicants.employee', select: '-__v -password -refreshToken -jobs'});
    user = await Company.populate(user, { path: 'applicants.jobs.job', select: 'title'});
    kind = "company";
  }
  return [user, kind];
};

/**
 * login a user in and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the signup succeeded
 *    {string} accessToken - a JWT related to the user
 *    {string} expiresInSeconds - the number of seconds until the token expires
 *    {string} refreshToken - a JWT related to the user to refresh the accessToken
 *    {object} user - the user object of who that signed up (Company | Employee)
 *    {string} kind - representing the user kind ("company" | "employee")
 *  
 * send the client a 401 error with a message in case the email/password are incorrect.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have a body with: 
 *                                        {string} email - the email of the new user
 *                                        {string} password - the password of the new user
 * @param {express respond object} res
 */
exports.login = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    
    let [user, kind] = await getUserLogin(req.body.email);
    if(!user){ 
      return sendMessagesResponse(res, 401, ['The email and/or password are incorrect'], 'failure');
    }
    const verifiedPassword = await bcrypt.compare(req.body.password, user.password);
    if(!verifiedPassword){ 
      return sendMessagesResponse(res, 401, ['The email and/or password are incorrect.'], 'failure');
    }
    const [accessToken, refreshToken] = await getAndCreateTokens(user, kind);

    user = user.toObject();
    Reflect.deleteProperty(user, 'password');
    Reflect.deleteProperty(user, 'refreshToken');
    Reflect.deleteProperty(user, 'updatedAt');
    res.status(200).json({
      type: 'success',
      accessToken,
      expiresInSeconds: process.env.JWT_TOKEN_EXPIRATION_SECONDS,
      refreshToken,
      user,
      kind
    });
  } catch (error) {
    // console.log(error);
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to login."));
  }
};

/**
 * Sending a user a link with a token to reset his password
 * and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the email has been sent
 *    {string} message - indicating that an email has been sent.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have a body with: 
 *                                        {string} email - the email of the new user
 * @param {express respond object} res
 */
exports.resetPasswordEmail = async (req, res, next) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        next(handleServerErrors(error, 500, "There was an unexpected error while trying to reset the password."));
      }
      const token = buffer.toString('hex');
      const user = await Employee.findOne({ email: req.body.email }) || 
                    await Company.findOne({ email: req.body.email });
      if (!user) {
        return sendMessagesResponse(res, 401, ['No account with that email found.'], 'failure');
      }  
      
      user.resetPassToken = token;
      user.resetPassTokenExpiration = new Date(new Date().getTime() +  +process.env.RESET_PASSWORD_TOKEN_EXPIRATION_MILLISECONDS);
      await user.save();

      transporter.sendMail({
        from: 'shop@node-complete',
        to: req.body.email,
        subject: 'password reset',
        html: `<a href="${process.env.RESET_URL}${token}">reset password</a>`
      }, err => { if(err) console.log(err) }); 

      res.status(200).json({
        message: 'A reset email has been sent successfully!',
        type: 'success'
      });
    });
  } catch (error) {
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to reset the password."));
  }
}

/**
 * Resetting the user password
 * and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the password had a reset.
 *    {string} message - indicating that the password had reset successfully.
 * 
 * Send the client a 401 error and a message if the token is invalid.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have a body with: 
 *                                        {string} token - the token of the reset operation
 *                                        {string} password - the password of the new user
 * @param {express respond object} res
 */
exports.resetToNewPassword = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    const resetPassToken = req.body.token;
    const user = await Employee.findOne({ 
                      resetPassToken: resetPassToken, resetPassTokenExpiration: { $gt: Date.now() } }) || 
                 await Company.findOne({ 
                      resetPassToken: resetPassToken, resetPassTokenExpiration: { $gt: Date.now() } });

    if (!user) {
      return sendMessagesResponse(res, 401, ['Invalid Token.'], 'failure');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    user.password = hashedPassword;
    user.resetPassToken = undefined;
    user.resetPassTokenExpiration = undefined;
    await user.save();
    res.status(200).json({
      message: 'Reset successfully!',
      type: 'success'
    });
  } catch (error) {
    console.log(error)
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to reset the password."));
  }
}





/**
 * Creating a new JWT access token for the user
 * and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the password had a reset.
 *    {string} newAccessToken - the new token
 *    {string} expiresInSeconds - the number of seconds till the token will get expired
 * 
 * Send the client a 401 error and a message if the token is invalid.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have a body with: 
 *                                        {string} refreshToken - the user refresh token
 * @param {express respond object} res
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 401, routeErrors.messages, 'TokenRefreshError');
    }
    const refreshToken = req.body.refreshToken;
    const payload = jwt.verify(refreshToken, process.env.SECRET_TOKEN_KEY);
    let user;
    if(payload.kind === 'employee') {
      user = await Employee.findById(payload.userId);
    } else {
      user = await Company.findById(payload.userId);
    }
    const newAccessToken = getAndCreateAccessToken(user, payload.kind);
    res.status(200).json({
      type: 'success',
      newAccessToken,
      expiresInSeconds: process.env.JWT_TOKEN_EXPIRATION_SECONDS,
    });
  } catch (error) {
    next(handleServerErrors(error, 403, "Auth Fail. You need to login."));
  }
}


/**
 * Deleting the refresh token from the user db
 * and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the password had a reset.
 * 
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have a body with: 
 *                                        {string} kind - the user kind ('employee' | 'company')
 * @param {express respond object} res
 */
exports.logout = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'TokenRefreshError');
    }
    
    if(req.body.kind === 'employee') {
      await Employee.findOneAndUpdate(
        { _id: req.body._id }, 
        { $set: {
          refreshToken: null
        }});
    } else {
      await Company.findOneAndUpdate(
        { _id: req.body._id }, 
        { $set: {
          refreshToken: null
        }});
    }

    res.status(200).json({
      type: 'success'
    });

  } catch (error) {
    next(handleServerErrors(error, 500, "Something went wrong while trying to logout"));
  }
}



/**
 * Changing the user password,
 * and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the password had change.
 *    {string} accessToken - a new access token
 *    {string} refreshToken - a new refresh token
 *    {string} expiresInSeconds - the number of seconds till the access token will get expired
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have a body with: 
 *                                        {string} _id - the id of the user
 *                                        {string} kind - the user kind ('employee' | 'company')
 *                                        {string} currPassword - the current password of the user
 *                                        {string} newPassword - the new password of the user
 *                                        {string} confirmNewPassword - the new password confirm of the user
 * @param {express respond object} res
 */
exports.changePassword = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }

    let user;
    if(req.body.kind === 'employee') {
      user = await Employee.findById(req.body._id);
    } else {
      user = await Company.findById(req.body._id);
    }
    if(!user){
      return sendMessagesResponse(res, 422, ['Something went wrong while trying to change the password.'], 'failure');
    }

    const verifiedPassword = await bcrypt.compare(req.body.currPassword, user.password);
    if(!verifiedPassword){ 
      return sendMessagesResponse(res, 401, ['You didn\'t type your current password correctly. Please try again.'], 'failure');
    }
    user.password = await bcrypt.hash(req.body.newPassword, 12);
    await user.save();

    const tokens = await getAndCreateTokens(user, req.body.kind);

    res.status(201).json({
      type: 'success',
      accessToken: tokens ? tokens[0] : null,
      refreshToken: tokens ? tokens[1] : null,
      expiresInSeconds: process.env.JWT_TOKEN_EXPIRATION_SECONDS
    });

  } catch (error) {
    next(handleServerErrors(error, 500, `There was an error trying to change the password.`));
  }
};





const mockDB = async () => {
  const nums = [];
  for(let i=1; i<101; i++){
    nums.push(i);
  }

  for (num of nums) {
    await Employee.findOneAndRemove({email: num + '@emp.com'});
    const password = await bcrypt.hash('111', 12);
    await Employee.create({ firstName: 'e' + num,  lastName: 'e' + num, password: password, email: num + '@emp.com'});
  }

  for (num of nums) {
    await Company.findOneAndRemove({email: num + '@comp.com'});

    const password = await bcrypt.hash('111', 12);
    const company = await Company.create({ name: 'c' + num,  password: password, email: num + '@cmp.com'});

    let job = await Job.create({ title: 'c' + num, description: 'description c' + num + ' #1', company: company._id, date: new Date() });
    company.jobs.push(job._id);
    await company.save();

    job = await Job.create({ title: 'c' + num, description: 'description c' + num + ' #2', company: company._id, date: new Date() });
    company.jobs.push(job._id);
    await company.save();

    job = await Job.create({ title: 'c' + num + 'with req', description: 'description c' + num + ' with req',
                        requirements: [{requirement: 'req 1'}, {requirement: 'req 2'}], company: company._id, date: new Date()    });
    company.jobs.push(job._id);
    await company.save();
  }
}