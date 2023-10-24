import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import {DeviceOrientationControls} from '../VR/DeviceOrientationControl.js';
class VR
  {
    constructor()
    {
        this.camera;
        this.renderer;
        this.dragControls
        this.orientControls;

        this.currentScene;
        this.isMobile = false;
        this.orientControlActive = true;
      
        this.allScenes = [];
    }

    Init()
    {
          // Create a new WebGL renderer object
      this.renderer = new THREE.WebGLRenderer({antialias: true});
      this.renderer.setPixelRatio( window.devicePixelRatio );
      // Set the renderer size to the window size
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.xr.enabled = true;
      this.renderer.xr.setReferenceSpaceType( 'local' );
      document.body.appendChild( this.renderer.domElement );
      // Append the renderer to the document body
      document.getElementById("image-container").appendChild(this.renderer.domElement);
    // Create a new camera object
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);


      // Set the camera position
      this.camera.position.set(0, 0, 0.1);

      this.SetVRScenes();
      this.currentScene = this.allScenes[0];

      this.dragControls = new OrbitControls(this.camera, this.renderer.domElement);
     
      this.orientControls = new DeviceOrientationControls(this.camera, this.renderer.domElement);
      //window.addEventListener('mousedown', () => {
       //orientControls.enabled = false;
      //})
      //window.addEventListener('mouseup', () => {
        //orientControls.enabled = true;
      //})
      // Disable vertical movement of the camera
      
      this.dragControls.enableZoom = false;
      this.dragControls.enablePan = false;
      this.dragControls.titleEnabled = true;
      this.orientControls.enableZoom = false;
      this.orientControls.enablePan = false;
      this.orientControls.titleEnabled = true;
      // Set the controls to rotate around the panorama image
      this.dragControls.rotateSpeed = -0.25;
      this.orientControls.rotateSpeed = -0.25;
      this.dragControls.maxDistance = 500;
      this.dragControls.minDistance = -Infinity;
      this.orientControls.maxDistance = 500;
      this.orientControls.minDistance = -Infinity;
      
      this.dragControls.zoomSpeed = 10;
      console.log(this.dragControls)
      // Set the render loop
      this.renderer.setAnimationLoop(() => {
          // Update the OrbitControls
      if(this.orientControlActive)
      {
        this.orientControls.update();
      }
      else
      {
      this.dragControls.update();

      }

          // Render the scene with the camera and renderer
      this.renderer.render(this.currentScene, this.camera);
        });
      
    }
    
    SetControls(crossDiv)
    {
        if(this.orientControlActive)
        {
          this.orientControls.enabled = true;
          this.dragControls.enabled = false;
          if(crossDiv.classList.contains('crossed'))
          {
              crossDiv.classList.remove('crossed')
          }
        }
        else
        {
          this.orientControls.enabled = false;
          this.dragControls.enabled = true;
          if(!crossDiv.classList.contains('crossed'))
          {
            crossDiv.classList.add('crossed')
          }
        }
    }
    
    ChangeScene(sceneNum)
    {
      
        this.currentScene = this.allScenes[sceneNum];

    }
    
    SetVRScenes()
    {
      const sprites = ['/Images/mt-samat.jpeg', '/Images/LasCasas1.jpg', '/Images/LasCasas2.jpeg', '/Images/LasCasas3.jpeg']
      for(let i = 0; i < sprites.length; i++)
      {
          const scene = new THREE.Scene();
      

          // Load the panorama image
          const loader = new THREE.TextureLoader();
          const texture = loader.load(sprites[i]);

          // Set the texture wrapping and flipping options
          texture.wrapS = THREE.RepeatWrapping;
          texture.repeat.x = -1;

          // Create a new sphere geometry to hold the panorama image
          const geometry = new THREE.SphereGeometry(500, 60, 40);

          // Flip the geometry inside out so that the image is displayed on the inside of the sphere
          geometry.scale(-1, 1, 1);

          // Create a new material with the loaded texture
          const material = new THREE.MeshBasicMaterial({
            map: texture
          });

          // Create a new mesh with the geometry and material
          const mesh = new THREE.Mesh(geometry, material);
            // Add the mesh to the scene
          scene.add(mesh);
        
          this.allScenes.push(scene)
      }
      
    }
    OnWindowResize() {

				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();

				this.renderer.setSize( window.innerWidth, window.innerHeight );

			}

  }

export {VR}