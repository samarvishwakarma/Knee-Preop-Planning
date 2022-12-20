import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { SphereGeometry, TextureLoader } from 'three'
import { GLTFLoader, GLTFParser, GLTFReference } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xE7E7E7);


//Storage
if(! localStorage.getItem("tireNumber") ) {
    localStorage.setItem("tireNumber", 1);
}
else ;

if(! localStorage.getItem("dark") ) {
    localStorage.setItem("dark", 1);
}
else ;

// Objects
var planemap;
const textureLoader = new THREE.TextureLoader();
planemap = textureLoader.load(`Texture/${localStorage.getItem("tireNumber")}.png`);

let model,plane;
const loader = new GLTFLoader();
loader.load('/mercedes.gltf',(gltf)=>{
    gltf.scene.position.z=0
    gltf.scene.position.y=0
    gltf.scene.rotation.y=15
    model = gltf.scene;
    scene.add(gltf.scene)
    gltf.scene.traverse( function( node ) {

        if ( node.isMesh ) { node.castShadow = true; 
        node.receiveShadow = true;
        if(node.material.map) node.material.map.anisotropy = 16;
    }

    } );
    model.children[0].material = tiretext;
    // console.log(gltf.parser.associations)
    // let f = 0;
    // for (let [key, value] of gltf.parser.associations.entries(Object)) {
    //     f=f+1;
    //     if(f==10){ 
    //         console.log(key)
    //         key.material = tiretext;
    //         // key.visible = false;
    //         break;}       
    // }
})

loader.load('/plane.gltf',(gltf)=>{
    gltf.scene.position.z=0
    gltf.scene.position.y=0
    gltf.scene.rotation.y=15
    scene.add(gltf.scene)
    gltf.scene.traverse( function( node ) {

        if ( node.isMesh ) { node.castShadow = true; 
        node.receiveShadow = true;
        if(node.material.map) node.material.map.anisotropy = 16;
    }

    } );
})

// Materials
const tiretext = new THREE.MeshStandardMaterial();
tiretext.map = planemap;
tiretext.transparent = false;
tiretext.side = 2;
tiretext.alphaTest = 0.5;
tiretext.displacementScale = 1;
tiretext.metalness = 0;
tiretext.roughness = 0;
tiretext.toneMapped = true;
tiretext.bumpMap = planemap;
planemap.onload = () => { tiretext.needsUpdate = true };


// JAVASCRIPT
var el = document.getElementsByClassName('btn');
console.log(el);
console.log(el[0]);


if(localStorage.getItem("dark")==1){

}
else;

el[0].addEventListener( 'click', myFunction);

// document.getElementsByClassName('btn')

function myFunction() {
    var element = document.getElementById("hero");
    element.classList.toggle("dark-mode");
    var element2 = document.getElementById("nav");
    element2.classList.toggle("nav-dark");
    var index2=localStorage.getItem("dark");
    index2 = (index2)%2+1;
    localStorage.setItem("dark",index2);
    // console.log(localStorage.getItem("dark"))
    if(index2==1)
    {
        scene.background = new THREE.Color(0x404040);
        pointLight.intensity = 1;
        hdri(night);
    }
    else 
    {   
        scene.background = new THREE.Color(0xE7E7E7);
        pointLight.intensity = 2;
        hdri(forest);
    }
}



//hdri

const forest = new RGBELoader().load('/forest.hdr');
const night = new RGBELoader().load('/night.hdr');

// hdri(forest);
function hdri(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    scene.environment = texture;
}

// Lights
const pointLight = new THREE.SpotLight(0xffa95c, 2)
pointLight.castShadow = true
pointLight.shadow.bias = -0.0001;
pointLight.shadow.mapSize.width = 1024*4;
pointLight.shadow.mapSize.height = 1024*4;
scene.add(pointLight);

//changing tire texture

var index = localStorage.getItem("tireNumber");

document.addEventListener( 'keydown', onKeyDown );
function onKeyDown(e) {
    switch (e.keyCode) {
        case 81:  //q
            index = (index)%4 + 1;
            localStorage.setItem("tireNumber",index);
            planemap = textureLoader.load(`Texture/${index}.png`);
            tiretext.map = planemap;
            tiretext.bumpMap = planemap;
            model.children[0].material = tiretext;
            break;
        case 87:  //w
            index = (index)%4 + 1;
            localStorage.setItem("tireNumber",index);
            planemap = textureLoader.load(`Texture/${index}.png`);
            tiretext.map = planemap;
            tiretext.bumpMap = planemap;
            model.children[0].material = tiretext;
            break;
        default:
            break;
    }
}

if(localStorage.getItem("dark")==1)
    {
        var el2 = document.getElementById("hero");
        var el3 = document.getElementById("nav");
        el2.classList.toggle("dark-mode");
        el3.classList.toggle("nav-dark");
        scene.background = new THREE.Color(0x404040);
        pointLight.intensity = 1;
        hdri(night);
    }
    else 
    {   
        scene.background = new THREE.Color(0xE7E7E7);
        pointLight.intensity = 2;
        hdri(forest);
    }

/** 
 * Sizes
 */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 9
camera.position.y = 20
camera.position.z = 50
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxDistance = 100
controls.minDistance = 50
controls.maxPolarAngle = 1.4

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputEncoding = THREE.sRGBEncoding;
// document.body.appendChild(renderer,domElement);
/**
 * Animate
 */
 document.addEventListener('mousemove',onDocumentMouseMove)

 let mouseX = 0
 let mouseY = 0
 
 let targetX = 0
 let targetY = 0
 
 const HalfX= window.innerWidth /2;
 const HalfY= window.innerHeight /2;
 
 function onDocumentMouseMove(event){
     mouseX= (event.clientX - HalfX)
     mouseY= (event.clientY - HalfY)
 }

 renderer.p

const clock = new THREE.Clock()
const tick = () =>
{
    targetX = mouseX*.001
    targetY = mouseY*.001

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    pointLight.position.set(
        camera.position.x +10 ,
        camera.position.y ,
        camera.position.z +10
    )

    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()