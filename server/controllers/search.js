

const mongoose = require('mongoose');
const errorHandling = require('../utils/errorHandling');
const Company = require('../models/company');
const Employee = require('../models/employee');
const Job = require('../models/job');

const validation = require('../utils/validation');
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse;

const dbMap = {
  employee: async (regexp, usedIds, query, distinct = null) => {
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
          name: {
            $trim: {
              input: {
                $concat: ['$firstName', ' ', '$lastName']
              }
            }
          },
          email: 1
        }
      },
      {
        $match: {
          $or: query
        }
      },
      {
        $limit: +process.env.DB_LIMIT_RES
      }
    ]);
    return employees.map(emp => { return { ...emp, type: 'Employee' } });
  },
  company: async (regexp, usedIds, query, distinct = null) => {
    const companies = await Company.aggregate([
      { $match: { _id: { $nin: usedIds } } },
      {
        $project: {
          name: 1,
          email: 1
        }
      },
      {
        $match: {
          $or: query
        }
      },
      {
        $limit: +process.env.DB_LIMIT_RES
      }
    ]);
    return companies.map(comp => { return { ...comp, type: 'Company' } });
  },
  job: async (regexp, usedIds, query, distinct = null) => {
    let jobs;
    if(distinct) {
      const field = Object.keys(query[0])[0];
      const distinctQuery = {
        [field]: { $nin: usedIds },
        $or: query
      };
      jobs = await Job.distinct(field, distinctQuery);
        return jobs.map(job => { return { _id: job, [field]: job, type: 'Job' } }).slice(0, 10);
    } else {
      jobs = await Job.aggregate([
        { $match: { _id: { $nin: usedIds } } },
        {
          $project: {
            title: 1
          }
        },
        {
          $match: {
            $or: query
          }
        },
        {
          $limit: +process.env.DB_LIMIT_RES
        }
      ]);
      return jobs.map(job => { return { ...job, type: 'Job' } });
    }
  }
};


exports.search = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    } 
    
    let usedIds = [];
    if(req.query.usedIds) {
      usedIds = req.query.usedIds.split(process.env.SPLIT_SEARCH_QUERY);
      usedIds = req.query.distinct === 'true' ? usedIds : usedIds.map(_id => {
        return mongoose.Types.ObjectId(_id);
      });
    }
    
    const query = [];
    const regexp = new RegExp('^' + req.query.query + '.*');
    req.query.searchFields.split(process.env.SPLIT_SEARCH_QUERY).forEach(field => {
      if (field) {
        query.push({ [field]: { $regex : regexp } })
      }
    });
    
    let resultList = [];
    const searchDBs = req.query.searchDBs.split(process.env.SPLIT_SEARCH_QUERY);
    for(db of searchDBs){
      if(dbMap[db] && resultList.length < process.env.DB_LIMIT_RES){
        resultList.push(...await dbMap[db](regexp, usedIds, query, req.query.distinct));
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



