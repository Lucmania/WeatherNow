// Referencias a elementos del DOM
const weatherMap = document.getElementById("weatherMap");
const mapTypeSelector = document.getElementById("mapType");
const zoomLevelControl = document.getElementById("zoomLevel");
const regionSelector = document.getElementById("regionSelect");

// Variables de estado del mapa
let currentMapType = "temperature";
let currentZoom = 5;
let currentRegion = "ar";
let map = null;
let currentWeatherLayer = null;

// API Key para OpenWeatherMap - Reemplaza con tu propia clave
const OWM_API_KEY = "a811585a3123e5fc61a9814dfc6eee06";

// Coordenadas centrales para las diferentes regiones
const regionCoordinates = {
  ar: { lat: -34.6037, lng: -58.3816, zoom: 5 }, // Argentina (Buenos Aires)
  sa: { lat: -15.7801, lng: -56.0513, zoom: 4 }, // Sudamérica (centro aproximado)
  na: { lat: 37.0902, lng: -95.7129, zoom: 4 }, // Norteamérica (centro de EE.UU.)
  eu: { lat: 48.8566, lng: 2.3522, zoom: 4 }, // Europa (París como referencia)
  as: { lat: 34.0479, lng: 100.6197, zoom: 3 }, // Asia (centro aproximado)
  global: { lat: 0, lng: 0, zoom: 2 } // Global (ecuador)
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  // Añadir el CSS de Leaflet a la página
  addLeafletCSS();
  
  // Inicializar el mapa
  initWeatherMap();
  
  // Actualizar la leyenda para el tipo de mapa inicial
  updateLegend(currentMapType);
});

/**
 * Añade el CSS de Leaflet al documento
 */
function addLeafletCSS() {
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
  linkElement.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
  linkElement.crossOrigin = '';
  document.head.appendChild(linkElement);

  const scriptElement = document.createElement('script');
  scriptElement.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
  scriptElement.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
  scriptElement.crossOrigin = '';
  document.head.appendChild(scriptElement);
}

/**
 * Inicializa el mapa meteorológico
 */
function initWeatherMap() {
  // Esperar a que Leaflet se cargue
  const checkLeaflet = setInterval(() => {
    if (window.L) {
      clearInterval(checkLeaflet);
      createMap();
    }
  }, 100);

  // Si después de 5 segundos Leaflet no se ha cargado, mostrar mapa estático
  setTimeout(() => {
    if (!window.L) {
      clearInterval(checkLeaflet);
      createStaticMap();
    }
  }, 5000);
}

/**
 * Crea el mapa utilizando Leaflet
 */
function createMap() {
  // Establecer la altura del contenedor del mapa
  weatherMap.style.height = '500px';
  
  // Crear el mapa centrado en la región actual
  map = L.map('weatherMap').setView(
    [regionCoordinates[currentRegion].lat, regionCoordinates[currentRegion].lng],
    regionCoordinates[currentRegion].zoom
  );
  
  // Añadir capa de mosaicos base
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Cargar la capa meteorológica inicial
  loadWeatherLayer(currentMapType);
  
  // Ajustar el nivel de zoom con el valor actual
  map.setZoom(currentZoom);
  
  console.log('Mapa inicializado correctamente.');
}

/**
 * Carga la capa de datos meteorológicos correspondiente
 * @param {string} mapType - El tipo de mapa meteorológico (temperatura, precipitaciones, etc.)
 */
function loadWeatherLayer(mapType) {
  // Si ya hay una capa meteorológica, eliminarla
  if (currentWeatherLayer) {
    map.removeLayer(currentWeatherLayer);
  }
  
  // URL base para las capas de OpenWeatherMap
  const owmUrl = 'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={apiKey}';
  
  // Determinar qué capa cargar según el tipo de mapa
  let layerName = '';
  switch (mapType) {
    case 'temperature':
      layerName = 'temp_new';
      break;
    case 'precipitation':
      layerName = 'precipitation_new';
      break;
    case 'wind':
      layerName = 'wind_new';
      break;
    case 'clouds':
      layerName = 'clouds_new';
      break;
    default:
      layerName = 'temp_new';
  }
  
  // Crear y añadir la nueva capa
  currentWeatherLayer = L.tileLayer(owmUrl, {
    layer: layerName,
    apiKey: OWM_API_KEY,
    opacity: 0.8
  }).addTo(map);
  
  console.log(`Capa meteorológica cargada: ${getMapTypeName(mapType)}`);
}

/**
 * Crea un mapa estático (alternativa si Leaflet no se carga)
 */
function createStaticMap() {
  weatherMap.innerHTML = `
    <div style="position: relative; width: 100%; height: 500px; background-color: #E8F0F8; overflow: hidden;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
        <h3>Visualización del mapa meteorológico</h3>
        <p>No se pudo cargar el mapa dinámico. Mostrando visualización estática de ${getMapTypeName(currentMapType)} para ${getRegionName(currentRegion)}.</p>
      </div>
      ${createStaticMapOverlay(currentMapType)}
    </div>
  `;
}

/**
 * Crea una superposición estática para el mapa
 * @param {string} mapType - El tipo de mapa meteorológico
 * @returns {string} HTML para la superposición
 */
function createStaticMapOverlay(mapType) {
  // Crear una representación visual simplificada basada en el tipo de mapa
  let overlayHTML = '';
  
  if (mapType === 'temperature') {
    overlayHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.5; background: linear-gradient(135deg, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF0000);"></div>
    `;
  } else if (mapType === 'precipitation') {
    overlayHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.5; background: linear-gradient(135deg, #FFFFFF, #C0E8FF, #307EFF, #0033FF, #9900FF);"></div>
    `;
  } else if (mapType === 'wind') {
    overlayHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.5; background: linear-gradient(135deg, #EEEEFF, #99CCFF, #66AAFF, #3377FF, #0033CC);"></div>
    `;
  } else if (mapType === 'clouds') {
    overlayHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.5; background: linear-gradient(135deg, #FFFFFF, #DDDDDD, #BBBBBB, #888888, #444444);"></div>
    `;
  }
  
  return overlayHTML;
}

/**
 * Cambia el tipo de mapa (temperatura, precipitaciones, etc.)
 */
function changeMapType() {
  // Obtener el nuevo tipo de mapa seleccionado
  currentMapType = mapTypeSelector.value;
  
  // Si tenemos un mapa Leaflet, actualizar la capa
  if (map) {
    loadWeatherLayer(currentMapType);
  } else {
    // Si estamos en modo de mapa estático, recrear el mapa
    createStaticMap();
  }
  
  // Actualizar la leyenda
  updateLegend(currentMapType);
  
  console.log(`Tipo de mapa cambiado a: ${getMapTypeName(currentMapType)}`);
}

/**
 * Cambia el nivel de zoom del mapa
 */
function changeZoom() {
  // Obtener el nuevo nivel de zoom
  currentZoom = parseInt(zoomLevelControl.value);
  
  // Si tenemos un mapa Leaflet, actualizar el zoom
  if (map) {
    map.setZoom(currentZoom);
  } else {
    // Si estamos en modo de mapa estático, recrear el mapa
    createStaticMap();
  }
  
  console.log(`Nivel de zoom cambiado a: ${currentZoom}`);
}

/**
 * Cambia la región mostrada en el mapa
 */
function changeRegion() {
  // Obtener la nueva región seleccionada
  currentRegion = regionSelector.value;
  
  // Si tenemos un mapa Leaflet, actualizar la vista
  if (map) {
    map.setView(
      [regionCoordinates[currentRegion].lat, regionCoordinates[currentRegion].lng],
      regionCoordinates[currentRegion].zoom
    );
  } else {
    // Si estamos en modo de mapa estático, recrear el mapa
    createStaticMap();
  }
  
  console.log(`Región cambiada a: ${getRegionName(currentRegion)}`);
}

/**
 * Actualiza la leyenda del mapa según el tipo seleccionado
 * @param {string} mapType - El tipo de mapa meteorológico
 */
function updateLegend(mapType) {
  // Obtener el contenedor de la leyenda
  const legendItems = document.querySelector('.legend-items');
  
  // Limpiar el contenedor
  legendItems.innerHTML = '';
  
  // Definir los rangos y colores para cada tipo de mapa
  let legendData = [];
  
  if (mapType === 'temperature') {
    legendData = [
      { min: -10, max: 0, color: "#0000FF" },
      { min: 0, max: 10, color: "#00FFFF" },
      { min: 10, max: 20, color: "#00FF00" },
      { min: 20, max: 30, color: "#FFFF00" },
      { min: 30, max: 40, color: "#FF0000" }
    ];
  } else if (mapType === 'precipitation') {
    legendData = [
      { min: 0, max: 1, color: "#FFFFFF" },
      { min: 1, max: 5, color: "#C0E8FF" },
      { min: 5, max: 10, color: "#307EFF" },
      { min: 10, max: 20, color: "#0033FF" },
      { min: 20, max: 50, color: "#9900FF" }
    ];
  } else if (mapType === 'wind') {
    legendData = [
      { min: 0, max: 10, color: "#EEEEFF" },
      { min: 10, max: 20, color: "#99CCFF" },
      { min: 20, max: 30, color: "#66AAFF" },
      { min: 30, max: 50, color: "#3377FF" },
      { min: 50, max: 100, color: "#0033CC" }
    ];
  } else if (mapType === 'clouds') {
    legendData = [
      { min: 0, max: 20, color: "#FFFFFF" },
      { min: 20, max: 40, color: "#DDDDDD" },
      { min: 40, max: 60, color: "#BBBBBB" },
      { min: 60, max: 80, color: "#888888" },
      { min: 80, max: 100, color: "#444444" }
    ];
  }
  
  // Crear los elementos de la leyenda
  legendData.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    
    const legendColor = document.createElement('div');
    legendColor.className = 'legend-color';
    legendColor.style.backgroundColor = item.color;
    
    const legendText = document.createElement('span');
    
    // Personalizar el texto según el tipo de mapa
    if (mapType === 'temperature') {
      legendText.textContent = `${item.min}°C a ${item.max}°C`;
    } else if (mapType === 'precipitation') {
      legendText.textContent = `${item.min} a ${item.max} mm`;
    } else if (mapType === 'wind') {
      legendText.textContent = `${item.min} a ${item.max} km/h`;
    } else if (mapType === 'clouds') {
      legendText.textContent = `${item.min}% a ${item.max}%`;
    }
    
    legendItem.appendChild(legendColor);
    legendItem.appendChild(legendText);
    legendItems.appendChild(legendItem);
  });
  
  // Actualizar el título de la leyenda
  const legendTitle = document.querySelector('.map-legend h4');
  legendTitle.textContent = `Leyenda: ${getMapTypeName(mapType)}`;
}

/**
 * Obtiene el nombre legible del tipo de mapa
 * @param {string} mapType - El código del tipo de mapa
 * @returns {string} Nombre legible del tipo de mapa
 */
function getMapTypeName(mapType) {
  const mapTypes = {
    "temperature": "Temperatura",
    "precipitation": "Precipitaciones",
    "wind": "Viento",
    "clouds": "Nubosidad"
  };
  
  return mapTypes[mapType] || "Desconocido";
}

/**
 * Obtiene el nombre legible de la región
 * @param {string} regionCode - El código de la región
 * @returns {string} Nombre legible de la región
 */
function getRegionName(regionCode) {
  const regions = {
    "ar": "Argentina",
    "sa": "Sudamérica",
    "na": "Norteamérica",
    "eu": "Europa",
    "as": "Asia",
    "global": "Global"
  };
  
  return regions[regionCode] || "Desconocida";
}
