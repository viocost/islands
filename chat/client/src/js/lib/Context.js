import * as domUtil from "../lib/dom-util";
import toastr from "../lib/toastr";
import * as Common from "../ui/Common"
import { StateMachine } from "../../../../common/AdvStateMachine"
import { AssetActivator } from "../ui/AssetActivator";
import * as Scroll from "../ui/Scroll"
import { TopicEvents } from "./Topic"

 /**
 * On side panel there are currently 3 types of objects that
 * can be selected and acted upon.
 * There is also a single set of buttons that act differently,
 * depending on what type of item is currently selected on the side panel.
 *
 * This module defines context and set of appropriate actions for
 * each type of objects.
 *
 *
 */

export class Context{
    selectedTopic;
    selectedInvite;
    selectedParticipant;

    constructor(bus, modals){
        this.bus = bus;
        this._topicSelectedSm = this.prepareTopicSelectedSM()
        this._sm = this.prepareMainStateMachine()
        this.subscribeToBusEvents(bus)
        this.modals = modals;
    }



    expandTopic(uxBus, uxTopics, pkfp){
        this._sm.handle.selectTopic(uxBus, uxTopics, pkfp);
        this._sm.handle.toggleExpand(uxBus, uxTopics, pkfp);

    }

    getSelectedTopic(){
        return this.selectedTopic;
    }

    invite(){
        this._sm.handle.invite();
    }

    alias(uxBus){

        console.log("Handling alias");
        //First checking if a participant or an invite is selected and processing alias on them
        if(this.selectedInvite || this.selectedParticipant){
            this._topicSelectedSm.handle.alias();
        } else { //Otherwise user intend to rename topic
            this._sm.handle.alias()

        }
    }

    boot(){
        if(confirm("Would you like to exclude selected participant from the topic?")){
            this._topicSelectedSm.handle.boot();
        }
    }

    participantExcluded(data){
        let { bootedPkfp } = data;
        //deleting from side panel
        let el = domUtil.$(`.participant-list-item[participantpkfp="${bootedPkfp}"]`)
        domUtil.remove(el);
        if(this.selectedParticipant && this.selectedParticipant.participantPkfp === bootedPkfp){
            this._topicSelectedSm.handle.deselect()
        }
    }

    delete(){
        console.log("Delete!");
        if(this.selectedInvite){
            this._topicSelectedSm.handle.delete();
        } else {
            this._sm.handle.delete();
        }
    }

    selectInvite(uxBus, uxTopics, data){

        let { pkfp } = data;

        if(pkfp !== this.selectedTopic){
            this._sm.handle.selectTopic(uxBus, uxTopics, pkfp)
        }
        //second argument specifies whether to copy or not the invite code
        this._topicSelectedSm.handle.inviteSelected(data, false)

    }

    doubleSelectInvite(args){
        console.log("Processing invite double click");

        if(this.selectedInvite){

            Common.copyInviteCodeToClipboard(this.selectedInvite.inviteCode)

        }
        //second argument specifies whether to copy or not the invite code
        //this._topicSelectedSm.handle.inviteSelected(data, true)
    }

    selectParticipant(uxBus, uxTopics, data){

        let { topicPkfp } = data;
        if(topicPkfp !== this.selectedTopic){
            this._sm.handle.selectTopic(uxBus, uxTopics, topicPkfp)
        }
        console.log("Selecting participant")
        this._topicSelectedSm.handle.participantSelected(data)

    }

    selectTopic(uxBus, uxTopics, pkfp){
        this._sm.handle.selectTopic(uxBus, uxTopics, pkfp)
        this._topicSelectedSm.handle.deselect();
    }


    topicDeleted(pkfp){
        if(this.selectedTopic === pkfp)
            this._sm.handle.currentTopicDeleted(pkfp)
        else {
            this._sm.handle.topicDeleted(pkfp)
        }
    }

    inviteDeleted(data){

        let { pkfp, userInvites } = data

        if(!(userInvites.has(this.selectedInvite.inviteCode)) && pkfp === this.selectedTopic){
            this._topicSelectedSm.handle.deselect()
        }

        let inviteEls = Array.from(domUtil.$$(".invite-list-item")).filter(el=>el.getAttribute("pkfp") === pkfp && !userInvites.has(el.getAttribute("code")))

        for(let el of inviteEls){
            domUtil.remove(el);
        }
    }

    //SM Handlers
    _selectInvite(args){
        console.log("Processing invite select");
        let {pkfp, inviteCode} = args[0];
        this.selectedInvite = { pkfp: pkfp, inviteCode: inviteCode }
        let activator = new AssetActivator({
            pkfp: pkfp,
            code: inviteCode
        })
        activator.activate();
        Common.displayTopicContextButtons("invite")

        //If second argument is true - copying invite to clipboard
        //if(args[1])
        //    Common.copyInviteCodeToClipboard(args[0])
    }


    //alias form preparation
    _aliasModalTopicMode(args){
        let topicName = this._getSelectedTopicName();

        let renameData = JSON.stringify({ topicPkfp: this.selectedTopic, type: "topic"})
        this._prepareAliasModal(`Rename topic ${topicName}`, `Topic id ${this.selectedTopic.substring(0, 8)}...`, "Enter new topic name", renameData)
        this.modals.alias.open()
    }

    _aliasModalParticipantMode(args){
        let participant = Array.from(domUtil.$$(".participant-list-item"))
                               .filter(el=>el.getAttribute("participantpkfp") === this.selectedParticipant.participantPkfp)[0]

        let topicName = this._getSelectedTopicName()
        let isMyTopic = this.selectedTopic === this.selectedParticipant.participantPkfp;
        let participantEl = domUtil.$(".participant-label", participant);
        let title = isMyTopic ? "Change my nickname:" : `Set alias for ${participantEl.innerText}`
        let topic = `Topic: ${topicName}(${this.selectedTopic.substring(0, 8)}...)`;
        let placeholder = isMyTopic ? "Enter new nickname" : "Enter new alias"
        let renameData = JSON.stringify({
            type: "participant",
            topicPkfp: this.selectedTopic,
            participantPkfp: this.selectedParticipant.participantPkfp
        })
        this._prepareAliasModal(title, topic, placeholder, renameData)
        this.modals.alias.open()
    }

    _aliasModalInviteMode(args){
        let title = `Set alias for invite ${this.selectedInvite.inviteCode.substring(128, 136)}...`
        let placeholder = "New alias"

        let renameData = JSON.stringify({
            type: "invite",
            topicPkfp: this.selectedTopic,
            inviteCode: this.selectedInvite.inviteCode
        })

        let topicName = this._getSelectedTopicName()
        let topic = `Topic: ${topicName}(${this.selectedTopic.substring(0, 8)}...)`;
        this._prepareAliasModal(title, topic, placeholder, renameData)
        this.modals.alias.open()
    }

    _getSelectedTopicName(){
        let topic = Array.from(domUtil.$$(".topic-list-item")).filter(el=>el.getAttribute("pkfp") === this.selectedTopic)[0]
        let topicName = domUtil.$(".topic-name", topic)
        return topicName.innerText
    }

    _prepareAliasModal(title, forLabel, aliasInput, data){
        let titleEl = domUtil.$("#modal-alias-title")
        let forLabelEl = domUtil.$("#modal-alias-for-label")
        let aliasInputEl = domUtil.$("#modal-alias-input")
        domUtil.text(titleEl,  title);
        domUtil.text(forLabelEl, forLabel);
        aliasInputEl.setAttribute("placeholder", aliasInput);
        aliasInputEl.setAttribute("rename-data", data)
    }



    _selectParticipant(args){
        console.log("Processing participant select");
        let { participantPkfp, topicPkfp } = args[0];
        this.selectedParticipant = { participantPkfp: participantPkfp, topicPkfp: topicPkfp}
        let activator = new AssetActivator({
            "topicpkfp": topicPkfp,
            "participantpkfp": participantPkfp
        })
        activator.activate();
        Common.displayTopicContextButtons("participant")
    }

    _deselectAssets(){
        this.selectedParticipant = undefined;
        this.selectedInvite = undefined;
        let activator = new AssetActivator()
        activator.deactivate()
        Common.displayTopicContextButtons("topic")
    }

    //args: uxBus, uxTopics, pkfp
    _selectTopic(args){

        this.selectedTopic = args[2]
        activateTopic(...args)
    }


    _toggleExpand(args){
        console.log("Expanding topic");
        activateTopic(...args)
        Common.toggleTopicExpand(args[2])
    }


    _bootParticipant(args){
        console.log("Booting participant");
        this.bus.emit(this.selectedTopic, {
            message: Common.UXMessage.BOOT_PARTICIPANT,
            pkfp: this.selectedParticipant.participantPkfp
        })

    }

    _participantAlias(args){

    }

    _invite(){
        console.log("Requesting invite");
        this.bus.emit(this.selectedTopic, {
            message: Common.UXMessage.INVITE_REQUEST
        })
    }

    _inviteAlias(){

    }

    _deleteInvite(){
        let { pkfp, inviteCode  }  = this.selectedInvite;
        this.selectedInvite = { pkfp: pkfp, inviteCode: inviteCode }
        if(confirm(`Delete invite ${inviteCode}`)){
            this.bus.emit(pkfp, {
                message: Common.UXMessage.DELETE_INVITE,
                inviteCode: inviteCode
            })
        } else {
            toastr.info("Invite deletion cancelled")
        }
    }


    _deleteTopic(){

        if(confirm("Delete current topic?")){
            this.bus.emit(Common.UXMessage.DELETE_TOPIC, this.selectedTopic)
        } else {
            toastr.info("Topic deletion cancelled")
        }

    }

    _topicDeleted(args){
        //delete side panel elements
        let pkfp = args[0]
        let topicElement = Array.from(domUtil.$$(".topic-list-item")).filter(el => el.getAttribute("pkfp") === pkfp)[0];
        let assets = Array.from(domUtil.$$(".topic-assets")).filter(el => el.getAttribute("pkfp") === pkfp)[0];

        let messagesWindow = Array.from(domUtil.$$(".messages-panel-container")).filter(el => el.getAttribute("pkfp") === pkfp)[0];
        domUtil.remove(topicElement)
        domUtil.remove(assets)
        domUtil.remove(messagesWindow)
        console.log(`All UX elements removed for topic ${pkfp} `);

    }

    prepareMainStateMachine(topicSelectedSM){
        return new StateMachine(this, {
            name: "UX Context State Machine",
            stateMap: {
                none: {
                    initial: true,
                    transitions: {
                        selectTopic: {
                            state: "topic",
                            actions: this._selectTopic.bind(this)
                        }

                    }
                },

                topic: {
                    transitions: {
                        selectTopic: {
                            actions: [this._selectTopic.bind(this), this._deselectAssets.bind(this)]
                        },

                        toggleExpand: {
                            actions: [ this._toggleExpand.bind(this), this._deselectAssets.bind(this) ]

                        },

                        delete: {
                            actions: this._deleteTopic.bind(this)
                        },

                        invite: {
                            actions: this._invite.bind(this)
                        },

                        topicDeleted: {
                            actions: this._topicDeleted.bind(this)
                        },

                        currentTopicDeleted: {
                            actions: this._topicDeleted.bind(this),
                            state: "none"
                        },
                        alias: {
                            actions: this._aliasModalTopicMode.bind(this)
                        }
                    } ,
                    substates: topicSelectedSM,
                    exit: Common.displayTopicContextButtons.bind(null, "none"),
                },

            }
        }, {msgNotExistMode: StateMachine.Warn})
    }

    subscribeToBusEvents(bus){
        bus.on(TopicEvents.INVITE_DELETED, this.inviteDeleted.bind(this))
        bus.on(TopicEvents.INVITE_CONSUMED, this.inviteDeleted.bind(this))
        bus.on(TopicEvents.PARTICIPANT_EXCLUDED, this.participantExcluded.bind(this))
    }

    prepareTopicSelectedSM(){
        return new StateMachine(this, {
            name: "Topic selected substate SM",
            stateMap: {
                none: {
                    initial: true,
                    transitions: {
                        inviteSelected: {
                            state: "invite",
                            actions: this._selectInvite.bind(this)
                        },

                        participantSelected: {
                            state: "participant",
                            actions: this._selectParticipant.bind(this)
                        },

                        deleteTopic: {
                            actions: this._deleteTopic.bind(this)
                        }

                    }
                },

                invite: {
                    transitions: {
                        participantSelected: {
                            state: "participant",
                            actions: this._selectParticipant.bind(this)
                        },

                        inviteSelected: {
                            actions: this._selectInvite.bind(this)

                        },

                        deselect: {
                            state: "none"
                        },

                        alias: {
                            actions: this._aliasModalInviteMode.bind(this)
                        },

                        delete: {
                            actions: this._deleteInvite.bind(this)
                        }


                    },
                    exit: this._deselectAssets.bind(this)

                },

                participant: {
                    transitions: {
                        inviteSelected: {
                            state: "invite",
                            actions: this._selectInvite.bind(this)
                        },

                        participantSelected: {
                            actions: this._selectParticipant.bind(this)
                        },

                        deselect: {
                            state: "none"
                        },

                        boot: {
                            actions: this._bootParticipant.bind(this)
                        },

                        alias: {
                            actions: this._aliasModalParticipantMode.bind(this)
                        }




                    },

                    exit: this._deselectAssets.bind(this)
                }

            },
            memory: false
        }, { msgNotExistMode: StateMachine.Discard })

    }



}


function activateTopic(uxBus, uxTopics, pkfp){
    console.log("Activating topic");
    Common.displayTopicContextButtons("topic")

    //setting active topic
//    topicInFocus = pkfp;

    //show topic messages panel
    for(let panel of Array.from(domUtil.$$(".messages-panel-container"))){
        if (panel.getAttribute("pkfp") === pkfp){
            //show
            domUtil.flex(panel)
            //and scroll down
            Scroll.scrollDown(panel)
        } else {
            domUtil.hide(panel)
        }
    }

    //mark active topic on the side panel
    for (let el of domUtil.$$(".topic-list-item")) {
        if (el.getAttribute("pkfp") === pkfp) {
            domUtil.addClass(el, "topic-in-focus");
        } else {
            domUtil.removeClass(el, "topic-in-focus");
        }
    }


    //make sure new message input block is visible
    Common.newMessageBlockSetVisible(true);


    //reset unread messages counter
    Common.resetUnreadCounter(pkfp, uxTopics);

    //If no messages have been appended, request messages
    if(!uxTopics[pkfp].isInitialized){
        //update messages
        //load messages
        uxBus.emit(pkfp, {
            howMany: Common.INITIAL_MESSAGES_LOAD,
            message: Common.UXMessage.GET_LAST_MESSAGES
        })
    }

}
