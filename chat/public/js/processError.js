window.onerror = processDocumentError;
const LENGTHLIMIT = 500000;

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

function shrinkLog(){
    // let logContent = document.querySelector("#client-logs-content");
    //
    // if (logContent.innerHTML.length > LENGTHLIMIT ){
    //
    //     logContent.removeChild(logContent.children[0]);
    //
    // } else {
    //     console.log("Log shrinked");
    // }
}

function appendClientLog(errMsg){
    if (!errMsg){
        return;
    }
    let logContent = document.querySelector("#client-logs-content")
    let newRecord = document.createElement("p");
    newRecord.innerHTML = errMsg;
    logContent.appendChild(newRecord);
    if (logContent.innerHTML.length > LENGTHLIMIT ){
        console.log("Length: " + logContent.innerHTML.length + " Deleting old node");
        shrinkLog();
    }

}


function processDocumentError(errorMsg, url, lineNumber){
    console.log("Processing error: " + lineNumber);
    //errorMsg += ("\n" + Error().stack);
    appendClientLog(errorMsg);
    return true;
}