import '../css/main.sass';

import * as toastr from "toastr";
window.toastr = toastr;

import { iCrypto } from "./lib/iCrypto";
import * as forge from "node-forge";
import * as CuteSet from "cute-set"


let adminSession;
let filterFieldSelector;
let logTableBody;

document.addEventListener('DOMContentLoaded', event => {

    $('#admin-login').click(adminLogin);
    $('#island-setup').click(setupIslandAdmin);
    $('#close-code-view').click(closeCodeView);
    $('#run-update').click(launchUpdate);
    $('#add-hidden-service').click(launchHiddenService);

    $('#update-from-file').click(switchUpdateMode);
    $('#update-from-git').click(switchUpdateMode);

    $('#to-chat').click(returnToChat);
    $('#admin-logout-button').click(adminLogout);

    $('#clear-logs').click(clearLogs);
    $('#update-file').change(processUpdateFile);
    if (secured) {
        $('#admin-login--wrapper').css('display', "flex");
        $('#setup--wrapper').hide();
    } else {
        $('#admin-login--wrapper').hide();
        $('#setup--wrapper').show();
    }
    $('#login-setup--wrapper').css('display', "block");

    $('.update-option').each((index, el) => {
        $(el).click(switchUpdateOption);
    });
    logTableBody = document.querySelector("#log-content").lastElementChild;
    filterFieldSelector = document.querySelector('#filter-field-selector');
    filterFieldSelector.addEventListener("change", filterLogs);
    document.querySelector("#log-filter").addEventListener("keyup", filterLogs);
    $('#log-reverse').click(reverseLogList);
    prepareAdminMenuListeners();
    prepareLogPageListeners();
});

/**
 * Updates list of running Island hidden services
 * @param {Array} hiddenServices
 */
function updateHiddenServicesList(hiddenServices) {
    let hsContainer = document.querySelector("#hidden-services-wrap");
    hsContainer.innerHTML = "";
    for (let i in hiddenServices) {
        let hsWrap = document.createElement("div");
        let num = document.createElement("div");
        let val = document.createElement("div");
        let del = document.createElement("div");
        hsWrap.classList.add("hidden-service");
        num.classList.add("hs-num");
        val.classList.add("hs-val");
        del.classList.add("hs-del");
        let enumer = parseInt(i) + 1;
        num.innerHTML = "#" + enumer;
        val.innerHTML = hiddenServices[i].substring(0, 16) + ".onion";
        del.innerHTML = "Delete";
        del.addEventListener("click", deleteHiddenService);
        hsWrap.appendChild(num);
        hsWrap.appendChild(val);
        hsWrap.appendChild(del);
        hsContainer.appendChild(hsWrap);
    }
}

function processNewIslandHiddenServiceAdd(data, response) {
    //UPDATE HS list
    let hiddenServices = data.hiddenServices;
    updateHiddenServicesList(hiddenServices);
    let newHS = data.newHS;
    //SHOW new HS info in modal box if it was added
    if (newHS) {
        let privK = iCrypto.base64ToPEM(newHS.privateKey.substr(8));
        showModalNotification("Hidden service launched!", "Onion address: " + newHS.hsid + "\n\nPrivate key:\n" + privK);
    }
}

function processIslandHiddenServiceDeletion(data, response) {
    let hiddenServices = data.hiddenServices;
    updateHiddenServicesList(hiddenServices);
    toastr.info("Hidden service has been taken down");
}

function onionAddressFromPrivateKey(privateKey) {
    let ic = new iCrypto();
    ic.setRSAKey("privk", privateKey, "private").publicFromPrivate("privk", "pubk");
    let pkraw = forge.pki.publicKeyFromPem(ic.get("pubk"));
    let pkfp = forge.pki.getPublicKeyFingerprint(pkraw, { encoding: 'hex', md: forge.md.sha1.create() });
    if (pkfp.length % 2 !== 0) {
        s = '0' + s;
    }
    let bytes = [];
    for (let i = 0; i < pkfp.length / 2; i = i + 2) {
        bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
    }

    return base32.encode(bytes).toLowerCase() + ".onion";
}

function launchHiddenService() {
    let hsPrivK = document.querySelector("#island-service-private-key").value.trim();
    if (!adminSession) {
        toastr.warning("Login required. Please login to continue");
        return;
    }
    let privKey = adminSession.privateKey;
    let pkfp = adminSession.pkfp;
    let ic = new iCrypto();
    ic.createNonce('n').setRSAKey("pk", privKey, 'private').privateKeySign('n', 'pk', 'sign').bytesToHex('n', 'nhex');

    let onionAddress;
    try {
        if (hsPrivK) {
            onionAddress = onionAddressFromPrivateKey(hsPrivK);
        }

        $.ajax({
            type: "POST",
            url: "/admin",
            dataType: "json",
            data: {
                action: "launch_hidden_service",
                nonce: ic.get('nhex'),
                sign: ic.get('sign'),
                pkfp: pkfp,
                hsPrivateKey: hsPrivK,
                onion: onionAddress
            },
            success: processNewIslandHiddenServiceAdd,
            err: err => {
                console.log("Error generating hidden service: " + err);
            }
        });
    } catch (err) {
        throw "Error launching hidden service: " + err;
    }
}

//TODO finish method!
function deleteHiddenService(ev) {
    let onion = ev.target.previousSibling.innerHTML;

    let privKey = adminSession.privateKey;
    let pkfp = adminSession.pkfp;
    let ic = new iCrypto();
    ic.createNonce('n').setRSAKey("pk", privKey, 'private').privateKeySign('n', 'pk', 'sign').bytesToHex('n', 'nhex');

    $.ajax({
        type: "POST",
        url: "/admin",
        dataType: "json",
        data: {
            action: "delete_hidden_service",
            nonce: ic.get('nhex'),
            sign: ic.get('sign'),
            pkfp: pkfp,
            onion: onion
        },
        success: processIslandHiddenServiceDeletion,
        err: err => {
            console.log("Error deleting hidden service: " + err);
        }
    });
}

function adminLogin() {
    try {
        let privKey = document.querySelector('#admin-private-key').value;
        if (privKey == "") {
            toastr['warning']("You must provide admin's private key");
            return;
        }
        let ic = new iCrypto();
        ic.createNonce('n').setRSAKey("pk", privKey, 'private').privateKeySign('n', 'pk', 'sign').bytesToHex('n', 'nhex').publicFromPrivate("pk", "pub").getPublicKeyFingerprint("pub", "pkfp");

        $.ajax({
            type: "POST",
            url: "/admin",
            dataType: "json",
            data: {
                action: "admin_login",
                nonce: ic.get('nhex'),
                sign: ic.get('sign'),
                pkfp: ic.get("pkfp")
            },
            success: res => {
                clearAdminPrivateKey();
                adminSession = {
                    publicKey: ic.get('pub'),
                    privateKey: ic.get('pk'),
                    pkfp: ic.get('pkfp')
                };

                toastr.info("Admin login successfull!");
                $('#admin-content-wrapper').css("display", "flex");
                $('.heading__main').html("Rule your island");
                $('#admin-login--wrapper').hide();
                processLoginData(res);
                displayAdminMenu(true);
            },
            error: err => {
                clearAdminPrivateKey();
                toastr.warning("Error: \n" + err.responseText);
            }
        });
    } catch (err) {
        clearAdminPrivateKey();
        toastr.warning("Login error: \n" + err);
    }
}

function processLoginData(res) {
    let loggerState = res.loggerInfo.enabled === "true" || res.loggerInfo.enabled === true;
    let loggerLevel = res.loggerInfo.level;
    $("#logs-state").val(loggerState ? "true" : "false");
    $("#log-highest-level").val(loggerLevel);
}

function setupIslandAdmin() {
    loadingOn();
    $('#island-setup').addClass('btn-loading');
    setupAdminContinuation().then(() => {
        toastr.info("Setup successfull!!");
        switchView("admin");
    }).catch(err => {
        toastr.error(err);
    });
}

function setupAdminContinuation() {
    return new Promise((resolve, reject) => {
        let ic = new iCrypto();
        ic.generateRSAKeyPair("kp").createNonce("n").privateKeySign("n", "kp", "sign").bytesToHex("n", "nhex");

        $.ajax({
            type: "POST",
            url: "/admin",
            dataType: "json",
            data: {
                action: "set_admin",
                publickKey: ic.get("kp").publicKey,
                nonce: ic.get('nhex'),
                sign: ic.get("sign")
            },
            success: () => {
                loadingOff();
                adminSession = {
                    publicKey: ic.get('kp').publicKey,
                    privateKey: ic.get('kp').privateKey
                };
                let bodyWrapper = document.createElement("div");
                let pkWrapper = document.createElement("div");
                let tempWrap = document.createElement("div");
                pkWrapper.innerHTML = "<br><b>Your private key:</b> <br> <textarea class='key-display'>" + adminSession.privateKey + "</textarea>";
                bodyWrapper.appendChild(pkWrapper);
                tempWrap.appendChild(bodyWrapper);
                showModalNotification("Success! Save your private key", tempWrap.innerHTML);
                $('#island-setup').removeClass('btn-loading');
                resolve();
            },
            error: err => {
                loadingOff();
                reject("Fail!" + err);
                $('#island-setup').removeClass('btn-loading');
            }
        });
    });
}

function switchView(view) {
    let views = {
        admin: () => {
            $('#admin-login--wrapper').css('display', "flex");
            $('#setup--wrapper').hide();
        }
    };
    views[view]();
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

function closeCodeView() {
    document.querySelector("#code-view").style.display = "none";
}

function switchUpdateMode() {
    if ($('#update-from-file').prop('checked')) {
        $('#update-from-file--wrapper').css("display", "block");
        $('#update-from-git--wrapper').hide();
        $('#github-update-options--wrap').hide();
    } else {
        $('#update-from-file--wrapper').hide();
        $('#update-from-git--wrapper').css("display", "block");
        $('#github-update-options--wrap').css("display", "block");
    }
}

function processUpdateFile() {
    let file = document.querySelector("#update-file").files[0];
    getUpdateFileData(file).then(filedata => {
        let signature = signUpdateFile(filedata);
        document.querySelector("#pkfp").value = adminSession.pkfp;
        document.querySelector("#sign").value = signature;
        document.querySelector("#select-file").innerText = "SELECTED: " + file.name;
    }).catch(err => {
        throw err;
    });
}

function launchUpdate() {
    if ($('#update-from-file').hasClass('active') && document.querySelector("#update-file").value) {
        loadingOn();
        updateFromFile();
    } else if ($('#update-from-git').hasClass('active')) {
        console.log("Updating from GIT");
        loadingOn();
        updateFromGithub();
    } else {
        toastr.warning("Please select the update file!");
    }
}

function updateFromFile() {
    let file = document.querySelector("#update-file").files[0];
    getUpdateFileData(file).then(filedata => {
        let signature = signUpdateFile(filedata);
        sendUpdateFromFileRequest(file, signature);
    }).catch(err => {
        throw err;
    });
}

function getUpdateFileData(file) {
    return new Promise((resolve, reject) => {
        try {
            let reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            reject(err);
        }
    });
}

function signUpdateFile(filedata) {
    let ic = new iCrypto();
    ic.setRSAKey("pk", adminSession.privateKey, "private").addBlob("f", filedata).privateKeySign("f", "pk", "sign");
    return ic.get("sign");
}

function getSelectedUpdateBranch() {
    let branchSelect = document.querySelector("#gh-update-branch-select");
    return branchSelect.options[branchSelect.options.selectedIndex].value;
}

function updateFromGithub() {
    let ic = new iCrypto();

    ic.setRSAKey("pk", adminSession.privateKey, "private").createNonce("n").bytesToHex("n", "nhex").privateKeySign("n", "pk", "sign");
    let data = new FormData();
    data.append("action", "update_from_github");
    data.append("branch", getSelectedUpdateBranch());
    data.append("pkfp", adminSession.pkfp);
    data.append("nonce", ic.get("nhex"));
    data.append("sign", ic.get("sign"));
    sendUpdateRequest(data);
}

function sendUpdateFromFileRequest(filedata, signature) {
    let data = new FormData();
    data.append("action", "update_from_file");
    data.append("pkfp", adminSession.pkfp);
    data.append("file", document.querySelector("#update-file").files[0]);
    data.append("sign", signature);

    sendUpdateRequest(data);
}

function sendUpdateRequest(data) {
    let request = new XMLHttpRequest();
    request.open("POST", window.location.href, true);
    request.send(data);
    request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
            //
            console.log("Handling response");
            loadingOff();
            if (request.status === 200) {
                $('#close-code-view').hide();
                showModalNotification("Update completed", "<span id=timer>You will be redirected in 5 seconds</span>");
                delayedPageReload(5);
            } else {
                toastr.warning("Update failed: " + request.responseText);
            }
        }
    };
}

function delayedPageReload(seconds) {
    if (--seconds) {
        $("#timer").text("You will be redirected in " + seconds + (seconds > 1 ? " seconds" : " second"));
    } else {
        window.location.href = "/";
        return;
    }
    setTimeout(() => {
        delayedPageReload(seconds);
    }, 1000);
}
function loadingOnPromise() {
    return new Promise((resolve, reject) => {
        try {
            loadingOn();
            resolve();
        } catch (err) {
            reject(err);
        }
    });
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

function switchUpdateOption(event) {
    if ($(event.target).hasClass("active")) {
        return;
    }

    $(".update-option").each((index, el) => {
        if (!$(el).hasClass("active") && $(el).attr("id") === "update-from-file") {
            $("#update-file--wrapper").css("display", "flex");
        } else if ($(el).hasClass("active") && $(el).attr("id") === "update-from-file") {
            $("#update-file--wrapper").css("display", "none");
        }
        $(el).toggleClass("active");
    });
}

function returnToChat() {
    adminSession = undefined;
    clearAdminPrivateKey();
    document.location = "/";
}

function adminLogout() {
    displayAdminMenu(false);
    adminSession = undefined;
    clearAdminPrivateKey();
    document.location.reload();
}

function displayAdminMenu(on) {
    if (on) {
        $('#admin-menu').css("display", "flex");
    } else {
        $('#admin-menu').hide();
    }
}

function prepareAdminMenuListeners() {
    document.querySelector("#island-admin-main-menu").childNodes.forEach(node => {
        node.addEventListener("click", processMainMenuClick);
    });
}

function processMainMenuClick(ev) {
    if (ev.target.classList.contains("active")) {
        return;
    }
    let menu = document.querySelector("#island-admin-main-menu");
    for (let item of menu.children) {
        item.classList.remove("active");
    };

    let pages = document.querySelector("#admin-pages");
    for (let item of pages.children) {
        item.classList.remove("active");
    };

    let index = getElementIndex(ev.target);

    pages.children[index].classList.add("active");
    menu.children[index].classList.add("active");
    document.querySelector("#admin-section-heading").innerHTML = ev.target.innerHTML;
}

function clearAdminPrivateKey() {
    $("#admin-private-key").val("");
}

function getElementIndex(node) {
    let index = 0;
    while (node = node.previousElementSibling) {
        index++;
    }
    return index;
}

function loadLogs(errorsOnly = false) {
    let privKey = adminSession.privateKey;
    let pkfp = adminSession.pkfp;
    let ic = new iCrypto();
    ic.createNonce('n').setRSAKey("pk", privKey, 'private').privateKeySign('n', 'pk', 'sign').bytesToHex('n', 'nhex');

    $.ajax({
        type: "POST",
        url: "/admin",
        dataType: "json",
        data: {
            action: "load_logs",
            nonce: ic.get('nhex'),
            sign: ic.get('sign'),
            pkfp: pkfp,
            errorsOnly: errorsOnly
        },
        success: processLogsLoaded,
        err: err => {
            console.log("Error loading logs: " + err);
            toastr.warning("Error loading logs: " + err);
        }
    });
}

function processLogsLoaded(res) {
    let records = res.records.split("\n");
    let table = document.querySelector("#log-content").lastElementChild;
    table.innerHTML = "";
    for (let record of records) {
        let parsed;
        try {
            parsed = JSON.parse(record);
        } catch (err) {
            continue;
        }

        let row = document.createElement("tr");
        row.classList.add(parsed.level);
        let ts = document.createElement("td");
        let level = document.createElement("td");
        let msg = document.createElement("td");
        ts.classList.add("log-timestamp");
        level.classList.add("log-level");
        msg.classList.add("log-msg");
        ts.innerHTML = parsed.timestamp;
        level.innerHTML = parsed.level;
        msg.innerHTML = parsed.message;
        row.append(ts);
        row.append(level);
        row.append(msg);
        let additionalValues = new CuteSet(Object.keys(parsed)).minus(["level", "message", "timestamp"]);
        if (additionalValues.length() > 0) {
            let addCell = document.createElement("td");
            for (let key of additionalValues) {
                let wrap = document.createElement("div");
                wrap.classList.add("log-add-value");
                let k = document.createElement("div");
                let b = document.createElement("b");
                k.classList.add("log-key");
                let v = document.createElement("div");
                v.classList.add("log-val");
                b.innerHTML = key;
                k.appendChild(b);
                v.innerHTML = parsed[key];
                wrap.appendChild(k);
                wrap.appendChild(v);
                addCell.appendChild(wrap);
                row.appendChild(addCell);
            }
        }
        table.appendChild(row);
    }
    toastr.info("Logs loaded successfully");
}

function requestLoggerStateChange(ev) {
    let selectedElement = ev.target.options[ev.target.selectedIndex];
    let privKey = adminSession.privateKey;
    let pkfp = adminSession.pkfp;
    let ic = new iCrypto();
    ic.createNonce('n').setRSAKey("pk", privKey, 'private').privateKeySign('n', 'pk', 'sign').bytesToHex('n', 'nhex');

    $.ajax({
        type: "POST",
        url: "/admin",
        dataType: "json",
        data: {
            action: "logger_state_change",
            nonce: ic.get('nhex'),
            state: selectedElement.value,
            sign: ic.get('sign'),
            pkfp: pkfp

        },
        success: () => {
            let message = "Logger has been successfully " + (selectedElement.value === "true" ? "enabled" : "disabled");
            toastr.info(message);
        },
        err: err => {
            toastr.warning("Error loading logs: " + err);
        }
    });
}

function requestLoggerLevelChange(ev) {
    let selectedElement = ev.target.options[ev.target.selectedIndex];
    let privKey = adminSession.privateKey;
    let pkfp = adminSession.pkfp;
    let ic = new iCrypto();
    ic.createNonce('n').setRSAKey("pk", privKey, 'private').privateKeySign('n', 'pk', 'sign').bytesToHex('n', 'nhex');

    $.ajax({
        type: "POST",
        url: "/admin",
        dataType: "json",
        data: {
            action: "log_level_change",
            nonce: ic.get('nhex'),
            level: selectedElement.value,
            sign: ic.get('sign'),
            pkfp: pkfp

        },
        success: () => {
            toastr.info("Log level has been changed to: " + selectedElement.value);
        },
        err: err => {
            toastr.warning("Error loading logs: " + err);
        }
    });
}

function prepareLogPageListeners() {
    document.querySelector("#load-logs").addEventListener("click", () => {
        loadLogs();
    });

    document.querySelector("#load-error-logs").addEventListener("click", () => {
        loadLogs(true);
    });

    document.querySelector("#logs-state").addEventListener("change", requestLoggerStateChange);
    document.querySelector("#log-highest-level").addEventListener("change", requestLoggerLevelChange);
}

function reverseLogList() {

    for (let i = 0; i < logTableBody.childNodes.length; i++) {
        logTableBody.insertBefore(logTableBody.childNodes[i], logTableBody.firstChild);
    }
}

function filterLogs(ev) {
    let filter;
    try {
        filter = new RegExp(ev.target.value);
        if (!filter || filter.length === 0) {
            return;
        }
    } catch (err) {
        return;
    }

    for (let i = 0; i < logTableBody.childNodes.length; i++) {

        let selectedField = parseInt(filterFieldSelector.options[filterFieldSelector.selectedIndex].value);
        let row = logTableBody.childNodes[i];
        let testingField;
        if (!isNaN(selectedField)) {
            testingField = row.children[selectedField] ? row.children[selectedField].innerHTML : "";
        } else {
            testingField = row.innerHTML;
        }
        filter.test(testingField) ? logTableBody.childNodes[i].classList.remove("log-row-hidden") : logTableBody.childNodes[i].classList.add("log-row-hidden");
    }
}

function clearLogs(ev) {
    let privKey = adminSession.privateKey;
    let pkfp = adminSession.pkfp;
    let ic = new iCrypto();
    ic.createNonce('n').setRSAKey("pk", privKey, 'private').privateKeySign('n', 'pk', 'sign').bytesToHex('n', 'nhex');

    $.ajax({
        type: "POST",
        url: "/admin",
        dataType: "json",
        data: {
            action: "clear_logs",
            nonce: ic.get('nhex'),
            sign: ic.get('sign'),
            pkfp: pkfp
        },
        success: () => {
            logTableBody.innerHTML = "";
            toastr.info("Log level have been cleared");
        },
        err: err => {
            toastr.warning("Error clearing logs: " + err);
        }
    });
}