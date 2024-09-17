import { _decorator, Button, CCString, Component, Node, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { BuildingPanelView } from './Views/BuildingPanelView';
import { Observable, Subject, Subscription } from 'rxjs';
import { HUDClicksManager } from './HUDClicksManager';
import { onAnyTowerBuildingClickedArgs, OnTowerSummoningHeroArgs, TowerBuilding } from '../TowerBuilding';
import { BuildingData, HeroData } from '../GameData';
import { EconomyManager, OnMoneyUpdatedArgs } from '../EconomyManager';
import { CurrencyPanelView } from './Views/CurrencyPanelView';
import { TroopsManagers } from '../TroopsManagers';
import { SignpostView } from './Views/SignpostView';
import { HallOfHeroesPanelView } from './Views/HallOfHeroesPanelView';
const { ccclass, property } = _decorator;

@ccclass('HeroSpriteDictionary')
class HeroSpriteDictionary{
    @property(CCString)
    heroId:string = "";
    @property(SpriteFrame)
    heroSpriteFrame:SpriteFrame | null = null;
}

@ccclass('RankSpriteDictionary')
class RankSpriteDictionary{
    @property(CCString)
    rankId:string = "";
    @property(SpriteFrame)
    rankSpriteFrame:SpriteFrame | null = null;
}

@ccclass('ElementSpriteDictionary')
class ElementSpriteDictionary{
    @property(CCString)
    elementId:string = "";
    @property(SpriteFrame)
    elementSpriteFrame:SpriteFrame | null = null;
}

@ccclass('HUDManager')
export class HUDManager extends Component {

    public static Instance:HUDManager | null = null;

    @property(BuildingPanelView)
    private buildingPanelView:BuildingPanelView | null = null;
    @property(CurrencyPanelView)
    private currencyPanelView:CurrencyPanelView | null = null;
    @property(SignpostView)
    private signpostView:SignpostView | null = null;
    @property(HallOfHeroesPanelView)
    private hallOfHeroesPanelView:HallOfHeroesPanelView | null = null;

    @property({ type: [HeroSpriteDictionary] })
    private heroIconSpriteDictList: HeroSpriteDictionary[] = [];
    @property({ type: [RankSpriteDictionary] })
    private rankSpriteDictList: RankSpriteDictionary[] = [];
    @property({ type: [ElementSpriteDictionary] })
    private elementSpriteDictList: ElementSpriteDictionary[] = [];

    private _onHallOfHeroesToggled$: Subject<boolean> = new Subject<boolean>();

    private _hudClicksManager:HUDClicksManager | null = null;
    private _subscriptionsArray:Subscription[] = [];


    protected onLoad(): void {
        HUDManager.Instance = this;
        this._hudClicksManager = this.node.getComponent(HUDClicksManager);

        if(EconomyManager.Instance){
            const onMoneyUpdatedSubscription = EconomyManager.Instance.onMoneyUpdated$.subscribe((onMoneyUpdatedArgs: OnMoneyUpdatedArgs) => {
                this.handleMoneyUpdated(onMoneyUpdatedArgs);
            });
            this._subscriptionsArray.push(onMoneyUpdatedSubscription);
        }

        if(TroopsManagers.Instance){
            const onHeroesUpdated = TroopsManagers.Instance.onHeroesUpdated$.subscribe((summonedHeroes:HeroData[])=>{
                this.handleSummonedHeroesUpdate(summonedHeroes);
                this.updateHallOfHeroes(summonedHeroes);
            });
            this._subscriptionsArray.push(onHeroesUpdated);
        }

        const onAnyTowerClickedSubscription = TowerBuilding.onAnyTowerBuildingClicked$.subscribe((args: onAnyTowerBuildingClickedArgs) => {
            if(this.isHallOfHeroesPanelOpen()){
                return;
            }
            this.openBuildingPanel(args.buildingData, args.towerSummonQueueObservable$, args.onHeroHiredCallback);
        });
        this._subscriptionsArray.push(onAnyTowerClickedSubscription);

        const onHallOfHeroesToggledSubscription = this._onHallOfHeroesToggled$.subscribe((value:boolean) =>{
            if(this.signpostView){
                const signPostButton = this.signpostView.getComponent(Button);
                if(signPostButton){
                    signPostButton.interactable = !value;
                }
            }
            if(value){
                this.closeOpenedPanels();
            }
        });
        this._subscriptionsArray.push(onHallOfHeroesToggledSubscription);

        if(this.buildingPanelView){
            const buildingPanelViewModel = this.buildingPanelView.getViewModel();
            const buildingPanelToggleSubscription = buildingPanelViewModel.togglePanelVisible$.subscribe((value:boolean) => {
                if(this._hudClicksManager){
                    this._hudClicksManager.setPreventSwallowEventTouch(!value);
                }
            });
            this._subscriptionsArray.push(buildingPanelToggleSubscription);
        }
    }

    protected start(): void {
        if(this.signpostView){
            this.signpostView.node.on(Button.EventType.CLICK, (button:Button) =>{
                this.toggleHallOfHeroesVisibility(true);
            });
        }
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }

    public getHeroIconSpriteFrame(heroId:string) : SpriteFrame | null{
        const heroIcon = this.heroIconSpriteDictList.filter(icon => icon.heroId == heroId);
        return heroIcon[0].heroSpriteFrame;
    }

    public getRankSpriteFrame(rankId:string) : SpriteFrame | null{
        const rankIcon = this.rankSpriteDictList.filter(icon => icon.rankId == rankId);
        return rankIcon[0].rankSpriteFrame;
    }

    public getElementSpriteFrame(elementId:string) : SpriteFrame | null{
        const elementIcon = this.elementSpriteDictList.filter(icon => icon.elementId == elementId);
        return elementIcon[0].elementSpriteFrame;
    }

    public isPositionOverBuildingPanelContainer(inputPosition:Vec2): boolean{
        if(!this.buildingPanelView){
            console.warn("Warning! buildingPanelView is null");
            return false;
        }

        const buildingPanelContainer = this.buildingPanelView.getPanelContainer();
        if(!buildingPanelContainer){
            console.warn("Warning! buildingPanelContainer is null");
            return false;
        }

        return this.checkPositionIsOverNode(inputPosition, buildingPanelContainer);
    }

    public openBuildingPanel(buildingData:BuildingData, towerQueue$:Observable<OnTowerSummoningHeroArgs>, onHireCallback:(hiredHero:HeroData) => void){
        if(this.buildingPanelView){
            this.buildingPanelView.openPanel(buildingData, towerQueue$, onHireCallback);
        }
    }

    public isBuildingPanelOpen():boolean{
        if(this.buildingPanelView){
            return this.buildingPanelView.isPanelVisible();
        }
        return false;
    }

    public isHallOfHeroesPanelOpen():boolean{
        if(this.hallOfHeroesPanelView){
            return this.hallOfHeroesPanelView.isPanelVisible();
        }
        return false;
    }

    public toggleHallOfHeroesVisibility(value:boolean){
        this.hallOfHeroesPanelView?.togglePanel(value);
        this._onHallOfHeroesToggled$.next(value);
    }

    private closeOpenedPanels(){
        if(this.buildingPanelView && this.isBuildingPanelOpen()){
            this.buildingPanelView.closePanel();
        }
    }

    private handleSummonedHeroesUpdate(summonedHeroes:HeroData[]){
        this.signpostView?.handleSummonedHeroesUpdate(summonedHeroes);
    }

    private updateHallOfHeroes(summonedHeroes:HeroData[]){
        this.hallOfHeroesPanelView?.updateHallOfHeroes(summonedHeroes);
    }

    private handleMoneyUpdated(onMoneyUpdatedArgs:OnMoneyUpdatedArgs){
        //Do animation
        if(this.currencyPanelView){
            this.currencyPanelView.updateMoneyLabel(onMoneyUpdatedArgs.updatedValue, onMoneyUpdatedArgs.modifierValue);
        }
    }

    private checkPositionIsOverNode(inputPosition:Vec2, nodeToCheck:Node): boolean{
        const nodeUITransform = nodeToCheck.getComponent(UITransform);
        if(!nodeUITransform){
            console.warn("Warning! nodeToCheck has no UITransform. Please add one before calling checkPositionIsOverNode with a Node.");
            return false;
        }

        //It seems that UITransform converts input position with an offset, so this offset is made to counter it 
        const inputPositionOffset = new Vec2(30, -80);
        const inputPositionToVec3 = new Vec3(inputPosition.x + inputPositionOffset.x, inputPosition.y + inputPositionOffset.y, 0);
        const localNodePosition = nodeUITransform.convertToNodeSpaceAR(inputPositionToVec3);

        const positionToCheck = new Vec2(localNodePosition.x, localNodePosition.y);
        const isPositionOverNode = nodeUITransform.getBoundingBox().contains(positionToCheck);

        return isPositionOverNode;
    }
}


