'use strict';

const { Document } = require('../../index');
const { Pet } = require('./pet.model');
const { Address } = require('./address.model');

class User extends Document {
  constructor() {
    super();

    this.schema({
      firstName: String,
      lastName: String,
      pet: Pet,
      address: Address
    });
  }
}

module.exports = { User };
