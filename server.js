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
app.get("/create/:id", (req, res) => {
    res.render("index", { index: true, races: db.races, classes: db.classes });
})

// Character editor
app.get("/editor/:id", (req, res) => {
    // generateDummy();
    Character.findOne({
        where: {
            id: req.params.id.toString()
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
            charId: char.user,
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

app.get("/api/traits/:race/:traitName", (req, res) => {
    let traitFound = false;

    const findTraitsURL = (raceName) => {
        let url;
        db.racialTraits.forEach(traitRace => {
            if (traitRace[0].subtype === raceName.toLowerCase()) {
                url = traitRace[0].url;
            }
        })
        return url;
    }

    let traitsFound = [];

    db.racialTraits.forEach(race => {
        const raceTraitsURL = findTraitsURL(race[0].subtype).toLowerCase();
        const raceName = raceTraitsURL.substr(raceTraitsURL.search(`/${req.params.race.toLowerCase()}`) + 1, req.params.race.length);
        if (req.params.race.toLowerCase() === raceName.toLowerCase()) {
            traitsFound = race;
        }
    })

    traitsFound.forEach(trait => {
        if (trait.name === req.params.traitName) traitFound = trait;
    })
    res.json(traitFound);
})

app.get("/racialTraits/:race", (req, res) => {
    const findTraitsURL = (raceName) => {
        let url;
        db.racialTraits.forEach(traitRace => {
            if (traitRace[0].subtype === raceName.toLowerCase()) {
                url = traitRace[0].url;
            }
        })
        return url;
    }
    let traitsFound = [];
    db.racialTraits.forEach(race => {
        const raceTraitsURL = findTraitsURL(race[0].subtype).toLowerCase();
        const raceName = raceTraitsURL.substr(raceTraitsURL.search(`/${req.params.race.toLowerCase()}`) + 1, req.params.race.length);
        if (req.params.race.toLowerCase() === raceName.toLowerCase()) {
            race.forEach(trait => {
                traitsFound.push({ name: trait.name });
            })
        }
    })
    return res.json(traitsFound);
})

app.get("/api/:charId/:query", (req, res) => {
    Character.findOne({
        where: {
            id: req.params.charId.toString()
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
            id: req.params.charId.toString()
        }
    }).then(char => {
        const body = JSON.parse(Object.keys(req.body)[0]);
        const newData = char.data;
        newData[`${req.params.query}`] = body;
        console.log("UPDATING: ", req.params.query, "TO: ", newData[`${req.params.query}`]);
        Character.update(
            { data: newData },
            { where: { id: req.params.charId.toString() } }
        ).then(() => {
            res.end();
        })

    })
})

app.post("/api/:charId", (req,res) => {
    Character.findOne({
        where: {
            id: req.params.charId.toString()
        }
    }).then(char => {
        let keys = Object.keys(req.body);
        let newData = char.data;
        keys.forEach(key => {
            if (key != "traits") {
                newData[`${key}`] = req.body[`${key}`];
            } else {
                newData["traits"] = JSON.parse(req.body.traits);
            }
        })
        Character.update(
            { data: newData },
            { where: { id: req.params.charId.toString() } }
        ).then((result) => {
            res.end();
        })
    }).then(() => {
        res.end();
    });
})

app.post("/login", (req, res) => {
    const token = Object.keys(req.body)[0];
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client("1029747393830-kfqdq1b5d6tsuf1eo0m3jirl6ppeps6o.apps.googleusercontent.com");
    console.log(client)
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "1029747393830-kfqdq1b5d6tsuf1eo0m3jirl6ppeps6o.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        Character.findOne({
            where: {
                user: userid
            }
        }).then(char => {
            if (char != null) {
                res.json(char.id);
            } else {
                let newChar = {
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
                    knownFeats: [],
                    hp: 10,
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
                }
                Character.create({
                    user: userid,
                    data: newChar
                }).then((results) => {
                    res.json(char.id);
                })
            }
        })

        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    }
    verify().catch(console.error);
})

// Imports the DB
importDB();

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});