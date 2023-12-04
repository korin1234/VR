import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";


//Enter you IP Address and Port number here
const socket = io();
//const socket = io('http://localhost:3000');
const form = document.querySelector("#file-upload-form");

const uploadBtn = document.querySelector(".upload-btn");
const fileInput = document.querySelector(".file-input");
const progressArea = document.querySelector(".progress-area");
const uploadArea = document.querySelector(".uploaded-area");
const codeText = document.getElementById('code-text');
const generateCodeBtn = document.getElementById('generate-code');
const startGame = document.getElementById('start-game');
const backBtn = document.getElementById('back');
const tabRadio = document.getElementById('tab-request');
const notifications = document.getElementById('notification');
const noPlayersPopUp = document.getElementById('popup-no-joined');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const showScenesCheckbox = document.getElementById('default-check');
const popupFileError = document.querySelector('.popup-file-error');
const popupOkBtn = popupFileError.querySelector('.ok-btn');
const popupChangeRoom = document.querySelector('.popup-change-room');
const popupCover = document.querySelector('.popup-bg-cover');
const selectContainer = document.querySelector('#recently-added');
const dropDown = document.querySelector('.images-dropdown');
const studentsJoined = [];
const studentsWaiting = [];
const imageUrlLinks = [];
let notificationNum = 0;
let imageNum = 0;
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
socket.on('refresh-requests', (message) => {
    RefreshPlayers(message);
      
})
socket.on('student-join-request', (el) => {
  
  //studentsWaiting.push(el);
  RefreshPlayers(el);
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
      //RefreshPlayers(studentsWaiting);
      
      
    })
  
    rejectButton.addEventListener('click', (e) => {
        studentsWaiting.forEach((el) => {
        if(el.id == message.id)
          {
            studentsWaiting.splice(el, 1);
          }
      })
        socket.emit('student-declined', message);
        //RefreshPlayers(studentsWaiting);
    })
  
}

function RefreshPlayers(message)
{
  notifications.style.display = "none";
  notificationNum = 0;
  DeleteChildElements('students-request');
    message.forEach(element => {
        //console.log(element.name);
        if(element.type == 'student')
        {
          CreatePlayerButton(element);
          notificationNum++;
          
          
        }
        
    });
    
  if(notificationNum > 0)
    {
      notifications.style.display = "block";
      notifications.innerHTML = notificationNum;
    }
      
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
  popupChangeRoom.classList.add('active');
  popupCover.style.display = "block";
    
})

popupChangeRoom.querySelector('.change-room-yes-btn').addEventListener('click', (e) => {
    socket.emit('teacher-leave-room', codeText.value);
    GenerateRandomNumber();
    socket.emit('teacher-create-room', codeText.value, message => {
        //DisplayMessage(message);
    });
    popupChangeRoom.classList.remove('active');
    popupCover.style.display = "none";
})
popupChangeRoom.querySelector('.change-room-no-btn').addEventListener('click', (e) => {
    popupChangeRoom.classList.remove('active');
    popupCover.style.display = "none";
})
startGame.addEventListener('click', (e) => {
  
  if(studentsJoined.length == 0)
    {
      noPlayersPopUp.style.display = 'flex';
      return;
    }
   
    socket.emit('start-game', codeText.value);
    socket.emit('show-default-scenes', showScenesCheckbox.checked);
    EditMultiName();
    
    
})

//backBtn.addEventListener('click', (e) =>{
    //socket.emit('teacher-leave-room', codeText.value);
    //window.location.href = '/';
//})

tabRadio.addEventListener('click', (e) => {
  notificationNum = 0;
  notifications.style.display = "none";
})

noButton.addEventListener('click', (e) => {
  noPlayersPopUp.style.display = 'none';
})

yesButton.addEventListener('click', (e) => {
  
  socket.emit('start-game', codeText.value);
  socket.emit('show-default-scenes', showScenesCheckbox.checked);
  
  EditMultiName();
  
})

uploadBtn.addEventListener('click', () => {
  fileInput.click();
})

dropDown.addEventListener('click', () => {
  if(selectContainer.style.display == "none")
    selectContainer.style.display = "block";
  else
    selectContainer.style.display = "none";
    
})

fileInput.onchange = ({target}) =>{
  let file = target.files[0];
  if(file)
    {
      let fileName = file.name;
      if(fileName.length >= 12)
        {
          let splitName = fileName.split(".");
          fileName = splitName[0].substring(0, 12) + "... ." + splitName[1];
        }
      let url = URL.createObjectURL(file);
      const image = new Image();
      
      image.onload = function()
      {
        if(this.width >= 3000 && this.height >= 1000)
          {
            UploadFile(fileName, url, target.files[0].name);

          }
          else
          {
            popupFileError.classList.add('active');
            popupCover.style.display = "block";
            
          }
        
      }
      image.src = url;
      
    }

}

function UploadFile(name, url, fullName)
{
  imageNum++;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/uploads");
  //xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.upload.addEventListener("progress", ({loaded, total}) => {
    let fileLoaded = Math.floor((loaded/total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB";
    let progressHTML = `<li class="row">
          <i class="bi bi-file-earmark-arrow-up"></i>
          <div class="content">
            <div class="details">
              <span class="name">${name} Uploading</span>
              <span class="percent">${fileLoaded}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress" style="width: ${fileLoaded}%">
                
              </div>
            </div>
          </div>
        </li>`;
    
    progressArea.innerHTML = progressHTML;
    if(loaded == total)
    {
      progressArea.innerHTML = "";
      let uploadHTML = `<li class="row">
          <img class="img-preview" src=${url}>
          <div class="content">
            <div class="details">
              <input type="text" class="edit-name-text" value="Image${imageNum}" >
              <span class="name">${name}</span>
              <span class="size">${fileSize}</span>
              <span class="fullname" style="display:none">${fullName}</span>
            </div>
          </div>
          <div class="upload-button-container"> 
              <button class="remove-btn">
                -
              </button>
            </div>
        </li>`;
    
        
        uploadArea.insertAdjacentHTML("afterbegin", uploadHTML);
        let row = uploadArea.querySelectorAll('.row');
      
        row[0].querySelector('.remove-btn').addEventListener('click', (e)=> {
          row[0].remove();
          
          fetch('/deletefile', {
            method: 'POST',  
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({filename: fullName}),

          })
          .then(res => res.json())
          .then(data => console.log(data))
        });
        /*
        row[0].querySelector('.edit-name-btn').addEventListener('click', (e)=> {
          const editNameText = row[0].querySelector(".edit-name-text").value;
          fetch('/changefilename', {
            method: 'POST',  
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({fullname: fullName, changedname: editNameText}),

          })
          .then(res => res.json())
          .then(data => console.log(data))
          
        });
        */
      }
  })
  
  
  
  //CreateImageButtons();
  const files = document.getElementById('files');
  let formData = new FormData();
  formData.append("files",files.files[0]);
  
  xhr.send(formData);

}



form.addEventListener('submit', (e) => {
  e.preventDefault();
  const files = document.getElementById('files');
  const formData = new FormData();
  for(let i = 0; i < files.files.length; i++)
  {
    formData.append("files", files.files[i]);
  }
  console.log(...formData)
  fetch('/uploads', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', },
    body: formData,
    
  })
  .then(res => res.json())
  .then(data => console.log(data))
})



function EditMultiName()
{
  const row = uploadArea.querySelectorAll('.row');
  
  const nameData = []
  row.forEach(el => {
    const editNameText = el.querySelector(".edit-name-text");
    const fullNameText = el.querySelector(".fullname");
 
    const data = {
      fullname: fullNameText.textContent,
      changedname: editNameText.value
    }
    nameData.push(data);
  })
  fetch('/changefilename', {
            method: 'POST',  
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify(nameData),

          })
          .then(res => res.json())
          .then(data => console.log(data))
        
  
}



popupOkBtn.addEventListener('click', (e) =>{
    popupFileError.classList.remove('active');
    popupCover.style.display = "none";
})
socket.emit('get-recently-uploaded');
socket.on('return-recently-uploaded', (data) => {
  console.log(data);
  data.forEach(el => {
    const option = document.createElement('li');
    option.textContent = el.name;
    selectContainer.append(option);
    
    option.addEventListener('click', (e) => {
      console.log("added");
      GetFileFromRecentlyUploaded(el)
    })
    
  })
})

function GetFileFromRecentlyUploaded(data)
{
  let xhr = new XMLHttpRequest();
  let fileTotal;
  xhr.open('HEAD', data.url, true);
  xhr.onreadystatechange = function(){
    if ( xhr.readyState == 4 ) {
      if ( xhr.status == 200 ) {
        console.log('Size in bytes: ' + xhr.getResponseHeader('Content-Length'));
        fileTotal = xhr.getResponseHeader('Content-Length');
      } else {
        console.log('ERROR');
      }
    }
  };
  xhr.send(null);
  
  
 

    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (100 / (1024 * 1024)).toFixed(2) + " MB";
  
    let uploadHTML = `<li class="row">
            <img class="img-preview" src=${data.url}>
            <div class="content">
              <div class="details">
                <input type="text" class="edit-name-text" value="${data.name}" >
                <span class="name">${data.fullname}</span>
                <span class="size">${fileSize}</span>
                <span class="fullname" style="display:none">${name}</span>
              </div>
            </div>
            <div class="upload-button-container"> 
                <button class="remove-btn">
                  -
                </button>
              </div>
          </li>`;
        uploadArea.insertAdjacentHTML("afterbegin", uploadHTML);
        let row = uploadArea.querySelectorAll('.row');
      
        row[0].querySelector('.remove-btn').addEventListener('click', (e)=> {
          row[0].remove();
          
          fetch('/deletefile', {
            method: 'POST',  
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({filename: data.fullname}),

          })
          .then(res => res.json())
          .then(data => console.log(data))
        });
        
      
  
  //CreateImageButtons();
  console.log(data.fullname)
  fetch('/recently-added', {
            method: 'POST',  
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({filename: data.fullname}),

          })
          .then(res => res.json())
          .then(data => console.log(data))
        
}

document.querySelector('.profile-dropdown').addEventListener('click', (e) => {
    const ul = document.querySelector('.profile-dropdown').querySelector('ul');
  if(ul.style.display == "none")
    ul.style.display = "block";
  else
    ul.style.display = "none";
    
})

document.querySelector('#account-settings').addEventListener('click', (e) => {
    
    location.href = "/accountsettings";
})

document.querySelector('#logout').addEventListener('click', (e) => {
  socket.emit('teacher-leave-room', codeText.value);
    fetch('/logout', {
            method: 'GET',  
            headers: {'Content-Type': 'application/json', },
            redirect: "follow"

          })
          .then(res => {
              if(res.redirected)
              {
                location.href = res.url
              }
              return res.json();
          })
          .then(data => console.log())
          
});
    
