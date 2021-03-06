/**
 * Function for hiding/showing things based on if the user is signed in or out.
 * 
 * @param {boolean} signedIn Determines what should be shown or hidden depending on if the user is signed in or out.
 */
function updatePageLoggedIn(signedIn) {
    if (signedIn) {
        getUser()
        $(".signInButton").hide()
        $(".signOutButton").show()
        $("#navPriceLink").hide()
        $("#navAboutLink").hide()
        $("#navContactLink").hide()
        $("#navProjectViewLink").show()
        $("#navbarScheduleLink").show()
        $("#navEmployeeLink").show()
        $("#navProfileLink").show()
    } else {
        $(".signInButton").show()
        $(".signOutButton").hide()
        $("#navTimeReportLink").hide()
        $("#navTimeOverviewLink").hide()
        $("#navPriceLink").show()
        $("#navAboutLink").show()
        $("#navContactLink").show()
        $("#navProjectViewLink").hide()
        $("#navbarScheduleLink").hide()
        $("#navEmployeeLink").hide()
        $("#navProfileLink").hide()
    }
    changeToLandingPage()
}


/**
 * Adds the ability to press enter to log in.
 */
$(document).ready(function() {
    $("#signInModal").keyup(function(event) {
        if (event.key == "Enter") {
            signIn();
        }
    })
})

/**
 * Helper function for spawning a "change password" dialogue if the user is still using their default assigned password.
 */
function spawnChangePasswordDialogue() {
    $.ajax({
        url: '/auth/default-password',
        type: 'GET',
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        success: function(response) {
            if (response.usingDefaultPassword) {
                $('#changePasswordModal').modal('show');
            }
        }
    })
}

$(document).ready(function() {
    var auth = sessionStorage.getItem('auth');
    var signedIn = false;
    if (!(auth === null)) {
        signedIn = auth.length > 0;
    }
    updatePageLoggedIn(signedIn);
})

/**
 * Function for signing in the user. Is currently called from a button in the HTML.
 */
function signIn() {
    var personID = document.getElementById("signInPid").value;
    var password = document.getElementById("signInPassword").value;
    user_data = `{"personID":"${personID}","password":"${password}"}`

    var failure = true;
    $.ajax({
        url: '/auth/sign-in',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: user_data,
        success: function(loginResponse) {
            sessionStorage.setItem('auth', JSON.stringify(loginResponse))
            $("#signInModal").modal("hide");
            spawnAlert("Inloggningen lyckades!", "success")
            updatePageLoggedIn(true);
            spawnChangePasswordDialogue()
            document.getElementById("signInFailureAlert").hidden = true;
            failure = false;
        },
        error: function(loginResponse) {
            document.getElementById("signInFailureAlert").hidden = false;
        }
    })
}

/**
 * Signs out the user. Called from a button in the HTML
 */
function signOut() {
    sessionStorage.removeItem("auth");
    updatePageLoggedIn(false);
    spawnAlert("Du har loggat ut")
    updatePageLoggedIn(false)
}

/**
 * Used for signing up companies.
 */
function signUpCompany() {
    var companyName = document.getElementById("signUpCompanyName").value;
    var companyOrgNumber = document.getElementById("signUpCompanyOrgNumber").value;
    var adminName = document.getElementById("signUpAdminName").value;
    var adminPid = document.getElementById("signUpAdminPid").value;
    var adminEmail = document.getElementById("signUpAdminEmail").value;
    var adminPassword = document.getElementById("signUpAdminPassword").value;
    companyAndAdminData = `
    {
        "companyName":"${companyName}",
        "companyOrgNumber":"${companyOrgNumber}",
        "adminName":"${adminName}",
        "adminPid":"${adminPid}",
        "adminEmail":"${adminEmail}",
        "adminPassword":"${adminPassword}"
    }`
    $.ajax({
        url: 'auth/sign-up-company',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: companyAndAdminData,
        success: function(response) {
            $("#mainView").html($("#thankYouView").html())
        },
        error: function() {
            document.getElementById("invalidPersonID").hidden = false;
        }
    })
}

/**
 * Changes the password of a user.
 */
function changePassword() {
    console.log("asd")
    var currentPassword = document.getElementById("currentPassword").value
    var newPassword = document.getElementById("newPassword").value
    var newPasswordRepeated = document.getElementById("newPasswordRepeated").value
    if (newPassword !== newPasswordRepeated) {
        document.getElementById("wrongNewPasswordAlert").hidden = false;
        document.getElementById("wrongOldPasswordAlert").hidden = true;
    } else {
        var passwordData = `
        {
            "currentPassword":"${currentPassword}",
            "newPassword":"${newPassword}"
        }
        `
        $.ajax({
            url: 'auth/change-password',
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
            data: passwordData,
            success: function(response) {
                $("#changePasswordModal").modal("hide");
                spawnAlert("L??senordet har ??ndrats")
            },
            error: function() {
                document.getElementById("wrongNewPasswordAlert").hidden = true;
                document.getElementById("wrongOldPasswordAlert").hidden = false;
            }
        })
    }
}
