'use strict';

const { Document } = require('../../index');
const Bar = require('./bar.model');

class Foo extends Document {
  constructor() {
    super();

    this.bar = Bar;
    this.num = Number;
  }
}

module.exports = Foo;
