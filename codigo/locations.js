// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  loadLocationOptions();
  hideErrorAlert();
});

/**
 * Carga las opciones de ubicaciones en el selector
 */
function loadLocationOptions() {
  const locationSelect = document.getElementById("locationSelect");
  
  // Lista de ubicaciones disponibles
  const locationData = [
    { id: "ar.X5900", name: "Villa María" },
    { id: "ar.X5186", name: "Alta Gracia" },
    { id: "ar.X2553", name: "Justiniano Posse" },
    { id: "ar.V9410", name: "Ushuaia" },
    { id: "es.28001", name: "Madrid, España" },
    { id: "-23.49,-46.71", name: "Rio de Janeiro, Brasil" },
    { id: "40.7247, -74.09", name: "Nueva York, Estados Unidos" },
    { id: "48.8566, 2.3522", name: "París, Francia" },
    { id: "35.6762, 139.6503", name: "Tokio, Japón" }
  ];

  // Opción predeterminada
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Selecciona una ubicación";
  defaultOption.selected = true;
  defaultOption.disabled = true;
  locationSelect.appendChild(defaultOption);
  
  // Agregar todas las ubicaciones al selector
  locationData.forEach(location => {
    const option = document.createElement("option");
    option.value = location.id;
    option.textContent = location.name;
    locationSelect.appendChild(option);
  });
}

/**
 * Oculta el mensaje de error
 */
function hideErrorAlert() {
  const errorAlert = document.getElementById("errorAlert");
  errorAlert.style.display = "none";
}

/**
 * Muestra el mensaje de error
 */
function showErrorAlert() {
  const errorAlert = document.getElementById("errorAlert");
  errorAlert.style.display = "block";
}
