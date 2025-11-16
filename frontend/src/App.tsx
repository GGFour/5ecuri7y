import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
const SESSION_STORAGE_KEY = "securityassess.sessions"
const ACTIVE_SESSION_KEY = "securityassess.activeSession"

interface TriggerResponse {
  id: number | string
  message?: string
}

interface StatisticsResponse {
  id: number
  json: string | null
}

type SessionRecord = {
  id: string
  query: string
  createdAt: number
}

type View = "home" | "dashboard"

type Nullable<T> = T | null | undefined

type AssessmentDocument = {
  meta?: {
    doc?: string
    version?: string
    generated_at?: string
    ai_model?: string
    confidence?: string
  }
  vendor_identity?: {
    name?: string
    official_domain?: string
    legal_entity?: string
    jurisdiction?: string
    verification?: {
      status?: string
      result?: string
      confidence?: string
      notes?: string
    }
    ownership?: {
      description?: string
      events?: Array<{ description?: string; year?: number }>
    }
  }
  product_profile?: {
    name?: string
    category?: string
    description?: string
    delivery_model?: string
    deployment?: string[]
    integrations?: string[]
  }
  risk_scores?: Record<string, number> & {
    linked_to_uvss?: boolean
  }
  alternative_solutions?: Array<{
    name?: string
    vendor?: string
    domain?: string
    category?: string
  }>
  security_assessment?: {
    incidents?: Array<{
      year?: number
      type?: string
      description?: string
      impact?: string
      verified?: boolean
    }>
    vendor_practices?: {
      psirt?: {
        exists?: boolean
        url?: string
      }
      bug_bounty?: {
        active?: boolean
        platform?: string
        url?: string
      }
      transparency?: {
        public_reports?: boolean
        report_url?: string
      }
    }
  }
  reputation_signals?: {
    g2_rating?: {
      score?: number
      total_reviews?: number
      last_updated?: string
    }
    trustpilot?: {
      score?: number
      total_reviews?: number
      last_updated?: string
    }
  }
  references?: Record<string, Array<{ type?: string; url?: string }>>
}

const loadSessions = (): SessionRecord[] => {
  if (typeof window === "undefined") {
    return []
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as SessionRecord[]
    return Array.isArray(parsed)
      ? parsed
          .filter((session): session is SessionRecord =>
            Boolean(session?.id && session?.createdAt),
          )
          .sort((a, b) => b.createdAt - a.createdAt)
      : []
  } catch (error) {
    console.warn("Unable to parse sessions from localStorage", error)
    return []
  }
}

const persistSessions = (records: SessionRecord[]): void => {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(records))
}

const readActiveSessionId = (): string | null => {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage.getItem(ACTIVE_SESSION_KEY)
}

const persistActiveSessionId = (id: string | null): void => {
  if (typeof window === "undefined") {
    return
  }
  if (!id) {
    window.localStorage.removeItem(ACTIVE_SESSION_KEY)
  } else {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, id)
  }
}

function App() {
  const [view, setView] = useState<View>("home")
  const [term, setTerm] = useState("")
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setSessions(loadSessions())
    setActiveId(readActiveSessionId())
  }, [])

  const handleTrigger = useCallback(async () => {
    const query = term.trim()
    if (!query) {
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const response = await fetch(`${API_BASE}/api/trigger-n8n`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error("Trigger request failed")
      }

      const payload = (await response.json()) as TriggerResponse
      if (!payload.id) {
        throw new Error("Missing workflow id")
      }

      const nextSession: SessionRecord = {
        id: String(payload.id),
        query,
        createdAt: Date.now(),
      }

      setSessions((prev) => {
        const filtered = prev.filter((session) => session.id !== nextSession.id)
        const merged = [nextSession, ...filtered].slice(0, 20)
        persistSessions(merged)
        return merged
      })

      setActiveId(nextSession.id)
      persistActiveSessionId(nextSession.id)
      setView("dashboard")
    } catch (error) {
      console.error(error)
      setFormError("Unable to trigger the workflow. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [term])

  const handleSelectSession = useCallback((sessionId: string) => {
    setActiveId(sessionId)
    persistActiveSessionId(sessionId)
    setView("dashboard")
    setFormError(null)
  }, [])

  const handleBackToHome = useCallback(() => {
    setView("home")
  }, [])

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeId) ?? (activeId ? { id: activeId, query: "", createdAt: Date.now() } : null),
    [activeId, sessions],
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        {view === "home" ? (
          <HomeView
            term={term}
            onTermChange={setTerm}
            onSubmit={handleTrigger}
            isSubmitting={isSubmitting}
            errorMessage={formError}
            sessions={sessions}
            onSelectSession={handleSelectSession}
          />
        ) : activeSession ? (
          <DashboardView session={activeSession} onBack={handleBackToHome} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Missing session</CardTitle>
              <CardDescription>Select a session from the list to continue.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-start">
              <Button variant="outline" onClick={handleBackToHome}>
                Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

type HomeViewProps = {
  term: string
  onTermChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  errorMessage: string | null
  sessions: SessionRecord[]
  onSelectSession: (sessionId: string) => void
}

function HomeView({ term, onTermChange, onSubmit, isSubmitting, errorMessage, sessions, onSelectSession }: HomeViewProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>SecurityAssess AI</CardTitle>
          <CardDescription>Start a new scan and get routed to your previous findings dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="search-term">
              Enter vendor, product, or URL
            </label>
            <Input
              id="search-term"
              placeholder="Perplexity AI"
              value={term}
              onChange={(event) => onTermChange(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          <Button onClick={onSubmit} disabled={!term.trim() || isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Sending request
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="size-4" />
                Trigger workflow
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full lg:w-80">
        <CardHeader>
          <CardTitle className="text-xl">Sessions</CardTitle>
          <CardDescription>Pick an existing run to re-open its dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing yet. Trigger your first workflow.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className="flex flex-col rounded-lg border px-3 py-2 text-left transition hover:bg-accent"
                >
                  <span className="text-sm font-semibold">Session #{session.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {session.query || "Unknown query"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type DashboardViewProps = {
  session: SessionRecord
  onBack: () => void
}

function DashboardView({ session, onBack }: DashboardViewProps) {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    let stopped = false

    setStatistics(null)
    setError(null)
    setIsPolling(true)

    const fetchStatistics = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/statistics/${session.id}`)
        if (!response.ok) {
          throw new Error("Failed to load statistics")
        }
        const payload = (await response.json()) as StatisticsResponse
        if (stopped) {
          return
        }
        setStatistics(payload)
        setError(null)
        if (payload.json) {
          setIsPolling(false)
          if (timer) {
            window.clearInterval(timer)
          }
        }
      } catch (err) {
        console.error(err)
        if (stopped) {
          return
        }
        setError("Unable to reach statistics API.")
        setIsPolling(false)
        if (timer) {
          window.clearInterval(timer)
        }
      }
    }

    fetchStatistics()
    const timer = window.setInterval(fetchStatistics, 1000)

    return () => {
      stopped = true
      if (timer) {
        window.clearInterval(timer)
      }
    }
  }, [session.id])

  const parsedJson = useMemo(() => {
    if (!statistics?.json) {
      return null
    }
    try {
      return JSON.parse(statistics.json)
    } catch (error) {
      console.warn("Unable to parse statistics payload", error)
      return statistics.json
    }
  }, [statistics])

  const readableJson = useMemo(() => {
    if (!parsedJson) {
      return null
    }
    return typeof parsedJson === "string"
      ? parsedJson
      : JSON.stringify(parsedJson, null, 2)
  }, [parsedJson])

  const structuredData = useMemo(() => {
    if (!parsedJson || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
      return null
    }
    return parsedJson as AssessmentDocument
  }, [parsedJson])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tracking session #{session.id}</p>
          {session.query && <p className="text-sm">Query: {session.query}</p>}
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to main
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            {isPolling ? "Waiting for data from the backend" : "Latest snapshot"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPolling && (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              <span>Hold tight, assembling trust brief…</span>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!isPolling && !error && structuredData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>Structured insights ready.</span>
            </div>
          )}

          {!isPolling && !error && !structuredData && readableJson && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="size-4 text-amber-500" />
              <span>Unable to parse document. Showing raw payload.</span>
            </div>
          )}

          {!isPolling && !error && !readableJson && (
            <p className="text-sm">No data yet. The backend has not saved statistics.</p>
          )}
        </CardContent>
      </Card>

      {structuredData ? (
        <StructuredDashboard data={structuredData} rawJson={readableJson} />
      ) : (
        readableJson && (
          <Card>
            <CardHeader>
              <CardTitle>Raw payload</CardTitle>
              <CardDescription>Document returned by the backend.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[420px] overflow-auto rounded-lg bg-muted p-4 text-sm">
                {readableJson}
              </pre>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}

type StructuredDashboardProps = {
  data: AssessmentDocument
  rawJson: string | null
}

function StructuredDashboard({ data, rawJson }: StructuredDashboardProps) {
  const vendor = data.vendor_identity
  const product = data.product_profile
  const meta = data.meta
  const riskScores = Object.entries(data.risk_scores ?? {}).filter(([, value]) => typeof value === "number")
  const incidents = data.security_assessment?.incidents ?? []
  const practices = data.security_assessment?.vendor_practices
  const alternatives = data.alternative_solutions ?? []
  const reputation = data.reputation_signals
  const references = Object.entries(data.references ?? {})

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-3xl font-semibold">{vendor?.name ?? product?.name ?? "Vendor"}</CardTitle>
            <CardDescription>{product?.category || meta?.doc || "Security assessment"}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {meta?.generated_at && <span>Generated {formatDate(meta.generated_at)}</span>}
            {meta?.version && <span>v{meta.version}</span>}
            {meta?.ai_model && <span>Model: {meta.ai_model}</span>}
            {meta?.confidence && (
              <Badge variant="secondary" className="text-xs">
                Confidence: {meta.confidence}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {riskScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk overview</CardTitle>
            <CardDescription>Composite scores reported by the backend</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {riskScores.map(([label, value]) => (
              <div key={label} className="rounded-lg border p-4">
                <div className="flex items-center justify-between text-sm font-medium capitalize">
                  <span>{label.replaceAll("_", " ")}</span>
                  <span>{Number(value).toFixed(0)}/100</span>
                </div>
                <Progress className="mt-3" value={Number(value)} />
              </div>
            ))}
            {typeof data.risk_scores?.linked_to_uvss === "boolean" && (
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">UVSS linkage</p>
                <p className="mt-3 text-lg font-semibold">
                  {data.risk_scores.linked_to_uvss ? "Linked" : "Not linked"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendor identity</CardTitle>
            <CardDescription>Registration, jurisdiction, and verification signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {vendor ? (
              <>
                <DetailRow label="Legal entity" value={vendor.legal_entity} />
                <DetailRow label="Jurisdiction" value={vendor.jurisdiction} />
                <DetailRow label="Official domain" value={vendor.official_domain} />
                {vendor.verification?.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Verification</span>
                    <Badge variant={vendor.verification.status === "VERIFIED" ? "default" : "outline"}>
                      {vendor.verification.status}
                    </Badge>
                  </div>
                )}
                {vendor.verification?.notes && <p className="text-muted-foreground">{vendor.verification.notes}</p>}
                {vendor.ownership?.description && (
                  <p className="text-muted-foreground">Ownership: {vendor.ownership.description}</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No vendor details provided.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product profile</CardTitle>
            <CardDescription>Deployment model and integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {product ? (
              <>
                <DetailRow label="Description" value={product.description} />
                <DetailRow label="Delivery" value={product.delivery_model} />
                {product.deployment && product.deployment.length > 0 && (
                  <DetailRow label="Deployment" value={product.deployment.join(", ")} />
                )}
                {product.integrations && product.integrations.length > 0 && (
                  <DetailRow label="Integrations" value={product.integrations.join(", ")} />
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No product details provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Security incidents</CardTitle>
            <CardDescription>Recent disclosures or reported events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {incidents.length === 0 && <p className="text-muted-foreground">No incidents recorded.</p>}
            {incidents.map((incident, index) => (
              <div key={`${incident.year}-${incident.type}-${index}`} className="rounded-lg border p-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{incident.type || "Incident"}</span>
                  {incident.year && <span>{incident.year}</span>}
                </div>
                {incident.description && <p className="mt-2 text-muted-foreground">{incident.description}</p>}
                {incident.impact && <p className="mt-1 text-xs text-muted-foreground">Impact: {incident.impact}</p>}
                {typeof incident.verified === "boolean" && (
                  <Badge variant={incident.verified ? "secondary" : "outline"} className="mt-2 w-fit">
                    {incident.verified ? "Verified" : "Unverified"}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor practices</CardTitle>
            <CardDescription>Signals shared via public security programs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <PracticeItem
              title="PSIRT"
              active={practices?.psirt?.exists}
              href={practices?.psirt?.url}
              description="Dedicated response team"
            />
            <PracticeItem
              title="Bug bounty"
              active={practices?.bug_bounty?.active}
              href={practices?.bug_bounty?.url}
              description={practices?.bug_bounty?.platform}
            />
            <PracticeItem
              title="Transparency reports"
              active={practices?.transparency?.public_reports}
              href={practices?.transparency?.report_url}
              description="Security or availability disclosures"
            />
          </CardContent>
        </Card>
      </div>

      {reputation && (
        <Card>
          <CardHeader>
            <CardTitle>Reputation signals</CardTitle>
            <CardDescription>External review platforms and freshness.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {Object.entries(reputation).map(([platform, signal]) => (
              <div key={platform} className="rounded-lg border p-4">
                <p className="text-sm font-semibold capitalize">{platform.replaceAll("_", " ")}</p>
                <p className="mt-2 text-3xl font-bold">{signal?.score ?? "-"}</p>
                <p className="text-sm text-muted-foreground">
                  {signal?.total_reviews ? `${signal.total_reviews} reviews` : "No reviews"}
                </p>
                {signal?.last_updated && (
                  <p className="text-xs text-muted-foreground">Updated {formatDate(signal.last_updated)}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparable vendors</CardTitle>
            <CardDescription>Other solutions the team can evaluate.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Vendor</th>
                  <th className="py-2 font-medium">Domain</th>
                  <th className="py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {alternatives.map((solution) => (
                  <tr key={`${solution.name}-${solution.domain}`} className="border-t">
                    <td className="py-2 font-medium">{solution.name}</td>
                    <td className="py-2">{solution.vendor}</td>
                    <td className="py-2 text-primary">
                      {solution.domain ? (
                        <a href={prependProtocol(solution.domain)} target="_blank" rel="noreferrer">
                          {solution.domain}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2">{solution.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>References & sources</CardTitle>
            <CardDescription>Public intelligence used for the assessment.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {references.map(([section, links]) => (
              <div key={section} className="rounded-lg border p-4">
                <p className="text-sm font-semibold capitalize">{section.replaceAll("_", " ")}</p>
                <ul className="mt-2 space-y-1 text-sm text-primary">
                  {links?.map((link) => (
                    <li key={`${section}-${link.url}`}>
                      {link.url ? (
                        <a href={link.url} target="_blank" rel="noreferrer" className="truncate">
                          {link.type ? `${link.type}: ` : ""}
                          {link.url}
                        </a>
                      ) : (
                        link.type
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {rawJson && (
        <Card>
          <CardHeader>
            <CardTitle>Raw payload</CardTitle>
            <CardDescription>Use as a fallback for manual review.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[360px] overflow-auto rounded-lg bg-muted p-4 text-xs">{rawJson}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: Nullable<string> }) {
  if (!value) {
    return null
  }
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function PracticeItem({
  title,
  active,
  description,
  href,
}: {
  title: string
  active?: boolean
  description?: string
  href?: string
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{title}</span>
        <Badge variant={active ? "secondary" : "outline"}>{active ? "Active" : "Missing"}</Badge>
      </div>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      {href && (
        <a className="mt-2 inline-block text-xs text-primary" href={href} target="_blank" rel="noreferrer">
          View details
        </a>
      )}
    </div>
  )
}

function formatDate(input: Nullable<string>) {
  if (!input) {
    return ""
  }
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return input
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function prependProtocol(url?: string) {
  if (!url) {
    return ""
  }
  if (url.startsWith("http")) {
    return url
  }
  return `https://${url}`
}

export default App
