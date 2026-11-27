# Vigenère cipher: tour narration

Generated from `lesson.js`. Save each line as the file named, in this folder, then run
`node tools/voiceover.mjs vigenere manifest`.

## promise → `promise.mp3`

For three hundred years, people called this one the indecipherable cipher.

## build → `build.mp3`

Pick a keyword, like lemon. Shift the first letter by L, the next by E, then M, O, N, and round again. Every letter gets a different Caesar shift.

## demo → `demo.mp3`

Alice and Bob share the keyword. Alice shifts each letter forward, Bob shifts each one back. Even the same letter comes out differently each time.

## break → `break.mp3`

Eve doesn't know the keyword, but she knows it repeats. She tries splitting the message into columns, one length at a time. At the right length, each column looks like English again. Five stands out.

## solve → `solve.mp3`

Now every column is just a Caesar cipher. Count the letters in each one, find its shift, and the keyword falls out, one letter at a time.

## patch → `patch.mp3`

Reusing structure leaks structure. The keyword repeated, and the repeat gave away its length. After that, it was five Caesar ciphers, and Caesar falls in seconds.

## next → `next.mp3`

Every cipher so far was broken by someone who knew how it worked. So why not keep the method secret too? Next, Kerckhoffs's principle.
