const expect = require('chai').expect;

const sinon = require('sinon');
const mongoose = require('mongoose');

const Employee = require('../models/employee');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const updateEmployee = require('../controllers/employees').updateEmployee;

const firstMail = 'test1@test1.com';
const secondMail = 'test2@test2.com';
const nonExistMail = "test3@test3.com";
const firstId = '5e03f57a210c6d74cc03ca6e';
const secondId = '5c0f66b979af55031b34728a';
const nonExistId = mongoose.Schema.Types.ObjectId("eerfer");


describe('Employee controller', function() {
  before(function(done) {
    sinon.stub(validation, 'employeeEmailExistValidation');
    sinon.stub(errorHandling, 'handleServerErrors');
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
          _id: secondId,
          companiesCreated: []
        });
        employee1.save();
        return employee2.save();
      })
      .then(() => {
        done();
      });
  });

  after(function(done) {
    validation.employeeEmailExistValidation.restore();
    errorHandling.handleServerErrors.restore();
    Employee.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
  describe('updateEmployee', function(){   
    it('should call handleValidationRoutesErrors', function() {
      sinon.stub(validation, 'handleValidationRoutesErrors');
      updateEmployee({}, {}, () => {});
      expect(validation.handleValidationRoutesErrors.called).to.be.true;
      validation.handleValidationRoutesErrors.restore();
    });
  
    it('should call employeeEmailExistValidation', function(done) {
      const req = {
        body: {
          newEmployee: {
            email: firstMail,
            _id: firstId
          }
        }
      }
      updateEmployee(req, {}, () => {}).then(answer => {
        expect(validation.employeeEmailExistValidation.called).to.be.true;
        done();
      });
    });

    it('try to update non exisiting employee, should throw an error', function(done) {
      const req = {
        body: {
          newEmployee: {
            email: firstMail,
            _id: nonExistId
          }
        }
      }
      updateEmployee(req, {}, () => {}).then(() => {
        expect(errorHandling.handleServerErrors.called).to.be.true;
        done();
      })
    });

    it('try to update with no optional fields, should update and return res.status.json', function(done) {
      const req = {
        body: {
          newEmployee: {
            email: firstMail,
            _id: firstId
          }
        }
      }
      const res = {
        json: function(obj) { this.data = obj; },
        status: function(code) {
          this.statusCode = code;
          return this;
        }
      };
      updateEmployee(req, res, () => {})
        .then(() => {
          expect(res.statusCode).to.be.equal(201);
          expect(res.data).to.have.property('message');
          expect(res.data).to.have.property('type');
          expect(res.data).to.have.property('employee');
          expect(res.data.employee.__v).not.to.exist;
          expect(res.data.employee.password).not.to.exist;
          expect(res.data.message).to.equal('employee updated successfully!');
          expect(res.data.type).to.equal('success');
          return Employee.findById(firstId);
        }).then(emp => {
          expect(emp._id).to.exist;
          expect(emp.password).to.exist;
          expect(emp.email).to.exist;
          expect(emp.__v).to.exist;
          expect(emp.firstName).to.not.exist;
          expect(emp.lastName).to.not.exist;
          done();
        });
    });

    it('try to update with one optional field, should update and return res.status.json', function(done) {
      const req = {
        body: {
          newEmployee: {
            email: firstMail,
            _id: firstId,
            firstName: "donald"
          }
        }
      }
      const res = {
        json: function(obj) { this.data = obj; },
        status: function(code) {
          this.statusCode = code;
          return this;
        }
      };
      updateEmployee(req, res, () => {})
        .then(() => {
          expect(res.statusCode).to.be.equal(201);
          expect(res.data).to.have.property('message');
          expect(res.data).to.have.property('type');
          expect(res.data).to.have.property('employee');
          expect(res.data.employee.__v).not.to.exist;
          expect(res.data.employee.password).not.to.exist;
          expect(res.data.message).to.equal('employee updated successfully!');
          expect(res.data.type).to.equal('success');
          return Employee.findById(firstId);
        }).then(emp => {
          expect(emp._id).to.exist;
          expect(emp.password).to.exist;
          expect(emp.email).to.exist;
          expect(emp.__v).to.exist;
          expect(emp.firstName).to.exist;
          expect(emp.firstName).to.equal('donald');
          expect(emp.lastName).to.not.exist;
          done();
        });
    });

    it('try to update with all optional fields, should update and return res.status.json', function(done) {
      const req = {
        body: {
          newEmployee: {
            email: secondMail,
            _id: secondId,
            firstName: "donald",
            lastName: "trump"
          }
        }
      }
      const res = {
        json: function(obj) { this.data = obj; },
        status: function(code) {
          this.statusCode = code;
          return this;
        }
      };
      updateEmployee(req, res, () => {})
        .then(() => {
          expect(res.statusCode).to.be.equal(201);
          expect(res.data).to.have.property('message');
          expect(res.data).to.have.property('type');
          expect(res.data).to.have.property('employee');
          expect(res.data.employee.__v).not.to.exist;
          expect(res.data.employee.password).not.to.exist;
          expect(res.data.employee).to.have.property('companiesCreated');
          expect(res.data.message).to.equal('employee updated successfully!');
          expect(res.data.type).to.equal('success');
          return Employee.findById(secondId);
        }).then(emp => {
          expect(emp._id).to.exist;
          expect(emp.password).to.exist;
          expect(emp.email).to.exist;
          expect(emp.companiesCreated).to.exist;
          expect(emp.__v).to.exist;
          expect(emp.firstName).to.exist;
          expect(emp.firstName).to.equal('donald');
          expect(emp.lastName).to.exist;
          expect(emp.lastName).to.equal('trump');
          done();
        });
    });
  })
});
