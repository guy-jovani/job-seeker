

const mongoose = require('mongoose');
const errorHandling = require('../utils/errorHandling')
const Employee = require('../models/employee');
const Company = require('../models/company');

const dbMap = {
  employee: async (regexp, usedIds) => {
    const employees = await Employee.aggregate([
      { $match: { _id: { $nin: usedIds } } },
      {
        $addFields: {
          firstName: { $ifNull: ['$firstName', ''] },
          lastName: { $ifNull: ['$lastName', ''] }
        }
      },
      {
        $project: {
          fullName: {
            $trim: {
              input: {
                $concat: ['$firstName', ' ', '$lastName']
              }
            }
          }
        }
      },
      {
        $match: { fullName: { $regex: regexp } }
      },
      {
        $limit: +process.env.DB_LIMIT_RES
      }
    ]);
    return employees.map(emp => { return { ...emp, type: 'Employee' } });
  },
  company: async (regexp, usedIds) => {
    const companies = await Company.aggregate([
      { $match: { _id: { $nin: usedIds } } },
      {
        $match: { name: { $regex: regexp } }
      },
      {
        $project: {
          fullName: '$name'
        }
      },
      {
        $limit: +process.env.DB_LIMIT_RES
      }
    ]);
    return companies.map(comp => { return { ...comp, type: 'Company' } });
  }
};


exports.search = async (req, res, next) => {
  try {
    let resultList = [];
    const regexp = new RegExp('^' + req.query.fullName + '.*');
    const usedIds = req.query.usedIds.split(',').map(_id => {
      return mongoose.Types.ObjectId(_id);
    });
    const searchDB = req.query.searchDB.split(',');
    for(db of searchDB){
      if(resultList.length < process.env.DB_LIMIT_RES){
        resultList.push(...await dbMap[db](regexp, usedIds));
      }
    }
    res.status(200).json({
      type: 'success',
      resultList
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, 'There was an error with the search operation'));
  }
};



