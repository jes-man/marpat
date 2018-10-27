'use strict';

/* global describe it */

const { expect } = require('chai');
const { connect } = require('../index');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('Connect Capability', () => {
  it('should reject an unrecognized connection', function() {
    return expect(
      connect('FIREBASE://memory').catch(error => error)
    ).to.eventually.be.an('error');
  });
});
