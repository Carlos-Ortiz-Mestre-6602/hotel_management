import { getLocalDateString } from "../../../utils/date.js";

const bookingsRoute = {
    setup: (shadowRoot, utils) => {

        const bookingsForm = shadowRoot.getElementById("bookingsForm");
        const bookingNumberInput = shadowRoot.getElementById('bookingNumberInput');
        const roomSelect = shadowRoot.getElementById('roomSelect');
        const bookingClientsSelect = shadowRoot.getElementById('bookingClientsSelect');

        const bookingStartDate = shadowRoot.getElementById('bookingStartDate');
        const bookingEndDate = shadowRoot.getElementById('bookingEndDate');

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

                listAvailablesRooms(booking.roomId, booking.id);

                listClients(booking.clientIds);

                bookingStartDate.min = '';
                bookingEndDate.min = '';

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
                bookingsTableBody.innerHTML = '<tr><td colspan="7">No data</td></tr>';

            }
        }
        onlist();

        // Agregando evento a boton de buscar bookings
        const searchBookingsButton = shadowRoot.getElementById('searchBookingsButton');
        searchBookingsButton.addEventListener('click', () => {
            // Poniendo fecha minima para reservar en el dia de hoy
            const now = new Date();
            const localDate = getLocalDateString(now);

            bookingStartDate.min = localDate;
            bookingEndDate.min = localDate;

            utils.findInPage();
        });

        // Agregando evento a boton de nuevo booking
        const newBookingButton = shadowRoot.getElementById('newBookingButton');
        newBookingButton.addEventListener('click', () => {
            roomSelect.innerHTML = '<option value="">--Select a room--</option>';
            bookingsForm.reset();
        });

        // Agregando evento al formulario de creacion
        bookingsForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            const id = formData.get("id");

            const data = Object.fromEntries(formData.entries());

            const clientIds = formData.getAll('clientIds');

            data.clientIds = clientIds;

            try {

                if (id) {

                    await window.bookingsAPI.updateBooking(data);

                } else {

                    await window.bookingsAPI.createBooking(data);

                }

            } catch (error) {

                console.error(error);

            }

            onlist();
        });

        // Listando las habitaciones disponibles

        // Validando que la fecha de fin no pueda ser menor a la fecha de inicio
        bookingStartDate.addEventListener('change', (event) => {
            const startDate = new Date(event.target.value);
            const endDate = new Date(bookingEndDate.value);

            if (endDate.getDate() <= startDate.getDate()) {
                bookingEndDate.value = "";
            }

            const minEndDate = startDate;
            minEndDate.setDate(startDate.getDate() + 2);

            const localDate = getLocalDateString(minEndDate);
            bookingEndDate.min = localDate;
        });

        async function listAvailablesRooms(value, bookingId) {
            const startDate = bookingStartDate.value;
            const endDate = bookingEndDate.value;

            if (startDate && endDate) {
                try {
                    // Limpiar las opciones anteriores
                    roomSelect.innerHTML = '<option value="">--Select a room--</option>';

                    const availableRooms = await window.bookingsAPI.getAvailableRooms({ startDate, endDate, bookingId });

                    availableRooms.forEach(room => {
                        const option = document.createElement('option');
                        option.value = room.id;
                        if (room.id == value) option.selected = true;
                        option.textContent = `${room.number} (${room.condition}) $${room.price}`;
                        roomSelect.appendChild(option);
                    });

                } catch (error) {

                    console.error(error);
                    roomSelect.innerHTML = '<option value="">--No available rooms--</option>'

                }

            } else {

                roomSelect.innerHTML = '<option value="">--Select a room--</option>';

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

                const date = new Date(`${dateString}T00:00:00`);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2);

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
                bookingClientsSelect.innerHTML = '';

            }
        };
        listClients();
    }
}

export default bookingsRoute;