const PROTO_PATH = __dirname + '/detection.proto'

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

const detection_proto = grpc.loadPackageDefinition(packageDefinition).facial_recognition

function main () {
  const client = new detection_proto.FacialRecognizer('localhost:50051', grpc.credentials.createInsecure())
  client.detect({ img: process.argv[2] }, function (err, response) {
    console.log(response.faces)
    return (response.faces)
  })
}

main()
