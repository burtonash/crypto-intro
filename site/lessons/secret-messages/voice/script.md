# Secret messages: tour narration

Generated from `lesson.js`. Save each line as the file named, in this folder, then run
`node tools/voiceover.mjs secret-messages manifest`.

## promise → `promise.mp3`

Is this a secret message? It certainly looks like one.

## build → `build.mp3`

Here's the same message five ways. Backwards. Hex. Binary. Base sixty-four. Morse. Each one is a recipe, and none of them needs a key.

## demo → `demo.mp3`

Alice encodes her message and sends it. Bob runs the recipe backwards and reads it. So can anyone else.

## break → `break.mp3`

Eve has never seen this message. She doesn't need to. She runs every decoder she knows. One of them reads as English. That's it. No key, no secret, nothing to break.

## patch → `patch.mp3`

Encoding is not encryption. Encoding changes how a message looks. Encryption needs a secret, a key, that the attacker doesn't have.

## next → `next.mp3`

So let's add a key. The simplest one there is: a single number. Next, the Caesar cipher.
