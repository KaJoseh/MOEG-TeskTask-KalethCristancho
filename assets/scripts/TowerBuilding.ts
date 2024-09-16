import { _decorator, CCString, Component, EventMouse, EventTouch, Input, Node } from 'cc';
import { Subject } from 'rxjs';
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

    constructor(buildingData:BuildingData, onHeroHiredCallback:(hiredHero:any) => void){
        this.buildingData = buildingData;
        this.onHeroHiredCallback = onHeroHiredCallback;
    }
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
    private _summoningHeroesArray: HeroData[] = [];
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
                //TODO: Update current progress to HUDManager
                console.log(`currCooldown:${this._summoningHeroesArray.length} | Tower state: ${State[this._towerState]}`);
                if(this._currentCooldownValue <= 0){
                    //Summoned
                    console.log("hero summoned!");
                    this._summoningHeroesArray.shift();
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
        this._currentCooldownValue = currentSummonSlot.summonCooldown;
    }
}