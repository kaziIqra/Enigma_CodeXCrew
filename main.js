"use strict";

var camera, scene, renderer;
var element = document.getElementById('demo');
var fov = 70, isUserInteracting = false, lon = 0, lat = 0, phi = 0, theta = 0;
var width = 1440, height = 650, ratio = width / height;

// pointer state (DECLARED)
var onPointerDownPointerX = 0,
    onPointerDownPointerY = 0,
    onPointerDownLon = 0,
    onPointerDownLat = 0;

// utility: get ?img=... from URL
function getImageParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('img'); // e.g. "https://next.localhost:3000/my.jpg"
}

function initWithTexture(texture) {
  camera = new THREE.PerspectiveCamera(fov, ratio, 1, 1000);
  scene = new THREE.Scene();

  var mesh = new THREE.Mesh(
    new THREE.SphereGeometry(500, 60, 40),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  mesh.scale.x = -1;
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);

  if (!element) {
    console.error("DOM element #demo not found. Make sure the script runs after the element exists.");
    // fallback: append to body
    document.body.appendChild(renderer.domElement);
  } else {
    element.appendChild(renderer.domElement);
    // attach event listeners to the container element (if you want full window, attach to window)
    element.addEventListener('mousedown', onDocumentMouseDown, false);
    element.addEventListener('wheel', onDocumentMouseWheel, false); // modern wheel event
  }

  window.addEventListener('resize', onWindowResized, false);
  onWindowResized(null);
  animate();
}

function init() {
  var imgUrl = getImageParam() || 'img/spherical_texture.jpg'; // fallback local
  var loader = new THREE.TextureLoader();

  // prefer setting crossOrigin property; server must allow CORS for remote images
  loader.crossOrigin = 'anonymous';

  loader.load(
    imgUrl,
    function (texture) {
      initWithTexture(texture);
    },
    undefined,
    function (err) {
      console.error('Texture load error:', err);
      // fallback
      new THREE.TextureLoader().load('img/sspherical_texture.jpg', function(t){
        initWithTexture(t);
      });
    }
  );
}

function onWindowResized(event) {
  if (!renderer || !camera) return;
  renderer.setSize(width, height);
  camera.aspect = ratio;
  camera.updateProjectionMatrix(); // modern way
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon;
  onPointerDownLat = lat;
  isUserInteracting = true;

  // attach move/up to window so user can drag outside element
  window.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseMove(event) {
  lon = (event.clientX - onPointerDownPointerX) * -0.175 + onPointerDownLon;
  lat = (event.clientY - onPointerDownPointerY) * -0.175 + onPointerDownLat;
}

function onDocumentMouseUp(event) {
  isUserInteracting = false;
  window.removeEventListener('mousemove', onDocumentMouseMove, false);
  window.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseWheel(event) {
  // modern deltaY: positive means scroll down (zoom out)
  var delta = event.deltaY;
  if (typeof delta === 'number') {
    fov += delta * 0.05; // adjust sign / sensitivity if you like
  } else if (event.wheelDeltaY) {
    fov -= event.wheelDeltaY * 0.05;
  } else if (event.wheelDelta) {
    fov -= event.wheelDelta * 0.05;
  } else if (event.detail) {
    fov += event.detail * 1.0;
  }

  if (fov < 45) fov = 45;
  if (fov > 90) fov = 90;

  if (camera) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  if (!camera || !scene || !renderer) return;

  if (!isUserInteracting) {
    lon += 0.05;
  }
  lat = Math.max(-85, Math.min(85, lat));
  phi = THREE.Math.degToRad(90 - lat);
  theta = THREE.Math.degToRad(lon);

  camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
  camera.position.y = 100 * Math.cos(phi);
  camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);

  var log = "x: " + camera.position.x +
            "<br/>y: " + camera.position.y +
            "<br/>z: " + camera.position.z +
            "<br/>fov: " + fov;
  var logEl = document.getElementById('log');
  if (logEl) logEl.innerHTML = log;

  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

// CALL init so the loader starts
init();
