# Text as numbers: tour narration

Generated from `lesson.js`. Save each line as the file named, in this folder, then run
`node tools/voiceover.mjs text-as-numbers manifest`.

## promise → `promise.mp3`

Computers can't store letters. Only numbers. So what is H?

## build → `build.mp3`

Everyone agrees on a table. H is seventy-two. E is sixty-nine. L is seventy-six. Each number fits in one byte: eight bits.

## demo → `demo.mp3`

Plain letters take one byte. An accented e takes two. A euro sign takes three. That's UTF-8, and almost the whole web uses it.

## break → `break.mp3`

Now Eve signs up as paypal. Except that a is a Cyrillic a. It looks identical. The bytes aren't. A filter that checks by eye lets her straight in.

## mixup → `mixup.mp3`

Or two systems disagree. One writes café in UTF-8. The other reads it as Windows twelve fifty-two. Same bytes, different text.

## patch → `patch.mp3`

Computers need representations. Agree on one encoding, compare bytes, not looks, and remember that crypto only ever sees the bytes.

## next → `next.mp3`

Every one of those bytes is eight bits. Eight tiny switches. Next, what happens when you flip just one.
