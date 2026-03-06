"use client"

import * as React from "react"
import { COUNTRIES } from "@/lib/countries"
import { cn } from "@/lib/utils"

interface CountrySelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CountrySelector({ value, onChange, placeholder = "Select country", className }: CountrySelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <option value="">{placeholder}</option>
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  )
}
