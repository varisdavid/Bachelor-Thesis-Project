function reportTime() {
    var projectID = document.getElementById('projectID').value;
    var startTime = document.getElementById('startTime').value;
    var endTime = document.getElementById('endTime').value;
    var comments = document.getElementById('comments').value;
    var reportdata = {
        projectID: projectID,
        startTime: startTime,
        endTime: endTime,
        comments: comments
    }

    $.ajax({
        url: '/time-report/report_time',
        type: 'POST',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        contentType: 'application/json',
        data: JSON.stringify(reportdata),
        datatype: 'json',
        success: function() {}
    })
}

function getEmployees() {
    $.ajax({
        url: 'http://localhost:5000' + '/employee/all',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function(employees) {
            for (i in employees) {
                if (!employees[i].isAdmin) {
                    $("#users").append("<a class='dropdown-item' onclick=getLoggedJobs(" + employees[i].personID + ") href='#'>" + employees[i].name + "</a>")
                }
            }
        }
    })
}