import type React from "react"

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  Link2,
  ShieldCheck,
  Star,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { type ReferenceLink, type VendorAssessment } from "@/types/vendor-assessment"

interface VendorDashboardProps {
  data: VendorAssessment
}

const formatDate = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

const formatCategoryLabel = (value: string): string =>
  value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")

interface InfoItemProps {
  label: string
  value: React.ReactNode
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <div className="text-sm font-medium text-slate-900">{value}</div>
  </div>
)

const ReferenceLinkButton = ({ link }: { link: ReferenceLink }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noreferrer"
    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
  >
    <ExternalLink className="size-3.5 text-slate-400" />
    <span className="truncate">{link.type.replaceAll("_", " ")}</span>
  </a>
)

export const VendorDashboard = ({ data }: VendorDashboardProps) => {
  const {
    meta,
    vendorIdentity,
    productProfile,
    riskScores,
    alternativeSolutions,
    securityAssessment,
    reputationSignals,
    references,
  } = data

  const riskScoreCards = [
    {
      id: "overall-trust",
      label: "Overall trust",
      value: riskScores.overallTrust,
      description: "Holistic trust posture",
      icon: ShieldCheck,
    },
    {
      id: "security-risk",
      label: "Security risk",
      value: riskScores.securityRisk,
      description: "Likelihood of security events",
      icon: AlertTriangle,
    },
    {
      id: "controls-maturity",
      label: "Controls maturity",
      value: riskScores.controlsMaturity,
      description: "Breadth of security controls",
      icon: Layers,
    },
    {
      id: "uvss",
      label: "UVSS composite",
      value: riskScores.uvssComposite,
      description: riskScores.linkedToUvss
        ? "Linked to UVSS baseline"
        : "Not linked to UVSS",
      icon: FileText,
    },
  ]

  const reputationEntries = [
    { label: "G2 rating", metric: reputationSignals.g2Rating },
    { label: "Trustpilot", metric: reputationSignals.trustpilot },
  ]

  const practices = [
    {
      label: "PSIRT",
      active: securityAssessment.vendorPractices.psirt.exists,
      helper: "Coordinated response",
      url: securityAssessment.vendorPractices.psirt.url,
    },
    {
      label: "Bug bounty",
      active: securityAssessment.vendorPractices.bugBounty.active,
      helper: securityAssessment.vendorPractices.bugBounty.platform,
      url: securityAssessment.vendorPractices.bugBounty.url,
    },
    {
      label: "Transparency",
      active: securityAssessment.vendorPractices.transparency.publicReports,
      helper: "Public reports",
      url: securityAssessment.vendorPractices.transparency.reportUrl,
    },
  ]

  const referenceEntries = Object.entries(references)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 lg:px-8">
      <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge
                  variant="success"
                  className="border-emerald-400/40 bg-emerald-400/20 text-emerald-50"
                >
                  {vendorIdentity.verification.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-white/30 text-white"
                >
                  {productProfile.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-white/30 text-white"
                >
                  {vendorIdentity.jurisdiction}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <ShieldCheck className="size-4" />
                  <span>{meta.doc}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold lg:text-4xl">
                    {vendorIdentity.name}
                  </h1>
                  <p className="mt-2 text-base text-white/80">
                    {productProfile.description}
                  </p>
                </div>
                <p className="text-sm text-white/70">
                  Verified as {vendorIdentity.verification.result} ·
                  confidence: {vendorIdentity.verification.confidence}
                </p>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-white/80">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">
                    Version
                  </p>
                  <p className="font-semibold">{meta.version}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">
                    Generated
                  </p>
                  <p className="font-semibold">{formatDate(meta.generatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">
                    AI model
                  </p>
                  <p className="font-semibold">{meta.aiModel}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-white/80">
              <p className="text-xs uppercase tracking-wide text-white/60">
                Official domain
              </p>
              <div className="flex items-center gap-2 text-base font-semibold text-white">
                <Globe className="size-4" />
                <span>{vendorIdentity.officialDomain}</span>
              </div>
              <Button
                asChild
                variant="secondary"
                className="mt-2 w-fit border-white/20 bg-white text-slate-900 hover:bg-slate-100"
              >
                <a
                  href={`https://${vendorIdentity.officialDomain}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit site
                  <ExternalLink className="ml-2 size-4" />
                </a>
              </Button>
              <Separator className="bg-white/10" />
              <p className="text-xs uppercase tracking-wide text-white/60">
                Confidence
              </p>
              <Badge
                variant="success"
                className="w-fit border-emerald-400/40 bg-emerald-400/20 text-emerald-50"
              >
                {meta.confidence} confidence
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {riskScoreCards.map((card) => (
          <Card key={card.id}>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2 text-slate-600">
                <card.icon className="size-4" />
                <CardTitle className="text-base">{card.label}</CardTitle>
              </div>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-900">
                  {card.value}
                </span>
                <span className="text-sm text-slate-500">/100</span>
              </div>
              <Progress value={card.value} className="mt-3 bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Vendor identity</CardTitle>
            <CardDescription>
              {vendorIdentity.verification.notes}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <InfoItem
                label="Legal entity"
                value={vendorIdentity.legalEntity}
              />
              <InfoItem
                label="Jurisdiction"
                value={vendorIdentity.jurisdiction}
              />
              <InfoItem
                label="Official domain"
                value={
                  <a
                    href={`https://${vendorIdentity.officialDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-600"
                  >
                    {vendorIdentity.officialDomain}
                    <ExternalLink className="size-3.5" />
                  </a>
                }
              />
              <InfoItem
                label="Ownership"
                value={vendorIdentity.ownership.description}
              />
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success" className="normal-case">
                  {vendorIdentity.verification.status}
                </Badge>
                <span className="text-sm text-slate-600">
                  {vendorIdentity.verification.result} · confidence {" "}
                  {vendorIdentity.verification.confidence}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product profile</CardTitle>
            <CardDescription>{productProfile.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Delivery model" value={productProfile.deliveryModel} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Deployment
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {productProfile.deployment.map((item) => (
                  <Badge key={item} variant="outline" className="normal-case">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Integrations
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {productProfile.integrations.map((item) => (
                  <Badge key={item} variant="secondary" className="normal-case">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Security assessment</CardTitle>
            <CardDescription>
              Recent incidents and proactive programs maintained by the vendor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Incidents
              </p>
              <ul className="mt-3 space-y-4">
                {securityAssessment.incidents.map((incident) => (
                  <li
                    key={`${incident.year}-${incident.type}`}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="normal-case">
                        {incident.year}
                      </Badge>
                      <p className="font-medium text-slate-900">
                        {incident.type}
                      </p>
                      {incident.verified ? (
                        <Badge variant="success" className="normal-case">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="normal-case">
                          Unverified
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {incident.description}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      Impact: {incident.impact}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Vendor practices
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {practices.map((practice) => (
                  <a
                    key={practice.label}
                    href={practice.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      {practice.active ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="size-4 text-amber-500" />
                      )}
                      <span className="text-sm font-semibold text-slate-900">
                        {practice.label}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {practice.active ? practice.helper : "Not available"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reputation signals</CardTitle>
            <CardDescription>
              Third-party sentiment across major review platforms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reputationEntries.map((entry) => (
              <div
                key={entry.label}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {entry.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      Updated {formatDate(entry.metric.lastUpdated)}
                    </p>
                  </div>
                  <Star className="size-4 text-amber-500" />
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold text-slate-900">
                    {entry.metric.score.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {entry.metric.totalReviews} reviews
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alternative solutions</CardTitle>
            <CardDescription>
              Comparable platforms to evaluate during procurement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {alternativeSolutions.map((solution) => (
                <li
                  key={solution.domain}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {solution.name}
                    </p>
                    <p className="text-sm text-slate-500">{solution.vendor}</p>
                    <Badge variant="outline" className="mt-2 normal-case">
                      {solution.category}
                    </Badge>
                  </div>
                  <a
                    href={`https://${solution.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600"
                  >
                    {solution.domain}
                    <ExternalLink className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick signals</CardTitle>
            <CardDescription>
              Snapshot of operational posture from the AI generated dossier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Activity className="size-4" />
                <p className="text-sm font-medium">
                  Linked to UVSS: {riskScores.linkedToUvss ? "Yes" : "No"}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                UVSS composite score of {riskScores.uvssComposite} used as reference baseline.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Link2 className="size-4" />
                <p className="text-sm font-medium">Document sources</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {referenceEntries.length} reference categories captured for this vendor.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Evidence references</CardTitle>
            <CardDescription>
              Direct links to source material used to construct the assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {referenceEntries.map(([category, links]) => (
              <div key={category} className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="normal-case">
                    {formatCategoryLabel(category)}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {links.length} link{links.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {links.map((link) => (
                    <ReferenceLinkButton key={link.url} link={link} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
