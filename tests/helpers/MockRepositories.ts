import { jest } from "@jest/globals";
import { EmailRepository } from "../../src/datastore/repositories/EmailRepository";
import { MessageRepository } from "../../src/datastore/repositories/MessageRepository";
import { ThreadRepository } from "../../src/datastore/repositories/ThreadRepository";
import { UserRepository } from "../../src/datastore/repositories/UserRepository";

export const createMockRepository = <T extends object>(): jest.Mocked<T> => {
  return {
    persist: jest.fn(),
    findByEmail: jest.fn(),
  } as jest.Mocked<T>;
};

export const setupMockRepositories = () => ({
  emailRepository: createMockRepository<EmailRepository>(),
  messageRepository: createMockRepository<MessageRepository>(),
  threadRepository: createMockRepository<ThreadRepository>(),
  userRepository: createMockRepository<UserRepository>(),
});
