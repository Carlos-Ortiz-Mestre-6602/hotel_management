const statusColors = {
  "pending": "#ffc107",
  "confirmed": "#28a745",
  "checked-in": "#007bff",
  "canceled": "#dc3545",
  "no-show": "#6c757d",
  "completed": "#17a2b8"
};

const bookingsRoute = {
  setup: async (shadowRoot, utils) => {
    const bookings = await window.bookingsAPI.getBookings();

    const events = bookings.map((booking) => {
      const color = statusColors[booking.status] || "#95a5a6"; // Gris por defecto

      return {
        id: booking.id,
        title: `Room ${booking.roomName ? booking.roomName : "no defined"} - (${booking.status})`,
        start: booking.startDate,
        end: new Date(
          new Date(booking.endDate).setDate(
            new Date(booking.endDate).getDate() + 1
          )
        )
          .toISOString()
          .split("T")[0],
        color,
        extendedProps: {
          roomId: booking.roomId,
          description: booking.description,
          status: booking.status,
        },
      };
    });

    const calendarEl = shadowRoot.getElementById("bookingCalendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      events: events,
      editable: false,
      selectable: true,
    });
    calendar.render();
  },
};

export default bookingsRoute;
