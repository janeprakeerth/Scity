const http = require('http')
const {app} = require('./app')
const config = require('../config')
const {run} = require('./app')

const server = http.createServer(app)
server.listen(config.port,()=>{
    console.log(`listening on Port: ${config.port}`)
})