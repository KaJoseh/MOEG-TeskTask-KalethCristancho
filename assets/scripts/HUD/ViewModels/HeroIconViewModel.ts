import { BehaviorSubject, Subject } from "rxjs";
import { HUDManager } from "../HUDManager";
import { SpriteFrame } from "cc";
import { HeroData } from "../../GameData";

export class OnIconSpritesSetArgs{
    heroSpriteFrame: SpriteFrame | null = null;
    rankSpriteFrame: SpriteFrame | null = null;
    elementSpriteFrame: SpriteFrame | null = null;

    constructor(heroSprite: SpriteFrame, rankSprite: SpriteFrame, elementSprite: SpriteFrame){
        this.heroSpriteFrame = heroSprite;
        this.rankSpriteFrame = rankSprite;
        this.elementSpriteFrame = elementSprite;
    }
}

export class HeroIconViewModel{

    private _isSelected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public get isSelected$(){
        return this._isSelected;
    }
    private _onIconSpritesSet: Subject<OnIconSpritesSetArgs> = new Subject<OnIconSpritesSetArgs>();
    public get onIconSpritesSet$(){
        return this._onIconSpritesSet.asObservable();
    }
    private _iconHeroData:HeroData | null = null;
    public get iconHeroData(){
        return this._iconHeroData;
    }

    constructor(){

    }

    public setUpIcon(iconHeroData:HeroData){
        const hudManager = HUDManager.Instance;
        if(!hudManager){
            return;
        }
        
        this._iconHeroData = iconHeroData;

        const heroIcon = hudManager.getHeroIconSpriteFrame(iconHeroData.id);
        const rankIcon = hudManager.getRankSpriteFrame(iconHeroData.rank);
        const elementIcon = hudManager.getElementSpriteFrame(iconHeroData.type);
        if(heroIcon && rankIcon && elementIcon){
            let newIconSettings = new OnIconSpritesSetArgs(heroIcon, rankIcon, elementIcon);
            this._onIconSpritesSet.next(newIconSettings);
        }
    }

    public toggleSelected(selected:boolean){
        this.isSelected$.next(selected);
    }
}
