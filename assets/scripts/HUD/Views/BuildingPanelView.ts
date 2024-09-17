import { _decorator, Button, Component, instantiate, Label, Node, Prefab, Tween, tween, Vec2, Vec3, view } from 'cc';
import { BuildingPanelViewModel, HeroIconListToCreateArgs, HireButtonPriceValueUpdateArgs, OnPanelSettingsSetArgs } from '../ViewModels/BuildingPanelViewModel';
import { Observable, Subscription } from 'rxjs';
import { HeroIconView } from './HeroIconView';
import { HeroIconViewModel } from '../ViewModels/HeroIconViewModel';
import { BuildingData, HeroData } from '../../GameData';
import { SummoningSlotView } from './SummoningSlotView';
import { SummoningSlotViewModel } from '../ViewModels/SummoningSlotViewModel';
import { OnTowerSummoningHeroArgs } from '../../TowerBuilding';
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

        const onPanelSettingsSetSubscription = viewModel.onPanelSettingsSet$.subscribe((onPanelSettingsSetArgs: OnPanelSettingsSetArgs) => {
            if(this.buildingNameLabel){
                this.buildingNameLabel.string = onPanelSettingsSetArgs.buildingName;
            }
            if(this.buildingDescLabel){
                this.buildingDescLabel.string = onPanelSettingsSetArgs.buildingDesc;
            }
            if(this.summonSlotBase){
                this.handleSummoningSlots(onPanelSettingsSetArgs.buildingHireSlots);
            }
            // console.log(`panel hire slots: ${onPanelSettingsSetArgs.buildingHireSlots}`);
        });
        this._subscriptionsArray.push(onPanelSettingsSetSubscription);

        const heroIconListToCreateSubscription = viewModel.heroIconListToCreate$.subscribe((heroIconListToCreateArgs: HeroIconListToCreateArgs) =>{
            this.handleHeroIcons(heroIconListToCreateArgs.heroIconsData);
        });
        this._subscriptionsArray.push(heroIconListToCreateSubscription);

        const enableHireButtonSubscription = viewModel.enableHireButton$.subscribe((buttonEnabled:boolean) => {
            if(this.hireButton){
                this.hireButton.interactable = buttonEnabled;
            }
        });
        this._subscriptionsArray.push(enableHireButtonSubscription);

        const priceLabelValueSubscription = viewModel.hireButtonPriceValueUpdate$.subscribe((priceUpdateArgs:HireButtonPriceValueUpdateArgs) => {
            if(this.hireButtonPriceLabel){
                this.hireButtonPriceLabel.string = priceUpdateArgs.newValue.toString();
                this.hireButtonPriceLabel.color = priceUpdateArgs.color;

                const priceContainer = this.hireButtonPriceLabel?.node.parent;
                if(priceContainer){
                    priceContainer.active = true;
                }
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

    public openPanel(buildingData: BuildingData, towerQueue$:Observable<OnTowerSummoningHeroArgs>, onHireCallback:(hiredHero:HeroData) => void){
        const viewModel = this.getViewModel();
        viewModel.openPanel(buildingData, towerQueue$, onHireCallback);
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

        let summoningSlotViewModelArray: SummoningSlotViewModel [] = [];
        const slotsToCreateAmount = slotsCount > 5 ? 5 : slotsCount;
        for (let i = 0; i < slotsToCreateAmount; i++) {
            let newSummonSlot = instantiate(this.summonSlotBase);
            if(!newSummonSlot){
                return;
            }
            
            newSummonSlot.parent = this.summonSlotListContainer;
            newSummonSlot.setPosition(0,0,0);
            newSummonSlot.active = true;

            const newSlotView = newSummonSlot.getComponent(SummoningSlotView);
            if(newSlotView){
                summoningSlotViewModelArray.push(newSlotView.getViewModel())
            }
        }
        this._viewmodel?.setCurrentSummoningSlotViewModelArray(summoningSlotViewModelArray);
    }

    private handleHeroIcons(iconsHeroData: HeroData[]){
        this.heroesIconListContainer?.children.forEach(child =>{
            if(child !== this.heroIconBase && child.isValid){
                child.destroy();
            }
        });

        let heroIconViewModelArray: HeroIconViewModel[] = [];
        iconsHeroData.forEach(heroData => {
            let newIcon = instantiate(this.heroIconBase);
            if(!newIcon){
                return;
            }

            newIcon.parent = this.heroesIconListContainer;
            newIcon.setPosition(0,0,0);
            newIcon.active = true;

            const newIconView = newIcon.getComponent(HeroIconView);
            if(newIconView){
                newIconView.Init(heroData);
                heroIconViewModelArray.push(newIconView.getViewModel());
                
                newIcon.on(Button.EventType.CLICK, (button: Button) => {
                    this._viewmodel?.selectHeroIcon(newIconView.getViewModel());
                });
            }
        });

        this._viewmodel?.setCurrentHeroIconViewModelArray(heroIconViewModelArray);
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


