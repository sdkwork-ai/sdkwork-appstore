import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeImageProps {
  /** The value encoded into the QR code (a URL). */
  value: string
  /** Rendered edge length in CSS pixels (default 176). */
  size?: number
  className?: string
}

/**
 * Render a URL as a QR code image for scan-to-continue distributions
 * (mobile apps, mini programs). The raster always keeps a white quiet zone
 * so scans succeed on dark storefront themes.
 */
export function QrCodeImage({ value, size = 176, className }: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setDataUrl(null)
    setFailed(false)
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (failed) {
    return (
      <div
        role="img"
        aria-label={value}
        className={`flex items-center justify-center bg-white text-[10px] text-gray-500 rounded-lg ${className ?? ''}`}
        style={{ width: size, height: size }}
      >
        {value}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center bg-white rounded-lg overflow-hidden ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      {dataUrl && (
        <img src={dataUrl} width={size} height={size} alt="" className="block" />
      )}
    </div>
  )
}
