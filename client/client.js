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
    var auth = sessionStorage.getItem('auth');
    if (!(auth === null)) {
        $.ajax({
            url: 'http://localhost:5000' + '/employee/getUser',
            type: 'GET',
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token},
            success: function(user){
                if (user.isAdmin){
                    $("#mainView").html($("#adminHomepageView").html())
                } 
                else if (user.isBoss) {
                    $("#mainView").html($("#bossHomepageView").html())
                } 
                else {
                    $("#mainView").html($("#workerHomepageView").html())
                }
            }
        })
    }else{
        $("#mainView").html($("#landingPage").html())
        $("#becomeCustomerButton").click(function(e) {
        e.preventDefault();
        changeToRegisterCompany()
    })
    }
}

function changeToTimeOverview(){
    $("#mainView").html($("#timeOverviewView").html())
    getEmployees()
}

function changeToTimeReport(){
    $("#mainView").html($("#timeReportView").html())
    getMyWork()
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

    $("#navTimeOverviewLink").click(function (e) {
        changeToTimeOverview()
    })

    $("#navTimeReportLink").click(function (e) {
        changeToTimeReport()
    })

    $("#dashboardViewLink").click(function (e) {
        $("#mainView").html($("#dashboardView").html())
    })
    $("#navProjectViewLink").click(function (e) {
       changeToProjectView()
    })
    $("#navEmployeeLink").click(function(e) {
        $("#mainView").html($("#employeeView").html())
        loadEmployees(); //In employee.js
    })
    $("#navProfileLink").click(function (e) {
        changeToProfileView()
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
