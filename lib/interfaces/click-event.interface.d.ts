/**
 * The `$event` object that is passed to the click event
 */
export interface ClickEvent {
    clientX: number;
    clientY: number;
    event?: MouseEvent | TouchEvent;
}
