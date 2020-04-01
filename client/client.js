function changeToCalendarView() {
    $("#mainView").html($("#calendarView").html())
        var calendarEl = document.getElementById('calendar');

        var calendar = new FullCalendar.Calendar(calendarEl, {
            timeZone: 'local',
            plugins: [ 'timeGrid' ],
            defaultView: 'timeGridDay',
            events: [
              {
                  title: 'Titeln',
                  start: '2020-04-01T12:30:00',
                  end: '2020-04-01T13:30:00'

              }
            ]
        });

        
        calendar.render();
}

$( document ).ready(function() {
    $("#mainView").html($("#landingPage").html())
})