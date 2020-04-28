
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    website: {
      type: String,
      required: false
    },
    password: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    profileImagePath: {
      type: String,
      required: false
    },
    imagesPath: [{
      type: String,
      required: false
    }],
    jobs: [{
      type: Schema.Types.ObjectId, 
      ref: 'Job',
      require: false
    }],
    applicants: [{
      jobs: [{
        job: {
          type: Schema.Types.ObjectId, 
          ref: 'Job',
          require: false
        },
        status: {
          type: String,
          required: true,
          enum: ['applied', 'rejected', 'accepted']
        },
        date: { 
          type: Date,
          required: true
        }
      }],
      employee: {
        type: Schema.Types.ObjectId, 
        ref: 'Employee',
        required: true
      },
    }],
    resetPassToken: {
      type: String,
      required: false
    },
    resetPassTokenExpiration: {
      type: Date,
      required: false
    },
    refreshToken: {
      type: String,
      required: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);





// const companies = await Company.aggregate([
//   { $match: { _id: { $ne: mongoose.Types.ObjectId(req.query._id) } } },
//   { $skip: skippedDocuments(req.query.page) },
//   { $limit: +process.env.DOCS_PER_PAGE },
//   { $project: { jobs: 0, createdAt: 0, updatedAt: 0, __v: 0, password: 0, applicants: 0, refreshToken: 0 } },
//   { $lookup: {
//     from: "jobs",
//     let: { companyId: "$_id" },
//     pipeline: [
//       { $match: { $expr: { $eq: [ "$company", "$$companyId" ] } } },
//       { $lookup: {
//         from: "companies",
//         localField: "company",
//         foreignField: "_id",
//         as: "company" }
//       },
//       { $unwind: "$company" },
//       { $project: {
//         "__v": 0,
//         "company.jobs": 0,
//         "company.refreshToken": 0,
//         "company.applicants": 0,
//         "company.imagesPath": 0,
//         "company.profileImagePath": 0,
//         "company.password": 0,
//         "company.createdAt": 0,
//         "company.website": 0,
//         "company.updatedAt": 0,
//         "company.description": 0,
//         "company.__v": 0,
//         "company.email": 0, }
//       }
//     ],
//     as: "jobs" }
//   }
// ]);