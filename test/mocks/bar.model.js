'use strict';

const { Document } = require('../../index');

class Bar extends Document {
  constructor() {
    super();

    this.foo = require('./foo.model');
    this.num = Number;
  }
}

module.exports = Bar;
