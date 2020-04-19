$('#editEmployeeModal').on('show.bs.modal', function(event) {
    var personID = event.relatedTarget.dataset['personid'];
    var modal = $(this);

    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/employee/' + personID,
        type: 'GET',
        success: function(employee) {
            modal.find('#editEmployeePid-input').val(personID);
            modal.find('#editEmployeeName-input').val(employee.name);
            modal.find('#editEmployeeEmail-input').val(employee.email);
            $('#editEmployeeisAdmin-input').prop('checked', employee.isAdmin);
            $('#editEmployeeisBoss-input').prop('checked', employee.isBoss);
            $('#editEmployeeSubmitButton').attr('onclick', 'editEmployee("' + personID + '")');
            $('#deleteEmployeeButton').attr('onclick', 'deleteEmployee("' + personID + '")');
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
            $('#employee-data').html('');
            $("#employeeTableSearchID").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $("#employee-data tr").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            $("#employeeTableSearchName").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $("#employee-data tr").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            $("#employeeTableSearchAdmin").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $("#employee-data tr").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            $("#employeeTableSearchBoss").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $("#employee-data tr").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            $("#employeeTableSearchProjekt").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $("#employee-data tr").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            $("#employeeTableSearchArbetadTid").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $("#employee-data tr").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            $(".dropdown-menu li a").click(function() {
                $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
                $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
                loadEmployees();
            });

            for (employee of employees) {
                if ($("#roleButton").val() == "Chef") {
                    if (employee.isBoss) {
                        $('#employee-data').append("<tr><td>" +
                            employee.personID + "</td><td>" +
                            employee.name + "</td><td>" +
                            employee.email + "</td><td>" +
                            "Chef" + "</td><td>" +
                            "</td><td>" +
                            "<button id= 'editEmployeeButton' value= 'employee.personID' class = 'btn btn-primary' type = 'button' data-toggle='modal' data-target='#editEmployeeModal' data-personID='" + employee.personID + "'>Redigera </button>" +
                            "</td></tr>");
                    }
                } else if ($("#roleButton").val() == "Medarbetare") {
                    if (!employee.isBoss) {
                        $('#employee-data').append("<tr><td>" +
                            employee.personID + "</td><td>" +
                            employee.name + "</td><td>" +
                            employee.email + "</td><td>" +
                            "Medarbetare" + "</td><td>" +
                            "</td><td>" +
                            "<button id= 'editEmployeeButton' value= 'employee.personID' class = 'btn btn-primary' type = 'button' data-toggle='modal' data-target='#editEmployeeModal' data-personID='" + employee.personID + "'>Redigera </button>" +
                            "</td></tr>");
                    }
                } else {
                    if (employee.isBoss) {
                        $('#employee-data').append("<tr><td>" +
                            employee.personID + "</td><td>" +
                            employee.name + "</td><td>" +
                            employee.email + "</td><td>" +
                            "Chef" + "</td><td>" +
                            "</td><td>" +
                            "<button id= 'editEmployeeButton' value= 'employee.personID' class = 'btn btn-primary'  type = 'button' data-toggle='modal' data-target='#editEmployeeModal' data-personID='" + employee.personID + "'>Redigera </button>" +
                            "</td></tr>");
                    } else {
                        $('#employee-data').append("<tr><td>" +
                            employee.personID + "</td><td>" +
                            employee.name + "</td><td>" +
                            employee.email + "</td><td>" +
                            "Medarbetare" + "</td><td>" +
                            "</td><td>" +
                            "<button id= 'editEmployeeButton' value= 'employee.personID' class = 'btn btn-primary'  type = 'button' data-toggle='modal' data-target='#editEmployeeModal' data-personID='" + employee.personID + "'>Redigera </button>" +
                            "</td></tr>");
                    }
                }



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
    var isAdmin = document.getElementById("addEmployeeisAdmin-input").checked;
    var isBoss = document.getElementById("addEmployeeisBoss-input").checked;
    var employeeData = `
    {
        "name":"${name}",
        "email":"${email}",
        "personID":"${personID}",
        "isBoss": ${isBoss},
        "isAdmin": ${isAdmin}
    }`
    console.log(employeeData);
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
    var isAdmin = document.getElementById("editEmployeeisAdmin-input").checked;
    var isBoss = document.getElementById("editEmployeeisBoss-input").checked;
    var employeeData = `
    {
        "name":"${name}",
        "email":"${email}",
        "personID":"${personID}",
        "isBoss": ${isBoss},
        "isAdmin": ${isAdmin}
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
            spawnAlert("Medarbetaren har redigerats", "success");
            loadEmployees();
        }
    });
}

function deleteEmployee(personID) {
    console.log(personID);
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/employee/' + personID,
        type: 'DELETE',
        success: function() {
            $("#editEmployeeModal").modal("hide");
            spawnAlert("Medarbetaren har raderats", "success");
            loadEmployees();
        }
    });
}