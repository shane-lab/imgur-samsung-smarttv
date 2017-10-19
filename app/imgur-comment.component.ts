import { Component, OnInit, ElementRef, Input } from '@angular/core';

import { IComment } from './imgur.service';

@Component({
    selector: 'imgur-comment',
    template: `
        
    `
})
export class ImgurCommentComponent implements OnInit {

    @Input() comment: IComment;

    constructor(private elementRef: ElementRef) { }

    ngOnInit() { }
}