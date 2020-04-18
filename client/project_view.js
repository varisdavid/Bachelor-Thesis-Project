
/**
 * Function used for viewing the Projects page
 */

function changeToProjectView(){
    $("#projectListTab").empty()
    $.ajax({
        url: '/project_view/projects',
        type: 'GET',
        success: function (projects_json) {
            $("#projectListTab").empty()
            displayProjects(projects_json)
        }
    })
    $("#mainView").html($("#projectView").html())
}

function createNewProject(){
    var newProjectName = document.getElementById("formNewProjectName").value;
    var newProjectOrg = document.getElementById("formNewProjectOrg").value;

    var newProject = {
        name: newProjectName,
        companyOrgNumber: newProjectOrg
    }
    $.ajax({
        url: '/project_view/projects',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newProject),
        dataType: 'json',
        success: function() {
            $('#newProjectModal').find('#newProjectForm')[0].reset();
            $('#newProjectModal').modal('hide')   
            changeToProjectView()
        }
    })
}

function modalProjectUpdate(){
    projectName = document.getElementById('modalEditProjectName').value
    projectOrgNr = document.getElementById('modalEditProjectOrgNr').value
    projectId = document.getElementById('modalProjectId').value

    var newProject = {
        'name' : projectName,
        'companyOrgNumber' : projectOrgNr
    }
    $.ajax({
        url: '/project_view/projects/' + projectId,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(newProject),
        dataType: 'json',
        success: function() {
            $('#modalEditProject').modal('toggle')
            changeToProjectView()
        }
    })
}


function displayProjects(projects_json){
    $("#projectListTab").empty()
    var projectList = projects_json
    var fadeSpeed = 0
    for (project of projectList) {
        fadeSpeed = fadeSpeed + 1000
        projectName = project.name
        projectCompanyOrgNr = project.companyOrgNumber
        //Adds items to list
        $("#projectListTab").append('<span data-toggle="modal" data-target="#modalEditProject">'
        +'<a class="list-group-item list-group-item-action rounded-0 my-list-item"'
        + 'onclick=editProject(' + project.id + ') '
        + 'id=' + projectName + '>'
        + '<h1 class="display-4">'
        + projectName
        + '</h1></a>'
        +'</span>')
        //Fades in list
        $('#' + projectName).fadeIn(fadeSpeed);
    }
}

function editProject(project_id) {
    $.ajax({
        url: '/project_view/projects/' + project_id,
        type: 'GET',
        success: function (project) {
            $('#modalEditProject').find('#modalEditProjectName').val(project.name)
            $('#modalEditProject').find('#modalEditProjectOrgNr').val(project.companyOrgNumber)
            $('#modalEditProject').find('#modalProjectId').val(project.id)  

        }
    })
}

function removeProject() {
    project_id = document.getElementById('modalProjectId').value
    $.ajax({
        url: '/project_view/projects/' + project_id,
        type: 'DELETE',
        success: function (project) {
            changeToProjectView()       
        }
    })
}

function areYouSureCancel(){
    $('#areYouSureContainer').empty()
}

$( document ).ready(function() {
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