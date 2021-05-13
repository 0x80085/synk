import { MediaTypes, detectMediaType } from "./mediatypes.enum";

export class Media {

    title: string;
    url: string;
    type: MediaTypes;
    metaData: any;
    length: number;

    constructor(url: string, title: string, duration: number) {
        this.title = title;
        this.url = url;
        this.length = duration;
        this.type = detectMediaType(url);
    }

    toRepresentation() {
        return {
            title: this.title,
            url: this.url,
            length: this.length
        }
    }
}