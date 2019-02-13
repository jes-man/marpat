const DatabaseClient = require('./client');

module.exports = function(match, error) {
  return class DummyClient extends DatabaseClient {
    static canHandle(url) {
      if (url.match(match)) {
        throw new Error(error);
      }
      return false;
    }
  }
}
