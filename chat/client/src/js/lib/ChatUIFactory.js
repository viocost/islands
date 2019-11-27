import * as util from "./dom-util"
import * as Modal from "./DynmaicModal";

//Bakes select list for side panel
// top boolean whether it is select for top block
export function bakeCarousel(top=false){
    let idPrefix = top ? "top" : "bottom";
    let options = []
    if(top) options.push(util.bake("option", {text: "Topics"}))
    options.push(util.bake("option", {text: "Particiapnts"}))
    options.push(util.bake("option", {text: "Invites"}))

    return util.bake("div", {
        classes: "carousel-wrap",
        children: [
            util.bake("select", {
                classes: "carousel",
                id: `${idPrefix}-carousel`,
                children: options,
                listeners: {
                    "mousedown": (e)=>{
                        e.preventDefault();
                        window.focus();
                    }
                }
            }),
            util.bake("div", {
                id: `${idPrefix}-btn-rotate`,
                classes: ["arrow", "right", "btn-rotate"]
            })

        ]
    })

}



export function bakeSidePanel(){
    let carousel1 = bakeCarousel(true)
    let carousel2 = bakeCarousel()
    return util.bake("div", {
        classes: "side-panel-container",
        children: [
            util.bake("div", {
                classes: ["side-panel-section", "top-section"],

                id: "side-panel-top-section",
                children: [
                    carousel1,
                    //topics block
                    util.bake("div", {
                        classes: "side-block-wrap",
                        children: [
                            //topics block
                            bakeTopicsBlock("top"),

                            //members block
                            bakeParticipantsBlock("top"),

                            //invites block
                            bakeInvitesBlock("top")

                        ]
                    })
                ]
            }),


            util.bake("div", {
                id: "side-panel-bottom-section",
                classes: ["side-panel-section", "bottom-section"],
                children: [
                    carousel2,
                    util.bake("div", {
                        classes: "side-block-wrap",
                        children: [
                            //Optional topics block
                            //bakeTopicsBlock(newTopicHandler, joinTopicHandler),

                            //members block
                            bakeParticipantsBlock("bottom"),

                            // invites block
                            bakeInvitesBlock("bottom")
                        ]
                    })
                ]
            }),

            util.bake("div", {
                classes: "connection-indicator-container",
                children: [
                    util.bake("div", {
                        id: "connection-indicator",
                        classes: [ "connection-indicator", "unknown"]
                    }),
                    util.bake("h6", {
                        id: "connection-indicator-label",
                        classes: "connection-indicator-label",
                        text: "Connection status unknown"
                    })
                ]

            })

        ]
    })
}


// Bakes empty  topics block for side panel
function bakeTopicsBlock(idPrefix){

    return  util.bake("div", {
        classes: "side-panel-block",
        id: `${idPrefix}-topic-block`,
       
        children: [
            util.bake("h4", {
                class: "empty-block",
                text: "No topics yet",
                style: "display: none"
            }),

            util.bake("ul", {
                classes: "side-block-data-list",
                id: `${idPrefix}-topics-list`,
            }),
            util.bake("div", {
                classes:  "side-panel-button-row",
                children: [

                    util.bake("button", {
                        //New topic button
                        id: `${idPrefix}-btn-new`,
                        classes: ["side-panel-btn", "btn"],
                        text: "New topic",
                    }),

                    util.bake("button", {
                        //Join button
                        id: `${idPrefix}-btn-join`,
                        classes: ["side-panel-btn", "btn"],
                        text: "Join topic",
                    }),

                    util.bake("button", {
                        //Manage button
                        id: `${idPrefix}-btn-manage-topics`,
                        classes: ["side-panel-btn", "btn"],
                        text: "Manage",
                    }),
                ]
            })
        ]
    })
}


//Bakes empty invites block
function bakeInvitesBlock(idPrefix){
    return util.bake("div", {
        id: `${idPrefix}-invites-block`,
        classes: "side-panel-block",
        style: "display: none",
        children: [
            util.bake("h4", {
                class: "empty-block",
                text: "No topics yet",
                style: "display: none"
            }),

            util.bake("ul", {
                classes: "side-block-data-list",
                id: `${idPrefix}-invites-list`,

            }),

            util.bake("div", {
                classes: "side-control-block",
                children: [
                    util.bake("div", {
                        classes: "side-panel-button-row",
                        children: [
                            //New invite button
                            util.bake("button", {
                                classes: "side-panel-btn",
                                text: "New invite",
                                id: `${idPrefix}-btn-new-invite`
                            }),

                            //Refresh invites button
                            util.bake("button", {
                                classes: "side-panel-btn",
                                text: "Sync",
                                id: `${idPrefix}-btn-refresh-invites`
                            }),

                            util.bake("button", {
                                classes: "side-panel-btn",
                                text: "Manage",
                                id: `${idPrefix}-btn-manage-invites`
                            })
                        ]
                    })
                ]
            })
        ]
    })
}

function bakeParticipantsBlock(idPrefix){
    return util.bake("div", {
        id: `${idPrefix}-participants-block`,
        classes: "side-panel-block",
        style: "display: none",
        children: [
            util.bake("h4", {
                class: "empty-block",
                text: "No participants...",
                style: "display: none"
            }),

            util.bake("ul", {
                classes: "side-block-data-list",
                id: `${idPrefix}-member-list`,
            }),

            util.bake("div", {
                classes: "side-panel-button-row",
                children: [
                    //New invite button
                    util.bake("button", {
                        classes: "side-panel-btn",
                        text: "Manage",
                        id: `${idPrefix}-btn-manage-participants`
                    }),
                ]
            })
        ]
    })

}

export function bakeParticipantListItem(nickname, pkfp, alias){
    return util.bake("li", {
        classes: "participant-list-item",
        html: alias ? `${nickname} -- ${alias}` : `${nicknae} -- ${nickname.substring(0, 5)}`
    })
}

export function bakeInviteListItem(inviteCode, onclick){
    return util.bake("li", {
        classes: "invite-list-item",
        attributes: {
            "invite-code": inviteCode
        },
        listeners: {
            "click": onclick
        },
        html: inviteCode.substr(117)
    })
}

export function bakeMessagesPanel(newMsgBlock){
    return util.bake("div", {
        classes: "messages-panel-wrapper",
        children: [
            util.bake("div", {
                classes: "messages-panel-container",
                children: util.bake("div", {
                    classes: "messages-window",
                    id: "messages-window-1"
                })
            }),
            newMsgBlock
        ]
    })
}

export function bakeNewMessageControl(){
    return util.bake("div", {
        classes: "new-message-container",
        children: [
            util.bake("div", {
                classes: ["control-col", "new-msg-input"],
                children: [
                    util.bake("div", {
                        classes: "select-member-wrap",
                        children: [
                            util.bake("h4", {
                                html: "To"
                            }),
                            util.bake("select", {
                                id: "select-member",
                                attributes: {
                                    name: "participant"
                                },
                                children: [
                                    util.bake("option", {
                                        attributes: {
                                            value: "ALL",
                                            text: "All"
                                        }
                                    })
                                ]

                            })
                        ]
                    }),
                    util.bake("div", {
                        classes: "input-wrap",
                        children: [
                            util.bake("div", {
                                classes: "button-column",
                                children: [
                                    util.bake("label", {
                                        id: "attach-file-button",
                                        attributes: {
                                            for: "attach-file"
                                        },
                                        children: [
                                            util.bake("img", {
                                                attributes: {
                                                    src: "/img/clip.svg"
                                                }
                                            })
                                        ]
                                    })
                                ]
                            }),
                            util.bake("div", {
                                classes: ["flex-column", "new-msg-input"],
                                children: [
                                    util.bake("textarea", {
                                        id: "new-msg",
                                        attributes: {
                                            placeholder: "Enter your message. Ctrl+Enter - new line. Enter - send."
                                        }
                                    }),
                                    util.bake("div", {
                                        id: "chosen-files"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            util.bake("div", {
                classes: ["control-col", "new-msg-buttons"],
                children: [
                    util.bake("div", {
                        classes: "send-button-wrap",
                        children: [
                            util.bake("button", {
                                id: "send-new-msg",
                                classes: "btn-send",
                                text: "Send"
                                //////////////////////////////////////////////////////
                                // children: [                                      //
                                //     util.bake("div", {                           //
                                //         //classes: ["ld", "ld-ring", "ld-spin"], //
                                //         children: [                              //
                                //             util.bake("div", {                   //
                                //                 classes: "attach-file-wrap"      //
                                //             })                                   //
                                //         ]                                        //
                                //                                                  //
                                //     })                                           //
                                // ]                                                //
                                //////////////////////////////////////////////////////

                            })
                        ]
                    }),
                    util.bake("input", {
                        id: "attach-file",
                        classes: "inputfile",
                        attributes: {
                            type: "file",
                            name: "file",

                        }
                    })
                ]
            })

        ]

    })
}

export function bakeLoginBlock(loginClickHandler){
     return  util.bake("div", {
        id: "vault-login--wrapper",
        classes: "form-outer-wrapper",
        children: util.bake("div", {
            classes: "form-border",
            children: [
                util.bake("h3", {html: "Vault login:"}),
                util.bake("div",  {
                    children:  util.bake("input", {
                        id: "vault-password",
                        classes: "form-input",
                        attributes: {
                            type: "password",
                            placeholder: "Password",
                            maxlength: "50"
                        }
                    })
                }),
                util.bake("div", {
                    children: util.bake("button", {
                        id: "vault-login-btn",
                        classes: ["btn", "form-button"],
                        text: "Login",
                        listeners: {
                            "click": loginClickHandler
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
        classes: "form-outer-wrapper",
        children: util.bake("div", {
            classes: "form-border",
            children: [
                util.bake("h3", {
                    text: "Create password:"
                }),
                util.bake("input", {
                    id: "new-passwd",

                    classes: "form-input",
                    attributes: {
                        type: "password",
                        placeholder: "New password",
                        maxlength: "50"
                    }
                }),

                util.bake("input", {
                    id: "confirm-passwd",
                    classes: "form-input",
                    attributes: {
                        type: "password",
                        placeholder: "Confirm password",
                        maxlength: "50"
                    }
                }),
                util.bake("button", {
                    listeners: {
                        click: onRegisterClick
                    },
                    text: "Save",
                    classes: ["btn", "form-button"],
                    id: "register-vault-btn",
                })
            ]
        })
    })
}


export function bakeRegistrationSuccessBlock(okClick){
    return util.bake("div", {
        classes: "form-outer-wrapper",
        children: [
            util.bake("div", {
                classes: "form-border",
                children: [
                    util.bake("h3", {
                        text: "Vault created!"
                    }),
                    util.bake("p", {
                        html: `Please, save your password!!!
        <br>There is no password recovery.<br>Once you lose it - it's gone forever!`
                    }),
                    util.bake("button", {
                        text: "Ok",
                        listeners: {
                            click: okClick
                        },
                        classes: ["btn", "form-button"]
                    })
                ]
            })
        ]
    })
}

export function bakeHeaderLeftSection(menuClickHandler){
    return util.bake("div", {
        classes: "header-section-left",
        children: [
            util.bake("div", {
                id: "menu-button",
                classes: "menu-on",
                listeners: {
                    "click": ()=>{menuClickHandler("#menu-button")}
                }
            }),
            util.bake("h3", {
                id: "active-title"
            })
        ]
    })
}

export function bakeHeaderRightSection(
    isAdmin,
    isMute,
    infoHandler,
    muteHandler,
    settingsHandler,
    logoutHandler,
    adminLoginHandler
){
    let rightSection = util.bake("div", {
        classes: "header-section-right",
    })

    if (isAdmin){
        util.appendChildren(rightSection, [
            util.bake("img", {
                id: "admin",
                attributes: {
                    src: "/img/admin-user.svg"
                }
            })
        ])
    }

    util.appendChildren(rightSection, [
        util.bake("img", {
            classes: "logo",
            attributes: {
                src: "/img/island.svg"
            },
            listeners: {
                "click": infoHandler
            }
        }),

        util.bake("img", {
            id: "sound-control",
            src: isMute ? "/img/sound-off.svg" : "/img/sound-on.svg",
            listeners: {
                "click": muteHandler
            }
        }),

        util.bake("img", {
            id: "settings-btn",
            src: "/img/settings-light.svg",
            listeners: {
                "click": settingsHandler
            }
        }),

        util.bake("img", {
            id: "logout",
            src: "/img/logout-light.svg",
            listeners: {
                "click": logoutHandler
            }
        })
    ])
    return  rightSection
}

export function bakeSettingsContainer(){
    return util.bake("div", {
        id: "settings-container",
    })
}

export function bakeMainContainer(){
    return util.bake("div", {
        id: "main-container",
        classes: ["container", "tingle-content-wrapper"],
        style: "display: flex"
    })
}


export function bakeTopicListItem(topic, onClick){
    return util.bake("li", {
        classes: "side-block-data-list-item",
        attributes: {
            pkfp: topic.pkfp
        },
        listeners: {
            click: onClick
        },
        children: [
            util.bake("span", {
                classes: "topic-name",
                text: topic.name
            }),

            util.bake("span", {
                classes: "unread-messages",
                text: "25"
            })
        ]
    })

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
                classes: "left-align",
                attributes:{
                    placeholder: "Enter topic name",
                maxlength: "255",
                    required: true
                }
            }),

            util.bake("input", {
                id: "new-topic-nickname",
                classes: "left-align",
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
                classes: "left-align",
                attributes: {
                    placeholder: "Paste invite code",
                    maxlength: "255",
                    required: true
                }
            }),
            util.bake("input", {
                id: "join-topic-name",
                classes: "left-align",
                attributes:{
                    placeholder: "Enter topic name",
                maxlength: "255",
                    required: true
                }
            }),

            util.bake("input", {
                id: "join-topic-nickname",
                classes: "left-align",
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
