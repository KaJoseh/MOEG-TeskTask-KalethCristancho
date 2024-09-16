import { BehaviorSubject, Subject } from "rxjs";
import { GameSettingsManager } from "../../GameSettingsManager";
import { HUDManager } from "../HUDManager";
import { SpriteFrame } from "cc";

export class HeroIconViewModel{

    private _isSelected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public get isSelected$(){
        return this._isSelected;
    }
    private _iconSettings: Subject<HeroIconSettings> = new Subject<HeroIconSettings>();
    public get iconSettings$(){
        return this._iconSettings.asObservable();
    }

    private _heroCost:number = 0;
    public get heroCost(){
        return this._heroCost;
    }

    constructor(){

    }

    public setUpIcon(heroId:string, rankId:string, elementId: string, cost:number){
        const hudManager = HUDManager.Instance;
        if(!hudManager){
            return;
        }
        
        this._heroCost = cost;

        const heroIcon = hudManager.getHeroIconSpriteFrame(heroId);
        const rankIcon = hudManager.getRankSpriteFrame(rankId);
        const elementIcon = hudManager.getElementSpriteFrame(elementId);
        if(heroIcon && rankIcon && elementIcon){
            let newIconSettings = new HeroIconSettings(heroIcon, rankIcon, elementIcon);
            this._iconSettings.next(newIconSettings);
        }
    }

    public toggleSelected(selected:boolean){
        this.isSelected$.next(selected);
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


