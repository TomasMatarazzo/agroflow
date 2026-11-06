"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  categories, forecast, formatARS, fromISO, isMovement, toISO, type Movement,
  type Category, type CashFlowType
} from "../lib/forecast";

const STORAGE_KEY = "agroflow.demo.v2";
const INITIAL_BALANCE = 18_500_000;
const sample: Movement[] = [
  {id:"sample-1",concept:"Venta de soja",type:"income",category:"Granos",amount:14_200_000,dueDate:"2026-11-09",status:"pending"},
  {id:"sample-2",concept:"Fertilizantes",type:"expense",category:"Insumos",amount:4_800_000,dueDate:"2026-11-12",status:"pending"},
  {id:"sample-3",concept:"Servicios de cosecha",type:"expense",category:"Servicios",amount:2_500_000,dueDate:"2026-11-24",status:"pending"},
  {id:"sample-4",concept:"Venta de trigo",type:"income",category:"Granos",amount:9_800_000,dueDate:"2026-12-03",status:"pending"},
  {id:"sample-5",concept:"Impuesto rural",type:"expense",category:"Impuestos",amount:1_700_000,dueDate:"2026-10-30",status:"pending"},
  {id:"sample-6",concept:"Pago ya registrado",type:"expense",category:"Servicios",amount:750_000,dueDate:"2026-11-02",status:"completed"},
];
type View = "dashboard" | "transactions" | "projection";

function validStored(value: unknown): value is { balance: number; movements: Movement[] } {
  if (!value || typeof value !== "object") return false;
  const data = value as {balance?: unknown; movements?: unknown};
  return typeof data.balance === "number" && Number.isFinite(data.balance) &&
    Array.isArray(data.movements) && data.movements.every(isMovement);
}

export default function Home() {
  const [today, setToday] = useState(() => new Date(2026, 10, 6, 12));
  const [view, setView] = useState<View>("dashboard");
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [movements, setMovements] = useState<Movement[]>(sample);
  const [hydrated, setHydrated] = useState(false);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("2026-11-06");
  const [type, setType] = useState<CashFlowType>("expense");
  const [category, setCategory] = useState<Category>("Insumos");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | CashFlowType>("all");

  useEffect(() => {
    const current = new Date();
    setToday(current);
    setDueDate(toISO(current));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (validStored(parsed)) {
          setBalance(parsed.balance);
          setMovements(parsed.movements);
        }
      }
    } catch { /* localStorage is optional */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({balance, movements})); }
    catch { /* Browsers may disable localStorage */ }
  }, [balance, movements, hydrated]);

  const weeks = useMemo(() => forecast(movements, balance, today), [movements, balance, today]);
  const projected = weeks[weeks.length-1].closing;
  const income = weeks.reduce((sum, w) => sum + w.income, 0);
  const expense = weeks.reduce((sum, w) => sum + w.expense, 0);
  const negativeWeeks = weeks.filter(w => w.closing < 0).length;
  const overdue = weeks[0].overdueItems;
  const listed = movements.filter(m => filter === "all" || m.type === filter)
    .slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  function saveMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!concept.trim() || concept.length > 120 || !Number.isFinite(value) || value <= 0 || !fromISO(dueDate)) {
      setMessage("Completá un concepto, una fecha válida y un monto mayor a cero.");
      return;
    }
    setMovements(old => [...old, {
      id: crypto.randomUUID(), concept: concept.trim(), amount: value, dueDate, type, category, status:"pending"
    }]);
    setConcept(""); setAmount(""); setMessage("Movimiento registrado."); setView("transactions");
  }

  function downloadCSV() {
    const lines = [
      ["Concepto", "Tipo", "Categoria", "Monto ARS", "Vencimiento", "Estado"],
      ...movements.map(m => [m.concept, m.type, m.category, String(m.amount), m.dueDate, m.status])
    ];
    const csv = lines.map(row => row.map(value => '"' + value.replaceAll('"', '""') + '"').join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "agroflow-movimientos.csv";
    anchor.click(); URL.revokeObjectURL(url);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="logo">A</span><span>AgroFlow <small>GESTIÓN AGROPECUARIA</small></span></div>
      <p className="nav-caption">ESPACIO DE TRABAJO</p>
      <nav aria-label="Navegación principal">
        <button className={view==="dashboard"?"selected":""} onClick={()=>setView("dashboard")}>◫ &nbsp; Resumen</button>
        <button className={view==="transactions"?"selected":""} onClick={()=>setView("transactions")}>⇄ &nbsp; Movimientos</button>
        <button className={view==="projection"?"selected":""} onClick={()=>setView("projection")}>▦ &nbsp; Proyección 13 semanas</button>
      </nav>
      <div className="side-note"><strong>Datos de demostración</strong><p>Este prototipo no usa un servidor. Trabajá solamente con datos ficticios.</p></div>
    </aside>
    <main className="content">
      <header className="topline"><span>Empresa demo / Finanzas</span><span className="pill">● MVP personal · 2026</span></header>
      <section className="page-heading">
        <div><p className="eyebrow">CONTROL FINANCIERO</p>
          <h1>{view==="dashboard"?"Resumen financiero":view==="transactions"?"Movimientos":"Flujo de caja proyectado"}</h1>
          <p>Visualizá la liquidez de tu empresa agropecuaria con una proyección semanal.</p></div>
        <button className="action secondary" onClick={downloadCSV}>↓ Exportar CSV</button>
      </section>
      {view==="dashboard" && <>
        <section className="stats" aria-label="Indicadores">
          <article className="stat"><span>Saldo actual</span><strong>{formatARS(balance)}</strong><small>Editable en la proyección</small></article>
          <article className="stat"><span>Ingresos previstos</span><strong className="positive">{formatARS(income)}</strong><small>Próximas 13 semanas</small></article>
          <article className="stat"><span>Egresos previstos</span><strong>{formatARS(expense)}</strong><small>Próximas 13 semanas</small></article>
          <article className="stat"><span>Saldo proyectado</span><strong className={projected<0?"negative":""}>{formatARS(projected)}</strong><small>{negativeWeeks} semanas con saldo negativo</small></article>
        </section>
        <section className="two-cols"><article className="panel"><div className="panel-head"><h2>Situación financiera</h2><button className="link-button" onClick={()=>setView("projection")}>Ver proyección →</button></div><div className="highlight">{formatARS(projected)}<span>Saldo al finalizar la semana 13</span></div><div className="line"><span>Movimientos vencidos pendientes</span><strong>{overdue}</strong></div><div className="line"><span>Semanas con saldo negativo</span><strong>{negativeWeeks}</strong></div></article>
          <article className="panel"><h2>Acerca de AgroFlow</h2><p>Un sistema abierto de gestión financiera para productores y empresas del agro.</p><div className="soft">En esta versión, los movimientos realizados ya están incluidos en el saldo inicial y no se suman de nuevo. Los vencidos pendientes pasan a la primera semana.</div><button className="action" onClick={()=>setView("transactions")}>Gestionar movimientos</button></article></section>
      </>}
      {view==="transactions" && <>
        <section className="panel"><h2>Nuevo movimiento</h2><form className="entry-form" onSubmit={saveMovement}>
          <label>Concepto<input value={concept} onChange={e=>setConcept(e.target.value)} maxLength={120} required placeholder="Ej. Venta de trigo"/></label>
          <label>Monto ARS<input value={amount} onChange={e=>setAmount(e.target.value)} min="0.01" step="0.01" type="number" required placeholder="1500000"/></label>
          <label>Fecha de vencimiento<input value={dueDate} onChange={e=>setDueDate(e.target.value)} type="date" required/></label>
          <label>Tipo<select value={type} onChange={e=>setType(e.target.value as CashFlowType)}><option value="income">Ingreso</option><option value="expense">Egreso</option></select></label>
          <label>Categoría<select value={category} onChange={e=>setCategory(e.target.value as Category)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
          <button className="action" type="submit">+ Guardar movimiento</button>
        </form>{message&&<p role="status" className="feedback">{message}</p>}</section>
        <section className="panel"><div className="panel-head"><h2>Movimientos registrados ({listed.length})</h2><select aria-label="Filtrar movimientos" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="all">Todos</option><option value="income">Ingresos</option><option value="expense">Egresos</option></select></div>
          <div className="table-scroll"><table><thead><tr><th>Concepto</th><th>Vencimiento</th><th>Categoría</th><th>Tipo</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{listed.map(m=><tr key={m.id}><td>{m.concept}</td><td>{m.dueDate}</td><td>{m.category}</td><td>{m.type==="income"?"Ingreso":"Egreso"}</td><td className={m.type==="income"?"positive":""}>{formatARS(m.amount)}</td><td><span className="pill">{m.status==="pending"?"Pendiente":"Realizado"}</span></td><td><button className="link-button" onClick={()=>setMovements(old=>old.map(x=>x.id===m.id?{...x,status:x.status==="pending"?"completed":"pending"}:x))}>{m.status==="pending"?"Realizar":"Reabrir"}</button> <button className="link-button danger" onClick={()=>setMovements(old=>old.filter(x=>x.id!==m.id))}>Eliminar</button></td></tr>)}</tbody></table></div></section>
      </>}
      {view==="projection" && <section className="panel"><div className="panel-head"><div><h2>Pronóstico de 13 semanas</h2><p>Semana 1 incluye obligaciones vencidas todavía pendientes.</p></div><label className="balance-label">Saldo inicial ARS<input type="number" value={balance} onChange={e=>{const n=Number(e.target.value);if(Number.isFinite(n))setBalance(n)}}/></label></div><div className="table-scroll"><table><thead><tr><th>Semana</th><th>Período</th><th>Saldo inicial</th><th>Ingresos</th><th>Egresos</th><th>Saldo final</th></tr></thead><tbody>{weeks.map(w=><tr key={w.week}><td>W{w.week}</td><td>{w.start} — {w.end}</td><td>{formatARS(w.opening)}</td><td className="positive">{formatARS(w.income)}</td><td>{formatARS(w.expense)}</td><td className={w.closing<0?"negative":"strong"}>{formatARS(w.closing)}</td></tr>)}</tbody></table></div></section>}
      <footer>AgroFlow · Código abierto MIT · Datos ficticios · No ingresar información financiera real</footer>
    </main>
  </div>;
}
