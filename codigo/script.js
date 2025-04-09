// Referencias a elementos del DOM
const temperatureDisplay = document.getElementById("temperatureDisplay");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const loadingSpinner = document.getElementById("loadingSpinner");
const weatherLocation = document.getElementById("weatherLocation");
const weatherSummary = document.getElementById("weatherSummary");

// URL base del repositorio en GitHub Pages
const repoBaseUrl = "https://lucmania.github.io/WeatherNow";

// Ocultar elementos inicialmente
temperatureDisplay.style.display = "none";
loadingSpinner.style.display = "none";

/**
 * Obtiene los datos meteorológicos de la API
 */
async function getWeatherData() {
  const locationSelect = document.getElementById("locationSelect");
  const locationCode = locationSelect.value;
  const selectedLocationText = locationSelect.options[locationSelect.selectedIndex].text;

  if (!locationCode) {
    showErrorAlert();
    return;
  } else {
    hideErrorAlert();
  }

  weatherDescription.innerText = "Obteniendo datos...";
  temperatureDisplay.style.display = "none";
  loadingSpinner.style.display = "block";

  try {
    const cityName = selectedLocationText.split(",")[0];
    const apiKey = "a811585a3123e5fc61a9814dfc6eee06";

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&lang=es&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Datos del clima:", data);

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

    updateWeatherUI(formattedData);
  } catch (error) {
    console.error("Error obteniendo datos del clima:", error);
    weatherDescription.innerText = "Error al obtener los datos. Intenta nuevamente.";
    loadingSpinner.style.display = "none";
    temperatureDisplay.style.display = "block";
    temperatureDisplay.textContent = "Error";
  }
}

function updateWeatherUI(data) {
  temperatureDisplay.style.display = "block";
  loadingSpinner.style.display = "none";

  const locationSelect = document.getElementById("locationSelect");
  const selectedLocation = locationSelect.options[locationSelect.selectedIndex].text;
  weatherLocation.textContent = `Pronóstico para ${selectedLocation}`;

  temperatureDisplay.textContent = `${data.temp_c}°`;

  let description = data.wx_desc.charAt(0).toUpperCase() + data.wx_desc.slice(1).replace("nuboso", "Nublado");
  weatherDescription.textContent = description;

  const mappedIconCode = mapIconCode(data.wx_icon);
  weatherIcon.src = `${repoBaseUrl}/img_apiclima/${mappedIconCode}.png`;
  weatherIcon.alt = description;

  document.getElementById("longitude").value = `${data.lon}°`;
  document.getElementById("latitude").value = `${data.lat}°`;
  document.getElementById("windSpeed").value = `${data.windspd_kmh} km/h`;
  document.getElementById("windDirection").value = data.winddir_compass;
  document.getElementById("humidity").value = `${data.humid_pct}%`;
  document.getElementById("feelsLike").value = `${data.feelslike_c}°`;

  createWeatherSummary(data.temp_c, data.wx_icon, description);
}

function createWeatherSummary(temp, openWeatherIcon, description) {
  const mappedIconCode = mapIconCode(openWeatherIcon);
  weatherSummary.innerHTML = `
    <div class="weather-summary-card">
      <div class="summary-temp">${temp}°</div>
      <img class="summary-icon" src="${repoBaseUrl}/img_apiclima/${mappedIconCode}.png" alt="${description}" />
    </div>
  `;
}

function mapIconCode(openWeatherIcon) {
  const iconMap = {
    "01d": "Sunny",
    "01n": "PartlyCloudyNight",
    "02d": "PartlyCloudyDay",
    "02n": "PartlyCloudyNight",
    "03d": "Cloudy",
    "03n": "Cloudy",
    "04d": "Overcast",
    "04n": "Overcast",
    "09d": "ModRainSwrsDay",
    "09n": "ModRainSwrsNight",
    "10d": "ModRain",
    "10n": "ModRain",
    "11d": "CloudRainThunder",
    "11n": "CloudRainThunder",
    "13d": "ModSnow",
    "13n": "ModSnow",
    "50d": "Mist",
    "50n": "Mist"
  };

  return iconMap[openWeatherIcon] || "imagenpordefecto";
}

function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

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

function showErrorAlert() {
  const errorAlert = document.getElementById("errorAlert");
  if (errorAlert) errorAlert.style.display = "block";
}

function hideErrorAlert() {
  const errorAlert = document.getElementById("errorAlert");
  if (errorAlert) errorAlert.style.display = "none";
}
