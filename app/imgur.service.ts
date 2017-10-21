import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/RX';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface IImage {
    id: string,
    type: string,
    title?: string,
    description?: string,
    width: number,
    height: number,
    link: string
    animated?: boolean,
}

export interface IAlbum extends IImage {
    datetime: number,
    account_url: string,
    account_id: number,
    cover: string,
    cover_width: number,
    cover_height: number,
    comment_count: number,
    is_album: boolean,
    ups: number,
    downs: number,
    views: number,
    nsfw: boolean,
    images: IImage[],
    tags: {name: string}[]
}

export interface IComment {
    id: number,
    comment: string,
    author: string,
    author_id: number,
    datetime: number,
    ups: number,
    downs: number,
    deleted: boolean,
    children?: IComment[]
}

export interface ICategory {
    id: string,
    name: string,
    description: string,
    cover?: boolean
    suggestedSort?: AlbumSort
}

export interface ITopicCategory extends ICategory {
    heroImage?: { id: string, link: string }
}

export const ROUTES = {
    GALLERY: 'gallery',
    TOPIC: 'topic',
    TOPICS: 'topics',
    COMMENTS: 'comments'
}

const CATEGORIES: ICategory[] = [{
    id: 'hot',
    name: 'Most Viral',
    description: 'Today\'s most popular posts',
    suggestedSort: 'viral'
}, {
    id: 'user',
    name: 'User Submitted',
    description: 'Brand new posts shared in real time',
    suggestedSort: 'time'
}];

declare type AlbumSort = 'viral' | 'top' | 'time';

@Injectable()
export class ImgurService {

    private static URI: string = 'https://imgur.shanelab.nl/api.php';

    constructor(private httpClient: Http) { }

    /**
     * 
     */
    public getCategories() {
        return this.getTopics()
            .then(topics => Promise.resolve([...CATEGORIES, ...topics.map(topic => (topic['isTopic'] = true, topic))]));
    }

    /**
     * 
     */
    public getTopics() {
        return this.requestQ<ITopicCategory[]>(ROUTES.TOPICS);
    }

    /**
     * 
     * @param category 
     * @param page 
     * @param sort 
     */
    public getAlbums(category: ICategory & { isTopic?: boolean } = CATEGORIES[0], page = 0, sort?: AlbumSort) {
        return category.isTopic ? 
            this.getAlbumsByTopic(category.id, page, sort) : 
            this.getAlbumsByGallery(page, category.id, !sort && category.suggestedSort ? category.suggestedSort : sort);
    }

    /**
     * 
     * @param topicId 
     * @param page
     */
    public getAlbumsByTopic(topicId: number|string, page: number = 0, sort?: AlbumSort) {
        return this.requestQ<IAlbum[]>(ROUTES.TOPIC, { topicId, page, sort });
    }

    /**
     * 
     * @param page
     * @param category
     * @param sort 
     */
    public getAlbumsByGallery(page: number = 0, category?: string, sort?: AlbumSort) {
        return this.requestQ<IAlbum[]>(ROUTES.GALLERY, { page, category, sort });
    }

    /**
     * 
     * @param albumId 
     */
    public getComments(albumId: string) {
        return this.requestQ<IComment[]>(ROUTES.COMMENTS, { albumId });
    }

    /**
     * 
     * @param route 
     * @param args 
     */
    public getByRoute<K extends keyof typeof ROUTES>(route: K, args: object = null) {
        return this.requestQ(ROUTES[route], args);
    }

    /**
     * 
     * @param route 
     * @param args 
     */
    private requestQ<T>(route: string, args: object = null): Promise<T> {
        const endpoint = `${ImgurService.URI}?action=${route}`.concat(this.resolveParams(args));

        return new Promise((resolve, reject) => {
            this.httpClient.get(endpoint)
                .map((res: Response) => res.json())
                .catch((error: any) => Observable.throw(error || error.json().error || 'Server error'))
                .subscribe(result => {
                    if (!result) {
                        return reject(new Error(`Server error while resolving, possible outdated api endpoint '${endpoint}'`));
                    }
                    if (result.data.error) {
                        return reject(new Error(result.data.error.message || 'No items were found'));
                    }

                    resolve(result.data);
                }, error => {
                    return reject(error || new Error(`Server error, possible outdated api endpoint '${endpoint}'`))
                });
        });
    }
    
    /**
     * 
     * @param args 
     */
    private resolveParams(args: object): string {
        if (!args) {
            return '';
        }

        return Object.keys(args).map(key => !args[key] ? '' : (`&${key}=${args[key]}`)).join('');
    }
}