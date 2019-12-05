var PROTO_PATH = __dirname + '/detection.proto'
  
var grpc = require('grpc')
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

function main() {
   var client = new detection_proto.FacialRecognizer('localhost:50051', grpc.credentials.createInsecure());
   client.detect({img: process.argv[2]}, function(err, response) {
      console.log(response.faces);
      return(response.faces);
   });
}

main();
