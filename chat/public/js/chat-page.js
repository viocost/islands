"use strict";

var chat = void 0;

var DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//variables to create new topic
var nickname = void 0,
    topicName = void 0;

//variables to topic login
var topicID = void 0;

var sounds = {};

var soundsOnOfIcons = {
    on: "/img/sound-on.png",
    off: "/img/sound-off.png"
};

var sendLock = false;

var mainMenuItems = [{
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

var tempName = void 0;

var recording = false;

//variables to display new topic data
//let newPubKey, newPrivKey, newNickname, newTopicID, newTopicName;

document.addEventListener('DOMContentLoaded', function (event) {
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
    $('#private-key').keyup(async function (e) {
        if (e.keyCode === 13) {
            await topicLogin();
        }
    });

    $('#join-nickname, #invite-code').keyup(async function (e) {
        if (e.keyCode === 13) {
            await joinTopic();
        }
    });

    $('#new-topic-nickname, #new-topic-name').keyup(async function (e) {
        if (e.keyCode === 13) {
            createTopic();
        }
    });

    enableSettingsMenuListeners();
});

function loadSounds() {
    var sMap = {
        "incoming_message": "message_incoming.mp3",
        "message_sent": "message_sent.mp3",
        "user_online": "user_online.mp3"
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(sMap)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var s = _step.value;

            sounds[s] = new Audio("/sounds/" + sMap[s]);
            sounds[s].load();
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
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
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function moveCursorToStart(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = 0;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function createTopic() {
    nickname = document.querySelector('#new-topic-nickname').value.trim();
    topicName = document.querySelector('#new-topic-name').value.trim();
    loadingOn();
    chat.initTopic(nickname, topicName).then(function (data) {
        console.log("Topic create attempt successful");
        nickname.value = "";
        topicName.value = "";
    }).catch(function (err) {
        console.log("Error creating topic: " + err);
        loadingOff();
    });
}

async function topicLogin() {
    loadingOn();
    console.log("called topic login");
    var privKey = document.querySelector('#private-key').value;
    clearLoginPrivateKey();
    await chat.topicLogin(privKey);
}

async function joinTopic() {
    var inviteCode = document.querySelector('#invite-code').value.trim();
    var nickname = document.querySelector('#join-nickname').value.trim();
    loadingOn();
    try {
        var data = await chat.initTopicJoin(nickname, inviteCode);
    } catch (err) {
        toastr.error("Topic was not created. Error: " + err);
        loadingOff();
    }
}

function setupChatListeners(chat) {
    chat.on("init_topic_success", function (data) {
        loadingOff();
        displayNewTopicData(data);
    });
    chat.on("init_topic_error", function (err) {
        var msg = void 0;
        if (err instanceof Error) {
            msg = err.message;
        } else {
            msg = err;
        }
        loadingOff();
        toastr.error("Topic was not created. Error: " + msg);
    });

    chat.on("login_success", function (messages) {
        document.querySelector('#sounds-switch').src = chat.session.settings.soundsOn ? soundsOnOfIcons.on : soundsOnOfIcons.off;
        loadingOff();
        clearAllInputs();
        processLogin(messages);
        playSound("user_online");
        toastr.success("You are now online!");
    });

    chat.on("unknown_error", function (err) {
        console.log("unknown_error emited by chat: " + err);
        toastr.error("Chat error: " + err);
    });
    chat.on("login_fail", function (err) {
        clearLoginPrivateKey();
        loadingOff();
        console.log("Login fail emited by chat: " + err);
        toastr.error("Login fail: " + err);
    });

    chat.on('request_invite_success', function (inviteID) {
        buttonLoadingOff(document.querySelector("#new-invite"));
        showInviteCode(inviteID);
    });

    chat.on('invite_updated', function () {
        toastr.info("Invite updated!");
    });

    chat.on("new_member_joined", function (data) {
        processNewMemberJoin(data);
    });

    chat.on("settings_updated", function () {
        updateParticipants();
        syncPendingInvites();
        updateLoadedMessages();
    });

    chat.on("participant_booted", function (message) {
        updateParticipants();
        toastr.info(message);
    });

    chat.on("metadata_updated", function () {
        updateParticipants();
        updateLoadedMessages();
    });

    chat.on("boot_participant_success", function (message) {
        updateParticipants();
        toastr.info(message);
    });

    chat.on("u_booted", function (message) {
        toastr.warning(message);
    });

    chat.on("boot_participant_fail", function (message) {
        toastr.warning("Participant booting failed: " + message);
    });

    chat.on("topic_join_success", function (data) {
        processTopicJoinSuccess(data);
    });

    chat.on("del_invite_fail", function () {
        toastr.warning("Error deleting invite");
    });

    chat.on("del_invite_success", function () {
        syncPendingInvites();
        toastr.info("Invite was deleted");
    });

    chat.on("chat_message", function (data) {
        processIncomingMessage(data);
        playSound("incoming_message");
    });

    chat.on("send_success", function (message) {
        playSound("message_sent");
        messageSendSuccess(message);
    });

    chat.on("send_fail", function (message) {
        messageSendFail(message);
    });

    chat.on("service_record", function (record) {
        processServiceRecord(record);
    });

    chat.on("sync_invites_success", function () {
        refreshInvitesSuccess();
    });

    chat.on("sync_invites_error", function (msg) {
        buttonLoadingOff(document.querySelector('#refresh-invites'));
        toastr.warning("Invite request failed: " + msg);
    });

    chat.on("request_invite_error", function (msg) {
        buttonLoadingOff(document.querySelector('#new-invite'));
        toastr.warning("Invite request failed: " + msg);
    });

    chat.on("messages_loaded", function (messages) {
        processMessagesLoaded(messages);
    });

    chat.on("connected_to_island", function () {
        switchConnectionStatus(true);
    });

    chat.on("disconnected_from_island", function () {
        switchConnectionStatus(false);
    });

    chat.on("download_complete", function (res) {
        var fileInfo = JSON.parse(res.fileInfo);
        var fileData = res.fileData;
        if (/audio/.test(fileInfo.type)) {
            loadAudio(fileInfo, fileData);
        } else {
            downloadAttachment(fileInfo.name, fileData);
        }
    });
}
function processIncomingMessage(message) {
    var pkfp = message.header.author;
    var storedNickname = chat.getMemberNickname(pkfp);
    if (storedNickname !== message.header.nickname) {
        chat.setMemberNickname(pkfp, message.header.nickname);
        storedNickname = chat.getMemberNickname(pkfp);
        chat.saveClientSettings(chat.session.publicKeyFingerprint);
    }
    var alias = chat.getMemberAlias(pkfp);
    var timestamp = message.header.timestamp;
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
    var timestamp = record.header.timestamp;
    var pkfp = record.header.author;
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
    var message = document.querySelector('#new-msg');
    var attachments = document.querySelector('#attach-file').files;
    var addresseeSelect = document.querySelector("#select-member");
    var addressee = addresseeSelect[addresseeSelect.selectedIndex].value;

    if (message.value.trim() === "" && attachments.length === 0) {
        lockSend(false);
        return;
    }

    if (addressee === "ALL") {
        chat.shoutMessage(message.value.trim(), attachments).then(function () {
            console.log("Send message resolved");
        }).catch(function (err) {
            console.log("Error sending message" + err.message);
            lockSend(false);
        });
    } else {
        chat.whisperMessage(addressee, message.value.trim()).then(function () {
            console.log("Done whispering message!");
        }).catch(function (err) {
            console.log("Error sending message" + err.message);
            lockSend(false);
        });
    }

    message.value = "";
}

function messageSendSuccess(message) {
    var pkfp = message.header.author;
    var nickname = chat.getMemberNickname(pkfp) || message.header.nickname;

    var timestamp = message.header.timestamp;

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
    var d = new Date();
    return padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
}

function getChatFormatedDate(timestamp) {
    var d = new Date(timestamp);
    var today = new Date();
    if (Math.floor((today - d) / 1000) <= 64000) {
        return d.getHours() + ':' + padWithZeroes(2, d.getMinutes());
    } else {
        return DAYSOFWEEK[d.getDay()] + ", " + d.getMonth() + "/" + padWithZeroes(2, d.getDate()) + " " + padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
    }
}

function padWithZeroes(requiredLength, value) {
    var res = "0".repeat(requiredLength) + String(value).trim();
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
    var participantPkfp = event.target.parentElement.parentElement.lastElementChild.innerHTML;
    var participant = chat.session.settings.membersData[participantPkfp];

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

    var records = document.querySelector("#participants-records");
    var participant = chat.session.metadata.participants[key];
    if (!participant) {
        console.error("Error adding participant");
        return;
    }

    var wrapper = document.createElement("div");
    var id = document.createElement("div");
    var nickname = document.createElement("div");
    var rights = document.createElement("div");
    var actions = document.createElement("div");
    var delButton = document.createElement("div");

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

    var mypkfp = chat.session.publicKeyFingerprint;
    var participantsKeys = Object.keys(chat.session.metadata.participants).filter(function (val) {
        return val !== mypkfp;
    });

    var recipientChoice = document.querySelector("#select-member");
    var defaultRecipient = document.createElement("option");
    defaultRecipient.setAttribute("value", "ALL");
    defaultRecipient.innerText = "All";
    recipientChoice.innerHTML = "";
    recipientChoice.appendChild(defaultRecipient);

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = participantsKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var pkfp = _step2.value;

            addParticipantToSettings(pkfp);
            var participantId = document.createElement("span");
            participantId.classList.add("online-user-id");
            participantId.innerText = pkfp;
            var status = document.createElement("img");
            status.classList.add("participant-status");
            status.setAttribute("src", "/img/online.png");

            var pName = document.createElement("input");

            pName.value = chat.getMemberAlias(pkfp) || chat.getMemberNickname(pkfp) || "Anonymous";
            pName.addEventListener("change", participantAliasChange);
            pName.classList.add("participant-alias");

            var pRow = document.createElement("div");
            pRow.classList.add("online-user-row");
            pRow.appendChild(participantId);
            pRow.appendChild(status);
            pRow.appendChild(pName);

            if (chat.getMemberAlias(pkfp)) {
                var chosenName = document.createElement("span");
                chosenName.innerText = "(" + (chat.getMemberNickname(pkfp) || "Anonymous") + ")";
                pRow.appendChild(chosenName);
            }

            document.querySelector("#online-users-list").appendChild(pRow);

            //Adding to list of recipients
            var recipientOption = document.createElement("option");
            recipientOption.setAttribute("value", pkfp);
            recipientOption.innerText = pName.value + " (" + chat.getMemberNickname(pkfp) + ")";
            recipientChoice.appendChild(recipientOption);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    var participantsRecords = document.querySelector("#participants-records");
    if (participantsRecords.children.length > 0) {
        participantsRecords.lastChild.classList.add("participant-wrapper-last");
    }
}

function updateLoadedMessages() {

    document.querySelector("#chat_window").childNodes.forEach(function (msg) {
        if (msg.classList.contains("service-record")) {
            return;
        } else if (msg.classList.contains("my_message")) {
            if (!msg.classList.contains("private-message")) {
                return;
            }
            try {
                var heading = msg.firstChild;
                var pkfp = heading.querySelector(".m-recipient-id").innerHTML;
                heading.querySelector(".private-mark").innerText = "(private to " + chat.getMemberAlias(pkfp) + ")";
            } catch (err) {
                console.error(err);
            }
        } else {
            try {
                var _heading = msg.firstChild;
                var _pkfp = _heading.querySelector(".m-author-id").innerHTML;
                _heading.querySelector(".m-alias").innerText = chat.getMemberAlias(_pkfp);
            } catch (err) {
                console.error(err);
            }
        }
    });
}

function processLogin(messages) {
    setView("chat");
    var nickName = chat.session.settings.nickname;
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
        var message = messages.shift();
        try {
            message = typeof message === "string" ? JSON.parse(message) : message;
        } catch (err) {
            console.log("Could not parse json. Message: " + messages[messages.length - i - 1]);
            continue;
        }
        var authorPkfp = message.header.author;
        var alias = isMyMessage(authorPkfp) ? chat.getMemberNickname(authorPkfp) : chat.getMemberRepr(authorPkfp);
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
    $('#chat-view-button').click(function () {
        setView("chat");
    });
    $('#settings-view-button').click(function () {
        setView("settings");
    });

    $('#logout-button').click(function () {
        processLogout();
    });
}

function onLoginLoadMessages(messages) {
    document.querySelector("#chat_window").innerHTML = "";
    for (var _i = 0; _i < messages.length; ++_i) {
        var message = void 0;
        try {
            message = typeof messages[messages.length - _i - 1] === "string" ? JSON.parse(messages[messages.length - _i - 1]) : messages[messages.length - _i - 1];
        } catch (err) {
            console.log("Could not parse json. Message: " + messages[messages.length - _i - 1]);
            continue;
        }
        var pkfp = message.header.author;
        var alias = isMyMessage(pkfp) ? chat.getMemberNickname(pkfp) : chat.getMemberRepr(pkfp);

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
function appendMessageToChat(message) {
    var toHead = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var chatWindow = document.querySelector('#chat_window');
    var msg = document.createElement('div');
    var message_id = document.createElement('div');
    var message_body = document.createElement('div');

    message_body.classList.add('msg-body');
    var message_heading = buildMessageHeading(message);

    if (isMyMessage(message.pkfp)) {
        // My message
        msg.classList.add('my_message');
    } else if (message.service) {
        msg.classList.add('service-record');
    } else {
        //Not my Message
        msg.classList.add('message');
        var author = document.createElement('div');
        author.classList.add("m-author-id");
        author.innerHTML = message.pkfp;
        message_heading.appendChild(author);
    }
    if (message.private) {
        var privateMark = preparePrivateMark(message);
        message_heading.appendChild(privateMark);
        msg.classList.add('private-message');
    }

    message_id.classList.add("message-id");
    message_id.innerHTML = message.messageID;
    message_heading.appendChild(message_id);
    message_body.appendChild(processMessageBody(message.body));
    //msg.innerHTML = '<b>'+message.author +'</b><br>' + message.message;

    //processing attachments
    var attachments = processAttachments(message.attachments);
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
    var message_heading = document.createElement('div');
    message_heading.classList.add('msg-heading');

    var alias = void 0,
        aliasNicknameDevisor = void 0;
    if (message.alias) {
        alias = document.createElement("b");
        alias.classList.add("m-alias");
        alias.innerText = message.alias;
        aliasNicknameDevisor = document.createElement("span");
        aliasNicknameDevisor.innerText = "  --  ";
    }

    var nickname = document.createElement("b");
    nickname.innerText = message.nickname;
    nickname.classList.add("m-nickname");

    var time_stamp = document.createElement('span');
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
        var recipientId = document.createElement("div");
        recipientId.innerHTML = message.recipient;
        recipientId.classList.add("m-recipient-id");
        message_heading.appendChild(recipientId);
    }
    return message_heading;
}

function preparePrivateMark(message) {
    var privateMark = document.createElement("span");
    privateMark.classList.add("private-mark");
    if (isMyMessage(message.pkfp)) {
        privateMark.innerText = "(private to: ";
        var recipientName = chat.getMemberRepr(message.recipient);
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
    var target = ev.target;
    while (target && !target.classList.contains("att-view")) {
        target = target.parentNode;
    }

    if (!target) {
        throw "att-view container not found...";
    }
    var fileInfo = target.nextSibling.innerHTML; //Extract fileInfo from message
    console.log("obtained fileinfo: " + fileInfo);
    var file = await chat.downloadAttachment(fileInfo); //download file
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

    var getAttachmentSize = function getAttachmentSize(size) {
        var res = "";
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

    var attachmentsWrapper = document.createElement("div");
    attachmentsWrapper.classList.add("msg-attachments");

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = attachments[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var att = _step3.value;

            var attachment = document.createElement("div");
            var attView = document.createElement("div");
            var attInfo = document.createElement("div");
            var attSize = document.createElement("span");
            var attName = document.createElement("span");
            var attIcon = document.createElement("span");
            var iconImage = document.createElement("img");

            // //State icons
            var attState = document.createElement("div");
            attState.classList.add("att-state");

            var spinner = document.createElement("img");
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
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return attachmentsWrapper;
}

function processMessageBody(text) {
    text = text.trim();
    var result = document.createElement("div");
    var startPattern = /__code/;
    var endPattern = /__end/;

    //no code
    if (text.search(startPattern) === -1) {
        result.appendChild(document.createTextNode(text));
        return result;
    }
    //first occurrence of the code
    var firstOccurrence = text.search(startPattern);
    if (text.substring(0, firstOccurrence).length > 0) {
        result.appendChild(document.createTextNode(text.substring(0, firstOccurrence)));
        text = text.substr(firstOccurrence);
    }
    var substrings = text.split(startPattern).filter(function (el) {
        return el.length !== 0;
    });
    for (var _i2 = 0; _i2 < substrings.length; ++_i2) {
        var pre = document.createElement("pre");
        var code = document.createElement("code");
        var afterText = null;
        var endCode = substrings[_i2].search(endPattern);
        if (endCode === -1) {
            code.innerText = processCodeBlock(substrings[_i2]);
        } else {
            code.innerText = processCodeBlock(substrings[_i2].substring(0, endCode));
            var rawAfterText = substrings[_i2].substr(endCode + 5).trim();
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
    var pre = document.createElement("pre");
    pre.innerHTML = event.target.innerHTML;
    var div = document.createElement("div");
    div.appendChild(pre);
    showModalNotification("Code:", div.innerHTML);
}

function closeCodeView() {
    clearModal();
    document.querySelector("#code-view").style.display = "none";
}

function processCodeBlock(code) {
    code = code.trim();
    var separator = code.match(/\r?\n/) ? code.match(/\r?\n/)[0] : "\r\n";
    var lines = code.split(/\r?\n/);
    var min = Infinity;
    for (var _i3 = 1; _i3 < lines.length; ++_i3) {
        if (lines[_i3] === "") continue;
        try {
            min = Math.min(lines[_i3].match(/^\s+/)[0].length, min);
        } catch (err) {
            //found a line with no spaces, therefore returning the entire block as is
            return lines.join(separator);
        }
    }
    for (var _i4 = 1; _i4 < lines.length; ++_i4) {
        lines[_i4] = lines[_i4].substr(min);
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
    var nickname = document.querySelector('#new-participant-nickname').value;
    var pubKey = document.querySelector('#new-participant-public-key').value;
    var residence = document.querySelector('#new-participant-residence').value;
    var rights = document.querySelector('#new-participant-rights').value;
    chat.addNewParticipant(nickname, pubKey, residence, rights);
}

function broadcastNewMessage() {
    var newMessage = document.querySelector('#new-message').value;
    chat.shoutMessage(newMessage);
}

function displayNewTopicData(data, heading, toastrMessage) {
    heading = heading ? heading : "Your new topic data. SAVE YOUR PRIVATE KEY!!!";
    toastrMessage = toastrMessage ? toastrMessage : "Topic was created successfully!";
    var nicknameWrapper = document.createElement("div");
    var pkWrapper = document.createElement("div");
    var bodyWrapper = document.createElement("div");
    nicknameWrapper.innerHTML = "<b>Nickname: </b>" + data.nickname;
    pkWrapper.innerHTML = "<br><b>Your private key:</b> <br> <textarea class='key-display'>" + data.privateKey + "</textarea>";
    bodyWrapper.appendChild(nicknameWrapper);
    bodyWrapper.appendChild(pkWrapper);
    var tempWrap = document.createElement("div");
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
    var wrapper = document.createElement("div");
    wrapper.classList.add("modal-notification--wrapper");
    var heading = document.createElement("h3");
    heading.classList.add("modal-notification--heading");
    var body = document.createElement("div");
    body.classList.add("modal-notification--body");
    heading.innerText = headingText;
    body.innerHTML = bodyContent;
    wrapper.appendChild(heading);
    wrapper.appendChild(body);
    var modalContent = document.querySelector('#code--content');
    modalContent.innerHTML = "";
    modalContent.appendChild(wrapper);
    var modalView = document.querySelector('#code-view');
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
    var invites = Object.keys(chat.session.settings.invites);
    var container = document.querySelector('#pending-invites');
    container.innerHTML = "";
    for (var _i5 in invites) {
        var inviteWrap = document.createElement("div");
        var inviteNum = document.createElement("div");
        var inviteRep = document.createElement("input");
        var inviteCopy = document.createElement("div");
        var inviteDel = document.createElement("div");
        var inviteID = document.createElement("div");
        var inviteCopyButton = document.createElement("button");
        var inviteDelButton = document.createElement("button");
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

        inviteID.innerText = invites[_i5];

        inviteRep.value = chat.session.settings.invites[invites[_i5]].name ? chat.session.settings.invites[invites[_i5]].name : "New member";

        inviteNum.innerText = "#" + (parseInt(_i5) + 1);
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
    var newName = event.target.value.trim();
    if (newName === "") {
        event.target.value = tempName;
        return;
    } else {
        chat.updateSetInviteeName(event.target.parentNode.lastChild.innerHTML, newName);
    }
    event.target.removeEventListener("focusout", processInviteeNameInput);
}

function copyInviteCode(event) {
    var inviteElement = event.target.parentNode.parentNode.lastChild;
    var inviteID = inviteElement.innerHTML;
    var textArea = document.createElement("textarea");
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
    var button = event.target;
    var inviteID = button.parentNode.parentNode.lastChild.innerHTML;
    chat.deleteInvite(inviteID);
}

function processTopicJoinSuccess(data) {
    clearInviteInputs();
    loadingOff();
    var heading = "You have joined topic successfully, and can now login. SAVE YOUR PRIVATE KEY!!!";
    var toastrMessage = "Topic was created successfully!";
    displayNewTopicData(data, heading, toastrMessage);
}

function enableSettingsMenuListeners() {
    var menuItems = document.querySelector("#settings-menu").children;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = menuItems[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _i6 = _step4.value;

            _i6.addEventListener("click", processSettingsMenuClick);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    document.querySelector("#invites-container").style.display = "flex";
    document.querySelector("#chat-settings").style.display = "none";
    document.querySelector("#participants-container").style.display = "none";
    document.querySelector("#admin-tools-container").style.display = "none";
}

function processSettingsMenuClick(event) {
    var menuItems = document.querySelector("#settings-menu").children;
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = menuItems[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _i7 = _step5.value;

            _i7.classList.remove("active");
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    var target = event.target;
    target.classList.add("active");
    document.querySelector("#invites-container").style.display = target.innerText === "INVITES" ? "flex" : "none";
    document.querySelector("#participants-container").style.display = target.innerText === "PARTICIPANTS" ? "flex" : "none";
    document.querySelector("#chat-settings").style.display = target.innerText === "CHAT SETTINGS" ? "flex" : "none";
    document.querySelector("#admin-tools-container").style.display = target.innerText === "ADMIN TOOLS" ? "flex" : "none";
}

function processChatScroll(event) {
    var chatWindow = event.target;
    if (!chatWindow.firstChild) return;
    if ($(event.target).scrollTop() <= 1) {
        //load more messages
        var lastLoadedMessageID = chatWindow.firstChild.querySelector(".message-id").innerText;
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
    var arr = new Uint8Array(data);
    var fileURL = URL.createObjectURL(new Blob([arr]));
    downloadURI(fileURL, fileName);
}

/**
 * Searches loaded message with provided ID
 * @param id
 */
function findMessage(id) {
    var chatWindow = document.querySelector("#chat_window");
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = chatWindow.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var msg = _step6.value;


            if (msg.getElementsByClassName("message-id")[0].innerHTML == id) {
                console.log("Message found");
                return msg;
            }
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }
}

async function loadAudio(fileInfo, fileData) {
    //search right message
    var message = findMessage(fileInfo.messageID);
    if (!message) {
        console.error("Message not found");
        return;
    }

    var audio = document.createElement("audio");
    var arr = new Uint8Array(fileData);
    var fileURL = URL.createObjectURL(new Blob([arr]));
    audio.setAttribute("controls", "");
    audio.setAttribute("src", fileURL);

    var viewWrap = message.getElementsByClassName("att-view")[0];
    viewWrap.innerHTML = "";
    viewWrap.appendChild(audio);
    console.log("Removing even listener");
    viewWrap.removeEventListener("click", downloadOnClick);
}

function processAttachmentChosen(ev) {
    var attachemtsWrapper = document.querySelector("#chosen-files");
    var fileData = ev.target.files[0];
    attachemtsWrapper.innerHTML = "";
    if (!fileData) {
        return;
    }

    var attWrapper = document.createElement("div");
    attWrapper.classList.add("chosen-file-wrap");

    var chosenFileTxt = document.createElement("div");
    chosenFileTxt.classList.add("chosen-file");
    chosenFileTxt.innerText = fileData.name;
    var closeImg = document.createElement("img");
    closeImg.setAttribute("src", "/img/close.png");
    closeImg.addEventListener("click", clearAttachments);

    attWrapper.appendChild(closeImg);
    attWrapper.appendChild(chosenFileTxt);
    attachemtsWrapper.appendChild(attWrapper);
}

function clearAttachments() {
    var attachemtsInput = document.querySelector("#attach-file");
    attachemtsInput.value = "";
    var attachemtsWrapper = document.querySelector("#chosen-files");
    attachemtsWrapper.innerHTML = "";
}

function editMyNickname(ev) {
    var newNickname = ev.target.value.trim();
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
    var newTopicName = ev.target.value.trim();
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
    var positive = document.querySelector("#connection-status--connected");
    var negative = document.querySelector("#connection-status--disconnected");
    if (connected) {
        $(positive).show();
        $(negative).hide();
    } else {
        $(positive).hide();
        $(negative).show();
    }
}

function attemptReconnection() {
    chat.attemptReconnection().then(function () {}).catch(function (err) {
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
    var id = ev.target.parentNode.firstChild.innerText;
    var newAlias = ev.target.value.trim();
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
    var sendButton = document.querySelector('#send-new-msg');
    var newMsgField = document.querySelector('#new-msg');
    sendLock ? buttonLoadingOn(sendButton) : buttonLoadingOff(sendButton);
    sendLock ? newMsgField.setAttribute("disabled", true) : newMsgField.removeAttribute("disabled");
}

function processMainMenuSwitch(ev) {
    var menuLength = mainMenuItems.length;
    var activeIndex = mainMenuItems.filter(function (item) {
        return item.active;
    })[0].index;
    var newActive = (ev.currentTarget.classList.contains("right-arrow-wrap") ? activeIndex + 1 : activeIndex - 1) % menuLength;
    if (newActive < 0) {
        newActive = menuLength + newActive;
    }
    mainMenuItems[activeIndex].active = false;
    mainMenuItems[newActive].active = true;
    $(mainMenuItems[activeIndex].selector).hide("fast");
    $(mainMenuItems[newActive].selector).show("fast");

    var nextIndex = (newActive + 1) % menuLength;
    var previousIndex = (newActive - 1) % menuLength;
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