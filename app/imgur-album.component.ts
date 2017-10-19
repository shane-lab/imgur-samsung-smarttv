import { Component, Input, Output, ElementRef, OnInit } from '@angular/core';

import { IAlbum, IImage } from './imgur.service';

@Component({
    selector: 'imgur-album',
    template: `
        <div class="container">
            <div class="header">
                <div class="pagination">
                    <div class="btn prev">&laquo;</div>
                    <div class="btn next">
                        <div class="text">Next Post <span class="icon">&raquo;</span></div>
                    </div>
                </div>
                <div class="title-container">
                    <h1 class="title" [innerHTML]="album.title"></h1>
                </div>
                <div class="user-meta">
                    <p>by <span class="user">{{album.account_url}}</span> <span>{{album.datetime}}</span></p>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .container {
            width: 100%;
            min-height: 100%;
            border-radius: 5px;
            background: #2c2f34;
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
    `]
})
export class ImgurAlbumComponent implements OnInit {

    @Input() album: IAlbum;

    constructor(private elementRef: ElementRef) { }

    ngOnInit() { }
}