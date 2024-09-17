import { BehaviorSubject, Subject } from "rxjs";
import { HeroData } from "../../GameData";
import { HUDManager } from "../HUDManager";

export class HallOfHeroesPanelViewModel{

    private _onElementsContainerToggled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public get onElementsContainerToggled$(){
        return this._onElementsContainerToggled.asObservable();
    }

    private _isPanelVisible:boolean = false;
    public get isPanelVisible(){
        return this._isPanelVisible;
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
        this._isPanelVisible = value;
        this._onElementsContainerToggled.next(value);
    }

    public onClosePanelButtonClicked(){
        HUDManager.Instance?.toggleHallOfHeroesOpen(false);
    }
}


