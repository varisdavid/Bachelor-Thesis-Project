/**
 * Function used for changing to the calendar view
 */
function changeToCalendarView() {
    $("#mainView").html($("#calendarView").html())
    console.log("asdS")

    $("#addActivityButton").click(function (e) {
        spawnAddActivityModal()
    })
    createCalendar();
}

/**
 * Function used for changing view to the "Register Company" view. 
 */
function changeToRegisterCompany() {
    $("#mainView").html($("#signUpView").html());

    $("#signUpButton").click(function (e) {
        signUpCompany()
    })
    $("#cancelSignUpButton").click(function (e) {
        changeToLandingPage()
    })
}
/**
 * Function used for changing view to the "Landing page" view
 */
function changeToLandingPage() {
    $("#mainView").html($("#landingPage").html())

    $(".becomeCustomerButton").click(function (e) {
        e.preventDefault();
        changeToRegisterCompany()
    })
}

$( document ).ready(function() {
    $("form :input").attr("autocomplete", "off");

    changeToLandingPage();
    $("#brandButton").click(function (e) {
        changeToLandingPage();
    })
<<<<<<< HEAD
    
    //Navbar links:
    $("#navbarScheduleLink").click(function (e) {
        changeToCalendarView()
=======

    //Navbar links:
    $("#navAboutLink").click(function (e) {
        $("#mainView").html($("#aboutView").html())
    })

    $("#navPriceLink").click(function (e) {
        $("#mainView").html($("#priceView").html())
    })

    $("#navContactLink").click(function (e) {
        $("#mainView").html($("#contactView").html())
    })

    $("#navSupportLink").click(function (e) {
        $("#mainView").html($("#supportView").html())
>>>>>>> origin/master
    })
})