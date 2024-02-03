import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { EmailImportService } from "../src/services/EmailImportService";
import { MessageEntity } from "../src/model/entities/MessageEntity";
import { EmailFetcherService } from "../src/services/EmailFetcherService";
import {setupMockRepositories} from "./helpers/MockRepositories";
import {generateOneThreadEmails, generateTwoThreadEmails} from './helpers/TestEmails';


jest.mock("../src/services/EmailFetcherService");
jest.mock("../src/model/entities/MessageEntity", () => ({
    MessageEntity: { createFromEmail: jest.fn() },
}));

const mockDependencies = setupMockRepositories();

describe("EmailImportService", () => {
    let service: EmailImportService;
    let emailFetcherService: jest.Mocked<EmailFetcherService>;

    beforeEach(() => {
        jest.clearAllMocks();
        emailFetcherService = new EmailFetcherService() as any;

        service = new EmailImportService(
            emailFetcherService,
            mockDependencies.emailRepository,
            mockDependencies.messageRepository,
            mockDependencies.threadRepository,
            mockDependencies.userRepository,
        );
    });

    it("should process emails into one thread", async () => {
        const fetchedEmails = generateOneThreadEmails();
        emailFetcherService.fetchAndSort.mockResolvedValue(fetchedEmails);

        await service.import();

        expect(mockDependencies.emailRepository.persist).toHaveBeenCalledWith(fetchedEmails);
        expect(mockDependencies.threadRepository.persist).toHaveBeenCalledTimes(1); // One thread should be created

        const createdMessages = mockDependencies.messageRepository.persist.mock.calls[0][0] as MessageEntity[];

        expect(createdMessages).toHaveLength(fetchedEmails.length); // One message for each email

    });

    it("should process emails into two thread", async () => {
        const fetchedEmails = generateTwoThreadEmails();
        emailFetcherService.fetchAndSort.mockResolvedValue(fetchedEmails);

        await service.import();

        expect(mockDependencies.emailRepository.persist).toHaveBeenCalledWith(fetchedEmails);
        expect(mockDependencies.threadRepository.persist).toHaveBeenCalledTimes(2); // One thread should be created

        const createdMessages = mockDependencies.messageRepository.persist.mock.calls[0][0] as MessageEntity[];

        expect(createdMessages).toHaveLength(fetchedEmails.length); // One message for each email

    });
});
