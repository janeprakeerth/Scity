const firebase = require('firebase-admin')
const config = require('../config')
const serviceAccount = require('../scity-99abd-firebase-adminsdk-k5tu8-302a98fae9.json')


const database = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
})

module.exports = {
    database
}
