
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const globalVars = require('../utils/globalVars');
const Employee = require('../models/employee');
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
    const emailExist = await validation.employeeEmailExistValidation(req.body.email, res);
    if(emailExist){ return; }

    const password = await bcrypt.hash(req.body.password, 12);
    const employee = new Employee({ email: req.body.email, password: password });

    await employee.save();

    const token = await getToken();

    res.status(200).json({
      message: 'employee signed up successfully!',
      type: 'success',
      token: token,
      employee
    });
  } catch (error) {
    next(handleServerErrors(error, 500, "there was an unexpected error while trying to signup"));
  }
};

loginEmailPassIncorrect = (res) => {
  res.status(401).json({
    errors: [{
      msg: 'The email and/or password are incorrect'
    }],
    type: 'failure'
  });
}

exports.login = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({email: req.body.email}).select('-__v');
    if(!employee){ 
      return loginEmailPassIncorrect(res);
    }
    const verifiedPassword = await bcrypt.compare(req.body.password, employee.password);
    if(!verifiedPassword){ 
      return loginEmailPassIncorrect(res);
    }

    const token = await getToken();
    res.status(200).json({
      message: 'employee logged in successfully!',
      type: 'success',
      token: token,
      employee
    });
  } catch (error) {
    console.log(error)
    next(handleServerErrors(error, 500, "there was an unexpected error while trying to login"));
  }
};







