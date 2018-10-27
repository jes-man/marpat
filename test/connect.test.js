'use strict';

/* global describe it */

const { expect } = require('chai');
const { connect } = require('../index');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('Connect Capability', () => {
  it('should connect to an nedb connection', function() {
    return expect(connect('nedb://memory'))
      .to.eventually.be.an('object')
      .with.all.keys('_collections', '_options', '_path', '_url');
  });
  it('should connect to a mongodb connection', function() {
    return expect(connect('mongodb://127.0.0.1:27017/marpat'))
      .to.eventually.be.an('object')
      .with.all.keys('_mongo', '_url');
  });
  it('should reject an unrecognized connection', function() {
    return expect(
      connect('FIREBASE://memory').catch(error => error)
    ).to.eventually.be.an('error');
  });
});
