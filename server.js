'use strict';

var io = require('socket.io');
var express = require('express');
var multer = require('multer');
var upload = multer({ dest: './public/app/angular-smilies/src/smilies' });
var path = require('path');

var _ = require('lodash');

var app = express();

var logger = require('winston');
var config = require('./config')(logger);

app.use(express.static(path.resolve(__dirname, './public')));

app.use(multer({ dest: './public/app/angular-smilies/src/smilies',
    rename: function (fieldname, filename) {
        return filename;
    },
    onFileUploadStart: function (file) {
            var msg = '';
            if(file.mimetype !== 'image/png'){
                msg = 'Type de fichier non supporté';
                console.log(msg);
                return false;
            }else{
                msg =  'Transfère de ' + file.originalname + ' au serveur en cours';
                console.log(msg);
            }
          //  socket.emit('fileUploading', msg);
        },
    onFileUploadComplete: function (file) {
      var msg = '';
      msg = 'Nouvelle emote dispo';
      console.log(msg);
      sio.emit('fileUploading', msg);
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }

}));

app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

var server = app.listen(config.server.port, function() {
  logger.info('Server listening on %s', config.server.port);
});

function Message(nickname, msg) {
  this.nickname = nickname;
  this.msg = msg;
  console.log('Message créé');
}


var sio = io(server);

sio.set('authorization', function(handshakeData, accept) {
  // @todo use something else than a private `query`
  handshakeData.isAdmin = handshakeData._query.access_token === config.auth.token;
  accept(null, true);
});

function Viewers(sio) {
  var data = [];

  function notifyChanges() {
    sio.emit('viewers:updated', data);
  }

  return {
    add: function add(nickname) {
      data.push(nickname);
      notifyChanges();
    },
    remove: function remove(nickname) {
      var idx = data.indexOf(nickname);
      if (idx > -1) {
        data.splice(idx, 1);
      }
      notifyChanges();
      console.log('-->', data);
    }
  };
}

var viewers = Viewers(sio);


// @todo extract in its own
sio.on('connection', function(socket) {

  // console.log('nouvelle connexion', socket.id);
  socket.on('viewer:new', function(nickname) {
    socket.nickname = nickname;
    viewers.add(nickname);
    console.log('new viewer with nickname %s', nickname, viewers);
  });

  socket.on('message:new', function(message) {
    var message = new Message(socket.nickname, message);
    sio.emit('message:updated', message);
    console.log('Nouveau message: '+ message);
  });

  socket.on('disconnect', function() {
    viewers.remove(socket.nickname);
    console.log('viewer disconnected %s\nremaining:', socket.nickname, viewers);
  });

  socket.on('file:changed', function() {
    if (!socket.conn.request.isAdmin) {
      // if the user is not admin
      // skip this
      return socket.emit('error:auth', 'Unauthorized :)');
    }

    // forward the event to everyone
    sio.emit.apply(sio, ['file:changed'].concat(_.toArray(arguments)));
  });

  socket.visibility = 'visible';

  socket.on('user-visibility:changed', function(state) {
    socket.visibility = state;
    sio.emit('users:visibility-states', getVisibilityCounts());
  });
});

function getVisibilityCounts() {
  return _.chain(sio.sockets.sockets).values().countBy('visibility').value();
}
