const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron'); 
const fs = require('fs');

const dbFolder = path.join(app.getPath('userData'), '.c', '.claunch', 'data');
const dbPath = path.join(dbFolder, 'data.db');

if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
}

const db = new sqlite3.Database(dbPath);


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS data (
        name TEXT,
        version TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language TEXT,
        theme TEXT,
        notifications INTEGER,
        auto_update INTEGER
    )`);
});

module.exports = db;