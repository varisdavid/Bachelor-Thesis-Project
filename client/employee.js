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
            $('#editEmployeeisBoss-input').prop('checked', employee.isBoss);
            $('#editEmployeeisAdmin-input').prop('checked', employee.isAdmin);
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

            for (employee of employees) {
                $('#employee-data').append("<tr><td>" +
                    employee.personID + "</td><td>" +
                    employee.name + "</td><td>" +
                    employee.isAdmin + "</td><td>" +
                    "</td><td>" +
                    "</td><td>" +
                    "</td><td>" +
                    "<button id= 'editEmployeeButton' value= 'employee.personID' class = 'btn btn-secondary' type = 'button' data-toggle='modal' data-target='#editEmployeeModal' data-personID='" + employee.personID + "'>Redigera </button>" +
                    "</td></tr>");
            }
        }
    })
}

function editEmployee(personID) {
    var name = document.getElementById("editEmployeeName-input").value;
    var email = document.getElementById("editEmployeeEmail-input").value;
    var isAdmin = document.getElementById("editEmployeeisAdmin-input").checked;
    var isBoss = document.getElementById("editEmployeeisBoss-input").checked;
    console.log("name: " + name + "; email: " + email + "; Admin: " + isAdmin + "; Boss: " + isBoss);
    var employeeData = `
    {
        "name":"${name}",
        "email":"${email}",
        "personID":"${personID}",
        "isBoss": ${isAdmin},
        "isAdmin": ${isBoss}
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