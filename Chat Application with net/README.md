# Chat Application with Node.js `net`

## 1. Project Overview

This project is a TCP chat application built using Node.js's built-in `net` module.

Multiple clients can connect to the server from separate terminals. Each client chooses a unique username and can send broadcast messages to all other connected users or send a private direct message to one specific user.

The application also includes two additional features:

* `/who` command to see currently connected users
* Join/leave notifications when users connect or disconnect

## 2. Message Protocol and Framing

The application uses a simple text-based protocol.

Each message ends with a newline character (`\n`). The newline is used as the message delimiter, so the server knows where one message ends and the next one begins.

The server does not assume that one TCP `data` event contains exactly one message. TCP can split one message across multiple `data` events or combine multiple messages into one event.

To handle this, the server keeps incoming data in a `buffer`:

1. New data is added to the buffer.
2. The buffer is split using `\n`.
3. Complete messages are processed.
4. The last incomplete part is kept in the buffer until more data arrives.

Newlines are therefore used as message boundaries, and each chat message is sent as a single line.

## 3. Commands and Protocol

The application uses the following commands:

### `/dm <username> <message>`

Sends a private message to one specific connected user.

Example:

```text
/dm bob Hello!
```

The recipient sees:

```text
[DM from alice]: Hello!
```

The sender receives a confirmation:

```text
[you -> bob]: Hello!
```

If the username does not exist, the sender receives an error message instead of the message being silently dropped.

### `/who`

Shows all currently connected usernames.

Example:

```text
/who
```

The server responds with:

```text
Connected users: alice, bob, charlie
```

### Unknown Commands

Commands starting with `/` that are not recognized are rejected and the available commands are displayed.

## 4. Broadcast Messages

A normal message without a command prefix is treated as a broadcast.

For example:

```text
hello everyone
```

If Alice sends this message, all other connected users receive:

```text
alice: hello everyone
```

The sender does not receive their own broadcast.

## 5. Usernames

A client must choose a username before being able to chat.

Empty usernames are rejected.

The server also prevents two clients from using the same username at the same time.

If a username is already in use, the server asks the client to choose another one.

## 6. Additional Features

### `/who`

The `/who` command allows a user to see which users are currently connected to the server.

### Join/Leave Notifications

When a user connects, other users receive a system message such as:

```text
*** alice joined ***
```

When a user disconnects, other users receive:

```text
*** alice left ***
```

This also works when a client disconnects unexpectedly.

## 7. Error and Disconnect Handling

Each client socket has an `error` event handler so that an individual socket error does not crash the entire server.

The server also handles the `close` event. When a client disconnects, its username is removed from the `clients` map and the other users are notified.

This allows the remaining clients to continue using the chat normally.

## 8. Project Files

```text
server.js    - TCP chat server
client.js    - TCP chat client
README.md    - Project documentation
```

## 9. How to Run

Make sure Node.js is installed.

Start the server:

```text
node server.js
```

Then open multiple terminals and start a client in each terminal:

```text
node client.js
```

Each client should choose a different username.

Example:

```text
Terminal 1: alice
Terminal 2: bob
Terminal 3: charlie
```

After connecting, users can send normal broadcast messages or use commands such as:

```text
/who
/dm bob Hello Bob!
```

## 10. Example Session

Alice connects:

```text
Enter your username: alice
Welcome, alice!
```

Bob connects:

```text
Enter your username: bob
Welcome, bob!
```

Alice sends a broadcast:

```text
hello everyone
```

Bob receives:

```text
alice: hello everyone
```

Alice sends a private message:

```text
/dm bob Are you free later?
```

Alice sees:

```text
[you -> bob]: Are you free later?
```

Bob sees:

```text
[DM from alice]: Are you free later?
```

Alice's private message is not sent to other connected users.

## 11. Requirements Implemented

The application implements the main assignment requirements:

* Unique usernames
* Broadcast messaging
* Private direct messaging
* Message framing using `\n`
* Buffering for TCP message boundaries
* Graceful and abrupt disconnect handling
* Socket error handling
* `/who` command
* Join/leave notifications
