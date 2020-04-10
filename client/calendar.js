/**
 * Functions for handling the calendar view.
 */
var calendar;
/**
 * Global variable for keeping track of some available colors. Used for coloring the calendar events.
 */
let colorsArray = ["lightsalmon", "tomato", "papayawhip", "greenyellow", "lightskyblue", "lightskyblue", "navajowhite"]
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
            eventSources: [function (info, callback) {
                $.ajax({
                    url: `/activity/feed?start=${info.startStr}&end=${info.endStr}`,
                    type: 'GET',
                    headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
                    success: function (response) {
                        callback(response);
                    },
                });
            }],
            eventClick: function(info) {
                console.log("klickade på: ", info.event.id)
                $.ajax({
                    url: `activity/${info.event.id}`,
                    type: 'GET',
                    headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
                    success: function (response) {
                        console.log(response)
                    },
                    error: function (response) {
                        console.log("error")
                    }
                })
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
    $("#addActivityEmpSelGroup").show()

    employees.forEach(employee => $("#addActivityEmployeeSelector").append(`<option id="${employee.id}" value="${employee.id}">${employee.name}</option>`))
}

/**
 * Helper function for populating the drop down menus
 */
function populateProjectsDropdown() {
    //Hämta alla projekt genom ett ajax-anrop
    //Currently using stub
    //Populating projects
    $("#addActivityProjectSelector").html("");
    var projects = [
        {
            name: "Bygga hus",
            id: 1
        },
        {
            name: "Lägg golv",
            id: 5
        },
        {
            name: "Bygg veranda",
            id: 6
        }
    ]
    projects.forEach(project => $("#addActivityProjectSelector").append(`<option value="${project.id}">${project.name}</option>`));
}

//Global variable for keeping track of what employees are currently selected.
var employees = [
    {
        name: "Anders Andersson",
        id: "199403010000",
        selected: false
    },
    {
        name: "Pelle Svensson",
        id: "199001010000",
        selected: false
    }
]

var employeeMap = new Map()
employeeMap.set("199403010000", {
    name: "Anders Andersson",
    selected: false
});
employeeMap.set("199001010000", {
    name: "Pelle Svensson",
    selected: false
});

/**
 * Helper function for populating the employee selector
 * 
 * USES GLOBAL VARIABLE "EMPLOYEES"
 */

function populateEmployeeSelectorAct() {
    $("#addActivityEmpSelGroup").show()
    $("#addActivitySelectedEmployeeList").show()
    var selectHTML = ""
    var selectedHTML = ""

    employeeMap.forEach(function (value, key, map) {

        if (value.selected) {
            selectedHTML = selectedHTML + `<li class="list-group-item selected-emp">${value.name}<button style="float: right;" type="button" class="close" value="${key}" onclick="removeFromSelEmployeesAct(this.value)"><i class="fa fa-times"></i></button></li>`
        } else {
            selectHTML = selectHTML + `<option value="${key}">${value.name}</option>`
        }
    })
    /*
    if (selectedHTML=="") {
        $("#addActivityEmpHolderText").show()
    } else {
        $("#addActivityEmpHolderText").hide()
    }*/
    $("#addActivitySelectedEmployeeList").html(selectedHTML)
    $("#addActivityEmployeeSelector").html(selectHTML)
}

function addEmployeeToSelectedEmployeesAct() {
    employeeMap.get($("#addActivityEmployeeSelector").val()).selected = true;
    populateEmployeeSelectorAct();
}

function removeFromSelEmployeesAct(id) {
    employeeMap.get(id).selected = false;
    populateEmployeeSelectorAct();
}
/**
 * Spawns a modal prompting the user to add an activity.
 * Uses global variable selectedEmployees
 */

// TODO: Skulle eventuellt kunna flyttas till en annan fil innehållande saker relaterade till aktiviterer.
function spawnAddActivityModal() {
    selectedEmployees = [];
    $("#addActivityModal").modal("show")
    $(activateDateAndTimePickers);
    populateProjectsDropdown();
    populateEmployeeSelectorAct();
}
/**
 * Function called by the submit button.
 * Uses global variable selectedEmployees
 */
function addActivity() {
    var name = $("#addActivityName").val();
    var date = $("#addActivityStartDatePicker").datetimepicker('date').toISOString(true).substring(0, 10)
    var startTime = $("#addActivityStartDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#addActivityStartTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var stopTime = $("#addActivityStopDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#addActivityStopTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var loc = $("#addActivityLocation").val()
    var description = $("#addActivityDescription").val()
    //TODO: Ta fram projekt med en hashmap och populera den från servern med data.
    //TODO: Samma sak med employees
    var project_id = $("#addActivityProjectSelector").val()
    var employees = selectedEmployees;

    var activityData = `
    {
        "date": "${date}",
        "name": "${name}",
        "startTime": "${startTime}",
        "stopTime": "${stopTime}",
        "location": "${loc}",
        "description": "${description}",
        "project_id": ${project_id},
        "employees": ${JSON.stringify(employees)}
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


/**
 * Helper function for populating the employee selector
 * 
 * USES GLOBAL VARIABLE "EMPLOYEES"
 */

function populateEmployeeSelectorCal() {
    $("#viewCalendarsEmpSelGroup").show()
    $("#viewCalendarsSelectedEmployeeList").show()
    var selectHTML = ""
    var selectedHTML = ""

    employeeMap.forEach(function (value, key, map) {

        if (value.selected) {
            selectedHTML = selectedHTML + `<li class="list-group-item selected-emp">${value.name}<button style="float: right;" type="button" class="close" value="${key}" onclick="removeFromSelEmployeesCal(this.value)"><i class="fa fa-times"></i></button></li>`
        } else {
            selectHTML = selectHTML + `<option value="${key}">${value.name}</option>`
        }
    })
    /*
    if (selectedHTML=="") {
        $("#addActivityEmpHolderText").show()
    } else {
        $("#addActivityEmpHolderText").hide()
    }*/
    $("#viewCalendarsSelectedEmployeeList").html(selectedHTML)
    $("#viewCalendarsEmployeeSelector").html(selectHTML)
}

function addEmployeeToSelectedEmployeesCal() {
    employeeMap.get($("#viewCalendarsEmployeeSelector").val()).selected = true;
    populateEmployeeSelectorCal();
}

function removeFromSelEmployeesCal(id) {
    employeeMap.get(id).selected = false;
    populateEmployeeSelectorCal();
}

function spawnViewCalendarsModal() {
    $("#viewCalendarsModal").modal("show")
    populateEmployeeSelectorCal()
}

function viewCalendars() {
    calendar.getEventSources().forEach(s => s.remove());
    var colorIndex = 0;
    employeeMap.forEach(function (value, key, map) {
        if (value.selected) {
            calendar.addEventSource({
                events: function (info, callback) {
                    $.ajax({
                        url: `/activity/${key}/feed?start=${info.startStr}&end=${info.endStr}`,
                        type: 'GET',
                        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
                        success: function (response) {
                            callback(response);
                        }
                    });
                },
                color: colorsArray[colorIndex++]
            });
        }
    })
    $("#viewCalendarsModal").modal("hide")
}

