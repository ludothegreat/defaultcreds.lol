# Credential Generator (`cred_gen.py`)

A Python script for generating fake credentials, hashes, tokens, and payloads for UI demos. This script is for entertainment use only and none of the credentials are valid. I created this script to easily generate fake credentials for my loading skeletons on [defaultcreds.lol](https://defaultcreds.lol).

## Installation

No special installation required. The script uses only Python standard library modules:
- `argparse`
- `base64`
- `random`
- `secrets`
- `string`

Make sure you have Python 3.6+ installed.

## Usage

### Basic Syntax

```bash
python3 cred_gen.py [OPTIONS] [TYPE_FLAGS]
```

### Type Flags

Each flag corresponds to a credential type:

| Flag | Description | Example Output |
|------|-------------|----------------|
| `--pass` | Generate passwords | `password123`, `admin456` |
| `--user --pass` or `--creds` | Generate username:password pairs | `admin:password`, `root:root` |
| `--hash` or `--test-hash` | Generate password hashes | `$2b$10$...`, `a1b2c3d4...` |
| `--decrypt` | Generate encrypted credentials | `ENC(abc123)`, `{encrypted}xyz` |
| `--bypass` | Generate tokens/session IDs | `Bearer token123`, `session_id=abc` |
| `--default` | Generate default credentials | `admin:admin`, `root:password` |
| `--weak` | Generate weak passwords | `password`, `123456`, `qwerty` |
| `--payload` | Generate injection payloads | `admin' OR '1'='1`, `admin'--` |

### Common Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--count` | `-n` | Number of items to generate | `50` |
| `--types` | `-t` | Comma-separated hash types (only for `--hash`) | All common types |
| `--seed` | | Deterministic output seed | Random |
| `--annotate` | | Prefix each line with `[type]` | Off |
| `--out` | | Output file path | stdout |

## Examples

### Generate 120 passwords

```bash
python3 cred_gen.py -n 120 --pass --out passwords.txt
```

### Generate username:password pairs

```bash
python3 cred_gen.py -n 50 --user --pass --out creds.txt
# Or use the shorthand:
python3 cred_gen.py -n 50 --creds --out creds.txt
```

### Generate password hashes

```bash
# All hash types (default)
python3 cred_gen.py -n 100 --hash --out hashes.txt

# Specific hash types only
python3 cred_gen.py -n 100 --hash -t bcrypt,sha256,md5 --out hashes.txt

# With annotation
python3 cred_gen.py -n 50 --hash --annotate --out hashes.txt
```

### Generate default credentials

```bash
python3 cred_gen.py -n 30 --default --out defaults.txt
```

### Generate weak passwords

```bash
python3 cred_gen.py -n 80 --weak --out weak.txt
```

### Generate authentication tokens

```bash
python3 cred_gen.py -n 50 --bypass --out tokens.txt
```

### Generate encrypted credentials

```bash
python3 cred_gen.py -n 40 --decrypt --out encrypted.txt
```

### Generate injection payloads

```bash
python3 cred_gen.py -n 25 --payload --out payloads.txt
```

### Deterministic output (for testing)

```bash
# Same seed = same output
python3 cred_gen.py -n 10 --pass --seed 42
python3 cred_gen.py -n 10 --pass --seed 42  # Identical output
```

## Hash Types (for `--hash` flag)

When using `--hash`, you can specify which hash algorithms to generate:

- `md5` - MD5 hash (32 hex chars)
- `sha1` - SHA-1 hash (40 hex chars)
- `sha256` - SHA-256 hash (64 hex chars)
- `sha512` - SHA-512 hash (128 hex chars)
- `ntlm` - NTLM hash (32 hex chars)
- `lm` - LM hash (32 hex chars, uppercase)
- `mysql5` - MySQL 5.x hash (`*` + 40 hex chars)
- `bcrypt` - bcrypt hash (`$2b$...`)
- `argon2id` - Argon2id hash
- `pbkdf2-sha256` - PBKDF2-SHA256 hash
- `scrypt` - scrypt hash
- `sha512crypt` - SHA-512 crypt hash
- `sha256crypt` - SHA-256 crypt hash
- `md5crypt` - MD5 crypt hash
- `django-pbkdf2-sha256` - Django PBKDF2-SHA256 hash

### Example: Generate only bcrypt and SHA-256 hashes

```bash
python3 cred_gen.py -n 100 --hash -t bcrypt,sha256 --out hashes.txt
```

## Output Format

By default, each line contains a single item. With `--annotate`, each line is prefixed with its type:

```bash
# Without annotation
password123
admin:admin
$2b$10$abcdef...

# With --annotate
[password] password123
[credential] admin:admin
[bcrypt] $2b$10$abcdef...
```

## Notes

- **Non-functional**: All generated data is fake and non-functional. It's designed for UI demos or other entertainment purposes only.
- **Randomness**: By default, output is cryptographically random. Use `--seed` for deterministic output.
- **Performance**: Generating large quantities (10,000+) may take a few seconds.
- **File size**: Each entry is typically 10-100 bytes. 500 entries ≈ 5-50 KB per file.

## Troubleshooting

### "Unknown hash types" error

Make sure you're using valid hash type names. See the "Hash Types" section above for the full list.

### File not found errors

Ensure you're running the script from the correct directory, or use absolute paths for `--out`.

### Permission errors

Make sure you have write permissions in the output directory.
