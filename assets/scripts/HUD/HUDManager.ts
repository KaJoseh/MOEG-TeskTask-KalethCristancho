import { _decorator, CCString, Component, Node, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { BuildingPanelView } from './Views/BuildingPanelView';
import { Subject, Subscription } from 'rxjs';
import { HUDClicksManager } from './HUDClicksManager';
import { onAnyTowerBuildingClickedArgs, TowerBuilding } from '../TowerBuilding';
import { BuildingData } from '../GameData';
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

    @property({ type: [HeroSpriteDictionary] })
    private heroIconSpriteDictList: HeroSpriteDictionary[] = [];
    @property({ type: [RankSpriteDictionary] })
    private rankSpriteDictList: RankSpriteDictionary[] = [];
    @property({ type: [ElementSpriteDictionary] })
    private elementSpriteDictList: ElementSpriteDictionary[] = [];

    private _hudClicksManager:HUDClicksManager | null = null;
    private _subscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        HUDManager.Instance = this;
        this._hudClicksManager = this.node.getComponent(HUDClicksManager);

        const onAnyTowerClickedSubscription = TowerBuilding.onAnyTowerBuildingClicked$.subscribe((args: onAnyTowerBuildingClickedArgs) => {
            this.openBuildingPanel(args.buildingData, args.onHeroHiredCallback);
        });
        this._subscriptionsArray.push(onAnyTowerClickedSubscription);

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

    public openBuildingPanel(buildingData:BuildingData, onHireCallback:(hiredHero:any) => void){
        if(this.buildingPanelView){
            this.buildingPanelView.getViewModel().openPanel(buildingData, onHireCallback);
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


