import { _decorator, Button, Component, instantiate, Label, Node, Prefab, Tween, tween, Vec2, Vec3, view } from 'cc';
import { BuildingPanelViewModel, HeroIconParams, PanelSettings } from '../ViewModels/BuildingPanelViewModel';
import { Subscription } from 'rxjs';
import { HeroIconView } from './HeroIconView';
import { HeroIconViewModel } from '../ViewModels/HeroIconViewModel';
const { ccclass, property } = _decorator;

@ccclass('BuildingPanelView')
export class BuildingPanelView extends Component {

    @property({displayOrder: 1, type:Node})
    private panelContainer:Node | null = null;
    public getPanelContainer():Node | null{
        return this.panelContainer;
    }
    @property({displayOrder: 1, type:Label})
    private buildingNameLabel:Label | null = null;
    @property({displayOrder: 1, type:Label})
    private buildingDescLabel:Label | null = null;

    @property({group: {name: "Summon queue config", displayOrder: 2}, type:Node})
    private summonSlotBase:Node | null = null;
    @property({group: {name: "Summon queue config", displayOrder: 2}, type:Node})
    private summonSlotListContainer:Node | null = null;
    
    @property({group: {name: "Hero icons config", displayOrder: 3}, type:Node})
    private heroIconBase:Node | null = null;
    @property({group: {name: "Hero icons config", displayOrder: 3}, type:Node})
    private heroesIconListContainer:Node | null = null;

    @property({group: {name: "Hire button config", displayOrder: 4}, type:Button})
    private hireButton:Button | null = null;
    @property({group: {name: "Hire button config", displayOrder: 4}, type:Label})
    private hireButtonPriceLabel:Label | null = null;

    private _viewmodel:BuildingPanelViewModel | null = null;
    public getViewModel():BuildingPanelViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new BuildingPanelViewModel();
        }
        return this._viewmodel;
    }

    private _showAnimation:Tween<Node | null> = new Tween<Node | null>();
    private _hideAnimation:Tween<Node | null> = new Tween<Node | null>();

    private _subscriptionsArray:Subscription[] = [];
    
    protected onLoad(): void {
        const viewModel = this.getViewModel();
        
        this.hireButton?.node.on(Button.EventType.CLICK, (button: Button) => {
            this._viewmodel?.hireSelectedHero();
        });

        const togglePanelViewSubscription = viewModel.togglePanelVisible$.subscribe((value:boolean) => {
            this.togglePanelView(value);           
        });
        this._subscriptionsArray.push(togglePanelViewSubscription);

        const panelSettingsSubscription = viewModel.panelSettings$.subscribe((panelSettings: PanelSettings) => {
            if(this.buildingNameLabel){
                this.buildingNameLabel.string = panelSettings.name;
            }
            if(this.buildingDescLabel){
                this.buildingDescLabel.string = panelSettings.description;
            }
            if(this.summonSlotBase){
                this.handleSummoningSlots(panelSettings.hireSlots);
            }
            console.log(`panel hire slots: ${panelSettings.hireSlots}`);
        });
        this._subscriptionsArray.push(panelSettingsSubscription);

        const heroIconListSubscription = viewModel.heroIconListToCreate$.subscribe((heroIconList: HeroIconParams[]) =>{
            this.handleHeroIcons(heroIconList);
        });
        this._subscriptionsArray.push(heroIconListSubscription);

        const enableHireButtonSubscription = viewModel.enableHireButton$.subscribe((buttonEnabled:boolean) => {
            if(this.hireButton){
                this.hireButton.interactable = buttonEnabled;
            }
            const priceContainer = this.hireButtonPriceLabel?.node.parent;
            if(priceContainer){
                priceContainer.active = buttonEnabled;
            }

        });
        this._subscriptionsArray.push(enableHireButtonSubscription);

        const priceLabelValueSubscription = viewModel.hireButtonPriceValue$.subscribe((value:number) => {
            if(this.hireButtonPriceLabel){
                this.hireButtonPriceLabel.string = value.toString();
            }
        });
        this._subscriptionsArray.push(priceLabelValueSubscription);
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

    private handleSummoningSlots(slotsCount:number){
        this.summonSlotListContainer?.children.forEach(child =>{
            if(child !== this.summonSlotBase && child.isValid){
                child.destroy();
            }
        });

        for (let i = 0; i < slotsCount; i++) {
            let newSummonSlot = instantiate(this.summonSlotBase);
            if(!newSummonSlot){
                return;
            }
            
            newSummonSlot.parent = this.summonSlotListContainer;
            newSummonSlot.setPosition(0,0,0);
            newSummonSlot.active = true;
        }
    }

    private handleHeroIcons(heroIconParamsList: HeroIconParams[]){
        this.heroesIconListContainer?.children.forEach(child =>{
            if(child !== this.heroIconBase && child.isValid){
                child.destroy();
            }
        });

        let currentHeroIconViewModelArray: HeroIconViewModel[] = [];
        heroIconParamsList.forEach(heroIconParam => {
            let newIcon = instantiate(this.heroIconBase);
            if(!newIcon){
                return;
            }

            newIcon.parent = this.heroesIconListContainer;
            newIcon.setPosition(0,0,0);
            newIcon.active = true;

            const newIconView = newIcon.getComponent(HeroIconView);
            if(newIconView){
                newIconView.Init(heroIconParam.heroId, heroIconParam.rankId, heroIconParam.elementId, heroIconParam.cost);
                currentHeroIconViewModelArray.push(newIconView.getViewModel());
                
                newIcon.on(Button.EventType.CLICK, (button: Button) => {
                    this._viewmodel?.selectHeroIcon(newIconView.getViewModel());
                });
            }
        });

        this._viewmodel?.setCurrentHeroIconViewModelArray(currentHeroIconViewModelArray);
    }

    private setUpAnimations(){
        if(!this.panelContainer){
            console.warn("Warning, panelContainer is null!");
            return;
        }

        const toggleAnimDuration:number = 1;
        const positionOnShow:Vec3 = new Vec3(0, -620, 0);
        const positionOnHided:Vec3 = new Vec3(0, -1500, 0);
        this._showAnimation = tween(this.panelContainer).to(toggleAnimDuration, {position: positionOnShow}, {easing:'expoOut'});
        this._hideAnimation = tween(this.panelContainer).to(toggleAnimDuration, {position: positionOnHided}, {easing:'expoOut'});
    }
}


