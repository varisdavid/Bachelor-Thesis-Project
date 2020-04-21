function reportTime(){
    var projectID = document.getElementById('addProjectSelector').value;
    var startTime = $("#addTimeReportStartDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#addTimeReportStartTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var endTime = $("#addTimeReportStopDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#addTimeReportStopTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var comments = document.getElementById('comments').value;
    var reportdata = {
        projectID : projectID,
        startTime :startTime,
        endTime : endTime,
        comments : comments
    }

    $.ajax({
        url: '/time-report/report_time',
        type: 'POST',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        contentType: 'application/json',
        data: JSON.stringify(reportdata),
        datatype: 'json',
        success: function(){
            getMyWork()
        }
    })
}

function getProjectsDropdown() {
    //Hämta alla projekt genom ett ajax-anrop
    //Currently using stub
    //Populating projects
    $("#addProjectSelector").html("");
    $.ajax({
        url: "project_view/projects",
        type: "GET",
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            response.forEach(function (project) {
                $("#addProjectSelector").append(`<option value="${project.id}">${project.name}</option>`)
            })
        }
    })
    
}


$(document).ready(function () {
    //Activating date and time pickers
    activateDateAndTimePickers("#addTimeReportStartDatePicker", "#addTimeReportStartTimePicker", "#addTimeReportStopDatePicker", "#addTimeReportStopTimePicker", "#addTimeReportWrongDateAlert", false);
    activateDateAndTimePickers("#changeLoggedWorkStartDatePicker", "#changeLoggedWorkStartTimePicker", "#changeLoggedWorkStopDatePicker", "#changeLoggedWorkStopTimePicker", "#changeLoggedWorkWrongDateAlert", true);
})

function spawnTimeReportModal(){
    $("#timeReportModal").modal("show")
    getProjectsDropdown()

}

function getEmployees() {
    $.ajax({
        url: '/employee/all',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(employees){
            for (i in employees) {
                if (!employees[i].isAdmin){
                    $("#users").append("<a class='dropdown-item' onclick=getLoggedJobs(" + employees[i].personID + ") data-value= " + employees[i].name + " href='#'>" + employees[i].name + "</a>")
            }
            }
            $("#users").click(function() {
                $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
                $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
                getEmployees();
            });
        }
    })
}

function getLoggedJobs(employee) {
    $("#mainView").html($("#timeOverviewView").html())
    getEmployees()
    $.ajax({
        url: '/time-report/employee/' + employee,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(jobs){
                $("#loggedJobs").append("<table class='table table-sm' id='workTable'>" +
                "<thead><tr>" +
                    "<th scope='col'>Projekt</th>" +
                    "<th scope='col'>Datum</th>" +
                    "<th scope='col'>Tid</th>" +
                  "</tr></thead>" +
                "<tbody></tbody></table>");
                for (i in jobs) {
                    getLoggedWork(jobs[i]);
                }
            createTimeChart(employee);
        }
    }) }

function getMyWork() {
    $("#mainView").html($("#timeReportView").html())
    $.ajax({
        url: '/time-report/myWork',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(jobs){
            $("#loggedJobs").append("<table class='table table-sm' id='workTable'>" +
            "<thead><tr>" +
                "<th scope='col'>Projekt</th>" +
                "<th scope='col'>Datum</th>" +
                "<th scope='col'>Tid</th>" +
              "</tr></thead>" +
            "<tbody></tbody></table>");
            for (i in jobs) {
                getLoggedWork(jobs[i]);
            }
            createMyTimeChart();
        }
    })
}

function getLoggedWork(work){
    $.ajax({
        url: '/time-report/getWorkedTime/' + work.id,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(time){
            $("#workTable").append("<tr><th scope='row'>" + work.projectID + "</th>" +
            "<td>" + work.startTime.substring(5,11) + "</td>" +
            "<td>"+ time +  
            "</td><td>" +
            "<button id= 'editLoggedWorkButton' value= 'work.id' class = 'btn btn-primary'  type = 'button' data-toggle='modal' data-target='#editLoggedWorkModal' onclick=spawnChangeLoggedWorkModal(" + work.id + ") data-workID='" + work.id + "'>Redigera </button>" + 
            "</td></tr>" );
}})
}

function createMyTimeChart(){
    $.ajax({
        url: '/time-report/time',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(time){
            $("#timeChart").append("<canvas id='myChart'></canvas>" +
            "<script>" +
                "var ctx = document.getElementById('myChart').getContext('2d');" +
                "var myChart = new Chart(ctx, {" +
                    "type: 'bar'," +
                    "data: {" +
                        "labels: [" + JSON.stringify(getDates()[0]) + "," + JSON.stringify(getDates()[1]) + "," + JSON.stringify(getDates()[2]) + "," + JSON.stringify(getDates()[3]) + "," + JSON.stringify(getDates()[4]) + "," + JSON.stringify(getDates()[5]) + "]," +
                        "datasets: [{" +
                            "label: 'Arbetad tid'," +
                            "data: [" + time[0] + "," + time[1] + "," + time[2] + "," + time[3] + "," + time[4] + "," + time[5] + "]," +
                        "}]" +
                    "}," +
                    "options: {scales: {" +
                        "yAxes: [{" +
                            "ticks: {" +
                                "min: 0" +
                            "}}]" +
                    "}}" +
                "});" +
            "</script>");
        }
        })
}

function createTimeChart(employee){
    $.ajax({
        url: '/time-report/time/' + employee,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(time){
            $("#timeChart").append("<canvas id='myChart'></canvas>" +
            "<script>" +
                "var ctx = document.getElementById('myChart').getContext('2d');" +
                "var myChart = new Chart(ctx, {" +
                    "type: 'bar'," +
                    "data: {" +
                        "labels: [" + JSON.stringify(getDates()[0]) + "," + JSON.stringify(getDates()[1]) + "," + JSON.stringify(getDates()[2]) + "," + JSON.stringify(getDates()[3]) + "," + JSON.stringify(getDates()[4]) + "," + JSON.stringify(getDates()[5]) + "]," +
                        "datasets: [{" +
                            "label: 'Arbetad tid'," +
                            "data: [" + time[0] + "," + time[1] + "," + time[2] + "," + time[3] + "," + time[4] + "," + time[5] + "]," +
                        "}]" +
                    "}," +
                    "options: {scales: {" +
                        "yAxes: [{" +
                            "ticks: {" +
                                "min: 0" +
                            "}}]" +
                    "}}" +
                "});" +
            "</script>");
        }
        })
}

function getDates(){
    var d = new Date();
    var months = [];
    var month = new Array();
    month[1] = "Januari";
    month[2] = "Februari";
    month[3] = "Mars";
    month[4] = "April";
    month[5] = "Maj";
    month[6] = "Juni";
    month[7] = "Juli";
    month[8] = "Augusti";
    month[9] = "September";
    month[10] = "Oktober";
    month[11] = "November";
    month[12] = "December";
    var n = d.getMonth() + 1;
    months.unshift(month[n]);
    for (let i=1; i<6; i++){
        var x = n-i;
        if (x<1){
            var y = x + 12;
            months.unshift(month[y]);
        }else{
            months.unshift(month[x]);
        }        
    }
    return months;
}

function editLoggedWork(loggedWorkID){
    var projectID = document.getElementById('changeLoggedWorkProjectSelector').value;
    var startTime = $("#changeLoggedWorkStartDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#changeLoggedWorkStartTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var endTime = $("#changeLoggedWorkStopDatePicker").datetimepicker('date').toISOString(true).substring(0, 11) + $("#changeLoggedWorkStopTimePicker").datetimepicker('date').toISOString(true).substring(11, 19)
    var comments = document.getElementById('changeLoggedWorkComments').value;
    var changedReportdata = {
        projectID : projectID,
        startTime :startTime,
        endTime : endTime,
        comments : comments}
    $.ajax({
        url: '/time-report/' + loggedWorkID,
        type: 'PUT',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        contentType: 'application/json',
        data: JSON.stringify(changedReportdata),
        datatype: 'json',
        success: function(response){
            $("#editLoggedWorkModal").modal("hide");
            if (response[0].isAdmin){
                getLoggedJobs(response[1].personID);
                console.log("tjenare mannen")
            }else{
                getMyWork();
            }
        }
    })
}

function deleteLoggedWork(loggedWorkID){
    $.ajax({
        url: '/time-report/' + loggedWorkID,
        type: 'DELETE',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(response){
            $("#editLoggedWorkModal").modal("hide");
            if (response[0].isAdmin){
                getLoggedJobs(response[1].personID);
                console.log("tjenare mannen")
            }else{
                getMyWork();
            }
        }
    })
}


function spawnChangeLoggedWorkModal(workID) {
    $("#editLoggedWorkModal").modal("show");
    console.log("tjena")
    console.log(workID)
    $.ajax({
        url: 'time-report/' + workID,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            populateProjectsDropdown("#changeLoggedWorkProjectSelector", response.projectID);
            $("#editLoggedWorkSubmitButton").val(response.id);
            $("#deleteLoggedWorkButton").val(response.id);
            updateDateOrTimePicker("#changeLoggedWorkStartDatePicker", moment(response.startTime));
            updateDateOrTimePicker("#changeLoggedWorkStartTimePicker", moment(response.startTime));
            updateDateOrTimePicker("#changeLoggedWorkStopDatePicker", moment(response.endTime));
            updateDateOrTimePicker("#changeLoggedWorkStopTimePicker", moment(response.endTime));
            $("#changeLoggedWorkComments").val(response.comment);
            console.log(response.startTime);
            console.log(response.endTime);
            console.log(response.comment)
        }
    });
}