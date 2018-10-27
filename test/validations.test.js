'use strict';

/* global describe it */

const { expect } = require('chai');
const { isType, isSupportedType } = require('../lib/validate');

describe('Validation Utility Tests', () => {
  it('should throw an error if the type is unsupported', () =>
    expect(() => isType({}, null)).to.throw());

  describe('Type Detection', () => {
    let array = ['one', 'two', 'three'];
    it('should detect Arrays', () => expect(isType(array, Array)).to.be.true);
    it('should reject undefined', () =>
      expect(() => isType(undefined, undefined)).to.throw);
  });

  describe('Supported Type Detection', () => {
    it('should support strings', () =>
      expect(isSupportedType(String)).to.be.true);
    it('should support numbers', () =>
      expect(isSupportedType(Number)).to.be.true);
    it('should support object', () =>
      expect(isSupportedType(Object)).to.be.true);
    it('should support Arrays', () =>
      expect(isSupportedType(Array)).to.be.true);
    it('should support booleans', () =>
      expect(isSupportedType(Boolean)).to.be.true);
  });
});
