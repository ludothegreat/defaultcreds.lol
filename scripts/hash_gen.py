#!/usr/bin/env python3
"""
fake_hashes.py
Generate realistic-looking (but non-functional) password hash strings for UI demos.
"""

import argparse
import base64
import os
import random
import secrets
from typing import Callable, Dict, List

BCRYPT_B64 = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
CRYPT_B64  = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"


def _rng(seed: int | None):
    # Deterministic output when seed is provided, otherwise cryptographically random.
    if seed is None:
        return None
    r = random.Random(seed)
    return r


def _rand_bytes(n: int, r: random.Random | None) -> bytes:
    if r is None:
        return secrets.token_bytes(n)
    return bytes(r.randrange(0, 256) for _ in range(n))


def _rand_hex(nbytes: int, r: random.Random | None) -> str:
    return _rand_bytes(nbytes, r).hex()


def _rand_int(a: int, b: int, r: random.Random | None) -> int:
    if r is None:
        return secrets.randbelow(b - a + 1) + a
    return r.randint(a, b)


def _rand_choice(seq: str, r: random.Random | None) -> str:
    if r is None:
        return secrets.choice(seq)
    return r.choice(seq)


def _rand_str(alpha: str, n: int, r: random.Random | None) -> str:
    return "".join(_rand_choice(alpha, r) for _ in range(n))


def _b64_nopad(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii").rstrip("=")


# --- Fake hash generators (look real, not real) ---

def h_md5(r):     return _rand_hex(16, r)   # 32 hex
def h_sha1(r):    return _rand_hex(20, r)   # 40 hex
def h_sha256(r):  return _rand_hex(32, r)   # 64 hex
def h_sha512(r):  return _rand_hex(64, r)   # 128 hex

def h_ntlm(r):    return _rand_hex(16, r)   # 32 hex (MD4 of UTF-16LE in real life)
def h_lm(r):      return _rand_hex(16, r).upper()  # looks like LM/legacy dumps often uppercase

def h_mysql5(r):  # MySQL 4.1+ style: * + 40 hex (uppercase)
    return "*" + _rand_hex(20, r).upper()

def h_bcrypt(r):
    cost = _rand_int(4, 15, r)
    salt = _rand_str(BCRYPT_B64, 22, r)
    chk  = _rand_str(BCRYPT_B64, 31, r)
    return f"$2b${cost:02d}${salt}{chk}"

def h_argon2id(r):
    # Common-ish argon2id string format
    m = _rand_int(32768, 131072, r)
    t = _rand_int(2, 5, r)
    p = _rand_int(1, 4, r)
    salt = _b64_nopad(_rand_bytes(16, r))
    out  = _b64_nopad(_rand_bytes(32, r))
    return f"$argon2id$v=19$m={m},t={t},p={p}${salt}${out}"

def h_pbkdf2_sha256(r):
    # Passlib-style pbkdf2-sha256 format
    rounds = _rand_int(20000, 400000, r)
    salt = _b64_nopad(_rand_bytes(12, r))
    out  = _b64_nopad(_rand_bytes(32, r))
    return f"$pbkdf2-sha256${rounds}${salt}${out}"

def h_scrypt(r):
    # Passlib-style scrypt format (one of the common textual encodings)
    ln = _rand_int(12, 17, r)
    rr = _rand_int(8, 16, r)
    pp = _rand_int(1, 2, r)
    salt = _b64_nopad(_rand_bytes(12, r))
    out  = _b64_nopad(_rand_bytes(32, r))
    return f"$scrypt$ln={ln},r={rr},p={pp}${salt}${out}"

def h_sha512crypt(r):
    # glibc crypt SHA512: $6$[rounds=]$salt$hash
    rounds = _rand_int(5000, 200000, r)
    salt = _rand_str("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./", _rand_int(8, 16, r), r)
    h = _rand_str(CRYPT_B64, 86, r)
    return f"$6$rounds={rounds}${salt}${h}"

def h_sha256crypt(r):
    rounds = _rand_int(5000, 200000, r)
    salt = _rand_str("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./", _rand_int(8, 16, r), r)
    h = _rand_str(CRYPT_B64, 43, r)
    return f"$5$rounds={rounds}${salt}${h}"

def h_md5crypt(r):
    salt = _rand_str("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./", _rand_int(8, 12, r), r)
    h = _rand_str(CRYPT_B64, 22, r)
    return f"$1${salt}${h}"

def h_django_pbkdf2_sha256(r):
    # Django default: pbkdf2_sha256$iters$salt$hash
    iters = _rand_int(120000, 720000, r)
    salt = _rand_str("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 12, r)
    out  = _b64_nopad(_rand_bytes(32, r))
    return f"pbkdf2_sha256${iters}${salt}${out}"


GENS: Dict[str, Callable] = {
    "md5": h_md5,
    "sha1": h_sha1,
    "sha256": h_sha256,
    "sha512": h_sha512,
    "ntlm": h_ntlm,
    "lm": h_lm,
    "mysql5": h_mysql5,
    "bcrypt": h_bcrypt,
    "argon2id": h_argon2id,
    "pbkdf2-sha256": h_pbkdf2_sha256,
    "scrypt": h_scrypt,
    "sha512crypt": h_sha512crypt,
    "sha256crypt": h_sha256crypt,
    "md5crypt": h_md5crypt,
    "django-pbkdf2-sha256": h_django_pbkdf2_sha256,
}

DEFAULT_TYPES = [
    "bcrypt", "argon2id", "pbkdf2-sha256", "scrypt",
    "sha512crypt", "sha256crypt", "md5crypt",
    "sha256", "sha1", "md5", "ntlm", "mysql5"
]


def parse_types(s: str) -> List[str]:
    items = [x.strip() for x in s.split(",") if x.strip()]
    unknown = [x for x in items if x not in GENS]
    if unknown:
        raise SystemExit(f"Unknown types: {', '.join(unknown)}\nValid: {', '.join(sorted(GENS.keys()))}")
    return items


def main():
    ap = argparse.ArgumentParser(description="Generate fake, realistic-looking hash strings for UI demos.")
    ap.add_argument("-n", "--count", type=int, default=50, help="How many hashes to generate (default: 50)")
    ap.add_argument("-t", "--types", type=str, default=",".join(DEFAULT_TYPES),
                    help="Comma-separated types to mix (default: a broad mix)")
    ap.add_argument("--seed", type=int, default=None, help="Deterministic output seed (optional)")
    ap.add_argument("--annotate", action="store_true", help="Prefix each line with [type]")
    ap.add_argument("--out", type=str, default=None, help="Write to a file instead of stdout")
    args = ap.parse_args()

    if args.count < 1:
        raise SystemExit("--count must be >= 1")

    r = _rng(args.seed)
    types = parse_types(args.types)

    lines: List[str] = []
    for _ in range(args.count):
        typ = types[_rand_int(0, len(types) - 1, r)]
        val = GENS[typ](r)
        if args.annotate:
            lines.append(f"[{typ}] {val}")
        else:
            lines.append(val)

    out_text = "\n".join(lines) + "\n"
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(out_text)
    else:
        print(out_text, end="")


if __name__ == "__main__":
    main()

