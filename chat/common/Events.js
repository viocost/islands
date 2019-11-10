// ---------------------------------------------------------------------------------------------------------------------------
// Enumeration of every possible event that is passed to and from client and may occur in the Islands Chat system
// This enumeration does not hold server or client internal events.
//
//

module.exports.Events = Object.freeze({
    LOGIN_SUCCESS: "login_success",
    LOGIN_ERROR: "login_error",

    POST_LOGIN_SUCCESS: "post_login_success",
    POST_LOGIN_ERROR: "post_login_error",

    REGISTER_NEW_VAULT_SUCCESS: "new_vault_success",
    REGISTER_NEW_VAULT_ERROR: "new_vault_error",

    INIT_TOPIC_SUCCESS: "init_topic_success",
    INIT_TOPIC_ERROR: "init_topic_error",

    CHAT_ERROR: "chat_error",

    NEW_MEMBER_JOINED: "new_member_joined",

    TOPIC_SETTINGS_UPDATED: "settings_updated",

    INVITE_SYNC_OK: "invite_sync_ok",
    INVITE_SYNC_ERROR: "invite_sync_error",
    INVITE_CREATED: "invite_created",
    INVITE_REQUEST_ERROR: "invite_create_error",
    INVITE_UPDATED: "invite_updated",
    INVITE_UPDATE_ERROR: "invite_update_error",
    INVITE_DELETED: "invite_deleted",
    DELETE_INVITE_ERROR: "del_invite_error",


    MEMBER_BOOTED: "member_booted",
    MEMBER_BOOT_ERROR: "member_boot_error",
    YOU_BOOTED: "u_booted",

    NEW_CHAT_MESSAGE: "chat_message",
    SEND_OK: "message_sent",
    SEND_ERROR: "send_fail",
    MESSAGES_UPDATED: "messages_updated",


    NEW_SERVICE_RECORD: "new_service_record",

    //Connection
    CONNECTION_STATUS_CHANGED: "connection_status_changed",

    //Files
    FILE_AVAILABLE_LOCALLY: "file_available_locally",
    FILE_PEER_REQUEST: "file_peer_request",
    DOWNLOAD_OK: "download_ok",
})



// ---------------------------------------------------------------------------------------------------------------------------
// This defines internal events and commands that may ever occur in the Islands Chat system
// but not part of public API.
module.exports.Internal = Object.freeze({

    CONNECTION_ERROR: "conn_error",

    INIT_TOPIC_GET_TOKEN: "init_topic_get_token",
    INIT_TOPIC_TOKEN: "init_topic_token",
    INIT_TOPIC: "init_topic_finalize",

    //Sent by client to server after establishing the connection
    POST_LOGIN: "post_login",

    //Response sent by server to client.
    POST_LOGIN_DECRYPT: "post_login_decrypt_services",

    POST_LOGIN_CHECK_SERVICES: "post_login_check_services",

    REQUEST_INVITE: "request_invite",

    INIT_LOAD: "init_load",
    LOAD_MESSAGES: "load_messages",

    KILL_SESSION: "kill_session",


})
