import { Component, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';

import { ImgurAlbumComponent } from './imgur-album.component';

import { Observable } from 'rxjs/RX';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ImgurService, IAlbum, ICategory, ITopicCategory } from './imgur.service';

enum Mode {
    Loading = -1,
    Category = 0,
    Gallery = 1
};

enum CategoryType { TOPIC, GALLERY }

declare type PaginatedAlbum = { albums: IAlbum[], index: number };

@Component({
    selector: 'my-app',
    template: `
        <nav></nav>
        <div class="container">
            <div *ngIf="!isFullscreen()" class="categories"
                [ngClass]="{ 'selected': mode === 0 }"
                [ngStyle]="{ 
                    'height': 'calc(100% + '+ (categoryListHeight) +'px)',
                    'top': -(categoryListHeight) + 'px'
                }">
                <div *ngFor="let category of categories; let i = index; let odd = odd"
                    id="{{category.id}}"
                    class="category"
                    (click)="onCategoryClick(category)" 
                    [ngClass]="{
                        'odd': odd, 
                        'selected': i === categoryIndex || category === activeCategory
                    }" 
                    [ngStyle]="{
                        'background-image': 'linear-gradient('+getCategoryGradient(i)+'), url('+(category.thumbnail)+')', 
                        'background-size': 'cover', 
                        'background-repeat': 'no-repeat'
                    }">
                    <h1>{{category.name}}</h1>
                    <p>{{category.description}}</p>
                </div>
            </div>
            <main id="main" 
                [ngClass]="{ 
                    'fullscreen': isFullscreen(), 
                    'selected': mode === 1 
                }">
                <ng-container *ngIf="!error">
                    <div class="albums"
                        *ngIf="albums" 
                        [hidden]="activeAlbum || mode === -1"
                        [ngStyle]="{
                            
                            'top': -(albumListHeight) + 'px'
                        }">
                        <div class="cover" *ngFor="let album of albums; let i = index" 
                            (click)="onAlbumClick(album)"
                            [ngClass]="{ 'selected': i === albumIndex }">
                            <img id="{{album.id}}" [ngClass]="{nsfw: album.nsfw}" [src]="'https://i.imgur.com/'+ (album.cover ? album.cover : album.id) +'b.jpg'" />
                            <div class="caption">{{album.title}}</div>
                        </div>
                    </div>

                    <imgur-album *ngIf="activeAlbum" [hidden]="mode === -1" [album]="activeAlbum" [hasPrevious]="albumIndex > 0 && albumPageIndex >= 0"></imgur-album>

                    <preloader *ngIf="mode === -1" [caption]="activeCategory ? 'Loading gallery for '+ (activeCategory.name + ', page ' + (albumPageIndex + 1)) : ''"></preloader>
                </ng-container>
                <h1 class="error" *ngIf="error">{{error}}</h1>
            </main>
        </div>
    `,
    styles: [`

        #main {
            position: absolute;
            top: 0;
            left: 380px;
            right: 0;
            bottom: 0;
            margin: 12px;
            /*overflow: auto;*/
        }

        #main > * {
            opacity: 0.5;
        }
        
        #main.selected > * {
            opacity: 1
        }

        #main > preloader {
            opacity: 1 !important;
        }

        #main.fullscreen {
            left: 0;
        }

        #main.fullscreen .albums {
            margin-left: 108px;
        }

        #main .error {
            margin-top: 252px;
            color: #f40027;
            text-align: center;
            text-shadow: 2px 2px 2px #f40027;
        }

        nav {
            position: fixed;
            top: 0;
            left: 0;
            height: 80px;
            width: 100%;
            background-color: #212121;
            box-shadow: 0 1px 2px 2px #080808;
            z-index: 2;
        }

        nav::after {
            content: '';
            position: absolute;
            top: 26px;
            left: 26px;
            width: 92px;
            height: 34px;
            background-image: url(https://s.imgur.com/images/imgur-logo.svg?1);
            background-repeat: no-repeat;
        }
        
        .container {
            position: absolute;
            top: 80px;
            left: 0;
            bottom: 0;
            right: 0;
        }

        .categories {
            position: relative;
            width: 380px;
            min-height: 100%;
            background: inherit;
            box-shadow: 0 .5em 2em rgba(0, 0, 0, .2);
            box-sizing: border-box;
            overflow: hidden;
            text-align: center;
            z-index: 1;
            text-shadow: 0 1px 8px rgba(0, 0, 0, .3);
        }

        .categories .category {
            opacity: 0.5;
        }

        .categories:hover .category, .categories.selected .category {
            opacity: 1;
        }

        .categories::after {
            content:'';
            background-color: rgba(255, 255, 255, .2);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .categories .category {
            position: relative;
            float: left;
            width: 170px;
            height: 170px;
            margin: 12px;
            margin-bottom: 0;
            background: #191d22;
            color: #fff; /* active: #CDDC39; */ 
            text-shadow: 2px 2px 2px #191d22;
            border: 0.1px solid rgba(100, 100, 100, 0.1);
            z-index: 1;
            cursor: pointer;
        }

        .categories .category:hover, .categories .category.selected {
            text-shadow: rgb(0, 165, 134) 2px 2px 2px;
        }

        .categories .category.odd {
            margin-left: 0;
        }

        .albums {
            position: relative;
            min-width: 870px;
        }
        
        .albums .cover {
            width: 160px;
            height: 160px;
            float: left;
            margin: 5px;
            padding: 2px;    
            display: inline-block;
            overflow: hidden;
            cursor: pointer;
            background: #445e61;
            color: #fff;
            box-shadow: 0 1px 2px #080808;
        }

        /*.albums .cover {
            opacity: 0.5;
        }

        .albums.selected .cover {
            opacity: 1;
        }*/

        .albums .cover.selected {
            background: #00af7b;
        }
        
        .albums .cover > img {
            max-width: 100%;
            height: auto;
            object-fit: contain;
        }

        .albums .cover > .caption {
            width: 154px;
            height: auto;
            line-height: 21px;
            margin-left: -2px;
            padding: 5px;
            padding-top: 10px;
            padding-bottom: 10px;
            background: rgba(0,0,0,.8);
            z-index: 2;
            font-weight: 300;
            -webkit-transition: all .2s;
            transition: all .2s;
            transform: translateY(140px);
        }

        .albums .cover.selected > .caption, .albums .cover:hover > .caption {
            transform: translateY(-37px);
        }

        .albums .cover > img.nsfw {
            border: 1px solid red;
        }
    `],
    providers: [ImgurService]
})
export class AppComponent {

    private categoryListHeight: number = 0;

    private albumListHeight: number = 0;

    private error: string | Error;

    private mode: Mode = Mode.Loading;

    private categoryIndex = 0;

    private activeCategory: ICategory;

    private categories: Array<ICategory & { thumbnail?: string }> = [];

    private albumIndex = 0;

    private albumPageIndex = 0;

    private activeAlbum: IAlbum;

    private albums: IAlbum[];

    private fullscreen = false;

    @ViewChild(ImgurAlbumComponent)
    private albumComponent: ImgurAlbumComponent;

    constructor(private service: ImgurService, private cdr: ChangeDetectorRef) {
        this.service.getCategories()
            .then(categories => this.categories = categories.map(category => (category['thumbnail'] = this.getCategoryThumbnail(category), category)))
            .catch(err => this.error = err)
            .then(() => this.activeCategory = this.categories[0])
            .then(category => this.service.getAlbums(category))
            .catch(err => this.error = err)
            .then(albums => (this.mode = Mode.Gallery, this.albums = albums))
    }

    private onCategoryClick(category: ICategory) {
        if (!category) {
            return;
        }

        this.error = null;

        this.albumIndex = 0;

        this.albumListHeight = 0;

        this.albums = null;

        this.activeAlbum = null;

        this.mode = Mode.Loading;

        Observable.from(this.categories)
            .findIndex(value => value === category)
            .toPromise()
            .then(index => this.categoryIndex = index)
            .catch(err => (console.warn('undefined category: ', err), this.categoryIndex = 0, category = this.categories[0]))
            .then(() => (this.activeCategory = category, this.service.getAlbums(category)))
            .catch(err => (console.dir(err), this.error = err))
            .then(albums => (this.mode = Mode.Gallery, this.albums = albums))
            .then(() => this.measureHeightAndPosition());
    }

    private async onAlbumClick(album: IAlbum) {
        if (!album) {
            this.activeAlbum = null;
            return
        }

        this.activeAlbum = album;

        const index = this.albumIndex = this.albums.findIndex(value => value === album);
        this.cdr.detectChanges();

        const component = await this.albumComponent;

        if (component) {
            component.requestNew.subscribe((next: number = 1) =>
                this.fetchAlbumById(this.albumIndex + next)
                    .then(result => (this.albums = result.albums, result.index))
                    .then(index => (this.activeAlbum = this.albums[index], this.albumIndex = index))
                    .then(() => this.measureHeightAndPosition())
            );
        }
    }

    private async fetchAlbumById(index: number): Promise<PaginatedAlbum> {
        const prevPage = this.albumPageIndex;

        let prev = false;
        if (index < 0 && this.albumPageIndex > 0) {
            this.albumPageIndex--;
            prev = true;
        }

        if (index > this.albums.length - 1) {
            index = 0;
            this.albumPageIndex++;
        }

        let albums = this.albums;
        if (this.albumPageIndex != prevPage) {
            albums = await this.service.getAlbums(this.activeCategory, this.albumPageIndex);
        }

        index = prev ? albums.length - 1 : index < 0 ? 0 : index;

        return { albums, index };
    }

    private getCategoryGradient(index: number) {
        const isSelected = this.categoryIndex === index;
        const isActive = this.activeCategory === this.categories[index];

        const rgb = isSelected || isActive ? '85, 176, 60' : '0, 0, 0';

        const opacity = !isSelected && !isActive ? 0.8 : isActive ? 0.4 : 0.2;

        return `rgba(${rgb}, ${opacity}), rgba(${rgb}, ${opacity})`;
    }

    private getCategoryThumbnail(category: ICategory & { isTopic?: boolean }) {
        const local = !category.isTopic || (category.isTopic && !(category as ITopicCategory).heroImage);

        return local ? `assets/categories/${local && !category.isTopic ? category.id : 'missing'}.png` : (category as ITopicCategory).heroImage.link;
    }

    private isFullscreen() {
        return this.fullscreen && this.mode === Mode.Gallery;
    }

    private measureHeightAndPosition() {
        this.categoryListHeight = (this.categoryIndex > 0 ? (182 * ((this.categoryIndex - (this.categoryIndex % 2 === 0 ? 0 : 1)) / 2)) : 0);

        const indices = this.fullscreen ? 6 : 5;

        this.albumListHeight = (this.albumIndex > (indices - 1) ? (174 * Math.floor(this.albumIndex / indices)) : 0);
    }

    @HostListener(`window:${SamsungAPI.eventName}`, ['$event'])
    public handleKeyboardEvent(event: Event & { keyCode: number }) {
        if (this.mode === Mode.Loading) {
            return;
        }

        const { keyCode } = event;

        if (keyCode === SamsungAPI.tvKey.KEY_TOOLS) {
            this.mode = this.mode !== Mode.Category ? Mode.Category : Mode.Gallery;
        }
        if (event.keyCode === SamsungAPI.tvKey.KEY_INFO) {
            this.fullscreen = !this.fullscreen;
        }

        if (this.mode === Mode.Category) {
            this.handleCategoriesNav(keyCode)
        }
        if (this.mode === Mode.Gallery && !this.activeAlbum) {
            this.handleGalleryNav(keyCode);
        }
        if (this.activeAlbum) {
            if (this.albumComponent) {
                this.albumComponent.onKeyDown(keyCode);
            }
            if (event.keyCode === SamsungAPI.tvKey.KEY_RETURN) {
                this.activeAlbum = null;
            }
        }

        this.measureHeightAndPosition();
    }

    private handleCategoriesNav(keyCode: number) {
        if (this.mode !== Mode.Category) {
            return;
        }

        switch (keyCode) {
            case SamsungAPI.tvKey.KEY_ENTER:
                this.onCategoryClick(this.categories[this.categoryIndex])
                break;
            case SamsungAPI.tvKey.KEY_LEFT:
                if (this.categoryIndex > 0) {
                    this.categoryIndex--;
                }
                break;
            case SamsungAPI.tvKey.KEY_RIGHT:
                if (this.categoryIndex < this.categories.length - 1) {
                    this.categoryIndex++;
                }
                break;
            case SamsungAPI.tvKey.KEY_UP:
            case SamsungAPI.tvKey.KEY_DOWN:
                let index = this.categoryIndex;
                index += keyCode === SamsungAPI.tvKey.KEY_UP ? -2 : 2;

                const length = this.categories.length - 1;
                index = index < 0 ? 0 : index > length - 1 ? length : index;

                this.categoryIndex = index;
                break;
        }
    }

    private handleGalleryNav(keyCode: number) {
        if (this.mode !== Mode.Gallery || !this.albums) {
            return;
        }

        switch (keyCode) {
            case SamsungAPI.tvKey.KEY_ENTER:
                this.onAlbumClick(this.albums[this.albumIndex]);
                break;
            case SamsungAPI.tvKey.KEY_LEFT:
                if (this.albumIndex > 0) {
                    this.albumIndex--;
                } else {
                    if (this.albumPageIndex > 0) {
                        this.mode = Mode.Loading;
                        this.service.getAlbums(this.activeCategory, --this.albumPageIndex)
                            .then(albums => (this.albums = albums, this.albumIndex = albums.length - 1))
                            .then(() => (this.mode = Mode.Gallery, this.measureHeightAndPosition()));
                    }
                }
                break;
            case SamsungAPI.tvKey.KEY_RIGHT:
                if (this.albumIndex < this.albums.length - 1) {
                    this.albumIndex++;
                } else {
                    this.mode = Mode.Loading;
                    this.service.getAlbums(this.activeCategory, ++this.albumPageIndex)
                        .then(albums => (this.albums = albums, this.albumIndex = 0))
                        .then(() => (this.mode = Mode.Gallery, this.measureHeightAndPosition()));
                }
                break;
            case SamsungAPI.tvKey.KEY_UP:
            case SamsungAPI.tvKey.KEY_DOWN:
                const indices = this.fullscreen ? 6 : 5;

                let index = this.albumIndex;
                index += keyCode === SamsungAPI.tvKey.KEY_UP ? -indices : indices;

                const length = this.albums.length - 1;
                index = index < 0 ? 0 : index > length - 1 ? length : index;

                this.albumIndex = index;
                break;
        }
    }
}