import { _decorator, CCString, Component, EventMouse, EventTouch, Input, Node } from 'cc';
import { Subject } from 'rxjs';
import { BuildingData, GameSettingsManager } from './GameSettingsManager';
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
                break;
        }
        
        console.log(`Tower state: ${State[this._towerState]}`);
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

    private onHeroHiredCallback(hiredHero:any){
        this._towerState = State.Summoning;
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


