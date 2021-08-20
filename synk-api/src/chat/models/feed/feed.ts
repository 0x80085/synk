import { Queue } from "queue-typescript";
import { Member } from "src/domain/entity";
// import { AppService } from "src/app.service";

interface Message {
    author: Member;
    originalText: string;
    displayText: string;
    isSystemMessage: boolean
    commands?: string[];
}

interface RawMessage {
    author: Member;
    content: string;
    isSystemMessage: boolean
}

export class Feed {

    // constructor(private globalConfigService: GlobalConfigService) { } // todo make the global conf module 

    queue: Queue<Message> = new Queue();

    post({ author, content, isSystemMessage }: RawMessage) {
        this.queue.enqueue({ author, displayText: content, originalText: content, isSystemMessage });

        if (this.queue.length > 150) {
            this.queue.removeTail();
        }
    }
}