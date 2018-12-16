'use strict';

var adminSession = void 0;
var filterFieldSelector = void 0;
var logTableBody = void 0;

document.addEventListener('DOMContentLoaded', function (event) {

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

    $('.update-option').each(function (index, el) {
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
    var hsContainer = document.querySelector("#hidden-services-wrap");
    hsContainer.innerHTML = "";
    for (var i in hiddenServices) {
        var hsWrap = document.createElement("div");
        var num = document.createElement("div");
        var val = document.createElement("div");
        var del = document.createElement("div");
        hsWrap.classList.add("hidden-service");
        num.classList.add("hs-num");
        val.classList.add("hs-val");
        del.classList.add("hs-del");
        var enumer = parseInt(i) + 1;
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
    var hiddenServices = data.hiddenServices;
    updateHiddenServicesList(hiddenServices);
    var newHS = data.newHS;
    //SHOW new HS info in modal box if it was added
    if (newHS) {
        var privK = iCrypto.base64ToPEM(newHS.privateKey.substr(8));
        showModalNotification("Hidden service launched!", "Onion address: " + newHS.hsid + "\n\nPrivate key:\n" + privK);
    }
}

function processIslandHiddenServiceDeletion(data, response) {
    var hiddenServices = data.hiddenServices;
    updateHiddenServicesList(hiddenServices);
    toastr.info("Hidden service has been taken down");
}

function onionAddressFromPrivateKey(privateKey) {
    var ic = new iCrypto();
    ic.setRSAKey("privk", privateKey, "private").publicFromPrivate("privk", "pubk");
    var pkraw = forge.pki.publicKeyFromPem(ic.get("pubk"));
    var pkfp = forge.pki.getPublicKeyFingerprint(pkraw, { encoding: 'hex', md: forge.md.sha1.create() });
    if (pkfp.length % 2 !== 0) {
        s = '0' + s;
    }
    var bytes = [];
    for (var i = 0; i < pkfp.length / 2; i = i + 2) {
        bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
    }

    return base32.encode(bytes).toLowerCase() + ".onion";
}

function launchHiddenService() {
    var hsPrivK = document.querySelector("#island-service-private-key").value.trim();
    if (!adminSession) {
        toastr.warning("Login required. Please login to continue");
        return;
    }
    var privKey = adminSession.privateKey;
    var pkfp = adminSession.pkfp;
    var ic = new iCrypto();
    ic.createNonce('n').setRSAKey("pk", privKey, 'private').privateKeySign('n', 'pk', 'sign').bytesToHex('n', 'nhex');

    var onionAddress = void 0;
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
            err: function err(_err) {
                console.log("Error generating hidden service: " + _err);
            }
        });
    } catch (err) {
        throw "Error launching hidden service: " + err;
    }
}

//TODO finish method!
function deleteHiddenService(ev) {
    var onion = ev.target.previousSibling.innerHTML;

    var privKey = adminSession.privateKey;
    var pkfp = adminSession.pkfp;
    var ic = new iCrypto();
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
        err: function err(_err2) {
            console.log("Error deleting hidden service: " + _err2);
        }
    });
}

function adminLogin() {
    try {
        var privKey = document.querySelector('#admin-private-key').value;
        if (privKey == "") {
            toastr['warning']("You must provide admin's private key");
            return;
        }
        var ic = new iCrypto();
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
            success: function success(res) {
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
            error: function error(err) {
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
    var loggerState = res.loggerInfo.enabled === "true" || res.loggerInfo.enabled === true;
    var loggerLevel = res.loggerInfo.level;
    $("#logs-state").val(loggerState ? "true" : "false");
    $("#log-highest-level").val(loggerLevel);
}

function setupIslandAdmin() {
    loadingOn();
    $('#island-setup').addClass('btn-loading');
    setupAdminContinuation().then(function () {
        toastr.info("Setup successfull!!");
        switchView("admin");
    }).catch(function (err) {
        toastr.error(err);
    });
}

function setupAdminContinuation() {
    return new Promise(function (resolve, reject) {
        var ic = new iCrypto();
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
            success: function success() {
                loadingOff();
                adminSession = {
                    publicKey: ic.get('kp').publicKey,
                    privateKey: ic.get('kp').privateKey
                };
                var bodyWrapper = document.createElement("div");
                var pkWrapper = document.createElement("div");
                var tempWrap = document.createElement("div");
                pkWrapper.innerHTML = "<br><b>Your private key:</b> <br> <textarea class='key-display'>" + adminSession.privateKey + "</textarea>";
                bodyWrapper.appendChild(pkWrapper);
                tempWrap.appendChild(bodyWrapper);
                showModalNotification("Success! Save your private key", tempWrap.innerHTML);
                $('#island-setup').removeClass('btn-loading');
                resolve();
            },
            error: function error(err) {
                loadingOff();
                reject("Fail!" + err);
                $('#island-setup').removeClass('btn-loading');
            }
        });
    });
}

function switchView(view) {
    var views = {
        admin: function admin() {
            $('#admin-login--wrapper').css('display', "flex");
            $('#setup--wrapper').hide();
        }
    };
    views[view]();
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
    var file = document.querySelector("#update-file").files[0];
    getUpdateFileData(file).then(function (filedata) {
        var signature = signUpdateFile(filedata);
        document.querySelector("#pkfp").value = adminSession.pkfp;
        document.querySelector("#sign").value = signature;
        document.querySelector("#select-file").innerText = "SELECTED: " + file.name;
    }).catch(function (err) {
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
    var file = document.querySelector("#update-file").files[0];
    getUpdateFileData(file).then(function (filedata) {
        var signature = signUpdateFile(filedata);
        sendUpdateFromFileRequest(file, signature);
    }).catch(function (err) {
        throw err;
    });
}

function getUpdateFileData(file) {
    return new Promise(function (resolve, reject) {
        try {
            var reader = new FileReader();

            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            reject(err);
        }
    });
}

function signUpdateFile(filedata) {
    var ic = new iCrypto();
    ic.setRSAKey("pk", adminSession.privateKey, "private").addBlob("f", filedata).privateKeySign("f", "pk", "sign");
    return ic.get("sign");
}

function getSelectedUpdateBranch() {
    var branchSelect = document.querySelector("#gh-update-branch-select");
    return branchSelect.options[branchSelect.options.selectedIndex].value;
}

function updateFromGithub() {
    var ic = new iCrypto();

    ic.setRSAKey("pk", adminSession.privateKey, "private").createNonce("n").bytesToHex("n", "nhex").privateKeySign("n", "pk", "sign");
    var data = new FormData();
    data.append("action", "update_from_github");
    data.append("branch", getSelectedUpdateBranch());
    data.append("pkfp", adminSession.pkfp);
    data.append("nonce", ic.get("nhex"));
    data.append("sign", ic.get("sign"));
    sendUpdateRequest(data);
}

function sendUpdateFromFileRequest(filedata, signature) {
    var data = new FormData();
    data.append("action", "update_from_file");
    data.append("pkfp", adminSession.pkfp);
    data.append("file", document.querySelector("#update-file").files[0]);
    data.append("sign", signature);

    sendUpdateRequest(data);
}

function sendUpdateRequest(data) {
    var request = new XMLHttpRequest();
    request.open("POST", window.location.href, true);
    request.send(data);
    request.onreadystatechange = function () {
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
    setTimeout(function () {
        delayedPageReload(seconds);
    }, 1000);
}
function loadingOnPromise() {
    return new Promise(function (resolve, reject) {
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

    $(".update-option").each(function (index, el) {
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
    document.querySelector("#island-admin-main-menu").childNodes.forEach(function (node) {
        node.addEventListener("click", processMainMenuClick);
    });
}

function processMainMenuClick(ev) {
    if (ev.target.classList.contains("active")) {
        return;
    }
    var menu = document.querySelector("#island-admin-main-menu");
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = menu.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            item.classList.remove("active");
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

    ;

    var pages = document.querySelector("#admin-pages");
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = pages.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _item = _step2.value;

            _item.classList.remove("active");
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

    ;

    var index = getElementIndex(ev.target);

    pages.children[index].classList.add("active");
    menu.children[index].classList.add("active");
    document.querySelector("#admin-section-heading").innerHTML = ev.target.innerHTML;
}

function clearAdminPrivateKey() {
    $("#admin-private-key").val("");
}

function getElementIndex(node) {
    var index = 0;
    while (node = node.previousElementSibling) {
        index++;
    }
    return index;
}

function loadLogs() {
    var errorsOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var privKey = adminSession.privateKey;
    var pkfp = adminSession.pkfp;
    var ic = new iCrypto();
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
        err: function err(_err3) {
            toastr.warning("Error loading logs: " + _err3);
        }
    });
}

function processLogsLoaded(res) {
    var records = res.records.split("\n");
    var table = document.querySelector("#log-content").lastElementChild;
    table.innerHTML = "";
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = records[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var record = _step3.value;

            var parsed = void 0;
            try {
                parsed = JSON.parse(record);
            } catch (err) {
                continue;
            }

            var row = document.createElement("tr");
            row.classList.add(parsed.level);
            var ts = document.createElement("td");
            var level = document.createElement("td");
            var msg = document.createElement("td");
            ts.classList.add("log-timestamp");
            level.classList.add("log-level");
            msg.classList.add("log-msg");
            ts.innerHTML = parsed.timestamp;
            level.innerHTML = parsed.level;
            msg.innerHTML = parsed.message;
            row.append(ts);
            row.append(level);
            row.append(msg);
            var additionalValues = new CuteSet(Object.keys(parsed)).minus(["level", "message", "timestamp"]);
            if (additionalValues.length() > 0) {
                var addCell = document.createElement("td");
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = additionalValues[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var key = _step4.value;

                        var wrap = document.createElement("div");
                        wrap.classList.add("log-add-value");
                        var k = document.createElement("div");
                        var b = document.createElement("b");
                        k.classList.add("log-key");
                        var v = document.createElement("div");
                        v.classList.add("log-val");
                        b.innerHTML = key;
                        k.appendChild(b);
                        v.innerHTML = parsed[key];
                        wrap.appendChild(k);
                        wrap.appendChild(v);
                        addCell.appendChild(wrap);
                        row.appendChild(addCell);
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
            }
            table.appendChild(row);
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

    toastr.info("Logs loaded successfully");
}

function requestLoggerStateChange(ev) {
    var selectedElement = ev.target.options[ev.target.selectedIndex];
    var privKey = adminSession.privateKey;
    var pkfp = adminSession.pkfp;
    var ic = new iCrypto();
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
        success: function success() {
            var message = "Logger has been successfully " + (selectedElement.value === "true" ? "enabled" : "disabled");
            toastr.info(message);
        },
        err: function err(_err4) {
            toastr.warning("Error loading logs: " + _err4);
        }
    });
}

function requestLoggerLevelChange(ev) {
    var selectedElement = ev.target.options[ev.target.selectedIndex];
    var privKey = adminSession.privateKey;
    var pkfp = adminSession.pkfp;
    var ic = new iCrypto();
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
        success: function success() {
            toastr.info("Log level has been changed to: " + selectedElement.value);
        },
        err: function err(_err5) {
            toastr.warning("Error loading logs: " + _err5);
        }
    });
}

function prepareLogPageListeners() {
    document.querySelector("#load-logs").addEventListener("click", function () {
        loadLogs();
    });

    document.querySelector("#load-error-logs").addEventListener("click", function () {
        loadLogs(true);
    });

    document.querySelector("#logs-state").addEventListener("change", requestLoggerStateChange);
    document.querySelector("#log-highest-level").addEventListener("change", requestLoggerLevelChange);
}

function reverseLogList() {

    for (var i = 0; i < logTableBody.childNodes.length; i++) {
        logTableBody.insertBefore(logTableBody.childNodes[i], logTableBody.firstChild);
    }
}

function filterLogs(ev) {
    var filter = void 0;
    try {
        filter = new RegExp(ev.target.value);
        if (!filter || filter.length === 0) {
            return;
        }
    } catch (err) {
        return;
    }

    for (var i = 0; i < logTableBody.childNodes.length; i++) {

        var selectedField = parseInt(filterFieldSelector.options[filterFieldSelector.selectedIndex].value);
        var row = logTableBody.childNodes[i];
        var testingField = void 0;
        if (!isNaN(selectedField)) {
            testingField = row.children[selectedField] ? row.children[selectedField].innerHTML : "";
        } else {
            testingField = row.innerHTML;
        }
        filter.test(testingField) ? logTableBody.childNodes[i].classList.remove("log-row-hidden") : logTableBody.childNodes[i].classList.add("log-row-hidden");
    }
}

function clearLogs(ev) {
    var privKey = adminSession.privateKey;
    var pkfp = adminSession.pkfp;
    var ic = new iCrypto();
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
        success: function success() {
            logTableBody.innerHTML = "";
            toastr.info("Log level have been cleared");
        },
        err: function err(_err6) {
            toastr.warning("Error clearing logs: " + _err6);
        }
    });
}