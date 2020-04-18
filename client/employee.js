$('#editEmployeeModal').on('show.bs.modal', function(event) {
    console.log("NU KÖRS DEN HÄR SKITEN");
    console.log("Det här är ett kristet projekt!")
    var personID = event.relatedTarget.dataset['personid'];
    var modal = $(this);
    console.log("PERSON-ID: " + personID)

    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/employee/' + personID,
        type: 'GET',
        success: function(employee) {
            modal.find('#editEmployeePid-input').val(personID);
            modal.find('#editEmployeeName-input').val(employee.name);
            modal.find('#editEmployeeEmail-input').val(employee.email);
            console.log(personID);
            console.log(employee.name);
            console.log(employee.email);
            $('#editEmployeeSubmitButton').attr('onclick', 'editEmployee("' + personID + '")')
        }
    });
});

$('#editEmployeeModal').on('hidden.bs.modal', function(event) {
    $(this).find('#editEmployeePid-input').val('');
    $(this).find('#editEmployeeName-input').val('');
    $(this).find('#editEmployeeEmail-input').val('');
});


function loadEmployees() {
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/employee/all',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function(employees) {
            console.log("EMPLOYEE/ALL SUCCESS");
            $('#employee-data').html('');
            for (employee of employees) {
                $('#employee-data').append("<tr><td>" +
                    employee.personID + "</td><td>" +
                    employee.name + "</td><td>" +
                    employee.isAdmin + "</td><td>" +
                    employee.isBoss + "</td><td>" +
                    "</td><td>" +
                    "</td><td>" +
                    "<button id= 'editEmployeeButton' value= 'employee.personID' class = 'btn btn-secondary' type = 'button' data-toggle='modal' data-target='#editEmployeeModal' data-personID='" + employee.personID + "'>Redigera </button>" +
                    "</td></tr>");
            }
        }
    })
}

/**
 * Adds an employee to the database.
 */
function addEmployee() {
    var name = document.getElementById("addEmployeeName").value
    var email = document.getElementById("addEmployeeEmail").value
    var personID = document.getElementById("addEmployeePid").value
    var employeeData = `
    {
        "name":"${name}",
        "email":"${email}",
        "personID":"${personID}"
    }
    `
    $.ajax({
        url: 'employee/all',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        data: employeeData,
        success: function(response) {
            $('#addEmployeeModal').find('#addEmployeeForm')[0].reset();
            $("#addEmployeeModal").modal("hide");
            spawnAlert("Medarbetaren har lagts till", "success")
            loadEmployees()
        }
    })
}

function editEmployee(personID) {
    var name = document.getElementById("editEmployeeName-input").value;
    var email = document.getElementById("editEmployeeEmail-input").value;
    console.log("name: " + name + "; email: " + email);
    var employeeData = `
    {
        "name":"${name}",
        "email":"${email}",
        "personID":"${personID}",
        "isBoss": true,
        "isAdmin": true
    }`
    console.log(employeeData);
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/employee/' + personID,
        type: 'PUT',
        dataType: 'json',
        data: employeeData,
        contentType: 'application/json',
        success: function() {
            $("#editEmployeeModal").modal("hide");
            spawnAlert("Medarbetaren har redigerats", "success")
            loadEmployees();
        }
    });
}