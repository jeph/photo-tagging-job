const MODEL_URL = __dirname + '/weights'
const aws = require('aws-sdk')
aws.config.loadFromPath('./config.json')
const dbConfig = require('../db-config')
const s3 = new aws.S3({ apiVersion: '2006-03-01', region: 'us-east-1' })
const faceapi = require('face-api.js')
const canvas = require('canvas')
const mysql = require('mysql')

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const Bucket = 'scalica-photos'

const CronJob = require('cron').CronJob
// eslint-disable-next-line no-new
new CronJob('*/30 * * * *', function () {
  s3.listObjects({ Bucket }, async function (err, data) {
    const con = mysql.createConnection(dbConfig)
    const timeCheckSql = 'SELECT * FROM last_scan_time WHERE id = 1'
    con.query(timeCheckSql, function (error, results) {
      if (error) {
        console.log(error)
      } else {
        const timeLastUpdated = new Date(results[0].last_scan_time).getTime() - 18000000
        const filteredData = data.Contents.filter((file) => {
          const fileTimeStamp = file.Key.match(/([^-]+)/g)[0]
          return timeLastUpdated < parseInt(fileTimeStamp)
        })
        console.log(filteredData)
        const timeUpdateSql = 'UPDATE last_scan_time SET last_scan_time = now(3) WHERE id = 1'
        con.query(timeUpdateSql, async function (err) {
          if (err) {
            console.log(err)
          } else {
            if (err) {
              console.error(err, err.stack)
            } else {
              await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL)
              for (let i = 0; i < filteredData.length; i++) {
                const img = await canvas.loadImage(`https://scalica-photos.s3.amazonaws.com/${filteredData[i].Key}`)
                const detections = await faceapi.detectAllFaces(img)
                if (detections && detections.length > 0) {
                  const sql = 'UPDATE micro_photo SET num_faces = ? WHERE img_id = ?'
                  const parameters = [detections.length, filteredData[i].Key]
                  con.query(sql, parameters, function (error) {
                    if (error) console.log(error)
                  })
                  console.log(`Detected ${detections.length} faces`)
                }
              }
              con.end((err) => {
                if (err) console.log(err)
              })
            }
          }
        })
      }
    })
  })
}, null, true, 'America/New_York')
