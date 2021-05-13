export enum MediaTypes {
    YT = 'YT',
    Unknown = 'unknown',
    Vimeo = 'Vimeo',
    Twitch = 'Twitch',
}

export function detectMediaType(url: string) {

    const urlObject: URL = new URL(url);

    const isYT = urlObject.hostname.includes("youtube.com")
        || urlObject.hostname.includes("youtu.be");

    return isYT ? MediaTypes.YT : MediaTypes.Unknown;
}