import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
    selector: 'preloader',
    template: `
        <div class="spinner" [style.marginTop.px]="top">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
            <h5 *ngIf="caption" [innerHTML]="caption"></h5>
        </div>
    `,
    styles: [`
        .spinner {
            margin: 0 auto 0;
            width: 240px;
            text-align: center;
            color: #fff;
            text-shadow: 2px 2px 2px #191d22;
        }
        .spinner > div {
            width: 56px;
            height: 56px;
            background-color: #FFFFFF;
            
            border-radius: 100%;
            display: inline-block;
            -webkit-animation: bouncedelay 1.4s infinite ease-in-out;
            animation: bouncedelay 1.4s infinite ease-in-out;
            /* Prevent first frame from flickering when animation starts */
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
        }
        .spinner .bounce1 {
            -webkit-animation-delay: -0.32s;
            animation-delay: -0.32s;
        }
        .spinner .bounce2 {
            -webkit-animation-delay: -0.16s;
            animation-delay: -0.16s;
        }
        @-webkit-keyframes bouncedelay {
            0%, 80%, 100% { -webkit-transform: scale(0.0) }
            40% { -webkit-transform: scale(1.0) }
        }
        @keyframes bouncedelay {
            0%, 80%, 100% { 
            transform: scale(0.0);
            -webkit-transform: scale(0.0);
            } 40% { 
            transform: scale(1.0);
            -webkit-transform: scale(1.0);
            }
        }   
    `]
})
export class PreloaderComponent implements OnInit {

    constructor(private elementRef: ElementRef) { }

    @Input() private top: number = 0;

    @Input() private centerTop: boolean = true;

    @Input() private caption: string;

    ngOnInit() {
        if (this.centerTop && !this.top) {
            const {parentElement} = this.elementRef.nativeElement;

            if (parentElement) {
                const top = (parentElement.clientHeight / 2) - 56;

                this.top = top >= 0 ? top : 0;
            }
        }
    }
}