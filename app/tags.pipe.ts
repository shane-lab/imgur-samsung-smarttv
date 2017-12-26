import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'tags'
})
export class TagsPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }
    
    transform(text: string, color = '#7789ff') {
        return this.sanitizer.bypassSecurityTrustHtml((text || '').replace(/\#(\w+)/g, `<span style="margin-right: 5px; color: ${color} !important">#$1</span>`));
    }
}