export interface AssessmentMeta {
  doc: string
  version: string
  generatedAt: string
  aiModel: string
  confidence: string
}

export interface VendorVerification {
  status: string
  result: string
  confidence: string
  notes: string
}

export interface VendorOwnership {
  description: string
  events: string[]
}

export interface VendorIdentity {
  name: string
  officialDomain: string
  legalEntity: string
  jurisdiction: string
  verification: VendorVerification
  ownership: VendorOwnership
}

export interface ProductProfile {
  name: string
  category: string
  description: string
  deliveryModel: string
  deployment: string[]
  integrations: string[]
}

export interface RiskScores {
  overallTrust: number
  securityRisk: number
  controlsMaturity: number
  uvssComposite: number
  linkedToUvss: boolean
}

export interface AlternativeSolution {
  name: string
  vendor: string
  domain: string
  category: string
}

export interface SecurityIncident {
  year: number
  type: string
  description: string
  impact: string
  verified: boolean
}

export interface VendorPractices {
  psirt: {
    exists: boolean
    url: string
  }
  bugBounty: {
    active: boolean
    platform: string
    url: string
  }
  transparency: {
    publicReports: boolean
    reportUrl: string
  }
}

export interface SecurityAssessment {
  incidents: SecurityIncident[]
  vendorPractices: VendorPractices
}

export interface ReputationMetric {
  score: number
  totalReviews: number
  lastUpdated: string
}

export interface ReputationSignals {
  g2Rating: ReputationMetric
  trustpilot: ReputationMetric
}

export interface ReferenceLink {
  type: string
  url: string
}

export interface VendorAssessment {
  meta: AssessmentMeta
  vendorIdentity: VendorIdentity
  productProfile: ProductProfile
  riskScores: RiskScores
  alternativeSolutions: AlternativeSolution[]
  securityAssessment: SecurityAssessment
  reputationSignals: ReputationSignals
  references: Record<string, ReferenceLink[]>
}
