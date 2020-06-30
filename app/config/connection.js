var Sequelize = require("sequelize");
var config = require(__dirname + '\\config.json');

// Creates mySQL connection using Sequelize, the empty string in the third argument spot is our password.
// if (config.use_env_variable) {
//   var sequelize = new Sequelize(process.env[config.use_env_variable]);
// } else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config.development)
// }

// Exports the connection for other files to use
module.exports = sequelize;