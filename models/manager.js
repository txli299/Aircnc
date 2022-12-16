const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManagerSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name cannot be blank']
    },
    password:{
        type: String,
        required: [true, 'Password cannot be blank']
    }
});

module.exports = mongoose.model("Manager", ManagerSchema);