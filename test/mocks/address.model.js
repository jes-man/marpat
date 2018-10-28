'use strict';

const { Document } = require('../../index');

class Address extends Document {
  constructor() {
    super();

    this.street = String;
    this.city = String;
    this.zipCode = Number;
  }

  static collectionName() {
    return 'addresses';
  }
}

module.exports = { Address };
