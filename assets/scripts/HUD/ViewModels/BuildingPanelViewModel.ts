import { Vec2 } from "cc";
import { BehaviorSubject, Subject } from "rxjs";
import { HUDClicksManager } from "../HUDClicksManager";
import { HUDManager } from "../HUDManager";
import { HeroIconViewModel } from "./HeroIconViewModel";
import { BuildingData, HeroData } from "../../GameData";

export class OnPanelSettingsSetArgs{
    buildingName:string;
    buildingDesc:string;
    buildingHireSlots:number;

    constructor(name:string, description:string, hireSlots:number){
        this.buildingName = name;
        this.buildingDesc = description;
        this.buildingHireSlots = hireSlots;
    }
}

export class HeroIconListToCreateArgs{
    heroIconsData:HeroData[];

    constructor(heroIconsData:HeroData[]){
        this.heroIconsData = heroIconsData;
    }
}

export class BuildingPanelViewModel{

    public togglePanelVisible$: Subject<boolean> = new Subject<boolean>();
    private _heroIconListToCreate: Subject<HeroIconListToCreateArgs> = new Subject<HeroIconListToCreateArgs>();
    public get heroIconListToCreate$(){
        return this._heroIconListToCreate.asObservable();
    }
    private _onPanelSettingsSet: BehaviorSubject<OnPanelSettingsSetArgs> = new BehaviorSubject<OnPanelSettingsSetArgs>(new OnPanelSettingsSetArgs("", "", 0));
    public get onPanelSettingsSet$(){
        return this._onPanelSettingsSet.asObservable();
    }
    private _enableHireButton: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public get enableHireButton$(){
        return this._enableHireButton.asObservable();
    }
    private _hireButtonPriceValue:BehaviorSubject<number> = new BehaviorSubject<number>(0);
    public get hireButtonPriceValue$(){
        return this._hireButtonPriceValue.asObservable();
    }

    private _currentOnHireCallback:(hiredHero:HeroData) => void = (hiredHero:HeroData) => void {};
    private _selectedHeroIconViewModel:HeroIconViewModel | null = null;
    private _currentHeroIconViewModelArray:HeroIconViewModel[] = [];
    
    private _isPanelVisible:boolean = false;

    constructor(){
        HUDClicksManager.Instance?.onHUDClicked$.subscribe((clickPosition: Vec2) => {
            this.onHUDClickedCallback(clickPosition);
        });
    }

    public openPanel(buildingData: BuildingData, onHireCallback:(hiredHero:HeroData) => void){
        this.togglePanel(!this._isPanelVisible)
        if(this._isPanelVisible){
            this._selectedHeroIconViewModel = null;
            this._currentHeroIconViewModelArray = [];
            this._enableHireButton.next(false);

            const newOnPanelSettingsSetArgs = new OnPanelSettingsSetArgs(
                buildingData.name,
                buildingData.description, 
                buildingData.settings.hireSlots, 
            );
            this._onPanelSettingsSet.next(newOnPanelSettingsSetArgs);

            let heroIconsToCreate: HeroData[] = [];
            buildingData.settings.summonableHeroes.forEach(hero =>{
                heroIconsToCreate.push(hero);
            });
            const newHeroIconListToCreateArgs = new HeroIconListToCreateArgs(heroIconsToCreate);
            this._heroIconListToCreate.next(newHeroIconListToCreateArgs);
            this._currentOnHireCallback = onHireCallback;
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

        const selectedIconHeroData = this._selectedHeroIconViewModel.iconHeroData;
        if(selectedIconHeroData){
            this._hireButtonPriceValue.next(selectedIconHeroData.cost);
            this._enableHireButton.next(true);
        }
    }

    public setCurrentHeroIconViewModelArray(heroIconViewModelArray: HeroIconViewModel[]){
        this._currentHeroIconViewModelArray = heroIconViewModelArray;
    }

    public hireSelectedHero(){
        console.log("Firing hire callback!");
        const selectedIconHeroData = this._selectedHeroIconViewModel?.iconHeroData;
        if(selectedIconHeroData){
            this._currentOnHireCallback(selectedIconHeroData);
        }
    }

    private togglePanel(toggleValue:boolean){
        this._isPanelVisible = toggleValue;
        this.togglePanelVisible$.next(this._isPanelVisible);
    }


}