const http = require('http')
const {app} = require('./app')
const config = require('../config')
const launchModel = require('../models/sampleModel')

const server = http.createServer(app)
server.listen(3000,()=>{
    console.log(`Listening on port: 3000`)
})