import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
          <CardDescription>Kick off a new scan and get routed to the fast dashboard.</CardDescription>
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

          {readableJson ? (
            <pre className="max-h-[420px] overflow-auto rounded-lg bg-muted p-4 text-sm">
              {readableJson}
            </pre>
          ) : (
            !isPolling && !error && (
              <p className="text-sm">No data yet. The backend has not saved statistics.</p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
