# Caesar cipher: tour narration

Generated from `lesson.js`. Save each line as the file named, in this folder, then run
`node tools/voiceover.mjs caesar manifest`.

## promise → `promise.mp3`

This looks scrambled. K, H, O, O, R. Let's break it.

## build → `build.mp3`

The Caesar cipher moves every letter three places along the alphabet. A becomes D. Run off the end, and Z wraps round to C.

## demo → `demo.mp3`

Alice writes hello, shifts it by three, and sends K, H, O, O, R. Bob knows the key, so he shifts back three and reads hello.

## break → `break.mp3`

Now Eve. She sees the message, but not the key. She doesn't need it. There are only twenty-five keys, so she tries every one. Shift three reads hello. Broken.

## patch → `patch.mp3`

That's the lesson. A tiny keyspace is not security. Caesar has twenty-five keys. A modern cipher like AES has two to the power of a hundred and twenty-eight. Nobody is trying those one by one.

## next → `next.mp3`

So what if every letter had its own mapping? That's the substitution cipher. Far more keys. Still broken. See you there.
