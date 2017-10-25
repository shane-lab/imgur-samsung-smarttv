import { Directive, HostListener, Host, Output, EventEmitter } from '@angular/core';

declare type UndefEvent = Event & {[key: string]: any}

@Directive({ selector: '[scroll-event]' })
export class ScrollEventDirective {

    @Output()
    onScroll: EventEmitter<number> = new EventEmitter<number>();
    
    @HostListener('onmousewheel', ['$event'])
    private onMouseWheel(event: any) {
        this.handleMouseWheel(event);
    }
    
    @HostListener('mousewheel', ['$event'])
    private onMouseWheelChrome(event: any) {
        this.handleMouseWheel(event);
    }
    
    @HostListener('DOMMouseScroll', ['$event'])
    private onMouseWheelFirefox(event: any) {
        this.handleMouseWheel(event);
    }

    private handleMouseWheel(event: UndefEvent) {
        if (!event) {
            event = window.event;
        }
        if (!event) {
            return;
        }

        const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        
        this.onScroll.emit(delta > 0 ? 1 : -1);
    }
}