import * as util from "./dom-util"
import * as Modal from "./DynmaicModal";
import { IError as Err } from "../../../../common/IError";
import * as SVG from "./SVG"
import { UXMessage } from "../ui/UX"

//Bakes select list for side panel
// top boolean whether it is select for top block


export function bakeCarousel(){
    let options = []
    options.push(util.bake("option", {text: "Topics"}))

    return util.bake("div", {
        class: "carousel-wrap",
        children: [

            util.bake("div", {
                id: `btn-rotate`,
                class: ["arrow", "left", "btn-rotate"]
            }),

            util.bake("select", {
                class: "carousel",
                id: `carousel`,
                children: options,
                listeners: {
                    "mousedown": (e)=>{
                        e.preventDefault();
                        window.focus();
                    }
                }
            }),

            util.bake("div", {
                id: `btn-rotate`,
                class: ["arrow", "right", "btn-rotate"]
            })

        ]
    })

}



export function bakeSidePanel(version = Err.required("Version")){
    let carousel = bakeCarousel()
    let logo = svgAsDOM(SVG.islandSVG);
    util.addClass(logo, "logo")
    return util.bake("div", {
        class: "side-panel-container",
        children: [
            util.bake("div", {
                class: ["side-panel-wrapper"],

                id: "side-panel-wrapper",
                children: [
                    carousel,
                    //topics block
                    util.bake("div", {
                        class: "side-block-wrap",
                        children: [
                            //topics block
                            bakeTopicsBlock(),
                        ]
                    })
                ]
            }),


            util.bake("div", {
                class: "version-wrapper",
                children: [
                    logo,
                    util.bake("h3", {
                        text: `Islands Release v${version}`
                    })
                ]
            })
        ]
    })
}


// Bakes empty  topics block for side panel
function bakeTopicsBlock(){

    return  util.bake("div", {
        class: "side-panel-block",
        id: `topic-block`,
       
        children: [
            //Top buttons
            util.bake("div", {
                class:  [ "side-panel-button-row", "btn-top-row" ],
                children: [

                    util.bake("button", {
                        //New topic button
                        id: BUTTON_IDS.NEW_TOPIC,
                        class: ["side-panel-btn", "btn", "btn-top"],
                        text: "New topic",
                    }),

                    util.bake("button", {
                        //Join button
                        id: BUTTON_IDS.JOIN_TOPIC,
                        class: ["side-panel-btn", "btn", "btn-top"],
                        text: "Join topic",
                    }),

                ]
            }),

            //No topic label
            util.bake("h4", {
                class: "empty-block",
                text: "No topics yet",
                style: "display: none"
            }),

            //List of existing topics
            util.bake("ul", {
                class: "side-block-data-list",
                id: `topics-list`,
            }),

            //Context button menu bottom
            util.bake("div", {
                class: "ctx-bottom-menu-wrap",
                children: [
                    util.bake("div", {
                        class: "ctx-topic-buttons",
                        children: [
                            util.bake("button", {
                                text: "Alias",
                                style: "display: none",
                                class: "btn",
                                id: BUTTON_IDS.CTX_ALIAS,
                            }),
                            util.bake("button", {
                                text: "Invite",
                                style: "display: none",
                                class: "btn",
                                id: BUTTON_IDS.CTX_INVITE

                            }),

                            util.bake("button", {
                                text: "Mute",
                                class: "btn",
                                style: "display: none",
                                id: "btn-ctx-mute"

                            }),

                            util.bake("button", {
                                text: "Leave",
                                class: "btn",
                                style: "display: none",
                                id: "btn-ctx-leave"

                            }),

                            util.bake("button", {
                                text: "Delete",
                                class: "btn",
                                style: "display: none",
                                id: BUTTON_IDS.CTX_DELETE

                            }),

                            util.bake("button", {
                                text: "Boot",
                                class: "btn",
                                style: "display: none",
                                id: BUTTON_IDS.CTX_BOOT
                            }),
                        ]
                    }),

                ]
            })
        ]
    })
}

export function bakeMessagesPanel(newMsgBlock){
    return util.bake("div", {
        class: "main-panel-container",
        children: [
            util.bake("div", {
                class: "topic-message-blocks-container",
                id: "topic-message-blocks-container"
            }),

            newMsgBlock
        ]
    })
}

export function bakeTopicMessagesBlock(pkfp, topicName){

    return util.bake("div", {
        class: "messages-panel-container",
        attributes: {
            pkfp: pkfp
        },
        children: [
            util.bake("h4", {
                id: "topic-in-focus-label",
                class: "topic-in-focus-label",
                text: `Topic: ${topicName}`
            }),

            util.bake("div", {
                class: "messages-window",
            })


        ],
    })
}

export function bakeNewMessageControl(uxBus){
    const clipIcon = svgAsDOM(SVG.clipSVG)
    clipIcon.addEventListener("click", ()=>uxBus.emit(UXMessage.ATTACH_FILE_ICON_CLICK))
    util.addClass(clipIcon, "attach-icon");

    const cancelIcon = svgAsDOM(SVG.cancelSVG)
    cancelIcon.addEventListener("click", ()=>uxBus.emit(UXMessage.CANCEL_PRIVATE_MESSAGE))

    return util.bake("div", {
        id: "new-message-container",
        children: [
            util.bake("div", {
                class: ["control-col", "new-msg-input"],
                children: [
                    util.bake("div", {
                        class: "private-label",
                        id: "private-label",
                        children: [
                            cancelIcon,
                            util.bake("span", {
                                text: "Prvate to: "
                            }),
                            util.bake("span")

                        ]
                    }),
                    util.bake("div", {
                        class: "input-wrap",
                        children: [
                            util.bake("div", {
                                class: "button-column",
                                children: [
                                    util.bake("img", {
                                        src: "/img/spinner.gif",
                                        class: "uploading-animation",
                                        id: "uploading-animation"
                                    }),
                                    util.bake("label", {
                                        id: "attach-file-button",
                                        attributes: {
                                            for: "attach-file"
                                        },
                                        children: [
                                            clipIcon
                                        ]
                                    })
                                ]
                            }),
                            util.bake("div", {
                                class: ["flex-column", "new-msg-input"],
                                children: [
                                    util.bake("textarea", {
                                        id: "new-msg",
                                        attributes: {
                                            placeholder: "Enter your message. Ctrl+Enter - new line. Enter - send."
                                        },

                                        listeners: {
                                            keyup: ev=>uxBus.emit(UXMessage.MESSAGE_AREA_KEY_PRESS, ev)
                                        }

                                    }),
                                    util.bake("div", {
                                        id: "chosen-files"
                                    })
                                ]
                            })
                        ]
                    }),

                    util.bake("div", {
                        id: "chosen-files"
                    })
                ]
            }),

            // New message button block
            util.bake("div", {
                class: ["control-col", "new-msg-buttons"],
                children: [
                    util.bake("div", {
                        class: "send-button-wrap",
                        children: [
                            util.bake("button", {
                                id: BUTTON_IDS.SEND,
                                class: "btn-send",
                                text: "SEND",
                                listeners: {
                                    click: ()=>uxBus.emit(UXMessage.SEND_BUTTON_CLICK)
                                }
                            })
                        ]
                    }),
                    util.bake("input", {
                        id: "attach-file",
                        class: "inputfile",
                        attributes: {
                            type: "file",
                            name: "file"
                        },
                    }),
                    util.bake("input", {
                        id: "attach-file-dummy",
                        class: "attach-file-dummy",
                        attributes: {
                            type: "file",
                        },
                    })
                ]
            })

        ]

    })
}


export function bakeFileAttachmentElement(fileName = Err.required("File name"),
                                          clearAttachments = Err.required("Clear attachment handler")){
    return util.bake("div", {
        class: "chosen-file-wrap",
        children: [
            util.bake("img", {
                attributes: {
                    src: "/img/close.png"
                },
                listeners: {
                    click: clearAttachments
                }
            }),

            util.bake("div", {
                class: "chosen-file",
                text: fileName

            })
        ]
    })
}

export function bakeEphemeralMessage(timeStamp = Err.required("Timestamp"),
                                     msg = Err.required("Message")){
    return util.bake("div", {
        class: "ephemeral-msg",
        children: [
            util.bake("div", {
                class: "msg-heading",
                children: [
                    util.bake("b", {
                        text: "Islands ephemeral note"
                    }),

                    util.bake("span", {
                        class: "msg-time-stamp",
                        text: timeStamp
                    })
                ]
            }),

            util.bake("div", {
                class: "msg-body",
                html: msg
            })
        ]
    })
}

export function bakeLoginBlock(loginClickHandler){
     return  util.bake("div", {
        id: "vault-login--wrapper",
        class: "form-outer-wrapper",
        children: util.bake("div", {
            class: "form-border",
            children: [
                util.bake("h3", {html: "Vault login:"}),
                util.bake("div",  {
                    children:  util.bake("input", {
                        id: "vault-password",
                        class: "form-input",
                        attributes: {
                            type: "password",
                            placeholder: "Password",
                            maxlength: "50"
                        }
                    })
                }),
                util.bake("div", {
                    children: util.bake("button", {
                        id: BUTTON_IDS.LOGIN,
                        class: ["btn", "form-button"],
                        text: "Login",
                        listeners: {
                            click: loginClickHandler
                        }

                    }),
                })
            ]
        })
    })
}


export function bakeRegistrationBlock(onRegisterClick){
    return util.bake("div", {
        id: "vault-registration--wrapper",
        class: "form-outer-wrapper",
        children: util.bake("div", {
            class: "form-border",
            children: [
                util.bake("h3", {
                    text: "Create password:"
                }),
                util.bake("input", {
                    id: "new-passwd",

                    class: "form-input",
                    attributes: {
                        type: "password",
                        placeholder: "New password",
                        maxlength: "50"
                    }
                }),

                util.bake("input", {
                    id: "confirm-passwd",
                    class: "form-input",
                    attributes: {
                        type: "password",
                        placeholder: "Confirm password",
                        maxlength: "50"
                    }
                }),

                util.bake("div", {
                    class: "password-warning-wrap",
                    children: [
                        util.bake("img", {
                            src: "/img/warning.svg"
                        }),

                        util.bake("div", {
                            children: [
                                util.bake("b", {
                                    text: "Please, save your password!!!",
                                }),

                                util.bake("p", {
                                    text: "There is no password recovery. Once you lose it - it's gone forever!"

                                })
                            ]
                        })

                    ]
                }),
                util.bake("button", {
                    listeners: {
                        click: onRegisterClick
                    },
                    text: "Save",
                    class: ["btn", "form-button"],
                    id: BUTTON_IDS.REGISTER,
                })
            ]
        })
    })
}


export function bakeRegistrationSuccessBlock(okClick){
    return util.bake("div", {
        class: "form-outer-wrapper",
        children: [
            util.bake("div", {
                class: "form-border",
                children: [
                    util.bake("h3", {
                        text: "Vault created!"
                    }),
                    util.bake("button", {
                        text: "Ok",
                        listeners: {
                            click: okClick
                        },
                        class: ["btn", "form-button"]
                    })
                ]
            })
        ]
    })
}

export function bakeLoginHeader(){
    return util.bake("div", {
        class: "header-section-left",
        children: [
            util.bake('img', {
                src: "/img/island.svg"
            }),

            util.bake("h3", {
                id: "active-title",
                text: "Welcome to Islands!"
            })
        ]
    })
}

export function bakeHeaderLeftSection(){
    let menuButton = svgAsDOM(SVG.hamburgerSVG)
    menuButton.id = BUTTON_IDS.MAIN_MENU
    util.addClass(menuButton, "main-menu-button")
    util.addClass(menuButton, "menu-on")
    menuButton.addEventListener("click", ()=>uxBus.emit(UXMessage.MAIN_MENU_CLICK))

    return util.bake("div", {
        class: "header-section-left",
        children: [
            menuButton,

            util.bake("div", {
                class: "connection-indicator-container",
                children: [
                    util.bake("div", {
                        id: "connection-indicator",
                        class: [ "connection-indicator", "unknown"]
                    }),
                    util.bake("div", {
                        id: "connection-indicator-label-wrap",
                        class: "connection-indicator-label-wrap",
                        children: [
                            util.bake("h6", {

                                id: "connection-indicator-label",
                                class: "connection-indicator-label",
                                text: "Connection status unknown"
                            }),

                            util.bake("img", {
                                src: "/img/spinner.gif",
                                id: 'reconnect-spinner',
                                class: 'reconnect-spinner'

                            }),

                            util.bake("div", {
                                text: "Reconnect",
                                id: "reconnect-button",
                                class: "reconnect-button",
                            })



                        ]
                    })
                ]

            })
        ]
    })
}

export function bakeHeaderRightSection(isSoundOn){
    let rightSection = util.bake("div", {
        class: "header-section-right",
    })

    let svgStyle =  "height: 40px; width: 40px; top: 0; left: 0; position: relative"
    let logoutImg = svgAsDOM(SVG.logoutSVG)
    let soundOnImg = svgAsDOM(SVG.soundOnSVG)
    let soundOffImg = svgAsDOM(SVG.soundOffSVG)
    logoutImg.style = svgStyle;
    soundOnImg.style = svgStyle;
    soundOffImg.style = svgStyle;


    util.appendChildren(rightSection, [

        util.bake("button", {
            id: BUTTON_IDS.MUTE_SOUND,
            class: "header-button",
            children: isSoundOn ? soundOnImg : soundOffImg
        }),

        util.bake("button", {
            id: BUTTON_IDS.LOGOUT,
            class: "header-button",
            children: logoutImg
        })
    ])
    return  rightSection
}


export function bakeMainContainer(){
    return util.bake("div", {
        id: "main-container",
        class: ["container", "tingle-content-wrapper"],
        style: "display: flex"
    })
}


export function bakeTopicListItem(topic, uxBus){

    const plus = svgAsDOM(SVG.plusLight);
    const minus = svgAsDOM(SVG.minusLight);

    util.addClass(plus, "btn-expand-topic")
    util.addClass(plus, "side-panel-icon")
    util.addClass(minus, "btn-expand-topic")
    util.addClass(minus, "side-panel-icon")
    plus.addEventListener("click", ()=>uxBus.emit(UXMessage.TOPIC_EXPAND_ICON_CLICK, topic.pkfp))
    minus.addEventListener("click", ()=>uxBus.emit(UXMessage.TOPIC_EXPAND_ICON_CLICK, topic.pkfp))
    util.displayNone(minus);


    return util.bake("li", {
        class: "side-block-data-list-item",
        attributes: {
            pkfp: topic.pkfp
        },
        listeners: {
        },
        children: [
            util.bake("div", {
                class: "topic-row-wrap",
                children: [
                    plus,
                    minus,
                    util.bake("span", {
                        class: "topic-name",
                        text: topic.name,
                        listeners: {
                            click: ()=>uxBus.emit(UXMessage.TOPIC_CLICK, topic.pkfp),
                            dblclick: ()=>uxBus.emit(UXMessage.TOPIC_DBLCLICK, topic.pkfp)
                        }
                    }),

                    util.bake("div", {
                        class: "unread-messages-container",
                    })
                ]
            }),
            ///////////////////////////////////////////
            // util.bake("div", {                    //
            //     class: "topic-assests-item-wrap", //
            //     children: [                       //
            //         util.bake("div", {            //
            //                                       //
            //         }),                           //
            //         util.bake("h5", {             //
            //                                       //
            //         })                            //
            //     ]                                 //
            // })                                    //
            ///////////////////////////////////////////

        ]
    })

}


export function bakeInviteListItem(uxBus, topicPkfp, inviteCode, alias=""){

    let inviteSVG = svgAsDOM(SVG.inviteSVG);
    util.addClass(inviteSVG,  "side-panel-icon")

    console.log("Baking Invite list item");
    return util.bake("div", {
        attributes: {
            "code": inviteCode
        },
        listeners: {
            click: ()=>{uxBus.emit(UXMessage.INVITE_CLICK, {
                pkfp: topicPkfp,
                inviteCode: inviteCode
            })},

            dblclick: ()=>{uxBus.emit(UXMessage.INVITE_DBLCLICK, {
                pkfp: topicPkfp,
                inviteCode: inviteCode
            })},
            contextmenu: ()=>uxBus.emit(UXMessage.CONTEXT_MENU, {
                subject: CONTEXT_MENU_SUBJECTS.INVITE,
                topicPkfp: topicPkfp,
                inviteCode: inviteCode
            })
        },
        class: "invite-list-item",
        children: [
            inviteSVG,

            util.bake("div", {
                class: "invite-label",
                html: `Invite ${alias ? alias : inviteCode.substring(117, 147)}`
            })

        ],
        //////////////////////////
        // listeners: {         //
        //     "click": onclick //
        // },                   //
        //////////////////////////
        //
        //html: inviteCode.substr(117, )
    })
}


export function bakeParticipantListItem(data){
    let { nickname, participantPkfp, topicPkfp, alias, uxBus } = data;
    let iconClasses = ["side-panel-icon"]

    // This participant is self
    let isSelf = participantPkfp === topicPkfp
    if(isSelf){
        iconClasses.push("side-panel-icon-green");
    }

    let participantIcon = svgAsDOM(SVG.participantSVG)
    for(let cls of iconClasses) util.addClass(participantIcon, cls);

    return util.bake("div", {
        class: "participant-list-item",
        listeners: {
            click: ()=>uxBus.emit(UXMessage.PARTICIPANT_CLICK, {
                participantPkfp: participantPkfp,
                topicPkfp: topicPkfp
            }),
            dblclick: ()=>uxBus.emit(UXMessage.PARTICIPANT_DBLCLICK, {
                participantPkfp: participantPkfp,
                topicPkfp: topicPkfp
            })
        },
        attributes: {
            participantPkfp: participantPkfp,
            topicPkfp: topicPkfp
        },
        children: [
            participantIcon,

            util.bake("div", {
                class: "participant-label",
                children: [

                    util.bake("span", {
                        text: isSelf ? "(me)" : alias ? alias : `${pkfp.substring(0, 8)}`
                    }),

                    util.bake("span", {
                        text: "--"
                    }),

                    util.bake("span", {
                        text: nickname
                    }),
                ]
            })
        ]
    })
}

export function bakeTopicAssets(topic, uxBus){

    let topicAssets = util.bake("div", {
        class: "topic-assets",
        attributes: {
            pkfp: topic.pkfp
        }
    })

    for(let pkfp in topic.participants){
        let participantItem = bakeParticipantListItem({
            nickname: topic.getParticipantNickname(pkfp),
            alias: topic.getParticipantAlias(pkfp),
            participantPkfp: pkfp,
            topicPkfp: topic.pkfp,
            uxBus: uxBus
        })
        util.appendChildren(topicAssets, participantItem)
    }

    for(let inviteCode in topic.invites){
        let inviteItem = bakeInviteListItem(uxBus, topic.pkfp, inviteCode, topic.invites[inviteCode].name)
        util.appendChildren(topicAssets, inviteItem)
    }

    return topicAssets
}

export function bakeUnreadMessagesElement(num){
    return util.bake("span", {
        class: "unread-messages",
        text: num
    })
}

export function bakeSetAliasModal(okClick = Err.required("Ok handler required")){
    let clearFields = ()=>{
        let newAlias = util.$("#modal-alias-input");
        newAlias.value = "";
    };

    let wrap =  util.bake("div", {
        children: [
            util.bake("h2", {
                id: "modal-alias-title",
                text: "New alias"
            }),

            util.bake("p", {
                id: "modal-alias-for-label",
                class: "modal-alias-for-label"
            }),
            util.bake("input", {
                id: "modal-alias-input",
                class: "left-align",
                attributes:{
                    placeholder: "Enter new alias",
                    maxlength: "40",
                    required: true
                }
            }),

        ]
    })

    let form  = Modal.prepareModal(wrap, {
        closeMethods: ["button"],
        onOpen: clearFields,
        onClose: clearFields
    })

    form.addFooterBtn('Ok',
                      'tingle-btn tingle-btn--primary tingle-btn--pull-right',
                      okClick);
    return form
}

export function bakeTopicCreateModal(createClick){

    let clearFields = ()=>{
        let nickname = util.$("#new-topic-nickname");
        let topicName = util.$("#new-topic-name");
        nickname.value = "";
        topicName.value = ""
    };

    let wrap =  util.bake("div", {
        children: [
            util.bake("input", {
                id: "new-topic-name",
                class: "left-align",
                attributes:{
                    placeholder: "Enter topic name",
                maxlength: "255",
                    required: true
                }
            }),

            util.bake("input", {
                id: "new-topic-nickname",
                class: "left-align",
                attributes: {
                    placeholder: "Enter nickname",
                    maxlength: "255",
                    required: true
                }
            })
        ]
    })

    let form  = Modal.prepareModal(wrap, {
        closeMethods: ["button"],
        onOpen: clearFields,
        onClose: clearFields
    })

    form.addFooterBtn('Create topic',
                      'tingle-btn tingle-btn--primary tingle-btn--pull-right',
                      createClick);
    return form

}

export function bakeTopicJoinModal(joinClick){


    let clearFields = ()=>{
        let nickname = util.$("#join-topic-nickname");
        let topicName = util.$("#new-topic-name");
        let inviteCode = util.$("#join-topic-invite-code");
        nickname.value = "";
        topicName.value = "";
        inviteCode.value = "";
    };

    let wrap =  util.bake("div", {
        children: [

            util.bake("input", {
                id: "join-topic-invite-code",
                class: "left-align",
                attributes: {
                    placeholder: "Paste invite code",
                    maxlength: "255",
                    required: true
                }
            }),
            util.bake("input", {
                id: "join-topic-name",
                class: "left-align",
                attributes:{
                    placeholder: "Enter topic name",
                maxlength: "255",
                    required: true
                }
            }),

            util.bake("input", {
                id: "join-topic-nickname",
                class: "left-align",
                attributes: {
                    placeholder: "Enter nickname",
                    maxlength: "255",
                    required: true
                }
            })
        ]
    })

    let form  = Modal.prepareModal(wrap, {
        closeMethods: ["button"],
        onOpen: clearFields,
        onClose: clearFields
    })

    form.addFooterBtn('Join topic',
                      'tingle-btn tingle-btn--primary tingle-btn--pull-right',
                      joinClick);
    return form

}


function svgAsDOM(svgString){
    return util.bake("div", {
        html: svgString
    }).firstElementChild
}


export const BUTTON_IDS = {
    JOIN_TOPIC:  "btn-join-topic",
    NEW_TOPIC: "btn-new-topic",
    CTX_ALIAS:  "btn-ctx-alias",
    CTX_INVITE:  "btn-ctx-invite",
    CTX_DELETE:  "btn-ctx-delete",
    CTX_BOOT:  "btn-ctx-boot",
    SEND:  "send-new-msg",
    LOGIN: "vault-login-btn",
    REGISTER: "register-vault-btn",
    MAIN_MENU: "main-menu-button",
    MUTE_SOUND: "sound-control-btn",
    LOGOUT:  "logout-btn"

}

export const CONTEXT_MENU_SUBJECTS = {
    INVITE: Symbol("invite"),
    PARTICIPANT: Symbol("participant"),
    TOPIC: Symbol("topic")
}

//////////////////////////////////////////////
// export function bakeSettingsContainer(){ //
//     return util.bake("div", {            //
//         id: "settings-container",        //
//     })                                   //
// }                                        //
//////////////////////////////////////////////
