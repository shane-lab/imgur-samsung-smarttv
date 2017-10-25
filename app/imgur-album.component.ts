import { Component, Input, Output, ElementRef, OnInit, EventEmitter, OnChanges } from '@angular/core';

import { ImgurService, IAlbum, IImage, IComment } from './imgur.service';

import 'gsap';

import { computeStyle, computedStyles } from './compute-dom';

declare type Direction = 1 | -1;

@Component({
    selector: 'imgur-album',
    template: `
        <div class="album-container">
            <div class="header"
                [ngClass]="{ 'sticky': isSticky }">
                <div class="pagination">
                    <div *ngIf="hasPrevious" class="btn prev">&laquo;</div>
                    <div class="btn next">
                        <div class="text">Next Post <span class="icon">&raquo;</span></div>
                    </div>
                </div>
                <div class="title-container">
                    <h1 class="title" [innerHTML]="album.title"></h1>
                </div>
                <div class="user-meta">
                    <p>by <span class="user">{{album.account_url}}</span> <span>{{(album.datetime * 1000) | since}}</span></p>
                </div>
            </div>
            <div class="post-container">
                <div class="post" *ngFor="let image of album.images; let i = index" [ngClass]="{ 'no-description': !image.description }">
                    <div id="image-{{image.id}}" class="image-container" [style.minHeight.px]="getMinImageHeight(image)">
                        <video class="image" *ngIf="image.animated === true" [src]="image.mp4 | safe" autoplay="autoplay" loop="loop" muted="muted"></video>
                        <img class="image" *ngIf="!image.animated" src="{{image.link}} | safe" />
                    </div>
                    <div *ngIf="image.description" class="image-meta">
                        <p class="description" [innerHTML]="image.description | tags"></p>
                    </div>
                </div>
                <div class="post-meta" [ngClass]="{ 'divider': requiresDivider() }">
                    <div *ngIf="authenticated" class="actions">
                        <!-- once authenticated, allow for up/down votes, favorite, flag etc. -->
                    </div>
                    <div class="rating">
                        <span class="stats"><span>{{album.points}} Points</span> <span>{{album.views}} Views</span></span>
                        <div *ngIf="album.tags" class="tags" [ngClass]="{ 'no-actions': authenticated }">
                            <span *ngFor="let tag of album.tags" class="tag">{{tag.name}}</span>
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
        </div>

        <div *ngIf="album.comment_count" class="comments-container">
            <imgur-comment *ngFor="let comment of comments" [comment]="comment" [albumAuthorId]="album.account_id"></imgur-comment>
            <preloader *ngIf="!comments"></preloader>
        </div>
    `,
    styles: [`
    
        :host {
            display: block;
            left: 0;

            width: 100%;
            min-height: 100%;
        }

        .album-container {
            border-radius: 5px;
            background: #2c2f34;
        }

        .comments-container {
            margin-top: 20px;
            position: relative;
        }

        .header {
            box-sizing: border-box;
            padding: 20px;
            border-radius: 3px 3px 0 0;
            box-shadow: 0 4px 4px -2px rgba(0, 0, 0, .2);
            position: relative;
        }

        .header .pagination {
            float: right;
            margin: 3px 3px 0 0;
        }

        .header .pagination .btn {
            padding: 10px 25px;
            color: #F2F2F2;
            text-decoration: none;
            outline: 0;
            -webkit-user-select: none;
            user-select: none;
            cursor: pointer;
            display: inline-block;
            border-radius: 2px;
            font-size: 14px;
            border: none;
            font-family: 'Open Sans',sans-serif;
        }

        .header .pagination .btn .text {
            margin-top: 2px;
            float: left;
            font-size: 14px;
        }

        .header .pagination .btn .text .icon {
            margin: 1px 0 0 10px;
        }

        .header .pagination .prev {
            text-align: center;
            cursor: pointer;
            padding-left: 15px;
            height: 36px;
            box-sizing: border-box;
            float: left;
            padding-right: 15px;
            background-color: #3F434A;
            margin-right: 5px;
            padding-top: 11px;
        }

        .header .pagination .next {
            text-align: center;
            cursor: pointer;
            padding-left: 15px;
            height: 36px;
            box-sizing: border-box;
            float: left;
            padding-right: 15px;
            background: #5c69ff;
            border: none;
        }

        .header .title-container {
            max-width: 500px;
        }

        .header .title-container .title {
            color: #f2f2f2;
            font-size: 18px;
            line-height: normal;
            text-shadow: none;
            overflow: hidden;
            outline: 0;
            display: block;
            font-weight: 400;
            max-height: 154px;
            font-size: 20px;
            line-height: 24px;
            font-weight: 700;
            word-wrap: break-word;
            margin: 0;
            word-spacing: normal;
        }

        .header .user-meta {
            color: #BBB;
            font-size: 12px;
            font-weight: bold: padding: 0;
            max-height: 18px;
            line-height: 18px;
        }

        .header .user-meta > span:first-of-type {
            margin-left: 0;
        }

        .header .user-meta > span {
            margin-left: 15px;
        }

        .header .user-meta .user {
            max-width: 294px;
            white-space: nowrap;
            text-overflow: ellipsis;
            vertical-align: bottom;
            display: inline-block;
            overflow: hidden;
            color: #7789ff;
            font-weight: 700;
        }

        .post-container {
            border-radius: 0 0 4px 4px;
            color: #fff;
        }

        .post-container .post {
            padding-bottom: 20px;
        }

        .post-container .post.no-description:last-of-type {
            padding-bottom: 0;
        }

        .post-container .post .image-container {
            text-align: center;
            background: #000;
            position: relative;
        }

        .post-container .post .image-container .image {
            display: block;
            margin: 0 auto;
            max-width: 100%;
        }

        .post-container .post .image-meta {
            padding: 20px 20px 35px;
        }
        
        .post-container .post .image-meta:last-of-type {
            padding-bottom: 0;
        }

        .post-container .post .image-meta .description {
            line-height: 19px;
            word-wrap: break-word;
            white-space: pre-wrap;
            padding: 0;
            margin: 0;
        }

        .post-container .post-meta {
            padding: 20px;
            margin-top: -1px;
            min-height: 45px;
        }

        .post-container .post-meta.divider {
            border-top: 2px solid #53555b;
            padding-top: 40px;
        }

        /** up/down vote, favorite */
        .post-container .post-meta .actions {
            display: none;
        }

        .post-container .post-meta .rating {
            margin-top: 8px;
            font-size: 13px;
        }

        .post-container .post-meta .rating .stats span:first-of-type {
            margin-right: 30px;
        }

        .post-container .post-meta .rating .tags {
            float: right;
            max-width: 360px;
            margin-top: -10px;
        }

        .post-container .post-meta .rating .tags .tag {
            float: right;
            background: #494a4f;
            border-radius: 99px;
            padding: 3px 13px 5px 13px;
            margin: 10px 0 0 10px;
            display: inline-block;
            font-size: 16px;
            color: #fff;
        }

        .post-container .post-meta .rating .tags.no-actions .tag {
            margin-top: 0;
        }

        .clear {
            margin: 0;
            padding: 0;
            border: 0;
            font: inherit;
            vertical-align: baseline;
        }

        .clear::before, clear::after {
            content: " ";
            display: table;
        }

        .clear::after {
            clear: both;
        }

    `],
    providers: [ImgurService]
})
export class ImgurAlbumComponent implements OnInit, OnChanges {

    @Input() album: IAlbum;

    @Input() hasPrevious: boolean = false;
    
    @Output() public requestNew: EventEmitter<Direction> = new EventEmitter<Direction>(true);

    private comments: IComment[];

    private authenticated: boolean = false;

    private isSticky: boolean;

    private delta: number = 0;

    private direction: Direction;

    private tween: Tween;

    constructor(private service: ImgurService, private elementRef: ElementRef) { }

    ngOnInit() {
        if (!this.album) {
            return;
        }

        if (!this.album.is_album) {
            this.album.images = [this.album];
        }

        if (this.tween) {
            this.tween.kill();
            
            this.tween = null;
        }

        const hostElement = this.elementRef.nativeElement as HTMLElement;

        if (hostElement) {
            hostElement.style.marginTop = '0px';
        }

        this.service.getComments(this.album.id)
            .then(comments => this.comments = comments);
    }

    ngOnChanges(changes: any) {
        this.ngOnInit();
    }

    private getMinImageHeight(image: IImage) {
        const container = (this.elementRef.nativeElement as HTMLElement).querySelector(`#image-${image.id}`);

        if (!container) {
            return null;
        }

        return image.width / container.clientWidth > 1 ? container.clientWidth / image.width * image.height : image.height;
    }

    private requiresDivider() {
        if (!this.album || (this.album && !this.album.images)) {
            return false;
        }

        return this.album.images.filter(image => image.description).length >= 1;
    }

    private scroll(dir: Direction) {
        if (this.direction !== dir) {
            this.delta = 0;
        }

        this.direction = dir;
        
        const newDelta = this.delta + dir;
        
        if (newDelta >= -5 && newDelta <= 5) {
            this.delta = newDelta;
        }

        const hostElement = this.elementRef.nativeElement as HTMLElement;

        if (!hostElement) {
            return;
        }

        const top = computeStyle(hostElement, 'margin-top') as number;
        const marginTop = top + this.delta * 128;
        this.tween = TweenLite.to(hostElement, 1.5, { 
            css: { marginTop },
            onComplete: () => {
                hostElement.style.marginTop = `${marginTop}px`;

                this.delta = 0;
            }
        })

        this.tween.play();
    }

    public onKeyDown(keyCode: number) {
        switch(keyCode) {
            case SamsungAPI.tvKey.KEY_LEFT:
                if (this.hasPrevious) {
                    this.requestNew.emit(-1);
                }
                break;
            case SamsungAPI.tvKey.KEY_RIGHT:
                this.requestNew.emit(1);
                break;
            case SamsungAPI.tvKey.KEY_UP:
                this.scroll(1);
                break;
            case SamsungAPI.tvKey.KEY_DOWN:
                this.scroll(-1);
                break;
        }
    }
}