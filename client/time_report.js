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
        url: '/time-report/report_time',
        type: 'POST',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
        contentType: 'application/json',
        data: JSON.stringify(reportdata),
        datatype: 'json',
        success: function(){
        }
    })
}