


/**
 * Function used for validating a new project
 * */

var form = document.querySelector('.needs-validation');

form.addEventListener('button', function (event) {
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    }
    form.classList.add('was-validated')
    makeNewProject()
})

/**
 * Function for adding new projects
 */

$(document).ready(function () {
    $('button:last').click(function () {
        projektnamn = document.getElementById("projektnamn").value;
        $('.list-group').append("<li class='list-group-item'>" + projektnamn + "</li>");
    });
});