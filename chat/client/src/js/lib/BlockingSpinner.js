import * as util from "./dom-util";

/**
 * Simple UI blocking loading spinner
 */
export class BlockingSpinner{

    constructor(opts = {}){
        this.selector = opts.selector || "body";
        this.text = opts.text || "Working..."
        this.id = util.generateRandomId(10, "spinner");

    }

    loadingOn(){
        let overlayDiv = util.bake('div', {classes: ['freeze-ui'], id: this.id})
        let parent = util.$(this.selector);
        overlayDiv.setAttribute("data-text", this.text)
        overlayDiv.style.position = 'absolute';
        parent.appendChild(overlayDiv);
    }

    loadingOff(timeout = 200){
        let overlayDiv = util.$(`#${this.id}`);
        if (overlayDiv){
            overlayDiv.classList.add('is-unfreezing');
            setTimeout(()=>{
                if (overlayDiv){
                    overlayDiv.parentElement.removeChild(overlayDiv)
                }
            }, timeout)
        }
    }
}
