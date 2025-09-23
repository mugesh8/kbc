const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;

const Referral = db.define('Referral', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'member',
      key: 'mid',
    },
    onDelete: 'CASCADE',
  },
  referral_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referral_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reward_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
},

}, {
  tableName: 'referrals',
  timestamps: true,
});


module.exports = Referral;
