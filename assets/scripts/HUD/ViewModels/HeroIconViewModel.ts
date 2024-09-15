import { Subject } from "rxjs";
import { GameSettingsManager } from "../../GameSettingsManager";
import { HUDManager } from "../HUDManager";
import { SpriteFrame } from "cc";

export class HeroIconViewModel{

    private _iconSettings: Subject<HeroIconSettings> = new Subject<HeroIconSettings>();
    public get iconSettings$(){
        return this._iconSettings.asObservable();
    }

    constructor(){

    }

    public setUpIcon(heroId:string){
        const hudManager = HUDManager.Instance;
        if(!hudManager){
            return;
        }
        
        const heroIcon = hudManager.getHeroIconSpriteFrame(heroId);
        if(heroIcon){
            let newIconSettings = new HeroIconSettings(heroIcon);
            this._iconSettings.next(newIconSettings);
        }
    }
}

export class HeroIconSettings{
    heroSpriteFrame: SpriteFrame | null = null;

    constructor(heroSprite: SpriteFrame){
        this.heroSpriteFrame = heroSprite;
    }
}


