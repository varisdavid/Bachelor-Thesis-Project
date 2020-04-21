function changeToProfileView(){
    var personID = JSON.parse(sessionStorage.getItem('auth')).person_id;
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/employee/' + personID,
        type: 'GET',
        success: function(employee) {
            $("#employeeName").replaceWith("<h3>"+employee.name+"</h3>"); 
            writeForm(personID, employee);
        }
    });
    $("#mainView").html($("#profileView").html())
}

function writeForm(personID,employee){
    $("#form-namn").replaceWith("<input class='form-control' id='form-namn' type='text' value='"+employee.name+"'readonly></input>"); //readonly
    $("#form-pid").replaceWith("<input class='form-control' id='form-pid' type='text' value='"+personID+"'readonly></input>");
    $("#form-company").replaceWith("<input class='form-control' id='form-company' type='text' value='"+employee.company+"'readonly></input>"); 
    $("#changeEmail").replaceWith("<input type='email' class='form-control' id='changeEmail' value='"+employee.email+"'>"); 
    if (employee.isAdmin) {
        $("#profileIsAdmin").replaceWith("<input class='form-check-input' type='checkbox' id='profileIsAdmin' value='option1' checked>"); 
    } 
    if (employee.isBoss) {
        $("#profileIsBoss").replaceWith("<input class='form-check-input' type='checkbox' id='profileIsBoss' value='option1' checked>"); 
    }
}

function updateProfileInformation(){ 
    var personID = (JSON.parse(sessionStorage.getItem('auth')).person_id).toString();
    var name = (document.getElementById("form-namn").value).toString();
    var email = (document.getElementById("changeEmail").value).toString();
    var isAdmin = document.getElementById("profileIsAdmin").checked;
    var isBoss = document.getElementById("profileIsBoss").checked;
    var currentPassword = document.getElementById("currentPassword3").value
    var newPassword = document.getElementById("newPassword3").value
    var newPasswordRepeated = document.getElementById("repeatPassword3").value
    var employeeData = `
        {
        "name":"${name}",
        "email":"${email}",
        "personID":"${personID}",
        "isBoss": ${isBoss},
        "isAdmin": ${isAdmin}
    }`; 
    console.log();
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/employee/' + personID,
        type: 'PUT',
        // dataType: 'json',
        data: employeeData,
        contentType: 'application/json',
        success: function() {
            if (newPassword){
                changePasswordProfile(currentPassword,newPassword,newPasswordRepeated);
            }
            spawnAlert("Medarbetaren har redigerats", "success");
        }
    });
}

function changePasswordProfile(currentPassword, newPassword, newPasswordRepeated) {
    // console.log("asd")
    if (newPassword !== newPasswordRepeated) {
        document.getElementById("wrongNewPasswordAlert").hidden = false;
        document.getElementById("wrongOldPasswordAlert").hidden = true;
    } else {
        var passwordData = `
        {
            "currentPassword":"${currentPassword}",
            "newPassword":"${newPassword}"
        }
        `
        $.ajax({
            url: 'auth/change-password',
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
            data: passwordData,
            success: function(response) {
                // $("#changePasswordModal").modal("hide");
                spawnAlert("Lösenordet har ändrats")
            },
            error: function() {
                document.getElementById("wrongNewPasswordAlert").hidden = true;
                document.getElementById("wrongOldPasswordAlert").hidden = false;
            }
        })
    }
}

$(document).ready(function() {
    changeToProfileView(); 
    $("#updateProfileInformationButton").click(function(e) {
        e.preventDefault();
        updateProfileInformation(); 
    }) 
})