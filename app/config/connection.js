var Sequelize = require("sequelize");

// Creates mySQL connection using Sequelize, the empty string in the third argument spot is our password.
var sequelize = new Sequelize("pfdb", "root", "root", {
  host: "localhost",
  port: 3306,
  dialect: "mysql"
});

// Exports the connection for other files to use
module.exports = sequelize;