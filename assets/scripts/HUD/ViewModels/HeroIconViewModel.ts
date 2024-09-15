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

    public setUpIcon(heroId:string, rankId:string, elementId: string){
        const hudManager = HUDManager.Instance;
        if(!hudManager){
            return;
        }
        
        const heroIcon = hudManager.getHeroIconSpriteFrame(heroId);
        const rankIcon = hudManager.getRankSpriteFrame(rankId);
        const elementIcon = hudManager.getElementSpriteFrame(elementId);
        if(heroIcon && rankIcon && elementIcon){
            let newIconSettings = new HeroIconSettings(heroIcon, rankIcon, elementIcon);
            this._iconSettings.next(newIconSettings);
        }
    }
}

export class HeroIconSettings{
    heroSpriteFrame: SpriteFrame | null = null;
    rankSpriteFrame: SpriteFrame | null = null;
    elementSpriteFrame: SpriteFrame | null = null;

    constructor(heroSprite: SpriteFrame, rankSprite: SpriteFrame, elementSprite: SpriteFrame){
        this.heroSpriteFrame = heroSprite;
        this.rankSpriteFrame = rankSprite;
        this.elementSpriteFrame = elementSprite;
    }
}


