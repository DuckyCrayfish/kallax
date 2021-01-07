import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { DEPTH, GAP, BIG_WIDTH, SMALL_WIDTH } from './dimensions';

class ModelViewer {
  constructor(container) {
    this.onResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);
    let screenWidth = container.clientWidth;
    let screenHeight = container.clientHeight;
    window.addEventListener('resize', this.onResize, false);

    // Renderer
    let renderer = this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(screenWidth, screenHeight);
    container.appendChild(renderer.domElement);

    RectAreaLightUniformsLib.init();

    // Scene
    const scene = this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, screenWidth / screenHeight, 1, 3000);
    scene.add(this.camera);

    // Controls
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.maxPolarAngle = Math.PI / 2;

    // Lights
    let ambient = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambient);

    let color = 0xFFFFFF;
    let intensity = .8;
    let width = 1200; //120
    let height = 80; //80
    this.areaLight = new THREE.RectAreaLight(color, intensity, width, height);
    this.areaLight.position.set(0, 100, 0);
    this.areaLight.rotation.x = THREE.MathUtils.degToRad(-90);
    scene.add(this.areaLight);
  }

  start() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }

  drawKallax(options = {}) {
    if (options.columns) {
      this.columns = options.columns;
      this.width = this.columns * GAP + (this.columns - 1) * SMALL_WIDTH + 2 * BIG_WIDTH;
    }
    if (options.rows) {
      this.rows = options.rows;
      this.height = this.rows * GAP + (this.rows - 1) * SMALL_WIDTH + 2 * BIG_WIDTH;
    }

    let group = new THREE.Group();
    let meshMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        opacity: 1
      });

    let mesh;
    let outerHorizontalGeometry = new THREE.BoxBufferGeometry(this.width, BIG_WIDTH, DEPTH);
    let outerVerticalGeometry = new THREE.BoxBufferGeometry(BIG_WIDTH, this.height-(2*BIG_WIDTH), DEPTH);
    let innerHorizontalGeometry = new THREE.BoxBufferGeometry(this.width-(2*BIG_WIDTH), SMALL_WIDTH, DEPTH);
    let innerVerticalGeometry = new THREE.BoxBufferGeometry(SMALL_WIDTH, this.height-(2*BIG_WIDTH), DEPTH);

    // Outer horizontal
    mesh = new THREE.Mesh(outerHorizontalGeometry, meshMaterial);
    mesh.position.set(0, BIG_WIDTH/2, 0);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    group.add(mesh);

    mesh = new THREE.Mesh(outerHorizontalGeometry, meshMaterial);
    mesh.position.set(0, this.height-BIG_WIDTH/2, 0);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    group.add(mesh);

    // Outer vertical
    mesh = new THREE.Mesh(outerVerticalGeometry, meshMaterial);
    mesh.position.set(-this.width/2+BIG_WIDTH/2, this.height/2, 0);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    group.add(mesh);

    mesh = new THREE.Mesh(outerVerticalGeometry, meshMaterial);
    mesh.position.set(this.width/2-BIG_WIDTH/2, this.height/2, 0);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    group.add(mesh);

    // Inner horizontal
    let spacing = GAP + SMALL_WIDTH;
    let startingPoint = BIG_WIDTH - SMALL_WIDTH/2;
    for(let i = 1; i < this.rows; i++) {
      mesh = new THREE.Mesh(innerHorizontalGeometry, meshMaterial);
      mesh.position.set(0, startingPoint + i*spacing, 0);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      group.add(mesh);
    }

    // Inner vertical
    startingPoint = -this.width/2 + BIG_WIDTH - SMALL_WIDTH/2;
    for(let i = 1; i < this.columns; i++) {
      mesh = new THREE.Mesh(innerVerticalGeometry, meshMaterial);
      mesh.position.set(startingPoint + i*spacing, this.height/2, 0);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      group.add(mesh);
    }

    if(typeof this.kallax !== 'undefined') {
      this.scene.remove(this.kallax);
    }
    this.kallax = group;
    this.scene.add(group);

    this.updateAreaLight();
    this.updateCamera();
    this.updateControls();
  }

  updateAreaLight() {
    this.areaLight.position.setY(this.height * 1.5);
    this.areaLight.width = 80 * (this.columns) + 10 * this.rows;
    this.areaLight.height = 60 + (8 * this.rows);
    this.areaLight.intensity = 1 + (.2 * this.rows);
  }

  updateControls() {
    this.controls.target.set(0, this.height / 2, 0);
    this.controls.update();
  }

  updateCamera() {
    this.camera.position.set(0, this.height - 10, 200);
  }

  onResize() {
    let screenWidth = this.renderer.domElement.parentElement.clientWidth;
    let screenHeight = this.renderer.domElement.parentElement.clientHeight;
    this.camera.aspect = screenWidth / screenHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(screenWidth, screenHeight);
  }
}

export { ModelViewer };
