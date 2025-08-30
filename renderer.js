// Routes
import contentManagementRoute from "./src/routes/contentmanagement/index.js";
import clientsRoute from "./src/routes/contentmanagement/clients/index.js";

const routes = {
  home: {
    path: "./src/routes/home/index.html",
    templateId: "#home-template",
  },
  management: {
    path: "./src/routes/contentmanagement/index.html",
    templateId: "#content-management-template",
    setup: contentManagementRoute.setup,
  },
  rooms: {
    path: "./src/routes/contentmanagement/rooms/index.html",
    templateId: "#rooms-template",
  },
  clients: {
    path: "./src/routes/contentmanagement/clients/index.html",
    templateId: "#clients-template",
    setup: clientsRoute.setup,
  },
  booking: {
    path: "./src/routes/contentmanagement/booking/index.html",
    templateId: "#booking-template",
  },
  settings: {
    path: "./src/routes/settings/index.html",
    templateId: "#settings-template",
  },
};

// Botones de navegacion principal
const navButtons = document.querySelectorAll(".mainNavButton");
navButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const pageName = event.currentTarget.dataset.pageName;
    navigate(document, "mainContent", pageName);
  });
});

function findInPage() {
  const searchBar = document.getElementById('search-bar');
  searchBar.style.display = 'flex'; // Usar flex para alinear los elementos
  const searchInput = document.getElementById('search-input');
  searchInput.focus();
}

async function navigate(root, contentId, page) {
  const layout = root?.getElementById(contentId);

  if (!layout) return;

  const route = routes[page];

  if (!route) return;

  const contentPath = route.path;
  const templateId = route.templateId;

  try {
    const response = await fetch(contentPath);
    const htmlText = await response.text();

    const container = document.createElement("div");
    container.innerHTML = htmlText;
    const template = container.querySelector(templateId);

    if (template) {
      // Verificar si el Shadow DOM ya existe
      let shadowRoot = layout?.shadowRoot;
      if (!shadowRoot) {
        // Si no existe, lo crea solo una vez
        shadowRoot = layout.attachShadow({ mode: "open" });
      } else {
        // Si ya existe, vacia su contenido antes de agregar el nuevo
        shadowRoot.innerHTML = "";
      }

      // Clona el contenido del template y lo adjunta al Shadow DOM
      shadowRoot.appendChild(template.content.cloneNode(true));

      // Llama a la función de configuración
      if (route.setup) {
        const utils = {
          navigate,
          findInPage
        }

        route.setup(shadowRoot, utils);
      }
    } else {
      // Manejar si el template no es encontrado
      layout.innerHTML = "Error: Template not found.";
      if (layout.shadowRoot) layout.shadowRoot.innerHTML = ""; // Limpia el Shadow DOM
    }
  } catch (error) {
    console.error("Error loading content:", error);
    layout.innerHTML = "<p>Error loading content.</p>";
    if (layout.shadowRoot) layout.shadowRoot.innerHTML = ""; // Limpia el Shadow DOM
  }
}

// Llamada inicial para cargar la página de inicio
navigate(document, "mainContent", "home");

// Busqueda global en la pagina
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    findInPage();
  }
});

const searchInput = document.getElementById('search-input');
const findNextButton = document.getElementById('find-next-button');
const findPrevButton = document.getElementById('find-prev-button');
const closeButton = document.getElementById('close-button');

searchInput.addEventListener('change', () => {
  const text = searchInput.value;
  if (text) {
    window.electronAPI.findInPage(text, { findNext: true });
  } else {
    window.electronAPI.stopFindInPage('clearSelection');
  }
});

findNextButton.addEventListener('click', () => {
  const text = searchInput.value;
  if (text) {
    window.electronAPI.findInPage(text, { findNext: true });
  }
});

findPrevButton.addEventListener('click', () => {
  const text = searchInput.value;
  if (text) {
    window.electronAPI.findInPage(text, { findNext: true, forward: false });
  }
});

closeButton.addEventListener('click', () => {
  const searchBar = document.getElementById('search-bar');
  searchBar.style.display = 'none';
  searchInput.value = '';
  window.electronAPI.stopFindInPage('clearSelection');
});