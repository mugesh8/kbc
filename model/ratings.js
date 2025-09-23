const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/db.js');

const Ratings = db.define('Ratings', {
    rid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'member',
            key: 'mid'
        }
    }, 
    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'business_profiles',
            key: 'id'
        }
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }

}, {
    tableName: 'ratings',
    timestamps: true,
});

module.exports = Ratings;
