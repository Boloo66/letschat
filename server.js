
let express = require('express');
let bodyParser = require('body-parser');
let app = new express();
var port = process.env.PORT || 5000;

// introduce socket.io for bidirection event based communication
// between client side and server
// trick 1: create a http server and link to app then io callback with http as param1
let http = require('http').Server(app);
let io = require('socket.io')(http);

let mongoose = require("mongoose");
let dbURL = "mongodb+srv://NodeApp:Olukayode123@cluster0.euvqlx1.mongodb.net/?retryWrites=true&w=majority";
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
//midddleware fo rexpress app
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//PERSIST DATA ON MONGODB
let Messages = mongoose.model('Messages', {
    name:String,
    text:String
})
let messages = [
                {name:"Ilesanmi", text:"This is second test message"},
                {name:"Kolawole", text:"This is third test message"},
                {name:"Samuel", text:"This is fourth test message"}
                ];
app.get('/messages', function(req, res){
    //res.send(messages);
    Messages.find({}).then((messages) => {
        res.send(messages);
    }).catch((err) => {
        res.sendStatus(500);
    })
});

app.post("/messages", function(req, res){
    let message = new Messages(req.body);
    message.save().then(() => {
        res.sendStatus(200);
        //messages.push(req.body);
        io.emit('message', req.body);
        console.log(req.body);
    }).catch((err) => {
        res.sendStatus(500);
    });
    
})
// listen for connections on connection
io.on('connection', (socket) => {
    console.log("A new connection was found.");
})


//connect database
mongoose.connect(dbURL, connectionParams)
.then(() => {
    console.log("Connection to mongoDB was successfull");
})
.catch((err) => {
    console.error("This error was encountered: " , err);
});
// due to socket.io been linked to app, let http lissten and not express app
let myServer = http.listen(port, () => {
    console.log("This server is listening on port %d", port);
});