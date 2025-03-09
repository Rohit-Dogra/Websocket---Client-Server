const mysql = require("mysql");
const { MongoClient } = require("mongodb");


const mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rohitdogra@23",
    database: "system_monitoring",
});

mysqlConnection.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
mongoClient.connect();
const mongoDB = mongoClient.db("system_monitoring");

module.exports = { mysqlConnection, mongoDB };
