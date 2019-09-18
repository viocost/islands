const TYPES = ["GET", "POST", "PUT", "DELETE"]
const CALLBACKTYPES = ["complete", "success", "error"]

const callback = function (cbType, xhr, handler){
    switch(cbType){
        case "complete": return ()=>{

        }

        case "success": return ()=>{

        } 

        case "error": return ()=>{

        }

        case "beforeSend": throw "Not Implemented";
        default: throw "Unknown callback type";
    }
}

/**
 * This function meant to replace jquery ajax with bare xhr
 * @param param is JSON object with following properties:
 *   accepts: string, default depends on dataType
 *   type: REQUIRED, string, must be one of TYPES
 *   async: default true - makes request asynchronously
 *   beforeSend: function, called before request is sent
 *   cache: boolean
 *   complete: function, called after request is finished. Args: XMLHttprequest xhr, String textStatus
 *   contentType default:  'application/x-www-form-urlencoded; charset=UTF-8'
 *       Describes the datatype of the passed content
 *       This one passed to Content-Type header
 *
 *   data: Object, Sting or array - data to send to the server
 *   dataType: the data type you are expecting from the server.
 *        default - json
 *        can be one of following: xml, json, script or html
 *   error: function called if request fails. Args: XMLHttpRequest xhr, String textStatus, String errorThrown
 *   headers: Object default {}
 *   success: function called if request succeed. Args: Anything data, String textStatus, XMLHttpRequest xhr
 *   timeout: Number - set timeout in milliseconds
 *   url: REQUIRED String - A string containeing the URL to which the request is sent
 *   username:
 *   password:
 *
 *
 *
 *   
 *
 */
export function xhr(param){
     if(!param.hasOwnProperty("url")){
        throw "Url is missing";
    } else if (TYPES.indexOf(param.type) === -1){
        console.log("TYPE: " + param.type)
        throw "Request type is invalid"
    }


    let xhr = new XMLHttpRequest();

    //setting callbacks
    for (let key of CALLBACKTYPES){
        if (Object.keys(param).indexOf(key) > -1 && typeof param[key] === "function"){

        }
    }

}
