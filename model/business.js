const { Sequelize } = require('sequelize');
const db = require('../config/db');
const { DataTypes } = Sequelize;
const category = require('./categories');

const BusinessProfile = db.define('BusinessProfile', {
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
        onDelete: 'CASCADE'
    },
    business_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category_id: { // NEW FIELD
        type: DataTypes.INTEGER,
        allowNull: true, // can be required if needed
        references: {
            model: category,
            key: 'cid',
        },
        onDelete: 'SET NULL'
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    business_registration_type: {
        type: DataTypes.ENUM('Proprietor', 'Partnership','Private Limited','Others'),
        allowNull: true,
    },
    business_registration_type_other: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    about: {
        type: DataTypes.TEXT, // Longer text allowed
        allowNull: true,
    },
    branch_name:{
        type: DataTypes.JSON,
        allowNull: true,
    },
    company_address: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    city: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    state: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    zip_code: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    business_starting_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    staff_size: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    business_work_contract: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    email: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tags: {
        type: DataTypes.TEXT, // CSV or JSON
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    google_link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    facebook_link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    instagram_link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    linkedin_link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    business_profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    media_gallery: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    media_gallery_type: {
        type: DataTypes.ENUM('image', 'video'),
        allowNull: true,
    },
    // Salary-based fields
    designation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    salary: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    experience: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Approved',
    },
    exclusive_member_benefit: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

}, {
    tableName: 'business_profiles',
    timestamps: true,
});

BusinessProfile.belongsTo(category, { foreignKey: 'category_id', as: 'category' });

module.exports = BusinessProfile;
