const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const mongoose = require('mongoose');
const employeeEmailExistValidation = require('../utils/validation').employeeEmailExistValidation;
const Employee = require('../models/employee');


const firstMail = 'test1@test1.com';
const secondMail = 'test2@test2.com';
const firstId = '5e03f57a210c6d74cc03ca6e';
const secondId = '5c0f66b979af55031b34728a';

describe('Validation utils', function() {
  before(function(done) {
    mongoose
      .connect(
        'mongodb://guy:6768654@cluster0-shard-00-00-i3bvx.mongodb.net:27017,cluster0-shard-00-01-i3bvx.mongodb.net:27017,cluster0-shard-00-02-i3bvx.mongodb.net:27017/tests-for-company?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',
        { useNewUrlParser: true, useUnifiedTopology: true }
      )
      .then(result => {
        const employee1 = new Employee({
          email: firstMail,
          password: 'tester',
          _id: firstId
        });
        const employee2 = new Employee({
          email: secondMail,
          password: 'tester',
          _id: secondId
        });
        employee1.save();
        return employee2.save();
      })
      .then(() => {
        done();
      });
  });

  after(function(done) {
    Employee.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
  
  describe('employeeEmailExistValidation', function(){
    it('check if the email belongs to a different employee, should return true and should send a 422 res with errors array of msg and type failure', function(done) {
      const res = {
        json: function(obj) {
          this.data = obj;
        },
        status: function(code) {
          this.statusCode = code;
          return this;
        }
      };
  
      employeeEmailExistValidation(firstMail, res).then(answer => {
        expect(answer).to.be.equal(true);
        expect(res.statusCode).to.be.equal(422);
        expect(res.data.errors).to.exist;
        expect(res.data.errors[0].msg).to.exist;

        expect(res.data.errors[0].msg).to.equal(
          'You can not use this email address, please provide a different one'
        );
        expect(res.data.type).to.be.equal('failure');
        done();
      });
    });
  
    it('check if email exist on the same employee, should return false', function(done) {
      employeeEmailExistValidation(firstMail, {}, firstId).then(answer => {
        expect(answer).to.be.equal(false);
        done();
      });
    });
  });
});
