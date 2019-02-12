'use strict';

/* global describe it afterEach */

const { expect } = require('chai');

const DatabaseClient = require('../../lib/clients/client');
const ClientRegitry = require('../../lib/clients/registry');

describe('Client Registry', function() {
  afterEach(() => ClientRegitry.clients.splice(2));

  describe('#add', function() {
    it('should add a new client', function() {
      class Client extends DatabaseClient {
        constructor() {
          super();
          this.name = String;
        }
      }

      ClientRegitry.add(Client);

      expect(ClientRegitry.clients.indexOf(Client)).to.be.not.equal(-1);
    });

    it('should return the given client', function() {
      class Client extends DatabaseClient {
        constructor() {
          super();
          this.name = String;
        }

        static canHandle(url) {
          return url.indexOf('foo://') === 0;
        }
      }

      ClientRegitry.add(Client);

      expect(ClientRegitry.getClient('foo://')).to.be.equal(Client);
    });

    it('should return the default client for nedb', function() {
      class Client extends DatabaseClient {
        constructor() {
          super();
          this.name = String;
        }

        static canHandle(url) {
          return url.indexOf('foo://') === 0;
        }
      }

      ClientRegitry.add(Client);

      expect(ClientRegitry.getClient('nedb://').name).to.be.equal('NeDbClient');
    });

    it('should return the default client for mongodb', function() {
      class Client extends DatabaseClient {
        constructor() {
          super();
          this.name = String;
        }

        static canHandle(url) {
          return url.indexOf('foo://') === 0;
        }
      }

      ClientRegitry.add(Client);

      expect(ClientRegitry.getClient('mongodb://').name).to.be.equal('MongoDbClient');
    });
  });
});
