# @ai-appliances/hooks

Beautiful reactions for AI Desktop Buddy while your AI assistant works.

This package connects **AI Desktop Buddy**, the smart speaker from
**AI Appliances**, to AI tools on your computer. When your assistant is thinking,
replying, waiting for your decision, or finishing a task, Buddy shows a matching
expression on its display. It makes the device feel like part of the workflow
instead of just another object on the desk.

## Why Use It

AI Desktop Buddy helps you understand what your AI assistant is doing without
constantly switching windows:

- when the assistant starts thinking, Buddy changes its face;
- when the assistant is working, Buddy looks busy;
- when your attention is needed, Buddy makes that visible;
- when the task is done, Buddy returns to a calm state;
- after successful progress, Buddy may celebrate with confetti.

The package does not replace your AI tool and does not change its answers. It
only adds clear visual feedback on your AI Appliances device.

## What It Looks Like

Example situations:

| On your computer | On AI Desktop Buddy |
| --- | --- |
| You send a prompt to the assistant | Buddy shows a focused expression |
| The assistant reads files or runs a command | Buddy looks busy |
| The assistant waits for your approval | Buddy asks for attention |
| The assistant finishes replying | Buddy returns to normal |
| Several steps complete successfully | Buddy may show a celebration |

## Quick Start

Make sure AI Desktop Buddy is powered on and connected to the same Wi-Fi network
as your computer.

```bash
npx @ai-appliances/hooks setup
```

During setup, the package will:

1. find your device on the local network;
2. ask you to confirm pairing with a PIN shown on Buddy's display;
3. save the local configuration on your computer;
4. install hooks for a supported AI tool.

Restart your AI tool after setup so the new reactions can take effect.

## Supported Tools

Automatic setup is currently available for:

- Claude Code

The setup flow also shows future options:

- OpenAI Codex - coming soon;
- OpenCode - coming soon.

## Command Examples

Set up pairing and hooks:

```bash
npx @ai-appliances/hooks setup
```

Check whether your computer can reach the device:

```bash
npx @ai-appliances/hooks status
```

Reset pairing and remove local settings:

```bash
npx @ai-appliances/hooks reset
```

## If The Device Is Not Found

Try the following:

1. make sure AI Desktop Buddy is powered on;
2. make sure your computer and Buddy are on the same Wi-Fi network;
3. run setup again;
4. if automatic discovery does not work, enter the device IP address manually.

## Secure Pairing

On first connection, AI Desktop Buddy shows a PIN on its display. This prevents
someone else on your network from pairing with the device by accident.

If you do not want to approve a new pairing request, press the microphone button
on the device to cancel it.

## What This Package Does

- connects AI Desktop Buddy to an AI tool on your computer;
- sends simple states such as "thinking", "replying", "waiting", and "ready";
- enables visual reactions on the device display;
- stores local configuration in `~/.ai-appliances/config.json`.

## What This Package Does Not Do

- it does not read your conversations with the assistant;
- it does not change the assistant's answers;
- it does not control the internal behavior of the speaker;
- it does not require a cloud account for local device communication.

## Requirements

- Node.js 18 or newer;
- AI Desktop Buddy by AI Appliances;
- your computer and device on the same local network.

## License

MIT
