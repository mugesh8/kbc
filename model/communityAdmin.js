const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;

const CommunityAdmin = db.define('CommunityAdmin', {
    caid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
    type: DataTypes.JSON, // Store multiple roles as JSON array (["admin", "editor"])
    allowNull: true,
  },
}, {
    tableName: 'community_admin',
    timestamps: true,
});

module.exports = CommunityAdmin;
