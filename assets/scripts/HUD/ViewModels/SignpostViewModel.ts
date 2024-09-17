import { Subject } from "rxjs";
import { HeroData } from "../../GameData";
import { HUDManager } from "../HUDManager";

export class OnSummonedHeroesUpdatedArgs{
    enableSignpost:boolean;
    summonedHeroesCount:number;

    constructor(enableSignpost:boolean, summonedHeroesCount:number){
        this.enableSignpost = enableSignpost;
        this.summonedHeroesCount = summonedHeroesCount;
    }
}

export class SignpostViewModel {

    private _onSummonedHeroesUpdated: Subject<OnSummonedHeroesUpdatedArgs> = new Subject<OnSummonedHeroesUpdatedArgs>();
    public get onSummonedHeroesUpdated$(){
        return this._onSummonedHeroesUpdated.asObservable();
    }

    constructor(){

    }

    public handleSummonedHeroes(summonedHeroes:HeroData[]){
        const enableSignpost = summonedHeroes.length > 0;
        const onSummonedHeroesUpdateArgs = new OnSummonedHeroesUpdatedArgs(enableSignpost, summonedHeroes.length);
        this._onSummonedHeroesUpdated.next(onSummonedHeroesUpdateArgs);
    }

    public canSetButtonInteractable():boolean{
        if(HUDManager.Instance){
            return !HUDManager.Instance.isHallOfHeroesPanelOpen();
        }
        return false;
    }
}


