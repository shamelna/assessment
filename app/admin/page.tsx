"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Filter, BarChart3, Users, TrendingUp, Globe } from "lucide-react"
import { getFirebaseErrorMessage, isFirebaseConfigured, firestore } from "@/lib/firebase"
import { AssessmentSubmission } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { FirebaseStatus } from "@/components/ui/firebase-status"
import { AdminGuard } from "@/components/auth/AdminGuard"
import Link from "next/link"

interface AdminStats {
  totalAssessments: number
  averageScore: number
  topCountries: Array<{ country: string; count: number }>
  readinessDistribution: Record<string, number>
  recentSubmissions: number
}

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState<AssessmentSubmission[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentSubmission[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [readinessFilter, setReadinessFilter] = useState<string>("all")
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentSubmission | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Check Firebase configuration
  const isConfigured = isFirebaseConfigured()

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    fetchAssessments()
  }, [isConfigured])

  useEffect(() => {
    filterAssessments()
  }, [assessments, searchTerm, countryFilter, readinessFilter])

  const fetchAssessments = async () => {
    try {
      if (!firestore) {
        console.error('Firestore not initialized')
        setLoading(false)
        return
      }

      // Fetch all assessments from Firestore
      const assessmentsQuery = query(
        collection(firestore, 'assessments'),
        orderBy('created_at', 'desc')
      )
      
      const querySnapshot = await getDocs(assessmentsQuery)
      const assessmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AssessmentSubmission[]
      
      setAssessments(assessmentsData)
      calculateStats(assessmentsData)
    } catch (error) {
      console.error("Error fetching assessments:", error)
      // Fallback to empty array if Firebase fails
      setAssessments([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: AssessmentSubmission[]) => {
    const totalAssessments = data.length
    const averageScore = data.reduce((acc, curr) => acc + curr.percentage, 0) / totalAssessments
    
    const countryCounts: Record<string, number> = {}
    const readinessCounts: Record<string, number> = {}
    
    data.forEach(assessment => {
      countryCounts[assessment.country] = (countryCounts[assessment.country] || 0) + 1
      readinessCounts[assessment.readiness_level] = (readinessCounts[assessment.readiness_level] || 0) + 1
    })
    
    const topCountries = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }))
    
    const recentSubmissions = data.filter(a => {
      const submissionDate = new Date(a.created_at || '')
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return submissionDate > weekAgo
    }).length

    setStats({
      totalAssessments,
      averageScore,
      topCountries,
      readinessDistribution: readinessCounts,
      recentSubmissions
    })
  }

  const filterAssessments = () => {
    let filtered = assessments

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter(a => a.country === countryFilter)
    }

    if (readinessFilter !== "all") {
      filtered = filtered.filter(a => a.readiness_level === readinessFilter)
    }

    setFilteredAssessments(filtered)
  }

  const getReadinessBadgeColor = (level: string) => {
    switch (level) {
      case "Advanced": return "bg-green-100 text-green-800"
      case "Intermediate": return "bg-blue-100 text-blue-800"
      case "Developing": return "bg-yellow-100 text-yellow-800"
      case "Beginner": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Company", "Role", "Country", "Score", "Percentage", "Readiness Level", "Date"]
    const csvData = filteredAssessments.map(a => [
      a.name,
      a.email,
      a.company || "",
      a.role || "",
      a.country,
      a.score.toString(),
      a.percentage.toFixed(1),
      a.readiness_level,
      new Date(a.created_at || '').toLocaleDateString()
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `assessments-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <FirebaseStatus />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">View and manage assessment submissions</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={exportToCSV} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Link href="/">
                <Button variant="outline">Back to Site</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssessments}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.recentSubmissions} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Country</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.topCountries[0]?.country || "N/A"}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.topCountries[0]?.count || 0} submissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Advanced Level</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.readinessDistribution.Advanced || 0}</div>
                <p className="text-xs text-muted-foreground">
                  High performers
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {Array.from(new Set(assessments.map(a => a.country))).sort().map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="readiness">Readiness Level</Label>
                <Select value={readinessFilter} onValueChange={setReadinessFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Developing">Developing</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setCountryFilter("all")
                    setReadinessFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Submissions ({filteredAssessments.length})</CardTitle>
            <CardDescription>
              View and manage all assessment submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.name}</TableCell>
                      <TableCell>{assessment.email}</TableCell>
                      <TableCell>{assessment.company || "-"}</TableCell>
                      <TableCell>{assessment.country}</TableCell>
                      <TableCell>{assessment.score}/{assessment.total_questions}</TableCell>
                      <TableCell>
                        <Badge className={getReadinessBadgeColor(assessment.readiness_level)}>
                          {assessment.readiness_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(assessment.created_at || '').toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAssessment(assessment)
                            setShowDetails(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Details Modal */}
        {showDetails && selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
                <CardDescription>
                  {selectedAssessment.name} - {selectedAssessment.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Company</Label>
                      <p>{selectedAssessment.company || "Not specified"}</p>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <p>{selectedAssessment.role || "Not specified"}</p>
                    </div>
                    <div>
                      <Label>Country</Label>
                      <p>{selectedAssessment.country}</p>
                    </div>
                    <div>
                      <Label>Assessment Date</Label>
                      <p>{new Date(selectedAssessment.created_at || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Results</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Score</Label>
                        <p className="text-2xl font-bold">{selectedAssessment.score}/{selectedAssessment.total_questions}</p>
                      </div>
                      <div>
                        <Label>Percentage</Label>
                        <p className="text-2xl font-bold">{selectedAssessment.percentage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <Label>Readiness Level</Label>
                        <Badge className={getReadinessBadgeColor(selectedAssessment.readiness_level)}>
                          {selectedAssessment.readiness_level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
