const DATATYPES = ["json", "xml"]
const CALLBACKTYPES = {
    "complete": "onloadend",
    "success": "onload",
    "error": "onerror"
}



export function get(endpoint, param){
    if (!endpoint){
        throw "URL is missing."
    }

    let xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint, true);


}

/**
 * This function meant to replace jquery ajax with bare xhr
 * @param endpoint a string containing the URL to which the request is sent
 * @param param is JSON object with following properties:
 *   accepts: string, default depends on dataType
 *   async: default true - makes request asynchronously
 *   beforeSend: function, called before request is sent
 *   cache: boolean
 *   complete: function, called after request is finished. Args: XMLHttprequest xhr, String textStatus
 *   data: Object, Array, or String - data to send to server
 *   error: function called if request fails. Args: XMLHttpRequest xhr, String textStatus, String errorThrown
 *   success: function called if request succeed. Args: Anything data, String textStatus, XMLHttpRequest xhr
 *   timeout: Number - set timeout in milliseconds
 *
 */


export function post(endpoint, param){

    if(!endpoint)
        throw "The url is missing";

    let xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);

    //type of content passed to server
    let contentType = param.contentType || 'application/json';

    //data type expected back
    if(param.dataType && DATATYPES.indexOf(para.dataType) === -1){
        throw "Invalid data type";
    }
    xhr.responseType = param.dataType || 'json';

    //setting callbacks
    for (let key of Object.keys(CALLBACKTYPES)){
        if (Object.keys(param).indexOf(key) > -1 && typeof param[key] === "function"){
            console.log("Setting handler for " + key);
            xhr[CALLBACKTYPES[key]] = callback(key, xhr, param[key])
        }
    }

    let data = param.data;
    if (data){
        xhr.setRequestHeader("Content-Type", contentType);
        if (typeof data === "object"){
            console.log("JSON processing data")
            data = JSON.stringify(param.data);
        }
    }

    xhr.send(data)

}


export function xhr(param){
    console.log("XHR call. param: " + JSON.stringify(param))
    if(!param.hasOwnProperty("url")){
        throw "Url is missing";
    } else if (TYPES.indexOf(param.type) === -1){
        console.log("TYPE: " + param.type)
        throw "Request type is invalid"
    }


}


const processIncomingData = function(responseType, data){
    console.log("Response type is: " + responseType)
    console.log("Data is " + data);
    switch (responseType){
        case responseType.indexOf("json") > -1:
            return JSON.parse(data);
        default:
            console.log("No default processor found. Returning data as is.")
            return data
    }
}

const callback = function (cbType, xhr, handler){
    switch(cbType){
        case "complete": return ()=>{
            handler(processIncomingData(xhr.responseType, xhr.responseText), xhr.statusText, xhr)
        }

        case "success": return ()=>{
            console.log("text response" + xhr.responseText)
            console.log("XHR response type: " + xhr.responseType);
            console.log("XHR response is: " + xhr.response );
            console.log("XHR status text: " + xhr.statusText)
            console.log("XHR headers: "  + xhr.getAllResponseHeaders().toString())
            handler(processIncomingData(xhr.responseType, xhr.responseText), xhr.statusText, xhr)
        }

        case "error": return ()=>{

        }

        case "beforeSend": throw "Not Implemented";
        default: throw "Unknown callback type";
    }
}

function parseHeaders(headers){
    if(typeof headers !== "string"){
        throw "Error: headers must be a string";
    }

    let hArr = headers.split("\n");
    res = {}
    hArr.forEach(header =>{
        let hSplit = header.split(/:\s*/)
        if (hSplit.length > 2){
            return;
        }
        res[hSplit[0]] = hSplit[1].split(/;\s*/)
    });
    return res
}
