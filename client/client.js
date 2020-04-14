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

function changeToTimeOverview(){
    $("#mainView").html($("#timeOverviewView").html())
    getEmployees()
}
$( document ).ready(function() {
    changeToLandingPage();
    $("#brandButton").click(function (e) {
        changeToLandingPage();
    })

    //Navbar links:
    $("#navAboutLink").click(function (e) {
        $("#mainView").html($("#aboutView").html())
    })

    $("#navDashboardLink").click(function (e) {
        $("#mainView").html($("#dashboardView").html())
    })

    $("#navPriceLink").click(function (e) {
        $("#mainView").html($("#priceView").html())
    })

    $("#navContactLink").click(function (e) {
        $("#mainView").html($("#contactView").html())
    })

    $("#navSupportLink").click(function (e) {
        $("#mainView").html($("#supportView").html())
    })

    $("#navTimeReportLink").click(function (e) {
        $("#mainView").html($("#timeReportView").html())
    })

    $("#navTimeOverviewLink").click(function (e) {
        changeToTimeOverview()
    })

    $("#dashboardViewLink").click(function (e) {
        $("#mainView").html($("#dashboardView").html())
    })
})