# Substitution cipher: tour narration

Generated from `lesson.js`. Save each line as the file named, in this folder, then run
`node tools/voiceover.mjs substitution manifest`.

## promise → `promise.mp3`

Four times ten to the twenty-six possible keys. Far too many to try. So is it safe?

## build → `build.mp3`

Shuffle the whole alphabet. A becomes one letter, B another, and so on. The shuffle is the key.

## demo → `demo.mp3`

Alice writes a long letter and swaps every letter using the key. Bob has the same key, so he swaps them back.

## break → `break.mp3`

Eve can't try every key. She doesn't need to. Every E became the same letter, so she counts. The commonest letter is probably E. Then T, then A. Then she keeps swapping letters until it reads like English.

## patch → `patch.mp3`

Patterns survive encryption. The huge keyspace stopped brute force, and nothing else. One letter always became one letter, and that pattern gave the whole key away.

## next → `next.mp3`

So what if every letter had several disguises, and the disguise kept changing? Next, the Vigenère cipher.
