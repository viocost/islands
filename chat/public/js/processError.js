window.onerror = processDocumentError;

(function(){
    var oldLog = console.log;
    console.log = function (message) {
        // DO MESSAGE HERE.
        appendClientLog("log: " + message);
        oldLog.apply(console, arguments);
    };
})();

document.addEventListener('DOMContentLoaded', function(event) {
    document.querySelector('#view-logs').addEventListener('click', showLogs);
    document.querySelector('#close-client-logs').addEventListener('click', closeLogs);

});


function showLogs(){
    document.querySelector("#client-logs").style.display = "block";
    document.querySelector("#view-logs").style.display = "none";

}


function closeLogs(){
    document.querySelector("#client-logs").style.display = "none";
    document.querySelector("#view-logs").style.display = "block";
}



function appendClientLog(errMsg){
    if (!errMsg){
        return;
    }
    let newRecord = document.createElement("p");
    newRecord.innerHTML = errMsg;
    document.querySelector("#client-logs-content").appendChild(newRecord)
}


function processDocumentError(errorMsg, url, lineNumber){
    console.log("Processing error");
    //errorMsg += ("\n" + Error().stack);
    appendClientLog(errorMsg);
    return true;
}