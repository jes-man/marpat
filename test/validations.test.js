'use strict';

/* global describe before beforeEach afterEach it */

const { expect } = require('chai');
const { connect } = require('../index');
const { isType } = require('../lib/validate');
const { EmbeddedData } = require('./data');

describe('Validation Utility Tests', () => {
  it('should throw an error if the type is unsupported', () =>
    expect(() => isType({}, null)).to.throw());

  describe('Type Detection', () => {
    let array = ['one', 'two', 'three'];
    it('should detect Arrays', () => expect(isType(array, Array)).to.be.true);
  });


});
