import { VaultEvents } from "./Vault"


export class SoundPlayer{
    constructor(bus, sounds, isActive = true){
        this.bus = bus;
        this.sounds = sounds;

        this.active = isActive

        this.bus.on(VaultEvents.VAULT_SETTINGS_UPDATED, settings=>{
            this.active = !!settings.sound
        })

    }

    play(sound){
        if(this.active && sound in this.sounds){
            this.sounds[sound].play();
        }
    }

    setActive(isActive){
        this.active = !!isActive;
    }
}
