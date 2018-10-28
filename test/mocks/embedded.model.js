'use strict';

const { EmbeddedDocument } = require('../../index');

class EmbeddedData extends EmbeddedDocument {
  constructor() {
    super();

    this.schema({
      name: {
        type: String
      }
    });
  }
}

module.exports = { EmbeddedData };
