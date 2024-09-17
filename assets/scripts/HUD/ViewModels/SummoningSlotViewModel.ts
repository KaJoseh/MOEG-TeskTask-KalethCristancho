import { SpriteFrame } from "cc";
import { HeroData } from "../../GameData";
import { BehaviorSubject, Subject } from "rxjs";

export class SummoningSlotViewModel{
    
    private _onSlotHeroDataSet: Subject<HeroData> = new Subject<HeroData>();
    public get onSlotHeroDataSet$(){
        return this._onSlotHeroDataSet.asObservable();
    }
    private _onProgressChanged: Subject<number> = new Subject<number>();
    public get onProgressChanged$(){
        return this._onProgressChanged.asObservable();
    }
    private _displaySlotValues: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public get displaySlotValues$(){
        return this._displaySlotValues.asObservable();
    }
    
    constructor(){

    }

    public updateSlot(slotHeroData:HeroData | null, progressNormalized?:number){
        this._displaySlotValues.next(slotHeroData !== null);
        if(slotHeroData){
            this._onSlotHeroDataSet.next(slotHeroData);
        }
        if(progressNormalized){
           this._onProgressChanged.next(progressNormalized);
        }
    }
}
