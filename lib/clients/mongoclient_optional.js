try {
  module.exports = require('./mongoclient');
} catch (e) {
  module.exports = require('./dummy')(
    /^mongodb:\/\//,
    'mongodb module is not installed.\n' +
    'You maybe install it with: npm install --save monodb'
  );
}
