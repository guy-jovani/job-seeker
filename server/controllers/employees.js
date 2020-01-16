

const Employee = require('../models/employee');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling')



// exports.getEmployee = async (req, res, next) => {
//   try {
//     const employee = await Employee.findOne({_id: req.query._id}).select('-password -__v');
//     res.status(200).json({
//       type: 'success',
//       employee
//     });
//   } catch (error) {
//     next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the employee"));
//   }
// };



// exports.postEmployee = async (req, res, next) => {
//   try {
//     const emailExist = await validation.employeeEmailExistValidation(req.body.email, res);
//     if(!emailExist){
//       const employee = new Employee({ name: req.body.name, email: req.body.email });
//       await employee.save();
//       res.status(200).json({
//         message: 'employee created successfully!',
//         type: 'success',
//         id: employee._id,
//         firstName: employee.firstName,
//         lastName: employee.lastName,
//         email: employee.email,
//       });
//     }
//   } catch (error) {
//     next(errorHandling.handleServerErrors(error, 500, "there was an error creating the employee"));
//   }
// };
//
// exports.deleteEmployee = async (req, res, next) => {
//   try {
//     await Employee.findByIdAndDelete(req.body.id);
//     res.status(200).json({
//       message: 'employee deleted successfully!',
//       type: 'success',
//       id: req.body.id
//     });
//   } catch (error) {
//     next(errorHandling.handleServerErrors(error, 500, "there was an error deleting the employee"));
//   }
// };

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({_id: { $ne: req.query._id }}).select('-password -__v');
    res.status(200).json({
      type: 'success',
      employees
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the employees"));
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;

    const emailExist = await validation.employeeEmailExistValidation(
                    req.body.newEmployee.email, res, req.body.newEmployee._id);
    if(emailExist){ return ; }
    const employeeSchemaKeys = Object.keys(Employee.schema.paths);
    // remove non editable (via update employee) keys
    employeeSchemaKeys.splice(employeeSchemaKeys.indexOf('password'), 1);
    // employeeSchemaKeys.splice(employeeSchemaKeys.indexOf('companiesCreated'), 1);
    employeeSchemaKeys.splice(employeeSchemaKeys.indexOf('__v'), 1);

    // get an object with keys to delete from the employee document (all keys that are null)
    const reqBodyKeys = Object.keys(req.body.newEmployee);
    let nullKeys = employeeSchemaKeys.filter(key => !reqBodyKeys.includes(key));
    nullKeys = nullKeys.reduce((obj, key) => (obj[key]='',  obj), {});

    let bulkArr = [];
    if(req.body.newEmployee){ // check if needed the if check
      bulkArr.push({ updateOne: {
        filter: { _id: req.body.newEmployee._id },
        update: { $set: { ...req.body.newEmployee } }
      }})
    }
    if(Object.entries(nullKeys).length) {
      bulkArr.push({updateOne: {
        filter: { _id: req.body.newEmployee._id },
        update: { $unset: { ...nullKeys } } 
      }})
    }
    const bulkRes = await Employee.bulkWrite(bulkArr);
    if(!bulkRes.result.nMatched){
      throw new Error("trying to update a non exisitng employee");
    }
    const updatedEmployee = await Employee.findById(req.body.newEmployee._id).select('-__v -password');

    res.status(201).json({
      message: 'employee updated successfully!',
      type: 'success',
      employee: updatedEmployee
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error updating the employee"));
  }
};
