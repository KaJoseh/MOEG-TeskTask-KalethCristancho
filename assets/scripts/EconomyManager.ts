import { _decorator, Component, Node } from 'cc';
import { GameSettingsManager } from './GameSettingsManager';
import { Subject } from 'rxjs';
const { ccclass, property } = _decorator;

export class OnMoneyUpdatedArgs{
    updatedValue:number;
    modifierValue:number;

    constructor(updatedValue:number, modifierValue:number){
        this.updatedValue = updatedValue;
        this.modifierValue = modifierValue;
    }
}

@ccclass('EconomyManager')
export class EconomyManager extends Component {
    public static Instance:EconomyManager | null = null;

    public onMoneyUpdated$: Subject<OnMoneyUpdatedArgs> = new Subject<OnMoneyUpdatedArgs>();

    private _currentMoney:number = 0;
    public get currentMoney(){
        return this._currentMoney;
    }

    protected onLoad(): void {
        EconomyManager.Instance = this;
    }

    protected async start(): Promise<void> {
        const initialMoney = await GameSettingsManager.Instance?.getInitialMoney();
        if(initialMoney){
            this._currentMoney = initialMoney;
            const onMoneyUpdatedArgs = new OnMoneyUpdatedArgs(this._currentMoney, 0);
            this.onMoneyUpdated$.next(onMoneyUpdatedArgs);
        }
    }

    public substractAmountFromMoney(value:number){
        this._currentMoney += value;
        const onMoneyUpdatedArgs = new OnMoneyUpdatedArgs(this._currentMoney, value);
        this.onMoneyUpdated$.next(onMoneyUpdatedArgs);
    }
}


