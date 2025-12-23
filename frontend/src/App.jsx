import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { Activity, Users, AlertTriangle, FileWarning, Search } from 'lucide-react'
import './App.css' // Ensure you have some basic CSS or remove this import

function App() {
  const [study, setStudy] = useState("Study 1")
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

// NEW: State for the AI Agent
  const [emailDraft, setEmailDraft] = useState(null)
  const [agentLoading, setAgentLoading] = useState(false)

  // Fetch data from your FastAPI Backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/analytics/dashboard-metrics?study=${study}`)
        setMetrics(response.data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError("Failed to connect to backend. Is it running?")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [study])



// UPDATED: Handler for the Agent Button
  const handleDraftEmail = async () => {
    if (!metrics || !metrics.top_risky_sites.length) return;
    
    // FIX: Find the first site in the list that is NOT null
    const validRiskEntry = metrics.top_risky_sites.find(item => item.site !== null);
    
    if (!validRiskEntry) {
        alert("No valid site ID found to generate an email for.");
        return;
    }

    const riskySite = validRiskEntry.site;
    
    setAgentLoading(true);
    try {
      // Now we are guaranteed to send a string, not null
      const res = await axios.post(`http://127.0.0.1:8000/api/agent/draft-escalation`, {
        site_id: riskySite,
        study_name: study
      });
      setEmailDraft(res.data);
    } catch (err) {
      alert("Error triggering agent: " + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setAgentLoading(false);
    }
  };

  // Simple KPI Card Component
  const KpiCard = ({ title, value, icon: Icon, color }) => (
    <div style={{ 
      background: 'white', padding: '20px', borderRadius: '12px', 
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', flex: 1, minWidth: '200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: '#64748b' }}>
        <Icon size={20} style={{ marginRight: '8px' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>{value}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>🏥 Clarity AI Command Center</h1>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>Real-time oversight for <strong>{study}</strong></p>
        </div>
        
        {/* Study Selector */}
        <select 
          value={study} 
          onChange={(e) => setStudy(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
        >
          <option value="Study 1">Study 1</option>
          <option value="Study 2">Study 2</option>
        </select>
      </header>

      {/* ERROR STATE */}
      {error && (
        <div style={{ padding: '15px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px' }}>
          ❌ {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Metrics...</div>
      ) : metrics && (
        <>
          {/* ROW 1: KPI CARDS */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <KpiCard 
              title="Total Subjects" 
              value={metrics.kpis.total_subjects} 
              icon={Users} 
              color="#3b82f6" 
            />
            <KpiCard 
              title="Protocol Deviations" 
              value={metrics.kpis.total_pds} 
              icon={AlertTriangle} 
              color="#f59e0b" 
            />
            <KpiCard 
              title="Missing Pages" 
              value={metrics.kpis.total_missing_pages} 
              icon={FileWarning} 
              color="#ef4444" 
            />
            <KpiCard 
              title="Clean Patient Rate" 
              value={metrics.kpis.clean_patient_rate} 
              icon={Activity} 
              color="#10b981" 
            />
          </div>

          {/* ROW 2: CHARTS & INSIGHTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            
            {/* Chart Section */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <h3 style={{ marginTop: 0, color: '#334155' }}>🚨 Risk Analysis: Top Sites by Issues</h3>
              <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.top_risky_sites}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="site" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="issues" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

{/* AI Agent Section - UPDATED */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <Search size={20} style={{ color: '#8b5cf6', marginRight: '8px' }} />
                <h3 style={{ margin: 0, color: '#334155' }}>AI Action Center</h3>
              </div>
              
              <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                <strong>Insight detected:</strong>
                <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                  <li>Site <strong>{metrics.top_risky_sites[0]?.site}</strong> is the primary bottleneck.</li>
                  <li>Action: Generate escalation protocol.</li>
                </ul>
              </div>

              {!emailDraft ? (
                 <button 
                  onClick={handleDraftEmail}
                  disabled={agentLoading}
                  style={{ 
                    marginTop: '20px', width: '100%', padding: '12px', 
                    background: agentLoading ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none', 
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
                  }}
                >
                  {agentLoading ? "🤖 AI is Analyzing..." : "🤖 Auto-Draft Escalation Email"}
                </button>
              ) : (
                <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
                    DRAFT GENERATED ({emailDraft.risk_level} RISK):
                  </div>
                  <textarea 
                    readOnly 
                    value={`${emailDraft.generated_email.subject}\n\n${emailDraft.generated_email.body}`}
                    style={{ 
                      width: '100%', height: '200px', padding: '10px', 
                      borderRadius: '8px', border: '1px solid #cbd5e1', 
                      fontSize: '0.85rem', fontFamily: 'monospace' 
                    }}
                  />
                  <button 
                    onClick={() => {alert("Email Sent via SMTP!"); setEmailDraft(null);}}
                    style={{ 
                      marginTop: '10px', width: '100%', padding: '10px', 
                      background: '#10b981', color: 'white', border: 'none', 
                      borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
                    }}
                  >
                    🚀 Approve & Send
                  </button>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}

export default App