import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface TriggerResponse {
  message: string;
  data?: Record<string, unknown>;
}

function App() {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriggerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrigger = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/trigger-n8n`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_term: term })
      });
      if (!response.ok) {
        throw new Error("Failed to trigger workflow");
      }
      const payload = (await response.json()) as TriggerResponse;
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-slate-500">Automation Playground</p>
          <h1 className="text-3xl font-semibold">Trigger n8n pipeline</h1>
          <p className="text-slate-600">
            Enter any search term to invoke the backend FastAPI service. The server will call an n8n webhook,
            persist the response, and return data back to you.
          </p>
        </header>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-sm font-medium text-slate-700" htmlFor="term">
            Search term
          </label>
          <Input
            id="term"
            placeholder="e.g. security automation"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            disabled={loading}
          />
          <Button onClick={handleTrigger} disabled={loading || !term.trim()}>
            {loading ? "Triggering..." : "Run n8n workflow"}
          </Button>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
            <h2 className="text-lg font-semibold">Workflow response</h2>
            <pre className="mt-2 whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
