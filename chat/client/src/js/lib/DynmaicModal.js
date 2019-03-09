import * as tingle from "tingle.js"



export function prepareModal(content, options = {}){
    let modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: options.closeMethods || ['overlay', 'button', 'escape'],
        closeLabel: "Close",
        onOpen: options.onOpen,
        onClose: options.onClose,
        beforeClose: options.beforeClose || function(){return true}
    });

    modal.setContent(content);

    return modal
}

