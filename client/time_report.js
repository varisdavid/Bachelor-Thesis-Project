function reportTime(){
    var projectID = document.getElementById('projectID').value;
    var startTime = document.getElementById('startTime').value;
    var endTime = document.getElementById('endTime').value;
    var reportdata = {
        projectID : projectID,
        startTime :startTime,
        endTime : endTime
    }

    $.ajax({
        url: 'http://localhost:5000' + '/time-report' + '/report_time',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(reportdata),
        datatype: 'json',
        success: function(){
        }
    })
}