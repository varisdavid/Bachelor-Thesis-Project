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

/**
 * Function used for changing to the calendar view
 */
function changeToCalendarView() {
    $("#mainView").html($("#calendarView").html())

    $("#addActivityButton").click(function (e) {
        spawnAddActivityModal()
    })

    $("#viewCalendarsButton").click(function (e) {
        spawnViewCalendarsModal();
    })
    createCalendar();
    populateEmployeeMap();
}
/**
 * Adds the ability to hide and show the employee selector based on which employees are chosen.
 */
$(document).ready(function () {
    $("#addActivityOnlyMeButton").click(function () {
        $("#addActivityWholeEmpSelector").hide("fast")
    })
    $("#addActivitySomeButton").click(function () {
        $("#addActivityWholeEmpSelector").show("fast")
    })
    $("#addActivityEveryoneButton").click(function () {
        $("#addActivityWholeEmpSelector").hide("fast")
    })

    //Activating date and time pickers
    activateDateAndTimePickers("#changeActivityStartDatePicker", "#changeActivityStartTimePicker", "#changeActivityStopDatePicker", "#changeActivityStopTimePicker", "#changeActivityWrongDateAlert", false)
    activateDateAndTimePickers("#addActivityStartDatePicker", "#addActivityStartTimePicker", "#addActivityStopDatePicker", "#addActivityStopTimePicker", "#addActivityWrongDateAlert", true);
})
/**
 * Creates the calendar, needs a html element with a 'calendar' id for it to work.
 * Fetches only the data needed from the server through the 'feed' route.
 */
function createCalendar() {
    $(function () {
        var calendarEl = document.getElementById('calendar');

        calendar = new FullCalendar.Calendar(calendarEl, {
            height: $(window).height() - 100,
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
                        response.forEach(element => element.url = "#")
                        callback(response);
                    },
                });
            }],
            eventClick: function (info) {
                info.jsEvent.preventDefault();
                spawnActivityInfoModal(info.event.id)
            },
            customButtons: {
                addActivityButton: {
                    text: "Lägg till aktivitet",
                    click: spawnAddActivityModal
                },
                viewOtherCalendarsButton: {
                    text: "Visa andras kalendrar",
                    click: spawnViewCalendarsModal
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
                right: "addActivityButton viewOtherCalendarsButton"
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
/**
 * Function for showing more info about an activity. Spawns a modal containing info about the activity.
 * 
 * @param {number} activityID The id of the activity you want to show more info about
 */
function spawnActivityInfoModal(activityID) {
    $.ajax({
        url: `activity/${activityID}`,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            $("#activityInfoTitle").html(response.name);

            employeeString = "";
            response.employees.forEach(function (emp) {
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
            $("#activityInfoChangeButton").val(response.id);
            $("#activityInfoModal").modal("show");
        },
        error: function (response) {
            console.log("error")
        }
    })
}

function updateDateOrTimePicker(picker, time = moment()) {
    $(picker).datetimepicker('date', time);
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
function activateDateAndTimePickers(startDatePicker, startTimePicker, stopDatePicker, stopTimePicker, wrongDateAlert, autoChange = true, startTime = moment(), stopTime = moment()) {
    $(startDatePicker).datetimepicker({
        format: "L",
        locale: "sv",
        date: startTime
    });
    $(startTimePicker).datetimepicker({
        format: "LT",
        locale: "sv",
        date: startTime
    })

    $(stopDatePicker).datetimepicker({
        format: "L",
        locale: "sv",
        date: stopTime
    });
    $(stopTimePicker).datetimepicker({
        format: "LT",
        locale: "sv",
        date: stopTime
    })
    if (autoChange) {
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
    }


    function checkWrongDate() {
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
            } else if (startTime.hour() > stopTime.hour()) {
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

    $(startDatePicker).on("change.datetimepicker", checkWrongDate);
    $(startTimePicker).on("change.datetimepicker", checkWrongDate);
    $(stopDatePicker).on("change.datetimepicker", checkWrongDate);
    $(stopTimePicker).on("change.datetimepicker", checkWrongDate);
}


/**
 * Helper function for populating the drop down menus
 */
function populateProjectsDropdown(projectSelector, defaultID = 0) {
    $(projectSelector).html("");
    $.ajax({
        url: "project_view/projects",
        type: "GET",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            response.forEach(function (project) {
                $(projectSelector).append(`<option value="${project.id}">${project.name}</option>`)
            })
            if (defaultID != 0) {
                $(projectSelector).val(defaultID);
            }
        }
    })

}

//Global variable for keeping track of what employees are currently selected.
var employeeMap = new Map();
var viewCalendarsEmployeeMap = new Map();

function populateEmployeeMap() {
    employeeMap = new Map();
    $.ajax({
        url: "employee/all",
        type: "GET",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            response.forEach(function (employee) {
                employeeMap.set(employee.personID, {
                    name: employee.name,
                    selected: false
                });

                viewCalendarsEmployeeMap.set(employee.personID, {
                    name: employee.name,
                    selected: false
                });
            })
        }

    })
}
/**
 * Helper function for populating the employee selector
 * 
 * Reads from global variable employeeMap
 */

function populateEmployeeSelector(optionsList, selectedList) {
    var optionsHTML = ""
    var selectedHTML = ""

    employeeMap.forEach(function (value, key, map) {

        if (value.selected) {
            selectedHTML = selectedHTML + `<li class="list-group-item selected-emp">${value.name}<button style="float: right;" type="button" class="close" value="${key}" onclick="removeFromSelEmployees(this.value, '${optionsList}', '${selectedList}')"><i class="fa fa-times"></i></button></li>`
        } else {
            optionsHTML = optionsHTML + `<option value="${key}">${value.name}</option>`
        }
    })

    if (selectedHTML == "") {
        $("#addActivityEmpHolderText").show()
    } else {
        $("#addActivityEmpHolderText").hide()
    }

    $(optionsList).html(optionsHTML)
    $(selectedList).html(selectedHTML)
}
/**
 * Function for selecting employees. Is called from the add employee button
 * 
 * Changes global variable employeeMap
 */
function addEmployeeToSelectedEmployees(optionsList, selectedList) {
    employeeMap.get($(optionsList).val()).selected = true;
    populateEmployeeSelector(optionsList, selectedList);
}
/**
 * Fucntion for un-selecting employees. Is called from the 'remove' button.
 * 
 * Changes global variable employeeMap
 * @param {string} id The affected employee 
 */
function removeFromSelEmployees(id, optionsList, selectedList) {
    employeeMap.get(id).selected = false;
    populateEmployeeSelector(optionsList, selectedList);
}
/**
 * Spawns a modal prompting the user to add an activity.
 * 
 * Changed global variable employeeMap
 */

// TODO: Skulle eventuellt kunna flyttas till en annan fil innehållande saker relaterade till aktiviterer.
function spawnAddActivityModal() {
    employeeMap.forEach(function (value) {
        value.selected = false;
    })
    $("#addActivityModal").modal("show")
    populateProjectsDropdown("#addActivityProjectSelector");
    populateEmployeeSelector("#addActivityEmployeeSelector", "#addActivitySelectedEmployeeList");

    updateDateOrTimePicker("#addActivityStartDatePicker");
    updateDateOrTimePicker("#addActivityStartTimePicker");
    updateDateOrTimePicker("#addActivityStopDatePicker");
    updateDateOrTimePicker("#addActivityStopTimePicker");
}

/**
 * Function called by the submit button.
 * 
 * Reads from global variable employeeMap
 */
function addActivity() {
    var selectedEmployees = [];
    var notSelectedEmployees = [];
    var allEmployees = []
    employeeMap.forEach(function (value, key) {
        if (value.selected == true) {
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

    if ($("#addActivitySomeButton:checked").val() && (selectedEmployees.length > 0)) {
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
 * Helper function for populating the employee selector for the view calendar modal. 
 * 
 * Reads from global variable viewCalendarsEmployeeMap
 */

function populateEmployeeSelectorCal() {
    $("#viewCalendarsEmpSelGroup").show()
    $("#viewCalendarsSelectedEmployeeList").show()
    var selectHTML = ""
    var selectedHTML = ""

    viewCalendarsEmployeeMap.forEach(function (value, key, map) {

        if (value.selected) {
            selectedHTML = selectedHTML + `<li class="list-group-item selected-emp">${value.name}<button style="float: right;" type="button" class="close" value="${key}" onclick="removeFromSelEmployeesCal(this.value)"><i class="fa fa-times"></i></button></li>`
        } else {
            selectHTML = selectHTML + `<option value="${key}">${value.name}</option>`
        }
    })

    if (selectedHTML == "") {
        $("#viewCalendarsEmpHolderText").show()
        $("#viewSchedulesConfirmButton").addClass('disabled')
        $("#viewSchedulesConfirmButton").tooltip('enable')

    } else {
        $("#viewCalendarsEmpHolderText").hide()
        $("#viewSchedulesConfirmButton").removeClass('disabled')
        $("#viewSchedulesConfirmButton").tooltip('disable')

    }
    $("#viewCalendarsSelectedEmployeeList").html(selectedHTML)
    $("#viewCalendarsEmployeeSelector").html(selectHTML)
}
/**
 * Function for adding employees to the selected employees. Should only be called from the add employee button
 * 
 * Reads from global variable viewCalendarsEmployeeMap
 */
function addEmployeeToSelectedEmployeesCal() {
    viewCalendarsEmployeeMap.get($("#viewCalendarsEmployeeSelector").val()).selected = true;
    populateEmployeeSelectorCal();
}
/**
 * Removes an employee from the selected employees. Should only be called from the remove employee button.
 * 
 * Changes global variable viewCalendarsEmployeeMap
 * @param {string} id The id of the employee
 */
function removeFromSelEmployeesCal(id) {
    viewCalendarsEmployeeMap.get(id).selected = false;
    populateEmployeeSelectorCal();
}
/**
 * Spawns a modal for selecting what employees caledars should be viewed.
 * 
 * Changes global variable viewCalendarsEmployeeMap
 */
function spawnViewCalendarsModal() {
    $("#viewCalendarsModal").modal("show")
    populateEmployeeSelectorCal()
}

/**
 * Changed the calendars eventSources to the selected employees. 
 * 
 * Uses global variable viewCalendarsEmployeeMap for determining what employees are currently selected.
 */
function viewCalendars() {
    if (!$("#viewSchedulesConfirmButton").hasClass('disabled')) {
        calendar.getEventSources().forEach(s => s.remove());
        var colorIndex = 0;
        viewCalendarsEmployeeMap.forEach(function (value, key, map) {
            if (value.selected) {
                calendar.addEventSource({
                    events: function (info, callback) {
                        $.ajax({
                            url: `/activity/${key}/feed?start=${info.startStr}&end=${info.endStr}`,
                            type: 'GET',
                            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
                            success: function (response) {
                                response.forEach(element => element.url = "#")
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
}

/**
 * Front end functionality for removing an activity.
 * @param {number} id id of the activity to be removed.
 */
function removeActivity(id) {
    $.ajax({
        url: 'activity/' + id,
        type: 'DELETE',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            $("#activityInfoModal").modal("hide");
            spawnAlert("Aktiviteten togs bort", "warning")
            calendar.refetchEvents()
            //calendar.render()
        }
    })
}

function spawnChangeActivityModal(activityID) {
    $("#activityInfoModal").modal("hide");
    $("#changeActivityModal").modal("show");

    $.ajax({
        url: `activity/${activityID}`,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            $("#changeActivityModalTitle").append(response.name);
            employeeMap.forEach(function (val) {
                val.selected = false;
            })
            response.employees.forEach(function (emp) {
                employeeMap.get(emp.personID).selected = true;
            })
            $("#changeActivityName").val(response.name);
            $("#changeActivityLocation").val(response.location);
            $("#changeActivityDescription").val(response.description);
            populateProjectsDropdown("#changeActivityProjectSelector", response.project.id);
            populateEmployeeSelector("#changeActivityEmployeeSelector", "#changeActivitySelectedEmployeeList");

            $("#changeActivitySubmitButton").val(activityID);
            updateDateOrTimePicker("#changeActivityStartDatePicker", moment(response.startTime));
            updateDateOrTimePicker("#changeActivityStartTimePicker", moment(response.startTime));
            updateDateOrTimePicker("#changeActivityStopDatePicker", moment(response.stopTime));
            updateDateOrTimePicker("#changeActivityStopTimePicker", moment(response.stopTime));

            console.log(response.startTime, response.stopTime);
        }
    });
}

function changeActivity(id) {
    console.log(id);
    var selectedEmployees = [];
    employeeMap.forEach(function (value, key) {
        if (value.selected == true) {
            selectedEmployees.push(key);
        }
    })

    var name = $("#changeActivityName").val();
    var date = $("#changeActivityStartDatePicker").datetimepicker('date').toISOString(true).substring(0, 10)
    var startTime = $("#changeActivityStartDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#changeActivityStartTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var stopTime = $("#changeActivityStopDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#changeActivityStopTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var loc = $("#changeActivityLocation").val()
    var description = $("#changeActivityDescription").val()
    //TODO: Ta fram projekt med en hashmap och populera den från servern med data.
    //TODO: Samma sak med employees
    var project_id = $("#changeActivityProjectSelector").val()
    var activityData;

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

    $.ajax({
        url: 'activity/' + id,
        type: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        data: activityData,
        success: function (response) {
            $("#changeActivityModal").modal("hide");
            spawnAlert("Aktiviteten har ändrats", "warning")
            calendar.refetchEvents()
        },
        error: function (response) {
            console.log("error")
        }
    })
}