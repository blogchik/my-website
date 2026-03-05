"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- types ---------- */
type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
type OutputFormat = "hex-lower" | "hex-upper" | "base64";

interface HistoryEntry {
  id: string;
  input: string;
  algorithm: HashAlgorithm;
  format: OutputFormat;
  result: string;
  createdAt: number;
}

/* ---------- constants ---------- */
const ALGORITHMS: HashAlgorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

const ALGO_BITS: Record<HashAlgorithm, number> = {
  "MD5": 128, "SHA-1": 160, "SHA-256": 256, "SHA-384": 384, "SHA-512": 512,
};

const FORMAT_LABELS: Record<OutputFormat, string> = {
  "hex-lower": "Hex (lowercase)",
  "hex-upper": "Hex (UPPERCASE)",
  "base64":    "Base64",
};

const HISTORY_KEY = "hash_gen_history";
const MAX_HISTORY = 15;

/* ---------- MD5 pure-JS implementation (RFC 1321) ---------- */
function md5Bytes(str: string): Uint8Array {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff);
  }
  function rol(n: number, c: number) { return (n << c) | (n >>> (32 - c)); }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(c ^ (b | ~d), a, b, x, s, t);

  // UTF-8 encode
  const msg = unescape(encodeURIComponent(str));
  const nblk = ((msg.length + 8) >> 6) + 1;
  const x: number[] = new Array(nblk * 16).fill(0);
  for (let i = 0; i < msg.length; i++) x[i >> 2] |= msg.charCodeAt(i) << ((i % 4) * 8);
  x[msg.length >> 2] |= 0x80 << ((msg.length % 4) * 8);
  x[nblk * 16 - 2] = msg.length * 8;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d];
    // R1
    a=ff(a,b,c,d,x[i],7,-680876936);    d=ff(d,a,b,c,x[i+1],12,-389564586);
    c=ff(c,d,a,b,x[i+2],17,606105819);  b=ff(b,c,d,a,x[i+3],22,-1044525330);
    a=ff(a,b,c,d,x[i+4],7,-176418897);  d=ff(d,a,b,c,x[i+5],12,1200080426);
    c=ff(c,d,a,b,x[i+6],17,-1473231341);b=ff(b,c,d,a,x[i+7],22,-45705983);
    a=ff(a,b,c,d,x[i+8],7,1770035416); d=ff(d,a,b,c,x[i+9],12,-1958414417);
    c=ff(c,d,a,b,x[i+10],17,-42063);   b=ff(b,c,d,a,x[i+11],22,-1990404162);
    a=ff(a,b,c,d,x[i+12],7,1804603682);d=ff(d,a,b,c,x[i+13],12,-40341101);
    c=ff(c,d,a,b,x[i+14],17,-1502002290);b=ff(b,c,d,a,x[i+15],22,1236535329);
    // R2
    a=gg(a,b,c,d,x[i+1],5,-165796510); d=gg(d,a,b,c,x[i+6],9,-1069501632);
    c=gg(c,d,a,b,x[i+11],14,643717713);b=gg(b,c,d,a,x[i],20,-373897302);
    a=gg(a,b,c,d,x[i+5],5,-701558691); d=gg(d,a,b,c,x[i+10],9,38016083);
    c=gg(c,d,a,b,x[i+15],14,-660478335);b=gg(b,c,d,a,x[i+4],20,-405537848);
    a=gg(a,b,c,d,x[i+9],5,568446438);  d=gg(d,a,b,c,x[i+14],9,-1019803690);
    c=gg(c,d,a,b,x[i+3],14,-187363961);b=gg(b,c,d,a,x[i+8],20,1163531501);
    a=gg(a,b,c,d,x[i+13],5,-1444681467);d=gg(d,a,b,c,x[i+2],9,-51403784);
    c=gg(c,d,a,b,x[i+7],14,1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);
    // R3
    a=hh(a,b,c,d,x[i+5],4,-378558);    d=hh(d,a,b,c,x[i+8],11,-2022574463);
    c=hh(c,d,a,b,x[i+11],16,1839030562);b=hh(b,c,d,a,x[i+14],23,-35309556);
    a=hh(a,b,c,d,x[i+1],4,-1530992060);d=hh(d,a,b,c,x[i+4],11,1272893353);
    c=hh(c,d,a,b,x[i+7],16,-155497632);b=hh(b,c,d,a,x[i+10],23,-1094730640);
    a=hh(a,b,c,d,x[i+13],4,681279174); d=hh(d,a,b,c,x[i],11,-358537222);
    c=hh(c,d,a,b,x[i+3],16,-722521979);b=hh(b,c,d,a,x[i+6],23,76029189);
    a=hh(a,b,c,d,x[i+9],4,-640364487); d=hh(d,a,b,c,x[i+12],11,-421815835);
    c=hh(c,d,a,b,x[i+15],16,530742520);b=hh(b,c,d,a,x[i+2],23,-995338651);
    // R4
    a=ii(a,b,c,d,x[i],6,-198630844);   d=ii(d,a,b,c,x[i+7],10,1126891415);
    c=ii(c,d,a,b,x[i+14],15,-1416354905);b=ii(b,c,d,a,x[i+5],21,-57434055);
    a=ii(a,b,c,d,x[i+12],6,1700485571);d=ii(d,a,b,c,x[i+3],10,-1894986606);
    c=ii(c,d,a,b,x[i+10],15,-1051523); b=ii(b,c,d,a,x[i+1],21,-2054922799);
    a=ii(a,b,c,d,x[i+8],6,1873313359); d=ii(d,a,b,c,x[i+15],10,-30611744);
    c=ii(c,d,a,b,x[i+6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21,1309151649);
    a=ii(a,b,c,d,x[i+4],6,-145523070); d=ii(d,a,b,c,x[i+11],10,-1120210379);
    c=ii(c,d,a,b,x[i+2],15,718787259); b=ii(b,c,d,a,x[i+9],21,-343485551);
    a=safeAdd(a,oa); b=safeAdd(b,ob); c=safeAdd(c,oc); d=safeAdd(d,od);
  }
  const out = new Uint8Array(16);
  const v = new DataView(out.buffer);
  v.setInt32(0, a, true); v.setInt32(4, b, true);
  v.setInt32(8, c, true); v.setInt32(12, d, true);
  return out;
}

/* ---------- SHA helpers ---------- */
function rotl32(x: number, n: number) { return ((x << n) | (x >>> (32 - n))) >>> 0; }
function rotr32(x: number, n: number) { return ((x >>> n) | (x << (32 - n))) >>> 0; }

/* SHA-1 (RFC 3174) — pure JS */
function sha1Bytes(str: string): Uint8Array {
  const msg = new TextEncoder().encode(str);
  const padded = new Uint8Array(((msg.length + 9 + 63) & ~63));
  padded.set(msg); padded[msg.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, (msg.length * 8) >>> 0, false);
  let h0=0x67452301, h1=0xEFCDAB89, h2=0x98BADCFE, h3=0x10325476, h4=0xC3D2E1F0;
  const w = new Uint32Array(80);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i=0; i<16; i++) w[i] = dv.getUint32(off + i*4, false);
    for (let i=16; i<80; i++) w[i] = rotl32(w[i-3]^w[i-8]^w[i-14]^w[i-16], 1);
    let a=h0, b=h1, c=h2, d=h3, e=h4;
    for (let i=0; i<80; i++) {
      let f=0, k=0;
      if      (i<20) { f=(b&c)|(~b&d); k=0x5A827999; }
      else if (i<40) { f=b^c^d;         k=0x6ED9EBA1; }
      else if (i<60) { f=(b&c)|(b&d)|(c&d); k=0x8F1BBCDC; }
      else           { f=b^c^d;         k=0xCA62C1D6; }
      const t=(rotl32(a,5)+f+e+k+w[i])>>>0;
      e=d; d=c; c=rotl32(b,30); b=a; a=t;
    }
    h0=(h0+a)>>>0; h1=(h1+b)>>>0; h2=(h2+c)>>>0; h3=(h3+d)>>>0; h4=(h4+e)>>>0;
  }
  const out=new Uint8Array(20), odv=new DataView(out.buffer);
  [h0,h1,h2,h3,h4].forEach((v,i) => odv.setUint32(i*4, v, false));
  return out;
}

/* SHA-256 (FIPS 180-4) — pure JS */
function sha256Bytes(str: string): Uint8Array {
  const K=[
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ];
  const H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const msg=new TextEncoder().encode(str);
  const padded=new Uint8Array(((msg.length+9+63)&~63));
  padded.set(msg); padded[msg.length]=0x80;
  const dv=new DataView(padded.buffer);
  dv.setUint32(padded.length-4,(msg.length*8)>>>0,false);
  const w=new Uint32Array(64);
  for (let off=0; off<padded.length; off+=64) {
    for (let i=0; i<16; i++) w[i]=dv.getUint32(off+i*4,false);
    for (let i=16; i<64; i++) {
      const s0=rotr32(w[i-15],7)^rotr32(w[i-15],18)^(w[i-15]>>>3);
      const s1=rotr32(w[i-2],17)^rotr32(w[i-2],19)^(w[i-2]>>>10);
      w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;
    }
    let [a,b,c,d,e,f,g,h]=[...H] as number[];
    for (let i=0; i<64; i++) {
      const S1=rotr32(e,6)^rotr32(e,11)^rotr32(e,25);
      const ch=(e&f)^(~e&g);
      const T1=(h+S1+ch+K[i]+w[i])>>>0;
      const S0=rotr32(a,2)^rotr32(a,13)^rotr32(a,22);
      const maj=(a&b)^(a&c)^(b&c);
      const T2=(S0+maj)>>>0;
      h=g; g=f; f=e; e=(d+T1)>>>0; d=c; c=b; b=a; a=(T1+T2)>>>0;
    }
    H[0]=(H[0]+a)>>>0; H[1]=(H[1]+b)>>>0; H[2]=(H[2]+c)>>>0; H[3]=(H[3]+d)>>>0;
    H[4]=(H[4]+e)>>>0; H[5]=(H[5]+f)>>>0; H[6]=(H[6]+g)>>>0; H[7]=(H[7]+h)>>>0;
  }
  const out=new Uint8Array(32), odv=new DataView(out.buffer);
  H.forEach((v,i) => odv.setUint32(i*4,v,false));
  return out;
}

/* SHA-512 / SHA-384 (FIPS 180-4) — pure JS using BigInt for 64-bit words */
function sha512FamilyBytes(str: string, is384: boolean): Uint8Array {
  const M64 = 0xFFFFFFFFFFFFFFFFn;
  const rotr64 = (x: bigint, n: bigint) => ((x >> n) | (x << (64n - n))) & M64;
  const add64 = (...xs: bigint[]) => xs.reduce((a, b) => (a + b) & M64, 0n);
  const K512: bigint[] = [
    0x428a2f98d728ae22n,0x7137449123ef65cdn,0xb5c0fbcfec4d3b2fn,0xe9b5dba58189dbbcn,
    0x3956c25bf348b538n,0x59f111f1b605d019n,0x923f82a4af194f9bn,0xab1c5ed5da6d8118n,
    0xd807aa98a3030242n,0x12835b0145706fben,0x243185be4ee4b28cn,0x550c7dc3d5ffb4e2n,
    0x72be5d74f27b896fn,0x80deb1fe3b1696b1n,0x9bdc06a725c71235n,0xc19bf174cf692694n,
    0xe49b69c19ef14ad2n,0xefbe4786384f25e3n,0x0fc19dc68b8cd5b5n,0x240ca1cc77ac9c65n,
    0x2de92c6f592b0275n,0x4a7484aa6ea6e483n,0x5cb0a9dcbd41fbd4n,0x76f988da831153b5n,
    0x983e5152ee66dfabn,0xa831c66d2db43210n,0xb00327c898fb213fn,0xbf597fc7beef0ee4n,
    0xc6e00bf33da88fc2n,0xd5a79147930aa725n,0x06ca6351e003826fn,0x142929670a0e6e70n,
    0x27b70a8546d22ffcn,0x2e1b21385c26c926n,0x4d2c6dfc5ac42aedn,0x53380d139d95b3dfn,
    0x650a73548baf63den,0x766a0abb3c77b2a8n,0x81c2c92e47edaee6n,0x92722c851482353bn,
    0xa2bfe8a14cf10364n,0xa81a664bbc423001n,0xc24b8b70d0f89791n,0xc76c51a30654be30n,
    0xd192e819d6ef5218n,0xd69906245565a910n,0xf40e35855771202an,0x106aa07032bbd1b8n,
    0x19a4c116b8d2d0c8n,0x1e376c085141ab53n,0x2748774cdf8eeb99n,0x34b0bcb5e19b48a8n,
    0x391c0cb3c5c95a63n,0x4ed8aa4ae3418acbn,0x5b9cca4f7763e373n,0x682e6ff3d6b2b8a3n,
    0x748f82ee5defb2fcn,0x78a5636f43172f60n,0x84c87814a1f0ab72n,0x8cc702081a6439ecn,
    0x90befffa23631e28n,0xa4506cebde82bde9n,0xbef9a3f7b2c67915n,0xc67178f2e372532bn,
    0xca273eceea26619cn,0xd186b8c721c0c207n,0xeada7dd6cde0eb1en,0xf57d4f7fee6ed178n,
    0x06f067aa72176fban,0x0a637dc5a2c898a6n,0x113f9804bef90daen,0x1b710b35131c471bn,
    0x28db77f523047d84n,0x32caab7b40c72493n,0x3c9ebe0a15c9bebcn,0x431d67c49c100d4cn,
    0x4cc5d4becb3e42b6n,0x597f299cfc657e2an,0x5fcb6fab3ad6faecn,0x6c44198c4a475817n,
  ];
  const H512 = [
    0x6a09e667f3bcc908n,0xbb67ae8584caa73bn,0x3c6ef372fe94f82bn,0xa54ff53a5f1d36f1n,
    0x510e527fade682d1n,0x9b05688c2b3e6c1fn,0x1f83d9abfb41bd6bn,0x5be0cd19137e2179n,
  ];
  const H384 = [
    0xcbbb9d5dc1059ed8n,0x629a292a367cd507n,0x9159015a3070dd17n,0x152fecd8f70e5939n,
    0x67332667ffc00b31n,0x8eb44a8768581511n,0xdb0c2e0d64f98fa7n,0x47b5481dbefa4fa4n,
  ];
  const H = [...(is384 ? H384 : H512)];
  const msg = new TextEncoder().encode(str);
  const bitLen = BigInt(msg.length) * 8n;
  const padded = new Uint8Array(((msg.length + 17 + 127) & ~127));
  padded.set(msg); padded[msg.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setBigUint64(padded.length - 8, bitLen, false);
  const w = new BigUint64Array(80);
  for (let off = 0; off < padded.length; off += 128) {
    for (let i=0; i<16; i++) w[i] = dv.getBigUint64(off + i*8, false);
    for (let i=16; i<80; i++) {
      const s0 = rotr64(w[i-15],1n)^rotr64(w[i-15],8n)^(w[i-15]>>7n);
      const s1 = rotr64(w[i-2],19n)^rotr64(w[i-2],61n)^(w[i-2]>>6n);
      w[i] = add64(w[i-16], s0, w[i-7], s1);
    }
    let [a,b,c,d,e,f,g,h] = H;
    for (let i=0; i<80; i++) {
      const S1 = rotr64(e,14n)^rotr64(e,18n)^rotr64(e,41n);
      const ch = ((e&f)^((~e)&g))&M64;
      const T1 = add64(h, S1, ch, K512[i], w[i]);
      const S0 = rotr64(a,28n)^rotr64(a,34n)^rotr64(a,39n);
      const maj = (a&b)^(a&c)^(b&c);
      const T2 = add64(S0, maj);
      h=g; g=f; f=e; e=add64(d,T1); d=c; c=b; b=a; a=add64(T1,T2);
    }
    H[0]=add64(H[0],a); H[1]=add64(H[1],b); H[2]=add64(H[2],c); H[3]=add64(H[3],d);
    H[4]=add64(H[4],e); H[5]=add64(H[5],f); H[6]=add64(H[6],g); H[7]=add64(H[7],h);
  }
  const outLen = is384 ? 48 : 64;
  const out = new Uint8Array(outLen), odv = new DataView(out.buffer);
  for (let i=0; i<outLen/8; i++) odv.setBigUint64(i*8, H[i], false);
  return out;
}

/* ---------- helpers ---------- */
async function computeHash(input: string, algo: HashAlgorithm): Promise<Uint8Array> {
  // All algorithms are pure-JS — works on both HTTP and HTTPS
  if (algo === "MD5")     return md5Bytes(input);
  if (algo === "SHA-1")   return sha1Bytes(input);
  if (algo === "SHA-256") return sha256Bytes(input);
  if (algo === "SHA-384") return sha512FamilyBytes(input, true);
  return sha512FamilyBytes(input, false); // SHA-512
}

function bytesToHex(bytes: Uint8Array, upper = false): string {
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return upper ? hex.toUpperCase() : hex;
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function applyFormat(bytes: Uint8Array, fmt: OutputFormat): string {
  if (fmt === "base64")    return bytesToBase64(bytes);
  if (fmt === "hex-upper") return bytesToHex(bytes, true);
  return bytesToHex(bytes);
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

function readHistory(): HistoryEntry[] {
  if (typeof document === "undefined") return [];
  try {
    const c = document.cookie.split("; ").find((c) => c.startsWith(`${HISTORY_KEY}=`));
    if (!c) return [];
    return JSON.parse(decodeURIComponent(c.split("=")[1]));
  } catch { return []; }
}

function writeHistory(entries: HistoryEntry[]) {
  const val = encodeURIComponent(JSON.stringify(entries.slice(0, MAX_HISTORY)));
  document.cookie = `${HISTORY_KEY}=${val};path=/;max-age=${60 * 60 * 24 * 400};SameSite=Lax`;
}

/* ---------- icons ---------- */
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
function HashIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

/* ========== COMPONENT ========== */
export function HashPlayground() {
  const [input, setInput]       = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [format, setFormat]     = useState<OutputFormat>("hex-lower");
  const [result, setResult]     = useState("");
  const [computing, setComputing] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [history, setHistory]   = useState<HistoryEntry[]>([]);
  const [spinning, setSpinning] = useState(false);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history from cookie only on the client (avoid SSR/client mismatch)
  useEffect(() => {
    setHistory(readHistory());
  }, []);

  // Auto-compute on input / algorithm / format change (debounced 200ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) { setResult(""); return; }

    debounceRef.current = setTimeout(async () => {
      setComputing(true);
      try {
        const bytes = await computeHash(input, algorithm);
        setResult(applyFormat(bytes, format));
      } catch {
        setResult("Error computing hash");
      } finally {
        setComputing(false);
      }
    }, 200);
  }, [input, algorithm, format]);

  async function handleCopy() {
    if (!result) return;
    await copyToClipboard(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function saveToHistory() {
    if (!result || !input.trim()) return;
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
    const entry: HistoryEntry = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      input: input.length > 60 ? input.slice(0, 60) + "…" : input,
      algorithm,
      format,
      result,
      createdAt: Date.now(),
    };
    const updated = [entry, ...history].filter(
      (e, i, arr) => arr.findIndex((x) => x.result === e.result) === i
    ).slice(0, MAX_HISTORY);
    setHistory(updated);
    writeHistory(updated);
  }

  function clearHistory() { setHistory([]); writeHistory([]); }

  const charLen = result.length;
  const bits = ALGO_BITS[algorithm];

  return (
    <div className="animate-fade-up space-y-8" style={{ animationDelay: "0.2s" }}>
      {/* ── Two-column playground ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">

        {/* ── Left: Parameters ── */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-5 h-fit">
          <h3 className="text-xs font-medium text-navy/40 uppercase tracking-widest">
            Parameters
          </h3>

          {/* Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-navy/50 uppercase tracking-wider">
              Input String
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your text here…"
              rows={5}
              suppressHydrationWarning
              className="w-full bg-navy/[0.04] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono
                focus:outline-none focus:border-orange/50 transition-colors resize-none placeholder:text-navy/25"
            />
            <div className="text-right text-[10px] text-navy/30 tabular-nums">
              {new TextEncoder().encode(input).length} bytes
            </div>
          </div>

          {/* Algorithm */}
          <div className="space-y-1.5">
            <label className="text-xs text-navy/50 uppercase tracking-wider">
              Algorithm
            </label>
            <div className="flex flex-wrap gap-2">
              {ALGORITHMS.map((algo) => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
                    algorithm === algo
                      ? "bg-orange/10 border-orange/50 text-navy"
                      : "border-navy/10 text-navy/40 hover:border-navy/20 hover:text-navy/60"
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          {/* Output format */}
          <div className="space-y-1.5">
            <label className="text-xs text-navy/50 uppercase tracking-wider">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
              suppressHydrationWarning
              className="w-full bg-navy/[0.04] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono
                focus:outline-none focus:border-orange/50 transition-colors cursor-pointer"
            >
              {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Save to history button */}
          <button
            onClick={saveToHistory}
            disabled={!result}
            className="group/btn w-full bg-orange text-navy font-bold text-sm px-6 py-2.5 rounded-lg
              hover:shadow-lg hover:shadow-orange/25 hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
              transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <HashIcon className={`transition-transform duration-500 ${spinning ? "rotate-[360deg]" : ""}`} />
            Save to History
          </button>
        </div>

        {/* ── Right: Output ── */}
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              {/* Result */}
              <div className="border border-navy/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between bg-navy/[0.03] px-4 py-3 border-b border-navy/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-navy/50 uppercase tracking-wider">
                      {algorithm} Hash
                    </span>
                    {computing && (
                      <span className="text-[10px] text-orange animate-pulse">computing…</span>
                    )}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs text-navy/50 hover:text-orange transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <><CheckIcon className="text-green-600" /><span className="text-green-600">Copied!</span></>
                    ) : (
                      <><CopyIcon /><span>Copy</span></>
                    )}
                  </button>
                </div>
                <div
                  className="px-5 py-6 cursor-pointer group"
                  onClick={handleCopy}
                  title="Click to copy"
                >
                  <code className="block font-mono text-navy/90 break-all leading-relaxed text-sm select-all group-hover:text-orange transition-colors duration-200">
                    {result}
                  </code>
                </div>
              </div>

              {/* Hash info */}
              <div className="border border-navy/10 rounded-2xl px-5 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-navy/35 uppercase tracking-wider mb-1">Algorithm</p>
                    <p className="font-bold text-sm text-navy">{algorithm}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy/35 uppercase tracking-wider mb-1">Output size</p>
                    <p className="font-bold text-sm text-navy">{bits} bits</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy/35 uppercase tracking-wider mb-1">Format</p>
                    <p className="font-bold text-sm text-navy">{FORMAT_LABELS[format]}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy/35 uppercase tracking-wider mb-1">Length</p>
                    <p className="font-bold text-sm text-navy">{charLen} chars</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="border border-dashed border-navy/10 rounded-2xl flex-1 min-h-[280px] flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-4 opacity-30">#️⃣</span>
              <p className="text-sm text-navy/40">
                Type a string on the left to see its hash
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              Saved Hashes
            </h2>
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-navy/40 hover:text-red-500 transition-colors cursor-pointer"
            >
              <TrashIcon />
              <span>Clear</span>
            </button>
          </div>

          <div className="space-y-2">
            {history.map((entry) => (
              <details
                key={entry.id}
                className="border border-navy/10 rounded-xl overflow-hidden group"
              >
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-navy/[0.02] transition-colors list-none">
                  <div className="flex items-center gap-3 text-sm min-w-0">
                    <span className="text-xs font-medium text-orange shrink-0">{entry.algorithm}</span>
                    <span className="text-navy/60 font-mono text-xs truncate">{entry.input}</span>
                  </div>
                  <span className="text-[10px] text-navy/30 tabular-nums shrink-0 ml-3">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </span>
                </summary>
                <div className="px-4 pb-3 border-t border-navy/5 pt-3 space-y-2">
                  <code className="block text-xs font-mono text-navy/60 break-all select-all">
                    {entry.result}
                  </code>
                  <p className="text-[10px] text-navy/30">{FORMAT_LABELS[entry.format]}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
