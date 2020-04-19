/**
 * Function used for changing view to the "Register Company" view. 
 */
function changeToRegisterCompany() {
    $("#mainView").html($("#signUpView").html());

    $("#signUpButton").click(function(e) {
        signUpCompany()
    })
    $("#cancelSignUpButton").click(function(e) {
        changeToLandingPage()
    })
}
/**
 * Function used for changing view to the "Landing page" view
 */
function changeToLandingPage() {
    $("#mainView").html($("#landingPage").html())
    $("#becomeCustomerButton").click(function(e) {
        e.preventDefault();
        changeToRegisterCompany()
    })
}

$(document).ready(function() {
    $("#mainView").html($("#landingPage").html())


    $("#becomeCustomerButton").click(function(e) {
        e.preventDefault();
        changeToRegisterCompany()
    })

    $("#brandButton").click(function(e) {
        changeToLandingPage();
    })

    //Navbar links:
    $("#navbarScheduleLink").click(function(e) {
        changeToCalendarView()
    })

    $("#navAboutLink").click(function(e) {
        $("#mainView").html($("#aboutView").html())
    })

    $("#navPriceLink").click(function(e) {
        $("#mainView").html($("#priceView").html())
    })

    $("#navContactLink").click(function(e) {
        $("#mainView").html($("#contactView").html())
    })

    $("#navSupportLink").click(function(e) {
        $("#mainView").html($("#supportView").html())
    })

    $("#navEmployeeLink").click(function(e) {
        $("#mainView").html($("#employeeView").html())
        loadEmployees(); //In employee.js
    })

    $("#navProjectViewLink").click(function(e) {
        changeToProjectView()
    })

    // Marks current navbar selection
    var linkwrapper = document.getElementById("navbarNavAltMarkup");
    console.log(linkwrapper)
    var links = linkwrapper.getElementsByClassName("my-header-link");
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function() {
            var current = document.getElementsByClassName("active-link");
            current[0].className = current[0].className.replace(" active-link", "");
            this.className += " active-link";
        });
    }
})