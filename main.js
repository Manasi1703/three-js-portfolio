import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



const sounds = {
  backgroundMusic: new Howl({
    src: ["./music/backgroundmusic.mp3"],
    loop: true,
    volume: 0.3,
    preload: true,
  }),


  jumpSFX: new Howl({
    src: ["./music/jump.mp3"],
    volume: 1.0,
    preload: true,
  }),
};

let touchHappened = false;

let isMuted = false;

function playSound(soundId) {
  if (!isMuted && sounds[soundId]) {
    sounds[soundId].play();
  }
}

function stopSound(soundId) {
  if (sounds[soundId]) {
    sounds[soundId].stop();
  }
}


const scene = new THREE.Scene();
scene.background = new THREE.Color("#cae388");
const canvas = document.getElementById("experience-canvas");
const sizes = {
  width : window.innerWidth,
  height : window.innerHeight,
};
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


let character = {
  instance :null,
  moveDistance: 3,
  jumpHeight: 1,
  isMoving: false,
  moveDuration: 0.2,
}

//<------ renderer -------->
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;


const modalContent ={
  computer:{
    title : "Portfolio", 
    content: "What have I been cooking so far? 💻",
    link: "https://www.manasighutukade.work/",
  },
  cube_1:{
    title : "Reading List", 
    content: "Currently Reading : What you're looking for is in the library by Michiko Aoyama",
    link: "https://www.goodreads.com/book/show/91274427-what-you-are-looking-for-is-in-the-library",
  },
  playground:{
    title : "Playground", 
    content: "Click to see all the fun stuff I've been tinkering with.",
    link: "https://www.manasighutukade.work/microfeed",
  },
};

const modal = document.querySelector(".modal");
const modalProjectDescription = document.querySelector(".modal-project-description");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitProjectButton = document.querySelector(".modal-project-visit-button");

function showModal(id) {
  const insideContent = modalContent[id];
  if (insideContent) {
    const modalTitle = modal.querySelector(".modal-title");
    modalTitle.textContent = insideContent.title;
    modalProjectDescription.textContent = insideContent.content;
    modal.classList.toggle("hidden");
    modalVisitProjectButton.href = insideContent.link;
    modalVisitProjectButton.classList.remove('hidden');
  }
}

function hideModal() {
  
  modal.classList.toggle("hidden");
  modalbgOverlay.classList.add("hidden");
  if (!isMuted) {
    playSound("projectsSFX");
  }

  
}


let intersectObject = "";
const intersectObjects = [];
const intersectObjectNames = [
  "Chicken",
  "Cube043",
  "computer",
  "playground",
  "mushroom",
  "cube_1",
];


//<----- loading-screen ---->
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.querySelector(".loading-text");
const enterButton = document.querySelector(".enter-button");
const instructions = document.querySelector(".instructions");

const manager = new THREE.LoadingManager();

manager.onLoad = function () {
  const t1 = gsap.timeline();

  t1.to(loadingText, {
    opacity: 0,
    duration: 0,
  });

  t1.to(enterButton, {
    opacity: 1,
    duration: 0,
  });
};

enterButton.addEventListener("click", () => {
  gsap.to(loadingScreen, {
    opacity: 0,
    duration: 0,
  });
  gsap.to(instructions, {
    opacity: 0,
    duration: 0,
    onComplete: () => {
      loadingScreen.remove();
    },
  });

  if (!isMuted) {
    playSound("projectsSFX");
    playSound("backgroundMusic");
  }
});



//<------ gltf-loader -------->
const loader = new GLTFLoader(manager);

loader.load( './creativeblender.glb', function ( glb ) {
  console.log(glb);
  glb.scene.traverse (child=>{ 
    if(intersectObjectNames.includes(child.name))
    {
      intersectObjects.push(child);
    }

    if(child.isMesh)
    {
      child.castShadow = true;
      child.receiveShadow = true;
    }
    
    console.log(child);
    if(child.name === "girl")
      {
        character.instance = child;
      }
  }

  
  );
  scene.add( glb.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

//<------ light -------->
const sun = new THREE.DirectionalLight( 0xFFFFFF );

scene.add( sun );


const light = new THREE.AmbientLight( 0x404040, 4); // soft white light
scene.add( light );



//<------ camera -------->
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( -aspect * 50, aspect * 50, 50, -50, 1, 1000 );

camera.position.x = 47;
camera.position.y = 42;
camera.position.z = -91;

const cameraOffset = new THREE.Vector3(47, 50, -91);
camera.zoom = 3;
camera.updateProjectionMatrix();
// const controls = new OrbitControls( camera, canvas );
// controls.update();




//<------ resizing -------->
function handleResize(){
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  const aspect = sizes.width / sizes.height;
  camera.left = -aspect * 50;
  camera.right = aspect * 50;
  camera.top = 50;
  camera.bottom = -50;
  camera.updateProjectionMatrix();

  renderer.setSize( sizes.width, sizes.height );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}



function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function jumpCharacter(meshID) {
  const mesh = scene.getObjectByName(meshID);
  const jumpHeight = 2;
  const jumpDuration = 0.5;
  playSound("jumpSFX");

  const t1 = gsap.timeline();

  t1.to(
    mesh.position,
    {
      y: mesh.position.y + jumpHeight,
      duration: jumpDuration * 0.5,
      ease: "power2.out",
    },
    "<"
  );

  t1.to(
    mesh.position,
    {
      y: mesh.position.y,
      duration: jumpDuration * 0.5,
      ease: "bounce.out",
      
    },
    ">"
  );
}

function onClick()
{
  console.log(intersectObject);
  if (intersectObject !== "")
  {
    if(["mushroom" , "Chicken"].includes(intersectObject))
    {
      jumpCharacter(intersectObject);
    }
    else{
      {
        showModal(intersectObject);
      }
    }
  }
  
}


function moveCharacter(targetPositon, targetRotation)
{
  character.isMoving = true;
  let rotationDiff =
    ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
      3 * Math.PI) %
      (2 * Math.PI)) -
    Math.PI;
  let finalRotation = character.instance.rotation.y + rotationDiff;


  const t1 = gsap.timeline(
    {
      onComplete: () => {
        character.isMoving = false;
      }
    }
  );
  t1.to(character.instance.position , {
    x: targetPositon.x,
    z: targetPositon.z,
    duration: character.moveDuration,
  });

  t1.to(character.instance.rotation , {
    y:finalRotation,
    duration: character.moveDuration,
  } , 0);

  t1.to(character.instance.position , {
    y:character.instance.position.y + character.jumpHeight,
    duration: character.moveDuration / 2,
    yoyo: true,
    repeat: 1,
  } , 0);
}





function onKeyDown(event)
{
  if(character.isMoving) return;
  const targetPositon = new THREE.Vector3().copy(character.instance.position);

  let targetRotation = 0;
  
  switch(event.key.toLowerCase())
  {
    case "w":
    case "arrowup":
        targetPositon.z += character.moveDistance;
        targetRotation = -Math.PI/2;
        break;
    case "s":
    case "arrowdown":
        targetPositon.z -= character.moveDistance;
        targetRotation = Math.PI/2;
        break;
    case "a":
    case "arrowleft":
        targetPositon.x += character.moveDistance;
        targetRotation = 0;
        break;
    case "d":
    case "arrowright":
        targetPositon.x -= character.moveDistance;
        targetRotation = Math.PI;
        break;
    default:
      return;

    
  }
  moveCharacter(targetPositon, targetRotation);
}

modalExitButton.addEventListener( "click", hideModal);
window.addEventListener("resize" , handleResize);
window.addEventListener( "pointermove", onPointerMove );
window.addEventListener( "click", onClick);
window.addEventListener("keydown", onKeyDown);




function animate() {
  

  if (character.instance) {
      const targetCameraPosition = new THREE.Vector3(
        character.instance.position.x + cameraOffset.x,
        cameraOffset.y,
        character.instance.position.z + cameraOffset.z
      );
      camera.position.copy(targetCameraPosition);
      camera.lookAt(
        character.instance.position.x,
        camera.position.y - 42,
        character.instance.position.z
      );
    }
  
  raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects( intersectObjects );

  if(intersects.length >0)
  {
    document.body.style.cursor = "pointer";
  } 
  else
  {
    document.body.style.cursor = "default";
    intersectObject = "";
  }

	for ( let i = 0; i < intersects.length; i ++ ) {

    intersectObject = intersects[0].object.parent.name;

	}

	renderer.render( scene, camera );

  renderer.render( scene, camera );

  console.log(camera.position);
}
renderer.setAnimationLoop( animate );