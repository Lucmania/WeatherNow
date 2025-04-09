// Referencias a elementos del DOM
const temperatureDisplay = document.getElementById("temperatureDisplay");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const loadingSpinner = document.getElementById("loadingSpinner");
const weatherLocation = document.getElementById("weatherLocation");
const weatherSummary = document.getElementById("weatherSummary");

// Ocultar elementos inicialmente
temperatureDisplay.style.display = "none";
loadingSpinner.style.display = "none";

/**
 * Obtiene los datos meteorológicos de la API
 */
async function getWeatherData() {
  // Obtener el código de ubicación seleccionado
  const locationSelect = document.getElementById("locationSelect");
  const locationCode = locationSelect.value;
  const selectedLocationText = locationSelect.options[locationSelect.selectedIndex].text;
  
  // Validar que se haya seleccionado una ubicación
  if (!locationCode) {
    showErrorAlert();
    return;
  } else {
    hideErrorAlert();
  }

  // Preparar la UI para cargar datos
  weatherDescription.innerText = "Obteniendo datos...";
  temperatureDisplay.style.display = "none";
  loadingSpinner.style.display = "block";

  try {
    // Extraer el nombre de la ciudad del texto seleccionado
    const cityName = selectedLocationText.split(",")[0]; // Tomar solo el nombre de la ciudad
    
    // API key de OpenWeatherMap
    const apiKey = "a811585a3123e5fc61a9814dfc6eee06";
    
    // Llamada a la API de OpenWeatherMap
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&lang=es&appid=${apiKey}`
    );
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    // Procesar la respuesta
    const data = await response.json();
    console.log("Datos del clima:", data);
    
    // Convertir los datos de OpenWeatherMap al formato que espera tu UI
    const formattedData = {
      temp_c: data.main.temp,
      wx_desc: data.weather[0].description,
      wx_icon: data.weather[0].icon,
      lon: data.coord.lon,
      lat: data.coord.lat,
      windspd_kmh: (data.wind.speed * 3.6).toFixed(1),
      winddir_compass: getWindDirection(data.wind.deg),
      humid_pct: data.main.humidity,
      feelslike_c: data.main.feels_like
    };
    
    // Actualizar la interfaz con los datos convertidos
    updateWeatherUI(formattedData);
    
  } catch (error) {
    console.error("Error obteniendo datos del clima:", error);
    weatherDescription.innerText = "Error al obtener los datos. Intenta nuevamente.";
    loadingSpinner.style.display = "none";
    temperatureDisplay.style.display = "block";
    temperatureDisplay.textContent = "Error";
  }
}

/**
 * Actualiza la interfaz con los datos meteorológicos recibidos
 * @param {Object} data - Datos meteorológicos de la API
 */
function updateWeatherUI(data) {
  // Mostrar la temperatura y ocultar spinner
  temperatureDisplay.style.display = "block";
  loadingSpinner.style.display = "none";

  // Actualizar título con la ubicación
  const locationSelect = document.getElementById("locationSelect");
  const selectedLocation = locationSelect.options[locationSelect.selectedIndex].text;
  weatherLocation.textContent = `Pronóstico para ${selectedLocation}`;

  // Actualizar temperatura
  temperatureDisplay.textContent = `${data.temp_c}°`;

  // Actualizar descripción del clima
  let description = data.wx_desc;
  description = description.charAt(0).toUpperCase() + description.slice(1);
  description = description.replace("nuboso", "Nublado");
  weatherDescription.textContent = description;

  // Actualizar icono del clima usando la función de mapeo
  const mappedIconCode = mapIconCode(data.wx_icon);
  weatherIcon.src = `../img_apiclima/${mappedIconCode}.png`;
  weatherIcon.alt = description;

  // Actualizar detalles adicionales
  document.getElementById("longitude").value = `${data.lon}°`;
  document.getElementById("latitude").value = `${data.lat}°`;
  document.getElementById("windSpeed").value = `${data.windspd_kmh} km/h`;
  document.getElementById("windDirection").value = data.winddir_compass;
  document.getElementById("humidity").value = `${data.humid_pct}%`;
  document.getElementById("feelsLike").value = `${data.feelslike_c}°`;

  // Actualizar descripción del viento
  const windDirection = data.winddir_compass;
  let windDescription = "";
  
  if (windDirection.length === 3) {
    const ordinal = windDirection.substring(0, 1);
    const cardinal = windDirection.substring(1, 3);
    windDescription = `${getCardinalPointName(ordinal)} - ${getCardinalPointName(cardinal)}`;
  } else {
    windDescription = getCardinalPointName(windDirection);
  }
  
  document.getElementById("windDesc").value = windDescription;

  // Crear resumen del clima
  createWeatherSummary(data.temp_c, data.wx_icon, description);
}

/**
 * Crea un resumen del clima para mostrar en la sección lateral
 * @param {number} temp - Temperatura en grados celsius
 * @param {string} openWeatherIcon - Código de icono de OpenWeatherMap
 * @param {string} description - Descripción del clima
 */
function createWeatherSummary(temp, openWeatherIcon, description) {
  const mappedIconCode = mapIconCode(openWeatherIcon);
  
  weatherSummary.innerHTML = `
    <div class="weather-summary-card">
      <div class="summary-temp">${temp}°</div>
      <img class="summary-icon" src="../img_apiclima/${mappedIconCode}.png" alt="${description}" />
    </div>
  `;
}

/**
 * Mapea los códigos de iconos de OpenWeatherMap a tus archivos de imagen locales
 * @param {string} openWeatherIcon - Código de icono de OpenWeatherMap (ej: "01d")
 * @returns {string} - Nombre del archivo local sin extensión
 */
function mapIconCode(openWeatherIcon) {
  const iconMap = {
    // Día claro / soleado
    '01d': 'Sunny',
    // Noche clara
    '01n': 'PartlyCloudyNight',
    // Parcialmente nublado día
    '02d': 'PartlyCloudyDay',
    // Parcialmente nublado noche
    '02n': 'PartlyCloudyNight',
    // Nublado
    '03d': 'Cloudy',
    '03n': 'Cloudy',
    // Muy nublado
    '04d': 'Overcast',
    '04n': 'Overcast',
    // Lluvia ligera
    '09d': 'ModRainSwrsDay',
    '09n': 'ModRainSwrsNight',
    // Lluvia
    '10d': 'ModRain',
    '10n': 'ModRain',
    // Tormenta
    '11d': 'CloudRainThunder',
    '11n': 'CloudRainThunder',
    // Nieve
    '13d': 'ModSnow',
    '13n': 'ModSnow',
    // Niebla
    '50d': 'Mist',
    '50n': 'Mist'
  };
  
  // Retorna el icono mapeado o una imagen por defecto
  return iconMap[openWeatherIcon] || 'imagenpordefecto';
}

/**
 * Convierte grados a dirección del viento en formato de puntos cardinales
 * @param {number} degrees - Dirección del viento en grados
 * @returns {string} Dirección del viento en formato de puntos cardinales
 */
function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Obtiene el nombre completo del punto cardinal a partir de su abreviatura
 * @param {string} code - Código del punto cardinal
 * @returns {string} Nombre completo del punto cardinal
 */
function getCardinalPointName(code) {
  const cardinalPoints = {
    "N": "Norte",
    "S": "Sur",
    "E": "Este",
    "W": "Oeste",
    "NE": "Noreste",
    "SE": "Sureste",
    "SW": "Suroeste",
    "NW": "Noroeste"
  };
  
  return cardinalPoints[code] || "Desconocido";
}

/**
 * Muestra un mensaje de error cuando no se selecciona una ubicación
 */
function showErrorAlert() {
  const errorAlert = document.getElementById("errorAlert");
  if (errorAlert) {
    errorAlert.style.display = "block";
  }
}

/**
 * Oculta el mensaje de error
 */
function hideErrorAlert() {
  const errorAlert = document.getElementById("errorAlert");
  if (errorAlert) {
    errorAlert.style.display = "none";
  }
}
