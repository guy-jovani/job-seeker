const mongoose = require('mongoose');
const errorHandling = require('../utils/errorHandling');
const Company = require('../models/company');
const Employee = require('../models/employee');
const Job = require('../models/job');

const validation = require('../utils/validation');
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse;

const dbMap = {
  employee: async (query, usedIds, distinct = null) => {
    let employees;
    if (distinct === 'true') {
      const field = Object.keys(query[0])[0];
      const distinctQuery = {
        [field]: { $nin: usedIds },
        $or: query
      };
      employees = await Employee.aggregate([
        { $unwind: '$' + field.split('.')[0] },
        {
          $project: {
            [field]: 1
          }
        },
        { $match: distinctQuery },
        {
          $group: {
            _id: '$' + field
          }
        },
        { $sort: { _id: 1 } },
        { $limit: +process.env.DB_LIMIT_RES },
        {
          $project: {
            [field]: '$_id'
          }
        }
      ]);
      return employees
        .map(emp => {
          return { [field]: emp._id, type: 'Employee' };
        })
        .slice(0, 10);
    } else {
      employees = await Employee.aggregate([
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
        { $limit: +process.env.DB_LIMIT_RES }
      ]);
      return employees.map(emp => {
        return { ...emp, type: 'Employee' };
      });
    }
  },
  company: async (query, usedIds, distinct = null) => {
    let companies;
    if (distinct === 'true') {
      const field = Object.keys(query[0])[0];
      const distinctQuery = {
        [field]: { $nin: usedIds },
        $or: query
      };
     
      if (field === 'applicants.jobs.job.title') {
        companies = await Company.aggregate([
          {
            $lookup: {
              from: 'jobs',
              localField: 'applicants.jobs.job',
              foreignField: '_id',
              as: 'applicants.jobs.job'
            }
          },
          { $unwind: '$applicants.jobs.job' },
          { $match: distinctQuery },
          {
            $project: {
              title: {
                $trim: {
                  input: {
                    $concat: ['$applicants.jobs.job.title']
                  }
                }
              }
            }
          },
          {
            $group: {
              _id: '$' + 'title'
            }
          },
          { $sort: { _id: 1 } },
          { $limit: +process.env.DB_LIMIT_RES },
        ]);
      } else if (field === 'applicants.employee.name') {
        companies = await Company.aggregate([
          {
            $lookup: {
              from: 'employees',
              localField: 'applicants.employee',
              foreignField: '_id',
              as: 'applicants.employee'
            }
          },
          { $unwind: '$applicants.employee' },
          { $addFields: {
              firstName: { $ifNull: ['$applicants.employee.firstName', ''] },
              lastName: { $ifNull: ['$applicants.employee.lastName', ''] }
            }
          },
          { $project: {
            'applicants.employee.name': {
                $trim: {
                  input: {
                    $concat: ['$firstName', ' ', '$lastName']
                  }
                }
              }
            }
          },
          { $match: distinctQuery },
          { $group: {
              _id: '$' + 'applicants.employee.name'
            }
          },
          { $sort: { _id: 1 } },
          { $limit: +process.env.DB_LIMIT_RES },
        ]);
      } else if (field === 'jobs.title') {
        companies = await Company.aggregate([
          {
            $lookup: {
              from: 'jobs',
              localField: 'jobs',
              foreignField: '_id',
              as: 'jobs'
            }
          },
          { $unwind: '$' + 'jobs' },
          {
            $project: {
              jobs: 1
            }
          },
          { $match: distinctQuery },
          {
            $project: {
              'jobs.title': {
                $trim: {
                  input: {
                    $concat: ['$jobs.title']
                  }
                }
              }
            }
          },
          {
            $group: {
              _id: '$' + field
            }
          },
          { $sort: { _id: 1 } },
          { $limit: +process.env.DB_LIMIT_RES },
        ]);
      } else {
        companies = await Company.aggregate([
          { $match: distinctQuery },
          { $limit: +process.env.DB_LIMIT_RES },
          { $group: { _id: field } }
        ]);
      }
      return companies.map(cmp => { return { [field]: cmp._id, type: 'Company' }; });
    } else {
      companies = await Company.aggregate([
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
      return companies.map(comp => {
        return { ...comp, type: 'Company' };
      });
    }
  },
  job: async (query, usedIds, distinct = null) => {
    let jobs;
    if (distinct === 'true') {
      const field = Object.keys(query[0])[0];
      const distinctQuery = {
        [field]: { $nin: usedIds },
        $or: query
      };
      jobs = await Job.aggregate([
        { $unwind: '$' + field.split('.')[0] },
        {
          $project: {
            [field]: 1
          }
        },
        { $match: distinctQuery },
        {
          $group: {
            _id: '$' + field
          }
        },
        { $sort: { _id: 1 } },
        { $limit: +process.env.DB_LIMIT_RES },
        {
          $project: {
            [field]: '$_id'
          }
        }
      ]);
      return jobs
        .map(job => {
          return { [field]: job._id, type: 'Job' };
        })
        .slice(0, 10);
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
      return jobs.map(job => {
        return { ...job, type: 'Job' };
      });
    }
  }
};

exports.autoComplete = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if (routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    let usedIds = [];
    if (req.query.usedIds) {
      usedIds = req.query.usedIds.split(process.env.SPLIT_SEARCH_QUERY);
      usedIds =
        req.query.distinct === 'true'
          ? usedIds
          : usedIds.map(_id => {
              return mongoose.Types.ObjectId(_id);
            });
    }

    const regex = new RegExp('^' + req.query.query + '.*', 'i');
    const query = [];
    req.query.searchFields
      .split(process.env.SPLIT_SEARCH_QUERY)
      .forEach(field => {
        field = field.trim();
        if (field) {
          query.push({ [field]: { $regex: regex } });
        }
      });
    let resultList = [];
    const searchDBs = req.query.searchDBs.split(process.env.SPLIT_SEARCH_QUERY);
    for (db of searchDBs) {
      if (dbMap[db] && resultList.length < process.env.DB_LIMIT_RES) {
        resultList.push(
          ...(await dbMap[db](query, usedIds, req.query.distinct))
        );
      }
    }
    res.status(200).json({
      type: 'success',
      resultList
    });
  } catch (error) {
    next(
      errorHandling.handleServerErrors(
        error,
        500,
        'There was an error with the search operation.'
      )
    );
  }
};
