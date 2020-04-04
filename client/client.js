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
    changeToLandingPage();
    $("#brandButton").click(function (e) {
        changeToLandingPage();
    })
})