const clientsRoute = {
    setup: (shadowRoot) => {

        const clientsForm = shadowRoot.getElementById("clientsForm");

        function openClientFormDialog() {
            const dialog = shadowRoot.getElementById("clientsFormDialog");
            dialog.showModal();
        }

        // Updaye client by id
        async function update(clientId) {

            try {
                const client = await window.electronAPI.getClientById(clientId);

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

        // List clients
        async function list() {
            const clientsTableBody = shadowRoot.getElementById("clientsTableBody");

            clientsTableBody.innerHTML = '';

            try {
                const clients = await window.electronAPI.getClients();

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
                        update(client.id);
                    })
                    updateCell.appendChild(updateButton);
                    updateCell.style = "text-align: center"
                    newRow.appendChild(updateCell);

                    const deleteCell = document.createElement('td');
                    const deleteButton = document.createElement('button');
                    deleteButton.innerText = "Delete";
                    deleteButton.addEventListener('click', () => {
                        console.log("Eliminar el cliente con id: ", client.id);
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

                errorRow.appendChild(errorCell);
                clientsTableBody.appendChild(errorRow);

            }
        }
        list();

        // Agregar paises al select de paises
        (async function listCountries() {
            const countrySelect = shadowRoot.getElementById("countrySelect");

            try {

                const countries = await window.electronAPI.getCountries();

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

        // Agregando evento a boton de nuevo cliente
        const newClientButton = shadowRoot.getElementById('newClientButton');
        newClientButton.addEventListener('click', () => {
            clientsForm.reset();
        })

        // Agregando evento al formulario
        clientsForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            const id = formData.get("id");

            const data = Object.fromEntries(formData.entries());

            if (id) {

                window.electronAPI.updateClient(data);

            } else {

                window.electronAPI.createClient(data);

            }

            list();
        });
    }
}

export default clientsRoute;