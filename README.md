# setup-sui-cli

Install a specific Sui CLI release and optionally configure a deployer wallet for a supported Sui network.

## What Is Sui CLI?

Sui CLI is the official command-line tool for interacting with the [Sui blockchain](https://sui.io). It is used to manage accounts and keys, switch networks, inspect chain state, and run/publish Move packages.

## Inputs

| Input         | Default   | Description                                   |
| ------------- | --------- | --------------------------------------------- |
| `network`     | `testnet` | Supported values are `mainnet` and `testnet`. |
| `version`     | -         | Sui CLI version tag to install.               |
| `private_key` | -         | A Bech32-formatted private key to import      |

If `version` is omitted, the action fetches the latest network-specific release tag from the official [MystenLabs/sui](https://github.com/MystenLabs/sui/releases) repository.

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

## Supported Platforms

| OS      | Architecture |
| ------- | ------------ |
| Linux   | x64          |
| Linux   | arm64        |
| macOS   | x64          |
| macOS   | arm64        |
| Windows | x64          |

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

## License

This project is licensed under the [Apache License 2.0](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ by the CommandOSS Team</strong>
</p>
