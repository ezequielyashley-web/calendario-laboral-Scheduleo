import DashboardDesktop from "@/components/desktop/DashboardDesktop"

export default function DashboardPage() {
  return (
    <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 20, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
      <DashboardDesktop />
    </div>
  )
}