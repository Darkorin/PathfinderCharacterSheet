// Dependencies
const fs = require('fs');
const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const Character = require('./app/models/character.js');
const path = require('path');
// const User = require('./app/models/user.js')

// Create an instance of the express app.
const app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
const PORT = process.env.PORT || 8080;

// Set Handlebars as the default templating engine.
app.use(express.urlencoded({ extended: false }))
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, 'app/public')));
app.use(express.json());


// Handlebars Helper for calculating various functions
Handlebars.registerHelper("gt", function (val1, val2) {
    return val1 > val2;
});

Handlebars.registerHelper("calcMod", function (baseScore, tempMod) {
    return -Math.ceil((10 - (baseScore + tempMod)) / 2);
});

Handlebars.registerHelper("add", function (val1, val2, val3, val4, val5) {
    return val1 + val2 + val3 + val4 + val5;
});

Handlebars.registerHelper("isKnown", function (featName, knownFeats) {
    let isKnown = false;
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
    fs.readFile("app/data/pfdb.json", "utf8", (err, content) => {  
        if (err) throw err;
        content = JSON.parse(content);
        const index = ["feats", "racialTraits", "races", "skills", "classes", "spells"];
        for (let i = 0; i < content.length; i++) {
            db[index[i]] = content[i];
        }
        let raceNames = [];
        db.races.forEach(race => {
            const racePlural = race.name;
            const findTraitsURL = () => {
                let url;
                db.racialTraits.forEach(traitRace => {
                    if (traitRace[0].subtype === racePlural.toLowerCase()) {
                        url = traitRace[0].url;
                    }
                })
                return url;
            }
            const raceTraitsURL = findTraitsURL();
            const index = raceTraitsURL.search(racePlural);
            raceNames.push(raceTraitsURL.substring(index + racePlural.length + 1, raceTraitsURL.search(' Racial')));
        })
        db.races.forEach((race, i) => {
            race.name = raceNames[i];
        })
    });


}

// Root Route Login
app.get("/", (req, res) => {
    res.render("login");
})

// Character Initialization Page Route
app.get("/create/:charId", (req, res) => {
    Character.findOne({
        where: {
            id: req.params.charId
        }
    }).then(char => {
        if (char === null) {
            Character.create({
                descriptive: {
                    name: "",
                    alignment: "",
                    height: "",
                    weight: "",
                    hair: "",
                    eyes: ""
                },
                level: 1,
                class: "placeholder",
                traits: [],
                raceName: "placeholder",
                exp: 0,
                scores: {
                    str: { score: "STR", value: 10, temp: 0 },
                    dex: { score: "DEX", value: 10, temp: 0 },
                    con: { score: "CON", value: 10, temp: 0 },
                    int: { score: "INT", value: 10, temp: 0 },
                    wis: { score: "WIS", value: 10, temp: 0 },
                    cha: { score: "CHA", value: 10, temp: 0 }
                },
                knownFeats: [
                ],
                hp: 0,
                initTemp: 0,
                money: {
                    c: 0,
                    s: 0,
                    g: 0,
                    p: 0
                },
                ac: {
                    armor: 0,
                    natural: 0,
                    misc: 0
                },
                saves: {
                    will: { base: 0, temp: 0, score: "wis" },
                    fort: { base: 0, temp: 0, score: "con" },
                    ref: { base: 0, temp: 0, score: "dex" }
                },
                items: [],
                bab: 0,
                spRes: "0",
                languages: [],
                notes: ""
            })
        }
        res.render("index", { index: true, races: db.races, classes: db.classes });
    })
})

// Character editor
app.get("/editor/:charId", (req, res) => {
    // generateDummy();
    Character.findOne({
        where: {
            id: req.params.charId
        }
    }).then(char => {
        res.render("stats", {
            //Page
            index: false,
            //DB export
            feats: db.feats,
            skills: db.skills,
            spellFilter: db.spells.filter(spell => {
                let spellUsable = false;
                spell.levels.forEach(pfclass => {
                    if (pfclass.class === char.data.class) spellUsable = true;
                });
                return spellUsable;
            }),
            charId: char.id,
            char: char.data
        })
    }).catch(err => {
        res.redirect("/");
    });
})


// API Routes
app.get("/api/feats/:featName", (req, res) => {
    let featFound = false;
    db.feats.forEach(feat => {
        if (feat.name === req.params.featName) {
            featFound = feat;
        }
    })
    res.json(featFound);
})

app.get("/api/traits/:traitName", (req, res) => {
    let traitFound = false;
    db.racialTraits.forEach(race => {
        race.forEach(trait => {
            if (trait.name === req.params.traitName) traitFound = trait;
        })
    })
    res.json(traitFound);
})

app.get("/api/:charId/:query", (req, res) => {
    Character.findOne({
        where: {
            id: req.params.charId
        }
    }).then(result => {
        return res.json(result.data[req.params.query]);
    }).catch(err => {
        res.status(401).json(err);
    });
})

app.post("/api/:charId/:query", (req, res) => {
    Character.findOne({
        where: {
            id: req.params.charId
        }
    }).then(char => {
        const body = JSON.parse(Object.keys(req.body)[0]);
        const newData = char.data;
        newData[`${req.params.query}`] = body;
        Character.update(
            { data: newData },
            { where: { id: req.params.charId } }
        )
    })
})

app.get("/login", (req, res) => {
    let id = JSON.parse(Object.keys(req.body)[0]);
    console.log(id);
    res.redirect('/create/' + id);
})

// Creates a dummy character for testing
const generateDummy = () => {
    //Renders Dummy character
    let racePlural = db.races[0].name;
    let raceTraitsURL = db.racialTraits[0][0].url;
    let index = raceTraitsURL.search(racePlural);
    let race = raceTraitsURL.substring(index + racePlural.length + 1, raceTraitsURL.search(' Racial'));

    //Character export
    const dummy = {
        descriptive: {
            name: "Darkorin",
            alignment: "CN",
            height: "5'8",
            weight: "150lb",
            hair: "black",
            eyes: "blue"
        },
        level: 1,
        class: db.classes[0].name,
        traits: db.racialTraits[0],
        raceName: race,
        exp: 1000,
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
        items: [{
            title: "Long Sword",
            body: "Stabs people for 1d6 of damage"
        }],
        bab: 1,
        spRes: "0",
        languages: ["common", "draconic", "dwarven"],
        notes: "Nothing really matters, anyone can see, nothing really matters to me"
    }
    Character.create({
        data: dummy
    }).then(results => {
        console.log(results);
    })
}

// Imports the DB
importDB();

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});