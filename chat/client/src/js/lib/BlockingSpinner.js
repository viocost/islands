import * as util from "./dom-util";
import "../../css/vendor/blocking-spinner.min.css";

/**
 * Simple UI blocking loading spinner
 */
export class BlockingSpinner{

    constructor(opts = {}){
        this.selector = opts.selector || "body";
        this.text = opts.text || "Working..."
        this.id = util.generateRandomId(10, "spinner");
        this.isOn = false

    }

    loadingOn(){
        console.log("Loading on");
        let overlayDiv = util.bake('div', {class: 'freeze-ui', id: this.id})
        let parent = util.$(this.selector);
        overlayDiv.setAttribute("data-text", this.text)
        overlayDiv.style.position = 'absolute';
        parent.appendChild(overlayDiv);
        this.isOn = true;
    }

    loadingOff(timeout = 200){
        if(this.isOn){
            let overlayDiv = util.$(`#${this.id}`);
            if (overlayDiv){
                overlayDiv.classList.add('is-unfreezing');
                setTimeout(()=>{
                    try{
                        overlayDiv.parentElement.removeChild(overlayDiv)
                    } catch(err){
                        console.log(`BlockingSpinner error: ${err}`);
                    }
                    this.isOn = false;
                }, timeout)
            }
        } else {
            console.warn("Attempt to turn off spinner that hasn't been turned on.")
        }
    }
}
