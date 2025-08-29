const clientsRoute = {
    setup: async (shadowRoot) => {

        const clients = await window.electronAPI.getClients();

        const clientsTableBody = shadowRoot.getElementById("clientsTableBody");

        clients.forEach(client => {
            const newRow = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = client.id;
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

            clientsTableBody.appendChild(newRow);
        });

    }
}

export default clientsRoute;