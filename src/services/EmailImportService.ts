import { EmailRepository } from "../datastore/repositories/EmailRepository";
import { MessageRepository } from "../datastore/repositories/MessageRepository";
import { ThreadRepository } from "../datastore/repositories/ThreadRepository";
import { UserRepository } from "../datastore/repositories/UserRepository";
import { EmailEntity } from "../model/entities/EmailEntity";
import { MessageEntity } from "../model/entities/MessageEntity";
import { ThreadEntity } from "../model/entities/ThreadEntity";
import { EmailFetcherService } from "./EmailFetcherService";

export class EmailImportService {
  constructor(
    private readonly emailFetcherService: EmailFetcherService,
    private readonly emailRepository: EmailRepository,
    private readonly messageRepository: MessageRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async import(): Promise<void> {
    const fetchedEmails = await this.retrieveAndPersistEmails();
    await this.processEmailsIntoThreads(fetchedEmails);
  }

  private async retrieveAndPersistEmails() {
    const fetchedEmails = await this.emailFetcherService.fetchAndSort();
    await this.emailRepository.persist(fetchedEmails);
    return fetchedEmails;
  }

  private async processEmailsIntoThreads(
    fetchedEmails: EmailEntity[],
  ): Promise<void> {
    const threadMap = new Map<string, ThreadEntity>();
    const messagesPromises: Promise<MessageEntity>[] = [];

    for (const email of fetchedEmails) {
      const thread = await this.createOrAddToExisingThread(email, threadMap);
      messagesPromises.push(this.createMessageFromEmail(email, thread));
    }

    const messages = await Promise.all(messagesPromises);
    await this.messageRepository.persist(messages);
  }

  private async createOrAddToExisingThread(
    email: EmailEntity,
    threadMap: Map<string, ThreadEntity>,
  ) {
    let thread: ThreadEntity;

    if (email.inReplyTo && threadMap.has(email.inReplyTo.toString())) {
      thread = threadMap.get(email.inReplyTo.toString())!;
    } else {
      thread = new ThreadEntity(email.subject || "No Subject");
      await this.threadRepository.persist([thread]);
    }

    threadMap.set(email.universalMessageId.toString(), thread);
    return thread;
  }

  private async createMessageFromEmail(
    email: EmailEntity,
    thread: ThreadEntity,
  ): Promise<MessageEntity> {
    const user = await this.userRepository.findByEmail(email.from.email);
    const messageSenderId = user?.id ?? null;

    return MessageEntity.createFromEmail(messageSenderId, thread.id!, email);
  }
}
