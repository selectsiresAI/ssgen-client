import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { LOCALES, type Locale } from '@/i18n/types'
import { useI18n } from '@/i18n'

const codes: Record<Locale, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  es: 'ES',
}

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('common.language')}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Globe className="size-4" aria-hidden="true" />
        {codes[locale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {LOCALES.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => setLocale(item)}
            className={cn('min-h-9 cursor-pointer', item === locale && 'bg-accent font-medium')}
          >
            <span className="w-5">{codes[item]}</span>
            {t(`common.lang.${item}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
