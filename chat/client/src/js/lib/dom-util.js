/**
 *
 *
 * Bakes DOM element as per request in data
 *
 * @param name - name of the element such as div, button etc
 *
 * @param recipe
    * recipe is a JSON object with following properties:
 *  * id - string id
 *  * classes - list of classes. Array or single entry
 *  * attributes - object of attributes key vaule pairs
 *  * html - inner html
 *  * text - inner text
 *  * val  - value
 *  * style - css string inline style for the element
 *  * children - single DOM element or array of DOM elements that will be appended as children
 *  * listeners - JSON object with keys - events types, vaules - event handlers
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

    if (recipe.style){
        el.style = recipe.style;
    }

    if (recipe.html)
        el.innerHTML = recipe.html;

    if (recipe.text)
        el.innerText = recipe.text;

    if (recipe.val)
        el.value = recipe.val;

    if (recipe.children){
        appendChildren(el, recipe.children);
    }

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

export function toggleClass(element, _class){
    let node = verifyGetNode(element)
    return node.classList.toggle(_class);
}

export function hasClass(element, _class){
    let node = verifyGetNode(element)
    return node.classList.contains(_class);
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
    let parentNode = verifyGetNode(parent);
    if (children instanceof  Array){
        for (let child of children){
            let node = verifyGetNode(child);
            parentNode.appendChild(node)
        }
    } else {
        let node = verifyGetNode(children)
        parentNode.appendChild(node)
    }
}

/**
 * Removes all children of a give node
 */
export function removeAllChildren(element){
    let node = verifyGetNode(element);
    while(node.lastChild){
        node.removeChild(node.lastChild);
    }
}

// Given single node, or array of nodes wrapse them in new div element.
// classes - single class or array of classes that will be set for the new div.
export function wrap(elements, classes){
    return bake("div", {
        children: elements,
        classes: classes
    })
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

// Alias in jquery style for display: hide
export function hide(node){
    try{
        displayElement(node, "none")
    }catch(err){
        console.log("Display none fail: " + err)
    }
}

export function displayBlock(node){
    displayElement(node, "block")
}

// Alias in jquery style for display: block
export function show(node){
    displayElement(node, "block")
}

export function displayFlex(node){
    displayElement(node, "flex")
}

// Alias in jquery style for display: flex
export function flex(node){
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
