const db = require('../config/db');
const Member = require('./member');
const BusinessProfile = require('./business');
const MemberFamily = require('./memberFamily');
const Ratings = require('./ratings');
const Notification = require('./notification');

// Define associations
Member.hasOne(BusinessProfile, {
    foreignKey: 'member_id',
    sourceKey: 'mid',
    onDelete: 'CASCADE',
    as: 'businessProfile',
});

BusinessProfile.belongsTo(Member, {
    foreignKey: 'member_id',
    targetKey: 'mid',
    onDelete: 'CASCADE',
    as: 'member',
});

Member.hasOne(MemberFamily, {
    foreignKey: 'member_id',
    sourceKey: 'mid',
    as: 'family',
});

MemberFamily.belongsTo(Member, {
    foreignKey: 'member_id',
    targetKey: 'mid',
    as: 'member',
});

Member.hasMany(Ratings, {
    foreignKey: 'member_id',
    sourceKey: 'mid',
    as: 'ratingsGiven',
});

Ratings.belongsTo(Member, {
    foreignKey: 'member_id',
    targetKey: 'mid',
    as: 'ratedBy',
});

BusinessProfile.hasMany(Ratings, {
    foreignKey: 'business_id',
    sourceKey: 'id',
    as: 'businessRatings',
});

Ratings.belongsTo(BusinessProfile, {
    foreignKey: 'business_id',
    targetKey: 'id',
    as: 'business',
});

Notification.belongsTo(Member, {
    foreignKey: 'sender_id',
    as: 'sender',
});

Notification.belongsTo(Member, {
    foreignKey: 'receiver_id',
    as: 'receiver',
});

// ✅ Single clean export:
module.exports = {
    db,
    Member,
    BusinessProfile,
    MemberFamily,
    Ratings,
    Notification
};
