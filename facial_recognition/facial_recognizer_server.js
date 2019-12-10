const MODEL_URL = __dirname + '/weights'
const aws = require('aws-sdk')
aws.config.loadFromPath('./config.json')
const s3 = new aws.S3({ apiVersion: '2006-03-01', region: 'us-east-1' })
const faceapi = require('face-api.js')
const canvas = require('canvas')
const fs = require('fs')

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const Bucket = 'scalica-photos'

s3.listObjects({ Bucket }, async function (err, data) {
  if (err) {
    console.error(err, err.stack)
  } else {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL)
    content = "Detections\n"
    for (let i = 0; i < data.Contents.length; i++) {
      const img = await canvas.loadImage(`https://scalica-photos.s3.amazonaws.com/${data.Contents[i].Key}`)
      const detections = await faceapi.detectAllFaces(img)
      if (detections && detections.length > 0) {
        // TODO database update
        content += data.Contents[i].Key
        content += ` Deteced ${detections.length} faces\n`
      }
    }
    fs.writeFile('./detections.txt', content, (err) => {
      if(err) {
        console.error(err)
        return
      }
    })
  }
})

