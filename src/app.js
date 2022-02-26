const express = require('express')
const cors = require('cors')
const {applicationRouter} = require('../routes/application.router')
const {database} = require('../models/db')
const app = express()



app.use(express.json())
app.use(applicationRouter)
app.use(express.static(`${__dirname}\\staticfiles`))
console.log(`${__dirname}\\routes\\staticfiles`)
module.exports = {
    app
}