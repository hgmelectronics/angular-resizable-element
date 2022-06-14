import { Renderer2, ElementRef, OnInit, EventEmitter, OnDestroy, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Edges } from './interfaces/edges.interface';
import { ClickEvent } from './interfaces/click-event.interface';
import { ResizeEvent } from './interfaces/resize-event.interface';
import * as i0 from "@angular/core";
export interface ResizeCursors {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
    leftOrRight: string;
    topOrBottom: string;
}
export declare type EdgesDiff = {
    [Property in keyof Edges]: Exclude<Edges[Property], boolean>;
};
export declare const MOUSE_MOVE_THROTTLE_MS: number;
export declare const DISABLE_CLICK_MOVE_THRESHOLD: number;
/**
 * Place this on an element to make it resizable. For example:
 *
 * ```html
 * <div
 *   mwlResizable
 *   [resizeEdges]="{bottom: true, right: true, top: true, left: true}"
 *   [enableGhostResize]="true">
 * </div>
 * ```
 * Or in case they are sibling elements:
 * ```html
 * <div mwlResizable #resizableElement="mwlResizable"></div>
 * <div mwlResizeHandle [resizableContainer]="resizableElement" [resizeEdges]="{bottom: true, right: true}"></div>
 * ```
 */
export declare class ResizableDirective implements OnInit, OnDestroy {
    private platformId;
    private renderer;
    elm: ElementRef;
    private zone;
    /**
     * A function that will be called before each resize event. Return `true` to allow the resize event to propagate or `false` to cancel it
     */
    validateResize: (resizeEvent: ResizeEvent) => boolean;
    /**
     * Set to `true` to enable a temporary resizing effect of the element in between the `resizeStart` and `resizeEnd` events.
     */
    enableGhostResize: boolean;
    /**
     * A snap grid that resize events will be locked to.
     *
     * e.g. to only allow the element to be resized every 10px set it to `{left: 10, right: 10}`
     */
    resizeSnapGrid: Edges;
    /**
     * The mouse cursors that will be set on the resize edges
     */
    resizeCursors: ResizeCursors;
    /**
     * Define the positioning of the ghost element (can be fixed or absolute)
     */
    ghostElementPositioning: 'fixed' | 'absolute';
    /**
     * Allow elements to be resized to negative dimensions
     */
    allowNegativeResizes: boolean;
    /**
     * The mouse move throttle in milliseconds, default: 50 ms
     */
    mouseMoveThrottleMS: number;
    /**
     * The distance in pixels that the mouse must move to trigger a resize event, <= 0 to disable (default)
     *
     * Below this threshold, a click event will be emitted instead
     */
    resizeMoveThreshold: number;
    /**
     * Called when the mouse is pressed and a resize event is about to begin. `$event` is a `ResizeEvent` object.
     */
    resizeStart: EventEmitter<ResizeEvent>;
    /**
     * Called as the mouse is dragged after a resize event has begun. `$event` is a `ResizeEvent` object.
     */
    resizing: EventEmitter<ResizeEvent>;
    /**
     * Called after the mouse is released after a resize event. `$event` is a `ResizeEvent` object.
     */
    resizeEnd: EventEmitter<ResizeEvent>;
    /**
     * Called after the mouse is released after a click event. `$event` is a `ClickEvent` object.
     */
    clicked: EventEmitter<ClickEvent>;
    /**
     * @hidden
     */
    mouseup: Subject<{
        clientX: number;
        clientY: number;
        edges?: Edges | undefined;
    }>;
    /**
     * @hidden
     */
    mousedown: Subject<{
        clientX: number;
        clientY: number;
        edges?: Edges | undefined;
    }>;
    /**
     * @hidden
     */
    mousemove: Subject<{
        clientX: number;
        clientY: number;
        edges?: Edges | undefined;
        event: MouseEvent | TouchEvent;
    }>;
    private pointerEventListeners;
    private destroy$;
    /**
     * @hidden
     */
    constructor(platformId: any, renderer: Renderer2, elm: ElementRef, zone: NgZone);
    /**
     * @hidden
     */
    ngOnInit(): void;
    /**
     * @hidden
     */
    ngOnDestroy(): void;
    private setElementClass;
    static ɵfac: i0.ɵɵFactoryDeclaration<ResizableDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ResizableDirective, "[mwlResizable]", ["mwlResizable"], { "validateResize": "validateResize"; "enableGhostResize": "enableGhostResize"; "resizeSnapGrid": "resizeSnapGrid"; "resizeCursors": "resizeCursors"; "ghostElementPositioning": "ghostElementPositioning"; "allowNegativeResizes": "allowNegativeResizes"; "mouseMoveThrottleMS": "mouseMoveThrottleMS"; "resizeMoveThreshold": "resizeMoveThreshold"; }, { "resizeStart": "resizeStart"; "resizing": "resizing"; "resizeEnd": "resizeEnd"; "clicked": "clicked"; }, never>;
}
