import { EmailEntity } from "../../src/model/entities/EmailEntity";
import {Contact} from "../../src/model/value-objects/Contact";
import {EmailAddress} from "../../src/model/value-objects/EmailAddress";
import {ContactList} from "../../src/model/value-objects/ContactList";

export const generateOneThreadEmails = (): EmailEntity[] => [
    new EmailEntity(new Contact("1", new EmailAddress("email@gmail.com")), null, "mailserverId1", new Contact("from1", new EmailAddress("email@gmail.com")), new ContactList([]), new ContactList([]), "Body 1", "Subject 1", new Date("2022-01-01T10:00:00Z")),
    new EmailEntity(new Contact("2", new EmailAddress("email1@gmail.com")), new Contact("1", new EmailAddress("email@gmail.com")), "mailserverId1", new Contact("from1", new EmailAddress("email@gmail.com")), new ContactList([]), new ContactList([]), "Body 1", "Re: Subject 1", new Date("2022-02-01T10:00:00Z")),
    new EmailEntity(new Contact("3", new EmailAddress("email2@gmail.com")), new Contact("2", new EmailAddress("email1@gmail.com")), "mailserverId1", new Contact("from1", new EmailAddress("email@gmail.com")), new ContactList([]), new ContactList([]), "Body 1", "Re: Subject 1", new Date("2022-03-01T10:00:00Z"))
];

export const generateTwoThreadEmails = (): EmailEntity[] => [
    new EmailEntity(new Contact("1", new EmailAddress("email@gmail.com")), null, "mailserverId1", new Contact("from1", new EmailAddress("email@gmail.com")), new ContactList([]), new ContactList([]), "Body 1", "Subject 1", new Date("2022-01-01T10:00:00Z")),
    new EmailEntity(new Contact("2", new EmailAddress("email1@gmail.com")), new Contact("1", new EmailAddress("email@gmail.com")), "mailserverId1", new Contact("from1", new EmailAddress("email@gmail.com")), new ContactList([]), new ContactList([]), "Body 1", "Re: Subject 1", new Date("2022-02-01T10:00:00Z")),
    new EmailEntity(new Contact("3", new EmailAddress("email2@gmail.com")), new Contact("3", new EmailAddress("email3@gmail.com")), "mailserverId1", new Contact("from1", new EmailAddress("email@gmail.com")), new ContactList([]), new ContactList([]), "Body 1", "Subject 3", new Date("2022-03-01T10:00:00Z"))

];

