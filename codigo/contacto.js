// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencia al formulario y al mensaje de éxito
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    // Agregar evento de envío al formulario
    contactForm.addEventListener('submit', handleFormSubmit);

    // Inicializar los componentes de acordeón
    initAccordion();
});

/**
 * Maneja el envío del formulario de contacto
 * @param {Event} event - El evento de envío del formulario
 */
function handleFormSubmit(event) {
    // Prevenir el comportamiento predeterminado del formulario
    event.preventDefault();

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const asunto = document.getElementById('asunto').value;
    const mensaje = document.getElementById('mensaje').value;
    const suscribirse = document.getElementById('suscribirse').checked;

    // Aquí normalmente enviarías los datos a un servidor
    console.log('Formulario enviado:', {
        nombre,
        email,
        asunto,
        mensaje,
        suscribirse
    });

    // Mostrar mensaje de éxito
    successMessage.style.display = 'block';

    // Limpiar el formulario
    contactForm.reset();

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

/**
 * Inicializa la funcionalidad de acordeón para las preguntas frecuentes
 */
function initAccordion() {
    // Obtener todos los botones de acordeón
    const accordionButtons = document.querySelectorAll('.accordion-button');

    // Agregar evento click a cada botón
    accordionButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Obtener el ID del contenido del acordeón
            const targetId = this.getAttribute('data-bs-target').substring(1);
            const targetContent = document.getElementById(targetId);

            // Alternar la clase 'show' para mostrar/ocultar el contenido
            if (targetContent) {
                targetContent.classList.toggle('show');

                // Cambiar el estado expandido del botón
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);

                // Alternar la clase para el estilo del botón
                this.classList.toggle('collapsed');
            }
        });
    });
}
