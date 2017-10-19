import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[local]',
    exportAs: 'local'
})
export class LocalDirective {
    [key: string]: any;

    @Input('local') vars: any;
}