"use client"

import { Button } from "@/components/ui/button"

interface SocialLoginButtonsProps {
  loading: boolean
  onSocialLogin: (provider: string) => Promise<void>
}

export function SocialLoginButtons({ loading, onSocialLogin }: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => onSocialLogin("Google")}
        disabled={loading}
      >
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => onSocialLogin("Microsoft")}
        disabled={loading}
      >
        Continue with Microsoft
      </Button>
    </div>
  )
}
