# ROT13: tour narration

Generated from `lesson.js`. Save each line as the file named, in this folder, then run
`node tools/voiceover.mjs rot13 manifest`.

## promise → `promise.mp3`

Meet the cipher that undoes itself. U, R, Y, Y, B.

## build → `build.mp3`

Rotate every letter by thirteen. That's exactly half the alphabet, so the two halves just swap. A becomes N. N becomes A.

## demo → `demo.mp3`

Alice rotates hello by thirteen and sends it. Bob doesn't need a separate decoder. He rotates by thirteen again, and reads hello.

## break → `break.mp3`

Eve doesn't need to guess a key. The key is thirteen. It's always thirteen. Everyone knows it. She applies it once, and reads the message.

## patch → `patch.mp3`

A key everyone knows is no key at all. ROT13 hides spoilers from your own eyes. It hides nothing from anyone who wants to read it.

## next → `next.mp3`

So what if we shuffled the whole alphabet, and kept the shuffle secret? Next, the substitution cipher.
