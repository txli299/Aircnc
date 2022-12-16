const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors, images } = require('./seedHelpers');
const Campground = require('../models/campground');
const Manager = require('../models/manager')
const bcrypt = require('bcrypt');
const req = require('express/lib/request');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1IjoidHVveGlubGkiLCJhIjoiY2xicHN2MzVnMGVkZjNxam5tNmh6aGxoZyJ9.r7Btc1hHMqHRU3UN75SsFQ';
const geocoder = mbxGeocoding({accessToken:mapBoxToken});


mongoose.connect('mongodb://localhost:27017/aircnc', {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)]


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 5; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*50)+10
        const location =`${cities[random1000].city}, ${cities[random1000].state}`
        const geoData = await geocoder.forwardGeocode({
            query:location,
            limit:1
        }).send()
        const camp = new Campground({
            location,
            geometry: geoData.body.features[0].geometry,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `${images[i]}`,
            price,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad, reprehenderit quaerat. Aliquam voluptates corporis ullam, culpa eaque dolorum error expedita vitae sapiente, cum modi non. Animi fugiat unde consequuntur ipsam!'
            
        })
        await camp.save();
    
    }
    
    
}

seedDB().then(() => {
    mongoose.connection.close();
})
