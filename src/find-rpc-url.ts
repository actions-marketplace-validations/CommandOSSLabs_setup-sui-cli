import { SuiEnvsSchema, SuiEnvsWithActiveSchema } from './schemas.ts'

export function findRpcUrl(envsRaw: unknown, network: string): string {
  const envs = Array.isArray(envsRaw) && Array.isArray(envsRaw[0])
    ? SuiEnvsWithActiveSchema.parse(envsRaw)[0]
    : SuiEnvsSchema.parse(envsRaw)

  return envs.find((e) => e.alias === network)?.rpc ?? ''
}
