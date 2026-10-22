import { useEffect, useState } from 'react'
import {
  detectHostPlatform,
  readUserAgentDataArchitecture,
  type HostPlatform,
} from '@sdkwork/appstore-pc-core'

/**
 * Host desktop OS and CPU architecture used to choose the install build.
 *
 * The synchronous user-agent heuristic renders first. On Chromium the
 * User-Agent Client Hints high-entropy `architecture` / `bitness` values then
 * replace an unresolved CPU architecture, which is what distinguishes Apple
 * silicon from Intel behind the frozen macOS user agent. The refinement is
 * additive: a browser without the API keeps the heuristic result.
 * @returns the host platform snapshot for install-target matching.
 */
export function useHostPlatform(): HostPlatform {
  const [host, setHost] = useState<HostPlatform>(detectHostPlatform)

  useEffect(() => {
    let cancelled = false
    void readUserAgentDataArchitecture().then((architecture) => {
      if (cancelled || architecture === null) {
        return
      }
      setHost((current) =>
        current.arch === architecture ? current : { ...current, arch: architecture },
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  return host
}
