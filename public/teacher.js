import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";


//Enter you IP Address and Port number here
const socket = io();
//const socket = io('http://localhost:3000');


const codeText = document.getElementById('code-text');
const generateCodeBtn = document.getElementById('generate-code');
const startGame = document.getElementById('start-game');
const backBtn = document.getElementById('back');
const tabRadio = document.getElementById('tab-request');
const notifications = document.getElementById('notification');
const noPlayersPopUp = document.getElementById('popup-no-joined');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const studentsJoined = [];
const studentsWaiting = [];

let notificationNum = 0;
GenerateRandomNumber();

//socket Events
socket.emit('teacher-create-room', codeText.value, message => {
   // DisplayMessage(message);
});

socket.on('refresh-players', message => {
    
      DeleteChildElements('students-joined');

    message.forEach(element => {
        //console.log(element.name);
        if(element.type == 'student')
        {
            DisplayMessage(element.name);
        }
        
    });
})
socket.on('student-join-request', (el) => {
  if(studentsWaiting.some(element => element.id == el.id))
    return;
  studentsWaiting.push(el);
  RefreshPlayers(studentsWaiting);
})

socket.on('start', () => {
    console.log('recieved')
   // window.location.href = 'game.html';
   sessionStorage.setItem('type', 'teacher');
   sessionStorage.setItem('roomID', codeText.value);
   window.location.href = '/VR';
})

//Functions
function DisplayMessage(message)
{
    const mainDiv = document.createElement('div');
    mainDiv.classList.add('student');

    const div = document.createElement('div');
    const icon = document.createElement('i');
    icon.classList.add("bi-person-square");
    div.textContent = message;
    mainDiv.append(icon);
    mainDiv.append(div);
    document.getElementById('students-joined').append(mainDiv);

}

function CreatePlayerButton(message)
{
    const mainDiv = document.createElement('div');
    mainDiv.classList.add('student');

    const div = document.createElement('div');
    const icon = document.createElement('i');
    const acceptButton = document.createElement('button');
    const rejectButton = document.createElement('button');
    acceptButton.textContent = "✓";
    rejectButton.textContent = "X";  
    acceptButton.classList.add('accept-btn');
    rejectButton.classList.add('reject-btn');
    const buttonDiv = document.createElement('div');
    buttonDiv.append(acceptButton);
    buttonDiv.append(rejectButton);
    rejectButton.style.backgroundColor = "red";
    rejectButton.style.boxShadow = "none";
    icon.classList.add("bi-person-square");
    div.textContent = message.name;
    mainDiv.append(icon);
    mainDiv.append(div);
    mainDiv.append(buttonDiv);
    
    document.getElementById('students-request').append(mainDiv);
    
    acceptButton.addEventListener('click', (e) => {
      socket.emit('student-accepted', message);
      studentsJoined.push(message);
      console.log(message);
      studentsWaiting.forEach((el) => {
        if(el.id == message.id)
          {
            studentsWaiting.splice(el, 1);
            
          }
        
      })
      RefreshPlayers(studentsWaiting);
      
      
    })
  
    rejectButton.addEventListener('click', (e) => {
        studentsWaiting.forEach((el) => {
        if(el.id == message.id)
          {
            studentsWaiting.splice(el, 1);
          }
      })
        socket.emit('student-declined', message);
        RefreshPlayers(studentsWaiting);
    })
  
}

function RefreshPlayers(message)
{
  notificationNum = 0;
  DeleteChildElements('students-request');
    message.forEach(element => {
        //console.log(element.name);
        if(element.type == 'student')
        {
          CreatePlayerButton(element);
          notificationNum++;
          notifications.style.display = "block";
          notifications.innerHTML = notificationNum;
          
        }
        
    });
      
}

function DeleteChildElements(id)
{
    document.getElementById(id).innerHTML = "";
    //document.getElementById('students-request').innerHTML = "";
}


function GenerateRandomNumber()
{
    
    var minm = 100000;
    var maxm = 999999;
    codeText.value = Math.floor(Math
    .random() * (maxm - minm + 1)) + minm;
    
}

//Event Listeners
generateCodeBtn.addEventListener('click', (e) => {
    GenerateRandomNumber();
    socket.emit('teacher-create-room', codeText.value, message => {
        //DisplayMessage(message);
    });
})

startGame.addEventListener('click', (e) => {
  console.log(studentsJoined.length);
  if(studentsJoined.length == 0)
    {
      noPlayersPopUp.style.display = 'flex';
      return;
    }
    socket.emit('start-game', codeText.value);
    console.log(studentsJoined.length);
})

backBtn.addEventListener('click', (e) =>{
    socket.emit('teacher-leave-room', codeText.value);
    window.location.href = '/';
})

tabRadio.addEventListener('click', (e) => {
  notificationNum = 0;
  notifications.style.display = "none";
})

noButton.addEventListener('click', (e) => {
  noPlayersPopUp.style.display = 'none';
})

yesButton.addEventListener('click', (e) => {
  socket.emit('start-game', codeText.value);
})

