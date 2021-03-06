import {IOpacityAnimation} from "../../../Interfaces/Options/Particles/IOpacityAnimation";
import {Messages} from "../../Utils/Messages";
import {Utils} from "../../Utils/Utils";

export class OpacityAnimation implements IOpacityAnimation {
    /**
     *
     * @deprecated this property is obsolete, please use the new minimumValue
     */
    public get opacity_min(): number {
        Messages.deprecated("particles.opacity.animation.opacity_min", "particles.opacity.animation.minimumValue");

        return this.minimumValue;
    }

    /**
     *
     * @deprecated this property is obsolete, please use the new minimumValue
     * @param value
     */
    public set opacity_min(value: number) {
        Messages.deprecated("particles.opacity.animation.opacity_min", "particles.opacity.animation.minimumValue");

        this.minimumValue = value;
    }

    public enable: boolean;
    public minimumValue: number;
    public speed: number;
    public sync: boolean;

    constructor() {
        this.enable = false;
        this.minimumValue = 0;
        this.speed = 2;
        this.sync = false;
    }

    public load(data: IOpacityAnimation): void {
        if (Utils.hasData(data)) {
            if (Utils.hasData(data.enable)) {
                this.enable = data.enable;
            }

            if (Utils.hasData(data.minimumValue)) {
                this.minimumValue = data.minimumValue;
            }

            if (Utils.hasData(data.opacity_min)) {
                this.opacity_min = data.opacity_min;
            }

            if (Utils.hasData(data.speed)) {
                this.speed = data.speed;
            }

            if (Utils.hasData(data.sync)) {
                this.sync = data.sync;
            }
        }
    }
}
