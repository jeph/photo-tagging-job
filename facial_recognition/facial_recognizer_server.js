const MODEL_URL = __dirname + '/weights'
const aws = require('aws-sdk')
aws.config.loadFromPath('./config.json')
const config = require('./config.js');
const s3 = new aws.S3({ apiVersion: '2006-03-01', region: 'us-east-1' })
const faceapi = require('face-api.js')
const canvas = require('canvas')
//const cron = require('node-cron')
const mysql = require('mysql');
//require('@tensorflow/tfjs-node');

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const Bucket = 'scalica-photos'

// cron.schedule("* */30 * * * *", function() {
//   console.log("running a task every 30 minutes");
//   scanPhotos();
// });

const con = mysql.createConnection(config.databaseOptions);

s3.listObjects({ Bucket }, async function (err, data) {
  if (err) {
    console.error(err, err.stack)
  } else {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL)
    for (let i = 0; i < data.Contents.length; i++) {
      const img = await canvas.loadImage(`https://scalica-photos.s3.amazonaws.com/${data.Contents[i].Key}`)
      const detections = await faceapi.detectAllFaces(img)
      if (detections && detections.length > 0) {
        // TODO database update
        console.log(`Detected ${detections.length} faces`)
        
        con.connect((err) => {
          if(err){
            console.log('Error connecting to Db');
            return;
          }
          console.log('Connection established');
          // var sql = "INSERT INTO db (field1, field2) 
          //            VALUES ('value', 'value')";
          // con.query(sql, function (err, result) {
          //   if (err) throw err;
          //   console.log("1 record inserted");
          // });
        });

        con.end((err) => {
          // The connection is terminated gracefully
          // Ensures all previously enqueued queries are still
          // before sending a COM_QUIT packet to the MySQL server.
        });
      }
    }
  }
})
