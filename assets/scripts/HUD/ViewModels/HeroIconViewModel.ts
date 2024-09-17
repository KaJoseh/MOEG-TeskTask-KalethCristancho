import { BehaviorSubject, Subject } from "rxjs";
import { SpriteFrame } from "cc";
import { HeroData } from "../../GameData";
import { GameDataManager } from "../../GameDataManager";

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
        const gameDataManager = GameDataManager.Instance;
        if(!gameDataManager){
            return;
        }
        
        this._iconHeroData = iconHeroData;

        const heroIcon = gameDataManager.getHeroIconSpriteFrame(iconHeroData.id);
        const rankIcon = gameDataManager.getRankSpriteFrame(iconHeroData.rank);
        const elementIcon = gameDataManager.getElementSpriteFrame(iconHeroData.type);
        if(heroIcon && rankIcon && elementIcon){
            let newIconSettings = new OnIconSpritesSetArgs(heroIcon, rankIcon, elementIcon);
            this._onIconSpritesSet.next(newIconSettings);
        }
    }

    public toggleSelected(selected:boolean){
        this.isSelected$.next(selected);
    }
}
