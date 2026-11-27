// The learning ladder (PRD §6). One row per episode: what we build, how we
// break it, what that teaches. Set `live: true` when an episode ships; the
// labs index, forward links and the attacks-unlocked tracker all read this.

const ep = (n, slug, build, brk, lesson, live = false) => ({ n, slug, build, break: brk, lesson, live });

export const arcs = [
  { n: 1, title: 'Secret writing is fragile', thesis: 'A cipher is good because it survives an attacker who knows how it works, not because it looks scrambled.', episodes: [
    ep(1, 'secret-messages', 'Secret messages', 'Read it if you know the trick', 'Encoding is not encryption', true),
    ep(2, 'caesar', 'Caesar cipher', 'Try all 25 shifts', 'Small keyspaces are dead', true),
    ep(3, 'rot13', 'ROT13', 'Apply it twice', 'Some ciphers barely deserve the name', true),
    ep(4, 'substitution', 'Substitution cipher', 'Frequency analysis', 'Patterns survive encryption', true),
    ep(5, 'vigenere', 'Vigenère cipher', 'Repeated-key analysis', 'Reusing structure leaks structure', true),
    ep(6, 'kerckhoffs', 'Kerckhoffs\'s principle', '"What if the algorithm is secret?"', 'Only the key should need to be secret'),
  ] },
  { n: 2, title: 'Bits, XOR and perfect secrecy', thesis: 'From letters to machine crypto: XOR is reversible, which is exactly why reusing a key is fatal.', episodes: [
    ep(7, 'text-as-numbers', 'Text as numbers', 'Encoding confusion', 'Computers need representations'),
    ep(8, 'bits-and-bytes', 'Bits and bytes', 'Flip one bit', 'Tiny changes matter'),
    ep(9, 'xor', 'XOR machine', 'XOR twice to recover', 'Reversibility can be useful'),
    ep(10, 'stream-cipher', 'Stream-style encryption', 'Reuse the keystream', 'Reused masks leak secrets'),
    ep(11, 'one-time-pad', 'One-time pad', 'Reuse the pad', 'Perfect secrecy has brutal requirements'),
    ep(12, 'randomness', 'Randomness', 'Predictable "random"', 'Bad randomness ruins good crypto'),
  ] },
  { n: 3, title: 'Fingerprints, tampering and authentication', thesis: 'Encryption hides a message. Authentication protects meaning.', episodes: [
    ep(13, 'checksum', 'Tiny checksum', 'Change message, fix checksum', 'Checksums catch accidents, not attackers'),
    ep(14, 'toy-hash', 'Toy hash', 'Find a collision', 'Hashes need huge output spaces'),
    ep(15, 'hash-size', 'Better hash intuition', 'Brute force tiny hash', 'Size matters'),
    ep(16, 'avalanche', 'Avalanche effect', 'Tiny change, huge digest change', 'Good hashes scramble relationships'),
    ep(17, 'password-hashing', 'Password hashing', 'Rainbow tables / common passwords', 'Hashing alone is not enough'),
    ep(18, 'salt', 'Salted passwords', 'Same password, different hash', 'Salts kill precomputed attacks'),
    ep(19, 'slow-hashing', 'Slow password hashing', 'Fast brute force', 'Attack cost matters'),
    ep(20, 'mac', 'MAC', 'Edit message without key', 'Authentication needs a secret'),
    ep(21, 'hmac', 'HMAC', 'Naive hash constructions', 'Composition matters'),
  ] },
  { n: 4, title: 'Key exchange and public-key weirdness', thesis: 'The break shifts from doable to toy-sized: real security comes from numbers too big to search.', episodes: [
    ep(22, 'key-distribution', 'Shared secret encryption', '"How did we share the key?"', 'Key distribution is the real problem'),
    ep(23, 'modular-arithmetic', 'Modular arithmetic toy', 'Reverse small examples', 'One-way-ish functions'),
    ep(24, 'tiny-dh', 'DH with tiny numbers', 'Brute-force Alice\'s secret', 'Real security needs huge groups'),
    ep(25, 'dh-colours', 'DH with colours', 'Eve watches everything', 'Public exchange can create private secrets'),
    ep(26, 'dh-mitm', 'Man-in-the-middle DH', 'Eve swaps keys', 'Key exchange needs authentication'),
    ep(27, 'key-pairs', 'Public/private key pair', 'Guess the private key (toy)', 'Trapdoors are asymmetric'),
    ep(28, 'toy-rsa', 'RSA toy model', 'Factor tiny modulus', 'Real RSA relies on hard factoring'),
    ep(29, 'elliptic-curves', 'Elliptic curve intuition', 'Tiny curve brute force', 'Smaller keys, different hard problem'),
  ] },
  { n: 5, title: 'Signatures, identity and trust', thesis: 'The story becomes social: who said this, and can we trust the key that says so?', episodes: [
    ep(30, 'signatures', 'Digital signature', 'Modify message after signing', 'Signatures bind identity to exact data'),
    ep(31, 'verification', 'Verify with public key', 'Use the wrong public key', 'Verification needs a trusted key'),
    ep(32, 'certificates', 'Certificates', 'Fake certificate', 'Identity needs a trust model'),
    ep(33, 'cert-chains', 'Certificate chains', 'Break the chain', 'Trust is delegated'),
    ep(34, 'tls-toy', 'TLS toy handshake', 'MITM without cert check', 'Public-key crypto needs protocol discipline'),
    ep(35, 'replay', 'Replay attack', 'Reuse an old valid message', 'Freshness matters'),
    ep(36, 'nonces', 'Nonces and timestamps', 'Replay becomes harder', 'Protocols need context'),
  ] },
  { n: 6, title: 'Commitments and proving things', thesis: 'The break becomes "can the prover cheat?", and the odds of cheating collapse with every round.', episodes: [
    ep(37, 'commitments', 'Commitment scheme', 'Change your mind after committing', 'Binding matters'),
    ep(38, 'hiding', 'Hidden commitment', 'Reveal secret too early', 'Hiding matters'),
    ep(39, 'commit-reveal', 'Commit-reveal game', 'Last-mover advantage', 'Timing attacks protocol fairness'),
    ep(40, 'zk-cave', 'ZK cave proof', 'Cheat once', 'Soundness is probabilistic'),
    ep(41, 'zk-rounds', 'Repeat the proof', 'Cheat probability shrinks', 'Repetition increases confidence'),
    ep(42, 'graph-colouring', 'Graph colouring proof', 'Fake witness fails challenge', 'Prove knowledge without revealing it'),
    ep(43, 'fiat-shamir', 'Fiat-Shamir idea', 'Replace verifier challenge', 'Interaction can sometimes be removed'),
    ep(44, 'zk-snarks', 'zk-SNARK intuition', '(No full break)', 'Some systems rely on deep assumptions'),
  ] },
  { n: 7, title: 'Sharing secrets and computing privately', thesis: 'Breaking becomes "here is the promise, here is the cost, here is where the toy model lies".', episodes: [
    ep(45, 'bad-splitting', 'Split a secret badly', 'One share reveals too much', 'Not all splitting is secret sharing'),
    ep(46, 'shamir', 'Shamir secret sharing', 'Use too few shares', 'Thresholds matter'),
    ep(47, 'reconstruction', 'Reconstruct secret', 'Lose enough shares', 'Availability vs secrecy'),
    ep(48, 'threshold-signing', 'Threshold signing', 'One signer tries alone', 'Groups can control keys'),
    ep(49, 'mpc-voting', 'MPC toy voting', 'One party reveals input', 'Privacy needs protocol rules'),
    ep(50, 'garbled-circuits', 'Garbled circuit intuition', 'Try to read hidden wires', 'Computation can hide inputs'),
    ep(51, 'psi', 'Private set intersection', 'Compare lists naively', 'Useful result without full reveal'),
    ep(52, 'homomorphic', 'Homomorphic addition', 'Try unsupported operation', 'Encrypted computation is limited'),
    ep(53, 'fhe', 'FHE intuition', 'Everything gets expensive', 'Power has a cost'),
  ] },
];

export const episodes = arcs.flatMap((a) => a.episodes.map((e) => ({ ...e, arc: a.n })));
export const byNumber = (n) => episodes.find((e) => e.n === n);
export const bySlug = (slug) => episodes.find((e) => e.slug === slug);
/** The next few episodes after n, live or not. */
export const after = (n, count = 2) => episodes.filter((e) => e.n > n).slice(0, count);
