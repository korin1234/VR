import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import {VR} from './VR/VR.js'
import { VRButton } from '/VR/VRButton.js';
//Enter you IP Address and Port number here
const socket = io();
//const socket = io('http://localhost:3000');

const gyroButton = document.querySelector('#gyro-button'); 
const exitGame = document.querySelector('#exit-btn'); 
const exitYesBtn = document.querySelector('#exit-yes-btn'); 
const exitNoBtn = document.querySelector('#exit-no-btn'); 
const popupExit = document.querySelector('#popup-exit'); 
const roomID = sessionStorage.getItem('roomID');
const playerType = sessionStorage.getItem('type');
const name = sessionStorage.getItem('name');
const sideBarMenu = document.querySelector('.menu');
const openMenuButton = document.querySelector('.menu-btn');
const closeMenuButton = document.querySelector('.close-btn');
const sideBar = document.querySelector('.side-bar'); 
const enterVRDiv = document.querySelector('#enter-vr');
const crossDiv = document.querySelector('#cross');
const defaultScenesContainer = document.querySelector("#default-scenes");
const vr = new VR();
let currentSceneNum;
let optionsShow = false;
vr.Init();




if(playerType == 'teacher')
{
    
    sideBar.style.display = 'block';
    socket.emit('teacher-create-game-room', roomID, message =>{

    })
    socket.emit('get-temp-links');
    socket.emit('get-default-scenes-checked')
}
else
{
    //sideBar.style.display = 'none';
    while(sideBarMenu.firstChild)
    {
        sideBarMenu.removeChild(sideBarMenu.lastChild)
    }
    const playerDetails = {
        room: roomID,
        name: name
    }
    socket.emit('student-join-game', playerDetails, cb =>{

    });
}
sideBarMenu.appendChild(VRButton.createButton(vr.renderer));
const vrButton = document.querySelector('#VRButton');
sideBarMenu.insertBefore(vrButton, sideBarMenu.firstChild);
vrButton.classList.add('item');
vrButton.addEventListener('click', () =>{
    sideBar.classList.remove('active');
  })

vr.isMobile = navigator.userAgentData.mobile;
if(!vr.isMobile)
{
  vr.orientControlActive = false;
  gyroButton.style.display = "none";
  gyroButton.style.cursor = "not-allowed";
  vr.SetControls(crossDiv);

}
else
{
  vr.orientControlActive = true;
  vr.SetControls(crossDiv);


}


exitGame.addEventListener('click', () => {

  popupExit.style.display = "flex";
})

exitYesBtn.addEventListener('click', () => {
  socket.emit('teacher-exit', roomID, () => {
      
   });
})
exitNoBtn.addEventListener('click', () => {
  popupExit.style.display = "none";
})

const allVrScenesButton = document.getElementsByClassName("sub-item");
const item = document.getElementsByClassName("item");
for(let i = 0; i < item.length; i++)
{
  if(!item[i].getElementsByClassName('sub-menu')[0])
  {
    continue;
  }
  item[i].addEventListener('click', () => {
    optionsShow = !optionsShow;
    item[i].getElementsByClassName('sub-menu')[0].style.display = optionsShow == true? "block" : "none"
  })
}

for(let i = 0; i < allVrScenesButton.length; i++)
{
    allVrScenesButton[i].addEventListener('click', () => {
      socket.emit('change-scene', roomID, i);
        
    })
}


socket.on('exit-game', () => {
    if(playerType == 'teacher')
        {
            RedirectToPage('teacher');    
        }
        else
        {
            RedirectToPage('student'); 
        }

});


socket.emit('exit-room', roomID => {
   
        
})

socket.on('return-default-scenes-checked', (showScenes) => {
 
  defaultScenesContainer.style.display = showScenes == true ? "block" : "none";
})

function RedirectToPage(page)
{
    window.location.href = '/' + page;
}
window.addEventListener('deviceorientation', (e) =>{

});


socket.on('return-temp-links', linksArr => {
   
    vr.SetTempVRScenes(linksArr);
    if(playerType != 'teacher') return;
    for(let i = 0; i < vr.tempScenes.length; i++)
  {

      const uploadScenes = document.getElementById('upload-item-container');
      const menu = uploadScenes.querySelector(".sub-menu");

      let sceneBtn = document.createElement('a');
      sceneBtn.classList.add('upload-sub-item');
      sceneBtn.textContent = linksArr[i].name;
      menu.append(sceneBtn);
      sceneBtn.addEventListener('click', () => {

        socket.emit('change-temp-scene', roomID, i);

      })

    }
})

gyroButton.addEventListener('click', (e) => {
  vr.orientControlActive = !vr.orientControlActive;
  vr.SetControls(crossDiv);

  
});


openMenuButton.addEventListener('click', () => {
  sideBar.classList.add('active');
})

closeMenuButton.addEventListener('click', () => {
  sideBar.classList.remove('active');
})

socket.on('change-scene', (num) => {
  vr.ChangeScene(num);
})

socket.on('change-temp-scene', (num) => {
  vr.ChangeTempScene(num);
})

//window.addEventListener( 'resize', vr.OnWindowResize );