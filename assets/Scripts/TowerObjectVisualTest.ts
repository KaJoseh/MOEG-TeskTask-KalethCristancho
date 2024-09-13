import { _decorator, Component, EventKeyboard, EventMouse, Input, input, KeyCode, Node } from 'cc';
import { TowerObjectTest } from './TowerObjectTest';
const { ccclass, property } = _decorator;

@ccclass('TowerObjectVisualTest')
export class TowerObjectVisualTest extends Component {
    
    @property(Node)
    private energyIcon: Node | null = null;
    @property(TowerObjectTest)
    private towerObject: TowerObjectTest | null = null;

    private showEnergyIcon: boolean = false;

    protected onLoad(): void {
        this.towerObject?.onTowerClicked$.subscribe( () => {this.toggleEnergyIcon();});
    }

    protected start(): void {
        if(this.energyIcon){
            this.energyIcon.active = false;
        }
    }

    private toggleEnergyIcon(): void{
        console.log("Toggling energy icon!");
        this.showEnergyIcon = !this.showEnergyIcon;
        console.log(`icon:${this.energyIcon} | showIcon: ${this.showEnergyIcon}`);
        if(this.energyIcon){
            this.energyIcon.active = this.showEnergyIcon;
        }
    }
}


