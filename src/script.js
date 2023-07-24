import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { GLTFLoader, GLTFParser, GLTFReference } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';


////////////general loaders//////
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x404040);

//////// Sizes
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio*0.8, 2))

    //
    labelRenderer.setSize(sizes.width, sizes.height);
})


//////////// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-0.8825131166278211,7.755499889864693,-5.201585031102542);
scene.add(camera)

////// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(-0.5,7,2);

////////Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true,
    antialias : true,
})

renderer.localClippingEnabled = true;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio*0.6, 2))
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputEncoding = THREE.sRGBEncoding;

///////////////Axes helper   
const axesHelper = new THREE.AxesHelper( 0.1 );
scene.add( axesHelper );

////////////////////////////////////////////
const translation = new TransformControls(camera, renderer.domElement);
translation.addEventListener('dragging-changed', function(){
    controls.enabled = !controls.enabled;
});
translation.attach(axesHelper);
scene.add(translation);
/////////////////////////////////////


//Storage


//loading manager
const loadingManager = new THREE.LoadingManager();

const progressBar = document.getElementById("progress-bar");
 
loadingManager.onProgress = function(url, loaded, total) {
    progressBar.value = (loaded / total) * 100;
}

const progressBarContainer = document.querySelector('.progress-bar-container');

loadingManager.onLoad = function() {
    progressBarContainer.style.display = 'none';
}
////////////////////////////////////////////////////////

//CSS2D
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);


////////////////////////hdri///////////////////////////////////////////////////
const night = new RGBELoader().load('/night.hdr');

hdri(night);
function hdri(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
}

// Lights
const pointLight = new THREE.PointLight(0xffa95c, 1)
scene.add(pointLight);

//////////////////////////////////////////////////////////////////////////////

///////////////////////model loader////////////////////////

var model, model2;
const loader = new GLTFLoader(loadingManager);
loader.load('/Right_Femur.gltf',(gltf)=>{
    gltf.scene.children[0].material.metalness = 0.5;
    gltf.scene.traverse( function( node ) {
        model = gltf.scene.children[0]
        if ( node.isMesh ) { node.castShadow = true; 
        node.receiveShadow = true;
        if(node.material.map) node.material.map.anisotropy = 16;
    }
    } );
    scene.add(gltf.scene)
})
loader.load('/Right_Tibia.gltf',(gltf)=>{
    gltf.scene.children[0].material.metalness = 0.5;
    gltf.scene.traverse( function( node ) {
        model2 = gltf.scene.children[0];
        if ( node.isMesh ) { node.castShadow = true; 
        node.receiveShadow = true;
        if(node.material.map) node.material.map.anisotropy = 16;
    }
    scene.add(gltf.scene)
    } );
})
//////////////////////////////////////////////////////////////////////////
//
const mousePos = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
var intersectPoint;
const planeNormal = new THREE.Vector3();

setTimeout(function(){
    window.addEventListener('mousemove', function(e){
    mousePos.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mousePos.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePos, camera);
    intersectPoint = raycaster.intersectObject(model,true);
})},2000);


//////////////////////////////////Landmarks//////////////////////////////

const geometry = new THREE.SphereGeometry(0.05, 6, 6); 
const sphere = []

const group = new THREE.Group();

for (let index = 0; index < 8; index++) {
    const material = new THREE.MeshStandardMaterial ( { color: Math.random()*0xffffff } ); 
    sphere.push(new THREE.Mesh( geometry, material ));
}
scene.add(group)


// JAVASCRIPT
const femur = document.getElementById('femur');
const tibia = document.getElementById('tibia');

document.getElementById('popup1').addEventListener('click', function(){
    if(femur.checked == true){
        model.visible = true;
    }
    if(femur.checked == false){
        model.visible = false;
    }
    if(tibia.checked == true){
        model2.visible = true;
    }
    if(tibia.checked == false){
        model2.visible = false;
    }
})

var i = -1;
for (let index = 0; index < 8; index++) {
    const element = document.getElementById(`mark${index+1}`);
    document.getElementById('list').addEventListener('click', positionChanger);
    function positionChanger(){
        if(element.checked == true) {
            domEvents.addEventListener(model, 'click', function(e){
                if(sphere[index].name == `sphere${index}`){
                    translation.attach(sphere[index]);
                }   
                else {
                sphere[index].position.copy(intersectPoint[0].point)
                group.add(sphere[index]);
                // scene.add(sphere[index]);
                sphere[index].name = `sphere${index}`                
                }
            });
            domEvents.addEventListener(sphere[index], 'mouseover', function(e){
                document.body.style.cursor = "pointer";
                sphere[index].material.emissive.r = 1;
            })
            domEvents.addEventListener(sphere[index], 'mouseout', function(e){
                document.body.style.cursor = "";
                sphere[index].material.emissive.r = 0;
            })
            i = index;
        }
        else {
            translation.detach(sphere[index])
        }
    };
    
}

////////////////////////UPDATE/////////////////////////////////////////////
var lineGroup = new THREE.Group()
var update = document.getElementsByClassName("update")
update[0].addEventListener('click', updateFunction);
var container = document.getElementById('cust');
var ul = document.getElementById("list")

function updateFunction(){
    update[0].hidden = true;
    ul.hidden = true;

    axesHelper.visible = false;
    translation.detach(axesHelper);
    

    model.material.color.set(0xA61C1C);
    model2.material.color.set(0x2EA690);

    //line

    const points = [];
    points.push( sphere[0].position);
    points.push( sphere[1].position);

    const points2 = [];
    points2.push( sphere[2].position);
    points2.push( sphere[3].position);

    const points3 = [];
    points3.push( sphere[4].position);
    points3.push( sphere[5].position);

    const points4 = [];
    points4.push( sphere[6].position);
    points4.push( sphere[7].position);

    const points5 = [];
    points5.push( sphere[0].position);
    points5.push( new THREE.Vector3(sphere[0].position.x, sphere[0].position.y, sphere[0].position.z));

    const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
    const lineGeometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
    const lineGeometry3 = new THREE.BufferGeometry().setFromPoints( points3 );
    const lineGeometry4 = new THREE.BufferGeometry().setFromPoints( points4 );
    

    const line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial({
        color: Math.random() * 0xFFFFFF
    }) );
    line.name = "Mechanical Axis";
    const line2 = new THREE.Line( lineGeometry2, new THREE.LineBasicMaterial({
        color: Math.random() * 0xFFFFFF
    }) );
    line2.name = "TEA";
    const dupLine2 =  new THREE.Line( lineGeometry2, new THREE.LineBasicMaterial({
        color: Math.random() * 0xFFFFFF
    }));
    dupLine2.name = "TEA P";
    const line3 = new THREE.Line( lineGeometry3, new THREE.LineBasicMaterial({
        color: Math.random() * 0xFFFFFF
    }) );
    line3.name = "PCA";
    const line4 = new THREE.Line( lineGeometry4, new THREE.LineBasicMaterial({
        color: Math.random() * 0xFFFFFF
    }) );

    lineGroup.add( line, line2, line3, line4 );
    

    //////////////MECHANICAL/////////////////
    var planeGeom = new THREE.BoxGeometry(2,2,0.001);
    var mechanicalAplane = new THREE.Mesh(planeGeom, new THREE.MeshStandardMaterial({
        color: 0xF28705,
        transparent: true
    }));
    
    mechanicalAplane.position.x = (sphere[0].position.x) ;
    mechanicalAplane.position.y = (sphere[0].position.y);
    mechanicalAplane.position.z = (sphere[0].position.z);
    mechanicalAplane.lookAt(sphere[1].position);    
    mechanicalAplane.rotation.z = 0;  
    mechanicalAplane.name = "Mechanical plane";
    mechanicalAplane.attach(dupLine2);
    ///////////ANTERIOR LINE////////////

    const slope = -(sphere[3].position.x-sphere[2].position.x)/(sphere[3].position.z-sphere[2].position.z)
    const constant = (sphere[0].position.z)-slope*(sphere[0].position.x)
    const z = slope*(sphere[0].position.x + 0.5) + constant;

    const anteriorPoints = [];
    anteriorPoints.push( sphere[0].position);
    anteriorPoints.push( new THREE.Vector3(sphere[0].position.x + 0.25 ,mechanicalAplane.position.y,z));
    const lineGeometry5 = new THREE.BufferGeometry().setFromPoints( anteriorPoints );
    const anteriorLine = new THREE.Line( lineGeometry5, new THREE.LineBasicMaterial({
        color: Math.random() * 0xFFFFFF
    }) );
    anteriorLine.name = "Anterior";
    lineGroup.add(anteriorLine);

    //////////VARGUS/ VALGUS ///////////////
    var varus = mechanicalAplane.clone();
    varus.name = "Varus/Valgus";
    varus.lookAt(anteriorPoints[1]);
    varus.rotateX(Math.PI/2);
    // mechanicalAplane.lookAt(anteriorPoints[1]);
    // mechanicalAplane.rotateX(Math.PI/2);
    varus.material = new THREE.MeshPhysicalMaterial({
        color: 0xBF3604,
        transparent: true
    });
    var varusDiv = document.createElement('div');
    container.appendChild(varusDiv);
    varusDiv.className = "varus";
    var varusText = document.createElement('p');
    var add = document.createElement('a');
    var varusNum = document.createElement('p');
    var minus = document.createElement('a');
    varusText.className = 'varustext';
    add.className = 'add';
    varusNum.className = 'varusnum';
    minus.className = 'minus';
    varusText.textContent = 'Varus/Valgus';
    add.textContent = '+';
    varusNum.textContent = '0';
    minus.textContent = '-';
    varusDiv.appendChild(varusText);
    varusDiv.appendChild(add);
    varusDiv.appendChild(varusNum);
    varusDiv.appendChild(minus);
    var num = 100;
    

    /////////////LATERAL LINE///////////////////////
    const lateralslope = -(anteriorPoints[1].z-sphere[0].position.z)/(anteriorPoints[1].x-sphere[0].position.x)
    const lateralconstant = (sphere[0].position.x)-lateralslope*(sphere[0].position.z)
    const lateralz = lateralslope*(sphere[0].position.z + 0.5) + lateralconstant;

    const lateralPoints = [];
    lateralPoints.push(new THREE.Vector3(0,0,0));
    lateralPoints.push( new THREE.Vector3(lateralz+15,0,0));
    const laterallineGeometry = new THREE.BufferGeometry().setFromPoints( lateralPoints );
    const lateralLine = new THREE.Line( laterallineGeometry, new THREE.LineBasicMaterial({
        color: Math.random() * 0xFFFFFF
    }) );
    lateralLine.name = "Lateral";
    varus.add(lateralLine);
    /////////////////////////////////////////////////////

    /////////////FLEXION ///////////////////////////////
    var flexion = varus.clone();
    flexion.name = "Flexion/Extension";
    flexion.material = new THREE.MeshPhysicalMaterial({
        color: 0xD95204
    });
    varus.attach(flexion)
    var flexionDiv = document.createElement('div');
    container.appendChild(flexionDiv);
    var flexionText = document.createElement('p');
    var fadd = document.createElement('a');
    var flexionNum = document.createElement('p');
    var fminus = document.createElement('a');
    flexionText.className = 'flexiontext';
    fadd.className = 'fadd';
    flexionNum.className = 'flexionnum';
    fminus.className = 'fminus';
    flexionText.textContent = 'Flexion/Extension';
    fadd.textContent = '+';
    flexionNum.textContent = '0';
    fminus.textContent = '-';
    flexionDiv.appendChild(flexionText);
    flexionDiv.appendChild(fadd);
    flexionDiv.appendChild(flexionNum);
    flexionDiv.appendChild(fminus);
    var num = 180;

    /////////////// DISTAL MEDIAL ////////////////

    var distalmedial = new THREE.Mesh(planeGeom, new THREE.MeshStandardMaterial({
        color: Math.random() * 0xD95204,
        transparent: true
    }));
    distalmedial.position.x = sphere[7].position.x;
    distalmedial.position.y = sphere[7].position.y;
    distalmedial.position.z = sphere[7].position.z;
    distalmedial.rotation.set(flexion.rotation.x,flexion.rotation.y,flexion.rotation.z);
    distalmedial.rotateX(Math.PI/2);
    distalmedial.name ="Distal Medial Plane";

    ////////////// Resection Plane //////////////////

    var resectionplane = new THREE.Mesh(planeGeom, new THREE.MeshStandardMaterial({
        color: Math.random() * 0xFFFFFF,
        transparent: true
    }));
    resectionplane.position.x = sphere[7].position.x;
    resectionplane.position.y = sphere[7].position.y;
    resectionplane.position.z = sphere[7].position.z;
    resectionplane.rotation.set(flexion.rotation.x,flexion.rotation.y,flexion.rotation.z);
    resectionplane.rotateX(Math.PI/2);
    resectionplane.name = "Distal Resection Plane";

    var resectionPlaneDiv = document.createElement('div');
    container.appendChild(resectionPlaneDiv);
    var resectText = document.createElement('p');
    var radd = document.createElement('input');
    radd.type = 'number';
    resectText.className = "resecttext";
    radd.className = "radd";
    resectText.textContent = 'Distal Resection';
    radd.value = "0";
    resectionPlaneDiv.appendChild(resectText);
    resectionPlaneDiv.appendChild(radd);
    var resecty = resectionplane.position.y;

    
    var rotation = resectionplane.quaternion.clone();
    var localPlane = new THREE.Plane(new THREE.Vector3(0,1, 0), -resecty);
    localPlane.translate(new THREE.Vector3(resectionplane.position.x, 0, resectionplane.position.z));
    const helper = new THREE.PlaneHelper( localPlane, 1, 0xffff00 );
    helper.size = 2;
    resectionplane.attach( helper );
    helper.visible = false;

    /////////////////////////////////////////////////

    add.addEventListener('click', function() {
        varus.rotateY(Math.PI/num)
        distalmedial.rotateY(Math.PI/num);
        resectionplane.rotateY(Math.PI/num);
        varusNum.textContent = `${ (varus.rotation.y * 180 / Math.PI).toFixed(2)  }`
    })
    minus.addEventListener('click', function() {
        varus.rotateY(-Math.PI/num)
        distalmedial.rotateY(-Math.PI/num);
        resectionplane.rotateY(-Math.PI/num);
        varusNum.textContent = `${ (varus.rotation.y * 180 / Math.PI).toFixed(2)  }`
    })

    fadd.addEventListener('click', function() {
        flexion.rotateX(Math.PI/num);
        distalmedial.rotateX(Math.PI/num);
        resectionplane.rotateX(Math.PI/num);        
        flexionNum.textContent = `${ (flexion.rotation.x * 180 / Math.PI).toFixed(2)  }` 
    })
    fminus.addEventListener('click', function() {
        flexion.rotateX(-Math.PI/num);
        distalmedial.rotateX(-Math.PI/num);
        resectionplane.rotateX(-Math.PI/num);
        flexionNum.textContent = `${ (flexion.rotation.x * 180 / Math.PI).toFixed(2)  }` 
    })

    radd.addEventListener('input', function(e) {
        resectionplane.position.y = resecty + e.target.value/100;     
        model.material.clippingPlanes = [localPlane];
        model.material.clipShadows = true;
        localPlane.constant = - resecty - e.target.value/100;  
    })

    mechanicalAplane.visible = false;
    distalmedial.visible = false;
    resectionplane.visible = false;

    const perpendicular = document.getElementById('perpendicular');
    const varuscheck = document.getElementById('varus');
    const flexioncheck = document.getElementById('flexion');
    const distal = document.getElementById('distal');
    const resection = document.getElementById('resection');

    perpendicular.className = 'item';
    varuscheck.className = 'item';
    flexioncheck.className = 'item';
    distal.className = 'item';
    resection.className = 'item';
    
    document.getElementById('popup1').addEventListener('click', function(){
        if(perpendicular.checked == true){
            mechanicalAplane.visible = true;
        }
        if(perpendicular.checked == false){
            mechanicalAplane.visible = false;
        }
        if(varuscheck.checked == true){
            varus.visible = true;
        }
        if(varuscheck.checked == false){
            varus.visible = false;
        }
        if(flexioncheck.checked == true){
            flexion.visible = true;
        }
        if(flexioncheck.checked == false){
            flexion.visible = false;
        }
        if(distal.checked == true){
            distalmedial.visible = true;
        }
        if(distal.checked == false){
            distalmedial.visible = false;
        }
        if(resection.checked == true){
            resectionplane.visible = true;
        }
        if(resection.checked == false){
            resectionplane.visible = false;
        }
    })

    ////////////////////////////////////////////////

    lineGroup.add(mechanicalAplane, varus, distalmedial, resectionplane);

    scene.add(lineGroup);
}
///////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
const p = document.createElement('p');
p.className = 'tooltip';
const pContainer = document.createElement('div');
pContainer.appendChild(p);
const cPointLabel = new CSS2DObject(pContainer);
cPointLabel.position.x = -1;
cPointLabel.position.y = 7;
scene.add(cPointLabel);

window.addEventListener('mousemove', function(e) {
    if(i!=-1){
        // sphere[i].position.x = axesHelper.position.x;
        // sphere[i].position.y = axesHelper.position.y;
        // sphere[i].position.z = axesHelper.position.z;
    }
    else;
    
    mousePos.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mousePos.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObjects(group.children, true);
    const intersects2 = raycaster.intersectObjects(lineGroup.children, true);
    
    if(intersects.length>0){
        switch (intersects[0].object.name) {
            case 'sphere0':
                p.className = 'toolkit show';
                cPointLabel.position.y = sphere[0].position.y;
                p.textContent = 'Femur Center';                
                break;
            case 'sphere1':
                p.className = 'toolkit show';
                cPointLabel.position.y = sphere[1].position.y;
                p.textContent = 'Hip Center';                
                break;
            case 'sphere2':
                p.className = 'toolkit show';
                cPointLabel.position.y = sphere[2].position.y;
                p.textContent = 'Lateral Epicondyte';                
                break;
            case 'sphere3':
                p.className = 'toolkit show';
                cPointLabel.position.y = sphere[3].position.y;
                p.textContent = 'Medial Epicondyte';                
                break;
            case 'sphere4':
                p.className = 'toolkit show';
                cPointLabel.position.y = sphere[4].position.y;
                p.textContent = 'Posterior Lateral Point';                
                break;
            case 'sphere5':
                p.className = 'toolkit show';
                cPointLabel.position.y = sphere[5].position.y;
                p.textContent = 'Posterior Medial Point';                
                break;
            case 'sphere6':
                p.className = 'toolkit show';
                cPointLabel.position.y = sphere[6].position.y;
                p.textContent = 'Lateral Distal Point';                
                break;
            case 'sphere7':
                p.className = 'toolkit show';
                cPointLabel.position.y = sphere[7].position.y;
                p.textContent = 'Medial Distal Point';                
                break;
        
            default:
                break;
        }
    } else {
        if(intersects2.length>0){
            switch (intersects2[0].object.name) {
                case 'Mechanical Axis':
                    p.className = 'toolkit show';
                    p.textContent = 'Mechanical Axis';                
                    break;
                case 'TEA':
                    p.className = 'toolkit show';
                    p.textContent = 'TEA';                
                    break;
                case 'TEA P':
                    p.className = 'toolkit show';
                    p.textContent = 'Projected TEA';                
                    break;
                case 'PCA':
                    p.className = 'toolkit show';
                    p.textContent = 'PCA';                
                    break;
                case 'Mechanical plane':
                    p.className = 'toolkit show';
                    p.textContent = 'Mechanical plane';                
                    break;
                case 'Varus/Valgus':
                    p.className = 'toolkit show';
                    p.textContent = 'Varus/Valgus';                
                    break;
                case 'Flexion/Extension':
                    p.className = 'toolkit show';
                    p.textContent = 'Flexion/Extension';                
                    break;
                case 'Distal Medial Plane':
                    p.className = 'toolkit show';
                    p.textContent = 'Distal Medial Plane';                
                    break;
                case 'Distal Resection Plane':
                    p.className = 'toolkit show';
                    p.textContent = 'Distal Resection Plane';                
                    break;
                case 'Lateral':
                    p.className = 'toolkit show';
                    p.textContent = 'Lateral Line';                
                    break;
                case 'Anterior':
                    p.className = 'toolkit show';
                    p.textContent = 'Anterior Line';                
                    break;
            
                default:
                    break;
            }
        } else {
            p.className = 'toolkit hide';
        }
    }

});
//////////////////////////////////////////////


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

 //Event
 var initializeDomEvents = require("threex-domevents");
 var THREEs = require("three");
 var THREEx = {};
 initializeDomEvents(THREEs, THREEx);

var domEvents = new THREEx.DomEvents(camera, renderer.domElement);
///////////

const clock = new THREE.Clock()
const tick = () =>
{
    pointLight.position.x = camera.position.x + 1
    pointLight.position.y = camera.position.y + 1
    pointLight.position.z = camera.position.z
    // Update Orbital Controls.
    controls.update()
    
    // Render
    renderer.render(scene, camera);

    labelRenderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


//////////////////////////////////