/**
 *
 *
 * Bakes DOM element as per request in data
 *
 * @param name - name of the element such as div, button etc
 * recipe is a JSON object with following properties:
 *  * id - string id
 *  * classes - list of classes. Array or single entry
 *  * attributes - object of attributes key vaule pairs
 *  * html - inner html
 *  * text - inner text
 *  * val  - value
 *  
 *  
 * @param recipe
 */
export function bake(name, recipe){
    let el = document.createElement(name);
    if(!recipe) return el;

    if(recipe.classes){
        if (typeof recipe.classes === "object"){
            for (let c of recipe.classes){
                el.classList.add(c);
            }
        }else if (typeof recipe.classes === "string"){
            el.classList.add(recipe.classes);
        }else {throw "Bake parameters invalid"}
    }

    if(recipe.listeners){
        for(let ev of Object.keys(recipe.listeners)){
            el.addEventListener(ev, recipe.listeners[ev])
        }
    }
    
    if(recipe.id){
        el.setAttribute("id", recipe.id)
    }
    
    if (recipe.attributes){
        for (let key of Object.keys(recipe.attributes)){
            el.setAttribute(key, recipe.attributes[key])
        }
        
    }

    if (recipe.html)
        el.innerHTML = recipe.html;

    if (recipe.text)
        el.innerText = recipe.text;

    if (recipe.val)
        el.value = recipe.val;
    
    return el
}


export function appendChildren(parent, children){
    if (children instanceof  Array){
        for (let child of children){
            parent.appendChild(child)
        }
    } else {
        parent.appendChild(children)
    }
}

export function $(selector){
    if (typeof selector !== "string"){
        throw "Selector type is invalid!";
    }
    return document.querySelector(selector)
}

export function $$(selector){
    if (typeof selector !== "string"){
        throw "Selector type is invalid!";
    }
    return document.querySelectorAll(selector)
}

export function displayNone(selector){
    $(selector).style.display = "none"
}

export function displayBlock(selector){
    $(selector).style.display = "block"
}

export function displayFlex(selector){
    $(selector).style.display = "flex"
}

/**
 * This is to replace jquery ajax api
 *
 */
export function xhr(param){
    let TYPES = ["GET", "POST", "PUT"];
    let EVENTS = {
        "onreadystatechange": "onreadystatechange",
        "abort": {
            event: "onabort",

        },
        "success": {
            event: "onload",
            getHandler: (xhr, handler)=>{
                return ()=>{
                    handler(xhr.responseText, xhr.response, xhr)
                }
            }
        },
        "error": {
            event: "onerror",

            getHandler: (xhr, handler)=>{
                return ()=>{
                    handler(xhr.responseText, xhr.response, xhr)
                }
            }
        },
    };

    let DATATYPES = ["json", "xml", "script", "html"]

    //request checks

    if(!param.hasOwnProperty("url")){
        throw "Url is missing";
    } else if (TYPES.indexOf(param.type) === -1){
        console.log("TYPE: " + param.type)
        throw "Request type is invalid"
    }

    let xhr = new XMLHttpRequest;

    //Assigning handlers
    for(let key of Object.keys(EVENTS)){
        console.log(JSON.stringify(Object.keys(param)))
        if (Object.keys(param).indexOf(key) > -1 && typeof param[key] === "function"){
            console.log("Assigning handler: " + key)
            xhr[EVENTS[key].event] = EVENTS[key].getHandler(xhr, param[key]);
        }
    }
    xhr.open(param.type, param.url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(param.data));
}
