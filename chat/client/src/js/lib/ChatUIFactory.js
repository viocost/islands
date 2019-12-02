import * as util from "./dom-util"
import * as Modal from "./DynmaicModal";

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



export function bakeSidePanel(){
    let carousel = bakeCarousel()
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
                    util.bake("img", {
                        class: "logo",
                        attributes: {
                            src:  "/img/island.svg"
                        }
                    }),
                    util.bake("h3", {
                        text: "Islands v1.0.0"
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

            util.bake("div", {
                class:  [ "side-panel-button-row", "btn-top-row" ],
                children: [

                    util.bake("button", {
                        //New topic button
                        id: `btn-new-topic`,
                        class: ["side-panel-btn", "btn", "btn-top"],
                        text: "New topic",
                    }),

                    util.bake("button", {
                        //Join button
                        id: `btn-join-topic`,
                        class: ["side-panel-btn", "btn", "btn-top"],
                        text: "Join topic",
                    }),

                ]
            }),


            util.bake("h4", {
                class: "empty-block",
                text: "No topics yet",
                style: "display: none"
            }),

            util.bake("ul", {
                class: "side-block-data-list",
                id: `topics-list`,
            }),
        ]
    })
}


export function bakeParticipantListItem(nickname, pkfp, alias){
    return util.bake("li", {
        class: "participant-list-item",
        html: alias ? `${nickname} -- ${alias}` : `${nicknae} -- ${nickname.substring(0, 5)}`
    })
}

export function bakeInviteListItem(inviteCode, onclick){
    return util.bake("li", {
        class: "invite-list-item",
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
        class: "messages-panel-wrapper",
        children: [
            util.bake("div", {
                class: "messages-panel-container",
                children: util.bake("div", {
                    class: "messages-window",
                    id: "messages-window-1"
                })
            }),
            newMsgBlock
        ]
    })
}

export function bakeNewMessageControl(){
    return util.bake("div", {
        class: "new-message-container",
        children: [
            util.bake("div", {
                class: ["control-col", "new-msg-input"],
                children: [
                    util.bake("div", {
                        class: "select-member-wrap",
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
                        class: "input-wrap",
                        children: [
                            util.bake("div", {
                                class: "button-column",
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
                                class: ["flex-column", "new-msg-input"],
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
                class: ["control-col", "new-msg-buttons"],
                children: [
                    util.bake("div", {
                        class: "send-button-wrap",
                        children: [
                            util.bake("button", {
                                id: "send-new-msg",
                                class: "btn-send",
                                text: "Send"
                                //////////////////////////////////////////////////////
                                // children: [                                      //
                                //     util.bake("div", {                           //
                                //         //class: ["ld", "ld-ring", "ld-spin"], //
                                //         children: [                              //
                                //             util.bake("div", {                   //
                                //                 class: "attach-file-wrap"      //
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
                        class: "inputfile",
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
                        id: "vault-login-btn",
                        class: ["btn", "form-button"],
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
                util.bake("button", {
                    listeners: {
                        click: onRegisterClick
                    },
                    text: "Save",
                    class: ["btn", "form-button"],
                    id: "register-vault-btn",
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
                    util.bake("p", {
                        html: `Please, save your password!!!
        <br>There is no password recovery.<br>Once you lose it - it's gone forever!`
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

export function bakeHeaderLeftSection(menuClickHandler){
    return util.bake("div", {
        class: "header-section-left",
        children: [
            util.bake("div", {
                id: "menu-button",
                class: "menu-on",
                listeners: {
                    "click": ()=>{menuClickHandler("#menu-button")}
                }
            }),

            util.bake("div", {
                class: "connection-indicator-container",
                children: [
                    util.bake("div", {
                        id: "connection-indicator",
                        class: [ "connection-indicator", "unknown"]
                    }),
                    util.bake("h6", {
                        id: "connection-indicator-label",
                        class: "connection-indicator-label",
                        text: "Connection status unknown"
                    })
                ]

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
        class: "header-section-right",
    })

    util.appendChildren(rightSection, [

        util.bake("img", {
            id: "sound-control",
            src: isMute ? "/img/sound-off.svg" : "/img/sound-on.svg",
            listeners: {
                "click": muteHandler
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


export function bakeMainContainer(){
    return util.bake("div", {
        id: "main-container",
        class: ["container", "tingle-content-wrapper"],
        style: "display: flex"
    })
}


export function bakeTopicListItem(topic, onClick){
    return util.bake("li", {
        class: "side-block-data-list-item",
        attributes: {
            pkfp: topic.pkfp
        },
        listeners: {
            click: onClick
        },
        children: [
            util.bake("div", {
                children: [
                    util.bake("div", {
                        class: "btn-expand-topic",
                    }),
                    util.bake("span", {
                        class: "topic-name",
                        text: topic.name
                    }),

                    util.bake("span", {
                        class: "unread-messages",
                        text: "25"
                    })
                ]
            }),
            util.bake("div", {
                class: "topic-assests",
                children: [
                    util.bake("div", {

                    }),
                    util.bake("h5", {

                    })
                ]
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

export function bakeManageTopicsView(){
    return util.bake("div", {
        id: "manage-topics-view",
        style: "display: none",
        class: "manage-topics-view",
        children: [
            util.bake("h1", {
                html: "Manage topics"
            }),

            util.bake("div", {
                id: "manage-topics-list",
                class: "manage-topics-list",

            }),

            util.bake("div", {
                class: "buttons-row",
                children: [
                    util.bake("button", {
                        text: "Create new",
                        id: "btn-mng-create-topic",
                        class: ["btn"]
                    }),

                    util.bake("button", {
                        text: "Join",
                        id: "btn-mng-join-topic",
                        class: ["btn"]
                    }),
                    util.bake("button", {
                        text: "Rename",
                        id: "btn-mng-rename-topic",
                        class: ["btn"]
                    }),
                    util.bake("button", {
                        text: "Leave",
                        id: "btn-mng-leave-topic",
                        class: ["btn"]
                    }),
                    util.bake("button", {
                        text: "Delete",
                        id: "btn-mng-delete-topic",
                        class: ["btn"]
                    }),
                    util.bake("button", {
                        text: "Go back",
                        id: "btn-mng-topics-go-back",
                        class: ["btn"]
                    }),

                ]
            })
        ]
    })
}

export function bakeSettingsContainer(){
    return util.bake("div", {
        id: "settings-container",
    })
}
