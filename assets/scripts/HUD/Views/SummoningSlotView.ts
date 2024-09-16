import { _decorator, Component, Node, Sprite } from 'cc';
import { SummoningSlotViewModel } from '../ViewModels/SummoningSlotViewModel';
const { ccclass, property } = _decorator;

@ccclass('SummoningSlotView')
export class SummoningSlotView extends Component {
    
    @property(Sprite)
    private heroIconSprite:Sprite | null = null;
    @property(Sprite)
    private rankIconSprite:Sprite | null = null;
    @property(Sprite)
    private elementIconSprite:Sprite | null = null;
    @property(Sprite)
    private progressBarSprite:Sprite | null = null;

    private _viewmodel:SummoningSlotViewModel | null = null;
    public getViewModel():SummoningSlotViewModel{
        if (!this._viewmodel) {
            this._viewmodel = new SummoningSlotViewModel();
        }
        return this._viewmodel;
    }

    protected onLoad(): void {

    }

}


