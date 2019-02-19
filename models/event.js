var Sequelize = require('sequelize');




// create a sequelize instance with our local postgres database information.
//var sequelize = new Sequelize('postgres://postgres@localhost:5432/auth-system');
 const sequelize = new Sequelize('auth-system', 'postgres', 'Indelab2018', {
    host: 'localhost',
    dialect: 'postgres'

  });

// setup User model and its fields.
var Event = sequelize.define('events', {
    titre: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        unique: false,
        allowNull: false
    },
    photo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    organisateur: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lienFacebook: {
        type: Sequelize.STRING,
        allowNull: true
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        unique: false,
    },
    time: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true
    },
    timeend: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true
    }
});


// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('Events table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = Event;