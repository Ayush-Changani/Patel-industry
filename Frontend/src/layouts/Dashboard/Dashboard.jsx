import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import {
  FaFileInvoice, FaUsers, FaBoxOpen, FaShoppingCart,
  FaWarehouse, FaClipboardList, FaArrowUp, FaArrowDown,
  FaBell, FaTruck, FaCheckCircle, FaClock, FaTimesCircle,
  FaCalendarAlt, FaFileAlt, FaUserTie, FaAngleRight,
  FaBuilding, FaLayerGroup, FaChartPie, FaFilter
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area, LineChart, Line, RadialBarChart, RadialBar,
  ComposedChart
} from "recharts";
import Sidebar   from "../../components/Sidebar";
import Header    from "../../components/Header";
import Footer    from "../../components/Footer";

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const T = {
  bg    : "#f0f4f8",
  card  : "#ffffff",
  border: "#e2e8f0",
  text  : "#0f172a",
  muted : "#64748b",

  indigo  : "#4f46e5",
  indigoL : "#eef2ff",
  emerald : "#059669",
  emeraldL: "#ecfdf5",
  amber   : "#d97706",
  amberL  : "#fffbeb",
  rose    : "#e11d48",
  roseL   : "#fff1f2",
  cyan    : "#0891b2",
  cyanL   : "#ecfeff",
  violet  : "#7c3aed",
  violetL : "#f5f3ff",
  orange  : "#ea580c",
  orangeL : "#fff7ed",
  teal    : "#0d9488",
  tealL   : "#f0fdfa",

  // KPI gradients
  g1: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  g2: "linear-gradient(135deg,#0891b2,#0d9488)",
  g3: "linear-gradient(135deg,#059669,#16a34a)",
  g4: "linear-gradient(135deg,#d97706,#ea580c)",
  g5: "linear-gradient(135deg,#e11d48,#be185d)",
  g6: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  g7: "linear-gradient(135deg,#0d9488,#0891b2)",
  g8: "linear-gradient(135deg,#ea580c,#d97706)",
};

/* ══════════════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════════════ */ 
const statusDonut = [
  { name:"Approved", value:15, fill:T.emerald  },
  { name:"Pending",  value:8,  fill:T.amber    },
  { name:"Rejected", value:3,  fill:T.rose     }, 
];
 
const recentPRs = [
  { id:"PR-2024-090", dept:"IT",       vendor:"Global Parts",    amount:"₹1,20,000", status:"Pending",  priority:"High",   date:"Apr 09" },
  { id:"PR-2024-089", dept:"Admin",    vendor:"RSK Traders",     amount:"₹48,500",   status:"Approved", priority:"Medium", date:"Apr 09" },
  { id:"PR-2024-091", dept:"Finance",  vendor:"Mehta Supplies",  amount:"₹23,000",   status:"Draft",    priority:"Low",    date:"Apr 08" },
  { id:"PR-2024-088", dept:"Ops",      vendor:"Laxmi Corp",      amount:"₹67,200",   status:"Rejected", priority:"High",   date:"Apr 07" },
  { id:"PR-2024-087", dept:"HR",       vendor:"Raj Enterprises", amount:"₹12,750",   status:"Approved", priority:"Low",    date:"Apr 06" },
  { id:"PR-2024-086", dept:"Purchase", vendor:"Sunrise Tech",    amount:"₹2,34,000", status:"Approved", priority:"High",   date:"Apr 05" },
];

const recentInvoices = [
  { id:"INV-0115", vendor:"RSK Traders",     amount:"₹48,500",   due:"Apr 14", status:"Due Soon" },
  { id:"INV-0114", vendor:"Global Parts",    amount:"₹1,20,000", due:"Apr 18", status:"Unpaid"   },
  { id:"INV-0113", vendor:"Mehta Supplies",  amount:"₹23,000",   due:"Apr 10", status:"Overdue"  },
  { id:"INV-0112", vendor:"Raj Enterprises", amount:"₹12,750",   due:"Apr 05", status:"Paid"     },
  { id:"INV-0111", vendor:"Laxmi Corp",      amount:"₹67,200",   due:"Apr 02", status:"Paid"     },
];


/* ══════════════════════════════════════════════════════════════
   SMALL HELPERS
══════════════════════════════════════════════════════════════ */
const AnimCounter = ({ target, prefix="", suffix="" }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0;
    const s = Math.max(1, Math.ceil(target / 55));
    const t = setInterval(() => { n += s; if (n >= target) { setV(target); clearInterval(t); } else setV(n); }, 22);
    return () => clearInterval(t);
  }, [target]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"12px 18px", minWidth:150 }}>
      <p style={{ color:"#94a3b8", fontWeight:800, fontSize:12, marginBottom:8 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:"#fff", fontSize:12, margin:"3px 0" }}>
          <span style={{ color:p.color, marginRight:6 }}>●</span>
          {p.name}: <strong>{typeof p.value === "number" && p.value>999 ? `₹${p.value.toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const Badge = ({ label, color, bg }) => (
  <span style={{ background:bg||`${color}18`, color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>
    {label}
  </span>
);

const statusMap = {
  Approved : { color:T.emerald,  bg:T.emeraldL },
  Pending  : { color:T.amber,    bg:T.amberL   },
  Rejected : { color:T.rose,     bg:T.roseL    },
  Draft    : { color:T.muted,    bg:"#f1f5f9"  },
  Paid     : { color:T.emerald,  bg:T.emeraldL },
  Unpaid   : { color:T.cyan,     bg:T.cyanL    },
  "Due Soon" :{ color:T.amber,   bg:T.amberL   },
  Overdue  : { color:T.rose,     bg:T.roseL    },
};

const priorityMap = {
  High   : { color:T.rose,    bg:T.roseL   },
  Medium : { color:T.amber,   bg:T.amberL  },
  Low    : { color:T.emerald, bg:T.emeraldL},
  Critical: { color:T.rose,    bg:T.roseL   },
  Urgent:  { color:T.orange,  bg:T.orangeL },
  Normal:  { color:T.emerald, bg:T.emeraldL},
};

/* ══════════════════════════════════════════════════════════════
   CARD WRAPPER
══════════════════════════════════════════════════════════════ */
const Card = ({ children, style={} }) => (
  <div style={{
    background:T.card, borderRadius:20, border:`1px solid ${T.border}`,
    boxShadow:"0 2px 16px rgba(0,0,0,0.06)", padding:"28px 28px",
    ...style
  }}>
    {children}
  </div>
);

const CardTitle = ({ title, sub }) => (
  <div style={{ marginBottom:22 }}>
    <h2 style={{ color:T.text, fontSize:18, fontWeight:800, margin:0 }}>{title}</h2>
    {sub && <p style={{ color:T.muted, fontSize:13, fontWeight:500, marginTop:3 }}>{sub}</p>}
  </div>
);

const SectionLabel = ({ text }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, margin:"32px 0 16px" }}>
    <div style={{ flex:1, height:1, background:T.border }} />
    <span style={{ color:T.muted, fontSize:11, fontWeight:800, letterSpacing:2, textTransform:"uppercase", whiteSpace:"nowrap" }}>{text}</span>
    <div style={{ flex:1, height:1, background:T.border }} />
  </div>
);

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    DashboardCards: null,
    PRStatus: null,
    GRNStatus: null,
    LatestPR: [],
    LatestInvoice: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/i_pi_get_dashboard_card_chart_count");
        if (res.data?.Status === 1) {
          setDashboardData({
            DashboardCards: res.data.Result.DashboardCards?.[0] || null,
            PRStatus: res.data.Result.PRStatus?.[0] || null,
            GRNStatus: res.data.Result.GRNStatus?.[0] || null,
            LatestPR: res.data.Result.LatestPR || [],
            LatestInvoice: res.data.Result.LatestInvoice || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchDashboardData();
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" });
  const dateStr = now.toLocaleDateString("en-IN",{ weekday:"long", month:"long", day:"numeric", year:"numeric" });

  const kpis = [
    { title:"Purchase Requisitions", value: dashboardData.DashboardCards?.TotalRequisition || 0,  sub:"+12% this month",    icon:FaClipboardList, grad:T.g1, link:"/Purchase_Requisition_list" },
    { title:"Purchase Orders",       value: dashboardData.DashboardCards?.TotalOrder || 0,        sub:"8 POs in progress",  icon:FaShoppingCart,  grad:T.g2, link:"/Purchase_Order_list"       },
    { title:"Active Vendors",        value: dashboardData.DashboardCards?.TotalVendor || 0,       sub:"3 new this quarter", icon:FaTruck,         grad:T.g3, link:"/Vendor_Customer_list"     },
    { title:"Open Invoices",         value: dashboardData.DashboardCards?.TotalInvoice || 0,      sub:"₹3.2L pending",      icon:FaFileInvoice,   grad:T.g4, link:"/Purchase_Invoice_list"     },
    { title:"Catalog Items",         value: dashboardData.DashboardCards?.TotalItem || 0,         sub:"5 added this week",  icon:FaBoxOpen,       grad:T.g5, link:"/Item_Master_list"         },
    { title:"System Users",          value: dashboardData.DashboardCards?.TotalUser || 0,         sub:"All roles active",   icon:FaUsers,         grad:T.g6, link:"/User_list"                },
    { title:"Leave Requests",        value: dashboardData.DashboardCards?.PendingLeave || 0,      sub:"4 pending approval", icon:FaCalendarAlt,   grad:T.g7, link:"/Leave_Request_list"        },
    { title:"Total Entities",        value: dashboardData.DashboardCards?.TotalEntity || 0,       sub:"2 added this FY",    icon:FaBuilding,      grad:T.g8, link:"/Entity_list"               },
  ];

  const prDonut = [
    { name:"Approved", value: dashboardData.PRStatus?.Approved || 0, fill:T.emerald  },
    { name:"Pending",  value: dashboardData.PRStatus?.Pending || 0,  fill:T.amber    },
    { name:"Rejected", value: dashboardData.PRStatus?.Rejected || 0, fill:T.rose     }, 
  ];

  const grnDonut = [
    { name:"Approved", value: dashboardData.GRNStatus?.Approved || 0, fill:T.emerald  },
    { name:"Pending",  value: dashboardData.GRNStatus?.Pending || 0,  fill:T.amber    },
    { name:"Rejected", value: dashboardData.GRNStatus?.Rejected || 0, fill:T.rose     }, 
  ];

  const totalPR = (dashboardData.PRStatus?.Approved || 0) + (dashboardData.PRStatus?.Pending || 0) + (dashboardData.PRStatus?.Rejected || 0);
  const totalGRN = (dashboardData.GRNStatus?.Approved || 0) + (dashboardData.GRNStatus?.Pending || 0) + (dashboardData.GRNStatus?.Rejected || 0);
 

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto custom-scrollbar-sidebar" style={{ background:T.bg }}>
          <div style={{ maxWidth:1700, margin:"0 auto", padding:"28px 32px 56px" }}>

            {/* ══ HERO ══════════════════════════════════════════════ */}
            <div style={{
              background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4338ca 70%,#6d28d9 100%)",
              borderRadius:24, padding:"44px 52px", marginBottom:28,
              position:"relative", overflow:"hidden",
              boxShadow:"0 24px 64px rgba(79,70,229,0.35)",
            }}>
              {/* decorative orbs */}
              {[["-60px","-60px",240,0.12],["40px","10px",120,0.08],["right:-80px","top:-80px",320,0.1],["right:30px","top:40px",160,0.07]].map((b,i)=>(
                <div key={i} style={{ position:"absolute", left:typeof b[0]==="string"&&b[0].startsWith("r")?"auto":b[0], right:typeof b[0]==="string"&&b[0].startsWith("r")?b[0].split(":")[1]:"auto", top:typeof b[1]==="string"&&b[1].startsWith("t")?b[1].split(":")[1]:b[1], width:b[2], height:b[2], borderRadius:"50%", background:`rgba(255,255,255,${b[3]})`, pointerEvents:"none" }}/>
              ))}

              <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:28 }}>
                <div>
                  <span style={{ fontSize:12, fontWeight:800, letterSpacing:3, color:"#a5b4fc", textTransform:"uppercase" }}>{dateStr}</span>
                  <h1 style={{ color:"#fff", fontSize:42, fontWeight:900, lineHeight:1.15, margin:"10px 0 12px" }}>Dashboard  </h1>
                  <p style={{ color:"#c7d2fe", fontSize:16, fontWeight:500, maxWidth:480 }}>
                    Welcome back to <strong style={{ color:"#fff" }}>Patel Industries ERP</strong>. Here's your live operations summary.
                  </p>
                  {/* <div style={{ display:"flex", gap:36, marginTop:28 }}>
                    {[["₹4,34,000","Spend MTD"],["26","Active PRs"],["18","Open POs"],["₹3.2L","Pending Invoices"]].map(([v,l],i)=>(
                      <div key={i} style={{ borderLeft:"2px solid rgba(165,180,252,0.4)", paddingLeft:14 }}>
                        <p style={{ color:"#fff", fontSize:22, fontWeight:900, margin:0 }}>{v}</p>
                        <p style={{ color:"#a5b4fc", fontSize:11, fontWeight:700, letterSpacing:1, margin:"2px 0 0" }}>{l}</p>
                      </div>
                    ))}
                  </div> */}
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ color:"#fff", fontSize:68, fontWeight:900, letterSpacing:-2, lineHeight:1, margin:0 }}>{timeStr}</p>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginTop:14, background:"rgba(52,211,153,0.18)", border:"1px solid rgba(52,211,153,0.35)", borderRadius:30, padding:"8px 20px" }}>
                    <span style={{ width:10,height:10,borderRadius:"50%",background:"#34d399",display:"inline-block",animation:"pulse 2s infinite" }}/>
                    <span style={{ color:"#34d399", fontWeight:800, fontSize:13 }}>All Systems Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ══ KPI CARDS ════════════════════════════════════════ */}
            <SectionLabel text="Key Performance Indicators" />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:28 }}>
              {kpis.map((k,i) => {
                const Icon = k.icon;
                return (
                  <div key={i} onClick={() => navigate(k.link)} style={{
                    background:k.grad, borderRadius:20, padding:"26px 26px 22px",
                    cursor:"pointer", position:"relative", overflow:"hidden",
                    boxShadow:"0 8px 28px rgba(0,0,0,0.15)",
                    transition:"transform .2s, box-shadow .2s",
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow="0 18px 40px rgba(0,0,0,0.22)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.15)"; }}
                  >
                    <Icon style={{ position:"absolute", right:-8, bottom:-8, fontSize:88, color:"rgba(255,255,255,0.08)", pointerEvents:"none" }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <p style={{ color:"rgba(255,255,255,0.65)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, margin:0 }}>{k.title}</p>
                      <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:10, padding:"8px 10px" }}>
                        <Icon style={{ color:"#fff", fontSize:17 }}/>
                      </div>
                    </div>
                    <p style={{ color:"#fff", fontSize:46, fontWeight:900, lineHeight:1, margin:"10px 0 12px" }}>
                      <AnimCounter target={k.value}/>
                    </p>
                    <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, margin:0 }}>{k.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* ══ CHART ROW 1: Stacked Bar + Donut ═════════════════ */}
            <SectionLabel text="Transaction Analytics" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22, marginBottom:22 }}>
              <Card>
                <CardTitle title="PR Status" sub="Current period breakdown"/>
                <div style={{ position:"relative", height:230, marginBottom:8 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={prDonut} innerRadius={62} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                        {prDonut.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                      </Pie>
                      <RTooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:10, color:"#fff" }} itemStyle={{ color:"#fff" }}/>
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize:12, fontWeight:700, color:T.muted }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
                    <p style={{ color:T.muted, fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", margin:0 }}>Total</p>
                    <p style={{ color:T.text, fontSize:34, fontWeight:900, lineHeight:1, margin:0 }}>{totalPR}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <CardTitle title="GRN Status" sub="Current period breakdown"/>
                <div style={{ position:"relative", height:230, marginBottom:8 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={grnDonut} innerRadius={62} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                        {grnDonut.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                      </Pie>
                      <RTooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:10, color:"#fff" }} itemStyle={{ color:"#fff" }}/>
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize:12, fontWeight:700, color:T.muted }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
                    <p style={{ color:T.muted, fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", margin:0 }}>Total</p>
                    <p style={{ color:T.text, fontSize:34, fontWeight:900, lineHeight:1, margin:0 }}>{totalGRN}</p>
                  </div>
                </div>
              </Card>
              
            </div>  

            {/* ══ TABLE ROW 1: Recent PRs ═══════════════════════════ */}
            <SectionLabel text="Recent Records" />
            <Card style={{ marginBottom:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <CardTitle title="Recent Purchase Requisitions" sub="Latest 6 PRs — all departments"/>
                <button onClick={()=>navigate("/Purchase_Requisition_list")} style={{
                  display:"flex", alignItems:"center", gap:6,
                  background:T.indigo, color:"#fff", borderRadius:12, padding:"10px 20px",
                  fontWeight:700, fontSize:13, border:"none", cursor:"pointer",
                  transition:"background .15s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.background="#4338ca"}
                  onMouseLeave={e=>e.currentTarget.style.background=T.indigo}
                >
                  View All <FaAngleRight/>
                </button>
              </div>
              <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["PR Number","Department","Vendor","Amount","Priority","Status","Date"].map((h,i)=>(
                      <th key={h} style={{ textAlign:"left", padding:"11px 16px", color:T.muted, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8,
                        borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`,
                        borderLeft:i===0?`1px solid ${T.border}`:"none",
                        borderRight:i===6?`1px solid ${T.border}`:"none",
                        borderRadius:i===0?"8px 0 0 8px":i===6?"0 8px 8px 0":"0",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.LatestPR.length > 0 ? dashboardData.LatestPR.slice(0, 6).map((r,i) => {
                    const s = statusMap[r.pr_status]||statusMap.Draft;
                    const p = priorityMap[r.priority_name]||priorityMap.Low;
                    const formattedDate = r.created_date ? new Date(r.created_date).toLocaleDateString("en-IN", { month: "short", day: "2-digit" }) : "-";
                    return (
                      <tr key={i} style={{ borderBottom:`1px solid ${T.border}`, transition:"background .12s", cursor:"pointer" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <td style={{ padding:"15px 16px", fontWeight:800, color:T.indigo, fontSize:14 }}>{r.pr_number}</td>
                        <td style={{ padding:"15px 16px", color:T.muted, fontSize:13 }}>{r.department_name}</td>
                        <td style={{ padding:"15px 16px", color:T.text, fontWeight:600, fontSize:13 }}>{r.requested_by_name || "-"}</td>
                        <td style={{ padding:"15px 16px", color:T.text, fontWeight:700, fontSize:14 }}>-</td>
                        <td style={{ padding:"15px 16px" }}><Badge label={r.priority_name || "Normal"} color={p.color} bg={p.bg}/></td>
                        <td style={{ padding:"15px 16px" }}><Badge label={r.pr_status || "Pending"} color={s.color} bg={s.bg}/></td>
                        <td style={{ padding:"15px 16px", color:T.muted, fontSize:13 }}>{formattedDate}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign:"center", padding:"30px", color:T.muted }}>No recent PRs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>

            {/* ══ TABLE ROW 2: Invoices ═════════════════════════════ */}
            <Card style={{ marginBottom:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <CardTitle title="Recent Invoices" sub="Latest 5 purchase invoices"/>
                <button onClick={()=>navigate("/Purchase_Invoice_list")} style={{
                  display:"flex", alignItems:"center", gap:6,
                  background:T.emerald, color:"#fff", borderRadius:12, padding:"10px 20px",
                  fontWeight:700, fontSize:13, border:"none", cursor:"pointer",
                  transition:"background .15s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.background="#047857"}
                  onMouseLeave={e=>e.currentTarget.style.background=T.emerald}
                >
                  View All <FaAngleRight/>
                </button>
              </div>
              <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["Invoice #","Vendor","Amount","Due Date","Status"].map((h,i)=>(
                      <th key={h} style={{ textAlign:"left", padding:"11px 16px", color:T.muted, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:.8,
                        borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.LatestInvoice.length > 0 ? dashboardData.LatestInvoice.slice(0, 5).map((r,i)=>{
                    const s = statusMap[r.pinv_status]||statusMap.Unpaid;
                    const formattedDate = r.pinv_due_date ? new Date(r.pinv_due_date).toLocaleDateString("en-IN", { month: "short", day: "2-digit" }) : "-";
                    return (
                      <tr key={i} style={{ borderBottom:`1px solid ${T.border}`, transition:"background .12s", cursor:"pointer" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <td style={{ padding:"14px 16px", fontWeight:800, color:T.emerald, fontSize:14 }}>{r.pinv_number}</td>
                        <td style={{ padding:"14px 16px", color:T.text,  fontWeight:600, fontSize:13 }}>{r.vendor_name}</td>
                        <td style={{ padding:"14px 16px", color:T.text,  fontWeight:700, fontSize:14 }}>-</td>
                        <td style={{ padding:"14px 16px", color:T.muted, fontSize:13 }}>{formattedDate}</td>
                        <td style={{ padding:"14px 16px" }}><Badge label={r.pinv_status || "Unpaid"} color={s.color} bg={s.bg}/></td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign:"center", padding:"30px", color:T.muted }}>No recent invoices found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card> 
          </div>
        </div> 
        <Footer/>
      </main> 
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
};

export default Dashboard;
