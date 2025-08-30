const clientsRoute = {
    setup: (shadowRoot, utils) => {

        const clientsForm = shadowRoot.getElementById("clientsForm");
        const clientDeleteForm = shadowRoot.getElementById("clientDeleteForm");

        function openClientFormDialog() {
            const dialog = shadowRoot.getElementById("clientsFormDialog");
            dialog.showModal();
        }

        function openClientDeleteDialog() {
            const dialog = shadowRoot.getElementById("clientDeleteDialog");
            dialog.showModal();
        }

        function closeClientDeleteDialog() {
            const dialog = shadowRoot.getElementById("clientDeleteDialog");
            dialog.close();
        }

        // Updaye client by id
        async function onupdate(clientId) {

            try {
                const client = await window.clientsAPI.getClientById(clientId);

                Object.keys(client).forEach(fieldName => {
                    const field = clientsForm.querySelector(`[name="${fieldName}"]`);

                    if (field) {
                        field.value = client[fieldName];
                    }
                });

                openClientFormDialog();

            } catch (error) {

                console.error(error);

            }

        }

        // Delete client
        async function ondelete(clientId) {

            const idField = shadowRoot.getElementById("clientDeleteId");
            idField.value = clientId;

            openClientDeleteDialog();

        }

        // List clients
        async function onlist() {
            const clientsTableBody = shadowRoot.getElementById("clientsTableBody");

            clientsTableBody.innerHTML = '';

            try {
                const clients = await window.clientsAPI.getClients();

                clients.forEach(client => {
                    const newRow = document.createElement('tr');

                    const idCell = document.createElement('td');
                    idCell.textContent = client.id;
                    idCell.style = "text-align: center"
                    newRow.appendChild(idCell);

                    const fullnameCell = document.createElement('td');
                    fullnameCell.textContent = client.fullname;
                    newRow.appendChild(fullnameCell);

                    const identificationCell = document.createElement('td');
                    identificationCell.textContent = client.identification;
                    newRow.appendChild(identificationCell);

                    const countryCell = document.createElement('td');
                    countryCell.textContent = client.country;
                    newRow.appendChild(countryCell);

                    const genderCell = document.createElement('td');
                    genderCell.textContent = client.gender;
                    newRow.appendChild(genderCell);

                    const ageCell = document.createElement('td');
                    ageCell.textContent = client.age;
                    newRow.appendChild(ageCell);

                    const updateCell = document.createElement('td');
                    const updateButton = document.createElement('button');
                    updateButton.innerText = "Update";
                    updateButton.addEventListener('click', () => {
                        onupdate(client.id);
                    })
                    updateCell.appendChild(updateButton);
                    updateCell.style = "text-align: center"
                    newRow.appendChild(updateCell);

                    const deleteCell = document.createElement('td');
                    const deleteButton = document.createElement('button');
                    deleteButton.innerText = "Delete";
                    deleteButton.addEventListener('click', () => {
                        ondelete(client.id);
                    })
                    deleteCell.appendChild(deleteButton);
                    newRow.appendChild(deleteCell);

                    clientsTableBody.appendChild(newRow);
                });
            } catch (error) {

                console.error(error);

                const errorRow = document.createElement('tr');
                const errorCell = document.createElement('td');
                errorCell.colSpan = 6;
                errorCell.innerText = "No clients data";

                errorRow.appendChild(errorCell);
                clientsTableBody.appendChild(errorRow);

            }
        }
        onlist();

        // Agregar paises al select de paises
        (async function listCountries() {
            const countrySelect = shadowRoot.getElementById("countrySelect");

            try {

                const countries = await window.clientsAPI.getCountries();

                countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

                countries.forEach(country => {
                    const option = document.createElement('option');
                    option.value = country.name.common;
                    option.textContent = country.name.common;
                    countrySelect.appendChild(option);
                });

            } catch (error) {

                console.error(error);

                const errorOption = document.createElement('option');
                errorOption.textContent = "--No options--";
                countrySelect.appendChild(errorOption);

            }

        })();

        // Agregando evento a boton de buscar clientes
        const searchClientsButton = shadowRoot.getElementById('searchClientsButton');
        searchClientsButton.addEventListener('click', () => {
            utils.findInPage();
        });

        // Agregando evento a boton de nuevo cliente
        const newClientButton = shadowRoot.getElementById('newClientButton');
        newClientButton.addEventListener('click', () => {
            clientsForm.reset();
        });

        // Agregando evento al formulario de creacion
        clientsForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            const id = formData.get("id");

            const data = Object.fromEntries(formData.entries());

            if (id) {

                window.clientsAPI.updateClient(data);

            } else {

                window.clientsAPI.createClient(data);

            }

            onlist();
        });

        clientDeleteForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            const clientId = formData.get("id");

            window.clientsAPI.deleteClient(clientId);

            closeClientDeleteDialog();

            onlist();
        })
    }
}

export default clientsRoute;