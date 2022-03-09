const {database} = require('../models/db')
const express = require('express');
const applicationRouter = express.Router();
const twilio = require('twilio')
const fs = require('fs')
const blobStream = require('blob-stream')
const sgMail = require('@sendgrid/mail')
const http = require('http')
const xml2json = require('xml-js')


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
//getSeller
async function getSeller(phNo,res){
  const data = await database.firestore().collection('sellers').where('mobile_number','==',phNo).get()
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
//SellerOTP
applicationRouter.get("/sellerlogin", (req, res) => {
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
function hex_to_ascii(str1)
 {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }
applicationRouter.get("/sellerverify", (req, res) => {
  client.verify
    .services(otpservicekey)
    .verificationChecks.create({
      to: `+${req.query.phonenumber}`,
      code: req.query.code,
    })
    .then((data) => {
      console.log(data)
      getSeller(data.to.slice(3),res)
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
const testURL = 'http://developer.uidai.gov.in/otp/1.6//7/4/'
applicationRouter.get('/AadhaarOTP',(req,res)=>{
  var xmlbody = `
  <Otp uid="748652165926" ac="public" sa="public" ver="2.5" txn="PI" ts="2022-03-09T10:07:00" lk="MBni88mRNM18dKdiVyDYCuddwXEQpl68dZAGBQ2nsOlGMzC9DkOVL5s" type="A">
  <Opts ch="00"/>
  <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
    <ds:SignedInfo>
      <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
      <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
      <ds:Reference URI="">
        <ds:Transforms>
          <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
          <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
        </ds:Transforms>
        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
        <ds:DigestValue>rDII2JF/1YvGuxu7/ZoeLxrV/eSqbyLi1kUYVXjOY7I=</ds:DigestValue>
      </ds:Reference>
    </ds:SignedInfo>
    <ds:SignatureValue>Kq1laTkDYt+Kb/2gJA397tBc32vDs9vBgd3oE2Th5bvZOqWcdyWHUFBlxPS4BanfMXv9lkSkEEUxhXqRWhGyLsHGB4G/gsU89Ne0ls9jdGnueevgwM3UFN3ab05zifiv5ctK+nNzZeEGowT2+vfEfA5gyOKInsuDqhiAtzNAjATwjDi4j2v+sOVvDxJimk38a41K6F8At5wIBZ5mbPHoXXWjSL+sHNVRQlxDx1w1MQXKSRaFN9oF2spPl273uQm/yQgU2mgFbwmPTVZRrxPlle0tB0b6qYpHWzY8dHcDdJADKbp19Kt3eBNYUdTKs4/nQJwLx9uxhbyvXIY7R0NecA==</ds:SignatureValue>
    <ds:KeyInfo>
      <ds:KeyValue>
        <ds:RSAKeyValue>
          <ds:Modulus>j5voZzCDT4wk/5hR49+UIIQFaPc90gI96cUyoRPFMAKmGWE8qM7ZcCdZTd+un5rvo0GoRtnlk6tR4TvQOP0EdmjuAWbvYE25TkAVjC8IbMJUG60TGBUB71tY7TtsbVMrB08Q9TM7Y7xBXthpocVT5J9lM9FqbfJyfqd8hx6572fUgfqwB0KBx+IqmAFht6esb671s1Wu9qxgJc9QGpLULOxUa/vl6R0K7u/FuvfD3jUo7fWR0JClVVqz6SEALe8wpaSFHvs8egZC/HnK+wZb1A9XD4ksdpsaVE17cLjExnWt0JSyVDtWyFCWQNAjGK72M6T4HXB7FPvzC1Ua+6eiWQ==</ds:Modulus>
          <ds:Exponent>AQAB</ds:Exponent>
        </ds:RSAKeyValue>
      </ds:KeyValue>
    </ds:KeyInfo>
  </ds:Signature>
</Otp>
  `
   var postBody = {
    host: "developer.uidai.gov.in",
    path: "/otp/1.6/public/7/4/MMxNu7a6589B5x5RahDW-zNP7rhGbZb5HsTRwbi-VVNxkoFmkHGmYKM",
    port: 80,
    method: "POST",
    headers: {
        'Cookie': "cookie",
        'Content-Type': 'application/xml',
        'Content-Length': Buffer.byteLength(xmlbody)
    },
  }
  var request = http.request(postBody,(response)=>{
    response.on('data',(data)=>{
      const str = data.toString('hex').match(/../g).join(' ')
      const newstr = str.split(" ")
      var strnew = ""
      console.log(newstr)
      newstr.forEach((str)=>{
        strnew+=hex_to_ascii(str)
      })
      console.log(strnew)
      const result = xml2json.xml2json(strnew,{compact:true,spaces:4})
      console.log(JSON.parse(result).OtpRes._attributes.err)
    });
    response.on('end',(data)=>console.log('end'));
    response.on('error',(err)=>console.log('error'));
  })
  request.write(xmlbody)
  request.end()
  res.status(200).send('Request Sent')
})
module.exports = {
    applicationRouter
}
