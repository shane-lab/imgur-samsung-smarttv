import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { LazyLoadImageModule } from 'ng-lazyload-image';

import { AppComponent } from './app.component';

import { ImgurAlbumComponent } from './imgur-album.component';
import { ImgurCommentComponent } from './imgur-comment.component';
import { PreloaderComponent } from './preloader.component';

import { LocalDirective } from './local.directive';

import { SafeUrlPipe } from './safeurl.pipe';
import { RoundPipe } from './round.pipe';
import { SincePipe } from './since.pipe';
import { TagsPipe } from './tags.pipe';

@NgModule({
  imports:      [ CommonModule, BrowserModule, FormsModule, HttpModule, LazyLoadImageModule ],
  declarations: [ AppComponent, ImgurAlbumComponent, ImgurCommentComponent, PreloaderComponent, SafeUrlPipe, RoundPipe, SincePipe, TagsPipe, LocalDirective ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }