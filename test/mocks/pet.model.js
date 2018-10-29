'use strict';

const { Document } = require('../../index.js');

class Pet extends Document {
  constructor() {
    super();

    this.schema({
      type: String,
      name: String
    });
  }
}

module.exports = { Pet };
