"use strict";

import {Container} from "../Container";
import {Particle} from "../Particle";
import {Utils} from "../Utils/Utils";
import {IRgb} from "../../Interfaces/IRgb";

/**
 * Particle grab manager
 */
export class Grabber {
    private readonly container: Container;
    private readonly particle: Particle;

    constructor(container: Container, particle: Particle) {
        this.container = container;
        this.particle = particle;
    }

    public grab(): void {
        const container = this.container;
        const options = container.options;
        const particle = this.particle;

        if (options.interactivity.events.onHover.enable && container.interactivity.status === "mousemove") {
            const mousePos = container.interactivity.mouse.position || {x: 0, y: 0};
            const distMouse = Utils.getDistanceBetweenCoordinates(particle.position, mousePos);
            /*
               draw a line between the cursor and the particle
               if the distance between them is under the config distance
            */
            if (distMouse <= container.retina.grabModeDistance) {
                const lineOpacity = options.interactivity.modes.grab.lineLinked.opacity;
                const grabDistance = container.retina.grabModeDistance;
                const opacityLine = lineOpacity - (distMouse / (1 / lineOpacity)) / grabDistance;

                if (opacityLine > 0) {
                    /* style */
                    const optColor = options.particles.lineLinked.color;
                    let lineColor = container.particles.lineLinkedColor || Utils.hexToRgb(optColor);

                    if (lineColor == "random") {
                        lineColor = Utils.getRandomColorRGBA();
                    }

                    container.particles.lineLinkedColor = lineColor;

                    let colorLine: IRgb = {r: 127, g: 127, b: 127};
                    const ctx = container.canvas.context;

                    if (ctx) {
                        if (container.particles.lineLinkedColor == "random") {
                            colorLine = Utils.getRandomColorRGBA();
                        } else {
                            colorLine = container.particles.lineLinkedColor as IRgb || colorLine;
                        }

                        ctx.strokeStyle = `rgba(${colorLine.r},${colorLine.g},${colorLine.b},${opacityLine})`;
                        ctx.lineWidth = container.retina.lineLinkedWidth;
                        // container.canvas.ctx.lineCap = "round"; /* performance issue */
                        /* path */
                        ctx.beginPath();
                        ctx.moveTo(particle.position.x + particle.offset.x, particle.position.y + particle.offset.y);
                        ctx.lineTo(mousePos.x, mousePos.y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
        }
    }
}
