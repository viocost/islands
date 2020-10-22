import * as domUtil from "../lib/dom-util"


const ACTIVE_CLASS = "active-asset"



export class AssetActivator{
    constructor(attributes){
        this.attributes = attributes;
    }

    activate(){
        let assets = Array.from(domUtil.$$(".topic-asset"));
        for(let asset of assets){
            if(this.isMatch(asset)){
                domUtil.addClass(asset, ACTIVE_CLASS)
            } else{
                domUtil.removeClass(asset, ACTIVE_CLASS)
            }
        }

    }

    deactivate(){
        let assets = Array.from(domUtil.$$(".topic-asset"));
        for(let asset of assets){
            domUtil.removeClass(asset, ACTIVE_CLASS)
        }
    }

    isMatch(asset){
        for(let key in this.attributes){
            if (asset.getAttribute(key) !== this.attributes[key]){
                return false
            }
        }

        return true;
    }
}
