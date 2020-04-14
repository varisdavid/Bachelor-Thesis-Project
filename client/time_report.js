function reportTime(){
    var projectID = document.getElementById('projectID').value;
    var startTime = document.getElementById('startTime').value;
    var endTime = document.getElementById('endTime').value;
    var comments = document.getElementById('comments').value;
    var reportdata = {
        projectID : projectID,
        startTime :startTime,
        endTime : endTime,
        comments : comments
    }

    $.ajax({
        url: 'http://localhost:5000' + '/time-report' + '/report_time',
        type: 'POST',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        contentType: 'application/json',
        data: JSON.stringify(reportdata),
        datatype: 'json',
        success: function(){
        }
    })
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
            createTimeChart(employee);
        }
    })
}

function createTimeChart(employee){
    $.ajax({
        url: 'http://localhost:5000' + '/time-report/time/' + employee,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        success: function(time){
            $("#timeChart").append("<canvas id='myChart'></canvas>" +
            "<script>" +
                "var ctx = document.getElementById('myChart').getContext('2d');" +
                "var myChart = new Chart(ctx, {" +
                    "type: 'bar'," +
                    "data: {" +
                        "labels: ['förra månaden', 'den här månaden']," +
                        "datasets: [{" +
                            "label: 'Arbetad tid'," +
                            "data: [" + time[0] + "," + time[1] + "]," +
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
