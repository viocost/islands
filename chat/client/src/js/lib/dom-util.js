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
        }else {throw new Error("Bake parameters invalid");}
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

// ---------------------------------------------------------------------------------------------------------------------------
// CSS classes wrapers
export function addClass(element, _class){
    let node = verifyGetNode(element);
    node.classList.add(_class);
}

export function removeClass(element, _class){
    let node = verifyGetNode(element);
    node.classList.remove(_class);
}
//end//////////////////////////////////////////////////////////////////////////


// ---------------------------------------------------------------------------------------------------------------------------
// Setting text and html
export function html(element, html){
    let node = verifyGetNode(element);
    node.innerHTML = html;
}

export function text(element, text){
    let node = verifyGetNode(element);
    node.innerText = text;
}
//end//////////////////////////////////////////////////////////////////////////

/**
 * Less verbose wrapper for setting value;
 *
 */
export function val(element, val){
    let node = verifyGetNode(element);
    node.value = val;
}

/**
 * Given parent node appends one or multiple children
 * @param parent DOM node
 * @param children can be array of nodes or a single node
 */
export function appendChildren(parent, children){
    if (children instanceof  Array){
        for (let child of children){
            parent.appendChild(child)
        }
    } else {
        parent.appendChild(children)
    }
}

/**
 * Less verbose wrapper for document.querySelector
 */
export function $(element){
    return verifyGetNode(element)
}

/**
 * Less verbose wrapper for document.querySelectorAll
 */
export function $$(selector){
    return document.querySelectorAll(selector)
}


export function displayNone(node){
    try{
        displayElement(node, "none")
    }catch(err){
        console.log("Display none fail: " + err)
    }
}

export function displayBlock(node){
    displayElement(node, "block")
}

export function displayFlex(node){
    displayElement(node, "flex")
}

/**
 * Internal. Sets node display property
 *
 */
function displayElement(element, display){
    let node = verifyGetNode(element);
    node.style.display = display;
}

export function generateRandomId(length = 10, prefix="", postfix=""){
    let alphabet = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let symbols = [];
    for(let i=0; i<length; ++i){
        symbols.push(alphabet[Math.floor(Math.random() * alphabet.length)])
    }

    return `${prefix.length > 0 ? prefix + "-" : ""}${symbols.join("")}${postfix.length > 0 ? "-" + postfix : ""}`;
}

/**
 * Helper function. Given either DOM element or selector
 * makes sure it exists and valid, and returns it.
 */
function verifyGetNode(element){
    let node = element
    if (typeof node === "string"){
        node =  document.querySelector(element);
    }
    if (!node){
        throw `Element ${element} is undefined`;
    } else if(!node instanceof Element){
        throw new Error("Type of element is invalid");
    }
    return node;
}
