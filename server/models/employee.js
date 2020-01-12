
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: false
    },
    lastName: {
      type: String,
      required: false
    },
    companiesCreated: [{
      type: Schema.Types.ObjectId,
      ref: 'company',
    }]
  }
);

module.exports = mongoose.model('Employee', employeeSchema);




// const employeeSchema = new Schema(
//   {
//     position: {
//       type: String,
//       required: true
//     },
//     company: {
//       type: String,
//       required: true
//     },
//     team: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: 'Employee',
//         required: false
//       }
//     ],
//     directBoss: {
      // type: Schema.Types.ObjectId,
      // ref: 'Employee',
      // required: false
//     },
//     profilePicUrl: {
//       type: String,
//       required: false
//     }
//   }
// );