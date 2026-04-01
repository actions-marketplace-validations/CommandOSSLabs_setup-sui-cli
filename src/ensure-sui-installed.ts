import path from 'node:path'
import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import {
  buildReleaseArchiveName,
  normalizeRunnerOs,
  resolvePlatformSpec,
} from './platform.ts'
import { runCommand } from './run-command.ts'

function extractSemver(value: string): string | null {
  const match = value.match(/\d+\.\d+\.\d+/)
  return match ? match[0] : null
}

export async function ensureSuiInstalled(
  version: string,
  installDir: string,
  suiBinPath: string
): Promise<void> {
  const runnerOs = process.env.RUNNER_OS || process.platform
  const runnerArch = process.env.RUNNER_ARCH || process.arch
  const cacheKey = `sui-cli-${runnerOs}-${runnerArch}-${version}`

  try {
    await cache.restoreCache([suiBinPath], cacheKey)
    core.info(`Checked cache for key ${cacheKey}`)
  } catch (error) {
    core.warning(
      `Cache restore failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  let shouldInstall = true
  try {
    const { stdout } = await runCommand(suiBinPath, ['--version'])
    const installedSemver = extractSemver(stdout)
    const requestedSemver = extractSemver(version)
    const isRequestedVersionInstalled =
      stdout.includes(version) ||
      (installedSemver !== null &&
        requestedSemver !== null &&
        installedSemver === requestedSemver)

    if (isRequestedVersionInstalled) {
      core.info(`Using existing Sui CLI ${version}`)
      core.info(stdout)
      shouldInstall = false
    } else {
      core.info(
        `Cached Sui CLI version mismatch. requested=${version} detected=${stdout.trim()}`
      )
    }
  } catch (error) {
    core.warning(
      `Failed to execute cached Sui CLI: ${error instanceof Error ? error.message : String(error)}`
    )
    shouldInstall = true
  }

  if (shouldInstall) {
    core.info(`Installing Sui CLI ${version}...`)
    const { binaryName } = resolvePlatformSpec()
    const archiveName = buildReleaseArchiveName(version)
    const url = `https://github.com/MystenLabs/sui/releases/download/${version}/${archiveName}`
    core.info(`Downloading release archive: ${url}`)

    const archivePath = await tc.downloadTool(url)
    const extractedPath = await tc.extractTar(archivePath)

    const downloadedSuiPath = path.join(extractedPath, binaryName)

    await io.mkdirP(installDir)
    await io.cp(downloadedSuiPath, suiBinPath, { force: true })

    if (normalizeRunnerOs() !== 'windows') {
      await exec.exec('chmod', ['0755', suiBinPath], { silent: true })
    }

    try {
      await cache.saveCache([suiBinPath], cacheKey)
      core.info(`Saved Sui CLI to cache key ${cacheKey}`)
    } catch (error) {
      core.warning(
        `Cache save skipped: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Verify installation. `sui` command should now be available in PATH and return the expected version.
  await runCommand('sui', ['--version'])

  // Ensure Sui CLI is properly initialized by checking active environment (this will trigger Sui CLI to create necessary config files if not already present)
  await runCommand('sui', ['client', '-y', 'active-env'])
}
