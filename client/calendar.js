/**
 * Functions for handling the calendar view.
 */
var calendar;

function createCalendar() {
    var calendarEl = document.getElementById('calendar');
    $.ajax({
        url: '/activity/current_user',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function (response) {
            calendar = new FullCalendar.Calendar(calendarEl, {
                timeZone: 'local',
                plugins: [ 'timeGrid' ],
                defaultView: 'timeGridWeek',
                events: response
            });
            calendar.render();
        },
    })
}

