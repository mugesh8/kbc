const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;

const MemberFamily = db.define('MemberFamily', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'member', // table name (not model name)
            key: 'mid',
        },
        onDelete: 'CASCADE',
    },
    father_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    father_contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mother_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mother_contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    spouse_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    spouse_contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    number_of_children: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    children_names: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'member_family',
    timestamps: true,
});

module.exports = MemberFamily;
