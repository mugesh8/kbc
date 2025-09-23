const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/db');

const Notification = db.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'member',
      key: 'mid', 
    },
  },

  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'member',
      key: 'mid',
    },
  },

  type: {
    type: DataTypes.ENUM('rating', 'profile_view', 'referral'),
    allowNull: false,
  },

  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  message: {
    type: DataTypes.STRING,
    allowNull: true,
  },

//   metadata: {
//     type: DataTypes.JSONB,
//     allowNull: true,
//     defaultValue: null,
//   },

  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification;
