'use strict';

/* global describe before beforeEach afterEach after it */

const expect = require('chai').expect;
const connect = require('../index').connect;
const BaseDocument = require('../lib/base-document');
const isDocument = require('../lib/validate').isDocument;
const ValidationError = require('../lib/errors').ValidationError;
const { Data } = require('./data');
const validateId = require('./util').validateId;
const fail = require('./util').fail;
const expectError = require('./util').expectError;

describe('Base Document', function() {
  // TODO: Should probably use mock database client...
  const url = 'nedb://memory';
  //const url = 'mongodb://localhost/camo_test';
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
    database
      .dropDatabase()
      .then(function() {})
      .then(done, done);
  });

  it('should throw an error if the static documentClass is not defined', () => {
    class NewDocument extends BaseDocument {
      constructor() {
        super();
      }
    }

    expect(() => NewDocument.documentClass()).to.throw(
      'You must override documentClass (static).'
    );
  });
  it('should throw an error if the documentClass is not defined', () => {
    class TestDocument extends BaseDocument {
      constructor() {
        super();
      }
    }
    let testDocument = TestDocument.create({});
    expect(() => testDocument.documentClass()).to.throw(
      'You must override documentClass.'
    );
  });
});
