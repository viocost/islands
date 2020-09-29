import { ConnectionState } from "../lib/Connector";
import * as util from "../lib/dom-util";
import { Internal } from "../../../../common/Events"


export class ConnectionIndicator{
    constructor(connector){
        this.connector = connector;
        this.indicator = util.$("#connection-indicator");
        this.label = util.$("#connection-indicator-label");
        this.reconnectButton = util.$("#reconnect-button");
        this.reconnectSpinner = util.$("#reconnect-spinner");
        this.indicatorClasses = ["unknown", "connected", "error", "dicsonnected", "connecting"];
        connector.on(Internal.CONNECTION_STATE_CHANGED, this._processConnectionStatusChange.bind(this))
        this._processConnectionStatusChange(connector.getConnectionState())
    }


    // ---------------------------------------------------------------------------------------------------------------------------
    // PRIVATE METHODS


    _processConnectionStatusChange(state){

        for (let c of this.indicatorClasses) {
            util.removeClass(this.indicator, c);
        }

        switch(state){
            case ConnectionState.DISCONNECTED:
                this._setDisconnected()
                break;

            case ConnectionState.CONNECTING:
                this._setConnecting()
                break;
            case ConnectionState.CONNECTED:
                this._setConnected()
                break;
            case ConnectionState.ERROR:
                this._setError()
                break;
            case ConnectionState.RECONNECTING:
                this._setConnecting()
                break;
        }
    }

    _setDisconnected(){
        this.label.innerText = "Disconnected"
        util.addClass(this.indicator, "dicsonnected");
        util.hide(this.reconnectButton)
        util.hide(this.reconnectSpinner)
    }

    _setConnecting(){
        this.label.innerText = "Connecting..."
        util.addClass(this.indicator, "connecting");
        util.hide(this.reconnectButton)
        util.flex(this.reconnectSpinner)
    }

    _setConnected(){
        this.label.innerText = "Connected"
        util.addClass(this.indicator, "connected");
        util.hide(this.reconnectButton)
        util.hide(this.reconnectSpinner)
    }

    _setError(){
        this.label.innerText = "Connection error"
        util.addClass(this.indicator, "error");
        util.hide(this.reconnectButton)
        util.hide(this.reconnectSpinner)
    }
}
