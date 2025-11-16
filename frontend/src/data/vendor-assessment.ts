import { type VendorAssessment } from "@/types/vendor-assessment"

export const vendorAssessmentMock: VendorAssessment = {
  meta: {
    doc: "Self-contained vendor security assessment document. Copy-fill for different vendors.",
    version: "1.0",
    generatedAt: "2025-11-15T12:00:00Z",
    aiModel: "vendor-risk-assessor-v1",
    confidence: "high",
  },
  vendorIdentity: {
    name: "TeamSync",
    officialDomain: "teamsync.com",
    legalEntity: "TeamSync Software Inc.",
    jurisdiction: "US",
    verification: {
      status: "VERIFIED",
      result: "validated",
      confidence: "high",
      notes:
        "Vendor name, official domain, and legal entity status confirmed via public registries.",
    },
    ownership: {
      description: "Independent vendor; no major mergers or acquisitions reported.",
      events: [],
    },
  },
  productProfile: {
    name: "TeamSync",
    category: "Collaboration / File Sharing",
    description:
      "Team collaboration and file sharing platform with real-time sync and commenting features.",
    deliveryModel: "SaaS",
    deployment: ["SaaS (multi-tenant cloud)"],
    integrations: ["SSO providers", "Email suites", "Cloud storage"],
  },
  riskScores: {
    overallTrust: 55,
    securityRisk: 38,
    controlsMaturity: 72,
    uvssComposite: 55,
    linkedToUvss: true,
  },
  alternativeSolutions: [
    {
      name: "Notion",
      vendor: "Notion Labs Inc.",
      domain: "notion.so",
      category: "Collaboration / Knowledge Management",
    },
    {
      name: "Confluence",
      vendor: "Atlassian",
      domain: "atlassian.com/software/confluence",
      category: "Collaboration / Documentation",
    },
    {
      name: "Asana",
      vendor: "Asana Inc.",
      domain: "asana.com",
      category: "Project Management / Collaboration",
    },
  ],
  securityAssessment: {
    incidents: [
      {
        year: 2022,
        type: "Configuration incident",
        description:
          "Misconfiguration impacted availability; no data breach confirmed.",
        impact: "No breach occurred",
        verified: true,
      },
    ],
    vendorPractices: {
      psirt: {
        exists: true,
        url: "https://teamsync.com/security/psirt",
      },
      bugBounty: {
        active: true,
        platform: "HackerOne",
        url: "https://hackerone.com/teamsync",
      },
      transparency: {
        publicReports: true,
        reportUrl: "https://teamsync.com/security/transparency",
      },
    },
  },
  reputationSignals: {
    g2Rating: {
      score: 4.2,
      totalReviews: 142,
      lastUpdated: "2025-11-10",
    },
    trustpilot: {
      score: 3.8,
      totalReviews: 87,
      lastUpdated: "2025-11-08",
    },
  },
  references: {
    vendor_identity: [
      {
        type: "company_registry",
        url: "https://example-registry.org/teamsync",
      },
      {
        type: "whois",
        url: "https://whois.example.net/lookup?domain=teamsync.com",
      },
      {
        type: "crunchbase",
        url: "https://www.crunchbase.com/organization/teamsync",
      },
      {
        type: "linkedin",
        url: "https://www.linkedin.com/company/teamsync",
      },
      {
        type: "domain_ownership",
        url: "https://securitytrails.com/domain/teamsync.com",
      },
    ],
    product_classification: [
      { type: "vendor_website", url: "https://teamsync.com" },
      { type: "app_store", url: "https://apps.example.com/teamsync" },
    ],
    vulnerabilities: [
      { type: "nvd", url: "https://nvd.nist.gov" },
      { type: "mitre_cve", url: "https://cve.mitre.org" },
      {
        type: "cisa_kev",
        url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
      },
    ],
    incidents: [
      {
        type: "vendor_advisory",
        url: "https://teamsync.com/security/advisories/2022-config",
      },
      {
        type: "cert_advisories",
        url: "https://cert.example.org/vendor/teamsync",
      },
      {
        type: "security_news",
        url: "https://news.example.com/search?q=teamsync+breach",
      },
    ],
    vendor_security: [
      { type: "psirt", url: "https://teamsync.com/security/psirt" },
      { type: "bug_bounty", url: "https://hackerone.com/teamsync" },
      {
        type: "transparency",
        url: "https://teamsync.com/security/transparency",
      },
    ],
    compliance: [
      { type: "soc2_info", url: "https://teamsync.com/compliance/soc2" },
      { type: "gdpr_info", url: "https://teamsync.com/privacy/gdpr" },
    ],
    controls: [
      { type: "admin_docs", url: "https://docs.teamsync.com/admin" },
      {
        type: "audit_logging",
        url: "https://docs.teamsync.com/security/audit-logs",
      },
    ],
    data_security: [
      {
        type: "encryption_details",
        url: "https://teamsync.com/security/encryption",
      },
      {
        type: "backup_policy",
        url: "https://docs.teamsync.com/operations/backup",
      },
    ],
    network: [
      {
        type: "infrastructure_docs",
        url: "https://teamsync.com/security/infrastructure",
      },
    ],
    reputation: [
      { type: "g2", url: "https://www.g2.com/products/teamsync" },
      {
        type: "trustpilot",
        url: "https://www.trustpilot.com/review/teamsync.com",
      },
    ],
  },
}
