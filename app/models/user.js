const Sequelize = require("sequelize");
const sequelize = require("../config/connection.js");

sequelize.query

// Creates a "Character" model that matches up with DB
const User = sequelize.define("user", {
    id: Sequelize.JSON,
    characters: Sequelize.INTEGER
});

// Syncs with DB
User.sync();

module.exports = User;