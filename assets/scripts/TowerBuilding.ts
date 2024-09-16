import { _decorator, CCString, Component, EventMouse, EventTouch, Input, Node } from 'cc';
import { Subject } from 'rxjs';
import { BuildingData, GameSettingsManager } from './GameSettingsManager';
import { IHasProgress } from './IHasProgress';
const { ccclass, property } = _decorator;

enum State{
    Idle,
    Summoning,
}

@ccclass('TowerBuilding')
export class TowerBuilding extends Component {
    
    public static onAnyTowerBuildingClicked$: Subject<onAnyTowerBuildingClickedArgs> = new Subject<onAnyTowerBuildingClickedArgs>();

    @property(CCString)
    private buildingId: string = "";
    @property(Node)
    private towerSpriteNode:Node | null = null;
    
    private _buildingData:BuildingData | undefined;
    private _towerState:State = State.Idle;
    private _summoningHeroSlotArray: SummoningHeroSlot[] = [];
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
                console.log(`currCooldown:${this._summoningHeroSlotArray.length} | Tower state: ${State[this._towerState]}`);
                if(this._currentCooldownValue <= 0){
                    //Summoned
                    console.log("hero summoned!");
                    this._summoningHeroSlotArray.shift();
                    if(!this.hasPendingSummons()){
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
                this.onHeroHiredCallback.bind(this)
            ));
            console.log("TOWER CLICKED!");
        }
    }

    private hasPendingSummons(){
        return this._summoningHeroSlotArray.length > 0;
    }

    private onHeroHiredCallback(hiredHero:any){
        const hiredHeroSlot = new SummoningHeroSlot("hero_1", 3);
        const hiredHeroSlot2 = new SummoningHeroSlot("hero_2", 5);
        this._summoningHeroSlotArray.push(hiredHeroSlot);
        this._summoningHeroSlotArray.push(hiredHeroSlot2);
        
        if(this._towerState !== State.Summoning){
            this._towerState = State.Summoning;
            this.startNextSummon();
        }
    }

    private startNextSummon(){
        const currentSummonSlot = this._summoningHeroSlotArray[0];
        this._currentCooldownValue = currentSummonSlot.heroSummonCooldown;
    }
}

export class onAnyTowerBuildingClickedArgs{
    buildingData:BuildingData;
    onHeroHiredCallback:(hiredHero:any) => void;

    constructor(buildingData:BuildingData, onHeroHiredCallback:(hiredHero:any) => void){
        this.buildingData = buildingData;
        this.onHeroHiredCallback = onHeroHiredCallback;
    }
}

export class SummoningHeroSlot{
    summoningHeroId:string;
    heroSummonCooldown:number;

    constructor(summoningHeroId:string, heroSummonCooldown:number){
        this.summoningHeroId = summoningHeroId;
        this.heroSummonCooldown = heroSummonCooldown;
    }
}


