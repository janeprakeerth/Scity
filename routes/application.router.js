const {database} = require('../models/db')
const express = require('express');
const applicationRouter = express.Router();
const twilio = require('twilio')
const fs = require('fs')
const blobStream = require('blob-stream')
const sgMail = require('@sendgrid/mail')


const {twiliosid,twilio_authtoken,sendGridKey,otpservicekey} = require('../config')
const client = twilio(twiliosid,twilio_authtoken)
const PDFDocs = require('pdfkit');
const { application } = require('express');
applicationRouter.get('/data1',(req,res)=>{
    console.log(`${__dirname}\\output.pdf`)
    res.send('Hello')
})
const bnda = "iYPvmw4SUQSWoCAP53OEa80J1C02"
async function getUser(phNo,res){
  const data = await database.firestore().collection('users').where('mobile_number','==',phNo).get()
  if(data.length==0){
    res.status(200).send(
      {
      status: 'failure',
      })
  }else{
    data.forEach(d=>{
      console.log(d.data().emailid)
      res.status(200).send(
        {
        status: 'success',
        emailid: d.data().emailid,
        password: d.data().password
      }
      )
    })
  }
  console.log(data)
}
applicationRouter.get('/data',async (req,res)=>{
    const data = await database.firestore().collection('users').doc(`${bnda}`).get()
    console.log(data.data())
    console.log(`Request Received`)
        const phNo = '+919903949719'
        console.log(phNo)
        const OTP = Math.random().toString().slice(2,9)
        client.messages.create({
            body:`Your OTP for Registration is: ${OTP}`,
            from: '+19105861382',
            to: phNo
        }).then(response =>{
            console.log(typeof(response))
            res.status(200).send({status:'Success'})
        })
        .catch((e)=>{
            console.log(e)
            res.status(400).json({status:'Failure hai tu'})
        })
});
applicationRouter.get("/userlogin", (req, res) => {
    client.verify
      .services(otpservicekey)
      .verifications.create({
        to: `+${req.query.phonenumber}`,
        channel: req.query.channel,
      })
      .then((data) => {
        res.status(200).send(data)
      });
  });

  applicationRouter.get("/userverify", (req, res) => {
    client.verify
      .services(otpservicekey)
      .verificationChecks.create({
        to: `+${req.query.phonenumber}`,
        code: req.query.code,
      })
      .then((data) => {
        console.log(data)
        getUser(data.to.slice(3),res)
      })
      .catch((err) => {
        console.log(err);
      });
  });

applicationRouter.post('/generateInvoice',(req,res)=>{
    const object = req.body
    const doc = new PDFDocs();
    doc.pipe(fs.createWriteStream('output1.pdf'));
    doc
  .fontSize(25)
  .text(`UserID: ${object.userid}\nItem_ID: ${object.purchaseDeets[0].item_id}`, 100, 100);
// Finalize PDF file
doc.end();      
res.send('Received')
})

applicationRouter.get('/assign',async (req,res)=>{
    const response = await database.firestore().collection('DeliveryRider').where('AvailabilityStatus','==',true).get()
    const availableRiders = []
    response.forEach(r=>{
        console.log(r.id)
        availableRiders.push(r.id)
    })
    database.firestore().collection('DeliveryRider').doc(availableRiders[0]).update({
        AvailabilityStatus: false
    })
    res.send('Hello')
})

sgMail.setApiKey(sendGridKey)
applicationRouter.get('/sendMail',(req,res)=>{
    console.log('${__dirname}\\output.pdf')
    const msg = {
        to:'shubro18@gmail.com',
        from:'yorb999@gmail.com',
        subject:'Hello from Scity',
        text:'Test Email',
        attachments:[
            {
                content: `${__dirname}\\output1.pdf`,
                filename:'invoice.pdf',
                type:'application.pdf',
                disposition:'attachment'
            }
        ]
    }    
    sgMail.send(msg).catch(err=>{
        console.log(err)
    })
    res.send('Sent')
})
module.exports = {
    applicationRouter
}