'use strict';

const { Address } = require('./address.model');
const { Pet } = require('./pet.model');
const { User } = require('./user.model');
const Foo = require('./foo.model');
const Bar = require('./bar.model');
const { Data } = require('./data.model');
const { EmbeddedData } = require('./embedded.model');

module.exports = { Address, Foo, Bar, Data, EmbeddedData, Pet, User };
