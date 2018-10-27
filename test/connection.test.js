'use strict';

/* global describe before after it */

const { expect } = require('chai');
const { Client } = require('../index');

describe('Client', () => {
  let client;
  before(done => {
    client = global.CLIENT;
    delete global.CLIENT;
    done();
  });
  after(done => {
    global.CLIENT = client;
    done();
  });
  describe('Assert Connected', () => {
    it('should throw an error if connect is not called', done => {
      expect(() => Client()).to.throw();
      done();
    });
  });
});
