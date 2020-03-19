
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// const globalVars = require('../utils/globalVars');
const Employee = require('../models/employee');
const Company = require('../models/company');
const validation = require('../utils/validation');
const handleServerErrors = require('../utils/errorHandling').handleServerErrors
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse
const chackCompanyUpdateSignupValidation = require('../utils/shared').chackCompanyUpdateSignupValidation


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jobs.seeker.for.your.needs@gmail.com',
    pass: 'jobseekerjobseeker'
  }
});


getToken = (userId) => {
  const token = jwt.sign({
    userId: userId
  }, process.env.SECERT_TOKEN_KEY, { expiresIn: process.env.JWT_EXPIRATION });

  return token;
}

getUserSignup = (req, password) => {
  let user, kind;
  if(req.body.name){
    user = new Company({ email: req.body.email, password: password, name: req.body.name });
    kind = "company";
  } else {
    user = new Employee({ email: req.body.email, password: password });
    kind = "employee";
  }
  return [user, kind];
};

exports.signup = async (req, res, next) => {
  try {
    req.body.email = req.body.email ? req.body.email.toLowerCase() : null;
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    const companyValid = await chackCompanyUpdateSignupValidation(req);
    if(companyValid.type === 'failure'){
      return sendMessagesResponse(res, 422, companyValid.messages, 'failure');
    }
    const password = await bcrypt.hash(req.body.password, 12);
    let [user, kind] = getUserSignup(req, password);
    user = await user.save();

    const token = getToken(user._id);
    user = user.toObject();
    Reflect.deleteProperty(user, 'password');
    // Reflect.set(user, 'positions', user['positionsIds']);
    // Reflect.deleteProperty(user, 'positionsIds');
    res.status(201).json({
      message: 'Signed up successfully!',
      type: 'success',
      token,
      expiresIn: process.env.TOKEN_EXPIRATION_SECONDS,
      user,
      kind
    });
  } catch (error) {
    console.log(error);
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to signup."));
  }
};

getUserLogin = async (req, res) => {
  let user = await Employee.findOne({email: req.body.email}).select('-__v')
                            .populate({
                              path: 'positions.position', 
                              populate: { path: 'company', select: 'name' }
                            });
  let kind = "employee";
  if(!user) {
    user = await Company.findOne({email: req.body.email}).select(
                  '-__v -createdAt -updatedAt -resetPassToken -resetPassTokenExpiration'
                ).populate('positions');
    user = await Company.populate(user, { path: 'applicants.employee', select: '-__v -password'});
    user = await Company.populate(user, { path: 'applicants.positions.position', select: 'title'});
    kind = "company";
  }
  if(!user){ 
    sendMessagesResponse(res, 401, ['The email and/or password are incorrect'], 'failure');
  }
  return [user, kind];
};

exports.login = async (req, res, next) => {
  try {
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    let [user, kind] = await getUserLogin(req, res);
    if(!user) return;

    const verifiedPassword = await bcrypt.compare(req.body.password, user.password);
    if(!verifiedPassword){ 
      return sendMessagesResponse(res, 401, ['The email and/or password are incorrect'], 'failure');
    }
    
    user = user.toObject();
    Reflect.deleteProperty(user, 'password');
    // Reflect.set(user, 'positions', user['positionsIds']);
    // Reflect.deleteProperty(user, 'positionsIds');
    const token = getToken(user._id);
    res.status(200).json({
      message: 'Logged in successfully!',
      type: 'success',
      token,
      expiresIn: process.env.TOKEN_EXPIRATION_SECONDS,
      user,
      kind
    });
  } catch (error) {
    console.log(error);
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to login."));
  }
};


exports.resetPasswordEmail = async (req, res, next) => {
  try{
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        next(handleServerErrors(error, 500, "There was an unexpected error while trying to reset the password."));
      }
      const token = buffer.toString('hex');
      const user = await Employee.findOne({ email: req.body.email }) || 
                    await Company.findOne({ email: req.body.email });
      if (!user) {
        return sendMessagesResponse(res, 401, ['No account with that email found.'], 'failure');
      }   
      user.resetPassToken = token;
      user.resetPassTokenExpiration = Date.now() + 3600000;
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
    console.log(error)
    next(handleServerErrors(error, 500, "There was an unexpected error while trying to reset the password."));
  }
}


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

