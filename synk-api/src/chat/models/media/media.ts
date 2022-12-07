import { Member } from "src/domain/entity";
import { MediaRepresentation } from "./media.representation";

export class Media {

    title: string;
    url: string;
    metaData: any;
    length: number;
    isLive: boolean;

    constructor(url: string, title: string, duration: number, isLive = false) {
        this.title = title;
        this.url = url;
        this.length = duration;
        this.isLive = isLive;
    }

    toRepresentation(addedByMember?: Member, currentTime: number = null): MediaRepresentation {
        return {
            title: this.title,
            url: this.url,
            duration: this.length,
            isLive: this.isLive,
            currentTime,
            addedBy: addedByMember
                ? { username: addedByMember?.username, memberId: addedByMember.id }
                : null
        }
    }
}