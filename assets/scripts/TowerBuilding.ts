import { _decorator, CCString, Component, EventMouse, EventTouch, Input, Node } from 'cc';
import { Observable, Subject } from 'rxjs';
import { GameSettingsManager } from './GameSettingsManager';
import { IHasProgress } from './IHasProgress';
import { BuildingData, HeroData } from './GameData';
const { ccclass, property } = _decorator;

enum State{
    Idle,
    Summoning,
}

export class onAnyTowerBuildingClickedArgs{
    buildingData:BuildingData;
    onHeroHiredCallback:(hiredHero:HeroData) => void;
    towerSummonQueueObservable$: Observable<OnTowerSummoningHeroArgs>;

    constructor(buildingData:BuildingData, towerSummonQueueObservable$:Observable<OnTowerSummoningHeroArgs>, onHeroHiredCallback:(hiredHero:any) => void){
        this.buildingData = buildingData;
        this.towerSummonQueueObservable$ = towerSummonQueueObservable$;
        this.onHeroHiredCallback = onHeroHiredCallback;
    }
}

export class OnTowerSummoningHeroArgs{
    incomingHeroesDataQueue:HeroData[];
    summonProgressNormalized:number;

    constructor(incomingHeroesDataQueue:HeroData[], summonProgressNormalized:number){
        this.incomingHeroesDataQueue = incomingHeroesDataQueue;
        this.summonProgressNormalized = summonProgressNormalized;
    }
}

@ccclass('TowerBuilding')
export class TowerBuilding extends Component {
    
    public static onAnyTowerBuildingClicked$: Subject<onAnyTowerBuildingClickedArgs> = new Subject<onAnyTowerBuildingClickedArgs>();
    private _onTowerSummoningHero: Subject<OnTowerSummoningHeroArgs> = new Subject<OnTowerSummoningHeroArgs>();
    public get onTowerSummoningHero$(){
        return this._onTowerSummoningHero.asObservable();
    }

    /*
        - Tower has list of summoningHeroes DONE
        - Pass list of summoning heroes with current cooldown to HUDManager when summoning via event
        - HUDManager subscribes to said event
        - HudManager calls "HandleSummonSlotsData" from buildingPanelViewModel in said subscription
        - Viewmodel gets list of every heroData being summoned with its remainingCooldown
        - In viewmodel, do a for(i = hireslotsNumber) and check if i is not null in list of heroData being summoned
        - if it's not null, enable elements container and assign the values of said hero data
        - if it's null, disable elementsContainer
    */

    @property(CCString)
    private buildingId: string = "";
    @property(Node)
    private towerSpriteNode:Node | null = null;
    
    private _buildingData:BuildingData | undefined;
    private _towerState:State = State.Idle;
    private _summoningHeroesArray: HeroData[] = [];
    private _currentCooldownValueMax:number = 0;
    private _currentCooldownValue:number = 0;

    protected onLoad(): void {
        this.towerSpriteNode?.on(Input.EventType.TOUCH_START, this.onTowerSpriteTouchStart, this);
    }

    protected onDestroy(): void {
        this.towerSpriteNode?.off(Input.EventType.TOUCH_START, this.onTowerSpriteTouchStart, this);
    }

    protected async start(): Promise<void> {
        const buildingData = await GameSettingsManager.Instance?.getBuildingDataById(this.buildingId);
        if(buildingData === undefined){
            return;
        }

        //Add every hero as summonable
        const heroData = GameSettingsManager.Instance?.getHeroesData();
        if(heroData !== undefined){
            heroData.forEach(hero => {
                buildingData.settings.summonableHeroes.push(hero);
            });
        }

        this._buildingData = buildingData;
    }

    protected update(dt: number): void {

        switch(this._towerState){
            case State.Idle:
                break;

            case State.Summoning:
                this._currentCooldownValue -= dt;

                let normalizedCooldown = 1 - (this._currentCooldownValue / this._currentCooldownValueMax);
                this._onTowerSummoningHero.next(new OnTowerSummoningHeroArgs(
                    this._summoningHeroesArray, 
                    normalizedCooldown
                ));

                if(this._currentCooldownValue <= 0){
                    //Summoned
                    console.log("hero summoned!");
                    this._summoningHeroesArray.shift();
                    if(!this.hasPendingSummons()){
                        //Call _onTowerSummoningHero one last time to notify it has finished
                        this._onTowerSummoningHero.next(new OnTowerSummoningHeroArgs([], 0)); 
                        this._towerState = State.Idle;
                        break;
                    }

                    this.startNextSummon();
                }
                break;
        }
    }

    private onTowerSpriteTouchStart(event: EventTouch){
        if(this._buildingData !== undefined){
            TowerBuilding.onAnyTowerBuildingClicked$.next(new onAnyTowerBuildingClickedArgs(
                this._buildingData,
                this.onTowerSummoningHero$,
                this.onHeroHiredCallback.bind(this)
            ));
            console.log("TOWER CLICKED!");
        }
    }

    private hasPendingSummons(){
        return this._summoningHeroesArray.length > 0;
    }

    private onHeroHiredCallback(hiredHero:HeroData){
        console.log(`Tower received hired callback!!`);
        console.log(`Summoning ${hiredHero.name} | Cooldown: ${hiredHero.summonCooldown}`);
        this._summoningHeroesArray.push(hiredHero);
        if(this._towerState !== State.Summoning){
            this._towerState = State.Summoning;
            this.startNextSummon();
        }
    }

    private startNextSummon(){
        const currentSummonSlot = this._summoningHeroesArray[0];
        this._currentCooldownValueMax = this._currentCooldownValue = currentSummonSlot.summonCooldown;
    }
}