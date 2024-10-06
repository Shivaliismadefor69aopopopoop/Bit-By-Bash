import * as THREE from 'three';

let scene, camera, renderer, celestialBodies = [];


const NASA_API_KEY = 'XeIagWFvdCgXaCzxf5A6vMGcJ6Y8aVyEVJWoBwpn'; 


async function fetchNEOData() {
    const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${NASA_API_KEY}`);
    const data = await response.json();
    return data.near_earth_objects; 
}


async function fetchExoplanetData() {
    const response = await fetch("https://api.exoplanets.org/endpoint?api_key=YOUR_EXOPLANET_API_KEY"); // Replace with actual API key
    const data = await response.json();
    return data.exoplanets; 
}


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    document.getElementById('orrery-container').appendChild(renderer.domElement);
    camera.position.z = 5;

    updateData(); 
}


async function updateData() {
    try {
        const [neoData, exoplanetData] = await Promise.all([fetchNEOData(), fetchExoplanetData()]);
        updateCelestialBodies(neoData, exoplanetData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


function updateCelestialBodies(neoData, exoplanetData) {
    
    celestialBodies.forEach(body => {
        scene.remove(body);
    });
    celestialBodies = []; 

   
    neoData.forEach(item => {
        const size = item.estimated_diameter.meters.estimated_diameter_max / 10000; 
        const color = 0xff0000; 
        createCelestialBody(size, item.orbit_data.periapsis_distance / 10000000, color); 
    });

    // Visualizing Exoplanets
    exoplanetData.forEach(item => {
        const exoSize = item.radius; 
        const exoColor = 0x0000ff; 
        createCelestialBody(exoSize, item.distance_from_sun, exoColor); 
    });
}

// Generic function to create a celestial body
function createCelestialBody(size, distance, color) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color });
    const body = new THREE.Mesh(geometry, material);
    body.position.x = distance; // Example for positioning
    celestialBodies.push(body);
    scene.add(body);
}

function animate() {
    requestAnimationFrame(animate);
    celestialBodies.forEach((body, index) => {
        body.rotation.y += 0.01; // Rotate
        // Optional: Update position based on some logic
    });
    renderer.render(scene, camera);
}

window.onload = init;
