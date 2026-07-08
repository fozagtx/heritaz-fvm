# Heritaz — Confidential Digital Inheritance on Zama fhEVM

A confidential digital inheritance platform powered by **Zama fhEVM** (Fully Homomorphic Encryption).
Dead-man's switch inheritance vaults with **FHE-encrypted beneficiary data and document keys**,
ensuring that only authorized parties can ever access the legacy you leave behind.

## The Story

Imagine someone passes away with millions in crypto. Their family knows about it, but can't access it.
The private keys? Gone forever.

With traditional blockchains, everything is transparent — anyone can see beneficiaries, amounts, and
patterns. **Zama fhEVM changes this** by keeping all sensitive data encrypted at the protocol level
using Fully Homomorphic Encryption (FHE).

Heritaz on fhEVM means:
- **Beneficiary addresses are encrypted** — no one knows who you've designated
- **Document keys are encrypted** — only authorized parties can decrypt and view legacy documents
- **Access control is cryptographic** — FHE handles who can see what, not just smart contract access control lists
- **Inheritance is automatic** — if you stop checking in, beneficiaries automatically gain access

## How It Actually Works

### 🔒 Confidentiality with FHE

Instead of Shamir's Secret Sharing + AES (the old Filecoin approach), Heritaz uses **Zama fhEVM**:

1. **Beneficiaries** are stored as `eaddress` (encrypted addresses) — no one sees who they are
2. **Percentages** are stored as `euint8` — FHE operations validate the sum equals 100 without revealing each share
3. **Document encryption keys** are stored as `ebytes256` — protected by FHE, only authorized users can decrypt
4. **Access control** uses `FHE.allow()` and `FHE.isSenderAllowed()` — cryptographic authorization, not just contract logic
5. **Inheritance trigger** authorizes all beneficiaries to decrypt document keys on-chain

### System Flow

```
Owner creates vault → beneficiaries added as eaddress[ ]
    ↓
Owner uploads encrypted file (AES-256-GCM client-side)
    ↓
Document encryption key stored on-chain as ebytes256 (FHE-encrypted)
    ↓
Owner checks in periodically (resets timer)
    ↓
If owner stops → anyone can trigger inheritance
    ↓
Beneficiaries claim → FHE authorizes decryption of document keys
    ↓
Beneficiaries download and decrypt legacy documents
```

### Tech Stack
```
Frontend:     React 18 + Next.js 16.2 + Tailwind + Radix UI
Wallet:       Any EVM wallet (MetaMask, etc.) via wagmi/connectkit
    ↓
Smart Contracts: Solidity + fhEVM (@fhevm/solidity) + Zama FHE
    ↓
Encryption:     FHE (TFHE) for on-chain data + AES-256-GCM for file content
    ↓
Chain:          Any EVM with fhEVM coprocessor
```

## Getting Started

```bash
bun install
bun run dev
```

Open http://localhost:3000

You'll need an EVM wallet connected to an fhEVM-compatible network.

### Configure fhEVM Network

| Field | Value |
|-------|-------|
| Network Name | fhEVM Testnet |
| Chain ID | 9000 (or your target) |
| RPC URL | https://devnet.zama.ai |
| Currency | tFHE |

### Contract Development

```bash
cd contracts/fhevm
bun install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network fhevmTestnet
```

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_FHEVM_RPC_URL=https://devnet.zama.ai
NEXT_PUBLIC_FHEVM_CHAIN_ID=9000
NEXT_PUBLIC_FHEVM_CHAIN_NAME=fhEVM Testnet
NEXT_PUBLIC_FHEVM_EXPLORER_URL=https://explorer.zama.ai
NEXT_PUBLIC_FHEVM_FACTORY_ADDRESS=<deployed factory>
```

## Architecture

### Contract Structure
```
HeritazConfidentialFactory
  └── creates → HeritazConfidentialVault
                    ├── Beneficiaries: eaddress[] + euint8[]
                    ├── Documents: string cid + ebytes256 encryptedKey
                    ├── Status: Active → GracePeriod → Triggered → Claimed
                    └── Access: FHE.allow() / FHE.isSenderAllowed()
```

### Key FHE Operations Used

| Operation | Purpose |
|-----------|---------|
| `FHE.add(a, b)` | Sum percentages to validate total = 100 |
| `FHE.eq(a, b)` | Verify caller is the beneficiary |
| `FHE.decrypt(v)` | Decrypt a value for validation |
| `FHE.allow(handle, user)` | Authorize user to decrypt a handle |
| `FHE.allowThis(handle)` | Authorize contract to use a handle |
| `FHE.isSenderAllowed(handle)` | Check if caller can decrypt |
| `FHE.asEaddress(addr)` | Convert plain address to eaddress |
| `FHE.select(cond, a, b)` | Conditional selection on encrypted data |

## Project Structure

```
/
├── app/                          Next.js app router
│   ├── dashboard/                Vault dashboard
│   ├── vault/create/             Multi-step vault wizard
│   ├── vault/[id]/               Vault detail + check-in
│   ├── vault/[id]/legacy/        Document upload/manage
│   ├── beneficiary/              Beneficiary claims view
│   ├── claim/[vaultId]/          Claim + decrypt flow
│   ├── settings/                 Wallet + network settings
│   └── api/
│       └── fvm/                  FHEVM vault state reader
├── contracts/
│   └── fhevm/                    Solidity smart contracts (Zama fhEVM)
│       ├── contracts/            HeritazConfidentialVault.sol + Factory
│       ├── lib/                  FHE library references
│       ├── test/                 Hardhat tests
│       └── deployments/          Deployment addresses
├── components/
│   ├── providers/                fhEVM wallet provider
│   └── ui/                       Wallet modal, notifications, etc.
├── lib/
│   ├── fhevm-vault.ts            FHEVM contract manager (ethers.js)
│   ├── encryption.ts             AES-256-GCM for file content
│   └── ipfs-storage.ts           IPFS upload/retrieve (for encrypted blobs)
├── types/
│   ├── fvm-vault.ts              FHEVM type definitions
│   └── ipfs.ts                   Storage types
```

## Why Zama fhEVM?

- **Privacy by default** — all vault data is encrypted at the protocol level
- **FHE operations** — compute on encrypted data without ever decrypting
- **EVM compatible** — use existing wallets, tools, and infrastructure
- **No key-sharing** — beneficiaries are authorized cryptographically, not by splitting keys
- **Regulatory friendly** — confidential inheritance without exposing family relationships on-chain

## License

MIT. Use it however you want.

---

Built with Zama fhEVM, Next.js, and the hope that no one loses their digital legacy.
