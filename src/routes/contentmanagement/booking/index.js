const bookingsRoute = {
    setup: (shadowRoot, utils) => {

        const bookingsForm = shadowRoot.getElementById("bookingsForm");
        const bookingNumberInput = shadowRoot.getElementById('bookingNumberInput');
        const roomSelect = shadowRoot.getElementById('roomSelect');
        const bookingClientsSelect = shadowRoot.getElementById('bookingClientsSelect');

        function openBookingFormDialog() {
            const dialog = shadowRoot.getElementById("bookingsFormDialog");
            dialog.showModal();
        }

        // Updaye booking by id
        async function onupdate(bookingId) {

            try {
                const booking = await window.bookingsAPI.getBookingById(bookingId);

                Object.keys(booking).forEach(fieldName => {
                    const field = bookingsForm.querySelector(`[name="${fieldName}"]`);

                    if (field) {
                        field.value = booking[fieldName];
                    }
                });

                listAvailablesRooms(booking.room.id);

                const clientIds = booking.clients.map(client => client.id);

                listClients(clientIds);

                openBookingFormDialog();

            } catch (error) {

                console.error(error);

            }

        }

        // List bookings
        async function onlist() {
            const bookingsTableBody = shadowRoot.getElementById("bookingsTableBody");

            bookingsTableBody.innerHTML = '';

            try {
                const bookings = await window.bookingsAPI.getBookings();

                bookings.forEach(booking => {
                    const newRow = document.createElement('tr');

                    const idCell = document.createElement('td');
                    idCell.textContent = booking.id;
                    idCell.style = "text-align: center"
                    newRow.appendChild(idCell);

                    const numberCell = document.createElement('td');
                    numberCell.textContent = booking.number;
                    newRow.appendChild(numberCell);

                    const roomNameCell = document.createElement('td');
                    roomNameCell.textContent = booking.roomName;
                    newRow.appendChild(roomNameCell);

                    const startDateCell = document.createElement('td');
                    startDateCell.textContent = booking.startDate;
                    newRow.appendChild(startDateCell);

                    const endDateCell = document.createElement('td');
                    endDateCell.textContent = booking.endDate;
                    newRow.appendChild(endDateCell);

                    const statusCell = document.createElement('td');
                    statusCell.textContent = booking.status;
                    newRow.appendChild(statusCell);

                    const updateCell = document.createElement('td');
                    const updateButton = document.createElement('button');
                    updateButton.innerText = "Update";
                    updateButton.addEventListener('click', () => {
                        onupdate(booking.id);
                    })
                    updateCell.appendChild(updateButton);
                    updateCell.style = "text-align: center"
                    newRow.appendChild(updateCell);

                    bookingsTableBody.appendChild(newRow);
                });
            } catch (error) {

                console.error(error);

                const errorRow = document.createElement('tr');
                const errorCell = document.createElement('td');
                errorCell.colSpan = 6;
                errorCell.innerText = "No bookings data";

                errorRow.appendChild(errorCell);
                bookingsTableBody.appendChild(errorRow);

            }
        }
        onlist();

        // Agregando evento a boton de buscar bookings
        const searchBookingsButton = shadowRoot.getElementById('searchBookingsButton');
        searchBookingsButton.addEventListener('click', () => {
            utils.findInPage();
        });

        // Agregando evento a boton de nuevo booking
        const newBookingButton = shadowRoot.getElementById('newBookingButton');
        newBookingButton.addEventListener('click', () => {
            roomSelect.disabled = true;
            bookingsForm.reset();
        });

        // Agregando evento al formulario de creacion
        bookingsForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            const id = formData.get("id");

            const data = Object.fromEntries(formData.entries());

            const clientIds = formData.getAll('clientIds');

            data.clientIds = clientIds;

            try {

                if (id) {

                    window.bookingsAPI.updateBooking(data);

                } else {

                    window.bookingsAPI.createBooking(data);

                }

            } catch (error) {

                console.error(error);

            }

            onlist();
        });

        // Listando las habitaciones disponibles
        const bookingStartDate = shadowRoot.getElementById('bookingStartDate');
        const bookingEndDate = shadowRoot.getElementById('bookingEndDate');

        async function listAvailablesRooms(value) {
            const startDate = bookingStartDate.value;
            const endDate = bookingEndDate.value;

            if (startDate && endDate) {
                try {
                    roomSelect.disabled = false;
                    // Limpiar las opciones anteriores
                    roomSelect.innerHTML = '<option value="">--Select a room--</option>';

                    const availableRooms = await window.bookingsAPI.getAvailableRooms({ startDate, endDate });

                    availableRooms.forEach(room => {
                        const option = document.createElement('option');
                        option.value = room.id;
                        if (room.id === Number(value)) option.selected = true;
                        option.textContent = `${room.number} (${room.status}, ${room.condition})`;
                        roomSelect.appendChild(option);
                    })

                } catch (error) {

                    console.error(error);

                    const errorOption = document.createElement('option');
                    errorOption.textContent = "--No available rooms--";
                    roomSelect.appendChild(errorOption);
                    roomSelect.disabled = true;

                }

            } else {

                const errorOption = document.createElement('option');
                errorOption.textContent = "--Select a room--";
                roomSelect.appendChild(errorOption);
                roomSelect.disabled = true;

            }

        }

        // Creando el numero de reserva
        async function createBookingNumber(value) {

            if (value) {
                bookingNumberInput.value = value;
                return;
            }

            const startDate = bookingStartDate.value;
            const endDate = bookingEndDate.value;
            const roomId = roomSelect.value;

            const formatDate = (dateString) => {
                // Crea un objeto Date.
                // Usar 'T00:00:00' es una buena práctica para evitar problemas de zona horaria.
                const date = new Date(`${dateString}T00:00:00`);

                // Obtiene el día, mes y año.
                // getMonth() devuelve 0-11, por lo que sumamos 1.
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2); // Obtiene los últimos dos dígitos

                return `${day}_${month}_${year}`;
            };

            if (startDate && endDate && roomId) {

                const formattedStartDate = formatDate(startDate);
                const formattedEndDate = formatDate(endDate);

                const number = `${roomId}-${formattedStartDate}-${formattedEndDate}`;

                bookingNumberInput.value = number;

            } else {

                bookingNumberInput.value = "";

            }

        }

        bookingStartDate.addEventListener('change', () => {
            listAvailablesRooms(roomSelect.value);
            createBookingNumber(bookingNumberInput.value);
        });
        bookingEndDate.addEventListener('change', () => {
            listAvailablesRooms(roomSelect.value);
            createBookingNumber(bookingNumberInput.value);
        });
        roomSelect.addEventListener('change', () => createBookingNumber(bookingNumberInput.value));

        // Listando los clientes
        async function listClients(values) {

            try {

                const clients = await window.clientsAPI.getClients();

                clients.sort((a, b) => a.fullname.localeCompare(b.fullname));

                bookingClientsSelect.innerHTML = '';

                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    if (values?.includes(client.id)) option.selected = true;
                    option.textContent = client.fullname;
                    bookingClientsSelect.appendChild(option);
                });

            } catch (error) {

                console.error(error);

                const errorOption = document.createElement('option');
                errorOption.textContent = "--No options--";
                bookingClientsSelect.appendChild(errorOption);

            }
        };
        listClients();
    }
}

export default bookingsRoute;