import { _decorator, color, Component, instantiate, Label, Node, tween, Vec2, Vec3 } from 'cc';
import { CurrencyPanelViewModel } from '../ViewModels/CurrencyPanelViewModel';
import { Subscription } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('CurrencyPanelView')
export class CurrencyPanelView extends Component {

    @property(Label)
    private moneyValueLabel:Label | null = null;
    @property(Label)
    private moneyModifierLabelBase:Label | null = null;

    private _viewmodel:CurrencyPanelViewModel | null = null;
    public getViewModel():CurrencyPanelViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new CurrencyPanelViewModel();
        }
        return this._viewmodel;
    }

    private _subscriptionsArray:Subscription[] = [];

    protected onLoad(): void {
        const viewmodel = this.getViewModel();

        const onMoneyValueUpdatedSubscription = viewmodel.OnMoneyValueUpdated$.subscribe((value:number) => {
            if(this.moneyValueLabel){
                this.moneyValueLabel.string = value.toString();
            }
        });
        this._subscriptionsArray.push(onMoneyValueUpdatedSubscription);
    }

    protected onDestroy(): void {
        this._subscriptionsArray.forEach(sub => sub.unsubscribe());
    }
    
    public updateMoneyLabel(newMoneyValue:number, modifierValue:number){
        this.getViewModel().updateMoneyValue(newMoneyValue);

        if(modifierValue !== 0){

            const newModifierLabel = instantiate(this.moneyModifierLabelBase?.node)?.getComponent(Label);
            if(!newModifierLabel){
                return;
            }

            newModifierLabel.node.setParent(this.node);
            newModifierLabel.node.active = true;
            newModifierLabel.string = modifierValue.toString();

            const animationDuration = 1;
            const targetAnimPosition = new Vec3(newModifierLabel.node.position.x, newModifierLabel.node.position.y -45, 0);

            //PositionAnimation
            tween(newModifierLabel.node)
                .to(animationDuration, {position: targetAnimPosition}, {easing:"sineOut"})
                .call(() => {
                    newModifierLabel.node.destroy();
                })
                .start();
            
            //Color Animation -> For some reason it kept setting the color to every color possible, so it's commented it until I figure out why
            // tween(newModifierLabel)
            //     .to(animationDuration, {color: color(newModifierLabel.color.r, newModifierLabel.color.g, newModifierLabel.color.b, 0)}, {easing:"sineOut"})
            //     .call(() =>{
            //         newModifierLabel.node.destroy();
            //     })
            //     .start();
        }
    }
}


