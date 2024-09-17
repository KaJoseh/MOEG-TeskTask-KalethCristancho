import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { EconomyManager } from "../../EconomyManager";

export class CurrencyPanelViewModel {
    
    private _onMoneyValueUpdated: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    public get OnMoneyValueUpdated$(){
        return this._onMoneyValueUpdated.asObservable();
    }

    constructor(){

    }

    public updateMoneyValue(value:number){
        this._onMoneyValueUpdated.next(value);
    }
}


