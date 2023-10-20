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
    const threadsByEmail = new Map<string, ThreadEntity>();
    const messagesPromises: Promise<MessageEntity>[] = [];

    for (const email of fetchedEmails) {
      const { universalMessageId, inReplyTo } = email;

      const existingThread =
        inReplyTo && threadsByEmail.get(inReplyTo.toString());

      const thread = existingThread ?? (await this.createThread(email.subject));

      threadsByEmail.set(universalMessageId.toString(), thread);
      messagesPromises.push(this.createMessageFromEmail(email, thread));
    }

    const messages = await Promise.all(messagesPromises);
    await this.messageRepository.persist(messages);
  }

  private async retrieveAndPersistEmails() {
    const fetchedEmails = await this.emailFetcherService.fetch();
    await this.emailRepository.persist(fetchedEmails);
    return fetchedEmails;
  }

  private async createThread(name: string) {
    const singleThread = new ThreadEntity(name);
    await this.threadRepository.persist([singleThread]);
    return singleThread;
  }

  private async createMessageFromEmail(
    email: EmailEntity,
    thread: ThreadEntity,
  ): Promise<MessageEntity> {
    const user = await this.userRepository.findByEmail(email.from.email);
    const messageSenderId = user?.id ?? null;

    const message = MessageEntity.createFromEmail(
      messageSenderId,
      thread.id!,
      email,
    );
    return message;
  }
}
