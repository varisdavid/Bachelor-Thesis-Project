function loadEmployees() {
    $.ajax({
        //headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token },
        url: 'http://127.0.0.1:5000/employee/all',
        type: 'GET',
        success: function(employees) {
            console.log("EMPLOYEE/ALL SUCCESS");
            for (employee of employees) {
                $('#car-table').append("<tr><td>" +
                    employee.personID + "</td><td>" +
                    employee.name + "</td><td>" +
                    employee.isAdmin + "</td><td>" +
                    employee.isBoss + "</td><td>" +
                    "<button id = 'book-button' class = 'btn btn-primary'> Booked by " + car.user.name + "</button>" +
                    "<button id = 'unbook-button' class = 'btn btn-danger' onclick = 'unbook_car(" + car.id + ")'> Unbook </button>" +
                    "</td></tr>");
            }
        }
    })
}