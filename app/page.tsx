"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Target, TrendingUp, Award } from "lucide-react"
import Link from "next/link"
import { FirebaseStatus } from "@/components/ui/firebase-status"
import { useAuth } from "@/contexts/AuthContext"
import { useI18n } from "@/contexts/I18nContext"
import { LanguageSelector } from "@/components/ui/language-selector"

export default function Home() {
  const { user, isConfigured } = useAuth()
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-white">
      {/* Firebase Status Banner */}
      <FirebaseStatus />
      
      {/* Logo Header */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <img 
              src="http://practitioner.kaizenacademy.education/logo_round.png" 
              alt="Kaizen Academy Logo" 
              className="h-12 w-auto sm:h-16"
            />
            <div className="flex gap-2 sm:gap-3">
              <LanguageSelector className="w-auto" showName={false} />
              {user ? (
                <>
                  <Link href="/history">
                    <Button variant="outline" className="text-sm sm:text-base">
                      <span className="hidden sm:inline">{t.myHistory}</span>
                      <span className="sm:hidden">History</span>
                    </Button>
                  </Link>
                  <Link href="/assessment/landing">
                    <Button className="text-sm sm:text-base">
                      <span className="hidden sm:inline">{t.newAssessment}</span>
                      <span className="sm:hidden">Assess</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="outline" className="text-sm sm:text-base">
                      {t.signIn}
                    </Button>
                  </Link>
                  <Link href="/assessment/landing">
                    <Button className="text-sm sm:text-base">
                      {t.startAssessment}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/assessment/landing">
                  <Button 
                    size="lg" 
                    className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold text-lg px-8 py-4"
                  >
                    Continue Assessment
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/assessment/landing">
                    <Button 
                      size="lg" 
                      className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold text-lg px-8 py-4"
                    >
                      {t.startAssessment}
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="font-semibold text-lg px-8 py-4"
                    >
                      {t.signIn}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Assessment
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive evaluation designed for operational excellence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <Target className="h-12 w-12 text-brand-yellow mx-auto mb-4" />
                <CardTitle className="text-xl">Accurate Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600"> scientifically designed questions to assess your Lean knowledge</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-brand-yellow mx-auto mb-4" />
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Monitor your improvement over time with detailed analytics</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Award className="h-12 w-12 text-brand-yellow mx-auto mb-4" />
                <CardTitle className="text-xl">Certification Path</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Get personalized recommendations for certification programs</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <CheckCircle2 className="h-12 w-12 text-brand-yellow mx-auto mb-4" />
                <CardTitle className="text-xl">Industry Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Globally recognized assessment standards and methodologies</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-brand-yellow to-yellow-400">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-brand-black mb-8">
              Join thousands of professionals who have advanced their Lean journey
            </p>
            <div>
              <Link href="/assessment/landing">
                <Button 
                  size="lg" 
                  className="bg-brand-black text-white hover:bg-gray-800 font-semibold text-lg px-8 py-4"
                >
                  Start Your Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-black text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Kaizen Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
