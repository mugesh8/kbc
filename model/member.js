const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;
const Referral = require('./referral.js');
const BusinessProfile = require('./business.js');
const MemberFamily = require('./memberFamily.js');

const Member = db.define('Member', {
    mid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    application_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        defaultValue: function () {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `KBC-APP${timestamp}${random}`;
        }
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    join_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    aadhar_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    blood_group: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contact_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    alternate_contact_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    marital_status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    zip_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    work_phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    extension: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    preferred_contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    secondary_email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    emergency_contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    emergency_phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    personal_website: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    linkedin_profile: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    facebook: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    instagram: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    twitter: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    youtube: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    kootam: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    kovil: {  // ✅ New field
        type: DataTypes.STRING,
        allowNull: true,
    },
    best_time_to_contact: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    access_level: {
        type: DataTypes.ENUM('Basic', 'Advanced'),
        allowNull: false,
        defaultValue: 'Basic',
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Pending', 'Approved', 'Rejected']]
        }
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true, // only required if status = Rejected
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    paid_status: {
      type: DataTypes.ENUM("Paid", "Unpaid"),
      defaultValue: "Unpaid"
    },
    membership_valid_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Arakattalai: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true
    },
    KNS_Member: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true
    },
    KBN_Member: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true
    },
    BNI: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true
    },
    Rotary: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true
    },
    Lions: {
        type: DataTypes.ENUM("Yes", "No"),
        allowNull: true
    },
    Other_forum: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'member',
    timestamps: true,
});

Member.hasOne(Referral, { foreignKey: 'member_id', onDelete: 'CASCADE' });
Referral.belongsTo(Member, { foreignKey: 'member_id' });

Member.hasMany(BusinessProfile, { foreignKey: 'member_id' });
BusinessProfile.belongsTo(Member, { foreignKey: 'member_id' });

Member.hasOne(MemberFamily, { foreignKey: 'member_id' });
MemberFamily.belongsTo(Member, { foreignKey: 'member_id' });

Member.hasOne(Referral, { foreignKey: 'member_id' });
Referral.belongsTo(Member, { foreignKey: 'member_id' });


module.exports = Member;