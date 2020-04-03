/**
 * Functions for handling the calendar view.
 */
var calendar;

/**
 * Creates the calendar, needs a html element with a 'calendar' id for it to work.
 * Fetches only the data needed from the server.
 */
function createCalendar() {
    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        timeZone: 'local',
        plugins: ['timeGrid'],
        defaultView: 'timeGridWeek',
        nowIndicator: true,
        events: function (info, callback) {
            $.ajax({
                url: `/activity/feed?start=${info.startStr}&end=${info.endStr}`,
                type: 'GET',
                headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
                success: function (response) {
                    callback(response);
                },
            });
        }
    });
    calendar.render();
}
