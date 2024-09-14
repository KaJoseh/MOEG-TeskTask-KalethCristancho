import { _decorator, Component, Label, Node, Tween, tween, Vec2, Vec3 } from 'cc';
import { BuildingPanelViewModel, PanelSettings } from '../ViewModels/BuildingPanelViewModel';
import { Subscription } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('BuildingPanelView')
export class BuildingPanelView extends Component {

    @property(Node)
    private panelContainer:Node | null = null;
    public getPanelContainer():Node | null{
        return this.panelContainer;
    }

    @property(Label)
    private buildingNameLabel:Label | null = null;
    @property(Label)
    private buildingDescLabel:Label | null = null;

    private _viewmodel!:BuildingPanelViewModel;
    public getViewModel():BuildingPanelViewModel{
        if(this._viewmodel === undefined || this._viewmodel === null){
            console.log("BuildingPanelView | Viewmodel null from Getter, creating new one");
            this._viewmodel = new BuildingPanelViewModel();
        }

        return this._viewmodel;
    }

    private _showAnimation:Tween<Node | null> = new Tween<Node | null>();
    private _hideAnimation:Tween<Node | null> = new Tween<Node | null>();

    private _subscriptionsArray:Subscription[] = [];
    
    protected onLoad(): void {
        if(this._viewmodel === undefined || this._viewmodel === null){
            this._viewmodel = new BuildingPanelViewModel();
            console.log("BuildingPanelView | Viewmodel null from OnLoad, creating new one");
        }
        
        const togglePanelViewSubscription = this._viewmodel.togglePanelVisible$.subscribe((value:boolean) => {
            this.togglePanelView(value);           
        });
        this._subscriptionsArray.push(togglePanelViewSubscription);

        const panelSettingsSubscription = this._viewmodel.panelSettings$.subscribe((panelSettings: PanelSettings) => {
            if(this.buildingNameLabel){
                this.buildingNameLabel.string = panelSettings.name;
            }
            if(this.buildingDescLabel){
                this.buildingDescLabel.string = panelSettings.description;
            }
            console.log(`panel hire slots: ${panelSettings.hireSlots}`);
        });
        this._subscriptionsArray.push(panelSettingsSubscription);
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }

    protected start(): void {
       this.setUpAnimations();
    }

    private togglePanelView(toggleValue:boolean){
        if(toggleValue){
            this._hideAnimation.stop();
            this._showAnimation.start();
        }
        else{
            this._showAnimation.stop();
            this._hideAnimation.start();
        }
    }

    private setUpAnimations(){
        if(!this.panelContainer){
            console.warn("Warning, panelContainer is null!");
            return;
        }

        const toggleAnimDuration:number = 1;
        const positionOnShow:Vec3 = new Vec3(0, -570, 0);
        const positionOnHided:Vec3 = new Vec3(0, -1500, 0);
        this._showAnimation = tween(this.panelContainer).to(toggleAnimDuration, {position: positionOnShow}, {easing:'expoOut'});
        this._hideAnimation = tween(this.panelContainer).to(toggleAnimDuration, {position: positionOnHided}, {easing:'expoOut'});
    }
}


