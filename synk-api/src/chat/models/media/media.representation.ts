export class MediaRepresentation {
    title: string;
    url: string;
    duration: number;
    addedBy: { memberId: string, username: string };
    isLive: boolean;
    currentTime: number;
}