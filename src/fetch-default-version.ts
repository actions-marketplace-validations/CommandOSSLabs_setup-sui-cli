const OFFICIAL_SUI_RELEASES_API =
  'https://api.github.com/repos/MystenLabs/sui/releases'
const RELEASES_PER_PAGE = 100
const MAX_RELEASE_PAGES = 10

type GitHubRelease = {
  draft?: boolean
  prerelease?: boolean
  tag_name?: string
}

function buildGitHubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'setup-sui-cli-action',
  }

  const resolvedToken = token ?? process.env.GITHUB_TOKEN
  if (resolvedToken) {
    headers.Authorization = `Bearer ${resolvedToken}`
  }

  return headers
}

export async function fetchDefaultVersion(
  network: 'mainnet' | 'testnet',
  token?: string
): Promise<string> {
  for (let page = 1; page <= MAX_RELEASE_PAGES; page++) {
    const response = await fetch(
      `${OFFICIAL_SUI_RELEASES_API}?per_page=${RELEASES_PER_PAGE}&page=${page}`,
      {
        headers: buildGitHubHeaders(token),
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch default Sui CLI version from MystenLabs/sui: ${response.status} ${response.statusText}`
      )
    }

    const releases = (await response.json()) as GitHubRelease[]
    const release = releases.find(
      (candidate) =>
        !candidate.draft &&
        !candidate.prerelease &&
        typeof candidate.tag_name === 'string' &&
        candidate.tag_name.startsWith(`${network}-v`)
    )

    if (release?.tag_name) {
      return release.tag_name
    }

    if (releases.length < RELEASES_PER_PAGE) {
      break
    }
  }

  throw new Error(
    `Could not find a default Sui CLI release for network '${network}' in MystenLabs/sui`
  )
}
