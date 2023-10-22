# Upstream Sync

Welcome to Upstream Sync! This is a fictitious backend project that serves as a platform for peer-programming or assignment evaluation. Please read the following instructions carefully to get started and complete the assignment section at the end of this document.

## Overview

Upstream Sync is designed to exploit an email retrieval API. Its main function is to convert the fetched emails into messages that can be utilized within an application. Key features include:

- Matching email addresses with user accounts.
- Automatically creating messages and threads based on the emails.

The aim is to simulate real-world scenarios and provide a foundation for insightful technical discussions, fostering a deeper understanding of the codebase and its challenges.

## Getting Started

1. **Clone the Repository and install the dependencies**  
   Begin by cloning this repository to your local machine.
   Run `yarn install` to install all the dependencies.

2. **Review the Project Description**  
   Make sure to go through the project's description available in this README to get an understanding of what Upstream Sync aims to achieve.

3. **Familiarize Yourself with the Codebase**  
   Take a moment to briefly go through the codebase before starting the assignment. This will help you in navigating the code and understanding its structure.

4. **Install Recommended Extensions**  
   It's advised to install the two recommended extensions: Prettier and SQLite Explorer. Their unique identifiers can be found in the `extensions.json` located in the `.vscode` folder of this project.

5. **Optional: Install DB Browser for SQLite**  
   This is an optional step, this tool would help you to view the database in a GUI. You can download it from [here](https://sqlitebrowser.org/dl/). Otherwise, you can use the SQLite Explorer extension to view the database.

6. **Run the Project**  
   Run `yarn start` to start the project. This will initialize the database, insert test data and run the `EmailImportService` to fetch emails from the API and insert them into the database. It will also display the messages and threads stored in the database.

7. Complete the Assignment Section
   Follow the instructions in the assignment section of this document to complete the assignment.

## Project Description

**Upstream Sync** is a backend application that taps into a fictional API to retrieve emails. These emails are then transformed into messages and inserted into an SQLite database, with threads being automatically created from the emails.

### Entry Point: `index.ts`

- `initializeProviders`: This method loads all necessary dependencies, including services and repositories. Some of these may have inter-dependencies.

- `resetDatabaseSchemaAndData`: Invoked via the `databaseSchemaService`, this method resets the SQLite database stored locally by deleting and recreating the tables with test data.

- `EmailImportService`: The `import` method is called to fetch emails from a fictional API, transform them into messages and threads, and then insert them into the SQLite database.

- `MessageDisplayService`: Primarily for debugging purposes, the `DisplayMessages` method displays a list of inserted threads and messages with details like the date and sender.

### Project Architecture

- **Datastore**

  - **Repositories**: A commonly used pattern to separate application logic from data access. These classes manage interactions with the database.
  - **Schema**: Contains interfaces that define the database schema for the entities Email, Message, Thread, and User.

- **Models**

  - **Entities**: Represent business model entities like Email, Message, Thread, and User. The Email entity represents the email as it is fetched from the API. The Message entity represents the message that is created from the email. A thread is a collection of messages. The User entity represents a user of the application.
  - **ValueObjects**: Objects that have no identity of their own and are immutable.

- **Services**
  - **EmailFetcherService**: Responsible for fetching emails from a fictional API.
  - **EmailImportService**: Imports emails and transforms them into messages.
  - **MessageDisplayService**: Displays a list of messages and threads stored in the database for debugging purposes.

We encourage you to delve into these folders and files to get a deeper understanding of the application before starting the assignment.

## Assignment

### Task 1: Group messages by threads

As you may have noticed, the `import` method of the `EmailImportService` creates a default thread and assigns all messages to it. This is not the expected behavior. The goal is to group messages by threads. There are two headers that are part of the email protocol that can be used to do this: `In-Reply-To` and `Message-Id`. Each email has a unique `Message-Id` header and an optional `In-Reply-To` header that contains the `Message-Id` of the email it is replying to. In a threaded conversation, these headers form a chain of references. Specifically, the `In-Reply-To` header in each subsequent email points to the `Message-Id` of the email it's replying to, naturally grouping them into a thread. This chaining mechanism is what allows emails to be organized into coherent threads.

In the current project, the `Message-Id` and `In-Reply-To` header values are retrieved and stored in the `universalMessageId` and `inReplyTo` properties of the `EmailMessage` entity. In the `import` method of the `EmailImportService`, the const `fetchedEmails` is an array of `EmailMessage`s.

Theorically, you should compare the `inReplyTo` property with the `universalMessageId` values stored in the database. However, to simplify this first task, you can just group messages by threads with emails freshly imported from the API which are stored in memory (`fetchedEmails`).

Concretely, when running `yarn start`, the console should display messages grouped by threads, whereas currently they are all grouped into the same default thread.

Hint: Reply emails appear chronologically after the email to which they are responding. You may avoid complexity by taking this into account.

### Task 2: Take messages stored in database into account

Explain what would be needed, step by step, to take messages stored in the database into account when grouping messages by threads. You can write your answer in the `README.md` file. What parts of the code would you need to modify?

### Task 3: Remove HTML tags from messages

When creating the messages, remove the HTML tags from the message body. Figure out the best place to add this logic and implement it.

### Task 4: Add a unit test

Add a unit test, explain why you chose to test this particular part of the code and more generally what would be the best way to test this project.

## Feedback

Your insights and feedback on the project and the process are invaluable. Please share your thoughts after you have completed the assignment.

---

## Answer to task 2

To take messages stored in the database into account when grouping messages by threads we can look for a message in the database which associated email's `universalMessageId` matches the incoming email's `inReplyTo` property; if we find such a message we forward its `threadId` to the newly created message (assuming we do receive emails in chronological order).

Files to change:

- `src/services/EmailImportService.ts`: change the import service to search for a message using `MessageRepository.findOneByEmailUniversalMessageIdentifier` method instead of using the in-memory map.
- `schema.sql`: index `message.email_id` and `email.universal_message_id`.

Note: `MessageRow` in `src/datastore/schema/MessageRow.ts` is missing the `email_id` property found in `MessageEntity`. `MessageRepository.loadEntity` copes with this by populating `MessageEntity.email_id` with `MessageRow.id` instead, which is a bug since `MessageRepository.persist` doesn't use the `email_id` as `id` for the message.
`MessageDisplayService.displayMessage` only works because emails and messages are created sequentially in the same order with incremental ids and `message.id` and `message.email_id` happen to match.

## Answer to task 4

I'd test the project with the following guidelines:

1. unit test for pure business logic:

   - snapshots testing for what can be tested based on a readable output, such as removing html tags from a string for instance
   - standard JS assertions against outputs otherwise

2. integration tests with mocks to test services:

   - against a real database to test the repositories
   - with mocked out repositories and network for the rest, typically making sure `EmailImportService.import` behaves correctly.

3. some end-to end tests against a real servier to make sure that the main happy paths do work, all things considered

A good rule of thumb is to write more integration tests and less unit and end-to-end tests, which are costly to write, run and maintain.

I chose to test the `stripHtml` method because I just wrote it and it's a sensitive business logic part, as a unit test becuase it's pure business logic and as a snapshot since it produces a readable string output.
