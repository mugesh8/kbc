// const Ratings = require('../model/ratings');
// const Member = require('../model/member');
// const BusinessProfile = require('../model/business');
const Notification = require('../model/notification');
const { Ratings, Member, BusinessProfile } = require('../model/index');

const createRating = async (req, res) => {
    try {
        const { member_id, business_id, message, rating } = req.body;

        if (!member_id || !business_id || !rating) {
            return res.status(400).json({ error: 'member_id, business_id, and rating are required.' });
        }

        if (rating < 1 || rating > 5) { 
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }

        const memberExists = await Member.findOne({ where: { mid: member_id } });
        const businessExists = await BusinessProfile.findOne({ where: { id: business_id } });

        if (!memberExists) return res.status(404).json({ error: 'Member not found.' });
        if (!businessExists) return res.status(404).json({ error: 'Business not found.' });

        const newRating = await Ratings.create({
            member_id,
            business_id,
            status: 'pending',
            message,
            rating
        });

        return res.status(201).json({
            message: 'Rating submitted successfully.',
            data: newRating,
        });
    } catch (err) {
        console.error('Error creating rating:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllRatings = async (req, res) => {
  try {
    const ratings = await Ratings.findAll({
      include: [
        {
          model: Member,
          as: 'ratedBy',
          attributes: ['mid', 'first_name', 'last_name', 'email', 'profile_image']
        },
        {
          model: BusinessProfile,
          as: 'business',
          attributes: ['id', 'company_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'All ratings fetched successfully.',
      data: ratings
    });
  } catch (error) {
    console.error("🔥 ERROR in GET /ratings/all:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);  // 👈 this is crucial
    res.status(500).json({ error: error.message }); // 👈 TEMPORARILY return real error to Postman
  }
};

const getRatingsByBusiness = async (req, res) => {
    try {
        const { business_id } = req.params;

        if (!business_id) return res.status(400).json({ error: 'Business ID is required.' });

        const ratings = await Ratings.findAll({
            where: {
                business_id,
                status: 'approved'
            },
            include: [{
                model: Member,
                as: 'ratedBy',
                attributes: ['mid', 'first_name', 'last_name', 'email', 'profile_image'],
            }],
            order: [['createdAt', 'DESC']]
        });


        return res.status(200).json({
            message: 'Ratings fetched successfully.',
            data: ratings,
        });
    } catch (err) {
        console.error('Error fetching ratings:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const updateRatingStatus = async (req, res) => {
  try {
    const { rid } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use "approved" or "rejected".' });
    }

    const rating = await Ratings.findByPk(rid);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found.' });
    }

    rating.status = status;
    await rating.save(); // ✅ fix here (removed `ils`)

    const business = await BusinessProfile.findByPk(rating.business_id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found for this rating.' });
    }

    if (status === 'approved') {
      await Notification.create({
        sender_id: rating.member_id,            
        receiver_id: business.member_id,        
        type: 'rating',
        related_id: rating.rid,
        message: `Your business received a new rating.`,
      });
    }

    if (status === 'rejected') {
      await Notification.create({
        sender_id: null,
        receiver_id: rating.member_id,
        type: 'rating',
        related_id: rating.rid,
        message: `Your rating was rejected by the admin.`,
      });
    }

    return res.status(200).json({
      message: `Rating ${status} successfully.`,
      data: rating,
    });

  } catch (err) {
    console.error('Error updating rating status:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
    createRating,
    getAllRatings,
    getRatingsByBusiness,
    updateRatingStatus
}