const roomsRoute = {
    setup: (shadowRoot, utils) => {

        const roomsForm = shadowRoot.getElementById("roomsForm");
        const roomDeleteForm = shadowRoot.getElementById("roomDeleteForm");

        function openRoomFormDialog() {
            const dialog = shadowRoot.getElementById("roomsFormDialog");
            dialog.showModal();
        }

        function openRoomDeleteDialog() {
            const dialog = shadowRoot.getElementById("roomDeleteDialog");
            dialog.showModal();
        }

        function closeRoomDeleteDialog() {
            const dialog = shadowRoot.getElementById("roomDeleteDialog");
            dialog.close();
        }

        // Updaye room by id
        async function onupdate(roomId) {

            try {
                const room = await window.roomsAPI.getRoomById(roomId);

                Object.keys(room).forEach(fieldName => {
                    const field = roomsForm.querySelector(`[name="${fieldName}"]`);

                    if (field) {
                        field.value = room[fieldName];
                    }
                });

                openRoomFormDialog();

            } catch (error) {

                console.error(error);

            }

        }

        // Delete room
        async function ondelete(roomId) {

            const idField = shadowRoot.getElementById("roomDeleteId");
            idField.value = roomId;

            openRoomDeleteDialog();

        }

        // List rooms
        async function onlist() {
            const roomsTableBody = shadowRoot.getElementById("roomsTableBody");

            roomsTableBody.innerHTML = '';

            try {
                const rooms = await window.roomsAPI.getRooms();

                rooms.forEach(room => {
                    const newRow = document.createElement('tr');

                    const idCell = document.createElement('td');
                    idCell.textContent = room.id;
                    idCell.style = "text-align: center"
                    newRow.appendChild(idCell);

                    const numberCell = document.createElement('td');
                    numberCell.textContent = room.number;
                    newRow.appendChild(numberCell);

                    const typeCell = document.createElement('td');
                    typeCell.textContent = room.type;
                    newRow.appendChild(typeCell);

                    const priceCell = document.createElement('td');
                    priceCell.textContent = room.price;
                    newRow.appendChild(priceCell);

                    const statusCell = document.createElement('td');
                    statusCell.textContent = room.status;
                    newRow.appendChild(statusCell);

                    const conditionCell = document.createElement('td');
                    conditionCell.textContent = room.condition;
                    newRow.appendChild(conditionCell);

                    const cleanedAtCell = document.createElement('td');
                    cleanedAtCell.textContent = room.cleanedAt;
                    newRow.appendChild(cleanedAtCell);

                    const updateCell = document.createElement('td');
                    const updateButton = document.createElement('button');
                    updateButton.innerText = "Update";
                    updateButton.addEventListener('click', () => {
                        onupdate(room.id);
                    })
                    updateCell.appendChild(updateButton);
                    updateCell.style = "text-align: center"
                    newRow.appendChild(updateCell);

                    const deleteCell = document.createElement('td');
                    const deleteButton = document.createElement('button');
                    deleteButton.innerText = "Delete";
                    deleteButton.addEventListener('click', () => {
                        ondelete(room.id);
                    })
                    deleteCell.appendChild(deleteButton);
                    newRow.appendChild(deleteCell);

                    roomsTableBody.appendChild(newRow);
                });
            } catch (error) {

                console.error(error);

                const errorRow = document.createElement('tr');
                const errorCell = document.createElement('td');
                errorCell.colSpan = 6;
                errorCell.innerText = "No rooms data";

                errorRow.appendChild(errorCell);
                roomsTableBody.appendChild(errorRow);

            }
        }
        onlist();

        // Agregando evento a boton de buscar habitaciones
        const searchRoomsButton = shadowRoot.getElementById('searchRoomsButton');
        searchRoomsButton.addEventListener('click', () => {
            utils.findInPage();
        });

        // Agregando evento a boton de nueva habitacion
        const newRoomButton = shadowRoot.getElementById('newRoomButton');
        newRoomButton.addEventListener('click', () => {
            roomsForm.reset();
        });

        // Agregando evento al formulario de creacion
        roomsForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            const id = formData.get("id");

            const data = Object.fromEntries(formData.entries());

            if (id) {

                window.roomsAPI.updateRoom(data);

            } else {

                window.roomsAPI.createRoom(data);

            }

            onlist();
        });

        roomDeleteForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);

            const roomId = formData.get("id");

            window.roomsAPI.deleteRoom(roomId);

            closeRoomDeleteDialog();

            onlist();
        })

    }
}

export default roomsRoute;