import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import {VR} from './VR/VR.js'
import { VRButton } from '/VR/VRButton.js';
//Enter you IP Address and Port number here
const socket = io();
//const socket = io('http://localhost:3000');

const gyroButton = document.querySelector('#gyro-button'); 
const exitGame = document.querySelector('#exit-btn'); 
const roomID = sessionStorage.getItem('roomID');
const playerType = sessionStorage.getItem('type');
const name = sessionStorage.getItem('name');
const sideBarMenu = document.querySelector('.menu');
const openMenuButton = document.querySelector('.menu-btn');
const closeMenuButton = document.querySelector('.close-btn');
const sideBar = document.querySelector('.side-bar'); 
const enterVRDiv = document.querySelector('#enter-vr');
const crossDiv = document.querySelector('#cross');
const vr = new VR();
let currentSceneNum;
let optionsShow = false;
vr.Init();




if(playerType == 'teacher')
{
    
    sideBar.style.display = 'block';
    socket.emit('teacher-create-room', roomID, message =>{

    })
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
    console.log('clicked');
    socket.emit('teacher-exit', roomID, () => {
        
     });
})

const allVrScenesButton = document.getElementsByClassName("sub-item");
const item = document.getElementsByClassName("item");
for(let i = 0; i < item.length; i++)
{
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


function RedirectToPage(page)
{
    window.location.href = '/' + page;
}
window.addEventListener('deviceorientation', (e) =>{

});

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

//window.addEventListener( 'resize', vr.OnWindowResize );