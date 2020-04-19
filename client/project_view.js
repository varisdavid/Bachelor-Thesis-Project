
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
    $("#projectListTab").empty()
    var projectList = projects_json
    var fadeSpeed = 0
    for (project of projectList) {
        fadeSpeed = fadeSpeed + 1000
        projectName = project.name
        projectCompanyOrgNr = project.companyOrgNumber
        //Adds items to list
        $("#projectListTab").append('<span data-toggle="modal" data-target="#modalEditProject">'
            + '<a class="list-group-item list-group-item-action rounded-0 my-list-item"'
            + 'onclick=editProject(' + project.id + ') '
            + 'id=' + projectName + '>'
            + '<h4>'
            + projectName
            + '</h4></a>'
            + '</span>')
        //Fades in list
        $('#' + projectName).fadeIn(fadeSpeed);
    }
}

function editProject(project_id) {
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/project_view/projects/' + project_id,
        type: 'GET',
        success: function (project) {

            $("#activityListTab").empty()
            $('#modalEditProject').find('#modalEditProjectName').val(project.name)
            $('#modalEditProject').find('#modalEditProjectOrgNr').val(project.companyOrgNumber)
            $('#modalEditProject').find('#modalProjectId').val(project.id)
            displayActivities(project.id)
        }
    })
}

function displayActivities(project_id) {
    $.ajax({
        url: '/project_view/projects/' + project_id + '/activities',
        type: 'GET',
        success: function (activityList) {
            for (activity of activityList) {
                $("#emptyList").empty()
                //Adds items to list
                $("#activityListTab").append('<a class="list-group-item list-group-item-action rounded-0 my-list-item" onclick=loadActivityInfo(' + activity.id + ')>'
                    + '<h6>'
                    + activity.name
                    + '</h6></a>')
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
                loadEmployeeHours(response.project_id,emp.id)
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
                $("#listOfEmployees").append('<a class="list-group-item list-group-item-action rounded-0 my-list-item" '
                + 'data-toggle="modal" data-target="#reportedTimeModal">' 
                + emp.name + '</a>')
            })
        },
        error: function (response) {
            console.log("error")
        }
    })
}

function loadEmployeeHours(project_id, employee_id){
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/time-report/report_time/projects/' + project_id,
        type: 'GET',
        success: function (projectLoggedHours) {
            
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

    //Removes are you sure message on close
    $('#modalEditProject').on('hidden.bs.modal', function () {
        $('#areYouSureContainer').empty()
    })
})