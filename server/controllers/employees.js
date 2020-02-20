

const Employee = require('../models/employee');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling')
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;


exports.fetchSingle = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.query._id).select('_id email firstName lastName');
    res.status(200).json({
      type: 'success',
      employee
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the employee"));
  }
};

exports.fetchAll = async (req, res, next) => {
  try {
    const employees = await Employee.find({_id: { $ne: req.query._id }}).select('_id email firstName lastName');
    res.status(200).json({
      type: 'success',
      employees
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the employees"));
  }
};


const getUpdateQuery = async (req) => {
  const employeeRemovableKeys = ['firstName', 'lastName']; 
  const nullKeys = getNullKeysForUpdate(req, employeeRemovableKeys);
  return await getBulkArrayForUpdate(req, nullKeys);
};

exports.updateEmployee = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;
    if(await validation.userEmailExistValidation(req.body.email, res, req.body._id)) return; 
    
    const bulkRes = await Employee.bulkWrite(await getUpdateQuery(req));
    if(!bulkRes.result.nMatched){
      throw new Error("trying to update a non exisitng employee");
    }
    let updatedEmployee = await Employee.findById(req.body._id).select(
        '-__v -password -resetPassToken -resetPassTokenExpiration').populate('positionsIds');

    updatedEmployee = updatedEmployee.toObject();
    Reflect.set(updatedEmployee, 'positions', updatedEmployee['positionsIds']);
    Reflect.deleteProperty(updatedEmployee, 'positionsIds');

    res.status(201).json({
      message: 'employee updated successfully!',
      type: 'success',
      employee: updatedEmployee
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error updating the employee"));
  }
};



































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