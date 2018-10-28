'use strict';

/* global describe before beforeEach afterEach after it */

const { expect } = require('chai');
const { connect, Document } = require('../index');
const { validateId } = require('./util');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

chai.use(chaiAsPromised);

describe('NeDbClient', function() {
  const url = 'nedb://data';
  let database;
  before(function(done) {
    connect(url)
      .then(function(db) {
        database = db;
        return database.dropDatabase();
      })
      .then(function() {
        return done();
      });
  });
  it('should create a file based store', done => {
    class Person extends Document {
      constructor() {
        super();
        this.schema({
          name: {
            type: String
          }
        });
      }
    }
    let person = Person.create({ name: 'Han Solo' });
    person.save().then(person => {
      expect(person).to.be.an('object');
      done();
    });
  });
  it('should return collections as a driver', done => {
    class Person extends Document {
      constructor() {
        super();
        this.schema({
          name: {
            type: String
          }
        });
      }
    }
    let person = Person.create({ name: 'Han Solo' });
    expect(global.CLIENT.driver()).to.be.an('object');
    done();
  });
  it('should create indexes without options', done => {
    class Person extends Document {
      constructor() {
        super();
        this.schema({
          name: {
            type: String
          }
        });
      }
    }
    let person = Person.create({ name: 'Han Solo' });
    person.save().then(person => {
      expect(global.CLIENT.createIndex('Persons', 'name')).to.equal(undefined);
      done();
    });
  });
  it('should reject a count with an error', done => {
    class Person extends Document {
      constructor() {
        super();
        this.schema({
          name: {
            type: String
          }
        });
      }
    }
    expect(Person.count().catch(error => error)).to.eventually.be.an('object');
    done();
  });
  it('should drop databases when used on the File System', () => {
    class Person extends Document {
      constructor() {
        super();
        this.schema({
          name: {
            type: String
          }
        });
      }
    }
    let person = Person.create({ name: 'Han Solo' });

    expect(
      person.save().then(person => database.dropDatabase())
    ).to.eventually.equal(undefined);
  });
  it('should not delete files if there are no collections', () => {
    expect(database.dropDatabase()).to.eventually.equal(undefined);
  });
});

describe('NeDbClient', function() {
  const url = 'nedb://memory';
  let database = null;

  before(function(done) {
    connect(url)
      .then(function(db) {
        database = db;
        return database.dropDatabase();
      })
      .then(function() {
        return done();
      });
  });

  beforeEach(function(done) {
    done();
  });

  afterEach(function(done) {
    database
      .dropDatabase()
      .then(function() {})
      .then(done, done);
  });

  after(function(done) {
    done();
  });

  describe('id', function() {
    it('should allow custom _id values', function(done) {
      class School extends Document {
        constructor() {
          super();

          this.name = String;
        }
      }

      let school = School.create();
      school._id = '1234567890abcdef';
      school.name = 'South Park Elementary';

      school
        .save()
        .then(function() {
          validateId(school);
          expect(school._id).to.be.equal('1234567890abcdef');
          return School.findOne();
        })
        .then(function(s) {
          validateId(s);
          expect(s._id).to.be.equal('1234567890abcdef');
        })
        .then(done, done);
    });
  });

  describe('indexes', function() {
    it('should reject documents with duplicate values in unique-indexed fields', function(done) {
      class User extends Document {
        constructor() {
          super();

          this.schema({
            name: String,
            email: {
              type: String,
              unique: true
            }
          });
        }
      }

      let user1 = User.create();
      user1.name = 'Bill';
      user1.email = 'billy@example.com';

      let user2 = User.create();
      user1.name = 'Billy';
      user2.email = 'billy@example.com';

      Promise.all([user1.save(), user2.save()])
        .then(function() {
          expect.fail(null, Error, 'Expected error, but got none.');
        })
        .catch(function(error) {
          expect(error.errorType).to.be.equal('uniqueViolated');
        })
        .then(done, done);
    });

    it('should accept documents with duplicate values in non-unique-indexed fields', function(done) {
      class User extends Document {
        constructor() {
          super();

          this.schema({
            name: String,
            email: {
              type: String,
              unique: false
            }
          });
        }
      }

      let user1 = User.create();
      user1.name = 'Bill';
      user1.email = 'billy@example.com';

      let user2 = User.create();
      user1.name = 'Billy';
      user2.email = 'billy@example.com';

      Promise.all([user1.save(), user2.save()])
        .then(function() {
          validateId(user1);
          validateId(user2);
          expect(user1.email).to.be.equal('billy@example.com');
          expect(user2.email).to.be.equal('billy@example.com');
        })
        .then(done, done);
    });
  });
});
