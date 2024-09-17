import { Subject } from "rxjs";
import { HeroData } from "../../GameData";

export class HeroHallSlotViewModel{

    private _onHeroHallSlotUpdated: Subject<HeroData> = new Subject<HeroData>();
    public get onHeroHallSlotUpdated$(){
        return this._onHeroHallSlotUpdated.asObservable();
    }

    constructor(){

    }

    public setHeroHallSlotDataValues(heroSlotData:HeroData){
        this._onHeroHallSlotUpdated.next(heroSlotData);
    }

}


