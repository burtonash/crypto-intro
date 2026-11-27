// ROT13: Caesar with the key fixed at 13, half the alphabet, so encrypting
// twice is a full trip round (13 + 13 = 26) and lands back on the original.
import { encrypt } from '../caesar/caesar.js';
export const rot13 = (s) => encrypt(s, 13);
