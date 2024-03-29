/**
 * Common UX functions
 */
import * as domUtil from "../lib/dom-util";
import toastr from "../lib/toastr";
import * as UI from "../lib/ChatUIFactory";
import { IError as Err, assert } from "../../../../common/IError"

export const INITIAL_MESSAGES_LOAD = 30

export function setUnreadMessagesIndicator(pkfp, num) {
    console.log("Setting unread messages indicator");
    let topicEl

    for (let topic of domUtil.$("#topics-list").children) {
        if (topic.getAttribute("pkfp") === pkfp) {
            topicEl = topic;
            break;
        }
    }
    if (!topicEl) {
        console.log(`Error: topic element with pkfp ${pkfp} is not found`);
        return
    }

    let unreadCounterLabel = topicEl.firstElementChild.children[3]

    domUtil.html(unreadCounterLabel, "");
    num ? unreadCounterLabel.appendChild(UI.bakeUnreadMessagesElement(num)) : 1 === 1;
}



export function newMessageBlockSetVisible(visible) {
    let display = !!visible ? "flex" : "none";
    domUtil.$("#new-message-container").style.display = display
}


export function resetUnreadCounter(pkfp, uxTopics) {
    console.log("Resetting unread messages counter");
    uxTopics[pkfp].unreadMessagesCount = 0
    setUnreadMessagesIndicator(pkfp, uxTopics[pkfp].unreadMessagesCount)
}


export function formatInviteAlias(inviteCode, alias=""){
    try{

        assert(typeof inviteCode === "string" &&  typeof alias === "string", "Invalid argument type")
        alias = alias.trim();
        assert(inviteCode.length > 0, "Invite length is invalid")
        let res = alias.length === 0 ? `Invite: ${inviteCode.substring(127, 136)}`: `Invite: ${alias}`
        return res.substring(0, 16)
    }catch(err){
        console.log("Unable to format alias");
        return ""
    }
}

export function formatParticipantAlias(topicPkfp,
                                       participantPkfp,
                                       alias=""){
    try{

        assert(typeof topicPkfp === "string" && typeof participantPkfp === "string" && typeof alias === "string", "Invalid argument type")
        let isSelf = topicPkfp === participantPkfp;
        alias = alias.trim();
        let res =  isSelf ? "(me)" : alias ? alias : `${participantPkfp.substring(0, 8)}`
        return res.substring(0, 16)
    }catch{
        console.log("Unable to format alias");
        return ""
    }
}

export function formatParticipantNickname(nickname=""){
    if(typeof nickname !== "string"){
        return "NICKNAME TYPE INVALID"
    }

    nickname = nickname.trim()
    let res = nickname.length > 0 ? nickname : "Unknown"
    return res.substring(0, 16)
}

export function setInviteAlias(invite){
    try{
        let inviteEl = domUtil.$(`.invite-list-item[code="${invite.getCode()}"]`)
        domUtil.$(".invite-label", inviteEl).innerText = formatInviteAlias(invite.getCode(), invite.getAlias())
    }catch(err){
        console.log("Unable to set invite alias");
    }
}


export function setParticipantAlias(topic, participant, alias){
    let participantElement = domUtil.$(`.participant-list-item[participantpkfp="${participant.pkfp}"]`)
    let aliasElement = domUtil.$(".p-alias", participantElement)
    let messagesPanel = domUtil.$(`.messages-panel-container[pkfp="${topic.pkfp}"]`)
    let formatedAlias = formatParticipantAlias(topic.pkfp, participant.pkfp, alias);
    aliasElement.innerText = formatedAlias

    let messages = Array.from(domUtil.$$(".message", messagesPanel)).filter(msg=>domUtil.$(".m-author-id", msg).innerText === participant.pkfp)
    for (let message of messages){
        let aliasEl = domUtil.$(".m-alias", message);
        if(aliasEl){
            aliasEl.innerText = formatedAlias
        }
    }
}


export function setParticipantNickname(topic, participant, nickname){
    let participantElement = domUtil.$(`.participant-list-item[participantpkfp="${participant.pkfp}"]`)
    let aliasElement = domUtil.$(".p-nickname", participantElement)
    aliasElement.innerText = formatParticipantNickname(nickname);
}


export function copyInviteCodeToClipboard(inviteCode){
    let textArea = document.createElement("textarea");
    textArea.value = inviteCode;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand("copy");
        console.log("Invite code has been copied");

        toastr.info("Invite code has been copied to the clipboard");
    } catch (err) {
        toastr.error("Error copying invite code to the clipboard");
    }
    textArea.remove();
}



/**
 * displays certain context buttons on the topicsPanel.
 * state must be a string, and must have following values:
 *    "none" - hide all buttons
 *    "topic" - show Alias, Invite, Mute, Leave, Delete
 *    "invite" - show Alias, Delete
 *    "participant" - show Alias, Mute, Boot only if user has rights to boot
 * displayBoot - boolean whether user has rights to boot
 */
export function displayTopicContextButtons(state, displayBoot = false) {
    let alias = domUtil.$("#btn-ctx-alias");
    let invite = domUtil.$("#btn-ctx-invite");
    let mute = domUtil.$("#btn-ctx-mute");
    let boot = domUtil.$("#btn-ctx-boot");
    let _delete = domUtil.$("#btn-ctx-delete");
    let leave = domUtil.$("#btn-ctx-leave");

    switch (state) {
        case "none":
            domUtil.hide(alias);
            domUtil.hide(invite);
            domUtil.hide(mute);
            domUtil.hide(boot);
            domUtil.hide(_delete);
            domUtil.hide(leave);
            break;
        case "topic":
            domUtil.flex(alias);
            domUtil.flex(invite);
            domUtil.hide(mute);
            domUtil.hide(boot);
            domUtil.flex(_delete);
            domUtil.hide(leave);
            break;

        case "invite":
            domUtil.flex(alias);
            domUtil.hide(invite);
            domUtil.hide(mute);
            domUtil.hide(boot);
            domUtil.flex(_delete);
            domUtil.hide(leave);
            break;

        case "participant":
            domUtil.flex(alias);
            domUtil.hide(invite);
            domUtil.flex(mute);
            domUtil.flex(boot);
            domUtil.hide(_delete);
            domUtil.hide(leave);
            break;
        default:
            throw new Error(`Invalid state: ${state}`)
    }
}


export function toggleTopicExpand(pkfp){

    console.log("Expanding topic");
    let topicsList = domUtil.$("#topics-list")
    let topicEl = Array.from(domUtil.$$(".side-block-data-list-item", topicsList)).filter(el=>el.getAttribute("pkfp") === pkfp)[0]
    let topicAssets = Array.from(domUtil.$$(".topic-assets", topicsList)).filter(el=>el.getAttribute("pkfp") === pkfp)[0]

    // adding topic-assets-expanded makes topic assets visible
    domUtil.toggleClass(topicAssets, "topic-assets-expanded")

    domUtil.toggleDisplay(topicEl.firstElementChild.children[0])
    domUtil.toggleDisplay(topicEl.firstElementChild.children[1])
    //here we are replacing + icon to minus if expanding


}



export const UXMessage = {
    TO_LOGIN: Symbol("to_login"),
    TO_REGISTRATION: Symbol("to_registration"),
    CONNECTION_LOST: Symbol("conn_lost"),
    LOGIN_CLICK: Symbol("login_click"),
    LOGIN_PROGRESS: Symbol("login_progress"),
    LOGIN_SUCCESS: Symbol("login_success"),
    LOGIN_ERROR: Symbol("login_error"),
    REGISTER_CLICK: Symbol("reg_click"),
    REGISTER_PROGRESS: Symbol("reg_prog"),
    REGISTER_SUCCESS: Symbol("reg_succ"),
    REGISTER_ERROR: Symbol("reg_err"),
    BUTTON_CLICK: Symbol("btn_click"),
    BUTTON_DBL_CLICK: Symbol("btndbl_click"),
    CREATE_TOPIC_REQUEST: Symbol("create_topic_request"),

    TOPIC_JOIN_REQUEST: Symbol("topic_join_request"),
    TOPIC_JOIN_SUCCESS: Symbol("topic_join_success"),
    TOPIC_LOADED: Symbol("topic_loaded"),

    TOGGLE_MUTE: Symbol("toggle_mute"),

    // Main menu click message
    MAIN_MENU_CLICK: Symbol("main_menu_click"),

    // Event fired when user clicks on topic list item on the side panel
    TOPIC_CLICK: Symbol("topic_click"),
    // Double click on toipc list item on the side panel
    TOPIC_DBLCLICK: Symbol("topic_double_click"),

    //User clicks on expand/collapse icon on topic list item
    TOPIC_EXPAND_ICON_CLICK: Symbol("topic_expand_icon_click"),

    PARTICIPANT_CLICK: Symbol("participant_click"),
    PARTICIPANT_DBLCLICK: Symbol("participant_dblclick"),
    INVITE_CLICK: Symbol("invite_click"),
    INVITE_DBLCLICK: Symbol("invite_dblclick"),
    CONTEXT_MENU: Symbol("context_menu"),
    SEND_BUTTON_CLICK: Symbol("send_button_click"),
    ATTACH_FILE_ICON_CLICK: Symbol("attach_file"),
    CANCEL_PRIVATE_MESSAGE: Symbol("private_cancel"),
    MESSAGE_AREA_KEY_PRESS: Symbol("msg_key_press"),

    CHAT_SCROLL: Symbol("chat_scroll"),

    //UX Requests for messages
    GET_LAST_MESSAGES: Symbol("get_last_messages"),
    LAST_MESSAGES_RESPONSE: Symbol("get_last_messages"),
    NEW_MESSAGE: Symbol("new_message"),


    SEND_CHAT_MESSAGE: Symbol("send_chat_message"),

    INVITE_REQUEST: Symbol("invite_request"),
    INVITE_CREATED: Symbol("invite_created"),

    DELETE_TOPIC: Symbol("delete_topic"),
    DELETE_INVITE: Symbol('delete_invite'),

    RENAME_TOPIC: Symbol("rename_topic"),
    SET_PARTICIPANT_ALIAS: Symbol("set_participant_alias"),
    CHANGE_MY_NICKNAME: Symbol("change_my_nickname"),
    SET_INVITE_ALIAS: Symbol("set_invite_alias"),
    BOOT_PARTICIPANT: Symbol("boot_participant")
}
