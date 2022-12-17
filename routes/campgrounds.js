const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1IjoidHVveGlubGkiLCJhIjoiY2xicHN2MzVnMGVkZjNxam5tNmh6aGxoZyJ9.r7Btc1hHMqHRU3UN75SsFQ';
const geocoder = mbxGeocoding({accessToken:mapBoxToken});

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
//show all camps
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));
// make new camp request
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

//receive the request and make request
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()    
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    req.flash('success', 'Successfully made a new housing!');
    res.redirect(`/campgrounds/${campground._id}`)
}))
//get to the specific camp
router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find that housing!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));
//edit the specific camp
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that housing!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))
//receive the specific edit request
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated housing!');
    res.redirect(`/campgrounds/${campground._id}`)
}));
//delete the camp
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted housing')
    res.redirect('/campgrounds');
}));

module.exports = router;