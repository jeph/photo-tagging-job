var PROTO_PATH = __dirname + '/detection.proto';
var MODEL_URL = __dirname + '/weights';

var faceapi = require('face-api.js');
var canvas = require('canvas');
var image = require('canvas');
var imageData = require('canvas');

var { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader')
var packageDefinition = protoLoader.loadSync(
   PROTO_PATH,
   {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
   });

var detection_proto = grpc.loadPackageDefinition(packageDefinition).facial_recognition;

async function detect(call, callback) {
   await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
   var img = await canvas.loadImage(call.request.img);
   var detections = await faceapi.detectAllFaces(img);
   if (detections == null) {
      callback(null, {faces: 0});
   } else {
      callback(null, {faces: detections.length});
   }
}

function main() {
   var server = new grpc.Server();
   server.addService(detection_proto.FacialRecognizer.service, {detect: detect});
   server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
   server.start();
}

main();
