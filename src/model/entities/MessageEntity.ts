import { AbstractEntity } from "./AbstractEntity";
import { EmailEntity } from "./EmailEntity";

export class MessageEntity extends AbstractEntity {
  constructor(
    public readonly senderId: number | null,
    public readonly threadId: number,
    public readonly emailId: number,
    public readonly body: string,
    public readonly date: Date,
    id?: number,
  ) {
    super(id);
  }

  // Note: in a real case scenario I'd benchmark existing libraries to do this: nothing
  // I'll come up with quickly will cover all the edge cases that a library such as
  // https://www.npmjs.com/package/string-strip-html does.
  public static stripHtml(text: string): string {
    // Naive approach (copied from StackOverflow), just remove anything between '<' and '>'.
    return text.replace(/(<([^>]+)>)/g, "");
  }

  public static createFromEmail(
    senderId: number | null,
    threadId: number,
    email: EmailEntity,
  ): MessageEntity {
    if (!email.id) {
      throw new Error("Email must have an id to be converted to a message");
    }

    return new MessageEntity(
      senderId,
      threadId,
      email.id!,
      this.stripHtml(email.body),
      email.date,
    );
  }
}
