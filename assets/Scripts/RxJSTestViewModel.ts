import { BehaviorSubject } from 'rxjs';

export class RxJSTestViewModel {

    private _counter: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    public get counter$(){
        return this._counter.asObservable();
    }

    public incrementCounter(){
        const currentValue = this._counter.getValue();
        const newCounterValue = currentValue + 1;
        
        this._counter.next(newCounterValue);
        console.log(`new counter value = ${newCounterValue}`);
    }

    public resetCounter(){
        this._counter.next(0);
    }
}


