// Dependencies
const fs = require('fs');
const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');

// Create an instance of the express app.
const app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
const PORT = process.env.PORT || 8080;

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.static('/app/public'))

// Handlebars Helper for calculating various functions
Handlebars.registerHelper("calcMod", function (baseScore, tempMod) {
    return -Math.ceil((10 - (baseScore + tempMod)) / 2);
});

Handlebars.registerHelper("add", function (val1, val2, val3, val4, val5) {
    return val1 + val2 + val3 + val4 + val5;
});

Handlebars.registerHelper("isKnown", function (featName, charId) {
    let isKnown = false;
    const knownFeats = [
        { featName: "Acrobatic" }
    ];
    knownFeats.forEach(feat => {
        if (featName === feat.featName) isKnown = true;
    })
    return isKnown;
});

// Creates an empty db object to import to from our json file
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
    fs.readFile("./app/data/pfdb.json", "utf8", (err, content) => {
        if (err) throw err;
        content = JSON.parse(content);
        const index = ["feats", "racialTraits", "races", "skills", "classes", "spells"];
        for (let i = 0; i < content.length; i++) {
            db[index[i]] = content[i];
        }
    });
}

// Character Initialization Page Route
app.get("/create", (req, res) => {
    res.render("index", { index: true, races: db.races, classes: db.classes });
})

//
// Character editor For testing only
app.get("/stats", (req, res) => {

    let racePlural = db.races[0].name;
    let raceTraitsURL = db.racialTraits[0][0].url;
    let index = raceTraitsURL.search(racePlural);
    let race = raceTraitsURL.substring(index + racePlural.length + 1, raceTraitsURL.search(' Racial') + 1);

    res.render("stats", {
        //Page
        index: false,
        //DB export
        race: db.races[0],
        class: db.classes[0],
        feats: db.feats,
        skills: db.skills,
        spells: db.spells.filter(spell => {
            let spellUsable = false;
            spell.levels.forEach(pfclass => {
                if (pfclass.class === db.classes[0].name) spellUsable = true;
            });
            return spellUsable;
        }),

        //Character export
        charId: 0,
        descriptive: {
            name: "Darkorin",
            alignment: "CN",
            height: "5'8",
            weight: "150lb",
            hair: "black",
            eyes: "blue"
        },
        level: 1,
        raceName: race,
        scores: {
            str: { score: "STR", value: 18, temp: 2 },
            dex: { score: "DEX", value: 7, temp: 1 },
            con: { score: "CON", value: 5, temp: 2 },
            int: { score: "INT", value: 9, temp: 3 },
            wis: { score: "WIS", value: 14, temp: 1 },
            cha: { score: "CHA", value: 8, temp: -4 }
        },
        knownFeats: [
            { featName: "Acrobatic" }
        ],
        hp: 30,
        initTemp: 3,
        money: {
            c: 70,
            s: 51,
            g: 31,
            p: 10
        },
        ac: {
            armor: 7,
            natural: 2,
            misc: 1
        },
        saves: {
            will: { base: 1, temp: 0, score: "wis" },
            fort: { base: 1, temp: 0, score: "con" },
            ref: { base: 1, temp: 0, score: "dex" }
        },
        bab: 1,
        spRes: "0",
        languages: ["common", "draconic", "dwarven"]
    });
})

// Character editor
app.get("/editor/:charId?", (req, res) => {
    res.render("stats", { race: db.races[0], classes: db.classes[0], feats: db.feats, skills: db.skills, spells: db.spells });
})

app.get("/api/feats/:featName", (req, res) => {
    db.feats.forEach(feat => {
        if (feat.name === req.params.featName) return res.json(feat);
    })
})

// Imports the DB
importDB();

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});