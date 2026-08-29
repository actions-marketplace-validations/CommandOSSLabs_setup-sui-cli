import os from 'node:os'
import path from 'node:path'
import * as core from '@actions/core'
import * as io from '@actions/io'
import { configureWallet } from './configure-wallet.ts'
import { ensureSuiInstalled } from './ensure-sui-installed.ts'
import { fetchDefaultVersion } from './fetch-default-version.ts'
import { resolvePlatformSpec } from './platform.ts'

type SupportedNetwork = 'mainnet' | 'testnet'

const SUPPORTED_NETWORKS = new Set<SupportedNetwork>(['mainnet', 'testnet'])

function isSupportedNetwork(network: string): network is SupportedNetwork {
  return SUPPORTED_NETWORKS.has(network as SupportedNetwork)
}

async function main(): Promise<void> {
  const network = core.getInput('network') || 'testnet'
  const privateKey = core.getInput('private_key')
  const token = core.getInput('token') || undefined

  if (!isSupportedNetwork(network)) {
    throw new Error(
      `Unsupported network '${network}'. Supported values are: mainnet, testnet.`
    )
  }

  const version =
    core.getInput('version') || (await fetchDefaultVersion(network, token))

  const installDir = path.join(os.homedir(), '.local', 'bin')
  const { binaryName } = resolvePlatformSpec()
  const suiBinPath = path.join(installDir, binaryName)

  await io.mkdirP(installDir)
  core.addPath(installDir)

  await ensureSuiInstalled(version, installDir, suiBinPath)

  if (privateKey) {
    await configureWallet(network, privateKey)
  } else {
    core.warning(
      'private_key input is empty; installed Sui CLI only and skipped wallet configuration.'
    )
  }
}

try {
  await main()
} catch (error) {
  core.setFailed(error instanceof Error ? error.message : String(error))
}
