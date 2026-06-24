import { useState, useRef, useEffect } from "react";

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#F5F5F5", card:"#FFFFFF", border:"#D0D0D0",
  headerBg:"#2D3748", headerText:"#FFFFFF",
  monthBg:"#1A202C", weekBg:"#2D3748",
  orange:"#E8720C", peach:"#F9B572", green:"#276749",
  greenBg:"#C6F6D5", red:"#C53030", redBg:"#FED7D7",
  blue:"#2B6CB0", blueBg:"#BEE3F8",
  yellow:"#B7791F", yellowBg:"#FEFCBF",
  purple:"#553C9A", purpleBg:"#E9D8FD",
  pink:"#97266D", pinkBg:"#FED7E2",
  dark:"#1A202C", mid:"#4A5568", light:"#A0AEC0",
  rowAlt:"#F7FAFC", rowHover:"#EBF8FF",
  colShade:"#EDF2F7", colShade2:"#FFFFFF",
  gridLine:"#E2E8F0",
};

const PHASE_COLORS = {
  "3. PRODUCT DEVELOPMENT": { bar:"#E8720C", bg:"#FFF3EB", header:"#C05621", light:"#FEEBC8" },
  "4. LABEL DEVELOPMENT":   { bar:"#553C9A", bg:"#F5F0FF", header:"#44337A", light:"#E9D8FD" },
  "5. MARKETING":           { bar:"#97266D", bg:"#FFF0F7", header:"#702459", light:"#FED7E2" },
  "5. QUALIFY":             { bar:"#B7791F", bg:"#FFFFF0", header:"#975A16", light:"#FEFCBF" },
  "6. LAUNCH":              { bar:"#C53030", bg:"#FFF5F5", header:"#9B2C2C", light:"#FED7D7" },
};

const STATUS_CONFIG = {
  "Not Started": { color:"#718096", bg:"#EDF2F7", dot:"#A0AEC0" },
  "In Progress": { color:"#2B6CB0", bg:"#BEE3F8", dot:"#3182CE" },
  "Complete":    { color:"#276749", bg:"#C6F6D5", dot:"#38A169" },
  "Blocked":     { color:"#C53030", bg:"#FED7D7", dot:"#E53E3E" },
};

// ── Timeline: weekly columns from May 18 2026 to Oct 23 2026 ─────────────────
function getWeeks() {
  const weeks = [];
  const start = new Date("2026-05-18"); // Monday
  const end   = new Date("2026-10-23");
  const cur = new Date(start);
  while (cur <= end) {
    const friday = new Date(cur);
    friday.setDate(friday.getDate() + 4);
    weeks.push({
      monday: new Date(cur),
      friday: new Date(friday),
      label: friday.toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      monthKey: `${friday.getFullYear()}-${friday.getMonth()}`,
      monthLabel: friday.toLocaleDateString("en-US",{month:"long",year:"numeric"}),
      monthNum: friday.getMonth(),
    });
    cur.setDate(cur.getDate()+7);
  }
  return weeks;
}

const WEEKS = getWeeks();
const WEEK_W = 36; // px per week column
const COL_W  = 200; // fixed left columns total width split below
const TODAY  = new Date("2026-06-24");

// Group weeks by month for the month header row
function getMonthGroups() {
  const groups = [];
  let cur = null;
  WEEKS.forEach((w,i) => {
    if (!cur || cur.key !== w.monthKey) {
      cur = { key: w.monthKey, label: w.friday.toLocaleDateString("en-US",{month:"long"}), start:i, count:0 };
      groups.push(cur);
    }
    cur.count++;
  });
  return groups;
}
const MONTH_GROUPS = getMonthGroups();

// Which week index does a date fall in?
function dateToWeekIdx(dateStr) {
  if (!dateStr) return -1;
  const d = new Date(dateStr);
  for (let i = 0; i < WEEKS.length; i++) {
    if (d <= WEEKS[i].friday) return i;
  }
  return WEEKS.length - 1;
}

function subWeeks(dateStr, weeks) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() - weeks * 7);
  return d.toISOString().slice(0,10);
}
function addWeeks(dateStr, weeks) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0,10);
}
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
}
function fmtISO(d) { return d ? new Date(d).toISOString().slice(0,10) : null; }

const TODAY_WEEK = dateToWeekIdx(fmtISO(TODAY));

// ── Task data ─────────────────────────────────────────────────────────────────
const PHASES = [
  { name:"3. PRODUCT DEVELOPMENT", tasks:[
    {id:"t8",  name:"Source Samples",                    owner:"Sheena", due:"2026-05-29", actualEnd:"2026-05-29", dur:1, status:"Complete",   notes:""},
    {id:"t9",  name:"Formulation Development",           owner:"Sheena", due:"2026-06-12", actualEnd:"2026-06-12", dur:3, status:"Complete",   notes:""},
    {id:"t10", name:"Taste Test — Internal",             owner:"Sheena", due:"2026-06-15", actualEnd:"2026-06-15", dur:1, status:"Complete",   notes:""},
    {id:"t11", name:"Finalize Product Format & Size",    owner:"Sheena", due:"2026-06-19", actualEnd:"2026-06-19", dur:1, status:"Complete",   notes:""},
    {id:"t12", name:"Case Pack / Carton Specs",          owner:"Sheena", due:"2026-06-19", actualEnd:"2026-06-19", dur:1, status:"Complete",   notes:""},
    {id:"t13", name:"Request Pricing & Finalize Suppliers", owner:"Sheena", due:"2026-07-10", actualEnd:null, dur:2, status:"In Progress", notes:"Waiting on suppliers"},
    {id:"t14", name:"Finalize Formulation, NFT & Serving",  owner:"Sheena", due:"2026-07-10", actualEnd:null, dur:2, status:"In Progress", notes:""},
    {id:"t15", name:"Apply for NHP Licence",             owner:"Sheena", due:"2026-07-10", actualEnd:null, dur:2, status:"Not Started",  notes:""},
    {id:"t16", name:"NFT Creation with lab",             owner:"Sheena", due:"2026-07-10", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t17", name:"Confirm COA & Spec Sheet",          owner:"QA", due:"2026-07-10", actualEnd:null, dur:2, status:"Not Started",  notes:""},
    {id:"t18", name:"Validate Manufacturing (Supplier Approval)", owner:"QA", due:"2026-07-10", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t19", name:"Populate RM Item Add Form",         owner:"Ellie",  due:"2026-07-17", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t20", name:"Populate FG Item Add Form",         owner:"Sheena", due:"2026-07-17", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t21", name:"Create Item Codes, UPCs, BOM → Sage", owner:"Ellie", due:"2026-07-17", actualEnd:null, dur:1, status:"Not Started", notes:""},
    {id:"t22", name:"Pricing in Sage",                   owner:"Errol",  due:"2026-07-17", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t23", name:"Create FG Spec Sheet",              owner:"Sheena", due:"2026-07-24", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t24", name:"Input Sales Forecast in Sage",      owner:"Sales",  due:"2026-07-24", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t25", name:"Place Raw Material PO",             owner:"Ellie",  due:"2026-07-24", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t26", name:"Packaging Material PO Confirmed",   owner:"Nathan", due:"2026-08-07", actualEnd:null, dur:2, status:"Not Started",  notes:""},
    {id:"t27", name:"Schedule FG Production / Copacker", owner:"Ellie",  due:"2026-08-28", actualEnd:null, dur:2, status:"Not Started",  notes:"1 month before FG prod"},
    {id:"t28", name:"Raw Material Arrival",              owner:"Ellie",  due:"2026-08-28", actualEnd:null, dur:5, status:"Not Started",  notes:"~5 wk lead"},
    {id:"t29", name:"Sample / Pre-production Run",       owner:"Nathan", due:"2026-09-11", actualEnd:null, dur:2, status:"Not Started",  notes:""},
    {id:"t30", name:"Shelf Life & Stability Testing",    owner:"Sheena", due:"2026-09-04", actualEnd:null, dur:1, status:"Not Started",  notes:"Accelerated — parallel"},
    {id:"t31", name:"Blend Production",                  owner:"Nathan", due:"2026-09-11", actualEnd:null, dur:1, status:"Not Started",  notes:""},
    {id:"t32", name:"FG Production",                     owner:"Ellie", due:"2026-09-25", actualEnd:null, dur:2, status:"Not Started",  notes:""},
    {id:"t33", name:"FG Delivery to OT",                 owner:"Ellie", due:"2026-10-09", actualEnd:null, dur:2, status:"Not Started",  notes:""},
  ]},
  { name:"4. LABEL DEVELOPMENT", tasks:[
    {id:"t34", name:"Artwork Brief, Dieline & Copy Deck",    owner:"Kaila",  due:"2026-06-26", actualEnd:"2026-06-26", dur:1, status:"Complete",   notes:""},
    {id:"t35", name:"Packaging Design (sachet, pouch, box)", owner:"Mia",    due:"2026-07-25", actualEnd:"2026-07-25", dur:4, status:"Complete",   notes:""},
    {id:"t36", name:"Artwork Development & Review",          owner:"Mia",    due:"2026-07-10", actualEnd:null,         dur:2, status:"In Progress", notes:""},
    {id:"t37", name:"Send EN Copy for French Translation",   owner:"Sheena",  due:"2026-07-17", actualEnd:null,         dur:1, status:"Not Started", notes:""},
    {id:"t38", name:"Send Artwork for Organic & Kosher",     owner:"QA",  due:"2026-07-17", actualEnd:null,         dur:1, status:"Not Started", notes:"3-4 wk cert turnaround"},
    {id:"t39", name:"Final Artwork Review & Checklist",      owner:"Sheena", due:"2026-07-31", actualEnd:null,         dur:2, status:"Not Started", notes:""},
    {id:"t40", name:"Place Bag PO & Send to Printer",        owner:"Nathan", due:"2026-08-07", actualEnd:null,         dur:1, status:"Not Started", notes:""},
    {id:"t41", name:"Create 3D Renders",                     owner:"Mia",    due:"2026-08-07", actualEnd:null,         dur:2, status:"Not Started", notes:""},
    {id:"t42", name:"Upload Flats & Renders to Brand Portal",owner:"Mia",    due:"2026-08-07", actualEnd:null,         dur:1, status:"Not Started", notes:""},
    {id:"t43", name:"Print Proof Review & Approval",         owner:"Sheena", due:"2026-08-14", actualEnd:null,         dur:1, status:"Not Started", notes:""},
    {id:"t44", name:"Receive Bags",                          owner:"Nathan", due:"2026-09-11", actualEnd:null,         dur:5, status:"Not Started", notes:"5 wk print lead"},
    {id:"t45", name:"Printed Bag Artwork Check",             owner:"Sheena", due:"2026-09-11", actualEnd:null,         dur:1, status:"Not Started", notes:""},
  ]},
  { name:"5. MARKETING", tasks:[
    {id:"t46", name:"Complete Innovation Spec Sheet", owner:"Sheena", due:"2026-07-24", actualEnd:null, dur:1, status:"Not Started", notes:"Needs UPCs + pricing"},
    {id:"t47", name:"Shopify Listings",               owner:"Joseph", due:"2026-09-18", actualEnd:null, dur:3, status:"Not Started", notes:""},
    {id:"t48", name:"Amazon Listings",                owner:"Iulia",  due:"2026-09-18", actualEnd:null, dur:3, status:"Not Started", notes:""},
    {id:"t49", name:"Listing Samples",                owner:"Sheena", due:"2026-10-09", actualEnd:null, dur:1, status:"Not Started", notes:"From production run"},
    {id:"t50", name:"Social Marketing",               owner:"Dasha",  due:"2026-10-02", actualEnd:null, dur:4, status:"Not Started", notes:""},
    {id:"t51", name:"Digital Marketing",              owner:"Kaila",  due:"2026-10-02", actualEnd:null, dur:4, status:"Not Started", notes:""},
    {id:"t52", name:"Shopper Marketing",              owner:"Kaila",  due:"2026-10-02", actualEnd:null, dur:4, status:"Not Started", notes:""},
    {id:"t53", name:"Pitch Deck",                     owner:"Sheena", due:"2026-09-25", actualEnd:null, dur:3, status:"Not Started", notes:"Retail Jan 2027"},
    {id:"t54", name:"Sell Sheets",                    owner:"Sheena",  due:"2026-09-25", actualEnd:null, dur:3, status:"Not Started", notes:"Retail Jan 2027"},
  ]},
  { name:"5. QUALIFY", tasks:[
    {id:"t55", name:"First Production Run Review",   owner:"QA", due:"2026-09-25", actualEnd:null, dur:1, status:"Not Started", notes:""},
    {id:"t56", name:"COA on Finished Goods",         owner:"QA",  due:"2026-10-02", actualEnd:null, dur:1, status:"Not Started", notes:""},
    {id:"t57", name:"Lab Tests — Finished Goods",    owner:"QA",  due:"2026-10-02", actualEnd:null, dur:1, status:"Not Started", notes:""},
    {id:"t58", name:"Product Documentation",         owner:"QA",  due:"2026-10-02", actualEnd:null, dur:1, status:"Not Started", notes:""},
    {id:"t59", name:"QA Release / Product Approved", owner:"QA",  due:"2026-10-09", actualEnd:null, dur:1, status:"Not Started", notes:""},
  ]},
  { name:"6. LAUNCH", tasks:[
    {id:"t60", name:"Upload to GS1 & Schedule Shipment", owner:"Iulia",  due:"2026-10-16", actualEnd:null, dur:1, status:"Not Started", notes:""},
    {id:"t61", name:"Coordinate Logistics 3PL / Amazon", owner:"Nathan", due:"2026-10-16", actualEnd:null, dur:1, status:"Not Started", notes:""},
    {id:"t62", name:"Ready to Ship",                     owner:"Nathan", due:"2026-10-09", actualEnd:null, dur:1, status:"Not Started", notes:"", milestone:true},
    {id:"t63", name:"Go Live on Shopify",                owner:"Joseph", due:"2026-10-16", actualEnd:null, dur:0, status:"Not Started", notes:"", milestone:true},
    {id:"t64", name:"Go Live on Amazon",                 owner:"Iulia",  due:"2026-10-16", actualEnd:null, dur:0, status:"Not Started", notes:"", milestone:true},
    {id:"t65", name:"Go Live — Marketing",               owner:"Marketing",  due:"2026-10-16", actualEnd:null, dur:0, status:"Not Started", notes:"", milestone:true},
  ]},
];

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Not Started"];
  return (
    <div style={{position:"relative", display:"inline-block"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{
        display:"flex", alignItems:"center", gap:4,
        padding:"2px 6px", borderRadius:4, fontSize:10, fontWeight:600,
        color:cfg.color, background:cfg.bg, cursor:"pointer", whiteSpace:"nowrap",
        border:`1px solid ${cfg.color}55`,
      }}>
        <div style={{width:6,height:6,borderRadius:"50%",background:cfg.dot,flexShrink:0}}/>
        {status}
      </div>
      {open && (
        <div style={{position:"absolute",top:22,left:0,zIndex:999,background:"white",border:`1px solid ${C.border}`,borderRadius:6,boxShadow:"0 4px 12px #0002",overflow:"hidden",minWidth:110}}>
          {Object.keys(STATUS_CONFIG).map(s=>(
            <div key={s} onClick={()=>{onChange(s);setOpen(false);}} style={{
              padding:"6px 10px",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:6,
              color:STATUS_CONFIG[s].color,fontWeight:600,background:STATUS_CONFIG[s].bg,
            }}>
              <div style={{width:6,height:6,borderRadius:"50%",background:STATUS_CONFIG[s].dot}}/>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DurCell({ dur, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:2,justifyContent:"center"}}>
      <button onClick={()=>onChange(Math.max(0,dur-1))} style={{width:16,height:16,borderRadius:2,border:`1px solid ${C.border}`,background:"white",cursor:"pointer",fontSize:11,color:C.mid,lineHeight:"14px",padding:0}}>−</button>
      <span style={{fontSize:11,fontWeight:700,color:C.dark,minWidth:22,textAlign:"center"}}>{dur===0?"—":`${dur}w`}</span>
      <button onClick={()=>onChange(dur+1)} style={{width:16,height:16,borderRadius:2,border:`1px solid ${C.border}`,background:"white",cursor:"pointer",fontSize:11,color:C.mid,lineHeight:"14px",padding:0}}>+</button>
    </div>
  );
}

function DateCell({ date, onCommit, dimmed }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(date||"");
  function bump(w) { onCommit(addWeeks(date||fmtISO(TODAY),w)); }
  if (editing) return (
    <input autoFocus type="date" value={val}
      onChange={e=>setVal(e.target.value)}
      onBlur={()=>{onCommit(val||null);setEditing(false);}}
      onKeyDown={e=>{if(e.key==="Enter"){onCommit(val||null);setEditing(false);}if(e.key==="Escape")setEditing(false);}}
      style={{fontSize:10,width:90,border:`1px solid ${C.orange}`,borderRadius:3,padding:"1px 3px"}}
    />
  );
  return (
    <div style={{display:"flex",alignItems:"center",gap:1,justifyContent:"center"}}>
      <button onClick={()=>bump(-1)} style={{fontSize:10,background:"none",border:"none",cursor:"pointer",color:C.light,padding:"0 1px",lineHeight:1}}>‹</button>
      <span onClick={()=>{setVal(date||"");setEditing(true);}} style={{
        fontSize:10,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",
        color:dimmed?C.light:C.dark,textDecoration:dimmed?"line-through":"none",
        padding:"1px 2px",borderRadius:2,
        background:editing?"#FFF3E8":"transparent",
      }}>{date?fmt(date):<span style={{color:C.light,fontWeight:400}}>—</span>}</span>
      <button onClick={()=>bump(1)} style={{fontSize:10,background:"none",border:"none",cursor:"pointer",color:C.light,padding:"0 1px",lineHeight:1}}>›</button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [phases, setPhases] = useState(PHASES);
  const [collapsed, setCollapsed] = useState({});
  const [cascadeModal, setCascadeModal] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const scrollRef = useRef(null);

  const allTasks = phases.flatMap(p=>p.tasks);
  const done    = allTasks.filter(t=>t.status==="Complete").length;
  const total   = allTasks.length;
  const inProg  = allTasks.filter(t=>t.status==="In Progress").length;
  const blocked = allTasks.filter(t=>t.status==="Blocked").length;
  const progress = Math.round((done/total)*100);
  const daysToLaunch = Math.ceil((new Date("2026-10-16")-TODAY)/86400000);

  const updateTask = (pi,ti,field,value) => {
    setPhases(prev=>prev.map((ph,p)=>p!==pi?ph:{...ph,tasks:ph.tasks.map((t,i)=>i!==ti?t:{...t,[field]:value})}));
  };
  const handleDurChange = (pi,ti,newDur) => updateTask(pi,ti,"dur",newDur);
  const handleDueChange = (pi,ti,newDue) => {
    setPhases(prev=>{
      const old = prev[pi].tasks[ti].due;
      const delta = newDue&&old?Math.round((new Date(newDue)-new Date(old))/(7*86400000)):0;
      const next = prev.map((ph,p)=>p!==pi?ph:{...ph,tasks:ph.tasks.map((t,i)=>i!==ti?t:{...t,due:newDue})});
      if(delta!==0) setCascadeModal({pi,ti,delta});
      return next;
    });
  };
  const applyCascade = (pi,ti,delta) => {
    setPhases(prev=>{
      let found=false;
      return prev.map((ph,p)=>({...ph,tasks:ph.tasks.map((t,i)=>{
        if(p===pi&&i===ti){found=true;return t;}
        if(!found||t.status==="Complete") return t;
        return {...t,due:addWeeks(t.due,delta)};
      })}));
    });
    setCascadeModal(null);
  };

  const syncToAsana = ()=>{ setSyncing(true); setTimeout(()=>{setSyncing(false);setSyncDone(true);setTimeout(()=>setSyncDone(false),3000);},1800); };

  // Fixed left columns
  const TASK_W = 220;
  const OWN_W  = 72;
  const DUR_W  = 56;
  const DUE_W  = 68;
  const ACT_W  = 64;
  const VAR_W  = 44;
  const STA_W  = 96;
  const LEFT_W = TASK_W+OWN_W+DUR_W+DUE_W+ACT_W+VAR_W+STA_W;
  const GANTT_W = WEEKS.length * WEEK_W;
  const ROW_H = 30;
  const HDR1_H = 24; // month row
  const HDR2_H = 22; // week row

  return (
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",background:C.bg,minHeight:"100vh",padding:"16px 16px 40px",boxSizing:"border-box"}}>

      {/* ── Top bar ── */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:`linear-gradient(135deg,#E8720C,#F9B572)`,borderRadius:10,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🥭</div>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:C.dark,letterSpacing:-0.5}}>Fibre Flow — Peach Mango</div>
            <div style={{fontSize:11,color:C.light}}>Ecomm Launch Oct 16, 2026 · Retail Jan 2027</div>
          </div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {[
            {label:"Complete",    val:`${done}/${total}`, color:C.green},
            {label:"In Progress", val:inProg,             color:C.blue},
            {label:"Blocked",     val:blocked,            color:C.red},
            {label:"Days to Launch",val:daysToLaunch,     color:C.orange},
          ].map(s=>(
            <div key={s.label} style={{background:"white",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",textAlign:"center",minWidth:80}}>
              <div style={{fontSize:18,fontWeight:800,color:s.color,letterSpacing:-0.5}}>{s.val}</div>
              <div style={{fontSize:9,color:C.mid,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4}}>{s.label}</div>
            </div>
          ))}
          <button onClick={syncToAsana} disabled={syncing} style={{
            padding:"7px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
            background:syncDone?"#38A169":C.orange,color:"white",whiteSpace:"nowrap",
          }}>{syncing?"Syncing…":syncDone?"✓ Synced":"Sync to Asana"}</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:11,fontWeight:600,color:C.dark,whiteSpace:"nowrap"}}>Overall Progress</span>
        <div style={{flex:1,background:C.gridLine,borderRadius:99,height:8,overflow:"hidden"}}>
          <div style={{width:`${progress}%`,height:"100%",background:`linear-gradient(90deg,${C.orange},#F9B572)`,borderRadius:99,transition:"width 0.4s"}}/>
        </div>
        <span style={{fontSize:12,fontWeight:800,color:C.orange,minWidth:36}}>{progress}%</span>
      </div>

      {/* ── Main Gantt table ── */}
      <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px #0001"}}>
        <div style={{overflowX:"auto",overflowY:"auto",maxHeight:"calc(100vh - 200px)"}} ref={scrollRef}>
          <div style={{minWidth:LEFT_W+GANTT_W}}>

            {/* ── Sticky header ── */}
            <div style={{position:"sticky",top:0,zIndex:20,background:C.headerBg}}>

              {/* Row 1: column labels + month names */}
              <div style={{display:"flex",borderBottom:`1px solid #4A5568`}}>
                {/* Fixed col headers */}
                <div style={{width:TASK_W,minWidth:TASK_W,height:HDR1_H,display:"flex",alignItems:"center",paddingLeft:12,fontSize:10,fontWeight:700,color:"#CBD5E0",textTransform:"uppercase",letterSpacing:0.6,borderRight:`1px solid #4A5568`,flexShrink:0}}>Task</div>
                <div style={{width:OWN_W, minWidth:OWN_W, height:HDR1_H,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#CBD5E0",textTransform:"uppercase",letterSpacing:0.5,borderRight:`1px solid #4A5568`,flexShrink:0}}>Owner</div>
                <div style={{width:DUR_W, minWidth:DUR_W, height:HDR1_H,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#CBD5E0",textTransform:"uppercase",letterSpacing:0.5,borderRight:`1px solid #4A5568`,flexShrink:0}}>Dur.</div>
                <div style={{width:DUE_W, minWidth:DUE_W, height:HDR1_H,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#CBD5E0",textTransform:"uppercase",letterSpacing:0.5,borderRight:`1px solid #4A5568`,flexShrink:0}}>Due</div>
                <div style={{width:ACT_W, minWidth:ACT_W, height:HDR1_H,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#CBD5E0",textTransform:"uppercase",letterSpacing:0.5,borderRight:`1px solid #4A5568`,flexShrink:0}}>Actual</div>
                <div style={{width:VAR_W, minWidth:VAR_W, height:HDR1_H,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#CBD5E0",textTransform:"uppercase",letterSpacing:0.5,borderRight:`1px solid #4A5568`,flexShrink:0}}>Var.</div>
                <div style={{width:STA_W, minWidth:STA_W, height:HDR1_H,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#CBD5E0",textTransform:"uppercase",letterSpacing:0.5,borderRight:`2px solid #718096`,flexShrink:0}}>Status</div>
                {/* Month headers */}
                {MONTH_GROUPS.map(mg=>(
                  <div key={mg.key} style={{
                    width:mg.count*WEEK_W, minWidth:mg.count*WEEK_W, height:HDR1_H,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:800,color:"white",
                    borderRight:`1px solid #4A5568`,
                    background: mg.label==="October"?"#C53030":mg.label==="September"?"#2C7A7B":mg.label==="August"?"#2B6CB0":mg.label==="July"?"#553C9A":mg.label==="June"?"#276749":"#2D3748",
                    letterSpacing:0.3, flexShrink:0,
                  }}>{mg.label}</div>
                ))}
              </div>

              {/* Row 2: week dates */}
              <div style={{display:"flex",borderBottom:`2px solid #718096`}}>
                {/* Spacer for fixed cols */}
                <div style={{width:LEFT_W,minWidth:LEFT_W,height:HDR2_H,borderRight:`2px solid #718096`,flexShrink:0}}/>
                {/* Week columns */}
                {WEEKS.map((w,i)=>{
                  const isToday = i===TODAY_WEEK;
                  const isEven = i%2===0;
                  return (
                    <div key={i} style={{
                      width:WEEK_W,minWidth:WEEK_W,height:HDR2_H,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:9,fontWeight:isToday?800:600,
                      color:isToday?"#F6E05E":"#CBD5E0",
                      borderRight:`1px solid #4A5568`,
                      background:isToday?"#744210":isEven?"#2D3748":"#374151",
                      flexShrink:0, whiteSpace:"nowrap", letterSpacing:0.2,
                    }}>
                      {isToday?"▼ NOW":w.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Phase sections ── */}
            {phases.map((phase,pi)=>{
              const pc = PHASE_COLORS[phase.name]||{bar:C.orange,bg:"#FFF",header:"#333",light:"#EEE"};
              const isCollapsed = collapsed[phase.name];
              const pDone = phase.tasks.filter(t=>t.status==="Complete").length;

              return (
                <div key={phase.name}>
                  {/* Phase header row */}
                  <div onClick={()=>setCollapsed(c=>({...c,[phase.name]:!c[phase.name]}))}
                    style={{display:"flex",cursor:"pointer",background:pc.light,borderBottom:`1px solid ${pc.bar}44`,userSelect:"none",minHeight:28}}>
                    <div style={{width:LEFT_W,minWidth:LEFT_W,display:"flex",alignItems:"center",paddingLeft:10,gap:6,borderRight:`2px solid ${pc.bar}66`,flexShrink:0}}>
                      <div style={{width:10,height:10,borderRadius:2,background:pc.bar,flexShrink:0}}/>
                      <span style={{fontSize:11,fontWeight:800,color:pc.header,letterSpacing:0.2}}>{phase.name}</span>
                      <span style={{fontSize:10,color:pc.bar,fontWeight:600,marginLeft:4}}>{pDone}/{phase.tasks.length}</span>
                      <span style={{fontSize:10,color:pc.bar,marginLeft:"auto",paddingRight:8}}>{isCollapsed?"▶":"▼"}</span>
                    </div>
                    {/* Phase bar spanning all weeks */}
                    {WEEKS.map((_,i)=>(
                      <div key={i} style={{width:WEEK_W,minWidth:WEEK_W,height:28,background:i%2===0?`${pc.bar}08`:`${pc.bar}04`,borderRight:`1px solid ${C.gridLine}`,flexShrink:0}}/>
                    ))}
                  </div>

                  {/* Task rows */}
                  {!isCollapsed && phase.tasks.map((task,ti)=>{
                    const dueWk    = dateToWeekIdx(task.due);
                    const startWk  = task.due ? Math.max(0, dueWk - task.dur + 1) : -1;
                    const actEndWk = dateToWeekIdx(task.actualEnd);
                    const actStartWk = task.actualEnd ? Math.max(0, actEndWk - task.dur + 1) : -1;

                    const varDays = task.actualEnd&&task.due ? Math.round((new Date(task.actualEnd)-new Date(task.due))/86400000) : null;
                    const varLabel = varDays===null?"—":varDays===0?"✓":varDays>0?`+${Math.round(varDays/7)}w`:`${Math.round(varDays/7)}w`;
                    const varColor = varDays===null?C.light:varDays<=0?C.green:C.red;
                    const isDone = task.status==="Complete";

                    return (
                      <div key={task.id} style={{display:"flex",alignItems:"center",minHeight:ROW_H,borderBottom:`1px solid ${C.gridLine}`,background:ti%2===0?"white":C.rowAlt}}>
                        {/* Task name */}
                        <div style={{width:TASK_W,minWidth:TASK_W,height:ROW_H,display:"flex",alignItems:"center",paddingLeft:20,paddingRight:6,borderRight:`1px solid ${C.gridLine}`,flexShrink:0}}>
                          <span style={{fontSize:11,color:isDone?C.light:C.dark,textDecoration:isDone?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontWeight:task.milestone?700:400}}>
                            {task.milestone?"⬦ ":""}{task.name}
                          </span>
                        </div>
                        {/* Owner */}
                        <div style={{width:OWN_W,minWidth:OWN_W,height:ROW_H,display:"flex",alignItems:"center",justifyContent:"center",borderRight:`1px solid ${C.gridLine}`,flexShrink:0}}>
                          <span style={{fontSize:10,color:C.mid,fontWeight:500,whiteSpace:"nowrap"}}>{task.owner}</span>
                        </div>
                        {/* Dur */}
                        <div style={{width:DUR_W,minWidth:DUR_W,height:ROW_H,display:"flex",alignItems:"center",justifyContent:"center",borderRight:`1px solid ${C.gridLine}`,flexShrink:0}}>
                          <DurCell dur={task.dur} onChange={v=>handleDurChange(pi,ti,v)}/>
                        </div>
                        {/* Due */}
                        <div style={{width:DUE_W,minWidth:DUE_W,height:ROW_H,display:"flex",alignItems:"center",justifyContent:"center",borderRight:`1px solid ${C.gridLine}`,flexShrink:0}}>
                          <DateCell date={task.due} onCommit={v=>handleDueChange(pi,ti,v)} dimmed={isDone}/>
                        </div>
                        {/* Actual */}
                        <div style={{width:ACT_W,minWidth:ACT_W,height:ROW_H,display:"flex",alignItems:"center",justifyContent:"center",borderRight:`1px solid ${C.gridLine}`,flexShrink:0}}>
                          <DateCell date={task.actualEnd} onCommit={v=>updateTask(pi,ti,"actualEnd",v)} dimmed={false}/>
                        </div>
                        {/* Var */}
                        <div style={{width:VAR_W,minWidth:VAR_W,height:ROW_H,display:"flex",alignItems:"center",justifyContent:"center",borderRight:`1px solid ${C.gridLine}`,flexShrink:0}}>
                          <span style={{fontSize:10,fontWeight:700,color:varColor}}>{varLabel}</span>
                        </div>
                        {/* Status */}
                        <div style={{width:STA_W,minWidth:STA_W,height:ROW_H,display:"flex",alignItems:"center",justifyContent:"center",borderRight:`2px solid ${C.border}`,flexShrink:0}}>
                          <StatusBadge status={task.status} onChange={v=>updateTask(pi,ti,"status",v)}/>
                        </div>

                        {/* ── Gantt week cells ── */}
                        {WEEKS.map((_,wi)=>{
                          const isEven    = wi%2===0;
                          const isTodayWk = wi===TODAY_WEEK;
                          const inPlanned = startWk>=0 && wi>=startWk && wi<=dueWk;
                          const inActual  = actStartWk>=0 && wi>=actStartWk && wi<=actEndWk;
                          const isDueWk   = wi===dueWk && task.due;
                          const isLaunchWk = wi===dateToWeekIdx("2026-10-16");

                          let cellBg = isEven?"white":C.colShade;
                          if (isTodayWk) cellBg = "#FFFBEB";
                          if (isLaunchWk) cellBg = "#FFF5F5";

                          let barBg = null;
                          if (task.milestone && isDueWk) barBg = "milestone";
                          else if (inActual && isDone) barBg = "actual";
                          else if (inPlanned) barBg = "planned";

                          return (
                            <div key={wi} style={{
                              width:WEEK_W,minWidth:WEEK_W,height:ROW_H,
                              position:"relative",
                              background:cellBg,
                              borderRight:`1px solid ${isTodayWk?"#F6AD55":C.gridLine}`,
                              flexShrink:0,
                              boxSizing:"border-box",
                            }}>
                              {/* Today column highlight */}
                              {isTodayWk && <div style={{position:"absolute",inset:0,borderLeft:`2px solid #F6AD55`,borderRight:`2px solid #F6AD55`,pointerEvents:"none",zIndex:1}}/>}

                              {/* Planned bar */}
                              {barBg==="planned" && !task.milestone && (
                                <div style={{
                                  position:"absolute",
                                  left: wi===startWk?4:0,
                                  right: isDueWk?4:0,
                                  top:7, height:16,
                                  background: isDone?`${pc.bar}55`:`${pc.bar}CC`,
                                  borderRadius: wi===startWk&&isDueWk?4:wi===startWk?"4px 0 0 4px":isDueWk?"0 4px 4px 0":0,
                                  zIndex:2,
                                }}/>
                              )}

                              {/* Actual bar overlay */}
                              {barBg==="actual" && !task.milestone && (
                                <div style={{
                                  position:"absolute",
                                  left: wi===actStartWk?4:0,
                                  right: wi===actEndWk?4:0,
                                  top:10, height:10,
                                  background:`${pc.bar}FF`,
                                  borderRadius: wi===actStartWk&&wi===actEndWk?3:wi===actStartWk?"3px 0 0 3px":wi===actEndWk?"0 3px 3px 0":0,
                                  zIndex:3,
                                }}/>
                              )}

                              {/* Milestone diamond */}
                              {barBg==="milestone" && (
                                <div style={{
                                  position:"absolute",
                                  left:"50%",top:"50%",
                                  width:12,height:12,
                                  background:pc.bar,
                                  transform:"translate(-50%,-50%) rotate(45deg)",
                                  borderRadius:2,zIndex:4,
                                }}/>
                              )}

                              {/* Due date right-edge tick */}
                              {isDueWk && !task.milestone && (
                                <div style={{position:"absolute",right:0,top:5,bottom:5,width:3,background:pc.bar,borderRadius:"2px 0 0 2px",zIndex:5}}/>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Legend row */}
            <div style={{display:"flex",alignItems:"center",gap:16,padding:"8px 14px",background:"#F7FAFC",borderTop:`1px solid ${C.border}`,flexWrap:"wrap"}}>
              {[
                {label:"Planned bar",  el:<div style={{width:28,height:12,borderRadius:3,background:`${C.orange}CC`}}/>},
                {label:"Completed",    el:<div style={{width:28,height:12,borderRadius:3,background:`${C.orange}55`}}/>},
                {label:"Due date",     el:<div style={{width:4,height:14,background:C.orange,borderRadius:1}}/>},
                {label:"◆ Milestone",  el:<div style={{width:12,height:12,background:C.orange,transform:"rotate(45deg)",borderRadius:2}}/>},
                {label:"▼ Today",      el:<div style={{width:28,height:12,borderRadius:3,background:"#FFFBEB",border:"1px solid #F6AD55"}}/>},
                {label:"🚀 Launch wk", el:<div style={{width:28,height:12,borderRadius:3,background:"#FFF5F5",border:"1px solid #FC8181"}}/>},
              ].map(l=>(
                <div key={l.label} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:C.mid}}>{l.el}<span>{l.label}</span></div>
              ))}
              <div style={{marginLeft:"auto",fontSize:10,color:C.light}}>Bars fill weeks up to due date · Click dates to edit · +/− adjusts weeks · Dur. changes update bar width</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cascade modal */}
      {cascadeModal && (
        <div style={{position:"fixed",inset:0,background:"#0007",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
          <div style={{background:"white",borderRadius:14,padding:28,maxWidth:360,width:"90%",boxShadow:"0 8px 40px #0003"}}>
            <div style={{fontSize:16,fontWeight:800,color:C.dark,marginBottom:8}}>Push downstream tasks?</div>
            <div style={{fontSize:13,color:C.mid,marginBottom:20}}>
              Due date shifted by <strong style={{color:cascadeModal.delta>0?C.red:C.green}}>{cascadeModal.delta>0?`+${cascadeModal.delta}`:cascadeModal.delta} week{Math.abs(cascadeModal.delta)!==1?"s":""}</strong>. Push all incomplete tasks after this one?
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>applyCascade(cascadeModal.pi,cascadeModal.ti,cascadeModal.delta)} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:C.orange,color:"white",fontWeight:700,cursor:"pointer",fontSize:13}}>Yes, push all</button>
              <button onClick={()=>setCascadeModal(null)} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${C.border}`,background:"white",color:C.mid,fontWeight:600,cursor:"pointer",fontSize:13}}>No, just this</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
