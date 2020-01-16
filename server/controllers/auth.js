
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const globalVars = require('../utils/globalVars');
const Employee = require('../models/employee');
const Company = require('../models/company');
const validation = require('../utils/validation');
const handleServerErrors = require('../utils/errorHandling').handleServerErrors

const handleValidationRoutesErrors = require('../utils/validation').handleValidationRoutesErrors;


getToken = async (employeeID) => {
  const token = await jwt.sign({
    employeeID: employeeID
  }, globalVars.SECERT_TOKEN_KEY, { expiresIn: globalVars.JWT_EXPIRATION });

  return token;
}

exports.signup = async (req, res, next) => {
  try {
    if(handleValidationRoutesErrors(req, res)) return;
    const emailExist = await validation.userEmailExistValidation(req.body.email, res);
    if(emailExist){ return; }

    const password = await bcrypt.hash(req.body.password, 12);
    let user;
    if(req.body.name){
      user = new Company({ email: req.body.email, password: password, name: req.body.name });
    } else {
      user = new Employee({ email: req.body.email, password: password });
    }

    await user.save();

    const token = await getToken();

    res.status(200).json({
      message: 'Signed up successfully!',
      type: 'success',
      token: token,
      user
    });
  } catch (error) {
    next(handleServerErrors(error, 500, "there was an unexpected error while trying to signup"));
  }
};

loginEmailPassIncorrectMessage = (res) => {
  res.status(401).json({
    errors: [{
      msg: 'The email and/or password are incorrect'
    }],
    type: 'failure'
  });
}

exports.login = async (req, res, next) => {
  try {
    let user = await Employee.findOne({email: req.body.email}).select('-__v');
    if(!user) user = await Company.findOne({email: req.body.email}).select('-__v -createdAt -updatedAt');
    if(!user){ 
      return loginEmailPassIncorrectMessage(res);
    }
    const verifiedPassword = await bcrypt.compare(req.body.password, user.password);
    if(!verifiedPassword){ 
      return loginEmailPassIncorrectMessage(res);
    }
    user = user.toObject()
    delete user.password;
    const token = await getToken();
    res.status(200).json({
      message: 'Logged in successfully!',
      type: 'success',
      token: token,
      user
    });
  } catch (error) {
    console.log(error)
    next(handleServerErrors(error, 500, "there was an unexpected error while trying to login"));
  }
};







