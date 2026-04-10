import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, DollarSign, Package, AlertTriangle, CheckCircle2,
  Printer, LogOut, RefreshCw, Save, TrendingDown,
  TrendingUp, Banknote, Receipt, Users, ShieldCheck, Eye, ArrowLeft
} from "lucide-react";
import { getSession, clearSession } from "../../utils/sessionFlow";
import "./CierreCaja.css";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

const parse = (s) => parseFloat(String(s).replace(/[^0-9.-]/g, "")) || 0;

const Field = ({ label, qty, val, onQty, onVal, accent }) => (
  <div className="field-row">
    <span className="field-label">{label}</span>
    {qty !== undefined ? (
      <input
        className={`field-input field-qty ${accent ? "accent" : ""}`}
        value={qty} 
        onChange={(e) => onQty?.(e.target.value)}
      />
    ) : <div className="field-spacer" />}
    <input
      className={`field-input field-value ${accent ? "accent" : ""}`}
      value={val} 
      onChange={(e) => onVal?.(e.target.value)}
    />
  </div>
);

const SectionCard = ({ icon: Icon, title, color, children }) => (
  <div className="section-card">
    <div className={`section-header ${color}`}>
      <Icon size={15} className="shrink-0" />
      <span className="section-title">{title}</span>
    </div>
    <div className="section-content">{children}</div>
  </div>
);

const MetricCard = ({ label, value, sub, trend, variant }) => (
  <div className={`metric-card ${variant || "default"}`}>
    <div className="metric-label">{label}</div>
    <div className="metric-value">{value}</div>
    {sub && <div className="metric-sub">{sub}</div>}
    {trend !== undefined && (
      <div className={`metric-trend ${trend >= 0 ? "positive" : "negative"}`}>
        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(trend).toFixed(1)}% vs ayer
      </div>
    )}
  </div>
);

export default function CierreCaja() {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [guardado, setGuardado] = useState(false);
  const [datafono, setDatafono] = useState("si");
  const [empleadoData, setEmpleadoData] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.datosEmpleado) {
      navigate('/login', { replace: true });
      return;
    }
    setEmpleadoData(session.datosEmpleado);
    console.log("📊 Datos del empleado en cierre:", session.datosEmpleado);
  }, [navigate]);

  const [medios, setMedios] = useState({
    tarjetasCant: 0, tarjetasVal: 0,
    sodexoCant: 0, sodexoVal: 0,
    bigPassCant: 0, bigPassVal: 0,
    certCant: 0, certVal: 0,
    bonusCant: 0, bonusVal: 0,
    valesSodexoCant: 0, valesSodexoVal: 0,
    valesBigCant: 0, valesBigVal: 0,
    rappiVal: 0, didiVal: 0,
  });

  const [gastos, setGastos] = useState({
    reprCant: 0, reprVal: 0,
    capCant: 0, capVal: 0,
    invCant: 0, invVal: 0,
    cortCant: 0, cortVal: 0,
    menuCant: 0, menuVal: 0,
  });

  const [otros, setOtros] = useState({
    cajaCant: 0, cajaVal: 0,
    prepCant: 0, prepVal: 0,
    dolarCant: 0, dolarVal: 0,
    respCant: 0, respVal: 0,
  });

  const [sellos, setSellos] = useState([
    { sello: "", val: 0 },
    { sello: "", val: 0 },
    { sello: "", val: 0 },
  ]);

  const [reembolsos, setReembolsos] = useState({ cant: 0, val: 0 });
  const [regalo, setRegalo] = useState(0);
  const [factManual, setFactManual] = useState(0);

  const [propinas, setPropinas] = useState({
    informe: 0, repique: 0, almuerzo: 0,
    facturacion: 0, factAlm: 0, descuento: 0,
  });

  const [ventas, setVentas] = useState(0);
  const [efTransp, setEfTransp] = useState(0);
  const [obs, setObs] = useState("");

  const totalA = Object.entries(medios).reduce((s, [k, v]) => k.endsWith("Val") ? s + v : s, 0)
    + Object.entries(gastos).reduce((s, [k, v]) => k.endsWith("Val") ? s + v : s, 0)
    + Object.entries(otros).reduce((s, [k, v]) => k.endsWith("Val") ? s + v : s, 0);

  const totalB = sellos.reduce((s, r) => s + r.val, 0);
  const totalAB = totalA + totalB;
  const totalPropinas = propinas.informe + propinas.repique + propinas.almuerzo + propinas.facturacion - propinas.factAlm - propinas.descuento;
  const diferencia = totalAB - ventas - factManual - totalPropinas - efTransp;
  const faltante = diferencia < 0 ? Math.abs(diferencia) : 0;
  const sobrante = diferencia >= 0 ? diferencia : 0;

  const handleGuardar = () => { 
    setGuardado(true); 
    setTimeout(() => setGuardado(false), 2500); 
    console.log("💾 Guardando cierre de caja...");
  };

  const handleSalir = () => {
    if (window.confirm("¿Estás seguro de que deseas salir?")) {
      clearSession();
      navigate('/login', { replace: true });
    }
  };

  const handleVolver = () => {
    navigate('/cajera');
  };

  if (!empleadoData) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="cierre-caja-wrapper">
      <div className="cierre-caja-container">
        {/* Header */}
        <div className="header-container">
          <div className="header-left">
            <button className="btn-volver" onClick={handleVolver}>
              <ArrowLeft size={18} />
              Volver
            </button>
            <div className="header-info">
              <div className="logo-box">
                <Receipt size={18} className="logo-icon" />
              </div>
              <div>
                <div className="header-title">Cierre de Caja</div>
                <div className="header-subtitle">
                  {empleadoData?.nombre || "Usuario"} · Cédula: {empleadoData?.documento || "N/A"}
                </div>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <input 
              type="date" 
              value={fecha} 
              onChange={e => setFecha(e.target.value)}
              className="date-input"
            />
            <button className="btn-secondary">
              <Printer size={14} /> Imprimir
            </button>
            <button className="btn-info">
              <Eye size={14} /> Ver cierres
            </button>
            <button className="btn-danger" onClick={handleSalir}>
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard label="Total medios de pago (A)" value={fmt(totalA)} variant="info" />
        <MetricCard label="Total recaudo (B)" value={fmt(totalB)} variant="default" />
        <MetricCard label="Faltante" value={fmt(faltante)} variant={faltante > 0 ? "danger" : "default"} />
        <MetricCard label="Sobrante" value={fmt(sobrante)} variant={sobrante > 0 ? "success" : "default"} />
      </div>

      {/* Contenido Principal - Sin Pestañas */}
      <div className="main-sections">
        {/* Sección 1: Medios de Pago */}
        <div className="content-grid">
          <div className="content-col">
            <SectionCard icon={CreditCard} title="Cierre Datáfono" color="color-indigo">
              <div className="field-header">
                <span className="field-header-item">Medio</span>
                <span className="field-header-item center">Cant.</span>
                <span className="field-header-item right">Valor</span>
              </div>
              <Field label="Tarjetas Débito y Crédito" qty={medios.tarjetasCant} val={fmt(medios.tarjetasVal)} accent
                onQty={v => setMedios(p => ({ ...p, tarjetasCant: +v }))} onVal={v => setMedios(p => ({ ...p, tarjetasVal: parse(v) }))} />
              <Field label="Tarjetas Sodexo" qty={medios.sodexoCant} val={fmt(medios.sodexoVal)}
                onQty={v => setMedios(p => ({ ...p, sodexoCant: +v }))} onVal={v => setMedios(p => ({ ...p, sodexoVal: parse(v) }))} />
              <Field label="Tarjetas Big Pass" qty={medios.bigPassCant} val={fmt(medios.bigPassVal)}
                onQty={v => setMedios(p => ({ ...p, bigPassCant: +v }))} onVal={v => setMedios(p => ({ ...p, bigPassVal: parse(v) }))} />
            </SectionCard>

            <SectionCard icon={Package} title="Vales" color="color-violet">
              <Field label="Certificados de Regalo" qty={medios.certCant} val={fmt(medios.certVal)} accent
                onQty={v => setMedios(p => ({ ...p, certCant: +v }))} onVal={v => setMedios(p => ({ ...p, certVal: parse(v) }))} />
              <Field label="Bonos Quatum" qty={medios.bonusCant} val={fmt(medios.bonusVal)}
                onQty={v => setMedios(p => ({ ...p, bonusCant: +v }))} onVal={v => setMedios(p => ({ ...p, bonusVal: parse(v) }))} />
              <Field label="Vales Sodexo" qty={medios.valesSodexoCant} val={fmt(medios.valesSodexoVal)}
                onQty={v => setMedios(p => ({ ...p, valesSodexoCant: +v }))} onVal={v => setMedios(p => ({ ...p, valesSodexoVal: parse(v) }))} />
              <Field label="Vales Big Pass" qty={medios.valesBigCant} val={fmt(medios.valesBigVal)}
                onQty={v => setMedios(p => ({ ...p, valesBigCant: +v }))} onVal={v => setMedios(p => ({ ...p, valesBigVal: parse(v) }))} />
            </SectionCard>
          </div>

          <div className="content-col">
            <SectionCard icon={DollarSign} title="Plataformas de entrega" color="color-orange">
              <div className="platforms-list">
                {[{ name: "Rappi", color: "#FF6154", key: "rappiVal" }, { name: "DiDi Food", color: "#FF8000", key: "didiVal" }].map(p => (
                  <div key={p.key} className="platform-item">
                    <div className="platform-name">
                      <div className="platform-dot" style={{ background: p.color }} />
                      <span>{p.name}</span>
                    </div>
                    <input 
                      className="platform-input"
                      value={fmt(medios[p.key])} 
                      onChange={e => setMedios(prev => ({ ...prev, [p.key]: parse(e.target.value) }))} 
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard icon={Receipt} title="Reembolsos y facturación" color="color-cyan">
              <div className="field-row">
                <span className="field-label large">Total reembolsos</span>
                <input className="field-input field-qty accent" value={reembolsos.cant} onChange={e => setReembolsos(p => ({ ...p, cant: +e.target.value }))} />
                <input className="field-input field-value-small accent" value={fmt(reembolsos.val)} onChange={e => setReembolsos(p => ({ ...p, val: parse(e.target.value) }))} />
              </div>
              <div className="field-row">
                <span className="field-label large">Regalo</span>
                <div className="field-spacer" />
                <input className="field-input field-value-small" value={fmt(regalo)} onChange={e => setRegalo(parse(e.target.value))} />
              </div>
              <div className="field-row">
                <span className="field-label large">Facturación manual</span>
                <div className="field-spacer" />
                <input className="field-input field-value-small" value={fmt(factManual)} onChange={e => setFactManual(parse(e.target.value))} />
              </div>
            </SectionCard>

            <div className="total-box total-a">
              <span className="total-label">Total medios de pago (A)</span>
              <span className="total-value">{fmt(totalA)}</span>
            </div>
          </div>
        </div>

        {/* Sección 2: Gastos y Otros */}
        <div className="content-grid">
          <SectionCard icon={Package} title="Gastos" color="color-amber">
            <div className="field-header">
              <span className="field-header-item">Concepto</span>
              <span className="field-header-item center">Cant.</span>
              <span className="field-header-item right">Valor</span>
            </div>
            {[
              ["Gastos de Representación", "reprCant", "reprVal"],
              ["Capacitaciones", "capCant", "capVal"],
              ["Invitaciones", "invCant", "invVal"],
              ["Cortesías", "cortCant", "cortVal"],
              ["Menú de Empleados", "menuCant", "menuVal"],
            ].map(([label, qk, vk]) => (
              <Field key={qk} label={label} qty={gastos[qk]} val={fmt(gastos[vk])}
                onQty={v => setGastos(p => ({ ...p, [qk]: +v }))}
                onVal={v => setGastos(p => ({ ...p, [vk]: parse(v) }))} />
            ))}
          </SectionCard>

          <SectionCard icon={RefreshCw} title="Otros" color="color-teal">
            <div className="field-header">
              <span className="field-header-item">Concepto</span>
              <span className="field-header-item center">Cant.</span>
              <span className="field-header-item right">Valor</span>
            </div>
            {[
              ["Reembolso Caja Menor", "cajaCant", "cajaVal"],
              ["Prepagadas", "prepCant", "prepVal"],
              ["Dólares", "dolarCant", "dolarVal"],
              ["Responsabilidades", "respCant", "respVal"],
            ].map(([label, qk, vk]) => (
              <Field key={qk} label={label} qty={otros[qk]} val={fmt(otros[vk])}
                onQty={v => setOtros(p => ({ ...p, [qk]: +v }))}
                onVal={v => setOtros(p => ({ ...p, [vk]: parse(v) }))} />
            ))}
          </SectionCard>
        </div>

        {/* Sección 3: Efectivo y Propinas */}
        <div className="content-grid">
          <div className="content-col">
            <SectionCard icon={Banknote} title="Efectivo / Cheque — Transportadora y sellos" color="color-emerald">
            <div className="field-header-sellos">
              <span className="field-header-item">No. Sello</span>
              <span className="field-header-item right">Valor</span>
            </div>
            {sellos.map((s, i) => (
              <div key={i} className="sello-row">
                <input 
                  className="sello-input"
                  value={s.sello} 
                  placeholder="No. sello"
                  onChange={e => setSellos(prev => prev.map((r, j) => j === i ? { ...r, sello: e.target.value } : r))} 
                />
                <input 
                  className="sello-value"
                  value={fmt(s.val)} 
                  placeholder="Valor"
                  onChange={e => setSellos(prev => prev.map((r, j) => j === i ? { ...r, val: parse(e.target.value) } : r))} 
                />
              </div>
            ))}
            <div className="total-recaudo">
              <span className="total-recaudo-label">Total recaudo (B)</span>
              <span className="total-recaudo-value">{fmt(totalB)}</span>
            </div>
            <div className="consecutivo-box">
              Consecutivo: [S2763826]
            </div>
          </SectionCard>
          </div>

          <div className="content-col">
            <SectionCard icon={Users} title="Información de propinas" color="color-pink">
            {[
              ["Valor informe", "informe", false],
              ["(+) Repique", "repique", false],
              ["(+) Pago Almuerzo Heladerías", "almuerzo", false],
              ["(+) Propinas Facturación", "facturacion", false],
              ["(-) Facturas Almuerzo", "factAlm", true],
              ["(-) Descuento por Meseras", "descuento", true],
            ].map(([label, key, isNeg]) => (
              <div key={key} className="propina-row">
                <span className={`propina-label ${isNeg ? "negative" : ""}`}>{label}</span>
                <input 
                  className={`propina-input ${isNeg ? "negative" : "positive"}`}
                  value={fmt(propinas[key])} 
                  onChange={e => setPropinas(p => ({ ...p, [key]: parse(e.target.value) }))} 
                />
              </div>
            ))}
            <div className="total-propinas">
              <span className="total-propinas-label">Total propinas</span>
              <span className={`total-propinas-value ${totalPropinas >= 0 ? "positive" : "negative"}`}>
                {fmt(totalPropinas)}
              </span>
            </div>
          </SectionCard>
          </div>
        </div>

        {/* Sección 4: Validación y Observaciones */}
        <div className="content-grid">
          <SectionCard icon={ShieldCheck} title="Validación de resultados" color="color-indigo">
            <div className="validation-row">
              <span className="validation-label">Total A+B</span>
              <div className="validation-value bold">{fmt(totalAB)}</div>
            </div>
            
            <div className="validation-input-row">
              <label className="validation-input-label">(-) Total Registrado Ventas</label>
              <input 
                className="validation-input negative"
                value={fmt(ventas)}
                onChange={e => setVentas(parse(e.target.value))}
                placeholder="$0"
              />
            </div>
            
            <div className="validation-row">
              <span className="validation-label">(-) Facturación Manual</span>
              <div className="validation-value normal">{fmt(factManual)}</div>
            </div>
            
            <div className="validation-row">
              <span className="validation-label">(-) Total Propinas</span>
              <div className="validation-value normal">{fmt(totalPropinas)}</div>
            </div>
            
            <div className="validation-input-row">
              <label className="validation-input-label">Efectivo Transportadora</label>
              <input 
                className="validation-input"
                value={fmt(efTransp)}
                onChange={e => setEfTransp(parse(e.target.value))}
                placeholder="$0"
              />
            </div>
            
            <div className="validation-results">
              <div className={`result-box ${faltante > 0 ? "danger" : "neutral"}`}>
                <div className="result-header">
                  <TrendingDown size={11} className={faltante > 0 ? "icon-danger" : ""} /> Faltante
                </div>
                <div className={`result-amount ${faltante > 0 ? "danger" : "neutral"}`}>
                  {fmt(faltante)}
                </div>
              </div>
              <div className={`result-box ${sobrante > 0 ? "success" : "neutral"}`}>
                <div className="result-header">
                  <TrendingUp size={11} className={sobrante > 0 ? "icon-success" : ""} /> Sobrante
                </div>
                <div className={`result-amount ${sobrante > 0 ? "success" : "neutral"}`}>
                  {fmt(sobrante)}
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="validation-extras">
            <SectionCard icon={AlertTriangle} title="Observaciones" color="color-amber">
              <textarea 
                value={obs} 
                onChange={e => setObs(e.target.value)} 
                rows={4}
                placeholder="Ingresa las observaciones del cierre..."
                className="obs-textarea"
              />
              <div className="datafono-section">
                <div className="datafono-label">Estado del datáfono</div>
                <div className="datafono-options">
                  {["si", "no"].map(v => (
                    <label key={v} className={`datafono-option ${datafono === v ? (v === "si" ? "active-si" : "active-no") : ""}`}>
                      <input 
                        type="radio" 
                        name="dfono" 
                        value={v} 
                        checked={datafono === v} 
                        onChange={() => setDatafono(v)} 
                        className="datafono-radio" 
                      />
                      {v === "si" ? "Buen estado" : "Con novedad"}
                    </label>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={CheckCircle2} title="Responsable de verificación" color="color-emerald">
              <div className="responsable-info">
                <div className="info-item">
                  <span className="info-label">Cédula:</span>
                  <span className="info-value">{empleadoData?.documento || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{empleadoData?.nombre || "N/A"}</span>
                </div>
              </div>
              <button 
                onClick={handleGuardar}
                className={`btn-guardar ${guardado ? "guardado" : ""}`}
              >
                {guardado ? (
                  <>
                    <CheckCircle2 size={16} /> Guardado exitosamente
                  </>
                ) : (
                  <>
                    <Save size={16} /> Guardar cierre
                  </>
                )}
              </button>
            </SectionCard>
          </div>
        </div>
      </div>
      {/* Fin del contenido principal */}
      </div>
    </div>
  );
}
