import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

//Enter you IP Address and Port number here
const socket = io();
//const socket = io('http://localhost:3000');

const joinButton = document.getElementById('room-button');
const roomInput = document.getElementById('room-input');
const studentName = document.getElementById('student-name');
const response = document.getElementById('response-container');
const joinRoomContainer = document.querySelector('.center');
const playersJoinedContainer = document.querySelector('.lobby-container');
const popUpContainer = document.querySelector('.popup-info');
const popUpCloseBtn = document.querySelector('.close-btn');
const popUpOkBtn = document.querySelector('.ok-btn');
const validationText = document.querySelector('#validation-text');
const validationContainer = document.querySelector('.validation-container');
const bg = document.querySelector('.popup-cover-bg');

const backBtn = document.getElementsByClassName('back');
let roomInputValue = '';
let joined = false;


//Event Listeners
joinButton.addEventListener('click', (e) => {
    e.preventDefault();

    if(roomInput.value != '' && studentName.value != '')
    {
        const playerDetails = {
            room: roomInput.value,
            name: studentName.value == ''? 'abc' : studentName.value
        }
        roomInputValue = roomInput.value;
        socket.emit('student-request-join-room', playerDetails, cb => {
            ResponseFromServer(cb, 'Wrong Room ID entered!');
          
          
          
        });
       
    }
    else
    {
        validationContainer.style.display = 'flex';
        if(roomInput.value == '')
        {
            if(!roomInput.classList.contains('invalid'))
            {
                roomInput.classList.add('invalid');
               
               validationText.innerHTML = 'Please enter a valid Room ID';
            }
        }
        if(studentName.value == '')
        {
            if(!studentName.classList.contains('invalid'))
            {
                studentName.classList.add('invalid');
                
                validationText.innerHTML = 'Please enter a name';
            }
        }
        if(roomInput.value == '' && studentName.value == '')
        {
            
            
            validationText.innerHTML = 'Please enter a valid Room ID and name';
        }

        
    }
});
for(let i = 0; i < backBtn.length; i++)
{
    const btn = backBtn[i];
    btn.addEventListener('click', (e) =>{
        window.location.href = '/';
    });
}
/*
backBtn.addEventListener('click', (e) =>{
    window.location.href = 'index.html';
})
*/
roomInput.addEventListener('input', (e) => {
    validationContainer.style.display = 'none';
    response.style.display = 'none';
    if(roomInput.classList.contains('invalid'))
    {
        roomInput.classList.remove('invalid');
    }
    if(studentName.classList.contains('invalid'))
    {
        studentName.classList.remove('invalid');
    }
})
studentName.addEventListener('input', (e) => {
    validationContainer.style.display = 'none';
    response.style.display = 'none';
    if(roomInput.classList.contains('invalid'))
    {
        roomInput.classList.remove('invalid');
    }
    if(studentName.classList.contains('invalid'))
    {
        studentName.classList.remove('invalid');
    }
})

popUpCloseBtn.addEventListener('click', (e) =>{
    popUpContainer.classList.remove('active');
    joinRoomContainer.classList.remove('active');
})

//popUpOkBtn.addEventListener('click', (e) =>{
    //popUpContainer.classList.remove('active');
    //joinRoomContainer.classList.remove('active');
//})

//Socket Events
socket.on('start', () => {
    console.log('recieved')
   //window.location.href = 'game.html';
   sessionStorage.setItem('type', 'student');
   sessionStorage.setItem('roomID', roomInput.value);
   sessionStorage.setItem('name', studentName.value);
    window.location.href = '/VR';
})

socket.on('name-exist', () => {
    popUpContainer.classList.remove('active');
    joinRoomContainer.classList.remove('active');
    validationContainer.style.display = 'flex';
    studentName.classList.add('invalid');
    validationText.innerHTML = 'Name already exists!';
  
    
})
socket.on('join-new-room', (playerDetails) => {
    socket.emit('student-join-room', playerDetails, cb => {
            ResponseFromServer(cb, 'Wrong Room ID Entered!');
        });
})

socket.on('game-started', () => {
    SetPopUpText('Game Already Started', 'Sorry the game has started already!', 'Please join another room', 'red', true, false, PopUpOkCBDefault);
    
    
})


socket.on('refresh-players', message => {
    
    DeleteArray();
    message.forEach(element => {
        console.log(element.name);
        if(element.type == 'student')
        {
            DisplayLobby(element.name);
        }
        
    });
})

socket.on('exit-game', () => {
  SetResponse({
        loaderDisplay: 'none',
        color: 'red',
        message: 'Teacher has left the room!',
    });
  const reset = () => {
    window.location.reload();
  }
  SetPopUpText('Join Failed' ,'Teacher has left the room', 'Please try joining another room', 'red', true, false, reset);
    
    console.log("exit");

});

socket.on('student-accepted', (el) => {
  popUpContainer.classList.remove('active');
  joinRoomContainer.classList.remove('active');
  StudentAccepted();
  socket.emit('student-join-room',el);
})
socket.on('student-declined', (el) => {
  SetPopUpText('Join Failed' ,'Teacher has declined the request', 'Please try joining again', 'red', true, false, PopUpOkCBDefault);
  
  
})
//Function
function ResponseFromServer(isJoined, message)
{
    joined = isJoined;
    if(isJoined)
    {
            SetPopUpText('Request Sent','Join Request Sent!', 'Please wait', 'green', true, true, PopUpOkCBDefault);
    }
    else
    {
            joinButton.disabled = false;
            validationContainer.style.display = 'flex';
            validationText.innerHTML = message;
    }
    
}
function StudentAccepted()
{
  joinRoomContainer.style.display = 'none';
  playersJoinedContainer.style.display = 'flex';

  SetResponse({ message: 'Joined.. Waiting for other players to join' });
}
function SetResponse({containerDisplay = 'flex', loaderDisplay = 'flex', color ='ghostwhite', message = '', isInvalid = false})
{
    response.style.display = containerDisplay;
    response.firstElementChild.style.display = loaderDisplay;
    response.lastElementChild.style.color = color;
    response.lastElementChild.innerHTML = message;
    if(isInvalid)
    {
        if(!roomInput.classList.contains('invalid'))
        {
            roomInput.classList.add('invalid');
            
        }
    }
    
}

function SetPopUpText(popUpMainTitle = 'Error', popUpMessage1 = 'error', popUpMessage2 = 'error', popUpColor = 'red', disableClose = false, disableOk = false, cb)
{
  popUpCloseBtn.style.display = disableClose == true ? 'none' : 'block';
  popUpOkBtn.style.display = disableOk == true ? 'none' : 'block';
  const title = popUpContainer.getElementsByTagName("h2");
  bg.style.display = "block";
  title[0].innerText = popUpMainTitle;
  title[0].style.background = popUpColor;
  const spans = popUpContainer.getElementsByTagName("span");
  spans[0].innerText = popUpMessage1;
  spans[1].innerText = popUpMessage2;
  popUpContainer.classList.add('active');
  joinRoomContainer.classList.add('active');
  
  popUpOkBtn.addEventListener("click", cb, {once: true})
  
}

function DisplayLobby(message)
{
 
    const mainDiv = document.createElement('div');
    mainDiv.classList.add('student');

    const div = document.createElement('div');
    const icon = document.createElement('i');
    icon.classList.add("bi-person-square");
    div.textContent = message;
    mainDiv.append(icon);
    mainDiv.append(div);
    document.getElementById('player-list').append(mainDiv);

}

function DeleteArray()
{
    document.getElementById('player-list').innerHTML = "";
}

function PopUpOkCBDefault()
{
  bg.style.display = "none";
  popUpContainer.classList.remove('active');
  joinRoomContainer.classList.remove('active');
}