import { BehaviorSubject, Subject } from "rxjs";
import { HeroData } from "../../GameData";

export class HallOfHeroesPanelViewModel{

    private _onElementsContainerToggled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public get onElementsContainerToggled$(){
        return this._onElementsContainerToggled.asObservable();
    }

    private _heroesSlotsInHallArray:HeroData[] = [];
    public get heroesSlotInHallArray(){
        return this._heroesSlotsInHallArray;
    }

    constructor(){

    }

    public updateHallOfHeroesData(summonedHeroes:HeroData[]){
        this._heroesSlotsInHallArray = summonedHeroes;
    }

    public toggleElementsContainer(value:boolean){
        this._onElementsContainerToggled.next(value);
    }

}


