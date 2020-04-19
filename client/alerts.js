/**
 * Helper function that removes the alert from the alert container after the specified ammount of time.
 * 
 * @param {number} wait      The time until the alert is removed
 * @param {string} container The identifier of the container containing the alert to be removed.
 */
function alertTimeout(wait, container){
    setTimeout(function(){
        $(container).children('.alert:first-child').remove();
        console.log($(container).html())
        if( $(container).html() == "") {
            $("#main-alert-holder").css("opacity", "100%");
        }
    }, wait);
}

$(function() {
    $("#main-alert-holder").mouseenter(function () {
        console.log("asd")
        $("#main-alert-holder").css("opacity", "50%");
    })

    $("#main-alert-holder").mouseleave(function () {
        console.log("asd")
        $("#main-alert-holder").css("opacity", "100%");
    })
})

/**
 * Spawns a alert that disappears after 2000ms (default, can be changed via paramerter time) containing the specified text. 
 * A few example calls:
 * 
 * Spawns a default alert:
 * spawnAlert("Detta är en exempeltext");
 *
 * Spawns a green alert, indicating success:
 * spawnAlert("Detta är en exempeltext", "success");
 *
 * Spawns a red alert, for 10000 ms. Note that you need to specify the type parameter if you also want to specify the time parameter:
 * spawnAlert("Detta är en exempeltext", "danger", 10000);
 *
 * Spawns an alert that must be manually removed. Note that you need to specify the type parameter if you also want to specify the time parameter:
 * spawnAlert("Detta är en exempeltext", "danger", 0)
 *
 * @param {string} text The content of the notification
 * @param {string} type The type of notification you want to send, valid values: primary, secondary, success, danger, warning, info, light, dark. See https://getbootstrap.com/docs/4.0/components/alerts/. 
 * @param {number} time The time in ms before the alert disappears. 0 indicates that the notification must be manually removed.
 */
function spawnAlert(text, type="success", time=2000) {
    notificationHtml = `<div class="alert alert-${type} alert-dismissible fade show custom-alert" role="alert">
        ${text}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`
    $("#main-alert-holder").append(notificationHtml);

    if(time!==0) {
        alertTimeout(time, "#main-alert-holder");
    }
}