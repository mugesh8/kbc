const express = require('express');
const router = express.Router();
const ratingController = require('../controller/ratingsController');

router.post('/ratings', ratingController.createRating);

router.get('/ratings/all', ratingController.getAllRatings);

router.get('/ratings/:business_id', ratingController.getRatingsByBusiness);

router.patch('/:rid/status', ratingController.updateRatingStatus);

module.exports = router;
