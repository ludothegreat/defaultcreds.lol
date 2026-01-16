#!/usr/bin/env python3
"""
cred_gen.py
Generate fake credentials, hashes, tokens, and payloads for UI demos.
Supports all skeleton loader message types.
"""

import argparse
import base64
import os
import random
import secrets
import string
from typing import Callable, Dict, List, Tuple

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


def _rand_choice(seq, r: random.Random | None):
    if r is None:
        return secrets.choice(seq)
    return r.choice(seq)


def _rand_str(alpha: str, n: int, r: random.Random | None) -> str:
    return "".join(_rand_choice(alpha, r) for _ in range(n))


def _b64_nopad(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii").rstrip("=")


# ============================================
# HASH GENERATORS (Testing password hash)
# ============================================

def h_md5(r):     return _rand_hex(16, r)   # 32 hex
def h_sha1(r):    return _rand_hex(20, r)   # 40 hex
def h_sha256(r):  return _rand_hex(32, r)   # 64 hex
def h_sha512(r):  return _rand_hex(64, r)   # 128 hex

def h_ntlm(r):    return _rand_hex(16, r)   # 32 hex
def h_lm(r):      return _rand_hex(16, r).upper()

def h_mysql5(r):
    return "*" + _rand_hex(20, r).upper()

def h_bcrypt(r):
    cost = _rand_int(4, 15, r)
    salt = _rand_str(BCRYPT_B64, 22, r)
    chk  = _rand_str(BCRYPT_B64, 31, r)
    return f"$2b${cost:02d}${salt}{chk}"

def h_argon2id(r):
    m = _rand_int(32768, 131072, r)
    t = _rand_int(2, 5, r)
    p = _rand_int(1, 4, r)
    salt = _b64_nopad(_rand_bytes(16, r))
    out  = _b64_nopad(_rand_bytes(32, r))
    return f"$argon2id$v=19$m={m},t={t},p={p}${salt}${out}"

def h_pbkdf2_sha256(r):
    rounds = _rand_int(20000, 400000, r)
    salt = _b64_nopad(_rand_bytes(12, r))
    out  = _b64_nopad(_rand_bytes(32, r))
    return f"$pbkdf2-sha256${rounds}${salt}${out}"

def h_scrypt(r):
    ln = _rand_int(12, 17, r)
    rr = _rand_int(8, 16, r)
    pp = _rand_int(1, 2, r)
    salt = _b64_nopad(_rand_bytes(12, r))
    out  = _b64_nopad(_rand_bytes(32, r))
    return f"$scrypt$ln={ln},r={rr},p={pp}${salt}${out}"

def h_sha512crypt(r):
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
    iters = _rand_int(120000, 720000, r)
    salt = _rand_str("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 12, r)
    out  = _b64_nopad(_rand_bytes(32, r))
    return f"pbkdf2_sha256${iters}${salt}${out}"

HASH_GENS: Dict[str, Callable] = {
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

DEFAULT_HASH_TYPES = [
    "bcrypt", "argon2id", "pbkdf2-sha256", "scrypt",
    "sha512crypt", "sha256crypt", "md5crypt",
    "sha256", "sha1", "md5", "ntlm", "mysql5"
]


# ============================================
# PASSWORD GENERATORS (Cracking password / Scanning for weak passwords)
# ============================================

COMMON_WEAK_PASSWORDS = [
    "password", "123456", "12345678", "1234", "12345", "qwerty", "abc123",
    "password1", "Password1", "admin", "letmein", "welcome", "monkey",
    "1234567890", "dragon", "master", "sunshine", "princess", "football",
    "shadow", "superman", "qwerty123", "michael", "jordan", "trustno1",
    "batman", "thomas", "hockey", "ranger", "daniel", "hannah", "maggie",
    "jessica", "charlie", "welcome123", "password123", "admin123"
]

COMMON_PATTERNS = [
    lambda r: f"password{_rand_int(1, 9999, r)}",
    lambda r: f"admin{_rand_int(1, 9999, r)}",
    lambda r: f"user{_rand_int(1, 9999, r)}",
    lambda r: f"pass{_rand_int(1000, 9999, r)}",
    lambda r: _rand_str(string.ascii_lowercase, _rand_int(4, 8, r), r) + str(_rand_int(1, 999, r)),
    lambda r: _rand_str(string.ascii_uppercase, 1, r) + _rand_str(string.ascii_lowercase, _rand_int(3, 7, r), r) + str(_rand_int(1, 99, r)),
    lambda r: _rand_str(string.ascii_letters + string.digits, _rand_int(6, 12, r), r),
    lambda r: _rand_str(string.ascii_lowercase, _rand_int(5, 10, r), r) + _rand_str(string.digits, _rand_int(2, 4, r), r),
]

def gen_password(r: random.Random | None, weak: bool = False) -> str:
    """Generate a password. If weak=True, prefer common weak passwords."""
    if weak:
        if _rand_int(0, 100, r) < 60:  # 60% chance of common weak password
            return _rand_choice(COMMON_WEAK_PASSWORDS, r)
        else:
            return _rand_choice(COMMON_PATTERNS, r)(r)
    else:
        # Mix of patterns and random
        if _rand_int(0, 100, r) < 30:  # 30% chance of common weak password
            return _rand_choice(COMMON_WEAK_PASSWORDS, r)
        else:
            return _rand_choice(COMMON_PATTERNS, r)(r)


# ============================================
# USERNAME GENERATORS
# ============================================

COMMON_USERNAMES = [
    "admin", "administrator", "root", "user", "guest", "test", "demo",
    "support", "info", "webmaster", "mail", "ftp", "www", "api",
    "service", "system", "default", "operator", "manager", "staff"
]

def gen_username(r: random.Random | None) -> str:
    """Generate a username."""
    if _rand_int(0, 100, r) < 50:  # 50% chance of common username
        base = _rand_choice(COMMON_USERNAMES, r)
        if _rand_int(0, 100, r) < 30:  # 30% chance to add number
            return base + str(_rand_int(1, 99, r))
        return base
    else:
        # Random username
        return _rand_str(string.ascii_lowercase, _rand_int(4, 10, r), r)


# ============================================
# CREDENTIAL PAIR GENERATORS (Brute forcing credentials / Exploiting default creds)
# ============================================

DEFAULT_CREDS = [
    ("admin", "admin"), ("admin", "password"), ("admin", "1234"), ("admin", "12345"),
    ("root", "root"), ("root", "admin"), ("root", "password"),
    ("user", "user"), ("user", "password"), ("guest", "guest"),
    ("test", "test"), ("support", "support"), ("administrator", "admin"),
    ("administrator", "password"), ("cisco", "cisco"), ("ubnt", "ubnt"),
    ("pi", "raspberry"), ("ftp", "ftp"), ("admin", "changeme")
]

def gen_cred_pair(r: random.Random | None, default: bool = False) -> Tuple[str, str]:
    """Generate username:password pair. If default=True, prefer common defaults."""
    if default and _rand_int(0, 100, r) < 70:  # 70% chance of default creds
        return _rand_choice(DEFAULT_CREDS, r)
    else:
        return (gen_username(r), gen_password(r, weak=True))


# ============================================
# ENCRYPTED/ENCODED CREDENTIAL GENERATORS (Decrypting credentials)
# ============================================

def gen_encrypted_cred(r: random.Random | None) -> str:
    """Generate encrypted/encoded credential string."""
    formats = [
        lambda r: f"ENC({base64.b64encode(_rand_bytes(16, r)).decode('ascii')})",
        lambda r: f"{{encrypted}}{_b64_nopad(_rand_bytes(24, r))}",
        lambda r: f"ciphertext:{_rand_hex(32, r)}",
        lambda r: f"AES256:{_b64_nopad(_rand_bytes(32, r))}",
        lambda r: f"encrypted:{_rand_hex(40, r)}",
        lambda r: f"{{cipher}}{_b64_nopad(_rand_bytes(20, r))}",
        lambda r: f"ENC[{_rand_hex(24, r)}]",
    ]
    return _rand_choice(formats, r)(r)


# ============================================
# TOKEN/SESSION GENERATORS (Bypassing authentication)
# ============================================

def gen_token(r: random.Random | None) -> str:
    """Generate authentication token, session ID, or API key."""
    formats = [
        lambda r: f"Bearer {_rand_hex(32, r)}",
        lambda r: f"session_id={_b64_nopad(_rand_bytes(24, r))}",
        lambda r: f"api_key_{_rand_hex(40, r)}",
        lambda r: f"token:{_b64_nopad(_rand_bytes(32, r))}",
        lambda r: f"JWT.{_b64_nopad(_rand_bytes(20, r))}.{_b64_nopad(_rand_bytes(20, r))}",
        lambda r: f"auth_token={_rand_hex(36, r)}",
        lambda r: f"X-API-Key: {_rand_hex(32, r)}",
        lambda r: f"session={_b64_nopad(_rand_bytes(28, r))}",
    ]
    return _rand_choice(formats, r)(r)


# ============================================
# INJECTION PAYLOAD GENERATORS (Injecting credential payload)
# ============================================

SQL_INJECTIONS = [
    lambda r: f"admin' OR '1'='1",
    lambda r: f"admin'--",
    lambda r: f"' OR 1=1--",
    lambda r: f"admin' UNION SELECT NULL--",
    lambda r: f"' OR 'x'='x",
    lambda r: f"admin') OR ('1'='1",
]

COMMAND_INJECTIONS = [
    lambda r: f"admin; cat /etc/passwd",
    lambda r: f"admin | whoami",
    lambda r: f"admin && id",
    lambda r: f"admin`whoami`",
    lambda r: f"admin$(id)",
]

def gen_payload(r: random.Random | None) -> str:
    """Generate injection payload (SQL, command, etc.)."""
    payloads = SQL_INJECTIONS + COMMAND_INJECTIONS
    return _rand_choice(payloads, r)(r)


# ============================================
# MAIN GENERATION LOGIC
# ============================================

def parse_hash_types(s: str) -> List[str]:
    items = [x.strip() for x in s.split(",") if x.strip()]
    unknown = [x for x in items if x not in HASH_GENS]
    if unknown:
        raise SystemExit(f"Unknown hash types: {', '.join(unknown)}\nValid: {', '.join(sorted(HASH_GENS.keys()))}")
    return items


def main():
    ap = argparse.ArgumentParser(
        description="Generate fake credentials, hashes, tokens, and payloads for UI demos.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate 120 passwords
  %(prog)s -n 120 --pass --out passwords.txt

  # Generate username:password pairs
  %(prog)s -n 50 --user --pass --out creds.txt

  # Generate password hashes (default behavior)
  %(prog)s -n 100 --hash --out hashes.txt

  # Generate default credentials
  %(prog)s -n 30 --default --out defaults.txt

  # Generate weak passwords
  %(prog)s -n 80 --weak --out weak.txt

  # Generate tokens/session IDs
  %(prog)s -n 50 --bypass --out tokens.txt

  # Generate encrypted credentials
  %(prog)s -n 40 --decrypt --out encrypted.txt

  # Generate injection payloads
  %(prog)s -n 25 --payload --out payloads.txt
        """
    )
    
    ap.add_argument("-n", "--count", type=int, default=50, help="How many items to generate (default: 50)")
    
    # Generation type flags
    ap.add_argument("--hash", "--test-hash", dest="hash", action="store_true",
                    help="Generate password hashes (Testing password hash)")
    ap.add_argument("--pass", dest="passwords", action="store_true",
                    help="Generate passwords (Cracking password)")
    ap.add_argument("--user", dest="usernames", action="store_true",
                    help="Generate usernames")
    ap.add_argument("--creds", dest="creds", action="store_true",
                    help="Generate username:password pairs (Brute forcing credentials)")
    ap.add_argument("--default", dest="default", action="store_true",
                    help="Generate default username:password pairs (Exploiting default creds)")
    ap.add_argument("--weak", dest="weak", action="store_true",
                    help="Generate weak passwords (Scanning for weak passwords)")
    ap.add_argument("--bypass", dest="bypass", action="store_true",
                    help="Generate tokens/session IDs (Bypassing authentication)")
    ap.add_argument("--decrypt", dest="decrypt", action="store_true",
                    help="Generate encrypted credentials (Decrypting credentials)")
    ap.add_argument("--payload", dest="payload", action="store_true",
                    help="Generate injection payloads (Injecting credential payload)")
    
    # Hash-specific options
    ap.add_argument("-t", "--types", type=str, default=",".join(DEFAULT_HASH_TYPES),
                    help="Comma-separated hash types (only used with --hash)")
    
    # Common options
    ap.add_argument("--seed", type=int, default=None, help="Deterministic output seed (optional)")
    ap.add_argument("--annotate", action="store_true", help="Prefix each line with [type]")
    ap.add_argument("--out", type=str, default=None, help="Write to a file instead of stdout")
    
    args = ap.parse_args()

    if args.count < 1:
        raise SystemExit("--count must be >= 1")

    # Determine generation mode
    modes = []
    if args.hash:
        modes.append("hash")
    if args.passwords:
        modes.append("pass")
    if args.usernames:
        modes.append("user")
    if args.creds:
        modes.append("creds")
    if args.default:
        modes.append("default")
    if args.weak:
        modes.append("weak")
    if args.bypass:
        modes.append("bypass")
    if args.decrypt:
        modes.append("decrypt")
    if args.payload:
        modes.append("payload")
    
    # If no mode specified, default to hash (backward compatibility)
    if not modes:
        modes = ["hash"]
    # If both --user and --pass are specified without --creds, treat as --creds
    elif args.usernames and args.passwords and "creds" not in modes:
        modes = ["creds"]
    elif args.usernames and not args.passwords:
        modes = ["user"]
    elif args.passwords and not args.usernames:
        modes = ["pass"]

    r = _rng(args.seed)
    lines: List[str] = []

    for _ in range(args.count):
        mode = _rand_choice(modes, r) if len(modes) > 1 else modes[0]
        
        if mode == "hash":
            hash_types = parse_hash_types(args.types)
            typ = hash_types[_rand_int(0, len(hash_types) - 1, r)]
            val = HASH_GENS[typ](r)
            if args.annotate:
                lines.append(f"[{typ}] {val}")
            else:
                lines.append(val)
        
        elif mode == "pass":
            val = gen_password(r, weak=False)
            if args.annotate:
                lines.append(f"[password] {val}")
            else:
                lines.append(val)
        
        elif mode == "user":
            val = gen_username(r)
            if args.annotate:
                lines.append(f"[username] {val}")
            else:
                lines.append(val)
        
        elif mode == "creds":
            user, pwd = gen_cred_pair(r, default=False)
            val = f"{user}:{pwd}"
            if args.annotate:
                lines.append(f"[credential] {val}")
            else:
                lines.append(val)
        
        elif mode == "default":
            user, pwd = gen_cred_pair(r, default=True)
            val = f"{user}:{pwd}"
            if args.annotate:
                lines.append(f"[default] {val}")
            else:
                lines.append(val)
        
        elif mode == "weak":
            val = gen_password(r, weak=True)
            if args.annotate:
                lines.append(f"[weak] {val}")
            else:
                lines.append(val)
        
        elif mode == "bypass":
            val = gen_token(r)
            if args.annotate:
                lines.append(f"[token] {val}")
            else:
                lines.append(val)
        
        elif mode == "decrypt":
            val = gen_encrypted_cred(r)
            if args.annotate:
                lines.append(f"[encrypted] {val}")
            else:
                lines.append(val)
        
        elif mode == "payload":
            val = gen_payload(r)
            if args.annotate:
                lines.append(f"[payload] {val}")
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
