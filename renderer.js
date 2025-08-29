import contentManagementRoute from "./src/routes/contentmanagement/index.js";

const routes = {
    home: {
        path: "./src/routes/home/index.html",
        templateId: "#home-template"
    },
    management: {
        path: "./src/routes/contentmanagement/index.html",
        templateId: "#content-management-template",
        setup: contentManagementRoute.setup
    },
    rooms: {
        path: "./src/routes/contentmanagement/rooms/index.html",
        templateId: "#rooms-template"
    },
    settings: {
        path: "./src/routes/settings/index.html",
        templateId: "#settings-template"
    }
};

// Botones de navegacion principal
const navButtons = document.querySelectorAll('.mainNavButton');
navButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const pageName = event.currentTarget.dataset.pageName;
        navigate("mainContent", pageName);
    });
});

async function navigate(contentId, page) {
    const layout = document.getElementById(contentId);
    const route = routes[page];

    if (!route) return;

    const contentPath = route.path;
    const templateId = route.templateId;

    try {
        const response = await fetch(contentPath);
        const htmlText = await response.text();

        const container = document.createElement('div');
        container.innerHTML = htmlText;
        const template = container.querySelector(templateId);

        if (template) {
            // Verificar si el Shadow DOM ya existe
            let shadowRoot = layout.shadowRoot;
            if (!shadowRoot) {
                // Si no existe, lo crea solo una vez
                shadowRoot = layout.attachShadow({ mode: 'open' });
            } else {
                // Si ya existe, vacia su contenido antes de agregar el nuevo
                shadowRoot.innerHTML = '';
            }

            // Clona el contenido del template y lo adjunta al Shadow DOM
            shadowRoot.appendChild(template.content.cloneNode(true));

            // Llama a la función de configuración
            if (route.setup) {
                route.setup();
            }
        } else {
            // Manejar si el template no es encontrado
            layout.innerHTML = 'Error: Template not found.';
            if (layout.shadowRoot) layout.shadowRoot.innerHTML = ''; // Limpia el Shadow DOM
        }
    } catch (error) {
        console.error('Error loading content:', error);
        layout.innerHTML = '<p>Error loading content.</p>';
        if (layout.shadowRoot) layout.shadowRoot.innerHTML = ''; // Limpia el Shadow DOM
    }
}

// Llamada inicial para cargar la página de inicio
navigate("mainContent", "home");