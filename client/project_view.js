
/**
 * Function used for viewing the Projects page
 */

function changeToProjectView() {
    $("#projectListTab").empty()
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/project_view/projects',
        type: 'GET',
        success: function (projects_json) {
            $("#activityListTab").empty()
            $("#projectListTab").empty()
            displayProjects(projects_json)
        }
    })
    $("#mainView").html($("#projectView").html())
}

function createNewProject() {
    var newProjectName = document.getElementById("formNewProjectName").value;
    var newProject = {
        name: newProjectName,
    }
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/project_view/projects',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newProject),
        dataType: 'json',
        success: function () {
            $('#newProjectModal').find('#newProjectForm')[0].reset();
            $('#newProjectModal').modal('hide')
            changeToProjectView()
        }
    })
}

function modalProjectUpdate() {
    projectName = document.getElementById('modalEditProjectName').value
    projectOrgNr = document.getElementById('modalEditProjectOrgNr').value
    projectId = document.getElementById('modalProjectId').value

    var newProject = {
        'name': projectName,
        'companyOrgNumber': projectOrgNr
    }
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/project_view/projects/' + projectId,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(newProject),
        dataType: 'json',
        success: function () {
            $('#modalEditProject').modal('toggle')
            changeToProjectView()
        }
    })
}


function displayProjects(projects_json) {
    //$("#projectListTab").empty()
    var projectList = projects_json
    var fadeSpeed = 1;
    for (project of projectList) {
        fadeSpeed += 1;
        //Adds items to list
        var html = `
        <span data-toggle="modal" data-target="#modalEditProject">
        <a class="list-group-item list-group-item-action rounded-0" onclick=editProject(${project.id}) id="${project.name}">
        <h4>${project.name}</h4></a></span>`

        $(html).appendTo("#projectListTab").hide().fadeIn(fadeSpeed * 130)
    }
}

function editProject(project_id) {
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/project_view/projects/' + project_id,
        type: 'GET',
        success: function (project) {
            $("#modalProjectInfoContainer").hide().fadeIn(200)
            $('#modalEditProject').find('#modalEditProjectName').val(project.name)
            $('#modalEditProject').find('#modalEditProjectOrgNr').val(project.companyOrgNumber)
            $('#modalEditProject').find('#modalProjectId').val(project.id)
            $("#modalTimeReportInfoContainer").hide()
            displayActivities(project.id)
        }
    })
}

function displayActivities(project_id) {
    $.ajax({
        url: '/project_view/projects/' + project_id + '/activities',
        type: 'GET',
        success: function (activityList) {
            var fadeSpeed = 1;
            if (activityList.length > 0) {
                $("#activityListTab").empty()
            }
            for (activity of activityList) {
                var html = `<a class="list-group-item list-group-item-action rounded-0" onclick=loadActivityInfo(${activity.id})>
                <h6>${activity.name}</h6></a>`
                //Adds items to list
                $(html).appendTo("#activityListTab").hide().fadeIn(fadeSpeed * 500)
                fadeSpeed += 1;
            }

        }
    })
}

function loadActivityInfo(activityID) {
    $.ajax({
        url: `activity/${activityID}`,
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {

            employeeString = "";
            response.employees.forEach(function (emp) {
                employeeString = employeeString + emp.name + "\n";
                console.log(employeeString)
            })
            var startTime = response.startTime.split("T")[1] + ", " + "<br>" + response.startTime.split("T")[0]
            var stopTime = response.stopTime.split("T")[1] + ", " + "<br>" + response.stopTime.split("T")[0]

            $("#projectActivityInfo").html(`
            <div>
                <div class="row">
                    <div class="col">
                        <h5 class="mt-2 pt-2 float-left">Aktivitet: ${response.name}</h5>
                        <button class="btn btn-danger mt-2 mr-0 float-right" onclick=removeActivity(${response.id, response.project_id})>Ta bort aktivitet</button>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-3">
                        <h6>Starttid </h6>
                        <p>${startTime}</p>
                    </div>
                    <div class="col-3">
                        <h6>Sluttid</h6>
                        <p>${stopTime}</p>
                    </div>
                    <div class="col-3">
                        <h6>Plats</h6>
                        <p>${response.location}</p>
                    </div>
                </div>
                <h5>Beskrivning</h5>
                <p>${response.description}</p>
                <h5>Anställda</h5>
                <div id="listOfEmployees">
                </div>
             </div>
             <div class="modal-footer">
             </div>
             `);
            response.employees.forEach(function (emp) {
                $("#listOfEmployees").append('<a class="list-group-item list-group-item-action rounded-0" '
                    + ' onclick=loadEmployeeHours(' + response.project_id + ',' + emp.personID + ')>'
                    + emp.name + '</a>')
            })
        },
        error: function (response) {
            console.log("error")
        }
    })
}

function loadEmployeeHours(project_id, employee_id) {
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/time-report/report_time/projects/' + project_id,
        type: 'GET',
        success: function (projectLoggedHours) {
            employeeTime = []
            for (timeReport of projectLoggedHours) {
                if (timeReport.employeeID == employee_id) {
                    employeeTime.push(timeReport)
                }
            }
            if (employeeTime == []) {
                return " ";
            }
            $("#modalProjectInfoContainer").hide()
            $("#modalTimeReportInfoContainer").html(`
                <div class="row">
                    <div class="col">
                        <h5 class="mt-2 pt-2 float-left">Rapporterad tid</h5>
                        <button class="btn btn-secondary mt-2 mr-0 float-right" onclick=editProject(${project_id})>Tillbaka</button>
                    </div>
                </div>
                <hr>
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Starttid</th>
                            <th scope="col">Sluttid</th>
                            <th scope="col">Kommentar</th>
                        </tr>
                    </thead>
                    <tbody id="reportTimeTableContents">
                        
                    </tbody>
                </table>
            `).hide().fadeIn(200);

            var count = 1;
            for (timeReport of employeeTime) {

                var html = `<tr>
                <th scope="row">${count}</th>
                <td>${timeReport.startTime}</td>
                <td>${timeReport.endTime}</td>
                <td>${timeReport.comment}</td>
                </tr>`
                $(html).appendTo("#reportTimeTableContents").hide().fadeIn(count * 150)
                count += 1;
            }
        }
    })
}

function removeProject() {
    project_id = document.getElementById('modalProjectId').value
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/project_view/projects/' + project_id,
        type: 'DELETE',
        success: function (project) {
            changeToProjectView()
        }
    })
}

function areYouSureCancel() {
    $('#areYouSureContainer').empty()
}

function removeActivity(activity_id, project_id) {
    $.ajax({
        url: 'activity/' + activity_id,
        type: 'DELETE',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function (response) {
            spawnAlert("Aktiviteten togs bort", "warning")
            $("#activityListTab").empty()
            displayActivities(project_id)
        }
    })
}

$(document).ready(function () {
    $("#modalEditProjectButtonSubmit").click(function (e) {
        modalProjectUpdate();
    })

    $("#modalRemoveProjectBtn").click(function (e) {
        $("#areYouSureContainer").html($("#areYouSureConfirm").html())
    })

    $("#modalNewProjectButton").click(function (e) {
        createNewProject();
    })

    $("#modalTimeReportBackBtn").click(function (e) {
        console.log("KÖöörd")
        editProject(project_id)
    });

    $('#modalEditProject').on('hidden.bs.modal', function () {
        $('#areYouSureContainer').empty()
        $("#modalProjectInfoContainer").show()
        $("#modalTimeReportInfoContainer").hide()
        $("#activityListTab").html(`<p class="font-italic mt-auto mb-auto">Det finns inga aktiviteter på det här projektet</p>`);
        $("#projectActivityInfo").html(`<p class="font-italic mt-2 pt-2">Klicka på en aktivitet för att visa information</p>`)
    })
})