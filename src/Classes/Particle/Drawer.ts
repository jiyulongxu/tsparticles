"use strict";

import {Bubbler} from "./Bubbler";
import {Container} from "../Container";
import {ISide} from "../../Interfaces/ISide";
import {ICoordinates} from "../../Interfaces/ICoordinates";
import {Particle} from "../Particle";
import {ShapeType} from "../../Enums/ShapeType";

/**
 * Particle draw manager
 */
export class Drawer {
    private readonly particle: Particle;
    private readonly container: Container;
    private readonly bubbler: Bubbler;
    private readonly text?: string;

    constructor(container: Container, particle: Particle, bubbler: Bubbler) {
        this.container = container;
        this.particle = particle;
        this.bubbler = bubbler;

        const options = this.container.options;

        if (this.particle.shape === ShapeType.char || particle.shape === ShapeType.character) {
            const value = options.particles.shape.character.value;

            if (typeof value === "string") {
                this.text = value;
            } else {
                this.text = value[Math.floor(Math.random() * value.length)]
            }
        }
    }

    private static subDrawShape(ctx: CanvasRenderingContext2D, start: ICoordinates, side: ISide): void {
        // By Programming Thomas - https://programmingthomas.wordpress.com/2013/04/03/n-sided-shapes/
        const sideCount = side.count.numerator * side.count.denominator;
        const decimalSides = side.count.numerator / side.count.denominator;
        const interiorAngleDegrees = (180 * (decimalSides - 2)) / decimalSides;
        const interiorAngle = Math.PI - Math.PI * interiorAngleDegrees / 180; // convert to radians

        ctx.save();
        ctx.beginPath();
        ctx.translate(start.x, start.y);
        ctx.moveTo(0, 0);

        for (let i = 0; i < sideCount; i++) {
            ctx.lineTo(side.length, 0);
            ctx.translate(side.length, 0);
            ctx.rotate(interiorAngle);
        }

        // c.stroke();
        ctx.fill();
        ctx.restore();
    }

    public draw(): void {
        const container = this.container;
        const options = container.options;
        const particle = this.particle;

        let radius: number;
        let opacity: number;
        let colorValue: string | undefined;

        if (this.bubbler.radius !== undefined) {
            radius = this.bubbler.radius;
        } else {
            radius = particle.radius;
        }

        if (this.bubbler.opacity !== undefined) {
            opacity = this.bubbler.opacity;
        } else {
            opacity = particle.opacity.value;
        }

        if (particle.color) {
            colorValue = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${opacity})`;
        }

        if (!container.canvas.context || !colorValue) {
            return;
        }

        const ctx = container.canvas.context;
        ctx.save();

        // TODO: Performance issues, the canvas shadow is really slow
        // const shadow = options.particles.shadow;

        // if (shadow.enable) {
        //     ctx.shadowBlur = shadow.blur;
        //     ctx.shadowColor = shadow.color;
        //     ctx.shadowOffsetX = shadow.offset.x;
        //     ctx.shadowOffsetY = shadow.offset.y;
        // } else {
        //     delete ctx.shadowBlur;
        //     delete ctx.shadowColor;
        //     delete ctx.shadowOffsetX;
        //     delete ctx.shadowOffsetY;
        // }

        ctx.fillStyle = colorValue;

        const pos = {
            x: particle.position.x,
            y: particle.position.y,
        };

        ctx.translate(pos.x, pos.y);
        ctx.beginPath();

        if (particle.angle !== 0) {
            ctx.rotate(particle.angle * Math.PI / 180);
        }

        if (options.backgroundMask.enable) {
            ctx.globalCompositeOperation = 'destination-out';
        }

        this.drawShape(radius);

        ctx.closePath();

        if (options.particles.shape.stroke.width > 0) {
            ctx.strokeStyle = options.particles.shape.stroke.color;
            ctx.lineWidth = options.particles.shape.stroke.width;
            ctx.stroke();
        }

        ctx.fill();
        ctx.restore();
    }

    private drawShape(radius: number): void {
        const container = this.container;
        const options = container.options;
        const particle = this.particle;
        const ctx = container.canvas.context;

        if (!ctx) {
            return;
        }

        const pos = {
            x: particle.offset.x,
            y: particle.offset.y,
        };

        switch (particle.shape) {
            case ShapeType.line:
                ctx.moveTo(0, 0);
                ctx.lineTo(0, radius);
                ctx.strokeStyle = options.particles.shape.stroke.color;
                ctx.lineWidth = options.particles.shape.stroke.width;
                ctx.stroke();
                break;

            case ShapeType.circle:
                ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2, false);
                break;
            case ShapeType.edge:
            case ShapeType.square:
                ctx.rect(-radius, -radius, radius * 2, radius * 2);
                break;
            case ShapeType.triangle: {
                const start: ICoordinates = {
                    x: -radius,
                    y: radius / 1.66,
                };

                const side: ISide = {
                    count: {
                        denominator: 2,
                        numerator: 3,
                    },
                    length: radius * 2,
                };

                Drawer.subDrawShape(ctx, start, side);
            }
                break;
            case ShapeType.polygon: {
                const start: ICoordinates = {
                    x: -radius / (options.particles.shape.polygon.sides / 3.5),
                    y: -radius / (2.66 / 3.5),
                };
                const side: ISide = {
                    count: {
                        denominator: 1,
                        numerator: options.particles.shape.polygon.sides,
                    },
                    length: radius * 2.66 / (options.particles.shape.polygon.sides / 3),
                };

                Drawer.subDrawShape(ctx, start, side);
            }
                break;
            case ShapeType.star: {
                const start: ICoordinates = {
                    x: -radius * 2 / (options.particles.shape.polygon.sides / 4),
                    y: -radius / (2 * 2.66 / 3.5),
                };
                const side: ISide = {
                    count: {
                        denominator: 2,
                        numerator: options.particles.shape.polygon.sides,
                    },
                    length: radius * 2 * 2.66 / (options.particles.shape.polygon.sides / 3),
                };

                Drawer.subDrawShape(ctx, start, side);
            }
                break;

            case ShapeType.heart: {
                const x = -radius / 2;
                const y = -radius / 2;

                ctx.moveTo(x, y + radius / 4);
                ctx.quadraticCurveTo(x, y, x + radius / 4, y);
                ctx.quadraticCurveTo(x + radius / 2, y, x + radius / 2, y + radius / 4);
                ctx.quadraticCurveTo(x + radius / 2, y, x + radius * 3 / 4, y);
                ctx.quadraticCurveTo(x + radius, y, x + radius, y + radius / 4);
                ctx.quadraticCurveTo(x + radius, y + radius / 2, x + radius * 3 / 4, y + radius * 3 / 4);
                ctx.lineTo(x + radius / 2, y + radius);
                ctx.lineTo(x + radius / 4, y + radius * 3 / 4);
                ctx.quadraticCurveTo(x, y + radius / 2, x, y + radius / 4);
            }
                break;

            case ShapeType.char:
            case ShapeType.character: {
                const style = options.particles.shape.character.style;
                const weight = options.particles.shape.character.weight;
                const size = Math.round(radius) * 2;
                const font = options.particles.shape.character.font;
                const text = this.text;

                ctx.font = `${style} ${weight} ${size}px ${font}`;

                if (text) {
                    const x = -radius / 2;
                    const y = radius / 2;

                    if (options.particles.shape.character.fill) {
                        ctx.fillText(text, x, y);
                    } else {
                        ctx.strokeText(text, x, y);
                    }
                }
            }
                break;

            case ShapeType.image:
                if (particle.image && particle.image.data.obj) {
                    this.subDraw(ctx, particle.image.data.obj, radius);
                }

                break;
        }
    }

    private subDraw(ctx: CanvasRenderingContext2D, imgObj: HTMLImageElement, radius: number): void {
        const particle = this.particle;

        let ratio = 1;

        if (particle.image) {
            ratio = particle.image.ratio;
        }

        const pos = {
            x: -radius,
            y: -radius,
        };

        ctx.drawImage(imgObj, pos.x, pos.y, radius * 2, radius * 2 / ratio);
    }
}
