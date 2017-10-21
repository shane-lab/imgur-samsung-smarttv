import { Component, Input, OnInit } from '@angular/core';

import { IComment } from './imgur.service';

@Component({
    selector: 'imgur-comment',
    template: `
        <div class="container" [style.marginBottom.px]="!isChild && folded ? 12 : 0" [ngClass]="{ 'child': isChild, 'has-children': (comment.children.length && level <= 5), 'folded': folded }">
            <div class="comment">
                <div class="meta">
                    <span class="user">{{comment.author}} <span class="op" *ngIf="comment.author_id === albumAuthorId">OP</span></span> <span>{{comment.ups - comment.downs}} pts</span> <span>{{(comment.datetime * 1000) | since}}</span>
                </div>
                <div class="text" [innerHTML]="comment.comment"></div>
            </div>
        </div>

        <ng-container *ngIf="level <= 5 && !folded">
            <imgur-comment class="child" *ngFor="let child of comment.children" [comment]="child" [level]="level + 1" [albumAuthorId]="albumAuthorId"></imgur-comment>
        </ng-container>
    `,
    styles: [`
        :host {
            display: block;
            
            position: relative;
            /*margin-bottom: 12px;*/
        }

        .container {
            border-radius: 6px 6px 6px 0;
            background: #2c2f34;
            color: #fff;
        }

        .container.has-children::after {
            content: '-';
            position: absolute;
            display: block;
            right: 4px;
            top: 0;
        }

        .container.has-children.folded::after {
            content: '+';
        }

        .container.child {
            border-radius: 0 6px 6px;
        }

        .comment {
            padding: 9px 12px 11px 15px;
            line-height: 16px;
            position: relative;
        }

        .comment .meta {
            font-size: 11px;
            margin-bottom: 4px;
            color: #bbb;
            line-height: 11px;
        }

        .comment .meta .user {
            max-width: 478px;
            color: #7789ff !important;
            font-weight: 700;
            display: inline-block;
            vertical-align: text-top;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .comment .meta .user .op {
            color: #1bb76e !important;
            margin-left: 6px;
        }

        .comment .meta span {
            margin-left: 18px;
        }

        .comment .meta span:first-of-type {
            margin-left: 0;
        }

        .comment .text {
            line-height: 20px;
            padding: 10px 50px 5px 0;
            display: inherit;
            overflow: hidden;
        }

        imgur-comment.child {
            margin-left: 32px;
            margin-top: 2px;        
        }

        imgur-comment.child:last-of-type {
            margin-bottom: 12px;
        }
    `]
})
export class ImgurCommentComponent implements OnInit {

    @Input() comment: IComment;

    @Input() level: number = 0;

    @Input() albumAuthorId: number = -1;

    private isChild: boolean;

    private folded: boolean = true;

    ngOnInit() {
        this.isChild = this.level > 0;
    }

    public isFolded() {
        return this.folded;
    }

    public unfold(flag: boolean = true) {
        this.folded = !flag;
    }
}