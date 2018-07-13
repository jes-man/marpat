'use strict';

const { connect } = require('./db');
const { Document } = require('./document');
const { EmbeddedDocument } = require('./embedded-document');
const { Client } = require('./clients');

module.exports = {
  connect,
  Client,
  Document,
  EmbeddedDocument
};
