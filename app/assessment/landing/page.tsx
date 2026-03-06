"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Target, Award } from "lucide-react"

export default function AssessmentLandingPage() {
  return (
    <main className="min-h-screen bg-brand-lightgrey">
      {/* Header */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <img
                src="http://practitioner.kaizenacademy.education/logo_round.png"
                alt="Kaizen Academy"
                className="h-12 w-auto"
              />
            </Link>
            <Link href="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-black mb-4">
            Lean &amp; Operational Excellence Assessment
          </h1>
          <p className="text-xl text-brand-grey mb-8">
            Discover your current readiness level and get a personalised learning path
          </p>
          <Link href="/assessment">
            <Button size="lg" className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold text-lg px-10 py-4">
              Start Assessment Now
            </Button>
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Clock className="h-10 w-10 text-brand-yellow mx-auto mb-2" />
              <CardTitle className="text-lg">15 Minutes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-brand-grey text-sm">15 questions covering key Lean and TPS principles</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="h-10 w-10 text-brand-yellow mx-auto mb-2" />
              <CardTitle className="text-lg">Personalised Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-brand-grey text-sm">Get your readiness level: Beginner, Developing, Intermediate, or Advanced</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-10 w-10 text-brand-yellow mx-auto mb-2" />
              <CardTitle className="text-lg">PDF Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-brand-grey text-sm">Receive a detailed report with course recommendations emailed to you</p>
            </CardContent>
          </Card>
        </div>

        {/* What's covered */}
        <Card>
          <CardHeader>
            <CardTitle>What the Assessment Covers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Toyota Production System (TPS) Fundamentals',
                'Waste Identification & Elimination (8 Wastes)',
                'Value Stream Mapping',
                'Continuous Improvement (Kaizen)',
                'Pull Systems & Kanban',
                'Standard Work & 5S',
                'Problem Solving (PDCA, 5 Whys, A3)',
                'Lean Leadership & Visual Management',
              ].map((topic) => (
                <div key={topic} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{topic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-10">
          <Link href="/assessment">
            <Button size="lg" className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold text-lg px-10 py-4">
              Begin Assessment
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
