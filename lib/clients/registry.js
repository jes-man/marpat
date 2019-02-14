const NeDbClient = require('./nedbclient');
const MongoClient = require('./mongoclient_optional');

class ClientRegistry {
  constructor() {
    this.clients = [NeDbClient, MongoClient];
  }

  add(client) {
    this.clients.push(client);
  }

  getClient(url) {
    const client = this.clients.find(client => {
      return client.canHandle(url);
    });
    return client;
  }
}

module.exports = new ClientRegistry();
