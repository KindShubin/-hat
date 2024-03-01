//import { v4 as uuidv4 } from 'uuid';
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
const path = require('path');
const cookieParser = require('cookie-parser')
const multer = require('multer');// parsing multipart/form-data
const express = require('express');
const http = require('http');
const ws = require('ws');
// import WebSocket, { WebSocketServer } from 'ws';

//const wss = new ws.Server({noServer: true});
const wss = new ws.Server({port: 3001});
//const wss = new ws.WebSocketServer( { port:8080 }); 
// const wss = new WebSocketServer({ port: 8080 });
//const wss = new ws.Server({noServer: true});

const app = express();
const port = 3000;
app.use(cookieParser());

const pathServer = path.join(__dirname);
const pathProject = path.join(__dirname,'..');
const pathClient = path.join(__dirname,'..','Client');

/// MySQL
const con = mysql.createConnection({
  host: "localhost",
  user: "dima",
  password: "1122334455",
  database: "chat"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  const sql = "SELECT * FROM users";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});
///////////////

////EXPRESS
app.get('/', (req, res) => {
  // console.dir(req);
  console.log('cookie');
  console.log(req.cookies);
  let uid = req.cookies ? req.cookies.uid : undefined;
  if (uid === undefined) {
    // no: set a new cookie
    uid = uuidv4();
    console.log(`create new uid:${uid}`);
    con.connect(function(err) {
      const sql = `INSERT INTO users (id, name, surname, description) VALUES ('${uid}', '', '', '');`;
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted, ID: " + result.insertId);
      });
    });
  } else {
    // yes, cookie was already present 
    console.log('cookie id exists ', uid);
  } 
  res.cookie('username', uid);
  res.cookie('uid', uid, { httpOnly: true });
  console.log('cookie created successfully');
  res.sendFile(pathClient + '/index.html');
  //res.redirect('../Client/index.html');
  //res.send('Hello World!')
})

// app.get('/Client/*', (req, res) => {
//   const file = pathProject.concat(req.originalUrl);
//   res.sendFile(file);
// })

app.use(express.static(pathClient));

app.use(express.urlencoded());

app.post('/changename', (reg, res) => {
  console.log('POST');
  //console.dir(reg);
  console.log(reg.body);
  console.log(reg.body.name);
  res.send('respond to the post');
})

///////// WebSocket ///////////

const clients = new Map();

wss.on('connection', onConnect);

function onConnect(wsClient) {
  clients.set(wsClient, '');

  wsClient.on('message', function message(data) {
    console.log('received: %s', data);
    console.log('JSON.parse', JSON.parse(data));
    clients.set(wsClient, JSON.parse(data).from)

    // clients.filter((client) => client != wsClient)
    //   .forEach((client) => {
      for(const [key, value] of clients.entries()){
        const newData = {
          date: JSON.parse(data).date,
          from: JSON.parse(data).from,
          to: JSON.parse(data).to === 0 ? value : JSON.parse(data).to,
          data: JSON.parse(data).data,
        }
        key.send(JSON.stringify(newData));
      };
  });
  wsClient.on('close', function() {
    // отправка уведомления в консоль
    console.log('user gone');
    clients.splice(clients.indexOf(wsClient), 1);
    //clients = clients.filter((client) => client != wsClient);
  });
  wsClient.on('error', console.error);
}




////////////
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
