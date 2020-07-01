const Sequelize = require("sequelize");
const sequelize = require("../config/connection.js");

sequelize.query

// Creates a "Character" model that matches up with DB
const Character = sequelize.define("character", {
    user: Sequelize.BIGINT,
    data: Sequelize.JSON
});

// Syncs with DB
Character.sync();

module.exports = Character;