"use client"

import { useI18n } from "@/contexts/I18nContext"
import { cn } from "@/lib/utils"

interface LanguageSelectorProps {
  className?: string
  showName?: boolean
}

export function LanguageSelector({ className, showName = true }: LanguageSelectorProps) {
  const { language, setLanguage, supportedLanguages } = useI18n()

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className={cn(
        "h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {supportedLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {showName ? lang.name : ''}
        </option>
      ))}
    </select>
  )
}
