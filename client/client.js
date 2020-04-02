function changeToCalendarView() {
    $("#mainView").html($("#calendarView").html())
    createCalendar();
}

$( document ).ready(function() {
    $("#mainView").html($("#landingPage").html())
    changeToCalendarView()
})