import { Color, Vec2 } from "cc";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import { HUDClicksManager } from "../HUDClicksManager";
import { HUDManager } from "../HUDManager";
import { HeroIconViewModel } from "./HeroIconViewModel";
import { BuildingData, HeroData } from "../../GameData";
import { SummoningSlotViewModel } from "./SummoningSlotViewModel";
import { OnTowerSummoningHeroArgs } from "../../TowerBuilding";
import { EconomyManager } from "../../EconomyManager";

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

export class HireButtonPriceValueUpdateArgs{
    newValue:number;
    color:Color;

    constructor(newValue:number, color:Color){
        this.newValue = newValue;
        this.color = color;
    }
}

export class BuildingPanelViewModel{

    public togglePanelVisible$: Subject<boolean> = new Subject<boolean>();
    private _heroIconListToCreate: Subject<HeroIconListToCreateArgs> = new Subject<HeroIconListToCreateArgs>();
    public get heroIconListToCreate$(){
        return this._heroIconListToCreate.asObservable();
    }
    private _hireButtonPriceValueUpdate:Subject<HireButtonPriceValueUpdateArgs> = new Subject<HireButtonPriceValueUpdateArgs>();
    public get hireButtonPriceValueUpdate$(){
        return this._hireButtonPriceValueUpdate.asObservable();
    }
    private _onPanelSettingsSet: BehaviorSubject<OnPanelSettingsSetArgs> = new BehaviorSubject<OnPanelSettingsSetArgs>(new OnPanelSettingsSetArgs("", "", 0));
    public get onPanelSettingsSet$(){
        return this._onPanelSettingsSet.asObservable();
    }
    private _enableHireButton: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public get enableHireButton$(){
        return this._enableHireButton.asObservable();
    }

    private _isPanelVisible:boolean = false;
    public get isPanelVisible(){
        return this._isPanelVisible;
    }
    private _isAnyHeroIconSelected = false;
    public get isAnyHeroIconSelected(){
        return this._isAnyHeroIconSelected;
    }

    private _summoningSlotViewModelArray:SummoningSlotViewModel [] = [];
    private _heroIconViewModelArray:HeroIconViewModel[] = [];
    private _selectedHeroIconViewModel:HeroIconViewModel | null = null;
    private _currentOnHireCallback:(hiredHero:HeroData) => void = (hiredHero:HeroData) => void {};
    
    private _currentTowerSummonQueueCount = 0;
    private _canHire:boolean = true;    

    private _towerQueueSubscription:Subscription = new Subscription;

    constructor(){
        HUDClicksManager.Instance?.onHUDClicked$.subscribe((clickPosition: Vec2) => {
            this.onHUDClickedCallback(clickPosition);
        });
    }

    public setupPanel(buildingData: BuildingData, towerQueue$:Observable<OnTowerSummoningHeroArgs>, onHireCallback:(hiredHero:HeroData) => void){
        this.togglePanel(!this._isPanelVisible)
        if(this._isPanelVisible){
            this._selectedHeroIconViewModel = null;
            this._summoningSlotViewModelArray = [];
            this._heroIconViewModelArray = [];
            this._enableHireButton.next(false);
            this._currentTowerSummonQueueCount = 0; 

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
            
            if(this._towerQueueSubscription){
                this._towerQueueSubscription.unsubscribe();
            }
            this._towerQueueSubscription = towerQueue$.subscribe( (onTowerSummoningHeroArgs:OnTowerSummoningHeroArgs)=>{
                this.SetSummoningSlotsDataValues(onTowerSummoningHeroArgs);
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
        this._isAnyHeroIconSelected = selectedIcon !== null;
        this._selectedHeroIconViewModel = selectedIcon;
        this._heroIconViewModelArray.forEach(heroIcon => {
            const displayIconSelectedFrame = heroIcon === this._selectedHeroIconViewModel;
            heroIcon.toggleSelected(displayIconSelectedFrame);
        });
        this.checkCanEnableHireButton();
    }

    public setCurrentHeroIconViewModelArray(heroIconViewModelArray: HeroIconViewModel[]){
        this._heroIconViewModelArray = heroIconViewModelArray;
    }

    public setCurrentSummoningSlotViewModelArray(summoningSlotViewModelArray: SummoningSlotViewModel[]){
        this._summoningSlotViewModelArray = summoningSlotViewModelArray;
    }

    public hireSelectedHero(){
        const selectedIconHeroData = this._selectedHeroIconViewModel?.iconHeroData;
        if(!selectedIconHeroData || !this.checkCanEnableHireButton()){
            return;
        }
        
        EconomyManager.Instance?.substractAmountFromMoney(-selectedIconHeroData.cost);
        this._currentOnHireCallback(selectedIconHeroData);
        this.checkCanEnableHireButton();
    }

    //Called while target tower is summoning heroes
    private SetSummoningSlotsDataValues(onTowerSummoningHeroArgs:OnTowerSummoningHeroArgs){
        const summoningSlotMax = this._summoningSlotViewModelArray.length;
        const towerSummoningQueue = onTowerSummoningHeroArgs.incomingHeroesDataQueue;
        this._currentTowerSummonQueueCount = towerSummoningQueue.length;
        this._canHire = this._currentTowerSummonQueueCount < summoningSlotMax;
        this.checkCanEnableHireButton();
        
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

    private checkCanEnableHireButton(): boolean{
        const selectedIconHeroData = this._selectedHeroIconViewModel?.iconHeroData;
        if(!selectedIconHeroData){
            return false;
        }

        const economyManager = EconomyManager.Instance;
        if(economyManager){
            this._canHire = this._currentTowerSummonQueueCount < this._summoningSlotViewModelArray.length;   
            const hireButtonEnabledValue = this._canHire && selectedIconHeroData.cost <= economyManager.currentMoney;
            this._enableHireButton.next(hireButtonEnabledValue);

            const hireButtonPriceLabelColor = hireButtonEnabledValue ? Color.GREEN : Color.RED;
            const newHireButtonPriceUpdateArgs = new HireButtonPriceValueUpdateArgs(selectedIconHeroData.cost, hireButtonPriceLabelColor);
            this._hireButtonPriceValueUpdate.next(newHireButtonPriceUpdateArgs);
            return hireButtonEnabledValue;
        }
        return false;
    }

    public togglePanel(toggleValue:boolean){
        this._isPanelVisible = toggleValue;
        this.togglePanelVisible$.next(this._isPanelVisible);
    }
}