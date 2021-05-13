import { Queue } from "queue-typescript";
import { Member } from "src/domain/entity";
// import { AppService } from "src/app.service";

interface Message {
    author: Member;
    originalText: string;
    displayText: string;
    commands?: string[];
}

interface RawMessage {
    author: Member;
    content: string;
}

export class Feed {

    // constructor(private appService: AppService) { }

    queue: Queue<Message> = new Queue();

    // TODO dont use Member for author prop
    post({ author, content }: RawMessage) {
        this.queue.enqueue({ author, displayText: content, originalText: content });

        // if (this.queue.length > this.appService.config.maxMessagesPerRoom) {
        //     this.queue.removeTail();
        // }
    }
}