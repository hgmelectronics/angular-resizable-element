import { Directive, Output, Input, EventEmitter, Inject, PLATFORM_ID, } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable, merge } from 'rxjs';
import { map, mergeMap, takeUntil, filter, pairwise, take, share, tap, } from 'rxjs/operators';
import { IS_TOUCH_DEVICE } from './util/is-touch-device';
import { deepCloneNode } from './util/clone-node';
import * as i0 from "@angular/core";
function getNewBoundingRectangle(startingRect, edges, clientX, clientY) {
    const newBoundingRect = {
        top: startingRect.top,
        bottom: startingRect.bottom,
        left: startingRect.left,
        right: startingRect.right,
    };
    if (edges.top) {
        newBoundingRect.top += clientY;
    }
    if (edges.bottom) {
        newBoundingRect.bottom += clientY;
    }
    if (edges.left) {
        newBoundingRect.left += clientX;
    }
    if (edges.right) {
        newBoundingRect.right += clientX;
    }
    newBoundingRect.height = newBoundingRect.bottom - newBoundingRect.top;
    newBoundingRect.width = newBoundingRect.right - newBoundingRect.left;
    return newBoundingRect;
}
function getElementRect(element, ghostElementPositioning) {
    let translateX = 0;
    let translateY = 0;
    const style = element.nativeElement.style;
    const transformProperties = [
        'transform',
        '-ms-transform',
        '-moz-transform',
        '-o-transform',
    ];
    const transform = transformProperties
        .map((property) => style[property])
        .find((value) => !!value);
    if (transform && transform.includes('translate')) {
        translateX = transform.replace(/.*translate3?d?\((-?[0-9]*)px, (-?[0-9]*)px.*/, '$1');
        translateY = transform.replace(/.*translate3?d?\((-?[0-9]*)px, (-?[0-9]*)px.*/, '$2');
    }
    if (ghostElementPositioning === 'absolute') {
        return {
            height: element.nativeElement.offsetHeight,
            width: element.nativeElement.offsetWidth,
            top: element.nativeElement.offsetTop - translateY,
            bottom: element.nativeElement.offsetHeight +
                element.nativeElement.offsetTop -
                translateY,
            left: element.nativeElement.offsetLeft - translateX,
            right: element.nativeElement.offsetWidth +
                element.nativeElement.offsetLeft -
                translateX,
        };
    }
    else {
        const boundingRect = element.nativeElement.getBoundingClientRect();
        return {
            height: boundingRect.height,
            width: boundingRect.width,
            top: boundingRect.top - translateY,
            bottom: boundingRect.bottom - translateY,
            left: boundingRect.left - translateX,
            right: boundingRect.right - translateX,
            scrollTop: element.nativeElement.scrollTop,
            scrollLeft: element.nativeElement.scrollLeft,
        };
    }
}
const DEFAULT_RESIZE_CURSORS = Object.freeze({
    topLeft: 'nw-resize',
    topRight: 'ne-resize',
    bottomLeft: 'sw-resize',
    bottomRight: 'se-resize',
    leftOrRight: 'col-resize',
    topOrBottom: 'row-resize',
});
function getResizeCursor(edges, cursors) {
    if (edges.left && edges.top) {
        return cursors.topLeft;
    }
    else if (edges.right && edges.top) {
        return cursors.topRight;
    }
    else if (edges.left && edges.bottom) {
        return cursors.bottomLeft;
    }
    else if (edges.right && edges.bottom) {
        return cursors.bottomRight;
    }
    else if (edges.left || edges.right) {
        return cursors.leftOrRight;
    }
    else if (edges.top || edges.bottom) {
        return cursors.topOrBottom;
    }
    else {
        return '';
    }
}
function getEdgesDiff({ edges, initialRectangle, newRectangle, }) {
    const edgesDiff = {};
    Object.keys(edges).forEach((edge) => {
        edgesDiff[edge] = (newRectangle[edge] || 0) - (initialRectangle[edge] || 0);
    });
    return edgesDiff;
}
const getTotalDiff = (edgesDiff) => Object.values(edgesDiff)
    .map((edge) => Math.abs(edge || 0))
    .reduce((a, b) => Math.max(a, b), 0);
const RESIZE_ACTIVE_CLASS = 'resize-active';
const RESIZE_GHOST_ELEMENT_CLASS = 'resize-ghost-element';
export const MOUSE_MOVE_THROTTLE_MS = 50;
export const DISABLE_CLICK_MOVE_THRESHOLD = 0;
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
export class ResizableDirective {
    /**
     * @hidden
     */
    constructor(platformId, renderer, elm, zone) {
        this.platformId = platformId;
        this.renderer = renderer;
        this.elm = elm;
        this.zone = zone;
        /**
         * Set to `true` to enable a temporary resizing effect of the element in between the `resizeStart` and `resizeEnd` events.
         */
        this.enableGhostResize = false;
        /**
         * A snap grid that resize events will be locked to.
         *
         * e.g. to only allow the element to be resized every 10px set it to `{left: 10, right: 10}`
         */
        this.resizeSnapGrid = {};
        /**
         * The mouse cursors that will be set on the resize edges
         */
        this.resizeCursors = DEFAULT_RESIZE_CURSORS;
        /**
         * Define the positioning of the ghost element (can be fixed or absolute)
         */
        this.ghostElementPositioning = 'fixed';
        /**
         * Allow elements to be resized to negative dimensions
         */
        this.allowNegativeResizes = false;
        /**
         * The mouse move throttle in milliseconds, default: 50 ms
         */
        this.mouseMoveThrottleMS = MOUSE_MOVE_THROTTLE_MS;
        /**
         * The distance in pixels that the mouse must move to trigger a resize event, <= 0 to disable (default)
         *
         * Below this threshold, a click event will be emitted instead
         */
        this.resizeMoveThreshold = DISABLE_CLICK_MOVE_THRESHOLD;
        /**
         * Called when the mouse is pressed and a resize event is about to begin. `$event` is a `ResizeEvent` object.
         */
        this.resizeStart = new EventEmitter();
        /**
         * Called as the mouse is dragged after a resize event has begun. `$event` is a `ResizeEvent` object.
         */
        this.resizing = new EventEmitter();
        /**
         * Called after the mouse is released after a resize event. `$event` is a `ResizeEvent` object.
         */
        this.resizeEnd = new EventEmitter();
        /**
         * Called after the mouse is released after a click event. `$event` is a `ClickEvent` object.
         */
        this.clicked = new EventEmitter();
        /**
         * @hidden
         */
        this.mouseup = new Subject();
        /**
         * @hidden
         */
        this.mousedown = new Subject();
        /**
         * @hidden
         */
        this.mousemove = new Subject();
        this.destroy$ = new Subject();
        this.pointerEventListeners = PointerEventListeners.getInstance(renderer, zone);
    }
    /**
     * @hidden
     */
    ngOnInit() {
        const mousedown$ = merge(this.pointerEventListeners.pointerDown, this.mousedown);
        const mousemove$ = merge(this.pointerEventListeners.pointerMove, this.mousemove).pipe(tap(({ event }) => {
            if (currentResize) {
                try {
                    event.preventDefault();
                }
                catch (e) {
                    // just adding try-catch not to see errors in console if there is a passive listener for same event somewhere
                    // browser does nothing except of writing errors to console
                }
            }
        }), share());
        const mouseup$ = merge(this.pointerEventListeners.pointerUp, this.mouseup);
        let currentResize;
        const removeGhostElement = () => {
            if (currentResize && currentResize.clonedNode) {
                this.elm.nativeElement.parentElement.removeChild(currentResize.clonedNode);
                this.renderer.setStyle(this.elm.nativeElement, 'visibility', 'inherit');
            }
        };
        const getResizeCursors = () => {
            return Object.assign(Object.assign({}, DEFAULT_RESIZE_CURSORS), this.resizeCursors);
        };
        const startVisibleResize = () => {
            currentResize.visible = true;
            const resizeCursors = getResizeCursors();
            const cursor = getResizeCursor(currentResize.edges, resizeCursors);
            this.renderer.setStyle(document.body, 'cursor', cursor);
            this.setElementClass(this.elm, RESIZE_ACTIVE_CLASS, true);
            if (this.enableGhostResize) {
                currentResize.clonedNode = deepCloneNode(this.elm.nativeElement);
                this.elm.nativeElement.parentElement.appendChild(currentResize.clonedNode);
                this.renderer.setStyle(this.elm.nativeElement, 'visibility', 'hidden');
                this.renderer.setStyle(currentResize.clonedNode, 'position', this.ghostElementPositioning);
                this.renderer.setStyle(currentResize.clonedNode, 'left', `${currentResize.startingRect.left}px`);
                this.renderer.setStyle(currentResize.clonedNode, 'top', `${currentResize.startingRect.top}px`);
                this.renderer.setStyle(currentResize.clonedNode, 'height', `${currentResize.startingRect.height}px`);
                this.renderer.setStyle(currentResize.clonedNode, 'width', `${currentResize.startingRect.width}px`);
                this.renderer.setStyle(currentResize.clonedNode, 'cursor', getResizeCursor(currentResize.edges, resizeCursors));
                this.renderer.addClass(currentResize.clonedNode, RESIZE_GHOST_ELEMENT_CLASS);
                currentResize.clonedNode.scrollTop = currentResize.startingRect
                    .scrollTop;
                currentResize.clonedNode.scrollLeft = currentResize.startingRect
                    .scrollLeft;
            }
            if (this.resizeStart.observers.length > 0) {
                this.zone.run(() => {
                    this.resizeStart.emit({
                        edges: getEdgesDiff({
                            edges: currentResize.edges,
                            initialRectangle: currentResize.startingRect,
                            newRectangle: currentResize.startingRect,
                        }),
                        rectangle: getNewBoundingRectangle(currentResize.startingRect, {}, 0, 0),
                    });
                });
            }
        };
        const mousedrag = mousedown$
            .pipe(mergeMap((startCoords) => {
            function getDiff(moveCoords) {
                return {
                    clientX: moveCoords.clientX - startCoords.clientX,
                    clientY: moveCoords.clientY - startCoords.clientY,
                };
            }
            const getSnapGrid = () => {
                const snapGrid = { x: 1, y: 1 };
                if (currentResize) {
                    if (this.resizeSnapGrid.left && currentResize.edges.left) {
                        snapGrid.x = +this.resizeSnapGrid.left;
                    }
                    else if (this.resizeSnapGrid.right &&
                        currentResize.edges.right) {
                        snapGrid.x = +this.resizeSnapGrid.right;
                    }
                    if (this.resizeSnapGrid.top && currentResize.edges.top) {
                        snapGrid.y = +this.resizeSnapGrid.top;
                    }
                    else if (this.resizeSnapGrid.bottom &&
                        currentResize.edges.bottom) {
                        snapGrid.y = +this.resizeSnapGrid.bottom;
                    }
                }
                return snapGrid;
            };
            function getGrid(coords, snapGrid) {
                return {
                    x: Math.ceil(coords.clientX / snapGrid.x),
                    y: Math.ceil(coords.clientY / snapGrid.y),
                };
            }
            return merge(mousemove$.pipe(take(1)).pipe(map((coords) => [, coords])), mousemove$.pipe(pairwise()))
                .pipe(map(([previousCoords, newCoords]) => {
                return [
                    previousCoords ? getDiff(previousCoords) : previousCoords,
                    getDiff(newCoords),
                ];
            }))
                .pipe(filter(([previousCoords, newCoords]) => {
                if (!previousCoords) {
                    return true;
                }
                const snapGrid = getSnapGrid();
                const previousGrid = getGrid(previousCoords, snapGrid);
                const newGrid = getGrid(newCoords, snapGrid);
                return (previousGrid.x !== newGrid.x || previousGrid.y !== newGrid.y);
            }))
                .pipe(map(([, newCoords]) => {
                const snapGrid = getSnapGrid();
                return {
                    clientX: Math.round(newCoords.clientX / snapGrid.x) * snapGrid.x,
                    clientY: Math.round(newCoords.clientY / snapGrid.y) * snapGrid.y,
                };
            }))
                .pipe(takeUntil(merge(mouseup$, mousedown$)));
        }))
            .pipe(filter(() => !!currentResize));
        mousedrag
            .pipe(map(({ clientX, clientY }) => {
            return getNewBoundingRectangle(currentResize.startingRect, currentResize.edges, clientX, clientY);
        }))
            .pipe(filter((newBoundingRect) => {
            return (this.allowNegativeResizes ||
                !!(newBoundingRect.height &&
                    newBoundingRect.width &&
                    newBoundingRect.height > 0 &&
                    newBoundingRect.width > 0));
        }))
            .pipe(filter((newBoundingRect) => {
            return this.validateResize
                ? this.validateResize({
                    rectangle: newBoundingRect,
                    edges: getEdgesDiff({
                        edges: currentResize.edges,
                        initialRectangle: currentResize.startingRect,
                        newRectangle: newBoundingRect,
                    }),
                })
                : true;
        }), takeUntil(this.destroy$))
            .subscribe((newBoundingRect) => {
            const edges = getEdgesDiff({
                edges: currentResize.edges,
                initialRectangle: currentResize.startingRect,
                newRectangle: newBoundingRect,
            });
            if (!currentResize.visible &&
                getTotalDiff(edges) >= this.resizeMoveThreshold) {
                startVisibleResize();
            }
            if (currentResize.visible && currentResize.clonedNode) {
                this.renderer.setStyle(currentResize.clonedNode, 'height', `${newBoundingRect.height}px`);
                this.renderer.setStyle(currentResize.clonedNode, 'width', `${newBoundingRect.width}px`);
                this.renderer.setStyle(currentResize.clonedNode, 'top', `${newBoundingRect.top}px`);
                this.renderer.setStyle(currentResize.clonedNode, 'left', `${newBoundingRect.left}px`);
            }
            if (currentResize.visible && this.resizing.observers.length > 0) {
                this.zone.run(() => {
                    this.resizing.emit({
                        edges,
                        rectangle: newBoundingRect,
                    });
                });
            }
            currentResize.currentRect = newBoundingRect;
        });
        mousedown$
            .pipe(map(({ edges }) => {
            return edges || {};
        }), filter((edges) => {
            return Object.keys(edges).length > 0;
        }), takeUntil(this.destroy$))
            .subscribe((edges) => {
            if (currentResize) {
                removeGhostElement();
            }
            const startingRect = getElementRect(this.elm, this.ghostElementPositioning);
            currentResize = {
                edges,
                startingRect,
                currentRect: startingRect,
                visible: false,
            };
            if (this.resizeMoveThreshold <= 0) {
                startVisibleResize();
            }
        });
        mouseup$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
            if (!currentResize) {
                return;
            }
            if (currentResize.visible) {
                this.renderer.removeClass(this.elm.nativeElement, RESIZE_ACTIVE_CLASS);
                this.renderer.setStyle(document.body, 'cursor', '');
                this.renderer.setStyle(this.elm.nativeElement, 'cursor', '');
                if (this.resizeEnd.observers.length > 0) {
                    this.zone.run(() => {
                        this.resizeEnd.emit({
                            edges: getEdgesDiff({
                                edges: currentResize.edges,
                                initialRectangle: currentResize.startingRect,
                                newRectangle: currentResize.currentRect,
                            }),
                            rectangle: currentResize.currentRect,
                        });
                    });
                }
                removeGhostElement();
            }
            else {
                if (this.clicked.observers.length > 0) {
                    this.zone.run(() => {
                        this.clicked.emit(event);
                    });
                }
            }
            currentResize = null;
        });
    }
    /**
     * @hidden
     */
    ngOnDestroy() {
        // browser check for angular universal, because it doesn't know what document is
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.setStyle(document.body, 'cursor', '');
        }
        this.mousedown.complete();
        this.mouseup.complete();
        this.mousemove.complete();
        this.destroy$.next();
    }
    setElementClass(elm, name, add) {
        if (add) {
            this.renderer.addClass(elm.nativeElement, name);
        }
        else {
            this.renderer.removeClass(elm.nativeElement, name);
        }
    }
}
ResizableDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0, type: ResizableDirective, deps: [{ token: PLATFORM_ID }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive });
ResizableDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.3", type: ResizableDirective, selector: "[mwlResizable]", inputs: { validateResize: "validateResize", enableGhostResize: "enableGhostResize", resizeSnapGrid: "resizeSnapGrid", resizeCursors: "resizeCursors", ghostElementPositioning: "ghostElementPositioning", allowNegativeResizes: "allowNegativeResizes", mouseMoveThrottleMS: "mouseMoveThrottleMS", resizeMoveThreshold: "resizeMoveThreshold" }, outputs: { resizeStart: "resizeStart", resizing: "resizing", resizeEnd: "resizeEnd", clicked: "clicked" }, exportAs: ["mwlResizable"], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0, type: ResizableDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mwlResizable]',
                    exportAs: 'mwlResizable',
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i0.NgZone }]; }, propDecorators: { validateResize: [{
                type: Input
            }], enableGhostResize: [{
                type: Input
            }], resizeSnapGrid: [{
                type: Input
            }], resizeCursors: [{
                type: Input
            }], ghostElementPositioning: [{
                type: Input
            }], allowNegativeResizes: [{
                type: Input
            }], mouseMoveThrottleMS: [{
                type: Input
            }], resizeMoveThreshold: [{
                type: Input
            }], resizeStart: [{
                type: Output
            }], resizing: [{
                type: Output
            }], resizeEnd: [{
                type: Output
            }], clicked: [{
                type: Output
            }] } });
class PointerEventListeners {
    constructor(renderer, zone) {
        this.pointerDown = new Observable((observer) => {
            let unsubscribeMouseDown;
            let unsubscribeTouchStart;
            zone.runOutsideAngular(() => {
                unsubscribeMouseDown = renderer.listen('document', 'mousedown', (event) => {
                    observer.next({
                        clientX: event.clientX,
                        clientY: event.clientY,
                        event,
                    });
                });
                if (IS_TOUCH_DEVICE) {
                    unsubscribeTouchStart = renderer.listen('document', 'touchstart', (event) => {
                        observer.next({
                            clientX: event.touches[0].clientX,
                            clientY: event.touches[0].clientY,
                            event,
                        });
                    });
                }
            });
            return () => {
                unsubscribeMouseDown();
                if (IS_TOUCH_DEVICE) {
                    unsubscribeTouchStart();
                }
            };
        }).pipe(share());
        this.pointerMove = new Observable((observer) => {
            let unsubscribeMouseMove;
            let unsubscribeTouchMove;
            zone.runOutsideAngular(() => {
                unsubscribeMouseMove = renderer.listen('document', 'mousemove', (event) => {
                    observer.next({
                        clientX: event.clientX,
                        clientY: event.clientY,
                        event,
                    });
                });
                if (IS_TOUCH_DEVICE) {
                    unsubscribeTouchMove = renderer.listen('document', 'touchmove', (event) => {
                        observer.next({
                            clientX: event.targetTouches[0].clientX,
                            clientY: event.targetTouches[0].clientY,
                            event,
                        });
                    });
                }
            });
            return () => {
                unsubscribeMouseMove();
                if (IS_TOUCH_DEVICE) {
                    unsubscribeTouchMove();
                }
            };
        }).pipe(share());
        this.pointerUp = new Observable((observer) => {
            let unsubscribeMouseUp;
            let unsubscribeTouchEnd;
            let unsubscribeTouchCancel;
            zone.runOutsideAngular(() => {
                unsubscribeMouseUp = renderer.listen('document', 'mouseup', (event) => {
                    observer.next({
                        clientX: event.clientX,
                        clientY: event.clientY,
                        event,
                    });
                });
                if (IS_TOUCH_DEVICE) {
                    unsubscribeTouchEnd = renderer.listen('document', 'touchend', (event) => {
                        observer.next({
                            clientX: event.changedTouches[0].clientX,
                            clientY: event.changedTouches[0].clientY,
                            event,
                        });
                    });
                    unsubscribeTouchCancel = renderer.listen('document', 'touchcancel', (event) => {
                        observer.next({
                            clientX: event.changedTouches[0].clientX,
                            clientY: event.changedTouches[0].clientY,
                            event,
                        });
                    });
                }
            });
            return () => {
                unsubscribeMouseUp();
                if (IS_TOUCH_DEVICE) {
                    unsubscribeTouchEnd();
                    unsubscribeTouchCancel();
                }
            };
        }).pipe(share());
    }
    static getInstance(renderer, zone) {
        if (!PointerEventListeners.instance) {
            PointerEventListeners.instance = new PointerEventListeners(renderer, zone);
        }
        return PointerEventListeners.instance;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItcmVzaXphYmxlLWVsZW1lbnQvc3JjL2xpYi9yZXNpemFibGUuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBSVQsTUFBTSxFQUNOLEtBQUssRUFDTCxZQUFZLEVBR1osTUFBTSxFQUNOLFdBQVcsR0FDWixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBWSxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDNUQsT0FBTyxFQUNMLEdBQUcsRUFDSCxRQUFRLEVBQ1IsU0FBUyxFQUNULE1BQU0sRUFDTixRQUFRLEVBQ1IsSUFBSSxFQUNKLEtBQUssRUFDTCxHQUFHLEdBQ0osTUFBTSxnQkFBZ0IsQ0FBQztBQUt4QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDekQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDOztBQWFsRCxTQUFTLHVCQUF1QixDQUM5QixZQUErQixFQUMvQixLQUFZLEVBQ1osT0FBZSxFQUNmLE9BQWU7SUFFZixNQUFNLGVBQWUsR0FBc0I7UUFDekMsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHO1FBQ3JCLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTTtRQUMzQixJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUk7UUFDdkIsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLO0tBQzFCLENBQUM7SUFFRixJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUU7UUFDYixlQUFlLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQztLQUNoQztJQUNELElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNoQixlQUFl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O1FBQ0QsT0FBTyxxQkFBcUIsQ0FBQyxRQUFRLENBQUM7SUFDeEMsQ0FBQztDQStJRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgRGlyZWN0aXZlLFxyXG4gIFJlbmRlcmVyMixcclxuICBFbGVtZW50UmVmLFxyXG4gIE9uSW5pdCxcclxuICBPdXRwdXQsXHJcbiAgSW5wdXQsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIE9uRGVzdHJveSxcclxuICBOZ1pvbmUsXHJcbiAgSW5qZWN0LFxyXG4gIFBMQVRGT1JNX0lELFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBpc1BsYXRmb3JtQnJvd3NlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUsIE9ic2VydmVyLCBtZXJnZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge1xyXG4gIG1hcCxcclxuICBtZXJnZU1hcCxcclxuICB0YWtlVW50aWwsXHJcbiAgZmlsdGVyLFxyXG4gIHBhaXJ3aXNlLFxyXG4gIHRha2UsXHJcbiAgc2hhcmUsXHJcbiAgdGFwLFxyXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgRWRnZXMgfSBmcm9tICcuL2ludGVyZmFjZXMvZWRnZXMuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQm91bmRpbmdSZWN0YW5nbGUgfSBmcm9tICcuL2ludGVyZmFjZXMvYm91bmRpbmctcmVjdGFuZ2xlLmludGVyZmFjZSc7XHJcbmltcG9ydCB7IENsaWNrRXZlbnQgfSBmcm9tICcuL2ludGVyZmFjZXMvY2xpY2stZXZlbnQuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgUmVzaXplRXZlbnQgfSBmcm9tICcuL2ludGVyZmFjZXMvcmVzaXplLWV2ZW50LmludGVyZmFjZSc7XHJcbmltcG9ydCB7IElTX1RPVUNIX0RFVklDRSB9IGZyb20gJy4vdXRpbC9pcy10b3VjaC1kZXZpY2UnO1xyXG5pbXBvcnQgeyBkZWVwQ2xvbmVOb2RlIH0gZnJvbSAnLi91dGlsL2Nsb25lLW5vZGUnO1xyXG5cclxuaW50ZXJmYWNlIFBvaW50ZXJFdmVudENvb3JkaW5hdGUge1xyXG4gIGNsaWVudFg6IG51bWJlcjtcclxuICBjbGllbnRZOiBudW1iZXI7XHJcbiAgZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ29vcmRpbmF0ZSB7XHJcbiAgeDogbnVtYmVyO1xyXG4gIHk6IG51bWJlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmV3Qm91bmRpbmdSZWN0YW5nbGUoXHJcbiAgc3RhcnRpbmdSZWN0OiBCb3VuZGluZ1JlY3RhbmdsZSxcclxuICBlZGdlczogRWRnZXMsXHJcbiAgY2xpZW50WDogbnVtYmVyLFxyXG4gIGNsaWVudFk6IG51bWJlclxyXG4pOiBCb3VuZGluZ1JlY3RhbmdsZSB7XHJcbiAgY29uc3QgbmV3Qm91bmRpbmdSZWN0OiBCb3VuZGluZ1JlY3RhbmdsZSA9IHtcclxuICAgIHRvcDogc3RhcnRpbmdSZWN0LnRvcCxcclxuICAgIGJvdHRvbTogc3RhcnRpbmdSZWN0LmJvdHRvbSxcclxuICAgIGxlZnQ6IHN0YXJ0aW5nUmVjdC5sZWZ0LFxyXG4gICAgcmlnaHQ6IHN0YXJ0aW5nUmVjdC5yaWdodCxcclxuICB9O1xyXG5cclxuICBpZiAoZWRnZXMudG9wKSB7XHJcbiAgICBuZXdCb3VuZGluZ1JlY3QudG9wICs9IGNsaWVudFk7XHJcbiAgfVxyXG4gIGlmIChlZGdlcy5ib3R0b20pIHtcclxuICAgIG5ld0JvdW5kaW5nUmVjdC5ib3R0b20gKz0gY2xpZW50WTtcclxuICB9XHJcbiAgaWYgKGVkZ2VzLmxlZnQpIHtcclxuICAgIG5ld0JvdW5kaW5nUmVjdC5sZWZ0ICs9IGNsaWVudFg7XHJcbiAgfVxyXG4gIGlmIChlZGdlcy5yaWdodCkge1xyXG4gICAgbmV3Qm91bmRpbmdSZWN0LnJpZ2h0ICs9IGNsaWVudFg7XHJcbiAgfVxyXG4gIG5ld0JvdW5kaW5nUmVjdC5oZWlnaHQgPSBuZXdCb3VuZGluZ1JlY3QuYm90dG9tIC0gbmV3Qm91bmRpbmdSZWN0LnRvcDtcclxuICBuZXdCb3VuZGluZ1JlY3Qud2lkdGggPSBuZXdCb3VuZGluZ1JlY3QucmlnaHQgLSBuZXdCb3VuZGluZ1JlY3QubGVmdDtcclxuXHJcbiAgcmV0dXJuIG5ld0JvdW5kaW5nUmVjdDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RWxlbWVudFJlY3QoXHJcbiAgZWxlbWVudDogRWxlbWVudFJlZixcclxuICBnaG9zdEVsZW1lbnRQb3NpdGlvbmluZzogc3RyaW5nXHJcbik6IEJvdW5kaW5nUmVjdGFuZ2xlIHtcclxuICBsZXQgdHJhbnNsYXRlWCA9IDA7XHJcbiAgbGV0IHRyYW5zbGF0ZVkgPSAwO1xyXG4gIGNvbnN0IHN0eWxlID0gZWxlbWVudC5uYXRpdmVFbGVtZW50LnN0eWxlO1xyXG4gIGNvbnN0IHRyYW5zZm9ybVByb3BlcnRpZXMgPSBbXHJcbiAgICAndHJhbnNmb3JtJyxcclxuICAgICctbXMtdHJhbnNmb3JtJyxcclxuICAgICctbW96LXRyYW5zZm9ybScsXHJcbiAgICAnLW8tdHJhbnNmb3JtJyxcclxuICBdO1xyXG4gIGNvbnN0IHRyYW5zZm9ybSA9IHRyYW5zZm9ybVByb3BlcnRpZXNcclxuICAgIC5tYXAoKHByb3BlcnR5KSA9PiBzdHlsZVtwcm9wZXJ0eV0pXHJcbiAgICAuZmluZCgodmFsdWUpID0+ICEhdmFsdWUpO1xyXG4gIGlmICh0cmFuc2Zvcm0gJiYgdHJhbnNmb3JtLmluY2x1ZGVzKCd0cmFuc2xhdGUnKSkge1xyXG4gICAgdHJhbnNsYXRlWCA9IHRyYW5zZm9ybS5yZXBsYWNlKFxyXG4gICAgICAvLip0cmFuc2xhdGUzP2Q/XFwoKC0/WzAtOV0qKXB4LCAoLT9bMC05XSopcHguKi8sXHJcbiAgICAgICckMSdcclxuICAgICk7XHJcbiAgICB0cmFuc2xhdGVZID0gdHJhbnNmb3JtLnJlcGxhY2UoXHJcbiAgICAgIC8uKnRyYW5zbGF0ZTM/ZD9cXCgoLT9bMC05XSopcHgsICgtP1swLTldKilweC4qLyxcclxuICAgICAgJyQyJ1xyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGlmIChnaG9zdEVsZW1lbnRQb3NpdGlvbmluZyA9PT0gJ2Fic29sdXRlJykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaGVpZ2h0OiBlbGVtZW50Lm5hdGl2ZUVsZW1lbnQub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICB3aWR0aDogZWxlbWVudC5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoLFxyXG4gICAgICB0b3A6IGVsZW1lbnQubmF0aXZlRWxlbWVudC5vZmZzZXRUb3AgLSB0cmFuc2xhdGVZLFxyXG4gICAgICBib3R0b206XHJcbiAgICAgICAgZWxlbWVudC5uYXRpdmVFbGVtZW50Lm9mZnNldEhlaWdodCArXHJcbiAgICAgICAgZWxlbWVudC5uYXRpdmVFbGVtZW50Lm9mZnNldFRvcCAtXHJcbiAgICAgICAgdHJhbnNsYXRlWSxcclxuICAgICAgbGVmdDogZWxlbWVudC5uYXRpdmVFbGVtZW50Lm9mZnNldExlZnQgLSB0cmFuc2xhdGVYLFxyXG4gICAgICByaWdodDpcclxuICAgICAgICBlbGVtZW50Lm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggK1xyXG4gICAgICAgIGVsZW1lbnQubmF0aXZlRWxlbWVudC5vZmZzZXRMZWZ0IC1cclxuICAgICAgICB0cmFuc2xhdGVYLFxyXG4gICAgfTtcclxuICB9IGVsc2Uge1xyXG4gICAgY29uc3QgYm91bmRpbmdSZWN0OiBCb3VuZGluZ1JlY3RhbmdsZSA9XHJcbiAgICAgIGVsZW1lbnQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGhlaWdodDogYm91bmRpbmdSZWN0LmhlaWdodCxcclxuICAgICAgd2lkdGg6IGJvdW5kaW5nUmVjdC53aWR0aCxcclxuICAgICAgdG9wOiBib3VuZGluZ1JlY3QudG9wIC0gdHJhbnNsYXRlWSxcclxuICAgICAgYm90dG9tOiBib3VuZGluZ1JlY3QuYm90dG9tIC0gdHJhbnNsYXRlWSxcclxuICAgICAgbGVmdDogYm91bmRpbmdSZWN0LmxlZnQgLSB0cmFuc2xhdGVYLFxyXG4gICAgICByaWdodDogYm91bmRpbmdSZWN0LnJpZ2h0IC0gdHJhbnNsYXRlWCxcclxuICAgICAgc2Nyb2xsVG9wOiBlbGVtZW50Lm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wLFxyXG4gICAgICBzY3JvbGxMZWZ0OiBlbGVtZW50Lm5hdGl2ZUVsZW1lbnQuc2Nyb2xsTGVmdCxcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlc2l6ZUN1cnNvcnMge1xyXG4gIHRvcExlZnQ6IHN0cmluZztcclxuICB0b3BSaWdodDogc3RyaW5nO1xyXG4gIGJvdHRvbUxlZnQ6IHN0cmluZztcclxuICBib3R0b21SaWdodDogc3RyaW5nO1xyXG4gIGxlZnRPclJpZ2h0OiBzdHJpbmc7XHJcbiAgdG9wT3JCb3R0b206IHN0cmluZztcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9SRVNJWkVfQ1VSU09SUzogUmVzaXplQ3Vyc29ycyA9IE9iamVjdC5mcmVlemUoe1xyXG4gIHRvcExlZnQ6ICdudy1yZXNpemUnLFxyXG4gIHRvcFJpZ2h0OiAnbmUtcmVzaXplJyxcclxuICBib3R0b21MZWZ0OiAnc3ctcmVzaXplJyxcclxuICBib3R0b21SaWdodDogJ3NlLXJlc2l6ZScsXHJcbiAgbGVmdE9yUmlnaHQ6ICdjb2wtcmVzaXplJyxcclxuICB0b3BPckJvdHRvbTogJ3Jvdy1yZXNpemUnLFxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGdldFJlc2l6ZUN1cnNvcihlZGdlczogRWRnZXMsIGN1cnNvcnM6IFJlc2l6ZUN1cnNvcnMpOiBzdHJpbmcge1xyXG4gIGlmIChlZGdlcy5sZWZ0ICYmIGVkZ2VzLnRvcCkge1xyXG4gICAgcmV0dXJuIGN1cnNvcnMudG9wTGVmdDtcclxuICB9IGVsc2UgaWYgKGVkZ2VzLnJpZ2h0ICYmIGVkZ2VzLnRvcCkge1xyXG4gICAgcmV0dXJuIGN1cnNvcnMudG9wUmlnaHQ7XHJcbiAgfSBlbHNlIGlmIChlZGdlcy5sZWZ0ICYmIGVkZ2VzLmJvdHRvbSkge1xyXG4gICAgcmV0dXJuIGN1cnNvcnMuYm90dG9tTGVmdDtcclxuICB9IGVsc2UgaWYgKGVkZ2VzLnJpZ2h0ICYmIGVkZ2VzLmJvdHRvbSkge1xyXG4gICAgcmV0dXJuIGN1cnNvcnMuYm90dG9tUmlnaHQ7XHJcbiAgfSBlbHNlIGlmIChlZGdlcy5sZWZ0IHx8IGVkZ2VzLnJpZ2h0KSB7XHJcbiAgICByZXR1cm4gY3Vyc29ycy5sZWZ0T3JSaWdodDtcclxuICB9IGVsc2UgaWYgKGVkZ2VzLnRvcCB8fCBlZGdlcy5ib3R0b20pIHtcclxuICAgIHJldHVybiBjdXJzb3JzLnRvcE9yQm90dG9tO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBFZGdlc0RpZmYgPSB7XHJcbiAgW1Byb3BlcnR5IGluIGtleW9mIEVkZ2VzXTogRXhjbHVkZTxFZGdlc1tQcm9wZXJ0eV0sIGJvb2xlYW4+O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZ2V0RWRnZXNEaWZmKHtcclxuICBlZGdlcyxcclxuICBpbml0aWFsUmVjdGFuZ2xlLFxyXG4gIG5ld1JlY3RhbmdsZSxcclxufToge1xyXG4gIGVkZ2VzOiBFZGdlcztcclxuICBpbml0aWFsUmVjdGFuZ2xlOiBCb3VuZGluZ1JlY3RhbmdsZTtcclxuICBuZXdSZWN0YW5nbGU6IEJvdW5kaW5nUmVjdGFuZ2xlO1xyXG59KTogRWRnZXNEaWZmIHtcclxuICBjb25zdCBlZGdlc0RpZmY6IEVkZ2VzRGlmZiA9IHt9O1xyXG4gIE9iamVjdC5rZXlzKGVkZ2VzKS5mb3JFYWNoKChlZGdlKSA9PiB7XHJcbiAgICBlZGdlc0RpZmZbZWRnZV0gPSAobmV3UmVjdGFuZ2xlW2VkZ2VdIHx8IDApIC0gKGluaXRpYWxSZWN0YW5nbGVbZWRnZV0gfHwgMCk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGVkZ2VzRGlmZjtcclxufVxyXG5cclxuY29uc3QgZ2V0VG90YWxEaWZmID0gKGVkZ2VzRGlmZjogRWRnZXNEaWZmKSA9PlxyXG4gIE9iamVjdC52YWx1ZXMoZWRnZXNEaWZmKVxyXG4gICAgLm1hcCgoZWRnZSkgPT4gTWF0aC5hYnMoZWRnZSB8fCAwKSlcclxuICAgIC5yZWR1Y2UoKGEsIGIpID0+IE1hdGgubWF4KGEsIGIpLCAwKTtcclxuXHJcbmNvbnN0IFJFU0laRV9BQ1RJVkVfQ0xBU1M6IHN0cmluZyA9ICdyZXNpemUtYWN0aXZlJztcclxuY29uc3QgUkVTSVpFX0dIT1NUX0VMRU1FTlRfQ0xBU1M6IHN0cmluZyA9ICdyZXNpemUtZ2hvc3QtZWxlbWVudCc7XHJcblxyXG5leHBvcnQgY29uc3QgTU9VU0VfTU9WRV9USFJPVFRMRV9NUzogbnVtYmVyID0gNTA7XHJcblxyXG5leHBvcnQgY29uc3QgRElTQUJMRV9DTElDS19NT1ZFX1RIUkVTSE9MRDogbnVtYmVyID0gMDtcclxuXHJcbi8qKlxyXG4gKiBQbGFjZSB0aGlzIG9uIGFuIGVsZW1lbnQgdG8gbWFrZSBpdCByZXNpemFibGUuIEZvciBleGFtcGxlOlxyXG4gKlxyXG4gKiBgYGBodG1sXHJcbiAqIDxkaXZcclxuICogICBtd2xSZXNpemFibGVcclxuICogICBbcmVzaXplRWRnZXNdPVwie2JvdHRvbTogdHJ1ZSwgcmlnaHQ6IHRydWUsIHRvcDogdHJ1ZSwgbGVmdDogdHJ1ZX1cIlxyXG4gKiAgIFtlbmFibGVHaG9zdFJlc2l6ZV09XCJ0cnVlXCI+XHJcbiAqIDwvZGl2PlxyXG4gKiBgYGBcclxuICogT3IgaW4gY2FzZSB0aGV5IGFyZSBzaWJsaW5nIGVsZW1lbnRzOlxyXG4gKiBgYGBodG1sXHJcbiAqIDxkaXYgbXdsUmVzaXphYmxlICNyZXNpemFibGVFbGVtZW50PVwibXdsUmVzaXphYmxlXCI+PC9kaXY+XHJcbiAqIDxkaXYgbXdsUmVzaXplSGFuZGxlIFtyZXNpemFibGVDb250YWluZXJdPVwicmVzaXphYmxlRWxlbWVudFwiIFtyZXNpemVFZGdlc109XCJ7Ym90dG9tOiB0cnVlLCByaWdodDogdHJ1ZX1cIj48L2Rpdj5cclxuICogYGBgXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1ttd2xSZXNpemFibGVdJyxcclxuICBleHBvcnRBczogJ213bFJlc2l6YWJsZScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBSZXNpemFibGVEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgLyoqXHJcbiAgICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBlYWNoIHJlc2l6ZSBldmVudC4gUmV0dXJuIGB0cnVlYCB0byBhbGxvdyB0aGUgcmVzaXplIGV2ZW50IHRvIHByb3BhZ2F0ZSBvciBgZmFsc2VgIHRvIGNhbmNlbCBpdFxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIHZhbGlkYXRlUmVzaXplOiAocmVzaXplRXZlbnQ6IFJlc2l6ZUV2ZW50KSA9PiBib29sZWFuO1xyXG5cclxuICAvKipcclxuICAgKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBhIHRlbXBvcmFyeSByZXNpemluZyBlZmZlY3Qgb2YgdGhlIGVsZW1lbnQgaW4gYmV0d2VlbiB0aGUgYHJlc2l6ZVN0YXJ0YCBhbmQgYHJlc2l6ZUVuZGAgZXZlbnRzLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGVuYWJsZUdob3N0UmVzaXplOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgc25hcCBncmlkIHRoYXQgcmVzaXplIGV2ZW50cyB3aWxsIGJlIGxvY2tlZCB0by5cclxuICAgKlxyXG4gICAqIGUuZy4gdG8gb25seSBhbGxvdyB0aGUgZWxlbWVudCB0byBiZSByZXNpemVkIGV2ZXJ5IDEwcHggc2V0IGl0IHRvIGB7bGVmdDogMTAsIHJpZ2h0OiAxMH1gXHJcbiAgICovXHJcbiAgQElucHV0KCkgcmVzaXplU25hcEdyaWQ6IEVkZ2VzID0ge307XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBtb3VzZSBjdXJzb3JzIHRoYXQgd2lsbCBiZSBzZXQgb24gdGhlIHJlc2l6ZSBlZGdlc1xyXG4gICAqL1xyXG4gIEBJbnB1dCgpIHJlc2l6ZUN1cnNvcnM6IFJlc2l6ZUN1cnNvcnMgPSBERUZBVUxUX1JFU0laRV9DVVJTT1JTO1xyXG5cclxuICAvKipcclxuICAgKiBEZWZpbmUgdGhlIHBvc2l0aW9uaW5nIG9mIHRoZSBnaG9zdCBlbGVtZW50IChjYW4gYmUgZml4ZWQgb3IgYWJzb2x1dGUpXHJcbiAgICovXHJcbiAgQElucHV0KCkgZ2hvc3RFbGVtZW50UG9zaXRpb25pbmc6ICdmaXhlZCcgfCAnYWJzb2x1dGUnID0gJ2ZpeGVkJztcclxuXHJcbiAgLyoqXHJcbiAgICogQWxsb3cgZWxlbWVudHMgdG8gYmUgcmVzaXplZCB0byBuZWdhdGl2ZSBkaW1lbnNpb25zXHJcbiAgICovXHJcbiAgQElucHV0KCkgYWxsb3dOZWdhdGl2ZVJlc2l6ZXM6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIG1vdXNlIG1vdmUgdGhyb3R0bGUgaW4gbWlsbGlzZWNvbmRzLCBkZWZhdWx0OiA1MCBtc1xyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG1vdXNlTW92ZVRocm90dGxlTVM6IG51bWJlciA9IE1PVVNFX01PVkVfVEhST1RUTEVfTVM7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkaXN0YW5jZSBpbiBwaXhlbHMgdGhhdCB0aGUgbW91c2UgbXVzdCBtb3ZlIHRvIHRyaWdnZXIgYSByZXNpemUgZXZlbnQsIDw9IDAgdG8gZGlzYWJsZSAoZGVmYXVsdClcclxuICAgKlxyXG4gICAqIEJlbG93IHRoaXMgdGhyZXNob2xkLCBhIGNsaWNrIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCBpbnN0ZWFkXHJcbiAgICovXHJcbiAgQElucHV0KCkgcmVzaXplTW92ZVRocmVzaG9sZDogbnVtYmVyID0gRElTQUJMRV9DTElDS19NT1ZFX1RIUkVTSE9MRDtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG1vdXNlIGlzIHByZXNzZWQgYW5kIGEgcmVzaXplIGV2ZW50IGlzIGFib3V0IHRvIGJlZ2luLiBgJGV2ZW50YCBpcyBhIGBSZXNpemVFdmVudGAgb2JqZWN0LlxyXG4gICAqL1xyXG4gIEBPdXRwdXQoKSByZXNpemVTdGFydCA9IG5ldyBFdmVudEVtaXR0ZXI8UmVzaXplRXZlbnQ+KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBhcyB0aGUgbW91c2UgaXMgZHJhZ2dlZCBhZnRlciBhIHJlc2l6ZSBldmVudCBoYXMgYmVndW4uIGAkZXZlbnRgIGlzIGEgYFJlc2l6ZUV2ZW50YCBvYmplY3QuXHJcbiAgICovXHJcbiAgQE91dHB1dCgpIHJlc2l6aW5nID0gbmV3IEV2ZW50RW1pdHRlcjxSZXNpemVFdmVudD4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGFmdGVyIHRoZSBtb3VzZSBpcyByZWxlYXNlZCBhZnRlciBhIHJlc2l6ZSBldmVudC4gYCRldmVudGAgaXMgYSBgUmVzaXplRXZlbnRgIG9iamVjdC5cclxuICAgKi9cclxuICBAT3V0cHV0KCkgcmVzaXplRW5kID0gbmV3IEV2ZW50RW1pdHRlcjxSZXNpemVFdmVudD4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGFmdGVyIHRoZSBtb3VzZSBpcyByZWxlYXNlZCBhZnRlciBhIGNsaWNrIGV2ZW50LiBgJGV2ZW50YCBpcyBhIGBDbGlja0V2ZW50YCBvYmplY3QuXHJcbiAgICovXHJcbiAgQE91dHB1dCgpIGNsaWNrZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENsaWNrRXZlbnQ+KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBoaWRkZW5cclxuICAgKi9cclxuICBwdWJsaWMgbW91c2V1cCA9IG5ldyBTdWJqZWN0PHtcclxuICAgIGNsaWVudFg6IG51bWJlcjtcclxuICAgIGNsaWVudFk6IG51bWJlcjtcclxuICAgIGVkZ2VzPzogRWRnZXM7XHJcbiAgfT4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGhpZGRlblxyXG4gICAqL1xyXG4gIHB1YmxpYyBtb3VzZWRvd24gPSBuZXcgU3ViamVjdDx7XHJcbiAgICBjbGllbnRYOiBudW1iZXI7XHJcbiAgICBjbGllbnRZOiBudW1iZXI7XHJcbiAgICBlZGdlcz86IEVkZ2VzO1xyXG4gIH0+KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBoaWRkZW5cclxuICAgKi9cclxuICBwdWJsaWMgbW91c2Vtb3ZlID0gbmV3IFN1YmplY3Q8e1xyXG4gICAgY2xpZW50WDogbnVtYmVyO1xyXG4gICAgY2xpZW50WTogbnVtYmVyO1xyXG4gICAgZWRnZXM/OiBFZGdlcztcclxuICAgIGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudDtcclxuICB9PigpO1xyXG5cclxuICBwcml2YXRlIHBvaW50ZXJFdmVudExpc3RlbmVyczogUG9pbnRlckV2ZW50TGlzdGVuZXJzO1xyXG5cclxuICBwcml2YXRlIGRlc3Ryb3kkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQGhpZGRlblxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgQEluamVjdChQTEFURk9STV9JRCkgcHJpdmF0ZSBwbGF0Zm9ybUlkOiBhbnksXHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXHJcbiAgICBwdWJsaWMgZWxtOiBFbGVtZW50UmVmLFxyXG4gICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmVcclxuICApIHtcclxuICAgIHRoaXMucG9pbnRlckV2ZW50TGlzdGVuZXJzID0gUG9pbnRlckV2ZW50TGlzdGVuZXJzLmdldEluc3RhbmNlKFxyXG4gICAgICByZW5kZXJlcixcclxuICAgICAgem9uZVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBoaWRkZW5cclxuICAgKi9cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IG1vdXNlZG93biQ6IE9ic2VydmFibGU8e1xyXG4gICAgICBjbGllbnRYOiBudW1iZXI7XHJcbiAgICAgIGNsaWVudFk6IG51bWJlcjtcclxuICAgICAgZWRnZXM/OiBFZGdlcztcclxuICAgIH0+ID0gbWVyZ2UodGhpcy5wb2ludGVyRXZlbnRMaXN0ZW5lcnMucG9pbnRlckRvd24sIHRoaXMubW91c2Vkb3duKTtcclxuXHJcbiAgICBjb25zdCBtb3VzZW1vdmUkID0gbWVyZ2UoXHJcbiAgICAgIHRoaXMucG9pbnRlckV2ZW50TGlzdGVuZXJzLnBvaW50ZXJNb3ZlLFxyXG4gICAgICB0aGlzLm1vdXNlbW92ZVxyXG4gICAgKS5waXBlKFxyXG4gICAgICB0YXAoKHsgZXZlbnQgfSkgPT4ge1xyXG4gICAgICAgIGlmIChjdXJyZW50UmVzaXplKSB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAvLyBqdXN0IGFkZGluZyB0cnktY2F0Y2ggbm90IHRvIHNlZSBlcnJvcnMgaW4gY29uc29sZSBpZiB0aGVyZSBpcyBhIHBhc3NpdmUgbGlzdGVuZXIgZm9yIHNhbWUgZXZlbnQgc29tZXdoZXJlXHJcbiAgICAgICAgICAgIC8vIGJyb3dzZXIgZG9lcyBub3RoaW5nIGV4Y2VwdCBvZiB3cml0aW5nIGVycm9ycyB0byBjb25zb2xlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KSxcclxuICAgICAgc2hhcmUoKVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBtb3VzZXVwJCA9IG1lcmdlKHRoaXMucG9pbnRlckV2ZW50TGlzdGVuZXJzLnBvaW50ZXJVcCwgdGhpcy5tb3VzZXVwKTtcclxuXHJcbiAgICBsZXQgY3VycmVudFJlc2l6ZToge1xyXG4gICAgICBlZGdlczogRWRnZXM7XHJcbiAgICAgIHN0YXJ0aW5nUmVjdDogQm91bmRpbmdSZWN0YW5nbGU7XHJcbiAgICAgIGN1cnJlbnRSZWN0OiBCb3VuZGluZ1JlY3RhbmdsZTtcclxuICAgICAgY2xvbmVkTm9kZT86IEhUTUxFbGVtZW50O1xyXG4gICAgICB2aXNpYmxlOiBib29sZWFuO1xyXG4gICAgfSB8IG51bGw7XHJcblxyXG4gICAgY29uc3QgcmVtb3ZlR2hvc3RFbGVtZW50ID0gKCkgPT4ge1xyXG4gICAgICBpZiAoY3VycmVudFJlc2l6ZSAmJiBjdXJyZW50UmVzaXplLmNsb25lZE5vZGUpIHtcclxuICAgICAgICB0aGlzLmVsbS5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoXHJcbiAgICAgICAgICBjdXJyZW50UmVzaXplLmNsb25lZE5vZGVcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbG0ubmF0aXZlRWxlbWVudCwgJ3Zpc2liaWxpdHknLCAnaW5oZXJpdCcpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGdldFJlc2l6ZUN1cnNvcnMgPSAoKTogUmVzaXplQ3Vyc29ycyA9PiB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgLi4uREVGQVVMVF9SRVNJWkVfQ1VSU09SUyxcclxuICAgICAgICAuLi50aGlzLnJlc2l6ZUN1cnNvcnMsXHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0VmlzaWJsZVJlc2l6ZSA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgY3VycmVudFJlc2l6ZSEudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIGNvbnN0IHJlc2l6ZUN1cnNvcnMgPSBnZXRSZXNpemVDdXJzb3JzKCk7XHJcbiAgICAgIGNvbnN0IGN1cnNvciA9IGdldFJlc2l6ZUN1cnNvcihjdXJyZW50UmVzaXplIS5lZGdlcywgcmVzaXplQ3Vyc29ycyk7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoZG9jdW1lbnQuYm9keSwgJ2N1cnNvcicsIGN1cnNvcik7XHJcbiAgICAgIHRoaXMuc2V0RWxlbWVudENsYXNzKHRoaXMuZWxtLCBSRVNJWkVfQUNUSVZFX0NMQVNTLCB0cnVlKTtcclxuICAgICAgaWYgKHRoaXMuZW5hYmxlR2hvc3RSZXNpemUpIHtcclxuICAgICAgICBjdXJyZW50UmVzaXplIS5jbG9uZWROb2RlID0gZGVlcENsb25lTm9kZSh0aGlzLmVsbS5uYXRpdmVFbGVtZW50KTtcclxuICAgICAgICB0aGlzLmVsbS5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICBjdXJyZW50UmVzaXplIS5jbG9uZWROb2RlXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWxtLm5hdGl2ZUVsZW1lbnQsICd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAgICAgICBjdXJyZW50UmVzaXplIS5jbG9uZWROb2RlLFxyXG4gICAgICAgICAgJ3Bvc2l0aW9uJyxcclxuICAgICAgICAgIHRoaXMuZ2hvc3RFbGVtZW50UG9zaXRpb25pbmdcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAgICAgICBjdXJyZW50UmVzaXplIS5jbG9uZWROb2RlLFxyXG4gICAgICAgICAgJ2xlZnQnLFxyXG4gICAgICAgICAgYCR7Y3VycmVudFJlc2l6ZSEuc3RhcnRpbmdSZWN0LmxlZnR9cHhgXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKFxyXG4gICAgICAgICAgY3VycmVudFJlc2l6ZSEuY2xvbmVkTm9kZSxcclxuICAgICAgICAgICd0b3AnLFxyXG4gICAgICAgICAgYCR7Y3VycmVudFJlc2l6ZSEuc3RhcnRpbmdSZWN0LnRvcH1weGBcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAgICAgICBjdXJyZW50UmVzaXplIS5jbG9uZWROb2RlLFxyXG4gICAgICAgICAgJ2hlaWdodCcsXHJcbiAgICAgICAgICBgJHtjdXJyZW50UmVzaXplIS5zdGFydGluZ1JlY3QuaGVpZ2h0fXB4YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShcclxuICAgICAgICAgIGN1cnJlbnRSZXNpemUhLmNsb25lZE5vZGUsXHJcbiAgICAgICAgICAnd2lkdGgnLFxyXG4gICAgICAgICAgYCR7Y3VycmVudFJlc2l6ZSEuc3RhcnRpbmdSZWN0LndpZHRofXB4YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShcclxuICAgICAgICAgIGN1cnJlbnRSZXNpemUhLmNsb25lZE5vZGUsXHJcbiAgICAgICAgICAnY3Vyc29yJyxcclxuICAgICAgICAgIGdldFJlc2l6ZUN1cnNvcihjdXJyZW50UmVzaXplIS5lZGdlcywgcmVzaXplQ3Vyc29ycylcclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3MoXHJcbiAgICAgICAgICBjdXJyZW50UmVzaXplIS5jbG9uZWROb2RlLFxyXG4gICAgICAgICAgUkVTSVpFX0dIT1NUX0VMRU1FTlRfQ0xBU1NcclxuICAgICAgICApO1xyXG4gICAgICAgIGN1cnJlbnRSZXNpemUhLmNsb25lZE5vZGUhLnNjcm9sbFRvcCA9IGN1cnJlbnRSZXNpemUhLnN0YXJ0aW5nUmVjdFxyXG4gICAgICAgICAgLnNjcm9sbFRvcCBhcyBudW1iZXI7XHJcbiAgICAgICAgY3VycmVudFJlc2l6ZSEuY2xvbmVkTm9kZSEuc2Nyb2xsTGVmdCA9IGN1cnJlbnRSZXNpemUhLnN0YXJ0aW5nUmVjdFxyXG4gICAgICAgICAgLnNjcm9sbExlZnQgYXMgbnVtYmVyO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnJlc2l6ZVN0YXJ0Lm9ic2VydmVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlc2l6ZVN0YXJ0LmVtaXQoe1xyXG4gICAgICAgICAgICBlZGdlczogZ2V0RWRnZXNEaWZmKHtcclxuICAgICAgICAgICAgICBlZGdlczogY3VycmVudFJlc2l6ZSEuZWRnZXMsXHJcbiAgICAgICAgICAgICAgaW5pdGlhbFJlY3RhbmdsZTogY3VycmVudFJlc2l6ZSEuc3RhcnRpbmdSZWN0LFxyXG4gICAgICAgICAgICAgIG5ld1JlY3RhbmdsZTogY3VycmVudFJlc2l6ZSEuc3RhcnRpbmdSZWN0LFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgcmVjdGFuZ2xlOiBnZXROZXdCb3VuZGluZ1JlY3RhbmdsZShcclxuICAgICAgICAgICAgICBjdXJyZW50UmVzaXplIS5zdGFydGluZ1JlY3QsXHJcbiAgICAgICAgICAgICAge30sXHJcbiAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAwXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBtb3VzZWRyYWc6IE9ic2VydmFibGU8YW55PiA9IG1vdXNlZG93biRcclxuICAgICAgLnBpcGUoXHJcbiAgICAgICAgbWVyZ2VNYXAoKHN0YXJ0Q29vcmRzKSA9PiB7XHJcbiAgICAgICAgICBmdW5jdGlvbiBnZXREaWZmKG1vdmVDb29yZHM6IHsgY2xpZW50WDogbnVtYmVyOyBjbGllbnRZOiBudW1iZXIgfSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIGNsaWVudFg6IG1vdmVDb29yZHMuY2xpZW50WCAtIHN0YXJ0Q29vcmRzLmNsaWVudFgsXHJcbiAgICAgICAgICAgICAgY2xpZW50WTogbW92ZUNvb3Jkcy5jbGllbnRZIC0gc3RhcnRDb29yZHMuY2xpZW50WSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBnZXRTbmFwR3JpZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc25hcEdyaWQ6IENvb3JkaW5hdGUgPSB7IHg6IDEsIHk6IDEgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UmVzaXplKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMucmVzaXplU25hcEdyaWQubGVmdCAmJiBjdXJyZW50UmVzaXplLmVkZ2VzLmxlZnQpIHtcclxuICAgICAgICAgICAgICAgIHNuYXBHcmlkLnggPSArdGhpcy5yZXNpemVTbmFwR3JpZC5sZWZ0O1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZVNuYXBHcmlkLnJpZ2h0ICYmXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVzaXplLmVkZ2VzLnJpZ2h0XHJcbiAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBzbmFwR3JpZC54ID0gK3RoaXMucmVzaXplU25hcEdyaWQucmlnaHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAodGhpcy5yZXNpemVTbmFwR3JpZC50b3AgJiYgY3VycmVudFJlc2l6ZS5lZGdlcy50b3ApIHtcclxuICAgICAgICAgICAgICAgIHNuYXBHcmlkLnkgPSArdGhpcy5yZXNpemVTbmFwR3JpZC50b3A7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzaXplU25hcEdyaWQuYm90dG9tICYmXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVzaXplLmVkZ2VzLmJvdHRvbVxyXG4gICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgc25hcEdyaWQueSA9ICt0aGlzLnJlc2l6ZVNuYXBHcmlkLmJvdHRvbTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzbmFwR3JpZDtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgZnVuY3Rpb24gZ2V0R3JpZChcclxuICAgICAgICAgICAgY29vcmRzOiB7IGNsaWVudFg6IG51bWJlcjsgY2xpZW50WTogbnVtYmVyIH0sXHJcbiAgICAgICAgICAgIHNuYXBHcmlkOiBDb29yZGluYXRlXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICB4OiBNYXRoLmNlaWwoY29vcmRzLmNsaWVudFggLyBzbmFwR3JpZC54KSxcclxuICAgICAgICAgICAgICB5OiBNYXRoLmNlaWwoY29vcmRzLmNsaWVudFkgLyBzbmFwR3JpZC55KSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBtZXJnZShcclxuICAgICAgICAgICAgICBtb3VzZW1vdmUkLnBpcGUodGFrZSgxKSkucGlwZShtYXAoKGNvb3JkcykgPT4gWywgY29vcmRzXSkpLFxyXG4gICAgICAgICAgICAgIG1vdXNlbW92ZSQucGlwZShwYWlyd2lzZSgpKVxyXG4gICAgICAgICAgICApIGFzIE9ic2VydmFibGU8XHJcbiAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgeyBjbGllbnRYOiBudW1iZXI7IGNsaWVudFk6IG51bWJlciB9LFxyXG4gICAgICAgICAgICAgICAgeyBjbGllbnRYOiBudW1iZXI7IGNsaWVudFk6IG51bWJlciB9XHJcbiAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICAgIC5waXBlKFxyXG4gICAgICAgICAgICAgIG1hcCgoW3ByZXZpb3VzQ29vcmRzLCBuZXdDb29yZHNdKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICBwcmV2aW91c0Nvb3JkcyA/IGdldERpZmYocHJldmlvdXNDb29yZHMpIDogcHJldmlvdXNDb29yZHMsXHJcbiAgICAgICAgICAgICAgICAgIGdldERpZmYobmV3Q29vcmRzKSxcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAucGlwZShcclxuICAgICAgICAgICAgICBmaWx0ZXIoKFtwcmV2aW91c0Nvb3JkcywgbmV3Q29vcmRzXSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2aW91c0Nvb3Jkcykge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzbmFwR3JpZDogQ29vcmRpbmF0ZSA9IGdldFNuYXBHcmlkKCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c0dyaWQ6IENvb3JkaW5hdGUgPSBnZXRHcmlkKFxyXG4gICAgICAgICAgICAgICAgICBwcmV2aW91c0Nvb3JkcyxcclxuICAgICAgICAgICAgICAgICAgc25hcEdyaWRcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdHcmlkOiBDb29yZGluYXRlID0gZ2V0R3JpZChuZXdDb29yZHMsIHNuYXBHcmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgICAgICBwcmV2aW91c0dyaWQueCAhPT0gbmV3R3JpZC54IHx8IHByZXZpb3VzR3JpZC55ICE9PSBuZXdHcmlkLnlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAucGlwZShcclxuICAgICAgICAgICAgICBtYXAoKFssIG5ld0Nvb3Jkc10pID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXBHcmlkOiBDb29yZGluYXRlID0gZ2V0U25hcEdyaWQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgIGNsaWVudFg6XHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5yb3VuZChuZXdDb29yZHMuY2xpZW50WCAvIHNuYXBHcmlkLngpICogc25hcEdyaWQueCxcclxuICAgICAgICAgICAgICAgICAgY2xpZW50WTpcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKG5ld0Nvb3Jkcy5jbGllbnRZIC8gc25hcEdyaWQueSkgKiBzbmFwR3JpZC55LFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIC5waXBlKHRha2VVbnRpbChtZXJnZShtb3VzZXVwJCwgbW91c2Vkb3duJCkpKTtcclxuICAgICAgICB9KVxyXG4gICAgICApXHJcbiAgICAgIC5waXBlKGZpbHRlcigoKSA9PiAhIWN1cnJlbnRSZXNpemUpKTtcclxuXHJcbiAgICBtb3VzZWRyYWdcclxuICAgICAgLnBpcGUoXHJcbiAgICAgICAgbWFwKCh7IGNsaWVudFgsIGNsaWVudFkgfSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGdldE5ld0JvdW5kaW5nUmVjdGFuZ2xlKFxyXG4gICAgICAgICAgICBjdXJyZW50UmVzaXplIS5zdGFydGluZ1JlY3QsXHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXNpemUhLmVkZ2VzLFxyXG4gICAgICAgICAgICBjbGllbnRYLFxyXG4gICAgICAgICAgICBjbGllbnRZXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIClcclxuICAgICAgLnBpcGUoXHJcbiAgICAgICAgZmlsdGVyKChuZXdCb3VuZGluZ1JlY3Q6IEJvdW5kaW5nUmVjdGFuZ2xlKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICB0aGlzLmFsbG93TmVnYXRpdmVSZXNpemVzIHx8XHJcbiAgICAgICAgICAgICEhKFxyXG4gICAgICAgICAgICAgIG5ld0JvdW5kaW5nUmVjdC5oZWlnaHQgJiZcclxuICAgICAgICAgICAgICBuZXdCb3VuZGluZ1JlY3Qud2lkdGggJiZcclxuICAgICAgICAgICAgICBuZXdCb3VuZGluZ1JlY3QuaGVpZ2h0ID4gMCAmJlxyXG4gICAgICAgICAgICAgIG5ld0JvdW5kaW5nUmVjdC53aWR0aCA+IDBcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG4gICAgICApXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIGZpbHRlcigobmV3Qm91bmRpbmdSZWN0OiBCb3VuZGluZ1JlY3RhbmdsZSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVSZXNpemVcclxuICAgICAgICAgICAgPyB0aGlzLnZhbGlkYXRlUmVzaXplKHtcclxuICAgICAgICAgICAgICAgIHJlY3RhbmdsZTogbmV3Qm91bmRpbmdSZWN0LFxyXG4gICAgICAgICAgICAgICAgZWRnZXM6IGdldEVkZ2VzRGlmZih7XHJcbiAgICAgICAgICAgICAgICAgIGVkZ2VzOiBjdXJyZW50UmVzaXplIS5lZGdlcyxcclxuICAgICAgICAgICAgICAgICAgaW5pdGlhbFJlY3RhbmdsZTogY3VycmVudFJlc2l6ZSEuc3RhcnRpbmdSZWN0LFxyXG4gICAgICAgICAgICAgICAgICBuZXdSZWN0YW5nbGU6IG5ld0JvdW5kaW5nUmVjdCxcclxuICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIDogdHJ1ZTtcclxuICAgICAgICB9KSxcclxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95JClcclxuICAgICAgKVxyXG4gICAgICAuc3Vic2NyaWJlKChuZXdCb3VuZGluZ1JlY3Q6IEJvdW5kaW5nUmVjdGFuZ2xlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZWRnZXMgPSBnZXRFZGdlc0RpZmYoe1xyXG4gICAgICAgICAgZWRnZXM6IGN1cnJlbnRSZXNpemUhLmVkZ2VzLFxyXG4gICAgICAgICAgaW5pdGlhbFJlY3RhbmdsZTogY3VycmVudFJlc2l6ZSEuc3RhcnRpbmdSZWN0LFxyXG4gICAgICAgICAgbmV3UmVjdGFuZ2xlOiBuZXdCb3VuZGluZ1JlY3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgIWN1cnJlbnRSZXNpemUhLnZpc2libGUgJiZcclxuICAgICAgICAgIGdldFRvdGFsRGlmZihlZGdlcykgPj0gdGhpcy5yZXNpemVNb3ZlVGhyZXNob2xkXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBzdGFydFZpc2libGVSZXNpemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1cnJlbnRSZXNpemUhLnZpc2libGUgJiYgY3VycmVudFJlc2l6ZSEuY2xvbmVkTm9kZSkge1xyXG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShcclxuICAgICAgICAgICAgY3VycmVudFJlc2l6ZSEuY2xvbmVkTm9kZSxcclxuICAgICAgICAgICAgJ2hlaWdodCcsXHJcbiAgICAgICAgICAgIGAke25ld0JvdW5kaW5nUmVjdC5oZWlnaHR9cHhgXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShcclxuICAgICAgICAgICAgY3VycmVudFJlc2l6ZSEuY2xvbmVkTm9kZSxcclxuICAgICAgICAgICAgJ3dpZHRoJyxcclxuICAgICAgICAgICAgYCR7bmV3Qm91bmRpbmdSZWN0LndpZHRofXB4YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXNpemUhLmNsb25lZE5vZGUsXHJcbiAgICAgICAgICAgICd0b3AnLFxyXG4gICAgICAgICAgICBgJHtuZXdCb3VuZGluZ1JlY3QudG9wfXB4YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoXHJcbiAgICAgICAgICAgIGN1cnJlbnRSZXNpemUhLmNsb25lZE5vZGUsXHJcbiAgICAgICAgICAgICdsZWZ0JyxcclxuICAgICAgICAgICAgYCR7bmV3Qm91bmRpbmdSZWN0LmxlZnR9cHhgXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRSZXNpemUhLnZpc2libGUgJiYgdGhpcy5yZXNpemluZy5vYnNlcnZlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzaXppbmcuZW1pdCh7XHJcbiAgICAgICAgICAgICAgZWRnZXMsXHJcbiAgICAgICAgICAgICAgcmVjdGFuZ2xlOiBuZXdCb3VuZGluZ1JlY3QsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN1cnJlbnRSZXNpemUhLmN1cnJlbnRSZWN0ID0gbmV3Qm91bmRpbmdSZWN0O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBtb3VzZWRvd24kXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIG1hcCgoeyBlZGdlcyB9KSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gZWRnZXMgfHwge307XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgZmlsdGVyKChlZGdlczogRWRnZXMpID0+IHtcclxuICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhlZGdlcykubGVuZ3RoID4gMDtcclxuICAgICAgICB9KSxcclxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95JClcclxuICAgICAgKVxyXG4gICAgICAuc3Vic2NyaWJlKChlZGdlczogRWRnZXMpID0+IHtcclxuICAgICAgICBpZiAoY3VycmVudFJlc2l6ZSkge1xyXG4gICAgICAgICAgcmVtb3ZlR2hvc3RFbGVtZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN0YXJ0aW5nUmVjdDogQm91bmRpbmdSZWN0YW5nbGUgPSBnZXRFbGVtZW50UmVjdChcclxuICAgICAgICAgIHRoaXMuZWxtLFxyXG4gICAgICAgICAgdGhpcy5naG9zdEVsZW1lbnRQb3NpdGlvbmluZ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgY3VycmVudFJlc2l6ZSA9IHtcclxuICAgICAgICAgIGVkZ2VzLFxyXG4gICAgICAgICAgc3RhcnRpbmdSZWN0LFxyXG4gICAgICAgICAgY3VycmVudFJlY3Q6IHN0YXJ0aW5nUmVjdCxcclxuICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHRoaXMucmVzaXplTW92ZVRocmVzaG9sZCA8PSAwKSB7XHJcbiAgICAgICAgICBzdGFydFZpc2libGVSZXNpemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIG1vdXNldXAkLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKS5zdWJzY3JpYmUoKGV2ZW50KSA9PiB7XHJcbiAgICAgIGlmICghY3VycmVudFJlc2l6ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY3VycmVudFJlc2l6ZS52aXNpYmxlKSB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsbS5uYXRpdmVFbGVtZW50LCBSRVNJWkVfQUNUSVZFX0NMQVNTKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKGRvY3VtZW50LmJvZHksICdjdXJzb3InLCAnJyk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmVsbS5uYXRpdmVFbGVtZW50LCAnY3Vyc29yJywgJycpO1xyXG4gICAgICAgIGlmICh0aGlzLnJlc2l6ZUVuZC5vYnNlcnZlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzaXplRW5kLmVtaXQoe1xyXG4gICAgICAgICAgICAgIGVkZ2VzOiBnZXRFZGdlc0RpZmYoe1xyXG4gICAgICAgICAgICAgICAgZWRnZXM6IGN1cnJlbnRSZXNpemUhLmVkZ2VzLFxyXG4gICAgICAgICAgICAgICAgaW5pdGlhbFJlY3RhbmdsZTogY3VycmVudFJlc2l6ZSEuc3RhcnRpbmdSZWN0LFxyXG4gICAgICAgICAgICAgICAgbmV3UmVjdGFuZ2xlOiBjdXJyZW50UmVzaXplIS5jdXJyZW50UmVjdCxcclxuICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICByZWN0YW5nbGU6IGN1cnJlbnRSZXNpemUhLmN1cnJlbnRSZWN0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZW1vdmVHaG9zdEVsZW1lbnQoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkLm9ic2VydmVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkLmVtaXQoZXZlbnQpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGN1cnJlbnRSZXNpemUgPSBudWxsO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAaGlkZGVuXHJcbiAgICovXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAvLyBicm93c2VyIGNoZWNrIGZvciBhbmd1bGFyIHVuaXZlcnNhbCwgYmVjYXVzZSBpdCBkb2Vzbid0IGtub3cgd2hhdCBkb2N1bWVudCBpc1xyXG4gICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMucGxhdGZvcm1JZCkpIHtcclxuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShkb2N1bWVudC5ib2R5LCAnY3Vyc29yJywgJycpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tb3VzZWRvd24uY29tcGxldGUoKTtcclxuICAgIHRoaXMubW91c2V1cC5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5tb3VzZW1vdmUuY29tcGxldGUoKTtcclxuICAgIHRoaXMuZGVzdHJveSQubmV4dCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRFbGVtZW50Q2xhc3MoZWxtOiBFbGVtZW50UmVmLCBuYW1lOiBzdHJpbmcsIGFkZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgaWYgKGFkZCkge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKGVsbS5uYXRpdmVFbGVtZW50LCBuYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3MoZWxtLm5hdGl2ZUVsZW1lbnQsIG5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUG9pbnRlckV2ZW50TGlzdGVuZXJzIHtcclxuICBwdWJsaWMgcG9pbnRlckRvd246IE9ic2VydmFibGU8UG9pbnRlckV2ZW50Q29vcmRpbmF0ZT47XHJcblxyXG4gIHB1YmxpYyBwb2ludGVyTW92ZTogT2JzZXJ2YWJsZTxQb2ludGVyRXZlbnRDb29yZGluYXRlPjtcclxuXHJcbiAgcHVibGljIHBvaW50ZXJVcDogT2JzZXJ2YWJsZTxQb2ludGVyRXZlbnRDb29yZGluYXRlPjtcclxuXHJcbiAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IFBvaW50ZXJFdmVudExpc3RlbmVycztcclxuXHJcbiAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZShcclxuICAgIHJlbmRlcmVyOiBSZW5kZXJlcjIsXHJcbiAgICB6b25lOiBOZ1pvbmVcclxuICApOiBQb2ludGVyRXZlbnRMaXN0ZW5lcnMge1xyXG4gICAgaWYgKCFQb2ludGVyRXZlbnRMaXN0ZW5lcnMuaW5zdGFuY2UpIHtcclxuICAgICAgUG9pbnRlckV2ZW50TGlzdGVuZXJzLmluc3RhbmNlID0gbmV3IFBvaW50ZXJFdmVudExpc3RlbmVycyhcclxuICAgICAgICByZW5kZXJlcixcclxuICAgICAgICB6b25lXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUG9pbnRlckV2ZW50TGlzdGVuZXJzLmluc3RhbmNlO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IocmVuZGVyZXI6IFJlbmRlcmVyMiwgem9uZTogTmdab25lKSB7XHJcbiAgICB0aGlzLnBvaW50ZXJEb3duID0gbmV3IE9ic2VydmFibGUoXHJcbiAgICAgIChvYnNlcnZlcjogT2JzZXJ2ZXI8UG9pbnRlckV2ZW50Q29vcmRpbmF0ZT4pID0+IHtcclxuICAgICAgICBsZXQgdW5zdWJzY3JpYmVNb3VzZURvd246ICgpID0+IHZvaWQ7XHJcbiAgICAgICAgbGV0IHVuc3Vic2NyaWJlVG91Y2hTdGFydDogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgIHVuc3Vic2NyaWJlTW91c2VEb3duID0gcmVuZGVyZXIubGlzdGVuKFxyXG4gICAgICAgICAgICAnZG9jdW1lbnQnLFxyXG4gICAgICAgICAgICAnbW91c2Vkb3duJyxcclxuICAgICAgICAgICAgKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7XHJcbiAgICAgICAgICAgICAgICBjbGllbnRYOiBldmVudC5jbGllbnRYLFxyXG4gICAgICAgICAgICAgICAgY2xpZW50WTogZXZlbnQuY2xpZW50WSxcclxuICAgICAgICAgICAgICAgIGV2ZW50LFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIGlmIChJU19UT1VDSF9ERVZJQ0UpIHtcclxuICAgICAgICAgICAgdW5zdWJzY3JpYmVUb3VjaFN0YXJ0ID0gcmVuZGVyZXIubGlzdGVuKFxyXG4gICAgICAgICAgICAgICdkb2N1bWVudCcsXHJcbiAgICAgICAgICAgICAgJ3RvdWNoc3RhcnQnLFxyXG4gICAgICAgICAgICAgIChldmVudDogVG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7XHJcbiAgICAgICAgICAgICAgICAgIGNsaWVudFg6IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICAgICAgICAgICAgY2xpZW50WTogZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLFxyXG4gICAgICAgICAgICAgICAgICBldmVudCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICAgIHVuc3Vic2NyaWJlTW91c2VEb3duKCk7XHJcbiAgICAgICAgICBpZiAoSVNfVE9VQ0hfREVWSUNFKSB7XHJcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlVG91Y2hTdGFydCEoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICApLnBpcGUoc2hhcmUoKSk7XHJcblxyXG4gICAgdGhpcy5wb2ludGVyTW92ZSA9IG5ldyBPYnNlcnZhYmxlKFxyXG4gICAgICAob2JzZXJ2ZXI6IE9ic2VydmVyPFBvaW50ZXJFdmVudENvb3JkaW5hdGU+KSA9PiB7XHJcbiAgICAgICAgbGV0IHVuc3Vic2NyaWJlTW91c2VNb3ZlOiAoKSA9PiB2b2lkO1xyXG4gICAgICAgIGxldCB1bnN1YnNjcmliZVRvdWNoTW92ZTogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgIHVuc3Vic2NyaWJlTW91c2VNb3ZlID0gcmVuZGVyZXIubGlzdGVuKFxyXG4gICAgICAgICAgICAnZG9jdW1lbnQnLFxyXG4gICAgICAgICAgICAnbW91c2Vtb3ZlJyxcclxuICAgICAgICAgICAgKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7XHJcbiAgICAgICAgICAgICAgICBjbGllbnRYOiBldmVudC5jbGllbnRYLFxyXG4gICAgICAgICAgICAgICAgY2xpZW50WTogZXZlbnQuY2xpZW50WSxcclxuICAgICAgICAgICAgICAgIGV2ZW50LFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgIGlmIChJU19UT1VDSF9ERVZJQ0UpIHtcclxuICAgICAgICAgICAgdW5zdWJzY3JpYmVUb3VjaE1vdmUgPSByZW5kZXJlci5saXN0ZW4oXHJcbiAgICAgICAgICAgICAgJ2RvY3VtZW50JyxcclxuICAgICAgICAgICAgICAndG91Y2htb3ZlJyxcclxuICAgICAgICAgICAgICAoZXZlbnQ6IFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoe1xyXG4gICAgICAgICAgICAgICAgICBjbGllbnRYOiBldmVudC50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgICAgICAgIGNsaWVudFk6IGV2ZW50LnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WSxcclxuICAgICAgICAgICAgICAgICAgZXZlbnQsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICB1bnN1YnNjcmliZU1vdXNlTW92ZSgpO1xyXG4gICAgICAgICAgaWYgKElTX1RPVUNIX0RFVklDRSkge1xyXG4gICAgICAgICAgICB1bnN1YnNjcmliZVRvdWNoTW92ZSEoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICApLnBpcGUoc2hhcmUoKSk7XHJcblxyXG4gICAgdGhpcy5wb2ludGVyVXAgPSBuZXcgT2JzZXJ2YWJsZShcclxuICAgICAgKG9ic2VydmVyOiBPYnNlcnZlcjxQb2ludGVyRXZlbnRDb29yZGluYXRlPikgPT4ge1xyXG4gICAgICAgIGxldCB1bnN1YnNjcmliZU1vdXNlVXA6ICgpID0+IHZvaWQ7XHJcbiAgICAgICAgbGV0IHVuc3Vic2NyaWJlVG91Y2hFbmQ6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcclxuICAgICAgICBsZXQgdW5zdWJzY3JpYmVUb3VjaENhbmNlbDogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgIHVuc3Vic2NyaWJlTW91c2VVcCA9IHJlbmRlcmVyLmxpc3RlbihcclxuICAgICAgICAgICAgJ2RvY3VtZW50JyxcclxuICAgICAgICAgICAgJ21vdXNldXAnLFxyXG4gICAgICAgICAgICAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHtcclxuICAgICAgICAgICAgICAgIGNsaWVudFg6IGV2ZW50LmNsaWVudFgsXHJcbiAgICAgICAgICAgICAgICBjbGllbnRZOiBldmVudC5jbGllbnRZLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQsXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgaWYgKElTX1RPVUNIX0RFVklDRSkge1xyXG4gICAgICAgICAgICB1bnN1YnNjcmliZVRvdWNoRW5kID0gcmVuZGVyZXIubGlzdGVuKFxyXG4gICAgICAgICAgICAgICdkb2N1bWVudCcsXHJcbiAgICAgICAgICAgICAgJ3RvdWNoZW5kJyxcclxuICAgICAgICAgICAgICAoZXZlbnQ6IFRvdWNoRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQoe1xyXG4gICAgICAgICAgICAgICAgICBjbGllbnRYOiBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYLFxyXG4gICAgICAgICAgICAgICAgICBjbGllbnRZOiBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZLFxyXG4gICAgICAgICAgICAgICAgICBldmVudCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlVG91Y2hDYW5jZWwgPSByZW5kZXJlci5saXN0ZW4oXHJcbiAgICAgICAgICAgICAgJ2RvY3VtZW50JyxcclxuICAgICAgICAgICAgICAndG91Y2hjYW5jZWwnLFxyXG4gICAgICAgICAgICAgIChldmVudDogVG91Y2hFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh7XHJcbiAgICAgICAgICAgICAgICAgIGNsaWVudFg6IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgICAgICAgIGNsaWVudFk6IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFksXHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgdW5zdWJzY3JpYmVNb3VzZVVwKCk7XHJcbiAgICAgICAgICBpZiAoSVNfVE9VQ0hfREVWSUNFKSB7XHJcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlVG91Y2hFbmQhKCk7XHJcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlVG91Y2hDYW5jZWwhKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgKS5waXBlKHNoYXJlKCkpO1xyXG4gIH1cclxufVxyXG4iXX0=