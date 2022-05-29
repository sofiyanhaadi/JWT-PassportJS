const sequelize = require('sequelize');
const db = new sequelize("db_nodejwt", "root", "", {
    host: "localhost",
    dialect: "mysql"
});

db.sync({});


module.exports = db;