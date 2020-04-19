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

function spawnTimeReportModal(){
    $("#timeReportModal").modal("show")
    $(activateDateAndTimePickers("#addTimeReportStartDatePicker", "#addTimeReportStartTimePicker", "#addTimeReportStopDatePicker", "#addTimeReportStopTimePicker", "#addTimeReportWrongDateAlert"));
    getProjectsDropdown()

}

function getEmployees() {
    $.ajax({
        url: 'http://localhost:5000' + '/employee/all',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(employees){
            for (i in employees) {
                $("#users").append("<a class='dropdown-item' onclick=getLoggedJobs(" + employees[i].personID + ") href='#'>" + employees[i].name + "</a>")
            }
        }
    })
}

function getLoggedJobs(employee) {
    $("#mainView").html($("#timeOverviewView").html())
    getEmployees()
    $.ajax({
        url: 'http://localhost:5000' + '/time-report/' + employee,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(jobs){
            for (i in jobs) {
                $("#loggedJobs").append("<div class='card bg-light mb-3' style='width: 18rem;'>" +
                "<div class='card-body' id='loggedJobs'>" +
                "<h5 class='card-title'>" +"Medarbetare " + jobs[i].employeeID+ "</h5>" +
                "<p class='card-subtitle'>" + "Projekt: " + jobs[i].projectID + "</p>" +
                "<p class='card-text'>" + "Tid: " + jobs[i].startTime + "-" + jobs[i].endTime + "</p></div>");
            }
            createTimeChart();
        }
    })
}

function getMyWork() {
    $("#mainView").html($("#timeReportView").html())
    $.ajax({
        url: 'http://localhost:5000' + '/time-report/myWork',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(jobs){
            for (i in jobs) {
                $("#loggedJobs").append("<div class='card bg-light mb-3' style='width: 18rem;'>" +
                "<div class='card-body' id='loggedJobs'>" +
                "<h5 class='card-title'>" +"Medarbetare " + jobs[i].employeeID+ "</h5>" +
                "<p class='card-subtitle'>" + "Projekt: " + jobs[i].projectID + "</p>" +
                "<p class='card-text'>" + "Tid: " + jobs[i].startTime + "-" + jobs[i].endTime + "</p></div>");
            }
            createTimeChart();
        }
    })
}

function createTimeChart(){
    $.ajax({
        url: 'http://localhost:5000' + '/time-report/time',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(time){
            $("#timeChart").append("<canvas id='myChart'></canvas>" +
            "<script>" +
                "var ctx = document.getElementById('myChart').getContext('2d');" +
                "var myChart = new Chart(ctx, {" +
                    "type: 'bar'," +
                    "data: {" +
                        "labels: [" + getDates() + "]," +
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
    var n = d.getMonth();
    months.unshift(n);
    for (let i=1; i<6; i++){
        var x = n-i;
        if (x<1){
            var y = x + 12;
            months.unshift(y);
        }else{
            months.unshift(x);
        }        
    }
    return months;
}

function editLoggedWork(loggedWorkID){
    $.ajax({
        url: '/time-report/' + loggedWorkID,
        type: 'PUT',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(){
        }
    })
}

function deleteLoggedWork(loggedWorkID){
    $.ajax({
        url: '/time-report/' + loggedWorkID,
        type: 'DELETE',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(){
        }
    })
}