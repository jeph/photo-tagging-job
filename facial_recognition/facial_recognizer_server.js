const PROTO_PATH = __dirname + '/detection.proto'
const MODEL_URL = __dirname + '/weights'

const faceapi = require('face-api.js')
const canvas = require('canvas')

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })

const detectionProto = grpc.loadPackageDefinition(packageDefinition).facial_recognition

async function detect (call, callback) {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL)
  const img = await canvas.loadImage(call.request.img)
  const detections = await faceapi.detectAllFaces(img)
  if (detections == null) {
    callback(null, { faces: 0 })
  } else {
    callback(null, { faces: detections.length })
  }
}

function main () {
  const server = new grpc.Server()
  server.addService(detectionProto.FacialRecognizer.service, { detect: detect })
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
  server.start()
}

main()
