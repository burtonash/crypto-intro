# Kerckhoffs's principle: tour narration

Generated from `lesson.js`. Save each line as the file named, in this folder, then run
`node tools/voiceover.mjs kerckhoffs manifest`.

## promise → `promise.mp3`

What if nobody knew how your cipher worked? Not just the key. The whole method.

## build → `build.mp3`

Alice invents her own recipe. Write it backwards. Shift every letter by seven. Swap neighbouring letters. No key. The recipe is the secret.

## demo → `demo.mp3`

Bob knows the recipe, so he runs it backwards. Eve doesn't know it. Surely that's enough.

## break → `break.mp3`

Home-made recipes are built from the same few ideas. Reverse it. Shift it. Swap things round. So Eve tries every short recipe. Twenty-three thousand of them, in under a second.

## leak → `leak.mp3`

And recipes leak. Devices get captured, software gets taken apart, people change jobs. When a method leaks, every message ever sent is exposed. When a key leaks, you just change the key.

## patch → `patch.mp3`

Kerckhoffs said it in eighteen eighty-three. A cipher should stay secure even if the enemy knows exactly how it works. Make the method public. Keep only the key secret.

## next → `next.mp3`

That's arc one. Every pen-and-paper cipher, broken. Next, the machine age. Letters become numbers, numbers become bits, and things get interesting.
