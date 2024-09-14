import { _decorator, Component, Node, UITransform, Vec2, Vec3 } from 'cc';
import { BuildingPanelView } from './Views/BuildingPanelView';
import { Subject, Subscription } from 'rxjs';
import { HUDClicksManager } from './HUDClicksManager';
const { ccclass, property } = _decorator;

@ccclass('HUDManager')
export class HUDManager extends Component {

    public static Instance:HUDManager | null = null;

    @property(BuildingPanelView)
    private buildingPanelView:BuildingPanelView | null = null;

    private _hudClicksManager:HUDClicksManager | null = null;
    private _viewSubscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        HUDManager.Instance = this;
        this._hudClicksManager = this.node.getComponent(HUDClicksManager);

        if(this.buildingPanelView){
            const buildingPanelViewModel = this.buildingPanelView.getViewModel();
            const buildingPanelToggleSubscription = buildingPanelViewModel.togglePanelVisible$.subscribe((value:boolean) => {
                if(this._hudClicksManager){
                    this._hudClicksManager.setPreventSwallowEventTouch(!value);
                }
            });
            this._viewSubscriptionsArray.push(buildingPanelToggleSubscription);
        }
    }

    protected onDestroy(): void {
        this._viewSubscriptionsArray.forEach(sub => sub.unsubscribe());
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

    private checkPositionIsOverNode(inputPosition:Vec2, nodeToCheck:Node): boolean{
        const nodeUITransform = nodeToCheck.getComponent(UITransform);
        if(!nodeUITransform){
            console.warn("Warning! nodeToCheck has no UITransform. Please add one before calling checkPositionIsOverNode with a Node.");
            return false;
        }

        //It seems that UITransform converts input position with an offset, so this offset is made to counter it 
        const inputPositionOffset = new Vec2(30, 60);
        const inputPositionToVec3 = new Vec3(inputPosition.x + inputPositionOffset.x, inputPosition.y + inputPositionOffset.y, 0);
        const localNodePosition = nodeUITransform.convertToNodeSpaceAR(inputPositionToVec3);

        const positionToCheck = new Vec2(localNodePosition.x, localNodePosition.y);
        const isPositionOverNode = nodeUITransform.getBoundingBox().contains(positionToCheck);

        return isPositionOverNode;
    }
}


