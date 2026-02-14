const Member = require('../model/member');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Referral = require('../model/referral');
const BusinessProfile = require('../model/business');
const fs = require('fs');
const MemberFamily = require('../model/memberFamily');
const { Op } = require('sequelize');
const Notification = require('../model/notification');
const Categories = require('../model/categories');
// Helper: Generate Access Token
const generateAccessToken = (member) => {
    return jwt.sign(
        { mid: member.mid, email: member.email },
        process.env.ACCESS_SECRET_TOKEN,
        { expiresIn: '2h' }
    );
};

// Helper: Calculate days between two dates
const daysBetween = (start, end) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(start);
    const secondDate = new Date(end);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// ✅ Register Member
const registerMember = async (req, res) => {
    const t = await Member.sequelize.transaction();
    try {
        // Handle profile image
        const profile_image = req.files?.['profile_image']?.[0]?.path.replace(/\\/g, "/") || null;

        // Parse business_profiles
        let business_profiles = [];
        if (typeof req.body.business_profiles === 'string') {
            business_profiles = JSON.parse(req.body.business_profiles);
        } else {
            business_profiles = req.body.business_profiles || [];
        }

        // Parse family_details   
        let family_details = {};
        if (typeof req.body.family_details === 'string') {
            family_details = JSON.parse(req.body.family_details);
        } else {
            family_details = req.body.family_details || {};
        }

        // Destructure member data
        let {
            first_name, email, password,
            dob, gender, join_date, aadhar_no,
            blood_group, contact_no, alternate_contact_no,
            marital_status, address, city, state, zip_code,
            work_phone, extension, mobile_no, preferred_contact,
            secondary_email, emergency_contact, emergency_phone,
            personal_website, linkedin_profile, facebook,
            instagram, twitter, youtube, kootam, kovil, best_time_to_contact,
            referral_name, referral_code,
            status = 'Pending',
            access_level = 'Basic',
            paid_status = 'Unpaid',        // ✅ new field with default
            membership_valid_until = null,
            Arakattalai = 'No', // ✅ new field
            KNS_Member = 'No', // ✅ new forum field
            KBN_Member = 'No', // ✅ new forum field
            BNI = 'No', // ✅ new forum field
            Rotary = 'No', // ✅ new forum field
            Lions = 'No', // ✅ new forum field
            Other_forum = null, // ✅ new forum field
            pro = 'Unpro',          // ✅ new field
            core_pro = null,        // ✅ new field
            squad = null,           // ✅ new field
            squad_fields = null
        } = req.body;

        let coreProFinal = null;
        if (pro === 'Unpro') {
            coreProFinal = core_pro || null;
        }

        if (Array.isArray(email)) email = email[0];

        // Check duplicate email (skip if email is empty)
        if (email && email.trim()) {
            const existingMember = await Member.findOne({ where: { email } });
            if (existingMember) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    msg: 'Email already exists!',
                });
            }
        }

        const hashedPassword = password && password.trim() ? await bcrypt.hash(password, 10) : null;

        // ✅ If unpaid, ignore membership_valid_until
        let membershipValidUntilFinal = null;
        if (paid_status === 'Paid') {
            membershipValidUntilFinal = membership_valid_until || null;
        }

        // Create member
        const newMember = await Member.create({
            first_name,
            email,
            password: hashedPassword,
            dob, gender, join_date, aadhar_no, blood_group,
            contact_no, alternate_contact_no, marital_status,
            address, city, state, zip_code, profile_image,
            work_phone, extension, mobile_no, preferred_contact,
            secondary_email, emergency_contact, emergency_phone,
            personal_website, linkedin_profile, facebook,
            instagram, twitter, youtube, kootam, kovil, best_time_to_contact,
            status, access_level,
            paid_status,                        // ✅ save paid status
            membership_valid_until: membershipValidUntilFinal, // ✅ only if Paid
            Arakattalai, // ✅ save Arakattalai
            KNS_Member, // ✅ save forum membership
            KBN_Member, // ✅ save forum membership
            BNI, // ✅ save forum membership
            Rotary, // ✅ save forum membership
            Lions, // ✅ save forum membership
            Other_forum, // ✅ save other forum
            pro,           // ✅ save pro/unpro toggle
            core_pro: coreProFinal,     // ✅ save core_pro
            squad,         // ✅ save squad
            squad_fields
        }, { transaction: t });

        // Handle referral
        if (referral_code) {
            const referrer = await Member.findOne({
                where: { application_id: referral_code }
            });

            if (referrer) {

                await Referral.create({
                    member_id: newMember.mid,
                    referral_name: referral_name || '',
                    referral_code,
                    referred_by_member_id: referrer.mid,
                    reward_points: 10
                }, { transaction: t });

                // Update members table reward_points by adding old + new
                await referrer.reload({ transaction: t });
                await Member.update(
                    { reward_points: (referrer.reward_points || 0) + 10 },
                    { where: { mid: referrer.mid }, transaction: t }
                );
            }
        }

        // Handle business profiles
        // Handle business profiles
        for (let i = 0; i < business_profiles.length; i++) {
            const profile = business_profiles[i];

            const business_profile_image = req.files?.[`business_profile_image_${i}`]?.[0]?.path.replace(/\\/g, "/") || null;
            const gallery_files = req.files?.[`media_gallery_${i}`] || [];
            const gallery_paths = gallery_files.map(file => file.path.replace(/\\/g, "/"));
            const gallery_type = gallery_paths.length > 0
                ? /\.(mp4|mov|avi|mkv)$/i.test(gallery_paths[0]) ? 'video' : 'image'
                : null;

            let category_id = profile.category_id ? Number(profile.category_id) : null;
            if (category_id) {
                const existingCategory = await Categories.findByPk(category_id);
                if (!existingCategory) category_id = null;
            }
            if (!category_id && profile.new_category_name && String(profile.new_category_name).trim()) {
                const name = String(profile.new_category_name).trim();
                const existingByName = await Categories.findOne({ where: { category_name: name } });
                const createdOrExisting = existingByName || await Categories.create({ category_name: name }, { transaction: t });
                category_id = createdOrExisting.cid;
            }

            // Determine status per rule
            let statusForNewBusiness = 'Approved';
            const daysSinceMemberCreated = daysBetween(newMember.createdAt, new Date());
            if (daysSinceMemberCreated >= 5) {
                statusForNewBusiness = 'Pending';
            }

            // Normalize business_registration_type - handle "Others" case
            let normalizedBusinessRegistrationType = null;
            if (profile.business_type === 'self-employed' || profile.business_type === 'business') {
                if (profile.business_registration_type && profile.business_registration_type !== 'Others') {
                    normalizedBusinessRegistrationType = profile.business_registration_type;
                } else if (profile.business_registration_type === 'Others' && profile.business_registration_type_other) {
                    normalizedBusinessRegistrationType = profile.business_registration_type_other;
                }
            }

            await BusinessProfile.create({
                member_id: newMember.mid,
                company_name: profile.company_name,
                business_type: profile.business_type,
                salary: profile.salary,
                category_id,
                // business_work_contract:Array.isArray(profile.business_type === 'self-employed' || profile.business_type === 'business') ? profile.contact_no : null,

                // Self-employed and Business fields
                business_registration_type: normalizedBusinessRegistrationType,
                business_registration_type_other: profile.business_registration_type_other || null,
                about: (profile.business_type === 'self-employed' || profile.business_type === 'business') ? profile.about : null,
                branch_name: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.branch_name) : [profile.branch_name],
                company_address: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.address) : [profile.company_address],
                city: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.city) : [profile.city],
                state: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.state) : [profile.state],
                zip_code: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.zip_code) : [profile.zip_code],
                email: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.email) : [profile.email],
                // business_starting_year: (profile.business_type === 'self-employed' || profile.business_type === 'business') ? profile.business_starting_year : null,
                business_work_contract: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.business_work_contract) : [profile.business_work_contract],

                // Business-specific fields
                staff_size: profile.business_type === 'business' ? profile.staff_size : null,

                // Salary fields
                designation: profile.business_type === 'salary' ? profile.designation : null,
                location: Array.isArray(profile.location) ? profile.location : [profile.location],
                experience: profile.experience || null,

                // Common fields
                // email: Array.isArray(profile.email) ? profile.email : [profile.email],
                source: profile.source || null,
                tags: profile.tags || null,
                website: profile.website || null,
                google_link: profile.google_link || null,
                facebook_link: profile.facebook_link || null,
                instagram_link: profile.instagram_link || null,
                linkedin_link: profile.linkedin_link || null,
                exclusive_member_benefit: profile.exclusive_member_benefit || null,

                // Media
                business_profile_image,
                media_gallery: gallery_paths.join(','),
                media_gallery_type: gallery_type,
                status: statusForNewBusiness,
            }, { transaction: t });
        }

        // Handle family details
        if (Object.keys(family_details).length > 0) {
            const {
                father_name,
                father_contact,
                mother_name,
                mother_contact,
                spouse_name,
                spouse_contact,
                number_of_children,
                address: family_address,
                children_names = []
            } = family_details;

            const familyPayload = {
                member_id: newMember.mid,
                father_name: (father_name && String(father_name).trim()) || 'N/A',
                father_contact: (father_contact && String(father_contact).trim()) || 'N/A',
                mother_name: (mother_name && String(mother_name).trim()) || 'N/A',
                mother_contact: (mother_contact && String(mother_contact).trim()) || 'N/A',
                address: (family_address && String(family_address).trim()) || 'N/A',
            };

            if (marital_status?.toLowerCase().trim() === 'married') {
                familyPayload.spouse_name = (spouse_name && String(spouse_name).trim()) || 'N/A';
                familyPayload.spouse_contact = (spouse_contact && String(spouse_contact).trim()) || 'N/A';
                familyPayload.number_of_children = Number.isFinite(Number(number_of_children)) ? Number(number_of_children) : 0;

                if (
                    number_of_children > 0 &&
                    Array.isArray(children_names) &&
                    children_names.length === Number(number_of_children)
                ) {
                    familyPayload.children_names = JSON.stringify(children_names);
                } else {
                    familyPayload.children_names = 'N/A';
                }
            }

            await MemberFamily.create(familyPayload, { transaction: t });
        }

        await t.commit();

        res.status(201).json({
            success: true,
            msg: 'Member, business profiles and family details created successfully',
            data: {
                mid: newMember.mid,
                application_id: newMember.application_id,
                first_name: newMember.first_name,
                email: newMember.email,
                paid_status: newMember.paid_status,  // ✅ include in response
                membership_valid_until: newMember.membership_valid_until, // ✅ only if Paid
                profile_image,
                createdAt: newMember.createdAt,
            }
        });

    } catch (error) {
        await t.rollback();

        // Cleanup uploaded files
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        console.error("Error registering member:", error);
        res.status(500).json({
            success: false,
            msg: 'An error occurred during registration',
            error: error.message,
        });
    }
};

// ✅ Login Member
const loginMember = async (req, res) => {
    try {
        const { emailOrContact, email, contact_no, password } = req.body;

        const identifier = emailOrContact || email || contact_no;

        if (!identifier || !password) {
            return res.status(400).json({ success: false, msg: 'Email/Contact number and password are required' });
        }

        const member = await Member.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { contact_no: identifier }
                ]
            }
        });

        if (!member) {
            return res.status(400).json({ success: false, msg: 'Email/Contact or password is incorrect' });
        }

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: 'Email/Contact or password is incorrect' });
        }

        if (member.status !== 'Approved') {
            return res.status(400).json({ success: false, msg: 'Your account is not approved yet. Please wait for approval.' });
        }

        const accessToken = generateAccessToken(member);

        res.status(200).json({
            success: true,
            msg: 'Login successful',
            accessToken,
            tokenType: 'Bearer',
            data: {
                mid: member.mid,
                email: member.email,
                contact_no: member.contact_no,
                first_name: member.first_name,
                last_name: member.last_name,
                profile_image: member.profile_image,
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, msg: 'Login failed', error: error.message });
    }
};


// ✅ Logout Member (Just client-side token removal; no server-side logic for JWT unless using blacklist)
const logoutMember = async (req, res) => {
    // Optionally, you can implement JWT blacklist here.
    res.status(200).json({
        success: true,
        msg: 'Logout successful',
    });
};

// ✅ Verify Token Middleware (optional for protected routes)
const verifyMemberToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, msg: 'Access token is required' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, msg: 'Invalid or expired token' });
        }

        req.member = decoded;
        next();
    });
};

// GET: All Members
const getAllMembers = async (req, res) => {
    try {
        const members = await Member.findAll({
            attributes: {
                exclude: ['password'],
                include: ['reward_points']
            },
            attributes: { include: ['paid_status'] },
            include: [
                {
                    model: BusinessProfile,
                    as: 'BusinessProfiles', // Optional alias if defined
                    where: { status: { [Op.ne]: 'Rejected' } },
                    required: false,
                },
                {
                    model: MemberFamily,
                    as: 'MemberFamily', // Optional alias
                },
                {
                    model: Referral,
                    as: 'Referral', // Optional alias
                }
            ],
        });

        res.status(200).json({
            success: true,
            data: members,
        });
    } catch (error) {
        console.error("Error fetching all members:", error);
        res.status(500).json({
            success: false,
            msg: 'Failed to retrieve members',
            error: error.message,
        });
    }
};


// GET: Member by ID
const getMemberById = async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id, {
            attributes: {
                exclude: ['password'],
                include: ['reward_points']
            },
            attributes: { include: ['paid_status'] },
            include: [
                {
                    model: BusinessProfile,
                    as: 'BusinessProfiles',
                    where: { status: { [Op.ne]: 'Rejected' } },
                    required: false,
                },
                {
                    model: MemberFamily,
                    as: 'MemberFamily',
                },
                {
                    model: Referral,
                    as: 'Referral',
                }
            ],
        });

        if (!member) {
            return res.status(404).json({ success: false, msg: 'Member not found' });
        }

        res.status(200).json({
            success: true,
            data: member,
        });

    } catch (error) {
        console.error("Error fetching member:", error);
        res.status(500).json({
            success: false,
            msg: 'Failed to fetch member',
            error: error.message,
        });
    }
};

// PUT: Update Member
const updateMember = async (req, res) => {
    const t = await Member.sequelize.transaction();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }

        const memberId = req.params.id;
        const member = await Member.findByPk(memberId);
        if (!member) {
            return res.status(404).json({ success: false, msg: 'Member not found' });
        }

        // Handle profile image
        const profile_image = req.files?.['profile_image']?.[0]?.path.replace(/\\/g, "/") || member.profile_image;

        // Destructure data
        let {
            first_name, last_name, email, password,
            dob, gender, join_date, aadhar_no,
            blood_group, contact_no, alternate_contact_no,
            marital_status, address, city, state, zip_code,
            work_phone, extension, mobile_no, preferred_contact,
            secondary_email, emergency_contact, emergency_phone,
            personal_website, linkedin_profile, facebook,
            instagram, twitter, youtube, kootam, kovil, best_time_to_contact,
            referral_name, referral_code,
            status = member.status,
            access_level = member.access_level,
            rejection_reason,
            paid_status = member.paid_status,
            membership_valid_until,
            Arakattalai = member.Arakattalai, // ✅ save Arakattalai
            KNS_Member = member.KNS_Member, // ✅ forum membership
            KBN_Member = member.KBN_Member, // ✅ forum membership
            BNI = member.BNI, // ✅ forum membership
            Rotary = member.Rotary, // ✅ forum membership
            Lions = member.Lions, // ✅ forum membership
            Other_forum = member.Other_forum, // ✅ other forum
            pro = member.pro,
            core_pro = member.core_pro,
            squad = member.squad,
            squad_fields = member.squad_fields
        } = req.body;

        // Ensure rejection reason only if status = Rejected
        // if (status === 'Rejected' && !rejection_reason) {
        //     return res.status(400).json({
        //         success: false,
        //         msg: 'Rejection reason is required when status is Rejected',
        //     });
        // }

        if (Array.isArray(email)) email = email[0];

        // Hash password if updated
        const updatedPassword = password ? await bcrypt.hash(password, 10) : member.password;

        // If membership_valid_until is in the past, automatically set to Unpaid
        let finalPaidStatus = paid_status;
        let finalMembershipValidUntil = membership_valid_until;

        if (membership_valid_until) {
            const expiryDate = new Date(membership_valid_until);
            const today = new Date();

            if (expiryDate < today) {
                finalPaidStatus = 'Unpaid';
                finalMembershipValidUntil = null;
            }
        }

        // Logic for Paid vs Unpaid
        if (finalPaidStatus === 'Paid') {
            if (!finalMembershipValidUntil) {
                return res.status(400).json({
                    success: false,
                    msg: 'membership_valid_until is required when paid_status is Paid',
                });
            }
        } else {
            finalMembershipValidUntil = null;
        }

        // Update Member
        await member.update({
            first_name, last_name, email, password: updatedPassword,
            dob, gender, join_date, aadhar_no, blood_group,
            contact_no, alternate_contact_no, marital_status,
            address, city, state, zip_code, profile_image,
            work_phone, extension, mobile_no, preferred_contact,
            secondary_email, emergency_contact, emergency_phone,
            personal_website, linkedin_profile, facebook,
            instagram, twitter, youtube, kootam, kovil, best_time_to_contact,
            status, access_level,
            rejection_reason: status === 'Rejected' ? rejection_reason : null,
            paid_status: finalPaidStatus,
            membership_valid_until: finalMembershipValidUntil,
            Arakattalai, // ✅ save Arakattalai
            KNS_Member, // ✅ forum membership
            KBN_Member, // ✅ forum membership
            BNI, // ✅ forum membership
            Rotary, // ✅ forum membership
            Lions, // ✅ forum membership
            Other_forum, // ✅ other forum
            pro,
            core_pro,
            squad,
            squad_fields
        }, { transaction: t });

        // Handle referral update
        if (referral_code) {
            const referrer = await Member.findOne({
                where: { application_id: referral_code }
            });

            if (!referrer) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    msg: 'Invalid referral code',
                });
            }

            // Check if referral already exists
            const existingReferral = await Referral.findOne({
                where: { member_id: memberId },
                transaction: t
            });

            if (existingReferral) {
                // Update existing referral
                await existingReferral.update({
                    referral_name: referral_name || '',
                    referral_code,
                    referred_by_member_id: referrer.mid
                }, { transaction: t });
            } else {
                // Create new referral
                await Referral.create({
                    member_id: memberId,
                    referral_name: referral_name || '',
                    referral_code,
                    referred_by_member_id: referrer.mid,
                    reward_points: 10
                }, { transaction: t });

                // Update referrer's reward points
                await referrer.reload({ transaction: t });
                await Member.update(
                    { reward_points: (referrer.reward_points || 0) + 10 },
                    { where: { mid: referrer.mid }, transaction: t }
                );
            }
        }

        await t.commit();

        return res.status(200).json({
            success: true,
            msg: 'Member updated successfully',
            data: {
                mid: member.mid,
                email: member.email,
                profile_image,
                paid_status: finalPaidStatus,
                membership_valid_until: finalMembershipValidUntil
            }
        });

    } catch (error) {
        await t.rollback();

        // Cleanup uploaded files
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }

        console.error("Update member error:", error);
        return res.status(500).json({
            success: false,
            msg: 'Failed to update member',
            error: error.message,
        });
    }
};

// Add this function to automatically check and update expired memberships
const checkExpiredMemberships = async () => {
    try {
        const today = new Date();
        const expiredMembers = await Member.findAll({
            where: {
                paid_status: 'Paid',
                membership_valid_until: {
                    [Op.lt]: today
                }
            }
        });

        for (const member of expiredMembers) {
            await member.update({
                paid_status: 'Unpaid',
                membership_valid_until: null
            });
            console.log(`Updated member ${member.mid} from Paid to Unpaid due to expired membership`);
        }

        return expiredMembers.length;
    } catch (error) {
        console.error("Error checking expired memberships:", error);
        return 0;
    }
};

// Schedule this to run daily (add to your server startup)
const schedule = require('node-schedule');

// Run every day at 2:00 AM
schedule.scheduleJob('0 2 * * *', async () => {
    console.log('Checking for expired memberships...');
    const updatedCount = await checkExpiredMemberships();
    console.log(`Updated ${updatedCount} expired memberships`);
});

// Add this to your login logic
const checkMembershipStatus = async (member) => {
    if (member.paid_status === 'Paid' && member.membership_valid_until) {
        const expiryDate = new Date(member.membership_valid_until);
        const today = new Date();

        if (expiryDate < today) {
            await member.update({
                paid_status: 'Unpaid',
                membership_valid_until: null
            });
            console.log(`Updated member ${member.mid} status to Unpaid upon login`);
        }
    }
};

// Schedule the expiration check to run daily
const scheduleExpirationCheck = () => {
    // Run once immediately
    checkExpiredMemberships();

    // Then run every 24 hours
    setInterval(checkExpiredMemberships, 24 * 60 * 60 * 1000);
};

const updateBusinessProfile = async (req, res) => {
    const registrationTypeOptions = ["Proprietor", "Partnership", "Private Limited", "Others"];
    const t = await BusinessProfile.sequelize.transaction();
    try {
        const { id } = req.params;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                msg: "Validation errors",
                errors: errors.array(),
            });
        }

        const profile = await BusinessProfile.findByPk(id);
        if (!profile) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                msg: "Business profile not found",
            });
        }

        // Parse business data from request
        let businessData = req.body.business_profile || req.body;

        if (typeof businessData === 'string') {
            try {
                businessData = JSON.parse(businessData);
            } catch (e) {
                // If not JSON, use empty object
                businessData = {};
            }
        }

        // Handle profile image
        let business_profile_image = profile.business_profile_image;
        if (req.files?.profile_image?.[0]) {
            console.log('Received business_profile_image:', req.files.profile_image[0]);
            business_profile_image = req.files.profile_image[0].path.replace(/\\/g, "/");

            // Delete old profile image if it exists and is being replaced
            if (profile.business_profile_image && profile.business_profile_image !== business_profile_image) {
                console.log('Deleting old profile image:', profile.business_profile_image);
                try {
                    if (fs.existsSync(profile.business_profile_image)) {
                        fs.unlinkSync(profile.business_profile_image);
                    }
                } catch (deleteError) {
                    console.error('Error deleting old profile image:', deleteError);
                }
            }
        }

        // Handle media gallery - SIMPLIFIED LOGIC
        let finalMediaGallery = profile.media_gallery || '';
        let gallery_type = profile.media_gallery_type || 'image';

        // Process removed media
        if (req.body.removed_media) {
            try {
                const removedMedia = typeof req.body.removed_media === 'string'
                    ? JSON.parse(req.body.removed_media)
                    : req.body.removed_media;

                if (Array.isArray(removedMedia) && removedMedia.length > 0) {
                    const currentGallery = finalMediaGallery ? finalMediaGallery.split(',') : [];

                    // Filter out removed media and delete the files
                    finalMediaGallery = currentGallery
                        .filter(item => {
                            const shouldKeep = !removedMedia.includes(item);
                            if (!shouldKeep) {
                                // Delete the removed file
                                try {
                                    if (fs.existsSync(item)) {
                                        fs.unlinkSync(item);
                                    }
                                } catch (deleteError) {
                                    console.error('Error deleting media file:', deleteError);
                                }
                            }
                            return shouldKeep;
                        })
                        .join(',');
                }
            } catch (e) {
                console.error('Error parsing removed_media:', e);
            }
        }

        // Process new media gallery files
        if (req.files?.media_gallery && req.files.media_gallery.length > 0) {
            console.log('Received media_gallery:', req.files.media_gallery);
            const newGalleryPaths = req.files.media_gallery.map(file => file.path.replace(/\\/g, "/"));

            // Determine media type based on first file
            if (newGalleryPaths.length > 0) {
                gallery_type = /\.(mp4|mov|avi|mkv|webm|ogg)$/i.test(newGalleryPaths[0]) ? "video" : "image";
            }
            console.log('Gallery type:', gallery_type);
            // Add new files to existing gallery
            const currentGallery = finalMediaGallery ? finalMediaGallery.split(',') : [];
            finalMediaGallery = [...currentGallery, ...newGalleryPaths].join(',');
        }

        // Normalize business_type for conditional fields
        const newBusinessType = (businessData.business_type || profile.business_type || '').toString().toLowerCase();

        // FIXED: Handle business_registration_type and business_registration_type_other properly
        let normalizedUpdateBusinessRegistrationType = profile.business_registration_type;
        let businessRegistrationTypeOther = profile.business_registration_type_other;

        if (newBusinessType === 'self-employed' || newBusinessType === 'business') {
            const incomingRegType = (businessData.business_registration_type || '').toString();

            if (incomingRegType === 'Others') {
                // If selecting "Others", use the other field value
                normalizedUpdateBusinessRegistrationType = 'Others';
                businessRegistrationTypeOther = businessData.business_registration_type_other || '';
            } else if (incomingRegType && registrationTypeOptions.includes(incomingRegType)) {
                // If selecting a standard type, set it and clear the other field
                normalizedUpdateBusinessRegistrationType = incomingRegType;
                businessRegistrationTypeOther = null; // Clear the other field when not using "Others"
            }
            // If incomingRegType is empty, keep the existing values
        } else {
            // For salary type, clear these fields
            normalizedUpdateBusinessRegistrationType = null;
            businessRegistrationTypeOther = null;
        }

        // Build update payload
        const updatePayload = {
            member_id: businessData.member_id || profile.member_id,
            company_name: businessData.company_name || profile.company_name,
            business_type: businessData.business_type || profile.business_type,
            salary: businessData.salary || profile.salary,
            category_id: businessData.category_id ? Number(businessData.category_id) : profile.category_id,
            branch_name: Array.isArray(businessData.branches) ? businessData.branches.map(branch => branch.branch_name) : [profile.branch_name],
            company_address: Array.isArray(businessData.branches) ? businessData.branches.map(branch => branch.company_address) : [profile.company_address],
            city: Array.isArray(businessData.branches) ? businessData.branches.map(branch => branch.city) : [profile.city],
            state: Array.isArray(businessData.branches) ? businessData.branches.map(branch => branch.state) : [profile.state],
            zip_code: Array.isArray(businessData.branches) ? businessData.branches.map(branch => branch.zip_code) : [profile.zip_code],
            email: Array.isArray(businessData.branches) ? businessData.branches.map(branch => branch.email) : [profile.email],
            business_starting_year: newBusinessType === 'self-employed'
                ? (businessData.business_starting_year || businessData.startingYear || profile.business_starting_year)
                : (newBusinessType !== profile.business_type ? null : profile.business_starting_year),
            business_work_contract: Array.isArray(businessData.branches) ? businessData.branches.map(branch => branch.business_work_contract) : [profile.business_work_contract],

            // FIXED: Business registration type fields
            business_registration_type: normalizedUpdateBusinessRegistrationType,
            business_registration_type_other: businessRegistrationTypeOther,

            about: newBusinessType === 'self-employed'
                ? (businessData.about || businessData.description || profile.about)
                : (newBusinessType !== profile.business_type ? null : profile.about),

            // Salary-specific fields
            designation: newBusinessType === 'salary'
                ? (businessData.designation || profile.designation)
                : (newBusinessType !== profile.business_type ? null : profile.designation),

            location: businessData.location || profile.location,
            experience: businessData.experience || profile.experience,

            // Common fields
            staff_size: businessData.staff_size || profile.staff_size,
            source: businessData.source || profile.source,
            tags: businessData.tags || profile.tags,
            website: businessData.website || profile.website,
            google_link: businessData.google_link || profile.google_link,
            facebook_link: businessData.facebook_link || profile.facebook_link,
            instagram_link: businessData.instagram_link || profile.instagram_link,
            linkedin_link: businessData.linkedin_link || profile.linkedin_link,
            exclusive_member_benefit: businessData.exclusive_member_benefit || profile.exclusive_member_benefit,

            // Media
            business_profile_image,
            media_gallery: finalMediaGallery,
            media_gallery_type: gallery_type,
            status: businessData.status || profile.status,
        };

        // Remove null/undefined values to avoid overwriting with null
        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] === null || updatePayload[key] === undefined) {
                delete updatePayload[key];
            }
        });

        console.log('Update payload:', updatePayload); // Debug log

        await profile.update(updatePayload, { transaction: t });
        await t.commit();

        // Return updated profile
        const updatedProfile = await BusinessProfile.findByPk(id);

        res.status(200).json({
            success: true,
            msg: "Business profile updated successfully",
            data: updatedProfile,
        });
    } catch (error) {
        await t.rollback();

        // Cleanup uploaded files if error occurs
        if (req.files) {
            Object.values(req.files).flat().forEach((file) => {
                try {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            });
        }

        console.error("Error updating business profile:", error);
        res.status(500).json({
            success: false,
            msg: "An error occurred while updating business profile",
            error: error.message,
        });
    }
};

const updateFamilyDetails = async (req, res) => {
    const t = await MemberFamily.sequelize.transaction();
    try {
        const {
            member_id,
            father_name,
            father_contact,
            mother_name,
            mother_contact,
            spouse_name,
            spouse_contact,
            number_of_children,
            children_names,
            address,
            marital_status
        } = req.body;

        // Check for existing family record
        const existingFamily = await MemberFamily.findOne({
            where: { member_id },
            transaction: t
        });

        // Build payload
        const familyPayload = {
            member_id,
            father_name: (father_name && String(father_name).trim()) || 'N/A',
            father_contact: (father_contact && String(father_contact).trim()) || 'N/A',
            mother_name: (mother_name && String(mother_name).trim()) || 'N/A',
            mother_contact: (mother_contact && String(mother_contact).trim()) || 'N/A',
            address: (address && String(address).trim()) || 'N/A',
        };

        // Handle spouse and children for married members
        if (marital_status?.toLowerCase().trim() === 'married') {
            familyPayload.spouse_name = (spouse_name && String(spouse_name).trim()) || 'N/A';
            familyPayload.spouse_contact = (spouse_contact && String(spouse_contact).trim()) || 'N/A';
            familyPayload.number_of_children = Number.isFinite(Number(number_of_children)) ? Number(number_of_children) : 0;

            if (
                number_of_children > 0 &&
                Array.isArray(children_names) &&
                children_names.length === Number(number_of_children)
            ) {
                familyPayload.children_names = JSON.stringify(children_names);
            } else {
                familyPayload.children_names = 'N/A';
            }
        }

        let result;
        if (existingFamily) {
            // Update existing family record
            await existingFamily.update(familyPayload, { transaction: t });
            result = await MemberFamily.findOne({
                where: { member_id },
                transaction: t
            });
        } else {
            // Create new family record
            result = await MemberFamily.create(familyPayload, { transaction: t });
        }

        await t.commit();

        res.status(200).json({
            success: true,
            msg: existingFamily ? 'Family details updated successfully' : 'Family details added successfully',
            data: result
        });

    } catch (error) {
        await t.rollback();
        console.error('Error updating/creating family details:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to update family details',
            error: error.message
        });
    }
};

// Add family details to a member (for members without existing family records)
const addFamilyDetails = async (req, res) => {
    const t = await MemberFamily.sequelize.transaction();
    try {
        const {
            member_id,
            father_name,
            father_contact,
            mother_name,
            mother_contact,
            spouse_name,
            spouse_contact,
            number_of_children,
            children_names,
            address
        } = req.body;

        // Check if member exists
        const member = await Member.findByPk(member_id);
        if (!member) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                msg: 'Member not found'
            });
        }

        // Check if family record already exists
        const existingFamily = await MemberFamily.findOne({
            where: { member_id },
            transaction: t
        });

        if (existingFamily) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                msg: 'Family details already exist for this member. Use update instead.'
            });
        }

        // Build payload
        const familyPayload = {
            member_id,
            father_name: (father_name && String(father_name).trim()) || 'N/A',
            father_contact: (father_contact && String(father_contact).trim()) || 'N/A',
            mother_name: (mother_name && String(mother_name).trim()) || 'N/A',
            mother_contact: (mother_contact && String(mother_contact).trim()) || 'N/A',
            address: (address && String(address).trim()) || 'N/A',
        };

        // Handle spouse and children for married members
        if (member.marital_status?.toLowerCase().trim() === 'married') {
            familyPayload.spouse_name = (spouse_name && String(spouse_name).trim()) || 'N/A';
            familyPayload.spouse_contact = (spouse_contact && String(spouse_contact).trim()) || 'N/A';
            familyPayload.number_of_children = Number.isFinite(Number(number_of_children)) ? Number(number_of_children) : 0;

            if (
                number_of_children > 0 &&
                Array.isArray(children_names) &&
                children_names.length === Number(number_of_children)
            ) {
                familyPayload.children_names = JSON.stringify(children_names);
            } else {
                familyPayload.children_names = 'N/A';
            }
        }

        // Create new family record
        const newFamily = await MemberFamily.create(familyPayload, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            msg: 'Family details added successfully',
            data: newFamily
        });

    } catch (error) {
        await t.rollback();
        console.error('Error adding family details:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to add family details',
            error: error.message
        });
    }
};

// DELETE: Member
const deleteMember = async (req, res) => {
    const t = await Member.sequelize.transaction();
    try {
        const { id } = req.params;

        // Delete dependent notifications first
        await Notification.destroy({
            where: { receiver_id: id },
            transaction: t
        });

        // Delete the member
        const deleted = await Member.destroy({
            where: { mid: id },
            transaction: t
        });

        if (deleted === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, msg: 'Member not found' });
        }

        await t.commit();
        return res.json({ success: true, msg: 'Member deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error('Error deleting member:', error);
        return res.status(500).json({
            success: false,
            msg: 'Delete failed',
            error: error.message
        });
    }
};

const deleteBusinessProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await BusinessProfile.findByPk(id);

        if (!profile) {
            return res.status(404).json({ message: "Business profile not found" });
        }

        await profile.destroy();
        res.status(200).json({ message: "Business profile deleted successfully" });
    } catch (error) {
        console.error("Error deleting business profile:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

const deleteFamily = async (req, res) => {
    try {
        const { id } = req.params;

        const family = await MemberFamily.findByPk(id);
        if (!family) {
            return res.status(404).json({
                success: false,
                msg: 'Family record not found',
            });
        }

        await family.destroy();

        res.status(200).json({
            success: true,
            msg: 'Family record deleted successfully',
        });
    } catch (error) {
        console.error('Delete Family Error:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to delete family record',
            error: error.message,
        });
    }
};

// ✅ Add Business Profile for Existing Member
const addBusinessProfileForMember = async (req, res) => {
    const t = await BusinessProfile.sequelize.transaction();
    try {
        const { member_id } = req.params;

        // Check if member exists
        const member = await Member.findByPk(member_id);
        if (!member) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                msg: "Member not found",
            });
        }

        // Parse business_profiles from request
        let business_profiles = [];
        if (typeof req.body.business_profiles === 'string') {
            business_profiles = JSON.parse(req.body.business_profiles);
        } else {
            business_profiles = req.body.business_profiles || [];
        }

        if (!Array.isArray(business_profiles) || business_profiles.length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                msg: 'At least one business profile is required',
            });
        }

        // Loop through and create each business profile
        const createdProfiles = [];
        for (let i = 0; i < business_profiles.length; i++) {
            const profile = business_profiles[i];

            const business_profile_image = req.files?.[`business_profile_image_${i}`]?.[0]?.path.replace(/\\/g, "/") || null;
            const gallery_files = req.files?.[`media_gallery_${i}`] || [];
            const gallery_paths = gallery_files.map(file => file.path.replace(/\\/g, "/"));
            const gallery_type = gallery_paths.length > 0
                ? /\.(mp4|mov|avi|mkv)$/i.test(gallery_paths[0]) ? 'video' : 'image'
                : null;

            // Handle category logic (same as registerMember)
            let category_id = profile.category_id ? Number(profile.category_id) : null;
            if (category_id) {
                const existingCategory = await Categories.findByPk(category_id);
                if (!existingCategory) category_id = null;
            }
            if (!category_id && profile.new_category_name && String(profile.new_category_name).trim()) {
                const name = String(profile.new_category_name).trim();
                const existingByName = await Categories.findOne({ where: { category_name: name } });
                const createdOrExisting = existingByName || await Categories.create({ category_name: name }, { transaction: t });
                category_id = createdOrExisting.cid;
            }

            // Normalize business_registration_type - handle "Others" case (same as registerMember)
            let normalizedBusinessRegistrationType = null;
            if (profile.business_type === 'self-employed' || profile.business_type === 'business') {
                if (profile.business_registration_type && profile.business_registration_type !== 'Others') {
                    normalizedBusinessRegistrationType = profile.business_registration_type;
                } else if (profile.business_registration_type === 'Others' && profile.business_registration_type_other) {
                    normalizedBusinessRegistrationType = profile.business_registration_type_other.trim();
                }
            }

            // Create business profile with same structure as registerMember
            const newProfile = await BusinessProfile.create({
                member_id: member.mid,
                company_name: profile.company_name,
                business_type: profile.business_type,
                salary: profile.salary,
                category_id,

                // Self-employed and Business fields
                business_registration_type: normalizedBusinessRegistrationType,
                about: (profile.business_type === 'self-employed' || profile.business_type === 'business') ? profile.about : null,
                branch_name: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.branch_name) : [profile.branch_name],
                company_address: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.address) : [profile.company_address],
                city: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.city) : [profile.city],
                state: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.state) : [profile.state],
                zip_code: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.zip_code) : [profile.zip_code],
                email: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.email) : [profile.email],
                business_work_contract: Array.isArray(profile.branches) ? profile.branches.map(branch => branch.business_work_contract) : [profile.business_work_contract],

                // Business-specific fields
                staff_size: profile.business_type === 'business' ? profile.staff_size : null,

                // Salary fields
                designation: profile.business_type === 'salary' ? profile.designation : null,
                location: Array.isArray(profile.location) ? profile.location : [profile.location],
                experience: profile.experience || null,

                // Common fields
                source: profile.source || null,
                tags: profile.tags || null,
                website: profile.website || null,
                google_link: profile.google_link || null,
                facebook_link: profile.facebook_link || null,
                instagram_link: profile.instagram_link || null,
                linkedin_link: profile.linkedin_link || null,
                exclusive_member_benefit: profile.exclusive_member_benefit || null,

                // Media
                business_profile_image,
                media_gallery: gallery_paths.join(','),
                media_gallery_type: gallery_type,
                status: "Approved",
            }, { transaction: t });

            createdProfiles.push(newProfile.get({ plain: true }));
        }

        await t.commit();

        res.status(201).json({
            success: true,
            msg: 'Business profile(s) added successfully for existing member',
            profiles: createdProfiles,
        });

    } catch (error) {
        await t.rollback();

        // Cleanup uploaded files if error occurs (same as registerMember)
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        console.error("Error adding business profiles:", error);
        res.status(500).json({
            success: false,
            msg: 'An error occurred while adding business profiles',
            error: error.message,
        });
    }
};

// GET: All Business Profiles (optionally by member_id via query params)
// const getAllBusinessProfiles = async (req, res) => {
//     try {
//         const { member_id } = req.query;
//         const whereClause = member_id ? { member_id } : {};

//         const profiles = await BusinessProfile.findAll({
//             where: whereClause,
//             include: [{ model: Member, as: 'Member', attributes: ['mid', 'first_name', 'email', 'profile_image'] }],
//         });

//         res.status(200).json({
//             success: true,
//             data: profiles,
//         });
//     } catch (err) {
//         console.error("Error fetching business profiles:", err);
//         res.status(500).json({
//             success: false,
//             msg: 'Failed to retrieve business profiles',
//             error: err.message,
//         });
//     }
// };

const getAllBusinessProfiles = async (req, res) => {
    try {
        const { member_id } = req.query;
        const whereClause = member_id ? { member_id } : {};

        const profiles = await BusinessProfile.findAll({
            where: whereClause,
            include: [
                {
                    model: Member,
                    as: 'Member',
                    attributes: ['mid', 'first_name', 'email', 'profile_image'],
                },
            ],
        });

        const transformedProfiles = profiles.map((profile) => {
            const p = profile.get({ plain: true });

            // Helper to safely parse JSON arrays
            const parseArray = (val) => {
                if (!val) return [];
                try {
                    const parsed = JSON.parse(val);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            };

            const branchNames = parseArray(p.branch_name);
            const companyAddresses = parseArray(p.company_address);
            const cities = parseArray(p.city);
            const states = parseArray(p.state);
            const zips = parseArray(p.zip_code);
            const emails = parseArray(p.email);
            const workContacts = parseArray(p.business_work_contract);

            // Combine all parsed arrays into a clean branches array
            const branches = branchNames.map((_, i) => ({
                branch_name: branchNames[i] || '',
                company_address: companyAddresses[i] || '',
                city: cities[i] || '',
                state: states[i] || '',
                zip_code: zips[i] || '',
                email: emails[i] || '',
                business_work_contract: workContacts[i] || '',
            })).filter(
                (b) =>
                    b.branch_name ||
                    b.company_address ||
                    b.city ||
                    b.state ||
                    b.zip_code ||
                    b.email ||
                    b.business_work_contract
            ); // remove empty branches

            // Return cleaned-up profile object
            return {
                id: p.id,
                member_id: p.member_id,
                company_name: p.company_name,
                company_address: p.company_address,
                city: p.city,
                state: p.state,
                zip_code: p.zip_code,
                email: p.email,
                business_type: p.business_type,
                category_id: p.category_id,
                business_registration_type: p.business_registration_type,
                // business_starting_year: p.business_starting_year,
                staff_size: p.staff_size,
                experience: p.experience,
                business_work_contract: p.business_work_contract,
                about: p.about,
                tags: p.tags,
                website: p.website,
                google_link: p.google_link,
                facebook_link: p.facebook_link,
                instagram_link: p.instagram_link,
                linkedin_link: p.linkedin_link,
                designation: p.designation,
                salary: p.salary,
                // location: p.location,
                status: p.status,
                business_profile_image: p.business_profile_image,
                media_gallery: p.media_gallery,
                media_gallery_type: p.media_gallery_type,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                branches,
                Member: p.Member,
            };
        });

        res.status(200).json({
            success: true,
            data: transformedProfiles,
        });
    } catch (err) {
        console.error("Error fetching business profiles:", err);
        res.status(500).json({
            success: false,
            msg: 'Failed to retrieve business profiles',
            error: err.message,
        });
    }
};

// GET: One Business Profile by ID
const getBusinessProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await BusinessProfile.findByPk(id, {
            include: [
                {
                    model: Member,
                    as: 'Member',
                    attributes: [
                        'mid', 'first_name', 'email', 'dob', 'gender', 'contact_no', 'address',
                        'city', 'state', 'zip_code', 'profile_image', 'alternate_contact_no', 'best_time_to_contact', 'profile_image'
                    ],
                    include: [
                        {
                            model: MemberFamily,
                            as: 'MemberFamily',
                            attributes: [
                                'father_name', 'father_contact',
                                'mother_name', 'mother_contact',
                                'spouse_name', 'spouse_contact'
                            ]
                        }
                    ]
                }
            ]
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                msg: 'Business profile not found',
            });
        }

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (err) {
        console.error("Error fetching business profile:", err);
        res.status(500).json({
            success: false,
            msg: 'Failed to fetch business profile',
            error: err.message,
        });
    }
};

// GET: Pro Members (for Core Pro dropdown)
const getProMembers = async (req, res) => {
    try {
        console.log('Fetching pro members');
        const members = await Member.findAll({
            where: { pro: 'Pro' },
            attributes: ['mid', 'first_name', 'email']
        });
        console.log('Pro members fetched:', members);
        return res.status(200).json({ success: true, data: members });
    } catch (error) {
        console.error('Error fetching pro members:', error);
        return res.status(500).json({ success: false, msg: 'Failed to fetch pro members', error: error.message });
    }
};

// ✅ Add Family Information for Existing Member
const addFamilyForMember = async (req, res) => {
    const t = await MemberFamily.sequelize.transaction();
    try {
        const { member_id } = req.params;

        // Check if member exists
        const member = await Member.findByPk(member_id);
        if (!member) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                msg: "Member not found",
            });
        }

        // Check if family record already exists for this member
        const existingFamily = await MemberFamily.findOne({
            where: { member_id },
            transaction: t
        });

        if (existingFamily) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                msg: "Family information already exists for this member. Use update instead.",
            });
        }

        // Parse family_details (same as registerMember)
        let family_details = {};
        if (typeof req.body.family_details === 'string') {
            family_details = JSON.parse(req.body.family_details);
        } else {
            family_details = req.body.family_details || {};
        }

        if (Object.keys(family_details).length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                msg: 'Family details are required',
            });
        }

        // Extract family details (same structure as registerMember)
        const {
            father_name,
            father_contact,
            mother_name,
            mother_contact,
            spouse_name,
            spouse_contact,
            number_of_children,
            address: family_address,
            children_names = []
        } = family_details;

        // Get marital_status from member record
        const { marital_status } = member;

        // Build family payload (same logic as registerMember)
        const familyPayload = {
            member_id: member.mid,
            father_name: (father_name && String(father_name).trim()) || 'N/A',
            father_contact: (father_contact && String(father_contact).trim()) || 'N/A',
            mother_name: (mother_name && String(mother_name).trim()) || 'N/A',
            mother_contact: (mother_contact && String(mother_contact).trim()) || 'N/A',
            address: (family_address && String(family_address).trim()) || 'N/A',
        };

        // Add spouse and children details if married (same logic as registerMember)
        if (marital_status?.toLowerCase().trim() === 'married') {
            familyPayload.spouse_name = (spouse_name && String(spouse_name).trim()) || 'N/A';
            familyPayload.spouse_contact = (spouse_contact && String(spouse_contact).trim()) || 'N/A';
            familyPayload.number_of_children = Number.isFinite(Number(number_of_children)) ? Number(number_of_children) : 0;

            if (
                number_of_children > 0 &&
                Array.isArray(children_names) &&
                children_names.length === Number(number_of_children)
            ) {
                familyPayload.children_names = JSON.stringify(children_names);
            } else {
                familyPayload.children_names = 'N/A';
            }
        }

        // Create family record
        const newFamily = await MemberFamily.create(familyPayload, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            msg: 'Family information added successfully',
            data: newFamily
        });

    } catch (error) {
        await t.rollback();
        console.error("Error adding family information:", error);
        res.status(500).json({
            success: false,
            msg: 'An error occurred while adding family information',
            error: error.message,
        });
    }
};


module.exports = {
    registerMember,
    loginMember,
    logoutMember,
    verifyMemberToken,
    getAllMembers,
    getMemberById,
    updateMember,
    deleteMember,
    updateBusinessProfile,
    updateFamilyDetails,
    addFamilyDetails,
    deleteBusinessProfile,
    deleteFamily,
    addBusinessProfileForMember,
    getAllBusinessProfiles,
    getBusinessProfileById,
    addFamilyForMember,
    checkExpiredMemberships,
    scheduleExpirationCheck,
    getProMembers
};