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
app.use(express.static('public'))

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
    res.render("index", {index: true, races: db.races, classes: db.classes});
} )

//
// Character editor For testing only
app.get("/stats", (req, res) =>{
    res.render("stats", {index: false,race: db.races[0], classes: db.classes[0], feats: db.feats, skills: db.skills, spells: db.spells.filter(spell => {
        let spellUsable = false;
        spell.levels.forEach(pfclass => {
             if (pfclass.class === db.classes[0].name) spellUsable = true;
        });
        return spellUsable;
    })});
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