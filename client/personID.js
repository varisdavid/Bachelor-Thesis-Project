/**
 * Function used to format password in client 
 */
function formatPersonID(personID) {
    var date = new Date;
    t_year = date.getFullYear();

    var reg = /^(\d{2}){0,1}(\d{2})(\d{2})(\d{2})([\-|\+|\s]{0,1})?(\d{3})(\d{0,1})$/;
    var match = reg.exec(personID);
    if (!match) {
        return;
    } else {
        var cent = match[1];
        var year = match[2];
        var month = match[3];
        var day = match[4];
        var separator = match[5];
        var num = match[6];
        var check = match[7];

        if (typeof cent === 'undefined' || !cent.length) {
            if (separator === '+' || (t_year - parseInt('20' + year)) < 0) {
                cent = '19'
            } else {
                cent = '20'
            }
        }
        if ((t_year) - parseInt(cent + year) > 100) {
            separator = '+';
        } else {
            separator = '-';
        }
        return year + month + day + separator + num + check; 
    }
}

function checkIfPersonID(personID) {
    personID = formatPersonID(personID);
    if (typeof personID == 'undefined') {
        return false;
    } else {
        return true;
    }
}

function changeToProfileView() {
    var personID = JSON.parse(sessionStorage.getItem('auth')).person_id;
    isPersonID = checkIfPersonID(personID);
    if (isPersonID) {
        personID = formatPersonID(personID)
    }
    $.ajax({
        headers: { "Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).access_token },
        url: '/employee/' + personID,
        type: 'GET',
        success: function (employee) {
            $("#employeeName").replaceWith("<h3>" + employee.name + "</h3>");
            writeForm(employee.personID, employee);
        }
    });
    $("#mainView").html($("#profileView").html())
}