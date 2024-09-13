import { _decorator, Component, Label, Node } from 'cc';
import { RxJSTestViewModel } from './RxJSTestViewModel';
import { Subscription } from 'rxjs';
const { ccclass, property } = _decorator;

@ccclass('RxJSTestView')
export class RxJSTestView extends Component {

    @property(Label)
    public counterLabel:Label | null = null;

    private viewmodel:RxJSTestViewModel = new RxJSTestViewModel();
    private subscriptions:Subscription[] = [];

    protected onLoad(): void {
        const counterSubscription = this.viewmodel.counter$.subscribe((value:number) => {
            if(this.counterLabel){
                this.counterLabel.string = value.toString();
            }
        })
        this.subscriptions.push(counterSubscription);
    }

    protected onDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
    public onIncrementButtonClick(){
        this.viewmodel.incrementCounter();
    }

    public onResetButtonClick(event: Event, CustomEventData:number){
        this.viewmodel.resetCounter();
        console.log("message from inspector:" + CustomEventData.toString());
    }
    
    start() {
        
    }

    update(deltaTime: number) {
        
    }
}


