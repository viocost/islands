window.onerror = processDocumentError;


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


function processDocumentError(errorMsg, url, lineNumberv){
    console.log("Processing error");
    appendClientLog(errorMsg);
    return true;
}