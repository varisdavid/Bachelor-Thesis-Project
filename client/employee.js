function loadEmployees() {
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        url: 'http://127.0.0.1:5000/employee/all',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function(employees) {
            console.log("EMPLOYEE/ALL SUCCESS");
            for (employee of employees) {
                $('#car-table').append("<tr><td>" +
                    employee.personID + "</td><td>" +
                    employee.name + "</td><td>" +
                    employee.isAdmin + "</td><td>" +
                    employee.isBoss + "</td><td>" +
                    "</td><td>" +
                    "</td><td>" +
                    "<button id = 'book-button' class = 'btn btn-primary'> Redigera </button>" +
                    "</td></tr>");
            }
        }
    })
}