const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require('path');
const {Server} = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));
        
app.get("/", (req, res) =>{
  res.sendFile(path.join(__dirname, '/src/pages/index.html'));
})
app.get("/teacher", (req, res) =>{
  res.sendFile(path.join(__dirname, '/src/pages/teacherpage.html'));
})
app.get("/student", (req, res) =>{
  res.sendFile(path.join(__dirname, '/src/pages/studentPage.html'));
})

app.get("/home", (req, res) =>{
  res.sendFile(path.join(__dirname, '/src/pages/index.html'));
})
app.get("/VR", (req, res) =>{
  res.sendFile(path.join(__dirname, 'public/VR/index.html'));
})
app.get("/VRTest", (req, res) =>{
  res.sendFile(path.join(__dirname, 'public/VR/vrIndex.html'));
})
const roomKeys = [];
const students = [];
const allPlayers = [];
const unique = (value, index, self) => {
    return self.indexOf(value.room) == index;
}
io.on('connection', socket => {

    socket.on('teacher-create-room', (room, cb) => {
        console.log('teacher' + socket.id);
        socket.join(room);
        if(!roomKeys.some(el => el.room == room))
        {
            roomKeys.push({
                room,
                gameStarted: false 
            });
        }
        
        
        //roomKeys.filter(unique)
       
        const player = {
            type: 'teacher',
            name: 'teacher',
            room: room,
            id: socket.id
        }
        
        allPlayers.push(player);
        
       
        
        //cb('joined');
        
    });

    socket.on('student-request-join-room', (playerDetails, cb) => {
        let keyExists = false;
        let gameStarted = false;
        const playerFound = allPlayers.some((el) => {
            return el.id == socket.id
            
        });
        const teacherID = allPlayers.some((el) => {
          if(el.type == 'teacher')
            {
              return el.id;
            }
        })
        
        const playerNameFound = allPlayers.some((el) =>{
            return el.name == playerDetails.name;
        });
        roomKeys.forEach((key) => {

            if(playerDetails.room == key.room)
            {
                keyExists = true
                gameStarted = key.gameStarted;
                
            }
            
        });
        if(keyExists && !playerFound && !gameStarted && !playerNameFound)
        {
            const player = {
                type: 'student',
                name: playerDetails.name,
                room: playerDetails.room,
                id: socket.id
            }
            //socket.join(playerDetails.room);
            //students.push(playerDetails.name);
            //allPlayers.push(player);
            
            io.to(playerDetails.room).emit('student-join-request', player);
            
            io.to(playerDetails.room).emit('refresh-players', allPlayers);
            cb(true);
            
        }
      else if(playerNameFound)
        {
          console.log("here");
            io.to(socket.id).emit('name-exist');
        }
        else if(playerFound)
        {
            
            allPlayers.forEach((el, index) => {
                if(el.id == socket.id)
                {
                    if(el.room != playerDetails.room)
                    {
                        socket.leave(el.room);
                        allPlayers.splice(index, 1);
                        io.to(el.id).emit('join-new-room');
                    }
                    else
                    {
                        io.to(socket.id).emit('player-already-joined');
                    }
                    
                }
            });
            io.to(playerDetails.room).emit('refresh-players', allPlayers);
            
        }
        else if(gameStarted)
        {
            
            io.to(socket.id).emit('game-started');
        }
        else
        {
            
            cb(false);
        }
        
    })
    socket.on('student-accepted',(playerDetails) => {
      //playerDetails.socketObj.join(playerDetails.room);
      //allPlayers.push(playerDetails);
      io.to(playerDetails.id).emit('student-accepted', playerDetails);
      io.in(playerDetails.room).emit('refresh-players', allPlayers);
    })
  socket.on('student-declined', (playerDetails) => {
      io.to(playerDetails.room).emit('refresh-players', allPlayers);
      io.to(playerDetails.id).emit('student-declined', playerDetails);
      
    })
  socket.on('student-join-room', (playerDetails) => {
    socket.join(playerDetails.room);
    allPlayers.push(playerDetails);
    io.in(playerDetails.room).emit('refresh-players', allPlayers);
  })
    socket.on('student-join-game', (playerDetails) =>{
        let keyExists = false;
        const playerFound = allPlayers.some((el) => {
            return el.id == socket.id
            
        });
        
        roomKeys.forEach((key) => {

            if(playerDetails.room == key.room)
            {
                keyExists = true
                //gameStarted = key.gameStarted;
                
            }
            
        });
        if(keyExists && !playerFound)
        {
            const player = {
                type: 'student',
                name: playerDetails.name,
                room: playerDetails.room,
                id: socket.id
            }
            socket.join(playerDetails.room);
            //students.push(playerDetails.name);
            allPlayers.push(player);
            

            
            
        }
    })
    socket.on('start-game', roomCode => {
        io.in(roomCode).emit('start');
        //io.emit('start');
        
        roomKeys.forEach(el => {
            if(el.room == roomCode)
            {
                el.gameStarted = true;
            }
        });
        allPlayers.forEach((el, index) => {
            if(el.room == roomCode)
            {
                allPlayers.splice(index, 1);
              
            }
        });
        
    })

    socket.on('disconnect', () => {
        let roomCode;
        allPlayers.forEach((el, index) => {
            if(el.id == socket.id)
            {
                roomCode = el.room;
                allPlayers.splice(index, 1);
                
            }
        });
        io.emit('refresh-players', allPlayers);
    })

    socket.on('teacher-exit', roomcode => {
        io.to(roomcode).emit('exit-game');

    })
    
    socket.on('change-scene', (roomcode, sceneNum) =>{
      io.to(roomcode).emit('change-scene', sceneNum);
      //io.emit('change-scene', sceneNum);
    })
    
    
    socket.on('exit-room', (roomcode) => {
        socket.leave(roomcode);
        
        roomKeys.forEach((el, index) => {
            if(el.room == roomcode)
            {
                roomKeys.splice(index, 1);
            }
        });
        allPlayers.forEach((el, index) => {
            if(el.id == socket.id)
            {
                allPlayers.splice(index, 1);
            }
        });

    })

    socket.on('teacher-leave-room', roomcode => {
        io.to(roomcode).emit('exit-game');
    })

    
});

server.listen(3000, '0.0.0.0');