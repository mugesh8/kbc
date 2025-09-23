const BusinessProfile = require('../model/business');
// const Member = require('../model/member');
const { Member } = require('../model/index');

const addBusinessProfile = async (req, res) => {
    try {
        const {
            member_id,
            company_name,
            business_type,
            business_registration_type,
            business_registration_type_other,
            about,
            company_address,
            city,
            state,
            zip_code,
            business_starting_year,
            staff_size,
            business_work_contract,
            email,
            source,
            tags,
            website,
            google_link,
            facebook_link,
            instagram_link,
            linkedin_link,
            designation,
            salary,
            location,
            experience,
            contact_no,
        } = req.body;

        // Validate required fields
        if (!member_id || !business_type || !company_name) {
            return res.status(400).json({ 
                message: "member_id, business_type, and company_name are required fields" 
            });
        }

        // Validate business_type enum values
        if (!['self-employed', 'salary', 'business'].includes(business_type)) {
            return res.status(400).json({ 
                message: "business_type must be either 'self-employed', 'business', or 'salary'" 
            });
        }

        // Handle business_registration_type with proper case and "Others" logic
        let normalizedBusinessRegistrationType = null;
        if (business_type === 'self-employed' || business_type === 'business') {
            if (business_registration_type && business_registration_type !== 'Others') {
                normalizedBusinessRegistrationType = business_registration_type;
            } else if (business_registration_type === 'Others' && business_registration_type_other) {
                normalizedBusinessRegistrationType = business_registration_type_other.trim();
            }
        }

        const business_profile_image = req.files?.['business_profile_image']
            ? req.files['business_profile_image'][0].path.replace(/\\/g, "/")
            : null;

        const media_gallery_files = req.files?.['media_gallery']
            ? req.files['media_gallery'].map(file => file.path.replace(/\\/g, "/"))
            : [];

        const media_gallery_type = media_gallery_files.length > 0
            ? /\.(mp4|mov|avi|mkv)$/i.test(media_gallery_files[0]) ? 'video' : 'image'
            : null;

        // Prepare profile data based on business type
        const profileData = {
            member_id,
            company_name,
            business_type,
            email,
            source,
            tags,
            website,
            google_link,
            facebook_link,
            instagram_link,
            linkedin_link,
            business_profile_image,
            media_gallery: media_gallery_files.join(','),
            media_gallery_type,
        };

        // Add fields based on business type
        if (business_type === 'self-employed' || business_type === 'business') {
            profileData.business_registration_type = normalizedBusinessRegistrationType;
            profileData.about = about;
            profileData.company_address = company_address;
            profileData.city = city;
            profileData.state = state;
            profileData.zip_code = zip_code;
            profileData.business_starting_year = business_starting_year;
            profileData.business_work_contract = business_work_contract;
            profileData.contact_no = contact_no;
            
            if (business_type === 'business') {
                profileData.staff_size = staff_size;
            }
            if (business_type === 'self-employed') {
                profileData.experience = experience;
            }
        } else if (business_type === 'salary') {
            profileData.designation = designation;
            profileData.salary = salary;
            profileData.location = location;
            profileData.experience = experience;
        }

        const newProfile = await BusinessProfile.create(profileData);

        res.status(201).json({
            message: "Business profile created successfully",
            profile: newProfile,
            uploaded_media: {
                business_profile_image,
                media_gallery_files,
            }
        });
    } catch (error) {
        console.error("Error saving business profile:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getAllBusinessProfiles = async (req, res) => {
  try {
    const profiles = await BusinessProfile.findAll({
      include: [
        {
          model: Member,
          as: 'member', // this alias must match the one defined in belongsTo()
          attributes: ['first_name', 'last_name'],
        },
      ],
    });

    res.status(200).json({ profiles });
  } catch (error) {
    console.error("Error fetching business profiles:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getBusinessProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await BusinessProfile.findByPk(id, {
            include: [
        {
          model: Member,
          as: 'member', // this alias must match the one defined in belongsTo()
          attributes: ['first_name', 'last_name'],
        },
      ],
        });

        if (!profile) {
            return res.status(404).json({ message: "Business profile not found" });
        }

        res.status(200).json({ profile });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

const updateBusinessProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await BusinessProfile.findByPk(id);

        if (!profile) {
            return res.status(404).json({ message: "Business profile not found" });
        }

        const {
            member_id,
            company_name,
            business_type,
            business_registration_type,
            business_registration_type_other,
            about,
            company_address,
            city,
            state,
            zip_code,
            business_starting_year,
            staff_size,
            business_work_contract,
            email,
            source,
            tags,
            website,
            google_link,
            facebook_link,
            instagram_link,
            linkedin_link,
            designation,
            salary,
            location,
            experience,
            contact_no,
        } = req.body;

        // Handle business_registration_type with "Others" logic
        let normalizedBusinessRegistrationType = null;
        if (business_type === 'self-employed' || business_type === 'business') {
            if (business_registration_type && business_registration_type !== 'Others') {
                normalizedBusinessRegistrationType = business_registration_type;
            } else if (business_registration_type === 'Others' && business_registration_type_other) {
                normalizedBusinessRegistrationType = business_registration_type_other.trim();
            }
        }

        const business_profile_image = req.files?.['business_profile_image']
            ? req.files['business_profile_image'][0].path.replace(/\\/g, "/")
            : profile.business_profile_image;

        const media_gallery_files = req.files?.['media_gallery']
            ? req.files['media_gallery'].map(file => file.path.replace(/\\/g, "/"))
            : (profile.media_gallery ? profile.media_gallery.split(',') : []);

        const media_gallery_type = media_gallery_files.length > 0
            ? /\.(mp4|mov|avi|mkv)$/i.test(media_gallery_files[0]) ? 'video' : 'image'
            : profile.media_gallery_type;

        const updateData = {
            member_id,
            company_name,
            business_type,
            email,
            source,
            tags,
            website,
            google_link,
            facebook_link,
            instagram_link,
            linkedin_link,
            business_profile_image,
            media_gallery: media_gallery_files.join(','),
            media_gallery_type,
        };

        // Update fields based on business type
        if (business_type === 'self-employed' || business_type === 'business') {
            updateData.business_registration_type = normalizedBusinessRegistrationType;
            updateData.about = about;
            updateData.company_address = company_address;
            updateData.city = city;
            updateData.state = state;
            updateData.zip_code = zip_code;
            updateData.business_starting_year = business_starting_year;
            updateData.business_work_contract = business_work_contract;
            updateData.contact_no = contact_no;
            
            if (business_type === 'business') {
                updateData.staff_size = staff_size;
            }
            if (business_type === 'self-employed') {
                updateData.experience = experience;
            }
            
            // Clear salary fields
            updateData.designation = null;
            updateData.salary = null;
            updateData.location = null;
        } else if (business_type === 'salary') {
            updateData.designation = designation;
            updateData.salary = salary;
            updateData.location = location;
            updateData.experience = experience;
            
            // Clear self-employed/business fields
            updateData.business_registration_type = null;
            updateData.about = null;
            updateData.company_address = null;
            updateData.city = null;
            updateData.state = null;
            updateData.zip_code = null;
            updateData.business_starting_year = null;
            updateData.staff_size = null;
            updateData.business_work_contract = null;
            updateData.contact_no = null;
        }

        await profile.update(updateData);

        res.status(200).json({
            message: "Business profile updated successfully",
            profile,
            uploaded_media: {
                business_profile_image,
                media_gallery_files,
            },
        });
    } catch (error) {
        console.error("Error updating business profile:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
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

module.exports = {
    addBusinessProfile,
    getAllBusinessProfiles,
    getBusinessProfileById,
    updateBusinessProfile,
    deleteBusinessProfile
};