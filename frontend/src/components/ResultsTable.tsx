// src/components/ResultsTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FactorScore {
  name: string;
  score: number; // 0–100
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

export function ResultsTable({ payload }: { payload: TriggerResponse }) {
  const profile = payload.data;

  if (!profile) {
    return <p className="text-sm text-slate-500">No data.</p>;
  }

  const factors = profile.factors ?? [];

  if (factors.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No factor scores available.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Factor</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {factors.map((factor) => (
          <TableRow key={factor.name}>
            <TableCell className="whitespace-nowrap">
              {factor.name}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-2 w-full max-w-xs rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right">
              {factor.score}/100
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
