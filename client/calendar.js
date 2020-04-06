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
 * Spawns a modal promting the user to add an activity.
 */

// TODO: Skulle eventuellt kunna flyttas till en annan fil innehållande saker relaterade till aktiviterer.
function spawnAddActivityModal() {
    $("#addActivityModal").modal("show")
    $(function () {
        $(function () {
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
                startDate = $("#addActivityStartDatePicker").datetimepicker('date')
                stopDate = $("#addActivityStopDatePicker").datetimepicker('date')
                startTime = $("#addActivityStartTimePicker").datetimepicker('date')
                stopTime = $("#addActivityStopTimePicker").datetimepicker('date')

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
        });
    });

    $("#addActivitySubmitButton").click(function (e) {

    })
}