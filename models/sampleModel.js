const mongoose = require('mongoose')

const launchesSchema = new mongoose.Schema({
    flightNumber:Number,
    id_no:Number
})

const launchModel = mongoose.model('LaunchModel',launchesSchema)

module.exports = launchModel
