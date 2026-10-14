import { PRIVACY_SECTIONS } from '@/lib/privacy'
import { useI18n } from '@/i18n'

// Texto completo da política (usado na página pública /privacidade)
export function PrivacyPolicyText() {
  const { t } = useI18n()
  return (
    <div className="space-y-7">
      {PRIVACY_SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="mb-2 text-[17px] font-bold text-[var(--ss-fg)]">{t(section.title)}</h2>
          <div className="space-y-3 text-[14.5px] leading-relaxed text-[var(--ss-text)]">
            {section.blocks.map((block, i) => {
              if (block.type === 'p') return <p key={i}>{t(block.key)}</p>
              if (block.type === 'ul') {
                return (
                  <ul key={i} className="list-disc space-y-1 pl-5">
                    {block.keys.map((key) => <li key={key}>{t(key)}</li>)}
                  </ul>
                )
              }
              return (
                <div key={i} className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13.5px]">
                    <thead>
                      <tr>
                        {block.head.map((h) => (
                          <th key={h} className="border border-[var(--ss-border)] bg-[var(--ss-wash)] px-3 py-2 text-left text-[12.5px] font-semibold">{t(h)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map(([a, b]) => (
                        <tr key={a}>
                          <td className="w-[34%] border border-[var(--ss-border)] px-3 py-2 align-top font-medium">{t(a)}</td>
                          <td className="border border-[var(--ss-border)] px-3 py-2 align-top">{t(b)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
