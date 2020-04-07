/**
 * Functions for handling the calendar view.
 */
var calendar;

/**
 * Creates the calendar, needs a html element with a 'calendar' id for it to work.
 * Fetches only the data needed from the server.
 */
function createCalendar() {
    $(function () {
        var calendarEl = document.getElementById('calendar');

        calendar = new FullCalendar.Calendar(calendarEl, {
            timeZone: 'local',
            plugins: ['timeGrid'],
            defaultView: 'timeGridWeek',
            nowIndicator: true,
            locale: 'sv',
            events: function (info, callback) {
                $.ajax({
                    url: `/activity/feed?start=${info.startStr}&end=${info.endStr}`,
                    type: 'GET',
                    headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
                    success: function (response) {
                        callback(response);
                    },
                });
            }
        });
        calendar.render();
    })
}

/**
 * Helper function for making the datepicker and timepicker fields work properly. Should be called from a $( document ).ready()
 */
function activateDateAndTimePickers() {
    $("#addActivityStartDatePicker").datetimepicker({
        format: "L",
        locale: "sv"
    });
    $("#addActivityStartTimePicker").datetimepicker({
        format: "LT",
        locale: "sv"
    })

    $("#addActivityStopDatePicker").datetimepicker({
        format: "L",
        locale: "sv"
    });
    $("#addActivityStopTimePicker").datetimepicker({
        format: "LT",
        locale: "sv"
    })


    //TODO: Eventuellt implementera automatisk datumväxlig när tid ändras. Även lägga till global offset som sätts när slutdatum ändras.
    $('#addActivityStartDatePicker').on("change.datetimepicker", function (e) {
        $("#addActivityStopDatePicker").datetimepicker('minDate', e.date)
        $("#addActivityStopDatePicker").datetimepicker('date', e.date)
    })

    $("#addActivityStartTimePicker").on("change.datetimepicker", function (e) {
        var newDate = e.date;
        newDate.hour(newDate.hour() + 1)
        $("#addActivityStopTimePicker").datetimepicker('date', newDate)
    });

    $('#addActivityStopTimePicker').on("change.datetimepicker", function (e) {
        var startDate = $("#addActivityStartDatePicker").datetimepicker('date')
        var stopDate = $("#addActivityStopDatePicker").datetimepicker('date')
        var startTime = $("#addActivityStartTimePicker").datetimepicker('date')
        var stopTime = $("#addActivityStopTimePicker").datetimepicker('date')

        if (startDate < stopDate) {
            document.getElementById("addActivityWrongDateAlert").hidden = true;
        } else {
            if (startTime.hour() < stopTime.hour()) {
                document.getElementById("addActivityWrongDateAlert").hidden = true;
            }
            else {
                if (startTime.minute() < stopTime.minute()) {
                    document.getElementById("addActivityWrongDateAlert").hidden = true;
                } else {
                    document.getElementById("addActivityWrongDateAlert").hidden = false;
                }
            }
        }
    });
}
/**
 * Helper function for populating the employee selector
 */
function populateEmployeeSelector() {
    
}

/**
 * Helper function for populating the drop down menus
 */
function populateProjectsDropdown() {
    //Hämta alla projekt genom ett ajax-anrop
    //Currently using stub
    //Populating projects
    var projects = [
    {
        name: "Bygga hus",
        id:1
    },
    {
        name: "Lägg golv",
        id: 5
    },
    {
        name: "Bygg veranda",
        id: 6    
    }]
    projects.forEach(element => $("#addActivityProjectSelector").append(`<option value="${element.id}">${element.name}</option>`));
}
/**
 * Spawns a modal prompting the user to add an activity.
 */

// TODO: Skulle eventuellt kunna flyttas till en annan fil innehållande saker relaterade till aktiviterer.
function spawnAddActivityModal() {
    $("#addActivityModal").modal("show")
    $(activateDateAndTimePickers);
    populateProjectsDropdown();
}

function addActivity() {
    var name = $("#addActivityName").val();
    var date = $("#addActivityStartDatePicker").datetimepicker('date').toISOString(true).substring(0,10)
    var startTime = $("#addActivityStartDatePicker").datetimepicker('date').toISOString(true).substring(0,11) + $("#addActivityStartTimePicker").datetimepicker('date').toISOString(true).substring(11,19)
    var stopTime = $("#addActivityStopDatePicker").datetimepicker('date').toISOString(true).substring(0,11) + $("#addActivityStopTimePicker").datetimepicker('date').toISOString(true).substring(11,19)
    var loc = $("#addActivityLocation").val()
    var description = $("#addActivityDescription").val()
    //TODO: Ta fram projekt med en hashmap och populera den från servern med data.
    //TODO: Samma sak med employees
    var project_id = $("#addActivityProjectSelector").val()

    var activityData = `
    {
        "date": "${date}",
        "name": "${name}",
        "startTime": "${startTime}",
        "stopTime": "${stopTime}",
        "location": "${loc}",
        "description": "${description}",
        "project_id": "${project_id}"
    }`
    console.log(activityData)
    $.ajax({
        url: 'activity/add',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        data: activityData,
        success: function (response) {
            $("#addActivityModal").modal("hide");
            spawnAlert("Aktiviteten har lagts till")
            calendar.refetchEvents()
        }, 
        error: function (response) {
            console.log("error")
        }
    })
}