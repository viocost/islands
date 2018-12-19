/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function($) {/* harmony import */ var cute_set__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var cute_set__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cute_set__WEBPACK_IMPORTED_MODULE_0__);
//Viendors

//import { $ } from "jquery";
//import { toastr } from "toastr";
//import { io } from "socket.io-client";
//import { bar } from "loading-bar";
//import { waitMe } from "./lib/waitMe.min"
//import { WildEmitter } from "./chat/WildEmitter";

const ChatClient = __webpack_require__(5).default;




//chat page


let chat;

const DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//variables to create new topic
let nickname, topicName;

//variables to topic login
let topicID;

let sounds = {};

let soundsOnOfIcons = {
    on: "/img/sound-on.png",
    off: "/img/sound-off.png"
};

let sendLock = false;

let mainMenuItems = [{
    index: 0,
    subtitle: "Login",
    selector: "#login-container",
    active: true
}, {
    index: 1,
    subtitle: "Join",
    selector: "#join-by-invite-container",
    active: false
}, {
    index: 2,
    subtitle: "New",
    selector: "#new-topic-container",
    active: false
}];

let tempName;

let recording = false;

//variables to display new topic data
//let newPubKey, newPrivKey, newNickname, newTopicID, newTopicName;

document.addEventListener('DOMContentLoaded', event => {
    console.log('initializing chat....');
    chat = new ChatClient();
    loadSounds();
    setView("auth");
    setupChatListeners(chat);
    document.querySelector('#create-topic').addEventListener('click', createTopic);
    document.querySelector('#login-topic').addEventListener('click', topicLogin);
    document.querySelector('#join-topic').addEventListener('click', joinTopic);
    document.querySelector('#send-new-msg').addEventListener('click', sendMessage);
    document.querySelector('#close-code-view').addEventListener('click', closeCodeView);
    document.querySelector('#new-invite').addEventListener('click', generateInvite);
    document.querySelector('#user-name').addEventListener('change', editMyNickname);
    document.querySelector('#topic-name').addEventListener('change', editTopicName);
    document.querySelector('#refresh-invites').addEventListener('click', refreshInvites);
    document.querySelector('#attach-file').addEventListener('change', processAttachmentChosen);
    document.querySelector('#re-connect').addEventListener('click', attemptReconnection);
    document.querySelector('#sounds-switch').addEventListener('click', switchSounds);
    document.querySelector('.right-arrow-wrap').addEventListener('click', processMainMenuSwitch);
    document.querySelector('.left-arrow-wrap').addEventListener('click', processMainMenuSwitch);

    $('#new-msg').keydown(function (e) {
        if (!e.ctrlKey && e.keyCode === 13) {
            event.preventDefault();
            sendMessage();
            moveCursor(e.target, "start");
            return false;
        } else if (e.ctrlKey && e.keyCode === 13) {
            e.target.value += "\n";
            moveCursor(e.target, "end");
        }
    });
    $('#chat_window').scroll(processChatScroll);
    $('#private-key').keyup(async e => {
        if (e.keyCode === 13) {
            await topicLogin();
        }
    });

    $('#join-nickname, #invite-code').keyup(async e => {
        if (e.keyCode === 13) {
            await joinTopic();
        }
    });

    $('#new-topic-nickname, #new-topic-name').keyup(async e => {
        if (e.keyCode === 13) {
            createTopic();
        }
    });

    enableSettingsMenuListeners();
});

function loadSounds() {
    let sMap = {
        "incoming_message": "message_incoming.mp3",
        "message_sent": "message_sent.mp3",
        "user_online": "user_online.mp3"
    };

    for (let s of Object.keys(sMap)) {
        sounds[s] = new Audio("/sounds/" + sMap[s]);
        sounds[s].load();
    }
}

function playSound(sound) {
    if (chat.session.settings.soundsOn) {
        sounds[sound].play();
    }
}

function moveCursor(el, pos) {
    if (pos === "end") {
        moveCursorToEnd(el);
    } else if (pos === "start") {
        moveCursorToStart(el);
    }
}

function moveCursorToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        let range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function moveCursorToStart(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = 0;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        let range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function createTopic() {
    nickname = document.querySelector('#new-topic-nickname').value.trim();
    topicName = document.querySelector('#new-topic-name').value.trim();
    loadingOn();
    chat.initTopic(nickname, topicName).then(data => {
        console.log("Topic create attempt successful");
        nickname.value = "";
        topicName.value = "";
    }).catch(err => {
        console.log("Error creating topic: " + err);
        loadingOff();
    });
}

async function topicLogin() {
    loadingOn();
    console.log("called topic login");
    let privKey = document.querySelector('#private-key').value;
    clearLoginPrivateKey();
    await chat.topicLogin(privKey);
}

async function joinTopic() {
    let inviteCode = document.querySelector('#invite-code').value.trim();
    let nickname = document.querySelector('#join-nickname').value.trim();
    loadingOn();
    try {
        let data = await chat.initTopicJoin(nickname, inviteCode);
    } catch (err) {
        toastr.error("Topic was not created. Error: " + err);
        loadingOff();
    }
}

function setupChatListeners(chat) {
    chat.on("init_topic_success", data => {
        loadingOff();
        displayNewTopicData(data);
    });
    chat.on("init_topic_error", err => {
        let msg;
        if (err instanceof Error) {
            msg = err.message;
        } else {
            msg = err;
        }
        loadingOff();
        toastr.error("Topic was not created. Error: " + msg);
    });

    chat.on("login_success", messages => {
        document.querySelector('#sounds-switch').src = chat.session.settings.soundsOn ? soundsOnOfIcons.on : soundsOnOfIcons.off;
        loadingOff();
        clearAllInputs();
        processLogin(messages);
        playSound("user_online");
        toastr.success("You are now online!");
    });

    chat.on("unknown_error", err => {
        console.log("unknown_error emited by chat: " + err);
        toastr.error("Chat error: " + err);
    });
    chat.on("login_fail", err => {
        clearLoginPrivateKey();
        loadingOff();
        console.log("Login fail emited by chat: " + err);
        toastr.error("Login fail: " + err);
    });

    chat.on('request_invite_success', inviteID => {
        buttonLoadingOff(document.querySelector("#new-invite"));
        showInviteCode(inviteID);
    });

    chat.on('invite_updated', () => {
        toastr.info("Invite updated!");
    });

    chat.on("new_member_joined", data => {
        processNewMemberJoin(data);
    });

    chat.on("settings_updated", () => {
        updateParticipants();
        syncPendingInvites();
        updateLoadedMessages();
    });

    chat.on("participant_booted", message => {
        updateParticipants();
        toastr.info(message);
    });

    chat.on("metadata_updated", () => {
        updateParticipants();
        updateLoadedMessages();
    });

    chat.on("boot_participant_success", message => {
        updateParticipants();
        toastr.info(message);
    });

    chat.on("u_booted", message => {
        toastr.warning(message);
    });

    chat.on("boot_participant_fail", message => {
        toastr.warning("Participant booting failed: " + message);
    });

    chat.on("topic_join_success", data => {
        processTopicJoinSuccess(data);
    });

    chat.on("del_invite_fail", () => {
        toastr.warning("Error deleting invite");
    });

    chat.on("del_invite_success", () => {
        syncPendingInvites();
        toastr.info("Invite was deleted");
    });

    chat.on("chat_message", data => {
        processIncomingMessage(data);
        playSound("incoming_message");
    });

    chat.on("send_success", message => {
        playSound("message_sent");
        messageSendSuccess(message);
    });

    chat.on("send_fail", message => {
        messageSendFail(message);
    });

    chat.on("service_record", record => {
        processServiceRecord(record);
    });

    chat.on("sync_invites_success", () => {
        refreshInvitesSuccess();
    });

    chat.on("sync_invites_error", msg => {
        buttonLoadingOff(document.querySelector('#refresh-invites'));
        toastr.warning("Invite request failed: " + msg);
    });

    chat.on("request_invite_error", msg => {
        buttonLoadingOff(document.querySelector('#new-invite'));
        toastr.warning("Invite request failed: " + msg);
    });

    chat.on("messages_loaded", messages => {
        processMessagesLoaded(messages);
    });

    chat.on("connected_to_island", () => {
        switchConnectionStatus(true);
    });

    chat.on("disconnected_from_island", () => {
        switchConnectionStatus(false);
    });

    chat.on("download_complete", res => {
        let fileInfo = JSON.parse(res.fileInfo);
        let fileData = res.fileData;
        if (/audio/.test(fileInfo.type)) {
            loadAudio(fileInfo, fileData);
        } else {
            downloadAttachment(fileInfo.name, fileData);
        }
    });
}
function processIncomingMessage(message) {
    let pkfp = message.header.author;
    let storedNickname = chat.getMemberNickname(pkfp);
    if (storedNickname !== message.header.nickname) {
        chat.setMemberNickname(pkfp, message.header.nickname);
        storedNickname = chat.getMemberNickname(pkfp);
        chat.saveClientSettings(chat.session.publicKeyFingerprint);
    }
    let alias = chat.getMemberAlias(pkfp);
    let timestamp = message.header.timestamp;
    appendMessageToChat({
        nickname: storedNickname,
        alias: alias,
        timestamp: timestamp,
        pkfp: pkfp,
        body: message.body,
        messageID: message.header.id,
        private: message.header.private,
        recipient: message.header.recipient,
        attachments: message.attachments
    });

    toastr["info"]("New message from " + chat.getMemberRepr(pkfp));
}

function processServiceRecord(record) {
    let timestamp = record.header.timestamp;
    let pkfp = record.header.author;
    appendMessageToChat({
        nickname: "Service",
        timestamp: timestamp,
        messageID: record.header.id,
        pkfp: "service",
        body: record.body,
        service: record.header.service,
        attachments: record.attachments
    });
}

function sendMessage() {
    ensureConnected();
    if (sendLock) {
        return;
    }
    lockSend(true);
    let message = document.querySelector('#new-msg');
    let attachments = document.querySelector('#attach-file').files;
    let addresseeSelect = document.querySelector("#select-member");
    let addressee = addresseeSelect[addresseeSelect.selectedIndex].value;

    if (message.value.trim() === "" && attachments.length === 0) {
        lockSend(false);
        return;
    }

    if (addressee === "ALL") {
        chat.shoutMessage(message.value.trim(), attachments).then(() => {
            console.log("Send message resolved");
        }).catch(err => {
            console.log("Error sending message" + err.message);
            lockSend(false);
        });
    } else {
        chat.whisperMessage(addressee, message.value.trim()).then(() => {
            console.log("Done whispering message!");
        }).catch(err => {
            console.log("Error sending message" + err.message);
            lockSend(false);
        });
    }

    message.value = "";
}

function messageSendSuccess(message) {
    let pkfp = message.header.author;
    let nickname = chat.getMemberNickname(pkfp) || message.header.nickname;

    let timestamp = message.header.timestamp;

    appendMessageToChat({
        nickname: nickname,
        timestamp: timestamp,
        pkfp: pkfp,
        body: message.body,
        messageID: message.header.id,
        attachments: message.attachments,
        private: message.header.private,
        recipient: message.header.recipient
    });
    clearAttachments();
    lockSend(false);
}

function messageSendFail(message) {
    console.log("Message send fail");
    lockSend(false);
}

function get_current_time() {
    let d = new Date();
    return padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
}

function getChatFormatedDate(timestamp) {
    let d = new Date(timestamp);
    let today = new Date();
    if (Math.floor((today - d) / 1000) <= 64000) {
        return d.getHours() + ':' + padWithZeroes(2, d.getMinutes());
    } else {
        return DAYSOFWEEK[d.getDay()] + ", " + d.getMonth() + "/" + padWithZeroes(2, d.getDate()) + " " + padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
    }
}

function padWithZeroes(requiredLength, value) {
    let res = "0".repeat(requiredLength) + String(value).trim();
    return res.substr(res.length - requiredLength);
}

function isMyMessage(pkfp) {
    return chat.session.publicKeyFingerprint === pkfp;
}

function processNewMemberJoin() {
    if (!chat.session) {
        console.log("Not logged in, nothing to update");
        return;
    }
    console.log("NEW MEMBER JOINED. UPDATING INFO");
    updateParticipants();
    syncPendingInvites();
    toastr.info("New member just joined the channel!");
}

function bootParticipant(event) {
    console.log("About to boot participant");
    ensureConnected();
    let participantPkfp = event.target.parentElement.parentElement.lastElementChild.innerHTML;
    let participant = chat.session.settings.membersData[participantPkfp];

    if (participantPkfp == chat.session.publicKeyFingerprint) {
        if (confirm("Are you sure you want to leave this topic?")) {
            console.log("Leaving topic");
            return;
        }
    }

    if (confirm("Are you sure you want to boot " + participant + "? ")) {
        chat.bootParticipant(participantPkfp);
    }
}

function addParticipantToSettings(key) {

    let records = document.querySelector("#participants-records");
    let participant = chat.session.metadata.participants[key];
    if (!participant) {
        console.error("Error adding participant");
        return;
    }

    let wrapper = document.createElement("div");
    let id = document.createElement("div");
    let nickname = document.createElement("div");
    let rights = document.createElement("div");
    let actions = document.createElement("div");
    let delButton = document.createElement("div");

    id.setAttribute("class", "participant-id");
    wrapper.setAttribute("class", "participant-wrapper");
    nickname.setAttribute("class", "p-nickname");
    rights.setAttribute("class", "p-rights");
    actions.setAttribute("class", "p-actions");
    delButton.setAttribute("class", "boot-participant");
    delButton.addEventListener("click", bootParticipant);

    nickname.innerHTML = chat.getMemberRepr(key);
    rights.innerHTML = participant.rights;
    delButton.innerHTML = "Boot";
    id.innerHTML = key;
    wrapper.appendChild(id);
    wrapper.appendChild(nickname);
    wrapper.appendChild(rights);
    actions.appendChild(delButton);
    wrapper.appendChild(actions);
    wrapper.appendChild(id);
    records.appendChild(wrapper);
}

function updateParticipants() {
    $('#online-users-list').html("");
    $('#participants-records').html("");
    $('#participants--topic-name').html("Topic: " + chat.session.settings.topicName);

    let mypkfp = chat.session.publicKeyFingerprint;
    let participantsKeys = Object.keys(chat.session.metadata.participants).filter(val => {
        return val !== mypkfp;
    });

    let recipientChoice = document.querySelector("#select-member");
    let defaultRecipient = document.createElement("option");
    defaultRecipient.setAttribute("value", "ALL");
    defaultRecipient.innerText = "All";
    recipientChoice.innerHTML = "";
    recipientChoice.appendChild(defaultRecipient);

    for (let pkfp of participantsKeys) {
        addParticipantToSettings(pkfp);
        let participantId = document.createElement("span");
        participantId.classList.add("online-user-id");
        participantId.innerText = pkfp;
        let status = document.createElement("img");
        status.classList.add("participant-status");
        status.setAttribute("src", "/img/online.png");

        let pName = document.createElement("input");

        pName.value = chat.getMemberAlias(pkfp) || chat.getMemberNickname(pkfp) || "Anonymous";
        pName.addEventListener("change", participantAliasChange);
        pName.classList.add("participant-alias");

        let pRow = document.createElement("div");
        pRow.classList.add("online-user-row");
        pRow.appendChild(participantId);
        pRow.appendChild(status);
        pRow.appendChild(pName);

        if (chat.getMemberAlias(pkfp)) {
            let chosenName = document.createElement("span");
            chosenName.innerText = "(" + (chat.getMemberNickname(pkfp) || "Anonymous") + ")";
            pRow.appendChild(chosenName);
        }

        document.querySelector("#online-users-list").appendChild(pRow);

        //Adding to list of recipients
        let recipientOption = document.createElement("option");
        recipientOption.setAttribute("value", pkfp);
        recipientOption.innerText = pName.value + " (" + chat.getMemberNickname(pkfp) + ")";
        recipientChoice.appendChild(recipientOption);
    }
    let participantsRecords = document.querySelector("#participants-records");
    if (participantsRecords.children.length > 0) {
        participantsRecords.lastChild.classList.add("participant-wrapper-last");
    }
}

function updateLoadedMessages() {

    document.querySelector("#chat_window").childNodes.forEach(msg => {
        if (msg.classList.contains("service-record")) {
            return;
        } else if (msg.classList.contains("my_message")) {
            if (!msg.classList.contains("private-message")) {
                return;
            }
            try {
                let heading = msg.firstChild;
                let pkfp = heading.querySelector(".m-recipient-id").innerHTML;
                heading.querySelector(".private-mark").innerText = "(private to " + chat.getMemberAlias(pkfp) + ")";
            } catch (err) {
                console.error(err);
            }
        } else {
            try {
                let heading = msg.firstChild;
                let pkfp = heading.querySelector(".m-author-id").innerHTML;
                heading.querySelector(".m-alias").innerText = chat.getMemberAlias(pkfp);
            } catch (err) {
                console.error(err);
            }
        }
    });
}

function processLogin(messages) {
    setView("chat");
    let nickName = chat.session.settings.nickname;
    $('#user-name').val(nickName);
    $('#topic-name').val(chat.session.settings.topicName);
    if (chat.session.metadata.topicName) document.title = chat.session.metadata.topicName;
    updateParticipants();
    setNavbarListeners();
    syncPendingInvites();
    onLoginFillParticipants();
    onLoginLoadMessages(messages);
}

function processMessagesLoaded(messages) {
    while (messages.length > 0) {
        let message = messages.shift();
        try {
            message = typeof message === "string" ? JSON.parse(message) : message;
        } catch (err) {
            console.log("Could not parse json. Message: " + messages[messages.length - i - 1]);
            continue;
        }
        let authorPkfp = message.header.author;
        let alias = isMyMessage(authorPkfp) ? chat.getMemberNickname(authorPkfp) : chat.getMemberRepr(authorPkfp);
        appendMessageToChat({
            nickname: message.header.nickname,
            alias: alias,
            body: message.body,
            timestamp: message.header.timestamp,
            pkfp: message.header.author,
            service: message.header.service,
            private: message.header.private,
            recipient: message.header.recipient,
            messageID: message.header.id,
            attachments: message.attachments
        }, true);
    }
}

function processLogout() {
    console.log("Processing logout");
    document.querySelector('#chat_window').innerHTML = "";
    chat.logout();
    setView("auth");
    toastr["info"]("You have successfully logged out!");
}

function setNavbarListeners() {
    $('#chat-view-button').click(() => {
        setView("chat");
    });
    $('#settings-view-button').click(() => {
        setView("settings");
    });

    $('#logout-button').click(() => {
        processLogout();
    });
}

function onLoginLoadMessages(messages) {
    document.querySelector("#chat_window").innerHTML = "";
    for (let i = 0; i < messages.length; ++i) {
        let message;
        try {
            message = typeof messages[messages.length - i - 1] === "string" ? JSON.parse(messages[messages.length - i - 1]) : messages[messages.length - i - 1];
        } catch (err) {
            console.log("Could not parse json. Message: " + messages[messages.length - i - 1]);
            continue;
        }
        const pkfp = message.header.author;
        const alias = isMyMessage(pkfp) ? chat.getMemberNickname(pkfp) : chat.getMemberRepr(pkfp);

        appendMessageToChat({
            nickname: message.header.nickname,
            alias: alias,
            body: message.body,
            timestamp: message.header.timestamp,
            pkfp: message.header.author,
            messageID: message.header.id,
            service: message.header.service,
            private: message.header.private,
            recipient: message.header.recipient,
            attachments: message.attachments
        });
    }
}

function onLoginFillParticipants() {}

/**
 * Appends message onto the chat window
 * @param message: {
 *  nickname: nickname
 *  body: body
 *  pkfp: pkfp
 * }
 */
function appendMessageToChat(message, toHead = false) {
    let chatWindow = document.querySelector('#chat_window');
    let msg = document.createElement('div');
    let message_id = document.createElement('div');
    let message_body = document.createElement('div');

    message_body.classList.add('msg-body');
    let message_heading = buildMessageHeading(message);

    if (isMyMessage(message.pkfp)) {
        // My message
        msg.classList.add('my_message');
    } else if (message.service) {
        msg.classList.add('service-record');
    } else {
        //Not my Message
        msg.classList.add('message');
        let author = document.createElement('div');
        author.classList.add("m-author-id");
        author.innerHTML = message.pkfp;
        message_heading.appendChild(author);
    }
    if (message.private) {
        let privateMark = preparePrivateMark(message);
        message_heading.appendChild(privateMark);
        msg.classList.add('private-message');
    }

    message_id.classList.add("message-id");
    message_id.innerHTML = message.messageID;
    message_heading.appendChild(message_id);
    message_body.appendChild(processMessageBody(message.body));
    //msg.innerHTML = '<b>'+message.author +'</b><br>' + message.message;

    //processing attachments
    let attachments = processAttachments(message.attachments);
    msg.appendChild(message_heading);
    msg.appendChild(message_body);
    if (attachments !== undefined) {
        msg.appendChild(attachments);
    }

    if (toHead) {
        chatWindow.insertBefore(msg, chatWindow.firstChild);
    } else {
        chatWindow.appendChild(msg);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

function buildMessageHeading(message) {
    let message_heading = document.createElement('div');
    message_heading.classList.add('msg-heading');

    let alias, aliasNicknameDevisor;
    if (message.alias) {
        alias = document.createElement("b");
        alias.classList.add("m-alias");
        alias.innerText = message.alias;
        aliasNicknameDevisor = document.createElement("span");
        aliasNicknameDevisor.innerText = "  --  ";
    }

    let nickname = document.createElement("b");
    nickname.innerText = message.nickname;
    nickname.classList.add("m-nickname");

    let time_stamp = document.createElement('span');
    time_stamp.innerHTML = getChatFormatedDate(message.timestamp);
    time_stamp.classList.add('msg-time-stamp');

    if (isMyMessage(message.pkfp)) {
        message_heading.appendChild(time_stamp);
        message_heading.appendChild(nickname);
    } else if (message.service) {
        message_heading.innerHTML += '<b>Service  </b>';
        message_heading.appendChild(time_stamp);
    } else {
        //Not my Message
        if (message.alias) {
            message_heading.appendChild(alias);
            message_heading.appendChild(aliasNicknameDevisor);
        }
        message_heading.appendChild(nickname);
        message_heading.appendChild(time_stamp);
    }
    if (message.recipient && message.recipient !== "ALL") {
        let recipientId = document.createElement("div");
        recipientId.innerHTML = message.recipient;
        recipientId.classList.add("m-recipient-id");
        message_heading.appendChild(recipientId);
    }
    return message_heading;
}

function preparePrivateMark(message) {
    let privateMark = document.createElement("span");
    privateMark.classList.add("private-mark");
    if (isMyMessage(message.pkfp)) {
        privateMark.innerText = "(private to: ";
        let recipientName = chat.getMemberRepr(message.recipient);
        privateMark.innerText += recipientName + ")";
    } else {
        privateMark.innerText = "(private)";
    }
    return privateMark;
}

/**
 * Click handler when user clicks on attached file
 * @param ev
 * @returns {Promise<void>}
 */

async function downloadOnClick(ev) {
    console.log("Download event triggered!");
    let target = ev.target;
    while (target && !target.classList.contains("att-view")) {
        target = target.parentNode;
    }

    if (!target) {
        throw "att-view container not found...";
    }
    let fileInfo = target.nextSibling.innerHTML; //Extract fileInfo from message
    console.log("obtained fileinfo: " + fileInfo);
    let file = await chat.downloadAttachment(fileInfo); //download file
}

/**
 * Processes all the attachments and returns
 * attachments wrapper which can be appended to a message
 * If no attachments are passed - returns undefined
 * @param attachments
 * @returns {*}
 */
function processAttachments(attachments) {
    if (attachments === undefined) {
        return undefined;
    }

    let getAttachmentSize = function (size) {
        let res = "";
        size = parseInt(size);
        if (size < 1000) {
            res = size.toString() + "b";
        } else if (size < 1000000) {
            res = Number((size / 1000).toFixed(1)).toString() + "kb";
        } else if (size < 1000000000) {
            res = Number((size / 1000000).toFixed(1)).toString() + "mb";
        } else {
            res = Number((size / 1000000000).toFixed(1)).toString() + "gb";
        }
        return res;
    };

    let attachmentsWrapper = document.createElement("div");
    attachmentsWrapper.classList.add("msg-attachments");

    for (let att of attachments) {
        let attachment = document.createElement("div");
        let attView = document.createElement("div");
        let attInfo = document.createElement("div");
        let attSize = document.createElement("span");
        let attName = document.createElement("span");
        let attIcon = document.createElement("span");
        let iconImage = document.createElement("img");

        // //State icons
        let attState = document.createElement("div");
        attState.classList.add("att-state");

        let spinner = document.createElement("img");
        spinner.classList.add("spinner");
        spinner.src = "/img/spinner.gif";
        spinner.display = "none";

        attState.appendChild(spinner);

        iconImage.src = "/img/attachment.png";
        attSize.classList.add("att-size");
        attView.classList.add("att-view");
        attInfo.classList.add("att-info");
        attName.classList.add("att-name");
        iconImage.classList.add("att-icon");
        attIcon.appendChild(iconImage);
        attInfo.innerHTML = JSON.stringify(att);
        attName.innerText = att.name;
        attSize.innerHTML = getAttachmentSize(att.size);

        //Appending elements to attachment view
        attView.appendChild(attState);
        attView.appendChild(attIcon);
        attView.appendChild(attName);
        attView.appendChild(attSize);
        attView.addEventListener("click", downloadOnClick);
        attachment.appendChild(attView);
        attachment.appendChild(attInfo);
        attachmentsWrapper.appendChild(attachment);
    }
    return attachmentsWrapper;
}

function processMessageBody(text) {
    text = text.trim();
    let result = document.createElement("div");
    let startPattern = /__code/;
    let endPattern = /__end/;

    //no code
    if (text.search(startPattern) === -1) {
        result.appendChild(document.createTextNode(text));
        return result;
    }
    //first occurrence of the code
    let firstOccurrence = text.search(startPattern);
    if (text.substring(0, firstOccurrence).length > 0) {
        result.appendChild(document.createTextNode(text.substring(0, firstOccurrence)));
        text = text.substr(firstOccurrence);
    }
    let substrings = text.split(startPattern).filter(el => {
        return el.length !== 0;
    });
    for (let i = 0; i < substrings.length; ++i) {
        let pre = document.createElement("pre");
        let code = document.createElement("code");
        let afterText = null;
        let endCode = substrings[i].search(endPattern);
        if (endCode === -1) {
            code.innerText = processCodeBlock(substrings[i]);
        } else {
            code.innerText = processCodeBlock(substrings[i].substring(0, endCode));
            let rawAfterText = substrings[i].substr(endCode + 5).trim();
            if (rawAfterText.length > 0) afterText = document.createTextNode(rawAfterText);
        }
        //highliter:
        hljs.highlightBlock(code);
        ///////////

        pre.appendChild(code);
        result.appendChild(pre);
        pre.ondblclick = showCodeView;
        if (afterText) result.appendChild(afterText);
    }
    return result;
}

function showCodeView(event) {
    let pre = document.createElement("pre");
    pre.innerHTML = event.target.innerHTML;
    let div = document.createElement("div");
    div.appendChild(pre);
    showModalNotification("Code:", div.innerHTML);
}

function closeCodeView() {
    clearModal();
    document.querySelector("#code-view").style.display = "none";
}

function processCodeBlock(code) {
    code = code.trim();
    let separator = code.match(/\r?\n/) ? code.match(/\r?\n/)[0] : "\r\n";
    let lines = code.split(/\r?\n/);
    let min = Infinity;
    for (let i = 1; i < lines.length; ++i) {
        if (lines[i] === "") continue;
        try {
            min = Math.min(lines[i].match(/^\s+/)[0].length, min);
        } catch (err) {
            //found a line with no spaces, therefore returning the entire block as is
            return lines.join(separator);
        }
    }
    for (let i = 1; i < lines.length; ++i) {
        lines[i] = lines[i].substr(min);
    }
    return lines.join(separator);
}

function generateInvite(ev) {
    ensureConnected();
    console.log("Generating invite");
    buttonLoadingOn(ev.target);
    chat.requestInvite();
}

function addNewParticipant() {
    let nickname = document.querySelector('#new-participant-nickname').value;
    let pubKey = document.querySelector('#new-participant-public-key').value;
    let residence = document.querySelector('#new-participant-residence').value;
    let rights = document.querySelector('#new-participant-rights').value;
    chat.addNewParticipant(nickname, pubKey, residence, rights);
}

function broadcastNewMessage() {
    let newMessage = document.querySelector('#new-message').value;
    chat.shoutMessage(newMessage);
}

function displayNewTopicData(data, heading, toastrMessage) {
    heading = heading ? heading : "Your new topic data. SAVE YOUR PRIVATE KEY!!!";
    toastrMessage = toastrMessage ? toastrMessage : "Topic was created successfully!";
    let nicknameWrapper = document.createElement("div");
    let pkWrapper = document.createElement("div");
    let bodyWrapper = document.createElement("div");
    nicknameWrapper.innerHTML = "<b>Nickname: </b>" + data.nickname;
    pkWrapper.innerHTML = "<br><b>Your private key:</b> <br> <textarea class='key-display'>" + data.privateKey + "</textarea>";
    bodyWrapper.appendChild(nicknameWrapper);
    bodyWrapper.appendChild(pkWrapper);
    let tempWrap = document.createElement("div");
    tempWrap.appendChild(bodyWrapper);
    showModalNotification(heading, tempWrap.innerHTML);
    toastr.success(toastrMessage);
}

function showInviteCode(newInvite) {
    syncPendingInvites();
    showModalNotification("Here is your invite code:", newInvite);
    toastr.success("New invite was generated successfully!");
}

function showModalNotification(headingText, bodyContent) {
    let wrapper = document.createElement("div");
    wrapper.classList.add("modal-notification--wrapper");
    let heading = document.createElement("h3");
    heading.classList.add("modal-notification--heading");
    let body = document.createElement("div");
    body.classList.add("modal-notification--body");
    heading.innerText = headingText;
    body.innerHTML = bodyContent;
    wrapper.appendChild(heading);
    wrapper.appendChild(body);
    let modalContent = document.querySelector('#code--content');
    modalContent.innerHTML = "";
    modalContent.appendChild(wrapper);
    let modalView = document.querySelector('#code-view');
    modalView.style.display = "block";
}

function loadingOn() {
    $('body').waitMe({
        effect: 'roundBounce',
        bg: 'rgba(255,255,255,0.7)',
        textPos: 'vertical',
        color: '#33b400'
    });
}

function loadingOff() {
    $('body').waitMe('hide');
}

function setView(view) {
    switch (view) {
        case "chat":
            $('#chat_room').css('display', 'flex');
            $('#you_online').css('display', 'flex');
            $('#auth-wrapper').hide();
            $('#chat-menu').css('display', 'flex');
            $('#settings-view').hide();
            $('#chat-view-button').addClass("active");
            $('#settings-view-button ').removeClass("active");
            break;
        case "auth":
            $('#chat_room').hide();
            $('#you_online').hide();
            $('#auth-wrapper').css('display', 'block');
            $('#chat-menu').hide();
            $('#settings-view').hide();
            break;
        case "settings":
            $('#settings-view').css('display', 'flex');
            $('#chat_room').hide();
            $('#you_online').hide();
            $('#auth-wrapper').hide();
            $('#chat-menu').css('display', 'flex');
            $('#chat-view-button').removeClass("active");
            $('#settings-view-button').addClass("active");
            break;
        default:
            throw "setView: Invalid view: " + view;
    }
}

function syncPendingInvites() {
    if (!chat.session) {
        return;
    } else if (chat.session.settings.invites === undefined) {
        chat.settingsInitInvites();
        return;
    }
    let invites = Object.keys(chat.session.settings.invites);
    let container = document.querySelector('#pending-invites');
    container.innerHTML = "";
    for (let i in invites) {
        let inviteWrap = document.createElement("div");
        let inviteNum = document.createElement("div");
        let inviteRep = document.createElement("input");
        let inviteCopy = document.createElement("div");
        let inviteDel = document.createElement("div");
        let inviteID = document.createElement("div");
        let inviteCopyButton = document.createElement("button");
        let inviteDelButton = document.createElement("button");
        inviteWrap.classList.add("invite-wrap");
        inviteRep.classList.add("invite-rep");
        inviteID.classList.add("invite-id");
        inviteDel.classList.add("invite-del");
        inviteNum.classList.add("invite-num");
        inviteDelButton.classList.add("invite-del-button");
        inviteCopyButton.classList.add("invite-copy-button");
        inviteCopy.classList.add("invite-copy");
        inviteDelButton.innerText = 'Del';
        inviteCopyButton.innerText = 'Copy invite code';
        inviteDelButton.onclick = deleteInvite;

        inviteID.innerText = invites[i];

        inviteRep.value = chat.session.settings.invites[invites[i]].name ? chat.session.settings.invites[invites[i]].name : "New member";

        inviteNum.innerText = "#" + (parseInt(i) + 1);
        inviteDel.appendChild(inviteDelButton);
        inviteCopy.appendChild(inviteCopyButton);
        inviteWrap.appendChild(inviteNum);
        inviteWrap.appendChild(inviteRep);
        inviteWrap.appendChild(inviteCopy);
        inviteWrap.appendChild(inviteDel);
        inviteWrap.appendChild(inviteID);
        inviteCopyButton.addEventListener("click", copyInviteCode);

        inviteRep.addEventListener("click", editInviteeName);

        container.appendChild(inviteWrap);
    }
}

function editInviteeName(event) {
    tempName = event.target.value;
    event.target.value = "";
    event.target.addEventListener("focusout", processInviteeNameInput);
    event.target.addEventListener("keyup", inviteEditingProcessKeyPress);
}

function inviteEditingProcessKeyPress(event) {
    if (event.keyCode === 13) {
        console.log("Enter pressed!");
        event.target.blur();
    }
}

function processInviteeNameInput(event) {
    let newName = event.target.value.trim();
    if (newName === "") {
        event.target.value = tempName;
        return;
    } else {
        chat.updateSetInviteeName(event.target.parentNode.lastChild.innerHTML, newName);
    }
    event.target.removeEventListener("focusout", processInviteeNameInput);
}

function copyInviteCode(event) {
    let inviteElement = event.target.parentNode.parentNode.lastChild;
    let inviteID = inviteElement.innerHTML;
    let textArea = document.createElement("textarea");
    textArea.value = inviteID;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand("copy");
        toastr.info("Invite code was copied to the clipboard");
    } catch (err) {
        toastr.error("Error copying invite code to the clipboard");
    }
    textArea.remove();
}

function deleteInvite(event) {
    ensureConnected();
    let button = event.target;
    let inviteID = button.parentNode.parentNode.lastChild.innerHTML;
    chat.deleteInvite(inviteID);
}

function processTopicJoinSuccess(data) {
    clearInviteInputs();
    loadingOff();
    let heading = "You have joined topic successfully, and can now login. SAVE YOUR PRIVATE KEY!!!";
    let toastrMessage = "Topic was created successfully!";
    displayNewTopicData(data, heading, toastrMessage);
}

function enableSettingsMenuListeners() {
    let menuItems = document.querySelector("#settings-menu").children;
    for (let i of menuItems) {
        i.addEventListener("click", processSettingsMenuClick);
    }
    document.querySelector("#invites-container").style.display = "flex";
    document.querySelector("#chat-settings").style.display = "none";
    document.querySelector("#participants-container").style.display = "none";
    document.querySelector("#admin-tools-container").style.display = "none";
}

function processSettingsMenuClick(event) {
    let menuItems = document.querySelector("#settings-menu").children;
    for (let i of menuItems) {
        i.classList.remove("active");
    }
    let target = event.target;
    target.classList.add("active");
    document.querySelector("#invites-container").style.display = target.innerText === "INVITES" ? "flex" : "none";
    document.querySelector("#participants-container").style.display = target.innerText === "PARTICIPANTS" ? "flex" : "none";
    document.querySelector("#chat-settings").style.display = target.innerText === "CHAT SETTINGS" ? "flex" : "none";
    document.querySelector("#admin-tools-container").style.display = target.innerText === "ADMIN TOOLS" ? "flex" : "none";
}

function processChatScroll(event) {
    let chatWindow = event.target;
    if (!chatWindow.firstChild) return;
    if ($(event.target).scrollTop() <= 1) {
        //load more messages
        let lastLoadedMessageID = chatWindow.firstChild.querySelector(".message-id").innerText;
        chat.loadMoreMessages(lastLoadedMessageID);
    }
}

function clearModal() {
    $("#code--content").html("");
}

function clearInviteInputs() {
    $("#invite-code").val("");
    $("#join-nickname").val("");
}

function clearNewTopicFields() {
    $("#new-topic-nickname").val("");
    $("#new-topic-name").val("");
}

function clearLoginPrivateKey() {
    $("#private-key").val("");
}

function clearAllInputs() {
    clearModal();
    clearInviteInputs();
    clearNewTopicFields();
    clearLoginPrivateKey();
}

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

///Testing blob download
function downloadAttachment(fileName, data) {
    let arr = new Uint8Array(data);
    let fileURL = URL.createObjectURL(new Blob([arr]));
    downloadURI(fileURL, fileName);
}

/**
 * Searches loaded message with provided ID
 * @param id
 */
function findMessage(id) {
    let chatWindow = document.querySelector("#chat_window");
    for (let msg of chatWindow.children) {

        if (msg.getElementsByClassName("message-id")[0].innerHTML == id) {
            console.log("Message found");
            return msg;
        }
    }
}

async function loadAudio(fileInfo, fileData) {
    //search right message
    let message = findMessage(fileInfo.messageID);
    if (!message) {
        console.error("Message not found");
        return;
    }

    let audio = document.createElement("audio");
    let arr = new Uint8Array(fileData);
    let fileURL = URL.createObjectURL(new Blob([arr]));
    audio.setAttribute("controls", "");
    audio.setAttribute("src", fileURL);

    let viewWrap = message.getElementsByClassName("att-view")[0];
    viewWrap.innerHTML = "";
    viewWrap.appendChild(audio);
    console.log("Removing even listener");
    viewWrap.removeEventListener("click", downloadOnClick);
}

function processAttachmentChosen(ev) {
    let attachemtsWrapper = document.querySelector("#chosen-files");
    let fileData = ev.target.files[0];
    attachemtsWrapper.innerHTML = "";
    if (!fileData) {
        return;
    }

    let attWrapper = document.createElement("div");
    attWrapper.classList.add("chosen-file-wrap");

    let chosenFileTxt = document.createElement("div");
    chosenFileTxt.classList.add("chosen-file");
    chosenFileTxt.innerText = fileData.name;
    let closeImg = document.createElement("img");
    closeImg.setAttribute("src", "/img/close.png");
    closeImg.addEventListener("click", clearAttachments);

    attWrapper.appendChild(closeImg);
    attWrapper.appendChild(chosenFileTxt);
    attachemtsWrapper.appendChild(attWrapper);
}

function clearAttachments() {
    let attachemtsInput = document.querySelector("#attach-file");
    attachemtsInput.value = "";
    let attachemtsWrapper = document.querySelector("#chosen-files");
    attachemtsWrapper.innerHTML = "";
}

function editMyNickname(ev) {
    let newNickname = ev.target.value.trim();
    if (!newNickname || newNickname === chat.session.settings.nickname) {
        ev.target.value = chat.session.settings.nickname;
        ev.target.blur();
        return;
    }
    ev.target.value = newNickname;
    chat.myNicknameUpdate(ev.target.value);
    ev.target.blur();
}

function editTopicName(ev) {
    let newTopicName = ev.target.value.trim();
    if (!newTopicName || newTopicName === chat.session.settings.topicName) {
        ev.target.value = chat.session.settings.topicName;
        ev.target.blur();
        return;
    }
    ev.target.value = newTopicName;
    chat.topicNameUpdate(ev.target.value);
    ev.target.blur();
}

function buttonLoadingOn(element) {
    element.classList.add("running");
    element.classList.add("disabled");
}

function buttonLoadingOff(element) {
    element.classList.remove("running");
    element.classList.remove("disabled");
}

function refreshInvites(ev) {
    ensureConnected();
    console.log("Generating invite");
    buttonLoadingOn(ev.target);
    chat.syncInvites();
}

function refreshInvitesSuccess() {
    buttonLoadingOff(document.querySelector("#refresh-invites"));
    toastr.success("Invites re-synced");
}

function switchConnectionStatus(connected) {
    let positive = document.querySelector("#connection-status--connected");
    let negative = document.querySelector("#connection-status--disconnected");
    if (connected) {
        $(positive).show();
        $(negative).hide();
    } else {
        $(positive).hide();
        $(negative).show();
    }
}

function attemptReconnection() {
    chat.attemptReconnection().then(() => {}).catch(err => {
        console.trace(err);
    });
}

function switchSounds(ev) {
    if (chat.session.settings.soundsOn) {
        chat.session.settings.soundsOn = false;
        ev.target.src = soundsOnOfIcons.off;
    } else {
        chat.session.settings.soundsOn = true;
        ev.target.src = soundsOnOfIcons.on;
    }
}

function participantAliasChange(ev) {
    console.log("Processing participant alias change");
    ensureConnected();
    let id = ev.target.parentNode.firstChild.innerText;
    let newAlias = ev.target.value.trim();
    if (!newAlias) {
        chat.deleteMemberAlias(id);
    } else {
        chat.setMemberAlias(id, ev.target.value);
    }
    chat.saveClientSettings();
}

function ensureConnected() {
    if (!chat.islandConnectionStatus) {
        toastr.warning("You are disconnected from the island. Please reconnect to continue");
        throw "No island connection";
    }
}

function lockSend(val) {
    sendLock = !!val;
    let sendButton = document.querySelector('#send-new-msg');
    let newMsgField = document.querySelector('#new-msg');
    sendLock ? buttonLoadingOn(sendButton) : buttonLoadingOff(sendButton);
    sendLock ? newMsgField.setAttribute("disabled", true) : newMsgField.removeAttribute("disabled");
}

function processMainMenuSwitch(ev) {
    let menuLength = mainMenuItems.length;
    let activeIndex = mainMenuItems.filter(item => {
        return item.active;
    })[0].index;
    let newActive = (ev.currentTarget.classList.contains("right-arrow-wrap") ? activeIndex + 1 : activeIndex - 1) % menuLength;
    if (newActive < 0) {
        newActive = menuLength + newActive;
    }
    mainMenuItems[activeIndex].active = false;
    mainMenuItems[newActive].active = true;
    $(mainMenuItems[activeIndex].selector).hide("fast");
    $(mainMenuItems[newActive].selector).show("fast");

    let nextIndex = (newActive + 1) % menuLength;
    let previousIndex = (newActive - 1) % menuLength;
    if (previousIndex < 0) {
        previousIndex = menuLength + previousIndex;
    }

    document.querySelector("#left-arrow-text").innerHTML = mainMenuItems[previousIndex].subtitle;
    document.querySelector("#right-arrow-text").innerHTML = mainMenuItems[nextIndex].subtitle;

    // active = get active
    // if arrow right:
    //activate next
    // else
    //activate previous

    //set subtitles
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(3);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {// MIT License
//
// Copyright (c) 2018 KONSTANTIN Y. RYBAKOV
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
//     The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
//     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


class CuteSet{
    constructor(input){
        if(typeof input === "string" || typeof input === "number"){
            input = [input];
        }

        this._set = new Set(input);

        this[Symbol.iterator] = function * (){
            for(let i of this._set){
                yield i;
            }
        }
    }

    forEach(cb){
        for (let i of this._set){
            cb(i, i, this)
        }
    }

    static _formatInput(input){
        if (!(input instanceof CuteSet)){
            return new CuteSet(input)
        } else{
            return input;
        }
    }

    static fromString(input, delimiter = " ", parseNumbers = false){
        if(!input || input === " "){
            return new CuteSet()
        } else if(typeof(input) !== "string"){
            throw "CuteSet error: input format is invalid, expecting string"
        }

        input = input.split(delimiter);

        if(parseNumbers){
            input = input.map(val =>{
                return parseFloat(val);
            })
        }
        return new CuteSet(input);
    }

    union(set){
        set = CuteSet._formatInput(set);
        return new CuteSet([...this.toArray(), ...set.toArray()]);
    }

    join(set){
        return this.union(set)
    }

    difference(set){
        set = CuteSet._formatInput(set);
        return new CuteSet(this.toArray().filter(x => !set.has(x)))
    }

    complement(set){
        set = CuteSet._formatInput(set);
        return set.minus(this);
    }

    minus(set){
        return this.difference(set);
    }

    symmetricDifference(set){
        set = CuteSet._formatInput(set);
        return this.union(set).difference(this.intersection(set));
    }

    intersection(set){
        set = CuteSet._formatInput(set);
        return new CuteSet(this.toArray().filter(x => set.has(x)))
    }

    equal(set){
        set = CuteSet._formatInput(set);
        return this.symmetricDifference(set).length() === 0
    }

    subsetOf(set){
        set = CuteSet._formatInput(set);
        return this.intersection(set).equal(this)
    }

    sort(fn){
        this._set = new Set(this.toArray().sort(fn))
    }

    powerSet(){
        let set = this.toArray();
        if(set.length > 21){
            throw "Maximum supported length for generating powerset is exceeded."
        }
        let numCombinations = parseInt(this._getStringOfSymbols(set.length, "1").split('').reverse().join(''), 2 )+1;
        let res = [];
        for (let i=0; i<numCombinations; ++i){
            let num = i.toString(2);
            num = this._padWithZeroes(num, set.length);
            res.push(new CuteSet(set.filter((val, i) =>{
                return num[i] == 1;
            })));
        }
        return new CuteSet(res);
    }

    permutations(){
        if(this.size() > 9){
            throw "Maximum supported length for generating permutations is exceeded."
        }
        let set = this.toArray();
        let n = set.length;
        let res = new CuteSet();
        let c = Array.apply(null, {length: n}).map(Function.call, ()=>{return 0});
        let i=0;
        res.add(new CuteSet(set));
        let swap = (i, j, arr)=>{
            let t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
        };
        while (i<n){
            if(c[i] < i){
                (i%2===0) ? swap(0, i, set) : swap(c[i], i, set);
                res.add(new CuteSet(set));
                c[i]+=1;
                i=0
            }else{
                c[i] = 0;
                i += 1;
            }
        }
        return res
    }

    has(x){
        return this._set.has(x)
    }

    length(){
        return this._set.size
    }

    size(){
        return this.length();
    }

    empty(){
        return this._set.size === 0
    }

    add(x){
        this._set.add(x);
    }

    remove(x){
        return this._set.delete(x);
    }

    delete(x){
        return this.remove(x)
    }

    toArray(){
        return Array.from(this._set)
    }

    toString(delimiter = " "){
        return this.toArray().join(delimiter);
    }

    print(delimiter){
        console.log(this.toString(delimiter) +"\n");
    }

    _padWithZeroes(str, length){
        if(str.length < length){
            return this._getStringOfSymbols(length - str.length, "0") + str
        }
        return str;
    }

    _getStringOfSymbols(length, char){
        return char.repeat(length);
    }

}

if( true && module.hasOwnProperty('exports')){
    module.exports = CuteSet;
}



/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(4)(module)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/js/chat/ChatMessage.js



/**
 * Represents chat message
 * Signature hashes only header + body of the message
 *
 * Recipient:
 * */
class ChatMessage{
    constructor(blob){
        if(typeof(blob) === "string"){
            blob = JSON.parse(blob);
        }

        this.signature = blob ?  blob.signature : "";
        this.header = blob ? blob.header : {
            id : this.generateNewID(),
            timestamp: new Date(),
            metadataID :"",
            author: "",
            nickname: "", //AUTHOR PKFP
            recipient: "all", //RCIPIENT PKFP
        };
        this.body = blob ? blob.body : "";
        this.attachments = blob ? blob.attachments : undefined;
    }

    /**
     * encrypts and replaces the body of the message with its cipher
     * @param key Should be SYM AES key in form of a string
     */
    encryptMessage(key){
        let self = this;
        let ic = new iCrypto();
        ic.setSYMKey("k", key)
            .addBlob("body", self.body)
            .AESEncrypt("body", "k", "bodycip", true, "CBC", 'utf8');
        if (self.attachments){
            ic.addBlob("attachments", JSON.stringify(self.attachments))
                .AESEncrypt("attachments", "k", "attachmentscip", true, undefined, "utf8")
            self.attachments = ic.get("attachmentscip")
        }

        if (self.header.nickname){
            ic.addBlob("nname", self.header.nickname)
                .AESEncrypt("nname", "k", "nnamecip", true);
            self.header.nickname = ic.get("nnamecip")
        }

        self.body = ic.get("bodycip")
    }


    encryptPrivateMessage(keys){
        let self = this;
        let ic = new iCrypto();
        ic.sym.createKey("sym")
            .addBlob("body", self.body)
            .AESEncrypt("body", "sym", "bodycip", true, "CBC", 'utf8');
        if (self.header.nickname){
            ic.addBlob("nname", self.header.nickname)
                .AESEncrypt("nname", "sym", "nnamecip", true);
            self.header.nickname = ic.get("nnamecip")
        }
        self.body = ic.get("bodycip");
        self.header.keys = {};
        self.header.private = true;
        for(let key of keys){
            let icn = new iCrypto();
            icn.asym.setKey("pubk", key, "public")
                .addBlob("sym", ic.get("sym"))
                .asym.encrypt("sym", "pubk", "symcip", "hex")
                .getPublicKeyFingerprint("pubk", "pkfp");
            self.header.keys[icn.get("pkfp")] = icn.get("symcip")
        }
    }

    decryptPrivateMessage(privateKey){
        try{
            let ic = new iCrypto();
            ic.asym.setKey("priv", privateKey, "private")
                .publicFromPrivate("priv", "pub")
                .getPublicKeyFingerprint("pub", "pkfp")
                .addBlob("symcip", this.header.keys[ic.get("pkfp")])
                .asym.decrypt("symcip", "priv", "sym", "hex")
                .addBlob("bodycip", this.body)
                .sym.decrypt("bodycip", "sym", "body", true);
            this.body = ic.get("body");

            if(this.header.nickname){
                ic.addBlob("nnamecip", this.header.nickname)
                    .AESDecrypt("nnamecip", "sym", "nname", true);
                this.header.nickname= ic.get("nname");
            }
        }catch(err){
            console.log("Error decrypting private message: " + err);
        }
    }


    /**
     * Decrypts body and replaces the cipher with raw text
     * @param key
     */
    decryptMessage(key){
        try{
            let ic = new iCrypto();
            ic.sym.setKey("k", key)
                .addBlob("bodycip", this.body)
                .sym.decrypt("bodycip", "k", "body", true);
            this.body = ic.get("body")
            if (this.attachments){
                ic.addBlob("attachmentscip", this.attachments)
                    .AESDecrypt("attachmentscip", "k", "attachments", true);
                this.attachments = JSON.parse(ic.get("attachments"))
            }
            if(this.header.nickname){
                ic.addBlob("nnamecip", this.header.nickname)
                    .AESDecrypt("nnamecip", "k", "nname", true);
                this.header.nickname= ic.get("nname");
            }
        }catch(err){
            console.log("Error decrypting message: " + err);
        }
    }

    /**
     * Adds attachment metadata to the message
     * @param {Attachment} attachment
     */
    addAttachmentInfo(attachment){
        let self = this;
        if(!self.attachments){
            self.attachments = []
        }

        AttachmentInfo.verifyFileInfo(attachment);
        self.attachments.push(attachment);
    }


    sign(privateKey){
        let ic = new iCrypto();
        let requestString = JSON.stringify(this.header) + JSON.stringify(this.body);
        if (this.attachments){
            requestString += JSON.stringify(this.attachments)
        }
        ic.addBlob("body", requestString)
            .setRSAKey("priv", privateKey, "private")
            .privateKeySign("body", "priv", "sign");
        this.signature = ic.get("sign");
    }

    verify(publicKey){
        let ic = new iCrypto();
        let requestString = JSON.stringify(this.header) + JSON.stringify(this.body);
        if (this.attachments){
            requestString += JSON.stringify(this.attachments)
        }
        ic.setRSAKey("pubk", publicKey, "public")
            .addBlob("sign", this.signature)
            .addBlob("b", requestString)
            .publicKeyVerify("b", "sign", "pubk", "v");
        return ic.get("v");
    }

    getNonce(size){
        let ic = new iCrypto;
        ic.createNonce("n", size ? parseInt(size): 8 )
            .bytesToHex("n", "nh");
        return ic.get("nh");
    }

    generateNewID(){
        return this.getNonce(8);
    }



    toBlob(){
        return JSON.stringify(this);
    }

}



// CONCATENATED MODULE: ./src/js/chat/ChatUtility.js

class ChatUtility{
    /**
     * Standard message referred to string of form [payload] + [sym key cipher] + [const length sym key length encoded]
     * All messages in the system encrypted and decrypted in the described way except for chat messages files and streams.
     * Sym key generated randomly every time
     * @param blob - cipher blob
     * @param lengthSymLengthEncoded number of digits used to encode length of the sym key
     * @param privateKey
     * @returns {}
     */
    static decryptStandardMessage(blob = Err.required(),
                                  privateKey = Err.required(),
                                  lengthSymLengthEncoded = 4, ){

        let symKeyLength = parseInt(blob.substr(blob.length - lengthSymLengthEncoded));

        let symKeyCipher = blob.substring(blob.length - lengthSymLengthEncoded - symKeyLength, blob.length - lengthSymLengthEncoded);
        let payloadCipher = blob.substring(0, blob.length - lengthSymLengthEncoded - symKeyLength);
        let ic = new iCrypto();
        ic.addBlob("blobcip", payloadCipher)
            .addBlob("symkcip", symKeyCipher)
            .asym.setKey("privk", privateKey, "private")
            .privateKeyDecrypt("symkcip", "privk", "symk", "hex")
            .AESDecrypt("blobcip", "symk", "blob-raw", true,  "CBC", "utf8");
        return ic.get("blob-raw");
    }

    static encryptStandardMessage(blob = Err.required(),
                                  publicKey = Err.required(),
                                  lengthSymLengthEncoded = 4,){
        let ic = new iCrypto();
        ic.sym.createKey("symk")
            .addBlob("payload", blob)
            .asym.setKey("pubk", publicKey, "public")
            .sym.encrypt("payload", "symk", "blobcip", true, "CBC", "utf8")
            .asym.encrypt("symk", "pubk", "symcip", "hex")
            .encodeBlobLength("symcip", lengthSymLengthEncoded, "0", "symciplength")
            .merge(["blobcip", "symcip", "symciplength"], "res");
        return ic.get("res");
    }

    static publicKeyEncrypt(blob = Err.required(),
                            publicKey = Err.required()){
        const ic = new iCrypto();
        ic.addBlob("blob", blob)
            .asym.setKey("pubk", publicKey, "public")
            .publicKeyEncrypt("blob", "pubk", "blobcip", "hex");
        return ic.get("blobcip");
    }

    static privateKeyDecrypt(blob, privateKey, encoding = "hex"){
        const ic = new iCrypto();
        ic.addBlob("blobcip", blob)
            .asym.setKey("priv", privateKey, "private")
            .privateKeyDecrypt("blobcip", "priv", "blob", encoding);
        return ic.get("blob");
    }

    static symKeyEncrypt(blob, key, hexify = true){
        const ic = new iCrypto();
        ic.addBlob("b", blob)
            .sym.setKey("sym", key)
            .AESEncrypt("b", "sym", "cip", hexify, "CBC", "utf8")
        return ic.get("cip")
    }

    static symKeyDecrypt(cip, key, dehexify = true){
        const ic = new iCrypto();
        ic.addBlob("cip", cip)
            .sym.setKey("sym", key)
            .AESDecrypt("cip", "sym", "b", dehexify, "CBC", "utf8");
        return ic.get("b")
    }
}


// CONCATENATED MODULE: ./src/js/chat/Invite.js

class Invite{

    static objectValid(obj){
        if (typeof(obj) === "string"){
            return false;
        }

        for (let i of Invite.properties){
            if (!obj.hasOwnProperty(i)){
                return false;
            }
        }
        return true;
    }

    static decryptInvite(cipher, privateKey, symLengthEncoding = 4){
        let ic = new iCrypto();
        let symlength = parseInt(cipher.substr(cipher.length - symLengthEncoding));
        let symkcip = cipher.substring(cipher.length-symlength - symLengthEncoding, cipher.length - symLengthEncoding);
        let payloadcip = cipher.substring(0, cipher.length - symlength - symLengthEncoding);
        ic.addBlob("symciphex", symkcip)
            .hexToBytes("symciphex", "symcip")
            .addBlob("plcip", payloadcip)
            .setRSAKey("privk", privateKey, "private")
            .privateKeyDecrypt("symcip", "privk", "sym")
            .AESDecrypt("plcip", "sym", "pl", true);
        return JSON.parse(ic.get("pl"));
    }

    static setInviteeName(invite, name){
        invite.inviteeName = name;
    }



    constructor(onionAddress = this.pRequired(),
                pubKeyFingerprint = this.pRequired(),
                hsPrivateKey){

        let ic = new iCrypto()
        ic.createNonce("n").bytesToHex("n", "id");
        this.set('onionAddress', onionAddress);
        this.set('pkfp', pubKeyFingerprint);
        this.set('inviteID', ic.get('id'));
        if (hsPrivateKey){
            let ic = new iCrypto();
            ic.setRSAKey("k", hsPrivateKey, "private")
            this.hsPrivateKey = ic.get("k");
        }
    }

    static constructFromExisting(invite){
        let ic = new iCrypto();
        ic.addBlob("i", invite.inviteCode)
            .base64Decode("i", "ir");

        let onion = ic.get("ir").split("/")[0];

        let newInvite = new Invite(onion, chat.session.publicKeyFingerprint, invite.hsPrivateKey);
        newInvite.set('inviteID', invite.inviteID);
        return newInvite;
    }




    toBlob(encoding){
        let result = this.get("onionAddress") + "/" +
            this.get("pkfp") + "/" +
            this.get("inviteID");
        if (encoding){
            let ic = new iCrypto();
            if (!ic.encoders.hasOwnProperty(encoding)){
                throw "WRONG ENCODING"
            }
            ic.addBlob("b", result)
                .encode("b", encoding, "bencoded");
            result = ic.get("bencoded");
        }
        return result;
    }

    stringifyAndEncrypt(publicKey){
        if(!publicKey || !Invite.objectValid(this)){
            throw "Error at stringifyAndEncrypt: the object is invalid or public key is not provided"
        }
        let ic = new iCrypto();

        let invite = {
            inviteCode: this.toBlob("base64"),
            hsPrivateKey: this.hsPrivateKey
        };

        if (this.inviteeName){
            invite.inviteeName = this.inviteeName
        }

        ic.addBlob("invite", JSON.stringify(invite))
            .sym.createKey("sym")
            .setRSAKey("pubk", publicKey, "public")
            .AESEncrypt("invite", "sym", "invitecip", true)
            .publicKeyEncrypt("sym", "pubk", "symcip", "hex")
            .encodeBlobLength("symcip", 4, "0", "symlength")
            .merge(["invitecip", "symcip", "symlength"], "res")
        return ic.get("res")

    }

    get  (name){
        if (this.keyExists(name))
            return this[name];
        throw "Property not found"
    };

    set (name, value){
        if (!Invite.properties.includes(name)){
            throw 'Invite: invalid property "' + name + '"';
        }
        this[name] = value;
    };

    keyExists(key){
        if (!key)
            throw "keyExists: Missing required arguments";
        return Object.keys(this).includes(key.toString());
    }

    pRequired(functionName = "Invite"){
        throw functionName + ": missing required parameter!"
    }
}

Invite.properties = ["onionAddress", "hsPrivateKey","pkfp", "inviteID"];


// CONCATENATED MODULE: ./src/js/chat/Message.js

/**
 *
 *
 * Possible headers:
 *  command: used mainly between browser and island
 *  response: island response to browser. This is an arbitrary string by which
 *         sender identifies the outcome of the request. Can be an error code like login_error
 *  error: error message if something goes wrong it should be set. If it is set -
 *              the response treated as an error code
 *  pkfpSource: public key fingerprint of the sender
 *  pkfpDest: public key fingerprint of the recipient
 *
 *
 */
class Message{
    constructor(request){
        if(typeof(request)==="string"){
            request = JSON.parse(request);
        }
        this.headers = request ? this.copyHeaders(request.headers) : {
            command: "",
            response: ""
        };
        this.body = request ? request.body : {};
        this.signature = request ? request.signature : "";
    }


    static verifyMessage(publicKey, message){
        let ic = new iCrypto();
        let requestString = JSON.stringify(message.headers) + JSON.stringify(message.body);
        ic.setRSAKey("pubk", publicKey, "public")
            .addBlob("sign", message.signature)
            .hexToBytes('sign', "signraw")
            .addBlob("b", requestString);
        ic.publicKeyVerify("b", "sign", "pubk", "v");
        return ic.get("v");
    }

    setError(error){
        this.headers.error = error || "Unknown error";
    }

    setResponse(response){
        this.headers.response = response;
    }

    copyHeaders(headers){
        let result = {};
        let keys = Object.keys(headers);
        for (let i=0; i< keys.length; ++i){
            result[keys[i]] = headers[keys[i]];
        }
        return result;
    }

    signMessage(privateKey){
        let ic = new iCrypto();
        let requestString = JSON.stringify(this.headers) + JSON.stringify(this.body);
        ic.addBlob("body", requestString)
            .setRSAKey("priv", privateKey, "private")
            .privateKeySign("body", "priv", "sign");
        this.signature = ic.get("sign");
    }


    setSource(pkfp){
        this.headers.pkfpSource = pkfp;
    }

    setDest(pkfp){
        this.headers.pkfpDest = pkfp;
    }

    setCommand(command){
        this.headers.command = command
    }

    addNonce(){
        let ic = new iCrypto();
        ic.createNonce("n")
            .bytesToHex("n", "nhex");
        this.headers.nonce = ic.get("nhex");
    }

    get  (name){
        if (this.keyExists(name))
            return this[name];
        throw "Property not found"
    };

    set (name, value){
        if (!Message.properties.includes(name)){
            throw 'Invite: invalid property "' + name + '"';
        }
        this[name] = value;
    };

}

Message.properties = ["headers", "body", "signature"];


// CONCATENATED MODULE: ./src/js/chat/Metadata.js
class Metadata{
    static parseMetadata(blob){
        if(typeof (blob) === "string"){
            return JSON.parse(blob);
        }else{
            return blob;
        }
    }

    static extractSharedKey(pkfp, privateKey, metadata){
        let keyCipher = metadata.body.participants[pkfp].key;
        let ic = new iCrypto();
        ic.addBlob("symcip", keyCipher)
            .asym.setKey("priv", privateKey, "private")
            .asym.decrypt("symcip", "priv", "sym", "hex");
        return ic.get("sym");
    }

    static isMetadataValid(metadata, taPublicKey){

    }
}





// CONCATENATED MODULE: ./src/js/chat/Participant.js
class Participant{

    static objectValid(obj){
        if (typeof(obj) === "string"){
            return false;
        }

        for (let i = 0; i<Participant.properties.length;++i){
            if (!obj.hasOwnProperty(Participant.properties[i])){
                return false;
            }
        }
        return (Object.keys(obj).length === Participant.properties.length);
    }

    constructor(blob){
        if (blob){
            this.parseBlob(blob);
        }
    }

    toBlob(stringify = false){
        if (!this.readyForExport()){
            throw "Object participant has some properties uninitialized"
        }
        let result = {};
        for (let i=0; i<Participant.properties.length; ++i){
            let key = Participant.properties[i];
            let value = this[Participant.properties[i]];
            console.log("Key: " + key + "; Value: " + value);
            result[Participant.properties[i]] = this[Participant.properties[i]];
        }
        return (stringify ? JSON.stringify(result) : result);
    }

    parseBlob(blob){
        if(!blob){
            throw "missing required parameter";
        }

        if (typeof(blob)=== "string"){
            blob = JSON.parse(blob);
        }

        if (!this.objectValid(blob)){
            throw "Participant blob is invalid"
        }

        for (let i = 0; i< Participant.properties.length; ++i){
            this[Participant.properties[i]] = blob[Participant.properties[i]]
        }

    }

    keyExists(key){
        if (!key)
            throw "keyExists: Missing required arguments";
        return Object.keys(this).includes(key.toString());
    }



    readyForExport(){
        for (let i=0; i<Participant.properties; ++i){
            if (!this[Participant.properties[i]]){
                return false;
            }
        }
        return true;
    }

    get  (name){
        if (this.keyExists(name))
            return this[name];
        throw "Property not found"
    };

    set (name, value){

        if (!Participant.properties.includes(name)){
            throw 'Participant: invalid property "' + name + '"';
        }

        this[name] = value;
    };

}

Participant.properties = ["nickname", "publicKey", "publicKeyFingerprint", "residence", "rights"];





// CONCATENATED MODULE: ./src/js/chat/AttachmentInfo.js




/**
 * Implements files attachments functionality
 * Constructor accepts a file element
 */
class AttachmentInfo_AttachmentInfo{
    constructor(file, onion, pkfp, metaID, privKey, messageID, hashEncrypted, hashUnencrypted, hashAlgo = "sha256"){
        let self = this;
        self.name = file.name;
        self.size = file.size;
        self.type = file.type;
        self.lastModified = file.lastModified;
        self.pkfp = pkfp;
        self.metaID = metaID;
        self.hashAlgorithm = hashAlgo;
        self.messageID = messageID;
        self.hashEncrypted = hashEncrypted;
        self.hashUnencrypted = hashUnencrypted;
        self.link = self.buildLink(onion, pkfp, self.hashUnencrypted);
        self.signHashes(privKey);
    }

    get(){
        let self = this;
        return {
            name: self.name,
            size: self.size,
            type: self.type,
            lastModified: self.lastModified,
            pkfp: self.pkfp,
            hashEncrypted: self.hashEncrypted,
            hashUnencrypted: self.hashUnencrypted,
            signEncrypted: self.signEncrypted,
            signUnencrypted: self.signUnencrypted,
            metaID: self.metaID,
            messageID: self.messageID,
            link: self.link,
            hashAlgorithm: self.hashAlgorithm
        }
    }

    getLink(){
        return this.link;
    }

    static verifyFileInfo(info){
        let required = ["name", "size", "pkfp", "hashUnencrypted", "hashEncrypted", "signUnencrypted", "signEncrypted", "link",  "metaID", "messageID", "hashAlgorithm"];
        for(let i of required){
            if (!info.hasOwnProperty(i)){
                throw "Attachment verifyFileInfo: Missing required property: " + i;
            }
        }
    }

    static parseLink(link){
        const ic = new iCrypto();
        ic.addBlob("l", link)
            .base64Decode("l", "lres");
        const elements = ic.get("lres").split("/");
        return{
            residence: elements[0],
            pkfp: elements[1],
            name: elements[2]
        }
    }



    buildLink(onion, pkfp, hash){
        if(!onion || !pkfp || !hash){
            throw "Attachment buildLink: missing required parameters";
        }
        const rawLink = onion + "/" + pkfp + "/" + hash;
        const ic = new iCrypto();
        ic.addBlob("l", rawLink)
            .base64Encode("l", "l64");
        return ic.get("l64");
    }

    signHashes(privKey){
        if(!privKey){
            throw "Attachment signAttachmentHash: privKey is undefined";
        }
        let self = this;
        let ic = new iCrypto();
        ic.addBlob("hu", self.hashUnencrypted)
            .addBlob("he", self.hashEncrypted)
            .asym.setKey("pk", privKey, "private")
            .asym.sign("hu", "pk", "sign_u")
            .asym.sign("he", "pk", "sign_e");
        self.signUnencrypted = ic.get("sign_u");
        self.signEncrypted = ic.get("sign_e");
    }
}

AttachmentInfo_AttachmentInfo.properties = ["name", "size", "type", "lastModified", "hashUnencrypted", "signUnencrypted", "hashEncrytped", "signEncrypted","link", "metaID", "messageID", "hashAlgorithm"];



// CONCATENATED MODULE: ./src/js/chat/ChatClient.js












class ChatClient_ChatClient {

    constructor(opts){
        this.islandConnectionStatus = false;
        this.allMessagesLoaded = false;
        this.chatSocket = null;
        this.fileSocket = null;
        this.session = null; //can be "active", "off"
        this.newTopicPending = {};
        this.pendingTopicJoins = {};
        this.outgoingMessageQueue = {};
        this.attachmentsUploadQueue = {};
        this.setClientHandlers();
        WildEmitter.mixin(this);
    }

    /*************************************************************
     * =====  Request Response and Notidication processing ======*
     *************************************************************/
    setClientHandlers(){
        this.responseHandlers = {
            init_topic_get_token_success: this.initTopicContinueAfterTokenReceived,
            init_topic_success: this.initTopicSuccess,
            login_decryption_required: this.loginDecryptData,
            join_topic_success: this.notifyJoinSuccess,
            login_success: this.finalizeLogin,
            update_settings_success: this.onSuccessfullSettingsUpdate,
            load_more_messages_success: this.loadMoreMessagesSuccess,
            request_invite_success: this.processInviteCreated,
            request_invite_error: this.requestInviteError,
            sync_invites_success: this.syncInvitesSuccess,
            save_invite_success: this.saveInviteSuccess,
            update_invite_success: this.updateInviteSuccess,
            send_success: this.messageSendSuccess,
            del_invite_success: this.delInviteSuccess,
            boot_participant_failed: this.bootParticipantFailed,
            send_fail: this.messageSendFail,
            default: this.processInvalidResponse
        };

        this.serviceMessageHandlers = {
            metadata_issue: this.processMetadataUpdate,
            meta_sync: this.processMetadataUpdate,
            u_booted: this.uWereBooted,
            whats_your_name: this.processNicknameRequest,
            my_name_response: this.processNicknameResponse,
            nickname_change_broadcast: this.processNicknameChangeNote,
            default: this.processUnknownNote

        };



        this.messageHandlers = {
            shout_message: this.processIncomingMessage,
            whisper_message: this.processIncomingMessage
        };


        this.requestHandlers = {
            new_member_joined: this.processNewMemberJoined
        };

        this.requestErrorHandlers = {
            login_error: this.loginFail,
            init_topic_error: this.initTopicFail,
            request_invite_error: this.requestInviteError,
            sync_invites_error: this.syncInvitesError,
            default: this.unknownError
        }
    }


    processServiceMessage(message){
        (this.serviceMessageHandlers.hasOwnProperty(message.headers.command)) ?
            this.serviceMessageHandlers[message.headers.command](message, this) :
            this.serviceMessageHandlers.default(message, this)
    }

    processServiceRecord(record, self){
        //TODO decrypt body
        console.log("New service record arrived!");
        record.body = ChatUtility.decryptStandardMessage(record.body, self.session.privateKey);
        self.emit("service_record", record)
    }






    processResponse(response){
        response = new Message(response);
        if (response.headers.error){
            this.requestErrorHandlers.hasOwnProperty(response.headers.response) ?
                this.requestErrorHandlers[response.headers.response](response, this) :
                this.requestErrorHandlers.default(response, this);
            return;
        }

        this.responseHandlers.hasOwnProperty(response.headers.response) ?
            this.responseHandlers[response.headers.response](response, this) :
            this.responseHandlers.default(response, this);
    }

    processRequest(request){
        (this.requestHandlers.hasOwnProperty(request.headers.command)) ?
            this.requestHandlers[request.headers.command](request, this) :
            this.requestErrorHandlers.default(request, this)
    }


    /**
     * Processes unknown note
     * @param note
     * @param self
     */
    processUnknownNote(note, self){
        console.log("UNKNOWN NOTE RECEIVED!\n" + JSON.stringify(note));
        self.emit("unknown_note", note);
    }


    /**************************************************
     * ======  TOPIC LOGIN AND REGISTRATION ==========*
     **************************************************/
    /**
     * Called initially on topic creation
     * @param {String} nickname
     * @returns {Promise<any>}
     */
    initTopic(nickname, topicName){
        return new Promise(async (resolve, reject)=>{
            try{
                let self = this;
                nickname = String(nickname).trim();
                if (!nickname || nickname.length < 3){
                    reject("Nickname entered is invalid");
                    return;
                }

                //CREATE NEW TOPIC PENDING
                let ic = new iCrypto();
                //Generate keypairs one for user, other for topic
                ic = await ic.asym.asyncCreateKeyPair('owner-keys');
                ic = await ic.asym.asyncCreateKeyPair('topic-keys');
                ic.getPublicKeyFingerprint("owner-keys", "owner-pkfp");
                ic.getPublicKeyFingerprint("topic-keys", "topic-pkfp");
                let newTopic = {
                    ownerKeyPair: ic.get("owner-keys"),
                    topicKeyPair: ic.get("topic-keys"),
                    ownerPkfp: ic.get("owner-pkfp"),
                    topicID: ic.get("topic-pkfp"),
                    ownerNickName: nickname,
                    topicName: topicName
                };

                //Request island to init topic creation and get one-time key.
                let request = new Message();
                request.headers.command = "new_topic_get_token";
                let body = {
                    topicID: newTopic.topicID,
                    ownerPublicKey: ic.get('owner-keys').publicKey
                };
                request.set("body", body);
                self.newTopicPending[newTopic.topicID] = newTopic;
                await this.establishIslandConnection();
                this.chatSocket.emit("request", request);
                resolve();
            }catch(err){
                throw err;
            }
        })
    }

    /**
     * New token on init topic received. Proceeding with topic creation
     * @param response
     * @param self
     */
    initTopicContinueAfterTokenReceived(response, self){

        console.log("Token received, continuing creating topic");

        let pendingTopic = self.newTopicPending[response.body.topicID];
        let token = response.body.token; // Token is 1-time disposable public key generated by server

        //Forming request
        let newTopicData = {
            topicKeyPair: pendingTopic.topicKeyPair,
            ownerPublicKey: pendingTopic.ownerKeyPair.publicKey,
        };

        let newTopicDataCipher = ChatUtility.encryptStandardMessage(JSON.stringify(newTopicData), token);

        //initializing topic settings
        let settings = self.prepareNewTopicSettings(pendingTopic.ownerNickName,
            pendingTopic.topicName,
            pendingTopic.ownerKeyPair.publicKey);



        //Preparing request
        let request = new Message();
        request.headers.command = "init_topic";
        request.headers.pkfpSource = pendingTopic.ownerPkfp;
        request.body.topicID = pendingTopic.topicID;
        request.body.settings = settings;
        request.body.ownerPublicKey = pendingTopic.ownerKeyPair.publicKey;
        request.body.newTopicData = newTopicDataCipher;

        //Sending request
        self.chatSocket.emit("request", request);
    }


    prepareNewTopicSettings(nickname, topicName, publicKey, encrypt = true){
        //Creating and encrypting topic settings:
        let settings = {
            membersData: {},
            soundsOn: true
        };
        if(nickname){
            let ic = new iCrypto;
            ic.asym.setKey("pubk", publicKey, "public")
                .getPublicKeyFingerprint("pubk", "pkfp");
            settings.nickname = nickname;
            settings.membersData[ic.get("pkfp")] = {nickname: nickname};
        }

        if(topicName){
            settings.topicName = topicName;
        }
        if (encrypt){
            return ChatUtility.encryptStandardMessage(JSON.stringify(settings), publicKey)
        }else {return settings}

    }


    initTopicSuccess(request, self){
        let data = self.newTopicPending[request.body.topicID];
        let pkfp = data.pkfp;
        let privateKey = data.privateKey;
        let nickname = data.nickname;
        self.emit("init_topic_success", {
            pkfp: data.ownerPkfp,
            nickname: data.ownerNickName,
            privateKey: data.ownerKeyPair.privateKey
        });
        delete self.newTopicPending[request.body.topicID];
    }

    async topicLogin(privateKey){
        let success = true;
        let error;

        privateKey = String(privateKey).trim();


        if(this.session && this.session.status === "active" && this.islandConnectionStatus){
            this.emit("login_success");
            return;
        }
        try{
            await this.establishIslandConnection();
            let ic = new iCrypto();
            ic.setRSAKey('pk', privateKey, "private")
                .publicFromPrivate('pk', 'pub')
                .getPublicKeyFingerprint('pub', 'pkfp')
                .createNonce('nonce')
                .bytesToHex('nonce', "noncehex");

            this.session = {
                sessionID: ic.get("noncehex"),
                publicKey : ic.get("pub"),
                privateKey : ic.get('pk'),
                publicKeyFingerprint : ic.get("pkfp"),
                status : 'off'
            };

            let body = {
                publicKey: ic.get("pub"),
                sessionID: ic.get("noncehex")
            };

            let request = new Message();
            request.set("body", body);
            request.headers.command = "init_login";
            request.headers.pkfpSource = ic.get("pkfp");
            request.signMessage(ic.get("pk"));
            this.chatSocket.emit("request", request);
        }catch(err){
            success = false;
            error = err.message
        }

        //On error try to disconnect
        if(!success){
            try{
                await  this.terminateIslandConnection();
            }catch(err){
                console.log("ERROR terminating island connection: " + err);
            }finally{
                this.emit("login_fail", error)
            }
        }
    }

    /**
     * Islnad request to decrypt data while logging in
     * data must be in request.body.loginData and it can contain
     *    clientHSPrivateKey,
     *    TAprivateKey
     *    TAHSPrivateKey
     *
     * @param response
     * @param self
     */
    loginDecryptData(request, self){

        let decryptBlob = (privateKey, blob, lengthChars = 4)=>{
            let icn = new iCrypto();
            let symLength = parseInt(blob.substr(-lengthChars))
            let blobLength = blob.length;
            let symk = blob.substring(blobLength- symLength - lengthChars, blobLength-lengthChars );
            let cipher = blob.substring(0, blobLength- symLength - lengthChars);
            icn.addBlob("symcip", symk)
                .addBlob("cipher", cipher)
                .asym.setKey("priv", privateKey, "private")
                .asym.decrypt("symcip", "priv", "sym", "hex")
                .sym.decrypt("cipher", "sym", "blob-raw", true)
            return icn.get("blob-raw")
        };

        let encryptBlob = (publicKey, blob, lengthChars = 4)=>{
            let icn = new iCrypto();
            icn.createSYMKey("sym")
                .asym.setKey("pub", publicKey, "public")
                .addBlob("blob-raw", blob)
                .sym.encrypt("blob-raw", "sym", "blob-cip", true)
                .asym.encrypt("sym", "pub", "symcip", "hex")
                .encodeBlobLength("symcip", 4, "0", "symcipl")
                .merge(["blob-cip", "symcip", "symcipl"], "res")
            return icn.get("res");
        };

        if (!self.session){
            console.log("invalid island request");
            return;
        }

        let clientHSPrivateKey, taPrivateKey, taHSPrivateKey;
        let token = request.body.token;
        let loginData = request.body.dataForDecryption;
        let ic = new iCrypto();
        ic.asym.setKey("priv", self.session.privateKey, "private");

        //Decrypting client Hidden service key
        if (loginData.clientHSPrivateKey){
            clientHSPrivateKey = decryptBlob(self.session.privateKey, loginData.clientHSPrivateKey)
        }

        if (loginData.topicAuthority && loginData.topicAuthority.taPrivateKey){
            taPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taPrivateKey )
        }

        if (loginData.topicAuthority && loginData.topicAuthority.taHSPrivateKey){
            taHSPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taHSPrivateKey)
        }

        let preDecrypted = {};

        if (clientHSPrivateKey){
            preDecrypted.clientHSPrivateKey = encryptBlob(token, clientHSPrivateKey)
        }
        if (taPrivateKey || taHSPrivateKey){
            preDecrypted.topicAuthority = {}
        }
        if (taPrivateKey){
            preDecrypted.topicAuthority.taPrivateKey = encryptBlob(token, taPrivateKey)
        }
        if (taHSPrivateKey){
            preDecrypted.topicAuthority.taHSPrivateKey = encryptBlob(token, taHSPrivateKey)
        }

        let decReq = new Message();
        decReq.headers.pkfpSource = self.session.publicKeyFingerprint;
        decReq.body = request.body;
        decReq.body.preDecrypted = preDecrypted;
        decReq.headers.command = "login_decrypted_continue";
        decReq.signMessage(self.session.privateKey);
        console.log("Decryption successfull. Sending data back to Island");

        self.chatSocket.emit("request", decReq);
    }




    finalizeLogin(response, self){
        let metadata = Metadata.parseMetadata(response.body.metadata);
        let sharedKey = Metadata.extractSharedKey(self.session.publicKeyFingerprint,
            self.session.privateKey,
            metadata);
        let messages = self.decryptMessagesOnMessageLoad(response.body.messages);
        let settings = metadata.body.settings ? metadata.body.settings : {};
        self.session.status = "active";
        self.session.metadata = metadata.body;
        self.session.metadata.sharedKey = sharedKey;
        self.session.metadataSignature = metadata.signature;
        self.session.settings = JSON.parse(ChatUtility.decryptStandardMessage(settings, self.session.privateKey));
        self.emit("login_success", messages);
        self.checkNicknames()
    }

    checkNicknames(){
        for (let pkfp of Object.keys(this.session.metadata.participants)){
            if(!this.getMemberNickname(pkfp)){
                this.requestNickname(pkfp);
            }
        }
    }

    getMemberNickname(pkfp){
        if(!this.session || ! pkfp){
            return
        }
        let membersData = this.session.settings.membersData;
        if (membersData[pkfp]){
            return membersData[pkfp].nickname;
        }
    }

    getMemberAlias(pkfp){
        if(!this.session || !pkfp){
            return
        }
        let membersData = this.session.settings.membersData;
        if (membersData[pkfp] && membersData[pkfp].alias){
            return membersData[pkfp].alias;
        } else{
            return pkfp.substring(0, 8)
        }
    }

    deleteMemberAlias(pkfp){
        let membersData = this.session.settings.membersData;
        if (membersData[pkfp]){
            delete membersData[pkfp].alias;
        }
    }

    getMemberRepr(pkfp){
        let membersData = this.session.settings.membersData;
        if(membersData[pkfp]){
            return this.getMemberAlias(pkfp) || this.getMemberNickname(pkfp) || "Anonymous";
        }
    }


    deleteMemberData(pkfp){
        let membersData = this.session.settings.membersData;
        delete membersData[pkfp];
    }

    setMemberNickname(pkfp, nickname, settings){
        if(settings){
            settings.membersData[pkfp] = {
                joined: new Date(),
                nickname: nickname
            };
            return
        }
        if(!pkfp){
            throw "Missing required parameter";
        }
        let membersData = this.session.settings.membersData;
        if (!membersData[pkfp]){
            this.addNewMemberToSettings(pkfp)
        }

        membersData[pkfp].nickname = nickname;
    }

    setMemberAlias(pkfp, alias){
        if(!pkfp){
            throw "Missing required parameter";
        }
        if(!this.session){
            return
        }
        let membersData = this.session.settings.membersData;
        if (!membersData[pkfp]){
            membersData[pkfp] = {}
        }
        if(!alias){
            delete membersData[pkfp].alias
        }else{
            membersData[pkfp].alias = alias;
        }

    }

    requestNickname(pkfp){
        if(!pkfp){
            throw "Missing required parameter"
        }
        let request = new Message();
        request.setCommand("whats_your_name");
        request.setSource(this.session.publicKeyFingerprint);
        request.setDest(pkfp);
        request.addNonce();
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    broadcastNameChange(){
        let self = this;
        let message = new Message();
        message.setCommand("nickname_change_broadcast");
        message.setSource(this.session.publicKeyFingerprint);
        message.addNonce();
        message.body.nickname = ChatUtility.symKeyEncrypt(self.session.settings.nickname, self.session.metadata.sharedKey);
        message.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", message);
    }

    processNicknameResponse(request, self){
        self._processNicknameResponseHelper(request, self)
    }

    processNicknameChangeNote(request, self){
        self._processNicknameResponseHelper(request, self, true)
    }

    _processNicknameResponseHelper(request, self, broadcast = false){
        console.log("Got nickname response");
        let publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;
        if(!Message.verifyMessage(publicKey, request)){
            console.trace("Invalid signature");
            return
        }
        let existingNickname = self.getMemberNickname(request.headers.pkfpSource);
        let memberRepr = self.getMemberRepr(request.headers.pkfpSource);
        let newNickname = broadcast ? ChatUtility.symKeyDecrypt(request.body.nickname, self.session.metadata.sharedKey) :
            ChatUtility.decryptStandardMessage(request.body.nickname, self.session.privateKey);
        if( newNickname !== existingNickname){
            self.setMemberNickname(request.headers.pkfpSource, newNickname);
            self.saveClientSettings();
            if(existingNickname && existingNickname !== ""){
                self.createServiceRecordOnMemberNicknameChange(memberRepr, newNickname, request.headers.pkfpSource);
            }
        }
    }

    createServiceRecordOnMemberNicknameChange(existingName, newNickname, pkfp){
        existingName = existingName || "";
        let msg = "Member " + existingName + " (id: "  +  pkfp + ") changed nickname to: " + newNickname;
        this. createRegisterServiceRecord("member_nickname_change", msg);
    }

    createRegisterServiceRecord(event, message){
        let request = new Message();
        request.addNonce();
        request.setSource(this.session.publicKeyFingerprint);
        request.setCommand("register_service_record");
        request.body.event = event;
        request.body.message = ChatUtility.encryptStandardMessage(message,
            this.session.publicKey);
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    processNicknameRequest(request, self){
        let parsedRequest = new Message(request);
        let publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;
        if(!Message.verifyMessage(publicKey, parsedRequest)){
            console.trace("Invalid signature");
            return
        }
        let response = new Message();
        response.setCommand("my_name_response");
        response.setSource(self.session.publicKeyFingerprint);
        response.setDest(request.headers.pkfpSource);
        response.addNonce();
        response.body.nickname = ChatUtility.encryptStandardMessage(self.session.settings.nickname, publicKey);
        response.signMessage(self.session.privateKey);
        self.chatSocket.emit("request", response);
    }

    addNewMemberToSettings(pkfp){
        this.session.settings.membersData[pkfp] = {
            joined: new Date()
        };
    }


    async attemptReconnection(){
        await this.topicLogin(this.session.privateKey);
    }

    loadMoreMessages(lastLoadedMessageID){
        if(this.allMessagesLoaded) return;
        let request = new Message();
        request.headers.command = "load_more_messages";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.body.lastLoadedMessageID = lastLoadedMessageID;
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    loadMoreMessagesSuccess(response, self){
        let messages = self.decryptMessagesOnMessageLoad(response.body.lastMessages);
        self.allMessagesLoaded = response.body.lastMessages.allLoaded ||  self.allMessagesLoaded;
        self.emit("messages_loaded", messages)
    }

    decryptMessagesOnMessageLoad(data){
        let keys = data.keys;
        let metaIDs = Object.keys(keys);
        for (let i=0;i<metaIDs.length; ++i){
            let ic = new iCrypto;
            ic.addBlob('k', keys[metaIDs[i]])
                .hexToBytes("k", "kraw")
                .setRSAKey("priv", this.session.privateKey, "private")
                .privateKeyDecrypt("kraw", "priv", "kdec");
            keys[metaIDs[i]] = ic.get("kdec");
        }

        let messages = data.messages;
        let result = [];
        for (let i=0; i<messages.length; ++i){
            let message = new ChatMessage(messages[i]);
            if(message.header.service){
                message.body = ChatUtility.decryptStandardMessage(message.body, this.session.privateKey)
            } else if(message.header.private){
                message.decryptPrivateMessage(this.session.privateKey);
            } else{
                message.decryptMessage(keys[message.header.metadataID]);
            }
            result.push(message);
        }
        return result;
    }


    logout(){
        this.chatSocket.disconnect();
        this.session = null;
        this.allMessagesLoaded = false;
    }


    haveIRightsToBoot(){
        return parseInt(this.session.metadata.participants[this.session.publicKeyFingerprint].rights) >=3
    }


    bootParticipant(pkfp){
        let self = this;
        if (!self.haveIRightsToBoot()){
            self.emit("boot_participant_fail", "Not enough rights to boot a member")
            return
        }

        let request = new Message();
        request.headers.command = "boot_participant";
        request.headers.pkfpSource = self.session.publicKeyFingerprint;
        request.headers.pkfpDest = self.session.metadata.topicAuthority.pkfp;
        request.body.pkfp = pkfp;
        request.signMessage(self.session.privateKey);
        self.chatSocket.emit("request", request);
    }


    /**
     * TODO implement method
     * Processes notification of a member deletion
     * If this note received - it is assumed, that the member was successfully deleted
     * Need to update current metadata
     * @param note
     * @param self
     */
    noteParticipantBooted(note, self){
        console.log("Note received: A member was booted. Processing");
        let newMeta = Metadata.parseMetadata(note.body.metadata);
        self._updateMetadata(newMeta);
        let bootedNickname = this.getMemberRepr(note.body.bootedPkfp);
        this.deleteMemberData(note.body.bootedPkfp);
        this.saveClientSettings();
        self.emit("participant_booted", "Participant " + bootedNickname + " was booted!")
    }



    bootParticipantFailed(response, self){
        console.log("Boot member failed!");
        self.emit("boot_participant_fail", response.error);
    }

    /**
     * Called on INVITEE side when new user joins a topic with an invite code
     * @param nickname
     * @param inviteCode
     * @returns {Promise}
     */
    async initTopicJoin(nickname, inviteCode) {
        console.log("joining topic with nickname: " + nickname + " | Invite code: " + inviteCode);

        const clientSettings = new ClientSettings();
        clientSettings

        await this.establishIslandConnection();
        let ic = new iCrypto();
        ic.asym.createKeyPair("rsa")
            .getPublicKeyFingerprint('rsa', 'pkfp')
            .addBlob("invite64", inviteCode.trim())
            .base64Decode("invite64", "invite");

        let invite = ic.get("invite").split("/");
        let inviterResidence = invite[0];
        let inviterID = invite[1];
        let inviteID = invite[2];

        if (!this.inviteRequestValid(inviterResidence, inviterID, inviteID)){
            this.emit("join_topic_fail");
            throw "Invite request is invalid";
        }

        this.pendingTopicJoins[inviteID] = {
            publicKey: ic.get('rsa').publicKey,
            privateKey: ic.get('rsa').privateKey,
            nickname: nickname,
            inviterID: inviterID,
            inviterResidence: inviterResidence
        };

        let headers = {
            command: "join_topic",
            pkfpDest: inviterID,
            pkfpSource: ic.get('pkfp'),

        };
        let body = {
            inviteString: inviteCode.trim(),
            inviteCode: inviteID,
            destination: inviterResidence,
            invitee:{
                publicKey: ic.get('rsa').publicKey,
                nickname: nickname,
                pkfp: ic.get('pkfp')
            }
        };
        let request = new Message();
        request.set('headers', headers);
        request.set("body", body);
        request.signMessage(ic.get('rsa').privateKey);
        this.chatSocket.emit("request", request);
        let topicData = {
            newPublicKey: ic.get('rsa').publicKey,
            newPrivateKey: ic.get('rsa').privateKey,

        };
        return topicData
    }


    initSettingsOnTopicJoin(topicInfo, request){
        let privateKey = topicInfo.privateKey;
        let publicKey = topicInfo.publicKey;
        let ic = new iCrypto();
        ic.asym.setKey("pub", publicKey, "public")
            .getPublicKeyFingerprint("pub", "pkfp");
        let pkfp = ic.get("pkfp");
        let topicName = ChatUtility.decryptStandardMessage(request.body.topicName, privateKey);
        let inviterNickname = ChatUtility.decryptStandardMessage(request.body.inviterNickname, privateKey);
        let inviterPkfp = request.body.inviterPkfp;
        let settings = this.prepareNewTopicSettings(topicInfo.nickname, topicName, topicInfo.publicKey, false);

        this.setMemberNickname(inviterPkfp, inviterNickname, settings);
        this.saveClientSettings(settings, privateKey)
    }

    onSuccessfullSettingsUpdate(response, self){
        console.log("Settings successfully updated!");
        self.emit("settings_updated");
    }

    notifyJoinSuccess(request, self){
        console.log("Join successfull received!");
        let topicInfo = self.pendingTopicJoins[request.body.inviteCode];
        self.initSettingsOnTopicJoin(topicInfo, request);
        self.emit("topic_join_success", {
            nickname: topicInfo.nickname,
            privateKey: topicInfo.privateKey
        })
    }

    saveClientSettings(settingsRaw, privateKey){
        if(!settingsRaw){
            settingsRaw = this.session.settings;
        }
        if(!privateKey){
            privateKey = this.session.privateKey;
        }
        let ic = new iCrypto();
        ic.asym.setKey("privk", privateKey, "private")
            .publicFromPrivate("privk", "pub")
            .getPublicKeyFingerprint("pub", "pkfp");
        let publicKey = ic.get("pub");
        let pkfp = ic.get("pkfp")

        if(typeof settingsRaw === "object"){
            settingsRaw = JSON.stringify(settingsRaw);
        }
        let settingsEnc = ChatUtility.encryptStandardMessage(settingsRaw, publicKey);
        let headers = {
            command: "update_settings",
            pkfpSource: pkfp
        };
        let body = {
            settings: settingsEnc
        };

        let request = new Message();
        request.set("headers", headers);
        request.set("body", body);
        request.signMessage(privateKey);
        console.log("Snding update settings request");
        this.chatSocket.emit("request", request);
    }

    /**
     * TODO implement method
     * Notifies a booted member
     * If received - it is assumed that this client was successfully booted
     * from the topic.
     * Need to conceal the topic
     * @param note
     * @param self
     */
    uWereBooted(note, self){
        console.log("Looks like I am being booted. Checking..");

        if(!Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, note)){
            console.log("Probably it was a mistake");
            return;
        }

        self.session.metadata.status = "sealed";
        console.log("You have been booted");
        self.emit("u_booted", "You have been excluded from this channel.");

    }


    updateMetaOnNewMemberJoin(message, self){
        self.session.metadata = JSON.parse(message.body.metadata);
        self.emit("new_member_joined")
    }

    loginFail(response, self){
        console.log("Emiting login fail... " + response.headers.error);
        self.emit("login_fail", response.headers.error);
    }

    initTopicFail(response, self){
        console.log("Init topic fail: " + response.headers.error);
        self.emit("init_topic_error", response.headers.error);
    }

    unknownError(response, self){
        console.log("Unknown request error: " + response.headers.response);
        self.emit("unknown_error", response.headers.error);
    }

    processInvalidResponse(response, self){
        console.log("Received invalid server response");
        self.emit("invalid_response", response);
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== PARTICIPANTS HANDLING   ============*
     **************************************************/

    addNewParticipant(nickname, publicKey, residence, rights){
        let ic = new iCrypto();
        ic.setRSAKey("pk", publicKey, "public")
            .getPublicKeyFingerprint("pk", "fp");

        let participant = new Participant();
        participant.set('nickname', nickname);
        participant.set('publicKey', ic.get("pk"));
        participant.set('publicKeyFingerprint', ic.get("fp"));
        participant.set('residence', residence);
        participant.set('rights', rights);
        this.session.metadata.addParticipant(participant);
        this.broadcastMetadataUpdate();
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ FILE HANDLING  ================*
     **************************************************/

    /**
     * Takes list of files and uploads them
     * to the Island asynchronously.
     *
     * Resolves with list of fileInfo JSON objects.
     * @param filesAttached list of files each type of File
     * @return Promise
     */
    uploadAttachments(filesAttached, messageID, metaID){
        return new Promise(async (resolve, reject)=>{
            const self = this;

            if (Worker === undefined){
                reject(null, "Client does not support web workers.")
                return;
            }

            const filesProcessed = [];

            const pkfp = self.session.publicKeyFingerprint;
            const privk = self.session.privateKey;
            const symk = self.session.metadata.sharedKey;
            const residence = self.session.metadata.participants[self.session.publicKeyFingerprint].residence;

            for (let file of filesAttached){
                console.log("Calling worker function");
                filesProcessed.push(self.uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence))
            }

            try{
                const filesInfo = await Promise.all(filesProcessed);
                resolve(filesInfo);
            }catch (err) {
                console.log("ERROR DURING UPLOAD ATTACHMENTS: " + err);
                reject(err)
            }


        })
    }

    /**
     * Uploads a single attachment to the island
     * Calculates hash of unencrypted and encrypted file
     * signs both hashes
     * resolves with fileInfo object
     * @returns {Promise<any>}
     */
    uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence){
        return new Promise((resolve, reject)=>{
            console.log("!!!Initializing worker...");
            let uploader = new Worker("/js/uploaderWorker.js");

            let uploadComplete = (msg)=>{
                let fileInfo = new AttachmentInfo_AttachmentInfo(file, residence, pkfp, metaID, privk, messageID, msg.hashEncrypted, msg.hashUnencrypted);
                uploader.terminate();
                resolve(fileInfo);
            };

            let uploadProgress = (msg) =>{
                //TODO implement event handling

            };

            let uploadError = (msg)=>{
                uploader.terminate();
                self.emit("upload_error", msg.data);
                reject(data)
            };

            let messageHandlers = {
                "upload_complete": uploadComplete,
                "upload_progress": uploadProgress,
                "upload_error": uploadError
            };

            uploader.onmessage = (ev)=>{
                let msg = ev.data;
                messageHandlers[msg.result](msg.data);
            };

            uploader.postMessage({
                command: "upload",
                attachment: file,
                pkfp: pkfp,
                privk: privk,
                symk: symk
            });
        })
    }



    /**
     * Downloads requested attachment
     *
     * @param {string} fileInfo - Stringified JSON of type AttachmentInfo.
     *          Must contain all required info including hashes, signatures, and link
     */
    downloadAttachment(fileInfo){
        return new Promise(async (resolve, reject)=>{
            let self = this;
            let privk = self.session.privateKey; //To decrypt SYM key

            //Getting public key of
            let parsedFileInfo = JSON.parse(fileInfo);

            let fileOwnerPublicKey = self.session.metadata.participants[parsedFileInfo.pkfp].publicKey;

            if(Worker === undefined){
                const err = "Worker is not defined.Cannot download file."
                console.log(err);
                reject(err);
            }
            const myPkfp = self.session.publicKeyFingerprint;
            let fileData = await self.downloadAttachmentWithWorker(fileInfo, myPkfp, privk, fileOwnerPublicKey);
            self.emit("download_complete", {fileInfo: fileInfo, fileData: fileData});
        })

    }

    downloadAttachmentWithWorker(fileInfo, myPkfp, privk, ownerPubk){
        return new Promise(async (resolve, reject)=>{
            const downloader = new Worker("/js/downloaderWorker.js");
            const downloadComplete = (fileBuffer)=>{
                resolve(fileBuffer);
                downloader.terminate();
            };


            const messageHandlers = {
                "download_complete": downloadComplete
            };

            const processMessage = (msg)=>{
                messageHandlers[msg.result](msg.data)
            };

            downloader.onmessage = (ev)=>{
                processMessage(ev.data)
            };

            downloader.postMessage({
                command: "download",
                data: {
                    fileInfo: fileInfo,
                    myPkfp: myPkfp,
                    privk: privk,
                    pubk: ownerPubk
                }
            })
        })
    }


    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ MESSAGE HANDLING  ============*
     **************************************************/

    prepareMessage(messageContent, recipientPkfp) {
        return new Promise((resolve, reject) => {
            let self = this;
            console.log("Preparing message: " + messageContent);
            if (!self.isLoggedIn()) {
                self.emit("login_required");
                reject();
            }
            //Preparing chat message
            let chatMessage = new ChatMessage();
            chatMessage.header.metadataID = this.session.metadata.id;
            chatMessage.header.author = this.session.publicKeyFingerprint;
            chatMessage.header.recipient = recipientPkfp ? recipientPkfp : "ALL";
            chatMessage.header.private = !!recipientPkfp;
            chatMessage.header.nickname = self.session.settings.nickname;
            chatMessage.body = messageContent;
            resolve(chatMessage);
        })
    }




    /**
     * Sends the message.
     *
     * @param {string} messageContent
     * @param {array} filesAttached Array of attached files. Should be taken straight from input field
     * @returns {Promise<any>}
     */
    shoutMessage(messageContent, filesAttached){
        return new Promise(async (resolve, reject)=>{
            let self = this;

            let attachmentsInfo;

            const metaID = self.session.metadata.id;
            const chatMessage = await self.prepareMessage(messageContent);

            if (filesAttached && filesAttached.length >0){
                attachmentsInfo = await self.uploadAttachments(filesAttached, chatMessage.header.id, metaID);
                for (let att of attachmentsInfo) {
                    chatMessage.addAttachmentInfo(att)
                }
            }

            chatMessage.encryptMessage(this.session.metadata.sharedKey);
            chatMessage.sign(this.session.privateKey);

            //Preparing request
            let message = new Message();
            message.headers.pkfpSource = this.session.publicKeyFingerprint;
            message.headers.command = "broadcast_message";
            message.body.message = chatMessage.toBlob();
            let userPrivateKey = this.session.privateKey;
            message.signMessage(userPrivateKey);
            //console.log("Message ready: " + JSON.stringify(message));
            this.chatSocket.emit("request", message);
            resolve();
        })
    }

    whisperMessage(pkfp, messageContent, filesAttached){
        return new Promise(async (resolve, reject)=>{
            let self = this;

            const chatMessage = await self.prepareMessage(messageContent, pkfp);

            //Will be enabled in the next version

            let keys = [self.session.publicKey];
            keys.push(self.session.metadata.participants[pkfp].publicKey);
            chatMessage.encryptPrivateMessage(keys);
            chatMessage.sign(this.session.privateKey);

            //Preparing request
            let message = new Message();
            message.headers.pkfpSource = this.session.publicKeyFingerprint;
            message.headers.pkfpDest = pkfp;
            message.headers.command = "send_message";
            message.headers.private = true;
            message.body.message = chatMessage.toBlob();
            let userPrivateKey = this.session.privateKey;
            message.signMessage(userPrivateKey);
            this.chatSocket.emit("request", message);
            resolve();
        })
    }

    processIncomingMessage(data, self){
        console.log("Received incoming message! ");
        let message = data.message;
        let symKey = data.key ? ChatUtility.privateKeyDecrypt(data.key, self.session.privateKey) :
            self.session.metadata.sharedKey;
        let chatMessage = new ChatMessage(message.body.message);
        let author = self.session.metadata.participants[chatMessage.header.author];
        if(!author){
            throw "Author is not found in the current version of metadata!";
        }
        if(!chatMessage.verify(author.publicKey)){
            self.emit("error", "Received message with invalid signature!");
        }
        if(!chatMessage.header.private && !data.key && chatMessage.header.metadataID !== self.session.metadata.id){
            throw "current metadata cannot decrypt this message";
        }

        if(chatMessage.header.private){
            chatMessage.decryptPrivateMessage(self.session.privateKey);
        }else{
            chatMessage.decryptMessage(symKey);
        }
        let authorNickname = chatMessage.header.nickname;
        let authorPkfp = chatMessage.header.author;
        let authorExistingName = self.getMemberNickname(authorPkfp);
        if(!this.nicknameAssigned(authorPkfp) ||
            authorNickname !== self.getMemberNickname(authorPkfp)){
            self.setMemberNickname(authorPkfp, authorNickname);
            self.saveClientSettings()
            self.createServiceRecordOnMemberNicknameChange(authorExistingName, authorNickname, authorPkfp)
        }
        self.emit("chat_message", chatMessage);
    }

    nicknameAssigned(pkfp){
        try{
            return this.session.settings.membersData[pkfp].hasOwnProperty("nickname");
        }catch(err){
            return false;
        }
    }

    async messageSendSuccess(response, self){
        let chatMessage = new ChatMessage(response.body.message);
        let author = self.session.metadata.participants[chatMessage.header.author];
        if(!author){
            throw "Author is not found in the current version of metadata!";
        }
        if(!chatMessage.verify(author.publicKey)){
            self.emit("error", "Received message with invalid signature!");
        }
        if(!chatMessage.header.private && chatMessage.header.metadataID !== self.session.metadata.id){
            throw "current metadata cannot decrypt this message";
        }

        if(chatMessage.header.private){
            chatMessage.decryptPrivateMessage(self.session.privateKey);
        }else{
            chatMessage.decryptMessage(self.session.metadata.sharedKey);
        }

        self.emit("send_success", chatMessage);

    }

    messageSendFail(response, self){
        let messageID = JSON.parse(response).body.message.header.id;
        self.emit("send_fail", self.outgoingMessageQueue[messageID]);
        delete self.outgoingMessageQueue[messageID];
    }

    isLoggedIn(){
        return this.session && this.session.status === "active"
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/


    /**************************************************
     * ================ INVITES HANDLING  ============*
     **************************************************/


    /**
     * Sends request to topic authority to create an invite
     */
    requestInvite(){
        let ic = new iCrypto()
        ic.createNonce("n")
            .bytesToHex("n", "nhex");
        let request = new Message();
        let myNickNameEncrypted = ChatUtility.encryptStandardMessage(this.session.settings.nickname,
            this.session.metadata.topicAuthority.publicKey);
        let topicNameEncrypted = ChatUtility.encryptStandardMessage(this.session.settings.topicName,
            this.session.metadata.topicAuthority.publicKey);
        request.headers.command = "request_invite";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
        request.body.nickname = myNickNameEncrypted;
        request.body.topicName = topicNameEncrypted;
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);

    }

    syncInvites(){
        let ic = new iCrypto();
        ic.createNonce("n")
            .bytesToHex("n", "nhex");
        let request = new Message();
        request.headers.command = "sync_invites";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
        request.headers.nonce = ic.get("nhex");
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    syncInvitesSuccess(response, self){
        if(Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, response)){
            self.updatePendingInvites(response.body.invites);
            self.emit(response.headers.response)
        }else{
            throw "invalid message"
        }
    }

    generateInvite(){
        if (!this.session || !(this.session.status ==="active")){
            this.emit("login_required");
            return;
        }
        let ic = new iCrypto();
        ic.createNonce("iid")
            .bytesToHex('iid', "iidhex");
        let body = {
            requestID: ic.get("iidhex"),
            pkfp: this.session.publicKeyFingerprint
        };

        let request = new Message();
        request.headers.command = "request_invite";
        request.set("body", body);
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }

    requestInviteError(response, self){
        console.log("Request invite error received: " + response.headers.error);
        self.emit("request_invite_error", response.headers.error)
    }

    syncInvitesError(response, self){
        console.log("Sync invites error received: " + response.headers.error);
        self.emit("sync_invites_error", response.headers.error)
    }

    processInviteCreated(response, self){
        self.updatePendingInvites(response.body.userInvites);
        self.emit("request_invite_success", response.body.inviteCode)
    }


    updateSetInviteeName(inviteID, name){
        this.session.settings.invites[inviteID].name = name;
        this.saveClientSettings(this.session.settings, this.session.privateKey)
    }

    saveInviteSuccess(response, self){
        self.updatePendingInvites(response.body.userInvites);
        self.emit("invite_generated", self.session.pendingInvites[response.body.inviteID])
    }

    updateInviteSuccess(response, self){
        self.updatePendingInvites(response.body.invites);
        self.emit("invite_updated")
    }

    /**
     * Given a dictionary of encrypted pending invites from history
     * decrypts them and adds to the current session
     * @param invitesUpdatedEncrypted
     */
    updatePendingInvites(userInvites){
        for(let i of userInvites){
            if(!this.session.settings.invites.hasOwnProperty(i)){
                this.session.settings.invites[i] = {}
            }
        }
        for (let i of Object.keys(this.session.settings.invites)){
            if(!userInvites.includes(i)){
                delete this.session.settings.invites[i];
            }
        }

        this.saveClientSettings(this.session.settings, this.session.privateKey);
    }

    settingsInitInvites(){
        this.session.settings.invites = {};
        this.saveClientSettings(this.session.settings, this.session.privateKey);
    }


    deleteInvite(id){
        console.log("About to delete invite: " + id);
        let request = new Message();
        request.headers.command = "del_invite";
        request.headers.pkfpSource = this.session.publicKeyFingerprint;
        request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp
        let body = {
            invite: id,
        };
        request.set("body", body);
        request.signMessage(this.session.privateKey);
        this.chatSocket.emit("request", request);
    }


    delInviteSuccess(response, self){
        console.log("Del invite success! ");
        self.updatePendingInvites(response.body.invites)
        self.emit("del_invite_success")
    }

    getPendingInvites(){
        console.log("Del invite fail! ");
        self.emit("del_invite_fail")
    }

    inviteRequestValid(inviterResidence, inviterID, inviteID){
        return (inviteID && inviteID && this.onionValid(inviterResidence))
    }





    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ====== ISLAND CONNECTION HANDLING  ============*
     **************************************************/
    async establishIslandConnection(option = "chat"){
        return new Promise((resolve, reject)=>{
            if (option === "chat"){
                if (this.chatSocket && this.chatSocket.connected){
                    resolve();
                    return;
                }
                this.chatSocket = io('/chat', {
                    reconnection: false,
                    forceNew: true,
                    transports: ['websocket', "longpoll"],
                    pingInterval: 10000,
                    pingTimeout: 5000,
                });
                this.chatSocket.on('connect', ()=>{
                    this.finishSocketSetup();
                    console.log("Island connection established");
                    this.islandConnectionStatus = true;
                    this.emit("connected_to_island");
                    resolve();
                });



                this.chatSocket.on("disconnect", ()=>{
                    console.log("Island disconnected.");
                    this.islandConnectionStatus = false;
                    this.emit("disconnected_from_island");
                });

                this.chatSocket.on('connect_error', (err)=>{
                    console.log('Connection Failed');
                    reject(err);
                });
            } else if (option === "file"){
                console.log("Connecting to file socket");
                if (this.fileSocket && this.fileSocket.connected){
                    console.log("File socket already connected! returning");
                    resolve();
                    return;
                }

                this.fileSocket = io('/file', {
                    'reconnection': true,
                    'forceNew': true,
                    'reconnectionDelay': 1000,
                    'reconnectionDelayMax' : 5000,
                    'reconnectionAttempts': 5
                });

                this.fileSocket.on("connect", ()=>{
                    this.setupFileTransferListeners();
                    console.log("File transfer connectiopn established");
                    resolve()
                });

                this.fileSocket.on("connect_error", (err)=>{
                    console.log('Island connection failed: ' + err.message);
                    reject(err);
                });
            }


        })
    }


    async terminateIslandConnection(){
        try{
            if (this.chatSocket && this.chatSocket.connected){
                this.chatSocket.disconnect();
            }
        }catch(err){
            throw ("Error terminating connection with island: " + err);
        }
    }



    //TODO implement method
    setupFileTransferListeners(){

    }

    finishSocketSetup(){
        this.initChatListeners();
    }

    initChatListeners(){
        this.chatSocket.on('message', message =>{

            console.log(JSON.stringify(message));
        });


        this.chatSocket.on('request', request =>{
            console.log("Received new incoming request");
            this.processRequest(request, this)
        });

        this.chatSocket.on("response", response=>{
            this.processResponse(response, this);
        });

        this.chatSocket.on("service", message=>{
            this.processServiceMessage(message, this);
        });


        this.chatSocket.on("service_record", message=>{
            console.log("Got SERVICE RECORD!");
            this.processServiceRecord(message, this);
        });

        this.chatSocket.on("message", message=>{
            this.processIncomingMessage(message, this)
        });

        this.chatSocket.on('reconnect', (attemptNumber) => {
            console.log("Successfull reconnect client")
        });



        this.chatSocket.on('metadata_update', meta=>{
            this.processMetadataUpdate(meta);
        });


        /*
                this.chatSocket.on("chat_session_registered", (params)=>{
                    if (params.success){
                        this.session.status = "active";
                        this.emit("chat_session_registered");
                    }
                });
        */
        // this.chatSocket.on("last_metadata",(data)=>{
        //     this.processMetadataResponse(data);
        // })
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/



    /**************************************************
     * ========== METADATA MANIPULATION   ============*
     **************************************************/

    /**
     * Takes metadata from session variable,
     * prepares it and sends to all participants
     */
    broadcastMetadataUpdate(metadata){
        let newMetadata = this.session.metadata.toBlob(true);
        let updateRequest = {
            myBlob: newMetadata,
            topicID: this.session.metadata.topicID,
            publicKeyFingerprint: this.session.publicKeyFingerprint,
            recipients :{}
        };

        Object.keys(this.session.metadata.participants).forEach((key)=>{
            //TODO encrypt
            let encryptedMeta = newMetadata;
            let fp = this.session.metadata.participants[key].publicKeyFingerprint;
            let residence = this.session.metadata.participants[key].residence;
            updateRequest.recipients[key] = {
                residence: residence,
                metadata: newMetadata
            }
        });

        this.chatSocket.emit("broadcast_metadata_update", updateRequest);
    }


    //SHIT CODE
    processMetadataUpdate(message, self){
        if(message.headers.event === "new_member_joined"){
            self.processNewMemberJoined(message, self)
        } else if(message.headers.event === "member_booted"){
            self.noteParticipantBooted(message, self)
        }else if( message.headers.event === "u_booted"){
            this.uWereBooted(message, self)
        } else if(message.headers.event === "meta_sync"){
            self.processMetaSync(message, self)
        }
    }

    processMetaSync(message, self){
        if(!self.session){
            return;
        }
        console.log("Processing metadata sync message")
        if(message.body.metadata){
            self._updateMetadata(Metadata.parseMetadata(message.body.metadata));
            self.emit("metadata_updated");
        }
    }

    processNewMemberJoined(request, self){
        if(!self.session){
            return;
        }
        let newMemberPkfp =  request.body.pkfp;
        let newMemberNickname =  request.body.nickname;
        self._updateMetadata(Metadata.parseMetadata(request.body.metadata));
        self.addNewMemberToSettings(newMemberPkfp);
        self.setMemberNickname(newMemberPkfp, newMemberNickname);
        self.saveClientSettings();
        self.emit("new_member_joined");
    }


    _updateMetadata(metadata){
        let self = this;
        let sharedKey = Metadata.extractSharedKey(self.session.publicKeyFingerprint,
            self.session.privateKey,
            metadata);
        self.session.metadata = metadata.body;
        self.session.metadata.sharedKey = sharedKey;
        self.session.metadataSignature = metadata.signature;
    }


    /**************************************************
     * =================== END  ===================== *
     **************************************************/


    /**************************************************
     * ========== SETTINGS UPDATES ====================*
     **************************************************/
    myNicknameUpdate(newNickName){
        if(!newNickName){
            return;
        }
        newNickName = newNickName.trim();
        let settings = this.session.settings;
        if (settings.nickname === newNickName){
            return;
        }
        settings.nickname = newNickName;
        this.setMemberNickname(this.session.publicKeyFingerprint, newNickName);
        this.saveClientSettings(settings, this.session.privateKey)
        this.broadcastNameChange();
    }

    topicNameUpdate(newTopicName){
        if(!newTopicName){
            return;
        }
        newTopicName = newTopicName.trim();
        let settings = this.session.settings;
        if (settings.topicName === newTopicName){
            return;
        }
        settings.topicName = newTopicName;
        this.saveClientSettings(settings, this.session.privateKey)
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/



    /**************************************************
     * ========== UTILS   ============*
     **************************************************/

    signBlob(privateKey, blob){
        let ic = new iCrypto;
        ic.setRSAKey("pk", privateKey, "private")
            .addBlob("b", blob)
            .privateKeySign("b", "pk", "sign")
        return ic.get("sign");
    }

    verifyBlob(publicKey, sign, blob){
        let ic = new iCrypto()
        ic.setRSAKey("pubk", publicKey, "public")
            .addBlob("sign", sign)
            .addBlob("b", blob)
            .publicKeyVerify("b", "sign", "pubk", "v");
        return ic.get("v");
    }




    /**
     * Generates .onion address and RSA1024 private key for it
     */
    generateOnionService(){
        let pkraw = forge.rsa.generateKeyPair(1024);
        let pkfp = forge.pki.getPublicKeyFingerprint(pkraw.publicKey, {encoding: 'hex', md: forge.md.sha1.create()})
        let pem = forge.pki.privateKeyToPem(pkraw.privateKey);

        if (pkfp.length % 2 !== 0) {
            // odd number of characters
            pkfp = '0' + pkfp;
        }
        let bytes = [];
        for (let i = 0; i < pkfp.length/2; i = i + 2) {
            bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
        }

        let onion  = base32.encode(bytes).toLowerCase() + ".onion";
        return {onion: onion, privateKey: pem};
    }

    onionAddressFromPrivateKey(privateKey){
        let ic = new iCrypto()
        ic.setRSAKey("privk", privateKey, "private")
            .publicFromPrivate("privk", "pubk")
        let pkraw = forge.pki.publicKeyFromPem(ic.get("pubk"))
        let pkfp = forge.pki.getPublicKeyFingerprint(pkraw, {encoding: 'hex', md: forge.md.sha1.create()})

        if (pkfp.length % 2 !== 0) {
            pkfp = '0' + pkfp;
        }
        let bytes = [];
        for (let i = 0; i < pkfp.length/2; i = i + 2) {
            bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
        }

        return base32.encode(bytes).toLowerCase() + ".onion";
    }


    extractFromInvite(inviteString64, thingToExtract = "all"){
        let ic = new iCrypto();
        ic.addBlob("is64", inviteString64)
            .base64Decode("is64", "is")
        let inviteParts = ic.get("is").split("/")

        let things = {
            "hsid" : inviteParts[0],
            "pkfp" : inviteParts[1],
            "inviteCode" : inviteParts[2],
            "all" : inviteParts
        };
        try{
            return things[thingToExtract]
        }catch(err){
            throw "Invalid parameter thingToExtract"
        }
    }


    onionValid(candidate){
        let pattern = /^[a-z2-7]{16}\.onion$/;
        return pattern.test(candidate);
    }

    getMyResidence(){
        return this.session.metadata.participants[this.session.publicKeyFingerprint].residence;
    }

    /**************************************************
     * =================== END  ===================== *
     **************************************************/


}

/* harmony default export */ var chat_ChatClient = __webpack_exports__["default"] = (ChatClient_ChatClient);

/***/ })
/******/ ]);