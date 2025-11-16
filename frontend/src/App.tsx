import { VendorDashboard } from "@/components/dashboard/VendorDashboard"
import { vendorAssessmentMock } from "@/data/vendor-assessment"

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <VendorDashboard data={vendorAssessmentMock} />
    </div>
  )
}

export default App
