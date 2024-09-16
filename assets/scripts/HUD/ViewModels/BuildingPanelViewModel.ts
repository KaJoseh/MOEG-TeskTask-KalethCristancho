import { Sprite, Vec2 } from "cc";
import { BehaviorSubject, Subject } from "rxjs";
import { TowerBuilding } from "../../TowerBuilding";
import { HUDClicksManager } from "../HUDClicksManager";
import { HUDManager } from "../HUDManager";
import { BuildingData, HeroData } from "../../GameSettingsManager";
import { HeroIconViewModel } from "./HeroIconViewModel";

export class BuildingPanelViewModel{

    public togglePanelVisible$: Subject<boolean> = new Subject<boolean>();
    private _heroIconListToCreate: Subject<HeroIconParams[]> = new Subject<HeroIconParams[]>();
    public get heroIconListToCreate$(){
        return this._heroIconListToCreate.asObservable();
    }
    private _panelSettings: BehaviorSubject<PanelSettings> = new BehaviorSubject<PanelSettings>(new PanelSettings("", "", 0));
    public get panelSettings$(){
        return this._panelSettings.asObservable();
    }
    private _enableHireButton: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public get enableHireButton$(){
        return this._enableHireButton.asObservable();
    }
    private _hireButtonPriceValue:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    public get hireButtonPriceValue$(){
        return this._hireButtonPriceValue.asObservable();
    }

    private _selectedHeroIconViewModel:HeroIconViewModel | null = null;
    private _currentHeroIconViewModelArray:HeroIconViewModel[] = [];
    
    private _isPanelVisible:boolean = false;

    constructor(){
        TowerBuilding.onAnyTowerBuildingClicked$.subscribe((buildingData: BuildingData) => {
            this.onAnyTowerBuildingClickedCallback(buildingData);
        });

        HUDClicksManager.Instance?.onHUDClicked$.subscribe((clickPosition: Vec2) => {
            this.onHUDClickedCallback(clickPosition);
        });
    }

    private onAnyTowerBuildingClickedCallback(buildingData: BuildingData){
        this.togglePanel(!this._isPanelVisible)
        if(this._isPanelVisible){
            this._selectedHeroIconViewModel = null;
            this._currentHeroIconViewModelArray = [];
            this._enableHireButton.next(false);

            const newPanelSettings = new PanelSettings(
                buildingData.name,
                buildingData.description, 
                buildingData.settings.hireSlots, 
            );
            this._panelSettings.next(newPanelSettings);

            let newHeroIconParams: HeroIconParams[] = [];
            buildingData.settings.summonableHeroes.forEach(hero =>{
                newHeroIconParams.push(new HeroIconParams(hero.id, hero.rank, hero.type, hero.cost));
            });
            this._heroIconListToCreate.next(newHeroIconParams);
        }
    }

    private onHUDClickedCallback(clickPosition:Vec2){
        const isPositionOverBuildingPanel = HUDManager.Instance?.isPositionOverBuildingPanelContainer(clickPosition);
        
        // console.log("x@ PositionOverPanel = " + isPositionOverBuildingPanel);
        if(!isPositionOverBuildingPanel){
            this.togglePanel(false);
            return;
        }
    }

    public selectHeroIcon(selectedIcon:HeroIconViewModel){
        this._selectedHeroIconViewModel = selectedIcon;
        this._currentHeroIconViewModelArray.forEach(heroIcon => {
            const displayIconSelectedFrame = heroIcon === this._selectedHeroIconViewModel;
            heroIcon.toggleSelected(displayIconSelectedFrame);
        });

        this._hireButtonPriceValue.next(selectedIcon.heroCost);
        this._enableHireButton.next(true);
    }

    public setCurrentHeroIconViewModelArray(heroIconViewModelArray: HeroIconViewModel[]){
        this._currentHeroIconViewModelArray = heroIconViewModelArray;
    }

    private togglePanel(toggleValue:boolean){
        this._isPanelVisible = toggleValue;
        this.togglePanelVisible$.next(this._isPanelVisible);
    }
}

export class PanelSettings{
    name:string;
    description:string;
    hireSlots:number;

    constructor(name:string, description:string, hireSlots:number){
        this.name = name;
        this.description = description;
        this.hireSlots = hireSlots;
    }
}

export class HeroIconParams{
    heroId:string;
    rankId:string;
    elementId:string;
    cost:number;

    constructor(heroId:string, rankId:string, elementId:string, cost:number){
        this.heroId = heroId;
        this.rankId = rankId;
        this.elementId = elementId;
        this.cost = cost;
    }
}
