# setup-sui-cli

Install a specific Sui CLI release and optionally configure a deployer wallet for a supported Sui network.

## What Is Sui CLI?

Sui CLI is the official command-line tool for interacting with the [Sui blockchain](https://sui.io). It is used to manage accounts and keys, switch networks, inspect chain state, and run/publish Move packages.

## Inputs

| Input         | Default           | Description                                   |
| ------------- | ----------------- | --------------------------------------------- |
| `network`     | `testnet`         | Supported values are `mainnet` and `testnet`. |
| `version`     | `mainnet-v1.68.1` | Sui CLI version tag to install.               |
| `private_key` | -                 | A Bech32-formatted private key to import      |

> [!TIP]
> Get an existing key in the correct Bech32 format:
> ```bash
> sui keytool export --key-identity <YOUR_SUI_ADDRESS>
> ```

## Outputs

- `rpc_url`: Resolved RPC URL for the selected network.
- `active_address`: Imported address set as the active Sui address.

> [!NOTE]
> If `private_key` is omitted, the action only installs the Sui CLI and does not set outputs.

## Examples

Install only:

```yaml
- name: 📦 Setup Sui CLI
  uses: CommandOSSLabs/setup-sui-cli@v1
```

Install and configure wallet:

```yaml
- name: 📦 Setup Sui CLI
  uses: CommandOSSLabs/setup-sui-cli@v1
  with:
    network: testnet
    private_key: ${{ secrets.SUI_DEPLOYER_PRIVATE_KEY }}
```
