import { CircleCheck, Download } from 'lucide-react'
import { Button } from '../../components/ui'
import { isInstalled, isIos, promptInstall, useCanInstall } from '../../lib/install'

export function InstallCard() {
  const canInstall = useCanInstall()

  if (isInstalled()) {
    return (
      <p className="flex items-center gap-2 text-[15px]">
        <CircleCheck className="size-4.5 text-cat-green-ink" aria-hidden />
        Orynn is installed on this device.
      </p>
    )
  }

  if (canInstall) {
    return (
      <div className="space-y-3">
        <p className="text-[15px] text-ink-muted">Install Orynn to open it from your home screen, like an app.</p>
        <Button variant="secondary" icon={<Download />} onClick={() => promptInstall()}>
          Install Orynn
        </Button>
      </div>
    )
  }

  return (
    <p className="text-[15px] text-ink-muted">
      {isIos()
        ? 'To install Orynn on your iPhone, open it in Safari, tap Share, then “Add to Home Screen”.'
        : 'Use your browser menu to install Orynn as an app.'}
    </p>
  )
}
