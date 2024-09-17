import { _decorator, Button, Component, instantiate, Label, Node } from 'cc';
import { HallOfHeroesPanelViewModel } from '../ViewModels/HallOfHeroesPanelViewModel';
import { Subscription } from 'rxjs';
import { HeroData } from '../../GameData';
import { HeroHallSlotView } from './HeroHallSlotView';
const { ccclass, property } = _decorator;

@ccclass('HallOfHeroesPanelView')
export class HallOfHeroesPanelView extends Component {

    @property(Button)
    private closePanelButton:Button | null = null;
    @property(Node)
    private elementsContainer:Node | null = null;
    @property(Node)
    private heroHallSlotsContainer:Node | null = null;
    @property(Node)
    private heroHallSlotBase:Node | null = null;

    private _viewmodel:HallOfHeroesPanelViewModel | null = null;
    public getViewModel():HallOfHeroesPanelViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new HallOfHeroesPanelViewModel();
        }
        return this._viewmodel;
    }

    private _subscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        const viewModel = this.getViewModel();

        const onElementsContainerToggledSubscription = viewModel.onElementsContainerToggled$.subscribe((value:boolean) =>{
            if(this.elementsContainer){
                this.elementsContainer.active = value;
            }

            if(value){
                this.updateHeroHallSlots(viewModel.heroesSlotInHallArray);
            }
        });
        this._subscriptionsArray.push(onElementsContainerToggledSubscription);

        if(this.closePanelButton){
            this.closePanelButton.node.on(Button.EventType.CLICK, (button:Button) =>{
                viewModel.onClosePanelButtonClicked();
            });
        }
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }

    public updateHallOfHeroes(summonedHeroes:HeroData[]){
        this.getViewModel().updateHallOfHeroesData(summonedHeroes);
        this.updateHeroHallSlots(this.getViewModel().heroesSlotInHallArray);
    }

    public togglePanel(value:boolean){
        this.getViewModel().toggleElementsContainer(value);
    }

    public isPanelVisible():boolean{
        return this.getViewModel().isPanelVisible;
    }

    private updateHeroHallSlots(summonedHeroesData:HeroData[]){
        this.heroHallSlotsContainer?.children.forEach(child =>{
            if(child !== this.heroHallSlotBase && child.isValid){
                child.destroy();
            }
        });
        summonedHeroesData.forEach(heroData => {
            const newHeroHallSlot = instantiate(this.heroHallSlotBase);
            if(!newHeroHallSlot){
                return;
            }
            newHeroHallSlot.setParent(this.heroHallSlotsContainer);
            newHeroHallSlot.active = true;

            const newHeroHallSlotView = newHeroHallSlot.getComponent(HeroHallSlotView);
            if(newHeroHallSlotView){
                newHeroHallSlotView.setupHeroHallSlot(heroData);
            }
        })
    }
}


