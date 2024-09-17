import { Vec2 } from "cc";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import { HUDClicksManager } from "../HUDClicksManager";
import { HUDManager } from "../HUDManager";
import { HeroIconViewModel } from "./HeroIconViewModel";
import { BuildingData, HeroData } from "../../GameData";
import { SummoningSlotViewModel } from "./SummoningSlotViewModel";
import { OnTowerSummoningHeroArgs } from "../../TowerBuilding";

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

    private _summoningSlotViewModelArray:SummoningSlotViewModel [] = [];
    private _heroIconViewModelArray:HeroIconViewModel[] = [];
    private _selectedHeroIconViewModel:HeroIconViewModel | null = null;
    private _currentOnHireCallback:(hiredHero:HeroData) => void = (hiredHero:HeroData) => void {};
    
    private _isPanelVisible:boolean = false;

    private _towerQueueSubscription:Subscription = new Subscription;

    constructor(){
        HUDClicksManager.Instance?.onHUDClicked$.subscribe((clickPosition: Vec2) => {
            this.onHUDClickedCallback(clickPosition);
        });
    }

    public openPanel(buildingData: BuildingData, towerQueue$:Observable<OnTowerSummoningHeroArgs>, onHireCallback:(hiredHero:HeroData) => void){
        this.togglePanel(!this._isPanelVisible)
        if(this._isPanelVisible){
            this._selectedHeroIconViewModel = null;
            this._summoningSlotViewModelArray = [];
            this._heroIconViewModelArray = [];
            this._enableHireButton.next(false);
            this._towerQueueSubscription.unsubscribe();

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
            
            const towerQueueSubscription = towerQueue$.subscribe( (onTowerSummoningHeroArgs:OnTowerSummoningHeroArgs)=>{
                this.SetSummoningSlotsDataValues(onTowerSummoningHeroArgs);
            });
            this._towerQueueSubscription = towerQueueSubscription;
            
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
        this._heroIconViewModelArray.forEach(heroIcon => {
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
        this._heroIconViewModelArray = heroIconViewModelArray;
    }

    public setCurrentSummoningSlotViewModelArray(summoningSlotViewModelArray: SummoningSlotViewModel[]){
        console.log(`set summon slots length: ${summoningSlotViewModelArray.length}`);
        this._summoningSlotViewModelArray = summoningSlotViewModelArray;
    }

    public hireSelectedHero(){
        console.log("Firing hire callback!");
        const selectedIconHeroData = this._selectedHeroIconViewModel?.iconHeroData;
        if(selectedIconHeroData){
            this._currentOnHireCallback(selectedIconHeroData);
        }
    }

    private SetSummoningSlotsDataValues(onTowerSummoningHeroArgs:OnTowerSummoningHeroArgs){
        const summoningSlotMax = this._summoningSlotViewModelArray.length;
        const towerSummoningQueue = onTowerSummoningHeroArgs.incomingHeroesDataQueue;
        
        for (let i = 0; i < summoningSlotMax; i++) {
            let targetSummonSlotViewModel = this._summoningSlotViewModelArray[i];           
            if(i < towerSummoningQueue.length){
                if(i == 0){
                    const progressNormalized = onTowerSummoningHeroArgs.summonProgressNormalized;
                    targetSummonSlotViewModel.updateSlot(towerSummoningQueue[i], progressNormalized);
                    continue;
                }
                targetSummonSlotViewModel.updateSlot(towerSummoningQueue[i]);
                continue;
            }
            else{
                targetSummonSlotViewModel.updateSlot(null);
                continue;
            }
        }
    }

    private togglePanel(toggleValue:boolean){
        this._isPanelVisible = toggleValue;
        this.togglePanelVisible$.next(this._isPanelVisible);
    }


}