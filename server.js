const express = require("express");
const app = express();
const http = require("http");
const multer = require("multer");
const server = http.createServer(app);
const path = require('path');
const {Server} = require("socket.io");
const io = new Server(server);
const fs = require("fs");
const fsAsync = require("fs").promises;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const teacherCredentials = {
  username: "user",
  password: "12345"
}

let isLoggedIn = false;

app.use(
    bodyParser.json()
);
// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({secret: "Secret", saveUninitialized: true,
    resave: true}))
app.use(express.static('public'));
const storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, __dirname + "/public/uploads");
  }, 
  filename: function(req, file, callback){
    callback(null, file.originalname)
  }
});

const uploads = multer({storage: storage});

app.get("/", (req, res) =>{
  console.log("Log " + isLoggedIn);
  console.log("check " + req.session.user);
  res.sendFile(path.join(__dirname, '/src/pages/index.html'));
})
//app.get("/teacher", (req, res) =>{
  //res.sendFile(path.join(__dirname, '/src/pages/teacherpage.html'));
//})
app.get("/teacherlogin", (req, res) =>{
  res.sendFile(path.join(__dirname, '/src/pages/teacherlogin.html'));
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

app.get('/teacher', checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '/src/pages/teacherpage.html'));
})
app.use('/teacher', (err, req, res, next) => {
    console.log(err);
  
    res.sendFile(path.join(__dirname, '/src/pages/teacherlogin.html'));
})
app.get('/accountsettings', checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '/src/pages/accountsettings.html'));
})
app.use('/accountsettings', (err, req, res, next) => {
    console.log(err);
  
    res.sendFile(path.join(__dirname, '/src/pages/teacherlogin.html'));
})
app.get('/logout', (req, res) => {
  req.session.destroy(function (err) {
    isLoggedIn = false;
    res.redirect('/'); //Inside a callback… bulletproof!
   });
 
})
app.post('/change-user-credentials', checkLogin, (req, res) => {
    if(req.body.username != "" && req.body.password != "")
    {
      teacherCredentials.username = req.body.username;
      teacherCredentials.password = req.body.password;
      res.json({status: "Username and password updated successfully!", info: "success"});
      writeCredentialsJsonFile();

    }
    else
    {
      res.json({status: "Please enter Username and Password to update!", info: "error"});
      
    }
})
app.use('/change-user-credentials', (err, req, res, next) => {
  console.log('err');
  res.json({status: "Some error occurred!", info: "error"})
})
app.post("/uploads",uploads.array("files"),(req, res) => {
  //console.log(req.body);
  console.log(req.files);
  
  res.json({status: "Files Recieved"});
  
});
app.post("/recently-added",(req, res) => {
  
  copyFileToUploads(req.body.filename);
  
  
  res.json({status: "Files Moved to uploads"});
  
});


app.post("/deletefile", (req, res) => {
  //console.log(req.body);
  //console.log(req.fileName);
  console.log(req.body);
  deleteFile(__dirname + "/public/uploads/" + req.body.filename);
  res.json({status: "File Deleted"});
  
})

app.post("/changefilename", (req, res) => {
  //console.log(req.body);
  //console.log(req.fileName);
  console.log(req.body);
  req.body.forEach(el => {
  changeFileName(__dirname + "/public/uploads/" + el.fullname, __dirname + "/public/uploads/" + el.changedname + "." + getFileExtension(el.fullname));
    
  })
  CopyAllFilesToRecentlyUploaded().then(() => {
          console.log('Changed all files from the specified directory');
        });
  //changeFileName(__dirname + "/public/uploads/" + req.body.fullname, __dirname + "/public/uploads/" + req.body.changedname + "." + getFileExtension(req.body.fullname));
  
  res.json({status: "File Name Updated"});
  
})

app.post("/login", (req, res) => {
  //console.log(req.body);
  //console.log(req.fileName);
  console.log(req.body);
  if(isLoggedIn)
    {
      res.json({status: "Teacher is in session. Please try again later!"});
      return;
      
    }
  if(teacherCredentials.username != req.body.username)
  {
      res.json({status: "Username and/or Password are incorrect!"});
    
  }
  else if(teacherCredentials.password != req.body.password)
  {
      res.json({status: "Username and/or Password are incorrect!"});
    
  }
  else
  {
      isLoggedIn = true;
      req.session.user = req.body.username;
      res.redirect(301, '/teacher');
  }
  
  
})



let roomKeys = [];
const students = [];
let allPlayers = [];
let playerRequests = [];
let showDefaultScenes = true;
const unique = (value, index, self) => {
    return self.indexOf(value.room) == index;
}

io.on('connection', socket => {

    socket.on('teacher-create-room', (room, cb) => {
        roomKeys.forEach(el => {    
          io.socketsLeave(el.room);
          //console.log(io.in(el.roomID).fetchSockets())
          
        })
        
        roomKeys = [];
        allPlayers = [];
      playerRequests = [];
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
      io.to(room).emit('refresh-players', allPlayers);
      io.to(room).emit('refresh-requests', playerRequests);
        //cb('joined');
        
    });
    socket.on('teacher-create-game-room', (room, cb) => {
        socket.join(room);
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
        const playerRequestNameFound = playerRequests.some((el) =>{
            return el.name == playerDetails.name;
        });
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
        if(keyExists && !playerFound && !gameStarted && !playerNameFound && !playerRequestNameFound)
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
            playerRequests.push(player);
            io.to(playerDetails.room).emit('student-join-request', playerRequests, cb);
            io.to(playerDetails.room).emit('refresh-players', allPlayers);
            io.to(playerDetails.room).emit('refresh-requests', playerRequests);
            cb(true);
            
        }
      else if(playerNameFound)
        {
          
            io.to(socket.id).emit('name-exist');
        }
      else if(playerRequestNameFound)
        {
          
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
      playerRequests.forEach((el) => {
        if(el.id == playerDetails.id)
          {
            playerRequests.splice(el, 1);
          }
      })
      
      io.to(playerDetails.id).emit('student-accepted', playerDetails);
      io.in(playerDetails.room).emit('refresh-players', allPlayers);
      io.to(playerDetails.room).emit('refresh-requests', playerRequests);
      
    })
  socket.on('student-declined', (playerDetails) => {
    playerRequests.forEach((el) => {
        if(el.id == playerDetails.id)
          {
            playerRequests.splice(el, 1);
          }
      });
      io.to(playerDetails.room).emit('refresh-players', allPlayers);
      io.to(playerDetails.id).emit('student-declined', playerDetails);
      io.to(playerDetails.room).emit('refresh-requests', playerRequests);
    })
  socket.on('student-join-room', (playerDetails) => {
    socket.join(playerDetails.room);
    allPlayers.push(playerDetails);
    io.in(playerDetails.room).emit('refresh-players', allPlayers);
    io.to(playerDetails.room).emit('refresh-requests', playerRequests);
    
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
        
        playerRequests.forEach((el, index) => {
          io.to(el.id).emit('game-started');
        })
        
        
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
      
        
        deleteAllFilesInDir(__dirname + "/public/uploads/").then(() => {
          console.log('Removed all files from the specified directory');
        });
      //MoveAllFilesToRecentlyUploaded().then(() => {
         // console.log('Changed all files from the specified directory');
       // });
      
    })
    
    socket.on('change-scene', (roomcode,sceneNum) =>{
      //io.to(roomcode).emit('change-scene');

      io.emit('change-scene', sceneNum);
    })
  
    socket.on('change-temp-scene', (roomcode,sceneNum) =>{
      //io.to(roomcode).emit('change-scene');

      io.emit('change-temp-scene', sceneNum);
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
      playerRequests.forEach((el, index) => {
          io.to(el.id).emit('exit-game');
        })
    })
    socket.on('student-same-name',(playerDetails) => {
        io.in(playerDetails.id).emit('name-exist');
        io.to(playerDetails.room).emit('refresh-players', allPlayers);
        io.to(playerDetails.room).emit('refresh-requests', playerRequests);
      
    })
    
    socket.on('get-temp-links', () => {
      io.emit('return-temp-links', GetUploadsArray())
    })
    
    socket.on('show-default-scenes', isDefaultScenes => {
      showDefaultScenes = isDefaultScenes;
    })
    socket.on('get-default-scenes-checked', () => {
      io.to(socket.id).emit('return-default-scenes-checked', showDefaultScenes);
    })
    
    socket.on('get-recently-uploaded', () => {
      io.emit('return-recently-uploaded', GetRecentlyUploadedArray());
    })
    
    
    
});

function GetUploadsArray()
{
  const filenames = fs.readdirSync(__dirname + "/public/uploads"); 
  const filePath = []
  console.log("\nFilenames in directory:"); 
  filenames.forEach((file) => { 
    
    let pathURL = "/uploads/" + file;
    const data = {
      name: path.parse(file).name,
      url: pathURL
    }
    filePath.push(data);
  }); 
  
  return filePath;
}

function GetRecentlyUploadedArray()
{
  const filenames = fs.readdirSync(__dirname + "/public/recentlyuploaded"); 
  const filePath = []
  console.log("\nFilenames in directory:"); 
  filenames.forEach((file) => { 
    
    let pathURL = "/recentlyuploaded/" + file;
    const data = {
      name: path.parse(file).name,
      url: pathURL,
      fullname: file
    }
    filePath.push(data);
    console.log("File in recentlyuploaded: " + file);
  }); 
  
  return filePath;
}

function getFileExtension(filename){

    // get file extension
    const extension = filename.split('.').pop();
    return extension;
}

async function deleteAllFilesInDir(dirPath)
{
  try{
    const files = await fsAsync.readdir(dirPath);
    const deleteFilePromises = files.map(file => 
      fsAsync.unlink(path.join(dirPath, file)),
    );
    await Promise.all(deleteFilePromises);
  }
  catch (err){
    console.log(err);
  }
}

async function deleteFile(filePath) {
  try {
    await fsAsync.unlink(filePath);
    console.log(`File ${filePath} has been deleted.`);
  } catch (err) {
    console.error(err);
  }
}

async function changeFileName(filePath, name)
{

  try {
    
    await fsAsync.rename(filePath, name);
    console.log(`Filename has been changed.`);
    console.log(GetUploadsArray());
  } catch (err) {
    console.error(err);
  }
}

async function CopyAllFilesToRecentlyUploaded()
{
  try{
    const files = await fsAsync.readdir(__dirname + "/public/uploads");
    console.log(files);
    await Promise.all(files.map(async (file) => {
    const oldPath = __dirname + "/public/uploads/" + file;
    const newPath = __dirname + "/public/recentlyuploaded/" + file;
    await fsAsync.copyFile(oldPath, newPath);
  }))
  console.log('File moved successfully');
  } catch (error) {
    
    console.error(error);
  }
}

async function MoveFileToUploads(filename)
{
  try{
    const oldPath = __dirname + "/public/recentlyuploaded/" + filename;
    const newPath = __dirname + "/public/uploads/" + filename;
    await fsAsync.rename(oldPath, newPath);
    console.log('File moved successfully');

  } catch (error) {
    
    console.error(error);
  }
}
async function MoveFileToRecentlyUploaded(filename)
{
  try{
    const oldPath = __dirname + "/public/uploads/" + filename;
    const newPath = __dirname + "/public/recentlyuploaded/" + filename;
    await fsAsync.rename(oldPath, newPath);
    console.log('File moved successfully');

  } catch (error) {
    
    console.error(error);
  }
}

async function copyFileToRecentlyUploaded(filename)
{
  await fsAsync.copyFile(__dirname + "/public/uploads/" + filename, __dirname + "/public/recentlyuploaded/" + filename) 
  .then(function() { 
  console.log("File Copied"); 
  }) 
  .catch(function(error) { 
  console.log(error); 
  }); 
}

async function copyFileToUploads(filename)
{
  await fsAsync.copyFile(__dirname + "/public/recentlyuploaded/" + filename, __dirname + "/public/uploads/" + filename) 
  .then(function() { 
  console.log("File Copied"); 
  }) 
  .catch(function(error) { 
  console.log(error); 
  }); 
}

function checkLogin(req, res, next)
{
  
  if(req.session.user)
  {
   
    next();
  }
  else
  {
    var error = new Error("User not logged in!")
    next(error);
  }
}

async function readCredentialsJsonFile()
{
  await fsAsync.readFile(__dirname + "/SaveData/credentials.json")
  .then((data) => {
    // Do something with the data
    const parsedData = JSON.parse(data)
    teacherCredentials.username = parsedData.username;
    teacherCredentials.password = parsedData.password;
    console.log(teacherCredentials);
    
  })
  .catch((error) => {
    // Do something if error 
    console.log(error)
  });
}
async function writeCredentialsJsonFile()
{
  await fsAsync.writeFile(__dirname + "/SaveData/credentials.json", JSON.stringify(teacherCredentials, null, 2), (error) => {
    if (error) {
    console.log('An error has occurred ', error);
    return;
  }
  console.log('Data written successfully to disk');
  })

   
}
readCredentialsJsonFile();

deleteAllFilesInDir(__dirname + "/public/uploads/").then(() => {
  console.log('Removed all files from the specified directory');
});


server.listen(3000, '0.0.0.0');