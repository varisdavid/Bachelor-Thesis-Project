/**
 * Functions for handling the calendar view.
 */

/**
 * Global variable for keeping track of the calendar.
 */
var calendar;

/**
 * Global variable for keeping track of some available colors. Used for coloring the calendar events.
 */
let colorsArray = ["lightsalmon", "lightskyblue", "tomato", "papayawhip", "greenyellow", "lightskyblue", "navajowhite"];

$( document ).ready(function () {
    $("#addActivityOnlyMeButton").click(function () {
        $("#addActivityWholeEmpSelector").hide("fast")
    })
    $("#addActivitySomeButton").click(function () {
        $("#addActivityWholeEmpSelector").show("fast")
    })
    $("#addActivityEveryoneButton").click(function () {
        $("#addActivityWholeEmpSelector").hide("fast")
    })

})
/**
 * Creates the calendar, needs a html element with a 'calendar' id for it to work.
 * Fetches only the data needed from the server through the 'feed' route.
 */
function createCalendar() {
    $(function () {
        var calendarEl = document.getElementById('calendar');
        var centerButtonsString = "addActivityButton";
        // TODO: Could be done if user is admin or boss
        centerButtonsString = centerButtonsString + " viewOtherCalendarsButton ";
        
        calendar = new FullCalendar.Calendar(calendarEl, {
            height:  $(window).height() - 100,
            timeZone: 'local',
            plugins: ['timeGrid', 'bootstrap'],
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
                spawnActivityInfoModal(info.event.id)
            },
            customButtons: {
                addActivityButton: {
                    text: "Lägg till aktivitet",
                    click : function() {spawnAddActivityModal()}
                },
                viewOtherCalendarsButton: {
                    text: "Visa andras kalendrar",
                    click: function () {spawnViewCalendarsModal()}
                }
            },
            header: {
                left: "today prev,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
            },
            footer: {
                left: "",
                center: "",
                right: centerButtonsString
            },
            themeSystem: "bootstrap",
            // Not a good solution since changes elsewhere could and probably would break this.
            windowResize: function (view) {
                calendar.setOption("height", $(window).height() - 100);
            }
            
        });
        calendar.render();
    })
}

function spawnActivityInfoModal(activityID) {
    $.ajax({
        url: `activity/${activityID}`,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            $("#activityInfoTitle").html(response.name);

            employeeString = "";
            response.employees.forEach(function(emp) {
                employeeString = employeeString + emp.name + "\n";
            })
            var startTime = response.startTime.split("T")[1] + ", " + response.startTime.split("T")[0]
            var stopTime = response.stopTime.split("T")[1] + ", " + response.stopTime.split("T")[0]

            $("#activityInfoBody").html(`
            <div>
                <h5>Starttid </h5>
                <p>${startTime}</p>
                <h5>Sluttid</h5>
                <p>${stopTime}</p>
                <h5>Plats</h5>
                <p>${response.location}</p>
                <h5>Beskrivning</h5>
                <p>${response.description}</p>
                <h5>Projekt</h5>
                <p>${response.project.name}</p>
                <h5>Anställda</h5>
                <p>${employeeString}</p>
             </div>`);
             $("#activityInfoRemoveActivityButton").val(response.id);
            $("#activityInfoModal").modal("show");
        },
        error: function (response) {
            console.log("error")
        }
    })
}
 /**
  * Helper function for making the datepicker and timepicker fields work properly. Should be called from a $( document ).ready()
  * 
  * @param {string} startDatePicker the identifier of the time picker used for picking the start date 
  * @param {string} startTimePicker the identifier of the time picker used for picking the start time
  * @param {string} stopDatePicker the identifier of the time picker used for picking the stop date
  * @param {string} stopTimePicker the identifier of the time picker used for picking the stop time
  * @param {string} wrongDateAlert the identifier of the alert that is shown when the user picks a start date that is greater than the stop date, or vice versa
  * @param {string} startTime Sets the defaultDate property of the start time and date pickers
  * @param {string} stopTime Sets the defaultDate property of the stop time and date pickers
  */
function activateDateAndTimePickers(startDatePicker, startTimePicker, stopDatePicker, stopTimePicker, wrongDateAlert, startTime = moment(), stopTime = moment()) {
    $(startDatePicker).datetimepicker({
        format: "L",
        locale: "sv",
        defaultDate: startTime
    });
    $(startTimePicker).datetimepicker({
        format: "LT",
        locale: "sv",
        defaultDate: startTime
    })

    $(stopDatePicker).datetimepicker({
        format: "L",
        locale: "sv",
        defaultDate: stopTime
    });
    $(stopTimePicker).datetimepicker({
        format: "LT",
        locale: "sv",
        defaultDate: stopTime
    })


    //TODO: Eventuellt implementera automatisk datumväxlig när tid ändras. Även lägga till global offset som sätts när slutdatum ändras.
    $(startDatePicker).on("change.datetimepicker", function (e) {
        $(stopDatePicker).datetimepicker('minDate', e.date)
        $(stopDatePicker).datetimepicker('date', e.date)
    })

    $(startTimePicker).on("change.datetimepicker", function (e) {
        var newDate = e.date;
        newDate.hour(newDate.hour() + 1)
        $(stopTimePicker).datetimepicker('date', newDate)
    });
    
    function checkWrongDate (e) {
        var startDate = $(startDatePicker).datetimepicker('date');
        var stopDate = $(stopDatePicker).datetimepicker('date')
        var startTime = $(startTimePicker).datetimepicker('date')
        var stopTime = $(stopTimePicker).datetimepicker('date')
    
        if (startDate < stopDate) {
            $(wrongDateAlert).hide();
        } else if (startDate > stopDate) {
            $(wrongDateAlert).show()
        } else {
            if (startTime.hour() < stopTime.hour()) {
                $(wrongDateAlert).hide();
            } else if(startTime.hour() > stopTime.hour()) {
                $(wrongDateAlert).show()
            } else {
                if (startTime.minute() <= stopTime.minute()) {
                    $(wrongDateAlert).hide();
                } else {
                    $(wrongDateAlert).show();
                }
            }
        }
    }

    $(startDatePicker).on("change.datetimepicker", function (e) {checkWrongDate(e)});
    $(startTimePicker).on("change.datetimepicker", function (e) {checkWrongDate(e)});
    $(stopDatePicker).on("change.datetimepicker", function (e) {checkWrongDate(e)});
    $(stopTimePicker).on("change.datetimepicker", function (e) {checkWrongDate(e)});
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
    var selectHTML = ""
    var selectedHTML = ""

    employeeMap.forEach(function (value, key, map) {

        if (value.selected) {
            selectedHTML = selectedHTML + `<li class="list-group-item selected-emp">${value.name}<button style="float: right;" type="button" class="close" value="${key}" onclick="removeFromSelEmployeesAct(this.value)"><i class="fa fa-times"></i></button></li>`
        } else {
            selectHTML = selectHTML + `<option value="${key}">${value.name}</option>`
        }
    })
    
    if (selectedHTML=="") {
        $("#addActivityEmpHolderText").show()
    } else {
        $("#addActivityEmpHolderText").hide()
    }

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
 */

// TODO: Skulle eventuellt kunna flyttas till en annan fil innehållande saker relaterade till aktiviterer.
function spawnAddActivityModal() {
    employeeMap.forEach(function(value) {
        value.selected = false;
    })
    $("#addActivityModal").modal("show")
    $(activateDateAndTimePickers("#addActivityStartDatePicker", "#addActivityStartTimePicker", "#addActivityStopDatePicker", "#addActivityStopTimePicker", "#addActivityWrongDateAlert"));
    populateProjectsDropdown();
    populateEmployeeSelectorAct();
}

/**
 * Function called by the submit button.
 */
function addActivity() {
    var selectedEmployees = [];
    var notSelectedEmployees = [];
    var allEmployees = []
    employeeMap.forEach(function (value, key) {
        if(value.selected == true) {
            selectedEmployees.push(key);
        } else {
            notSelectedEmployees.push(key);
        }
        allEmployees.push(key);
    })


    var name = $("#addActivityName").val();
    var date = $("#addActivityStartDatePicker").datetimepicker('date').toISOString(true).substring(0, 10)
    var startTime = $("#addActivityStartDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#addActivityStartTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var stopTime = $("#addActivityStopDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#addActivityStopTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var loc = $("#addActivityLocation").val()
    var description = $("#addActivityDescription").val()
    //TODO: Ta fram projekt med en hashmap och populera den från servern med data.
    //TODO: Samma sak med employees
    var project_id = $("#addActivityProjectSelector").val()
    var activityData;

    if ($("#addActivitySomeButton:checked").val() && (employees.length > 0)) {
        activityData = `
        {
            "date": "${date}",
            "name": "${name}",
            "startTime": "${startTime}",
            "stopTime": "${stopTime}",
            "location": "${loc}",
            "description": "${description}",
            "project_id": ${project_id},
            "employees": ${JSON.stringify(selectedEmployees)}
        }`
    } else if ($("#addActivityEveryoneButton:checked").val()) {
        activityData = `
        {
            "date": "${date}",
            "name": "${name}",
            "startTime": "${startTime}",
            "stopTime": "${stopTime}",
            "location": "${loc}",
            "description": "${description}",
            "project_id": ${project_id},
            "employees": ${JSON.stringify(allEmployees)}
        }`
    } else {
        var activityData = `
        {
            "date": "${date}",
            "name": "${name}",
            "startTime": "${startTime}",
            "stopTime": "${stopTime}",
            "location": "${loc}",
            "description": "${description}",
            "project_id": ${project_id}
        }`
    }

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
    
    if (selectedHTML=="") {
        $("#viewCalendarsEmpHolderText").show()
    } else {
        $("#viewCalendarsEmpHolderText").hide()
    }
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

function removeActivity(id) {
    $.ajax({
        url: 'activity/' + id,
        type: 'DELETE',
        headers: {"Authorization" : "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function (response) {
            $("#activityInfoModal").modal("hide");
            spawnAlert("Aktiviteten togs bort", "warning")
            calendar.refetchEvents()
            //calendar.render()
        }
    })
}