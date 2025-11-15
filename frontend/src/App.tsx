import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ResultsTable } from "./components/ResultsTable";
// import types from a shared file or inline them here

interface FactorScore {
  name: string;
  score: number;
}

interface VendorSecurityProfile {
  companyName: string;
  productType: string;
  lastAssessedDaysAgo: number;
  validationStatus: "validated" | "unvalidated";
  riskLevel: "low" | "medium" | "high";
  confidenceLevel: "low" | "medium" | "high";
  overallScore: number;
  knownCves: number;
  certifications: string[];
  factors: FactorScore[];
}

interface TriggerResponse {
  message: string;
  data?: VendorSecurityProfile;
}

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function App() {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriggerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dummyPayload: TriggerResponse = {
    message: "Dummy security profile loaded",
    data: {
      companyName: "SecureCloud Technologies Inc.",
      productType: "SaaS - Cloud Security",
      lastAssessedDaysAgo: 2,
      validationStatus: "validated",
      riskLevel: "low",
      confidenceLevel: "high",
      overallScore: 82,
      knownCves: 12,
      certifications: ["SOC 2", "ISO 27001", "PCI DSS"],
      factors: [
        { name: "Security Posture", score: 78 },
        { name: "Data & Compliance", score: 90 },
        { name: "Admin Controls", score: 88 },
        { name: "Reputation Score", score: 82 },
      ],
    },
  };

  const handleTrigger = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {

      //ACTUAL DATA FETCHING
      //ACTUAL DATA FETCHING
      // const response = await fetch(`${API_BASE}/api/trigger-n8n`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ input_term: term })
      // });
      // if (!response.ok) {
      //   throw new Error("Failed to trigger workflow");
      // }
      // const payload = (await response.json()) as TriggerResponse;
      // setResult(payload);
      // fake latency; in real mode you’d call the API here
      await new Promise((resolve) => setTimeout(resolve, 500));
      setResult(dummyPayload);
    } catch (error) {
      console.error(error);
      setError("Failed to load dummy data");
    } finally {
      setLoading(false);
    }
  };

  const profile = result?.data ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-slate-500">
            Automation Playground
          </p>
          <h1 className="text-3xl font-semibold">Trigger n8n pipeline</h1>
          <p className="text-slate-600">
            Enter any vendor name to simulate a security posture assessment
            and view the results.
          </p>
        </header>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-sm font-medium text-slate-700" htmlFor="term">
            Vendor name
          </label>
          <Input
            id="term"
            placeholder="e.g. SecureCloud Technologies Inc."
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            disabled={loading}
          />
          <Button onClick={handleTrigger} disabled={loading || !term.trim()}>
            {loading ? "Loading..." : "Run n8n workflow (dummy)"}
          </Button>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {result && profile && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Header area similar to card */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {profile.companyName}
                </h2>
                <p className="text-slate-600">{profile.productType}</p>
                <p className="text-xs text-slate-500">
                  Last assessed: {profile.lastAssessedDaysAgo} days ago
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs">
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  VALIDATED
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 uppercase">
                    {profile.riskLevel} risk
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 uppercase">
                    {profile.confidenceLevel} confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Main content: left = factors, right = summary metrics */}
            <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
              <div className="space-y-4">
                <ResultsTable payload={result} />
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Overall Score</p>
                  <p className="text-3xl font-semibold text-emerald-600">
                    {profile.overallScore}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Known CVEs</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {profile.knownCves}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Certifications</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw JSON debug view */}
            <pre className="mt-4 rounded-md bg-slate-900 p-4 text-xs text-slate-50">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
