'use strict';

const { connect, Client, Document, EmbeddedDocument } = require('./lib');
const { ClientRegistry, DatabaseClient } = require('./lib');

module.exports = {
  connect,
  Client,
  Document,
  EmbeddedDocument,
  ClientRegistry,
  DatabaseClient
};
