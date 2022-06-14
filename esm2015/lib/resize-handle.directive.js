import { Directive, Input, Optional, } from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IS_TOUCH_DEVICE } from './util/is-touch-device';
import * as i0 from "@angular/core";
import * as i1 from "./resizable.directive";
/**
 * An element placed inside a `mwlResizable` directive to be used as a drag and resize handle
 *
 * For example
 *
 * ```html
 * <div mwlResizable>
 *   <div mwlResizeHandle [resizeEdges]="{bottom: true, right: true}"></div>
 * </div>
 * ```
 * Or in case they are sibling elements:
 * ```html
 * <div mwlResizable #resizableElement="mwlResizable"></div>
 * <div mwlResizeHandle [resizableContainer]="resizableElement" [resizeEdges]="{bottom: true, right: true}"></div>
 * ```
 */
export class ResizeHandleDirective {
    constructor(renderer, element, zone, resizableDirective) {
        this.renderer = renderer;
        this.element = element;
        this.zone = zone;
        this.resizableDirective = resizableDirective;
        /**
         * The `Edges` object that contains the edges of the parent element that dragging the handle will trigger a resize on
         */
        this.resizeEdges = {};
        this.eventListeners = {};
        this.destroy$ = new Subject();
    }
    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            this.listenOnTheHost('mousedown').subscribe((event) => {
                this.onMousedown(event, event.clientX, event.clientY);
            });
            this.listenOnTheHost('mouseup').subscribe((event) => {
                this.onMouseup(event.clientX, event.clientY);
            });
            if (IS_TOUCH_DEVICE) {
                this.listenOnTheHost('touchstart').subscribe((event) => {
                    this.onMousedown(event, event.touches[0].clientX, event.touches[0].clientY);
                });
                merge(this.listenOnTheHost('touchend'), this.listenOnTheHost('touchcancel')).subscribe((event) => {
                    this.onMouseup(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                });
            }
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.unsubscribeEventListeners();
    }
    /**
     * @hidden
     */
    onMousedown(event, clientX, clientY) {
        event.preventDefault();
        if (!this.eventListeners.touchmove) {
            this.eventListeners.touchmove = this.renderer.listen(this.element.nativeElement, 'touchmove', (touchMoveEvent) => {
                this.onMousemove(touchMoveEvent, touchMoveEvent.targetTouches[0].clientX, touchMoveEvent.targetTouches[0].clientY);
            });
        }
        if (!this.eventListeners.mousemove) {
            this.eventListeners.mousemove = this.renderer.listen(this.element.nativeElement, 'mousemove', (mouseMoveEvent) => {
                this.onMousemove(mouseMoveEvent, mouseMoveEvent.clientX, mouseMoveEvent.clientY);
            });
        }
        this.resizable.mousedown.next({
            clientX,
            clientY,
            edges: this.resizeEdges,
        });
    }
    /**
     * @hidden
     */
    onMouseup(clientX, clientY) {
        this.unsubscribeEventListeners();
        this.resizable.mouseup.next({
            clientX,
            clientY,
            edges: this.resizeEdges,
        });
    }
    // directive might be passed from DI or as an input
    get resizable() {
        return this.resizableDirective || this.resizableContainer;
    }
    onMousemove(event, clientX, clientY) {
        this.resizable.mousemove.next({
            clientX,
            clientY,
            edges: this.resizeEdges,
            event,
        });
    }
    unsubscribeEventListeners() {
        Object.keys(this.eventListeners).forEach((type) => {
            this.eventListeners[type]();
            delete this.eventListeners[type];
        });
    }
    listenOnTheHost(eventName) {
        return fromEvent(this.element.nativeElement, eventName).pipe(takeUntil(this.destroy$));
    }
}
ResizeHandleDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0, type: ResizeHandleDirective, deps: [{ token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.NgZone }, { token: i1.ResizableDirective, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
ResizeHandleDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.3", type: ResizeHandleDirective, selector: "[mwlResizeHandle]", inputs: { resizeEdges: "resizeEdges", resizableContainer: "resizableContainer" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0, type: ResizeHandleDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[mwlResizeHandle]',
                }]
        }], ctorParameters: function () { return [{ type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i0.NgZone }, { type: i1.ResizableDirective, decorators: [{
                    type: Optional
                }] }]; }, propDecorators: { resizeEdges: [{
                type: Input
            }], resizableContainer: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLWhhbmRsZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLXJlc2l6YWJsZS1lbGVtZW50L3NyYy9saWIvcmVzaXplLWhhbmRsZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBTUwsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNqRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHdCQUF3QixDQUFDOzs7QUFFekQ7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBSUgsTUFBTSxPQUFPLHFCQUFxQjtJQWtCaEMsWUFDVSxRQUFtQixFQUNuQixPQUFtQixFQUNuQixJQUFZLEVBQ0Esa0JBQXNDO1FBSGxELGFBQVEsR0FBUixRQUFRLENBQVc7UUFDbkIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQUNuQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ0EsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQXJCNUQ7O1dBRUc7UUFDTSxnQkFBVyxHQUFVLEVBQUUsQ0FBQztRQU16QixtQkFBYyxHQUlsQixFQUFFLENBQUM7UUFFQyxhQUFRLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQU9wQyxDQUFDO0lBRUosUUFBUTtRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQy9CLElBQUksQ0FBQyxlQUFlLENBQWEsV0FBVyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUs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aXZlLFxyXG4gIElucHV0LFxyXG4gIFJlbmRlcmVyMixcclxuICBFbGVtZW50UmVmLFxyXG4gIE9uSW5pdCxcclxuICBPbkRlc3Ryb3ksXHJcbiAgTmdab25lLFxyXG4gIE9wdGlvbmFsLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBmcm9tRXZlbnQsIG1lcmdlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgUmVzaXphYmxlRGlyZWN0aXZlIH0gZnJvbSAnLi9yZXNpemFibGUuZGlyZWN0aXZlJztcclxuaW1wb3J0IHsgRWRnZXMgfSBmcm9tICcuL2ludGVyZmFjZXMvZWRnZXMuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgSVNfVE9VQ0hfREVWSUNFIH0gZnJvbSAnLi91dGlsL2lzLXRvdWNoLWRldmljZSc7XHJcblxyXG4vKipcclxuICogQW4gZWxlbWVudCBwbGFjZWQgaW5zaWRlIGEgYG13bFJlc2l6YWJsZWAgZGlyZWN0aXZlIHRvIGJlIHVzZWQgYXMgYSBkcmFnIGFuZCByZXNpemUgaGFuZGxlXHJcbiAqXHJcbiAqIEZvciBleGFtcGxlXHJcbiAqXHJcbiAqIGBgYGh0bWxcclxuICogPGRpdiBtd2xSZXNpemFibGU+XHJcbiAqICAgPGRpdiBtd2xSZXNpemVIYW5kbGUgW3Jlc2l6ZUVkZ2VzXT1cIntib3R0b206IHRydWUsIHJpZ2h0OiB0cnVlfVwiPjwvZGl2PlxyXG4gKiA8L2Rpdj5cclxuICogYGBgXHJcbiAqIE9yIGluIGNhc2UgdGhleSBhcmUgc2libGluZyBlbGVtZW50czpcclxuICogYGBgaHRtbFxyXG4gKiA8ZGl2IG13bFJlc2l6YWJsZSAjcmVzaXphYmxlRWxlbWVudD1cIm13bFJlc2l6YWJsZVwiPjwvZGl2PlxyXG4gKiA8ZGl2IG13bFJlc2l6ZUhhbmRsZSBbcmVzaXphYmxlQ29udGFpbmVyXT1cInJlc2l6YWJsZUVsZW1lbnRcIiBbcmVzaXplRWRnZXNdPVwie2JvdHRvbTogdHJ1ZSwgcmlnaHQ6IHRydWV9XCI+PC9kaXY+XHJcbiAqIGBgYFxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbbXdsUmVzaXplSGFuZGxlXScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBSZXNpemVIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgLyoqXHJcbiAgICogVGhlIGBFZGdlc2Agb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGVkZ2VzIG9mIHRoZSBwYXJlbnQgZWxlbWVudCB0aGF0IGRyYWdnaW5nIHRoZSBoYW5kbGUgd2lsbCB0cmlnZ2VyIGEgcmVzaXplIG9uXHJcbiAgICovXHJcbiAgQElucHV0KCkgcmVzaXplRWRnZXM6IEVkZ2VzID0ge307XHJcbiAgLyoqXHJcbiAgICogUmVmZXJlbmNlIHRvIFJlc2l6YWJsZURpcmVjdGl2ZSBpbiBjYXNlIGlmIGhhbmRsZSBpcyBub3QgbG9jYXRlZCBpbnNpZGUgb2YgZWxlbWVudCB3aXRoIFJlc2l6YWJsZURpcmVjdGl2ZVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIHJlc2l6YWJsZUNvbnRhaW5lcjogUmVzaXphYmxlRGlyZWN0aXZlO1xyXG5cclxuICBwcml2YXRlIGV2ZW50TGlzdGVuZXJzOiB7XHJcbiAgICB0b3VjaG1vdmU/OiAoKSA9PiB2b2lkO1xyXG4gICAgbW91c2Vtb3ZlPzogKCkgPT4gdm9pZDtcclxuICAgIFtrZXk6IHN0cmluZ106ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcclxuICB9ID0ge307XHJcblxyXG4gIHByaXZhdGUgZGVzdHJveSQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcclxuICAgIHByaXZhdGUgZWxlbWVudDogRWxlbWVudFJlZixcclxuICAgIHByaXZhdGUgem9uZTogTmdab25lLFxyXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZXNpemFibGVEaXJlY3RpdmU6IFJlc2l6YWJsZURpcmVjdGl2ZVxyXG4gICkge31cclxuXHJcbiAgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xyXG4gICAgICB0aGlzLmxpc3Rlbk9uVGhlSG9zdDxNb3VzZUV2ZW50PignbW91c2Vkb3duJykuc3Vic2NyaWJlKChldmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMub25Nb3VzZWRvd24oZXZlbnQsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMubGlzdGVuT25UaGVIb3N0PE1vdXNlRXZlbnQ+KCdtb3VzZXVwJykuc3Vic2NyaWJlKChldmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMub25Nb3VzZXVwKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChJU19UT1VDSF9ERVZJQ0UpIHtcclxuICAgICAgICB0aGlzLmxpc3Rlbk9uVGhlSG9zdDxUb3VjaEV2ZW50PigndG91Y2hzdGFydCcpLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcclxuICAgICAgICAgIHRoaXMub25Nb3VzZWRvd24oXHJcbiAgICAgICAgICAgIGV2ZW50LFxyXG4gICAgICAgICAgICBldmVudC50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbWVyZ2UoXHJcbiAgICAgICAgICB0aGlzLmxpc3Rlbk9uVGhlSG9zdDxUb3VjaEV2ZW50PigndG91Y2hlbmQnKSxcclxuICAgICAgICAgIHRoaXMubGlzdGVuT25UaGVIb3N0PFRvdWNoRXZlbnQ+KCd0b3VjaGNhbmNlbCcpXHJcbiAgICAgICAgKS5zdWJzY3JpYmUoKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uTW91c2V1cChcclxuICAgICAgICAgICAgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICAgICAgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGVzdHJveSQubmV4dCgpO1xyXG4gICAgdGhpcy51bnN1YnNjcmliZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAaGlkZGVuXHJcbiAgICovXHJcbiAgb25Nb3VzZWRvd24oXHJcbiAgICBldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQsXHJcbiAgICBjbGllbnRYOiBudW1iZXIsXHJcbiAgICBjbGllbnRZOiBudW1iZXJcclxuICApOiB2b2lkIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAoIXRoaXMuZXZlbnRMaXN0ZW5lcnMudG91Y2htb3ZlKSB7XHJcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMudG91Y2htb3ZlID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oXHJcbiAgICAgICAgdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsXHJcbiAgICAgICAgJ3RvdWNobW92ZScsXHJcbiAgICAgICAgKHRvdWNoTW92ZUV2ZW50OiBUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9uTW91c2Vtb3ZlKFxyXG4gICAgICAgICAgICB0b3VjaE1vdmVFdmVudCxcclxuICAgICAgICAgICAgdG91Y2hNb3ZlRXZlbnQudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLFxyXG4gICAgICAgICAgICB0b3VjaE1vdmVFdmVudC50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgaWYgKCF0aGlzLmV2ZW50TGlzdGVuZXJzLm1vdXNlbW92ZSkge1xyXG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLm1vdXNlbW92ZSA9IHRoaXMucmVuZGVyZXIubGlzdGVuKFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50LFxyXG4gICAgICAgICdtb3VzZW1vdmUnLFxyXG4gICAgICAgIChtb3VzZU1vdmVFdmVudDogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vbk1vdXNlbW92ZShcclxuICAgICAgICAgICAgbW91c2VNb3ZlRXZlbnQsXHJcbiAgICAgICAgICAgIG1vdXNlTW92ZUV2ZW50LmNsaWVudFgsXHJcbiAgICAgICAgICAgIG1vdXNlTW92ZUV2ZW50LmNsaWVudFlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yZXNpemFibGUubW91c2Vkb3duLm5leHQoe1xyXG4gICAgICBjbGllbnRYLFxyXG4gICAgICBjbGllbnRZLFxyXG4gICAgICBlZGdlczogdGhpcy5yZXNpemVFZGdlcyxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQGhpZGRlblxyXG4gICAqL1xyXG4gIG9uTW91c2V1cChjbGllbnRYOiBudW1iZXIsIGNsaWVudFk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy51bnN1YnNjcmliZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgICB0aGlzLnJlc2l6YWJsZS5tb3VzZXVwLm5leHQoe1xyXG4gICAgICBjbGllbnRYLFxyXG4gICAgICBjbGllbnRZLFxyXG4gICAgICBlZGdlczogdGhpcy5yZXNpemVFZGdlcyxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gZGlyZWN0aXZlIG1pZ2h0IGJlIHBhc3NlZCBmcm9tIERJIG9yIGFzIGFuIGlucHV0XHJcbiAgcHJpdmF0ZSBnZXQgcmVzaXphYmxlKCk6IFJlc2l6YWJsZURpcmVjdGl2ZSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXNpemFibGVEaXJlY3RpdmUgfHwgdGhpcy5yZXNpemFibGVDb250YWluZXI7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uTW91c2Vtb3ZlKFxyXG4gICAgZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50LFxyXG4gICAgY2xpZW50WDogbnVtYmVyLFxyXG4gICAgY2xpZW50WTogbnVtYmVyXHJcbiAgKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2l6YWJsZS5tb3VzZW1vdmUubmV4dCh7XHJcbiAgICAgIGNsaWVudFgsXHJcbiAgICAgIGNsaWVudFksXHJcbiAgICAgIGVkZ2VzOiB0aGlzLnJlc2l6ZUVkZ2VzLFxyXG4gICAgICBldmVudCxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1bnN1YnNjcmliZUV2ZW50TGlzdGVuZXJzKCk6IHZvaWQge1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5ldmVudExpc3RlbmVycykuZm9yRWFjaCgodHlwZSkgPT4ge1xyXG4gICAgICAodGhpcyBhcyBhbnkpLmV2ZW50TGlzdGVuZXJzW3R5cGVdKCk7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmV2ZW50TGlzdGVuZXJzW3R5cGVdO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxpc3Rlbk9uVGhlSG9zdDxUIGV4dGVuZHMgRXZlbnQ+KGV2ZW50TmFtZTogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gZnJvbUV2ZW50PFQ+KHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50LCBldmVudE5hbWUpLnBpcGUoXHJcbiAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuIl19