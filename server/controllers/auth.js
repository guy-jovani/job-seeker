
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


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jobs.seeker.for.your.needs@gmail.com',
    pass: 'jobseekerjobseeker'
  }
});


/**
 * Creates a Jason Web Token, that expires in process.env.JWT_EXPIRATION seconds
 * with an inforamtion about the user id.
 * @param {string} userId - A user id. 
 * @return {string} - the JWT.
 */
getToken = (userId) => {
  const token = jwt.sign({
    userId: userId
  }, process.env.SECERT_TOKEN_KEY, { expiresIn: process.env.JWT_EXPIRATION });

  return token;
}


/**
 * Creates a user (Company or Employee) based on the email, password and name.
 * @param {string} email - the user email
 * @param {string} password - the user password
 * @param {string} name - the company name (null if its a Employee)
 * @return { [(Company | Employee), string] } - an array in which the first var is the user object, 
 *                                             and the second is a string representing its kind ("company" | "employee")
 */
createUserSignup = (email, password, name = null) => {
  let user, kind;
  if(name){
    user = new Company({ email: email, password: password, name: name });
    kind = "company";
  } else {
    user = new Employee({ email: email, password: password });
    kind = "employee";
  }
  return [user, kind];
};


/**
 * Signing a user up and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the signup succeeded
 *    {string} token - a JWT related to the user
 *    {string} expiresIn - the number of seconds untill the token expires
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
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    const companyValid = await checkCompanyUpdateSignupValidation(req);
    if(companyValid.type === 'failure'){
      return sendMessagesResponse(res, 422, companyValid.messages, 'failure');
    }
    const password = await bcrypt.hash(req.body.password, 12);
    let [user, kind] = createUserSignup(req.body.email, password, req.body.name);
    user = await user.save();

    const token = getToken(user._id);
    user = user.toObject();
    Reflect.deleteProperty(user, 'password');
    res.status(201).json({
      type: 'success',
      token,
      expiresIn: process.env.TOKEN_EXPIRATION_SECONDS,
      user,
      kind
    });
  } catch (error) {
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to signup."));
  }
};

const mockDB = async () => {
  const nums = [];
  for(let i=1; i<101; i++){
    nums.push(i);
  }

  // for (num of nums) {
  //   const password = await bcrypt.hash('111', 12);
  //   await Employee.create({ firstName: 'e' + num,  lastName: 'e' + num, password: password, email: num + '@emp.com'});
  // }

  for (num of nums) {
    const password = await bcrypt.hash('111', 12);
    const company = await Company.create({ name: 'c' + num,  password: password, email: num + '@comp.com'});

    await Job.create({ title: 'c' + num, description: 'description c' + num + ' #1', company: company._id, date: new Date() });
    await Job.create({ title: 'c' + num, description: 'description c' + num + ' #2', company: company._id, date: new Date() });
    await Job.create({ title: 'c' + num + 'with req', description: 'description c' + num + ' with req',
                        requirements: [{requirement: 'req 1'}, {requirement: 'req 2'}], company: company._id, date: new Date()    });
  }
}


/**
 * Get the logged user (Company or Employee).
 * @param {string} email - the email of the user.
 * @return { [(Company | Employee), string] } - an array in which the first var is the user object, 
 *           and the second is a string representing its kind ("company" | "employee").
 *      employee obj - with jobs array populated with the job info, and the job company name 
 *      company obj - with the jobs populated,
 *                    with applicants array populated with the employee info,
 *                    with the applicants jobs populatad with the job info 
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
                  '-__v -createdAt -updatedAt -resetPassToken -resetPassTokenExpiration'
                ).populate('jobs');
    user = await Company.populate(user, { path: 'applicants.employee', select: '-__v -password'});
    user = await Company.populate(user, { path: 'applicants.jobs.job', select: 'title'});
    kind = "company";
  }
  return [user, kind];
};

/**
 * login a user in and upon success sending a respond to the client with the following:
 *    {string} type - 'success' - meaning the signup succeeded
 *    {string} token - a JWT related to the user
 *    {string} expiresIn - the number of seconds untill the token expires
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
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    let [user, kind] = await getUserLogin(req.body.email, res);
    if(!user){ 
      return sendMessagesResponse(res, 401, ['The email and/or password are incorrect'], 'failure');
    }

    // await mockDB(); //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const verifiedPassword = await bcrypt.compare(req.body.password, user.password);
    if(!verifiedPassword){ 
      return sendMessagesResponse(res, 401, ['The email and/or password are incorrect.'], 'failure');
    }
    
    user = user.toObject();
    Reflect.deleteProperty(user, 'password');
    const token = getToken(user._id);
    res.status(200).json({
      type: 'success',
      token,
      expiresIn: process.env.TOKEN_EXPIRATION_SECONDS,
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
  try{
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
      user.resetPassTokenExpiration = Date.now() +  process.env.RESET_PASSWORD_TOKEN_EXPIRATION_MILI_SECONDS;
      await user.save();

      transporter.sendMail({
        from: 'shop@node-complete',
        to: req.body.email,
        subject: 'password reset',
        html: `<a href="${process.env.RESET_URL}${token}">reset password</a>`
      }, err => { if(err) console.log(err) }); 

      res.status(200).json({
        message: 'A reset email has been sent sucssesfully!',
        type: 'success'
      });
    });
  } catch (error) {
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to reset the password."));
  }
}

/**
 * Reseting the user password
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
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
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

