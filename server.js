// Dependencies
const fs = require('fs');
const express = require('express');
const exphbs = require("express-handlebars");

// Create an instance of the express app.
const app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
const PORT = process.env.PORT || 8080;

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Creates an empty db object to import ot from our json file
const db = {
    feats: [],
    racialTraits: [],
    races: [],
    skills: [],
    classes: [],
    spells: []
}

// Function to import the db.
const importDB = () => {
    fs.readFile("./data/pfdb.json", "utf8", (err, content) => {
        if (err) throw err;
        content = JSON.parse(content);   
        const index = ["feats", "racialTraits", "races", "skills", "classes", "spells"];     
        for(let i = 0; i < content.length; i++){
            db[index[i]] =  content[i];
        }
    });
}

// Character Initialization Page Route
app.get("/create", (req, res) =>{
    res.render("index", {races: db.races, classes: db.classes});
} )

//
// Character editor For testing only
app.get("/stats", (req, res) =>{
    res.render("stats", {race: db.races[0], classes: db.classes[0], feats: db.feats, skills: db.skills, spells: db.spells});
} )

// Character editor
app.get("/editor/:charId?", (req, res) =>{
    res.render("stats", {race: db.races[0], classes: db.classes[0], feats: db.feats, skills: db.skills, spells: db.spells});
} )

// Imports the DB
importDB();

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });