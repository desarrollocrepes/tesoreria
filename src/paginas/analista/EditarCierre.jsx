import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard, DollarSign, Package, AlertTriangle, CheckCircle2,
  Printer, LogOut, RefreshCw, Save, TrendingDown,
  TrendingUp, Banknote, Receipt, Users, ShieldCheck, Eye, ArrowLeft, Plus, X, Search, Trash2, ChevronDown
} from "lucide-react";
import { message } from 'antd';
import "../cajera/CierreCaja.css";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

const parse = (s) => {
  // Remover todo excepto números, comas y signos negativos
  // Luego reemplazar comas por puntos para el decimal
  const cleaned = String(s).replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

const Field = ({ label, qty, val, onQty, onVal, accent }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState("");

  const formatearMientrasEscribe = (valor) => {
    // Extraer solo números
    const soloNumeros = valor.replace(/\D/g, '');
    if (!soloNumeros) return '';
    
    // Formatear con separadores de miles (formato colombiano)
    const numero = parseInt(soloNumeros);
    return new Intl.NumberFormat('es-CO').format(numero);
  };

  return (
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
        value={editing ? formatearMientrasEscribe(tempValue) : val}
        onFocus={(e) => {
          setEditing(true);
          setTempValue(String(parse(val)));
        }}
        onChange={(e) => {
          const soloNumeros = e.target.value.replace(/\D/g, '');
          setTempValue(soloNumeros);
        }}
        onBlur={(e) => {
          setEditing(false);
          onVal?.(tempValue);
        }}
      />
    </div>
  );
};

const FieldConDiferencia = ({ label, qty, val, valReal, onQty, onVal, accent }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState("");
  
  const formatearMientrasEscribe = (valor) => {
    // Extraer solo números
    const soloNumeros = valor.replace(/\D/g, '');
    if (!soloNumeros) return '';
    
    // Formatear con separadores de miles (formato colombiano)
    const numero = parseInt(soloNumeros);
    return new Intl.NumberFormat('es-CO').format(numero);
  };
  
  const valorNumerico = typeof val === 'string' ? parse(val) : val;
  const diferencia = valorNumerico - (valReal || 0);
  
  return (
    <div className="field-row-extended">
      <span className="field-label">{label}</span>
      {qty !== undefined ? (
        <input
          className={`field-input field-qty-wide ${accent ? "accent" : ""}`}
          value={qty} 
          onChange={(e) => onQty?.(e.target.value)}
          maxLength={2}
        />
      ) : <div className="field-spacer" />}
      <input
        className={`field-input field-value ${accent ? "accent" : ""}`}
        value={editing ? formatearMientrasEscribe(tempValue) : val}
        onFocus={(e) => {
          setEditing(true);
          setTempValue(String(parse(val)));
        }}
        onChange={(e) => {
          const soloNumeros = e.target.value.replace(/\D/g, '');
          setTempValue(soloNumeros);
        }}
        onBlur={(e) => {
          setEditing(false);
          onVal?.(tempValue);
        }}
      />
      <input
        className="field-input field-value-real"
        value={fmt(valReal || 0)}
        readOnly
        title="Valor de facturación"
      />
      <input
        className={`field-input field-diferencia ${diferencia < 0 ? 'diferencia-negativa' : diferencia > 0 ? 'diferencia-positiva' : ''}`}
        value={fmt(diferencia)}
        readOnly
        title="Diferencia: Valor ingresado - Valor real"
      />
    </div>
  );
};

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

export default function EditarCierre() {
  const navigate = useNavigate();
  const location = useLocation();
  const cierreData = location.state?.cierre;

  const [fecha, setFecha] = useState(cierreData?.fecha || new Date().toISOString().split('T')[0]);
  const [guardado, setGuardado] = useState(false);
  const [datafono, setDatafono] = useState("si");
  const [empleadoData, setEmpleadoData] = useState({
    nombre: cierreData?.cajera || "Cajera",
    documento: cierreData?.documentoCajera || "N/A"
  });

  const [medios, setMedios] = useState({
    tarjetasCant: cierreData?.mediosPago?.tarjetas?.cantidad || 0,
    tarjetasVal: cierreData?.mediosPago?.tarjetas?.valor || 0,
    sodexoCant: cierreData?.mediosPago?.sodexo?.cantidad || 0,
    sodexoVal: cierreData?.mediosPago?.sodexo?.valor || 0,
    bigPassCant: cierreData?.mediosPago?.bigPass?.cantidad || 0,
    bigPassVal: cierreData?.mediosPago?.bigPass?.valor || 0,
    certCant: 0,
    certVal: 0,
    bonusCant: 0,
    bonusVal: 0,
    valesSodexoCant: 0,
    valesSodexoVal: 0,
    valesBigCant: 0,
    valesBigVal: 0,
    rappiVal: cierreData?.mediosPago?.rappi?.valor || 0,
    didiVal: cierreData?.mediosPago?.didi?.valor || 0,
    callcenterVal: 0,
    domiciliosPropiosVal: 0,
  });

  // Valores reales traídos de facturación
  const [valoresReales, setValoresReales] = useState({
    tarjetasValReal: cierreData?.totalTarjetas || 2250000,
    sodexoValReal: 185000,
    bigPassValReal: 420000,
    certValReal: 150000,
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

  const [sellos, setSellos] = useState([]);

  const [reembolsos, setReembolsos] = useState({ cant: 0, val: 0 });
  const [regalo, setRegalo] = useState(0);
  const [factManual, setFactManual] = useState(0);
  const [totalfacturas, setTotalFacturas] = useState({ cant: 0, val: 0 });
  const [venta, setVenta] = useState(cierreData?.totalVentas || 0);
  const [facturasanuladas, setFacturasAnuladas] = useState({ cant: 0, val: 0 });
  const [propinasFact, setPropinasFact] = useState(0);

  const [propinas, setPropinas] = useState({
    informe: 0, repique: 0, almuerzo: 0,
    facturacion: 0, factAlm: 0, descuento: 0,
  });

  const [ventas, setVentas] = useState(cierreData?.totalVentas || 0);
  const [efTransp, setEfTransp] = useState(0);
  const [obs, setObs] = useState("");
  
  // Estados para modal de meseras
  const [modalMeseras, setModalMeseras] = useState(false);
  const [documentoBuscar, setDocumentoBuscar] = useState("");
  const [meseraEncontrada, setMeseraEncontrada] = useState(null);
  const [meseras, setMeseras] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [montoMesera, setMontoMesera] = useState("");
  
  // Estados para modal de responsables (sellos)
  const [modalResponsable, setModalResponsable] = useState(false);
  const [numeroSello, setNumeroSello] = useState("");
  const [valorSello, setValorSello] = useState("");
  
  // Estados para acordeones
  const [acordeonMeseras, setAcordeonMeseras] = useState(false);
  const [acordeonSellos, setAcordeonSellos] = useState(false);
  const [acordeonVentasProductos, setAcordeonVentasProductos] = useState(false);
  
  // Estados para modal de venta producto
  const [modalVentaProducto, setModalVentaProducto] = useState(false);
  const [documentoVentaProducto, setDocumentoVentaProducto] = useState("");
  const [empleadoVentaProducto, setEmpleadoVentaProducto] = useState(null);
  const [buscandoEmpleadoVenta, setBuscandoEmpleadoVenta] = useState(false);
  const [conceptoVentaProducto, setConceptoVentaProducto] = useState("");
  const [valorVentaProducto, setValorVentaProducto] = useState("");
  const [ventasProductos, setVentasProductos] = useState([]);
  const [errorVentaProducto, setErrorVentaProducto] = useState("");

  useEffect(() => {
    if (!cierreData) {
      message.warning('No se encontró información del cierre a editar');
      navigate('/analista');
    }
  }, [cierreData, navigate]);

  const totalA = Object.entries(medios).reduce((s, [k, v]) => k.endsWith("Val") ? s + v : s, 0)
    + Object.entries(gastos).reduce((s, [k, v]) => k.endsWith("Val") ? s + v : s, 0)
    + Object.entries(otros).reduce((s, [k, v]) => k.endsWith("Val") ? s + v : s, 0);

  const totalB = sellos.reduce((s, r) => s + r.val, 0);
  const totalAB = totalA + totalB;
  const totalPropinas = propinas.informe + propinas.repique + propinas.almuerzo + propinas.facturacion - propinas.factAlm - propinas.descuento;
  const diferencia = totalAB - ventas - factManual - totalPropinas - efTransp;
  const faltante = diferencia < 0 ? Math.abs(diferencia) : 0;
  const sobrante = diferencia >= 0 ? diferencia : 0;

  const handleGuardar = async () => {
    try {
      // TODO: Implementar guardado en API
      console.log("💾 Guardando edición de cierre...", {
        id: cierreData.id,
        fecha,
        medios,
        gastos,
        otros,
        sellos,
        reembolsos,
        propinas,
        ventas,
        efTransp,
        obs,
        datafono
      });
      
      setGuardado(true);
      message.success('Cierre actualizado exitosamente');
      
      setTimeout(() => {
        navigate('/analista');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar:', error);
      message.error('Error al guardar los cambios');
    }
  };

  const handleVolver = () => {
    navigate('/analista');
  };

  const cerrarModal = () => {
    setModalMeseras(false);
    setDocumentoBuscar("");
    setMeseraEncontrada(null);
    setErrorBusqueda("");
    setMontoMesera("");
  };

  const buscarMesera = async () => {
    if (!documentoBuscar.trim()) {
      setErrorBusqueda("Ingresa un número de documento");
      return;
    }

    setBuscando(true);
    setErrorBusqueda("");
    setMeseraEncontrada(null);

    try {
      const url = `https://apialohav2.crepesywaffles.com/buk/empleados3?documento=${documentoBuscar}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`No se encontró el empleado`);
      }

      const data = await response.json();
      let empleado = null;
      
      if (data && data.ok && data.data) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          empleado = data.data[0];
        }
      } else if (Array.isArray(data) && data.length > 0) {
        empleado = data[0];
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        const keys = Object.keys(data);
        if (keys.length > 0 && !isNaN(keys[0])) {
          empleado = data[keys[0]];
        }
      }

      if (!empleado) {
        throw new Error('No se encontró el empleado');
      }

      const meseraData = {
        nombre: empleado.full_name || empleado.nombre || 'Desconocido',
        documento: empleado.document_number || empleado.documento || documentoBuscar,
        foto: empleado.photo_url || empleado.foto || null,
        cargo: empleado.cargo_nombre || empleado.cargo || null,
        area: empleado.area_nombre || empleado.area || null,
      };

      setMeseraEncontrada(meseraData);
    } catch (error) {
      setErrorBusqueda(error.message);
    } finally {
      setBuscando(false);
    }
  };

  const agregarMesera = () => {
    if (!montoMesera || parse(montoMesera) <= 0) {
      setErrorBusqueda("Ingresa un monto válido a descontar");
      return;
    }

    if (meseras.some(m => m.documento === meseraEncontrada.documento)) {
      setErrorBusqueda("Esta mesera ya está en la lista");
      return;
    }

    const nuevaMesera = {
      ...meseraEncontrada,
      monto: parse(montoMesera)
    };

    const nuevasMeseras = [...meseras, nuevaMesera];
    setMeseras(nuevasMeseras);

    const totalDescuento = nuevasMeseras.reduce((sum, m) => sum + m.monto, 0);
    setPropinas(p => ({ ...p, descuento: totalDescuento }));

    setMeseraEncontrada(null);
    setDocumentoBuscar("");
    setMontoMesera("");
    setErrorBusqueda("");
  };

  const eliminarMesera = (documento) => {
    const nuevasMeseras = meseras.filter(m => m.documento !== documento);
    setMeseras(nuevasMeseras);

    const totalDescuento = nuevasMeseras.reduce((sum, m) => sum + m.monto, 0);
    setPropinas(p => ({ ...p, descuento: totalDescuento }));
  };

  const cerrarModalResponsable = () => {
    setModalResponsable(false);
    setNumeroSello("");
    setValorSello("");
  };

  const agregarSello = () => {
    if (!numeroSello.trim()) {
      message.warning("Ingresa el número de sello");
      return;
    }

    if (!valorSello || parse(valorSello) <= 0) {
      message.warning("Ingresa un valor válido para el sello");
      return;
    }

    const nuevoSello = {
      numero: numeroSello,
      val: parse(valorSello),
      responsable: empleadoData?.nombre || empleadoData?.full_name || "Usuario",
      documento: empleadoData?.documento || empleadoData?.document_number || "N/A",
      foto: empleadoData?.foto || empleadoData?.photo_url || null
    };

    setSellos([...sellos, nuevoSello]);
    setNumeroSello("");
    setValorSello("");
    setModalResponsable(false);
  };

  const eliminarSello = (index) => {
    setSellos(sellos.filter((_, i) => i !== index));
  };

  const buscarEmpleadoVentaProducto = async () => {
    if (!documentoVentaProducto.trim()) {
      setErrorVentaProducto("Ingresa un número de documento");
      return;
    }

    setBuscandoEmpleadoVenta(true);
    setErrorVentaProducto("");
    setEmpleadoVentaProducto(null);

    try {
      const url = `https://apialohav2.crepesywaffles.com/buk/empleados3?documento=${documentoVentaProducto}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`No se encontró el empleado`);
      }

      const data = await response.json();
      let empleado = null;
      
      if (data && data.ok && data.data) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          empleado = data.data[0];
        }
      } else if (Array.isArray(data) && data.length > 0) {
        empleado = data[0];
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        const keys = Object.keys(data);
        if (keys.length > 0 && !isNaN(keys[0])) {
          empleado = data[keys[0]];
        }
      }

      if (!empleado) {
        throw new Error('No se encontró el empleado');
      }

      const empleadoData = {
        nombre: empleado.full_name || empleado.nombre || 'Desconocido',
        documento: empleado.document_number || empleado.documento || documentoVentaProducto,
        foto: empleado.photo_url || empleado.foto || null,
        cargo: empleado.cargo_nombre || empleado.cargo || null,
        area: empleado.area_nombre || empleado.area || null,
      };

      setEmpleadoVentaProducto(empleadoData);
    } catch (error) {
      setErrorVentaProducto(error.message);
    } finally {
      setBuscandoEmpleadoVenta(false);
    }
  };

  const agregarVentaProducto = () => {
    if (!conceptoVentaProducto.trim()) {
      setErrorVentaProducto("Ingresa el concepto de la venta");
      return;
    }

    if (!valorVentaProducto || parse(valorVentaProducto) <= 0) {
      setErrorVentaProducto("Ingresa un valor válido");
      return;
    }

    const nuevaVenta = {
      ...empleadoVentaProducto,
      concepto: conceptoVentaProducto,
      valor: parse(valorVentaProducto)
    };

    const nuevasVentas = [...ventasProductos, nuevaVenta];
    setVentasProductos(nuevasVentas);
    
    const totalCantidad = nuevasVentas.length;
    const totalValor = nuevasVentas.reduce((sum, v) => sum + v.valor, 0);
    setOtros(p => ({ ...p, respCant: totalCantidad, respVal: totalValor }));

    setEmpleadoVentaProducto(null);
    setDocumentoVentaProducto("");
    setConceptoVentaProducto("");
    setValorVentaProducto("");
    setErrorVentaProducto("");
  };

  const eliminarVentaProducto = (index) => {
    const nuevasVentas = ventasProductos.filter((_, i) => i !== index);
    setVentasProductos(nuevasVentas);
    
    const totalCantidad = nuevasVentas.length;
    const totalValor = nuevasVentas.reduce((sum, v) => sum + v.valor, 0);
    setOtros(p => ({ ...p, respCant: totalCantidad, respVal: totalValor }));
  };

  const cerrarModalVentaProducto = () => {
    setModalVentaProducto(false);
    setDocumentoVentaProducto("");
    setEmpleadoVentaProducto(null);
    setConceptoVentaProducto("");
    setValorVentaProducto("");
    setErrorVentaProducto("");
  };

  if (!cierreData) {
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
                <div className="header-title">Editar Cierre de Caja</div>
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
            <button className="btn-danger" onClick={handleVolver}>
              <LogOut size={14} /> Cancelar
            </button>
          </div>
        </div>

      {/* Contenido Principal - 2 Columnas */}
      <div className="content-grid">
        {/* COLUMNA IZQUIERDA */}
        <div className="content-col">
          {/* Tarjetas */}
          <SectionCard icon={CreditCard} title="Tarjetas" color="color-indigo">
            <div className="field-header-extended">
              <span className="field-header-item">Medio</span>
              <span className="field-header-item center">Cant.</span>
              <span className="field-header-item right">Valor Ingresado</span>
              <span className="field-header-item right">Valor Real</span>
              <span className="field-header-item right">Diferencia</span>
            </div>
            <FieldConDiferencia 
              label="Tarjetas Débito y Crédito" 
              qty={medios.tarjetasCant} 
              val={fmt(medios.tarjetasVal)} 
              valReal={valoresReales.tarjetasValReal}
              accent
              onQty={v => setMedios(p => ({ ...p, tarjetasCant: +v }))} 
              onVal={v => setMedios(p => ({ ...p, tarjetasVal: parse(v) }))} 
            />
            <FieldConDiferencia 
              label="Tarjetas Sodexo" 
              qty={medios.sodexoCant} 
              val={fmt(medios.sodexoVal)}
              valReal={valoresReales.sodexoValReal}
              onQty={v => setMedios(p => ({ ...p, sodexoCant: +v }))} 
              onVal={v => setMedios(p => ({ ...p, sodexoVal: parse(v) }))} 
            />
            <FieldConDiferencia 
              label="Tarjetas Big Pass" 
              qty={medios.bigPassCant} 
              val={fmt(medios.bigPassVal)}
              valReal={valoresReales.bigPassValReal}
              onQty={v => setMedios(p => ({ ...p, bigPassCant: +v }))} 
              onVal={v => setMedios(p => ({ ...p, bigPassVal: parse(v) }))} 
            />
            <FieldConDiferencia 
              label="Certificados de Regalo" 
              qty={medios.certCant} 
              val={fmt(medios.certVal)}
              valReal={valoresReales.certValReal}
              accent
              onQty={v => setMedios(p => ({ ...p, certCant: +v }))} 
              onVal={v => setMedios(p => ({ ...p, certVal: parse(v) }))} 
            />
          </SectionCard>

          {/* Vales */}
          <SectionCard icon={Package} title="Vales" color="color-violet">
            <div className="field-header">
              <span className="field-header-item">Concepto</span>
              <span className="field-header-item center">Cant.</span>
              <span className="field-header-item right">Valor</span>
            </div>
            <Field label="Bonos Quatum" qty={medios.bonusCant} val={fmt(medios.bonusVal)}
              onQty={v => setMedios(p => ({ ...p, bonusCant: +v }))} onVal={v => setMedios(p => ({ ...p, bonusVal: parse(v) }))} />
            <Field label="Vales Sodexo" qty={medios.valesSodexoCant} val={fmt(medios.valesSodexoVal)}
              onQty={v => setMedios(p => ({ ...p, valesSodexoCant: +v }))} onVal={v => setMedios(p => ({ ...p, valesSodexoVal: parse(v) }))} />
            <Field label="Vales Big Pass" qty={medios.valesBigCant} val={fmt(medios.valesBigVal)}
              onQty={v => setMedios(p => ({ ...p, valesBigCant: +v }))} onVal={v => setMedios(p => ({ ...p, valesBigVal: parse(v) }))} />
          </SectionCard>

          {/* Plataformas */}
          <SectionCard icon={DollarSign} title="Plataformas" color="color-orange">
            <div className="platforms-list">
              {[{ name: "Rappi", color: "#FF6154", key: "rappiVal" },{ name: "DiDi Food", color: "#FF8000", key: "didiVal" },{ name: "Callcenter", color: "#54a7ff", key: "callcenterVal" },{ name: "Domicilios Propios (prepagadas)", color: "#6bff54", key: "domiciliosPropiosVal" }].map(p => (
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

          {/* Gastos */}
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

          {/* Otros */}
          <SectionCard icon={RefreshCw} title="Otros" color="color-teal">
            <div className="field-header">
              <span className="field-header-item">Concepto</span>
              <span className="field-header-item center">Cant.</span>
              <span className="field-header-item right">Valor</span>
            </div>
            {[
              ["Reembolso Caja Menor", "cajaCant", "cajaVal"],
              ["Dólares", "dolarCant", "dolarVal"],
            ].map(([label, qk, vk]) => (
              <Field key={qk} label={label} qty={otros[qk]} val={fmt(otros[vk])}
                onQty={v => setOtros(p => ({ ...p, [qk]: +v }))}
                onVal={v => setOtros(p => ({ ...p, [vk]: parse(v) }))} />
            ))}
            
            {/* Venta Producto con botón + */}
            <div className="field-row">
              <span className="field-label">Venta Producto</span>
              <input className="field-input field-qty" value={otros.respCant} readOnly style={{ background: '#f9fafb', cursor: 'not-allowed' }} />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                <input 
                  className="field-input field-value"
                  value={fmt(otros.respVal)} 
                  readOnly
                  style={{ background: '#f9fafb', cursor: 'not-allowed' }}
                  title="Calculado automáticamente"
                />
                <button 
                  className="btn-agregar-venta"
                  onClick={() => setModalVentaProducto(true)}
                  title="Agregar venta producto"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Lista de ventas de productos */}
            {ventasProductos.length > 0 && (
              <div className="ventas-productos-lista">
                <div 
                  className="ventas-header clickable"
                  onClick={() => setAcordeonVentasProductos(!acordeonVentasProductos)}
                >
                  <span>Ventas de Productos ({ventasProductos.length})</span>
                  <ChevronDown 
                    size={18} 
                    className={`chevron-icon ${acordeonVentasProductos ? 'rotated' : ''}`}
                  />
                </div>
                {acordeonVentasProductos && (
                  <div className="acordeon-content">
                    {ventasProductos.map((venta, i) => (
                      <div key={i} className="venta-producto-item">
                        {venta.foto && (
                          <img src={venta.foto} alt={venta.nombre} className="venta-foto" />
                        )}
                        <div className="venta-info">
                          <div className="venta-nombre">{venta.nombre}</div>
                          <div className="venta-concepto">{venta.concepto}</div>
                        </div>
                        <div className="venta-valor">{fmt(venta.valor)}</div>
                        <button 
                          className="btn-eliminar-venta"
                          onClick={() => eliminarVentaProducto(i)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Total Medios de Pago */}
          <div className="total-box total-a">
            <span className="total-label">Total medios de pago (A)</span>
            <span className="total-value">{fmt(totalA)}</span>
          </div>

          {/* Efectivo o Cheque */}
          <SectionCard icon={Banknote} title="Efectivo / Cheque — Transportadora y sellos" color="color-emerald">
            <div className="sellos-header">
              <span className="sellos-title">Sellos registrados</span>
              <button 
                className="btn-agregar-sello"
                onClick={() => setModalResponsable(true)}
                title="Agregar sello"
              >
                <Plus size={16} /> Agregar sello
              </button>
            </div>

            {sellos.length === 0 ? (
              <div className="sin-sellos">
                <Banknote size={32} style={{ opacity: 0.3 }} />
                <span>No hay sellos registrados</span>
                <small>Presiona "Agregar sello" para comenzar</small>
              </div>
            ) : (
              <div className="sellos-acordeon">
                <div 
                  className="sellos-header-acordeon clickable"
                  onClick={() => setAcordeonSellos(!acordeonSellos)}
                >
                  <span>Sellos registrados ({sellos.length})</span>
                  <ChevronDown 
                    size={18} 
                    className={`chevron-icon ${acordeonSellos ? 'rotated' : ''}`}
                  />
                </div>
                {acordeonSellos && (
                  <div className="acordeon-content">
                    <div className="sellos-lista">
                      {sellos.map((sello, i) => (
                        <div key={i} className="sello-card">
                          <div className="sello-info">
                            {sello.foto && (
                              <img src={sello.foto} alt={sello.responsable} className="sello-foto" />
                            )}
                            <div className="sello-datos">
                              <div className="sello-responsable">{sello.responsable}</div>
                              <div className="sello-documento">CC: {sello.documento}</div>
                            </div>
                          </div>
                          <div className="sello-valor-container">
                            <div className="sello-numero-valor">
                              <div className="sello-numero">Sello N° {sello.numero}</div>
                              <div className="sello-valor">{fmt(sello.val)}</div>
                            </div>
                            <button 
                              className="btn-eliminar-sello"
                              onClick={() => eliminarSello(i)}
                              title="Eliminar sello"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="total-recaudo">
              <span className="total-recaudo-label">Total recaudo (B)</span>
              <span className="total-recaudo-value">{fmt(totalB)}</span>
            </div>
          </SectionCard>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="content-col">

          {/* Reembolsos y facturación */}
          <SectionCard icon={Receipt} title="Reembolsos y facturación" color="color-cyan">
            <div className="field-header">
              <span className="field-header-item">Concepto</span>
              <span className="field-header-item center">Cant.</span>
              <span className="field-header-item right">Valor</span>
            </div>
            <div className="field-row">
              <span className="field-label large">Total reembolsos</span>
              <input className="field-input field-qty accent" value={reembolsos.cant} onChange={e => setReembolsos(p => ({ ...p, cant: +e.target.value }))} />
              <input className="field-input field-value-small accent" value={fmt(reembolsos.val)} onChange={e => setReembolsos(p => ({ ...p, val: parse(e.target.value) }))} />
            </div>
            <div className="field-row">
              <span className="field-label large">Recarga de Bonos </span>
              <div className="field-spacer" />
              <input className="field-input field-value-small" value={fmt(regalo)} onChange={e => setRegalo(parse(e.target.value))} />
            </div>

          </SectionCard>


          {/* facturacion manual  */}
          <SectionCard icon={Receipt} title="Facturación manual" color="color-cyan">
            <div className="field-header">
              <span className="field-header-item">Concepto</span>
              <span className="field-header-item center">Cant.</span>
              <span className="field-header-item right">Valor</span>
            </div>
            <div className="field-row">
              <span className="field-label large">Total facturas</span>
              <input className="field-input field-qty accent" value={totalfacturas.cant} onChange={e => setTotalFacturas(p => ({ ...p, cant: +e.target.value }))} />
              <input className="field-input field-value-small accent" value={fmt(totalfacturas.val)} onChange={e => setTotalFacturas(p => ({ ...p, val: parse(e.target.value) }))} />
            </div>
            <div className="field-row">
              <span className="field-label large">Facturas anuladas</span>
              <input className="field-input field-qty accent" value={facturasanuladas.cant} onChange={e => setFacturasAnuladas(p => ({ ...p, cant: +e.target.value }))} />
              <input className="field-input field-value-small accent" value={fmt(facturasanuladas.val)} onChange={e => setFacturasAnuladas(p => ({ ...p, val: parse(e.target.value) }))} />
            </div>
            <div className="field-row">
              <span className="field-label large">Propinas</span>
              <div className="field-spacer" />
              <input className="field-input field-value-small" value={fmt(propinasFact)} onChange={e => setPropinasFact(parse(e.target.value))} />
            </div>
          </SectionCard>


          {/* Información de propinas */}
          <SectionCard icon={Users} title="Información de propinas" color="color-pink">
            {[
              ["Valor informe", "informe", false],
              ["(+) Repique", "repique", false],
              ["(+) Pago Almuerzo Heladerías", "almuerzo", false],
              ["(+) Propinas Facturación", "facturacion", false],
              ["(-) Facturas Almuerzo", "factAlm", true],
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
            
            {/* Descuento por Meseras con botón + */}
            <div className="propina-row">
              <span className="propina-label negative">(-) Descuento por Meseras</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  className="propina-input negative"
                  value={fmt(propinas.descuento)} 
                  readOnly
                  style={{ background: '#f9fafb', cursor: 'not-allowed' }}
                  title="Calculado automáticamente"
                />
                <button 
                  className="btn-agregar-mesera"
                  onClick={() => setModalMeseras(true)}
                  title="Agregar mesera"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Lista de meseras agregadas */}
            {meseras.length > 0 && (
              <div className="meseras-lista">
                <div 
                  className="meseras-header clickable"
                  onClick={() => setAcordeonMeseras(!acordeonMeseras)}
                >
                  <span>Meseras ({meseras.length})</span>
                  <ChevronDown 
                    size={18} 
                    className={`chevron-icon ${acordeonMeseras ? 'rotated' : ''}`}
                  />
                </div>
                {acordeonMeseras && (
                  <div className="acordeon-content">
                    {meseras.map((mesera) => (
                      <div key={mesera.documento} className="mesera-item">
                        {mesera.foto && (
                          <img src={mesera.foto} alt={mesera.nombre} className="mesera-foto" />
                        )}
                        <div className="mesera-info">
                          <div className="mesera-nombre">{mesera.nombre}</div>
                          <div className="mesera-documento">{mesera.documento}</div>
                        </div>
                        <div className="mesera-monto">{fmt(mesera.monto)}</div>
                        <button 
                          className="btn-eliminar-mesera"
                          onClick={() => eliminarMesera(mesera.documento)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="total-propinas">
              <span className="total-propinas-label">Total propinas</span>
              <span className={`total-propinas-value ${totalPropinas >= 0 ? "positive" : "negative"}`}>
                {fmt(totalPropinas)}
              </span>
            </div>
          </SectionCard>

          {/* Validación de resultados */}
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

          {/* Observaciones */}
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

          {/* Responsable de verificación */}
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
                  <Save size={16} /> Guardar cambios
                </>
              )}
            </button>
          </SectionCard>
        </div>
      </div>
      {/* Fin del contenido principal */}

      {/* Modal de búsqueda de meseras */}
      {modalMeseras && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Mesera</h3>
              <button className="btn-cerrar-modal" onClick={cerrarModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Buscador */}
              <div className="buscar-mesera">
                <div className="input-buscar-container">
                  <Search size={18} className="icon-search" />
                  <input
                    type="text"
                    className="input-buscar-mesera"
                    placeholder="Número de documento"
                    value={documentoBuscar}
                    onChange={(e) => setDocumentoBuscar(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarMesera()}
                  />
                </div>
                <button 
                  className="btn-buscar-mesera"
                  onClick={buscarMesera}
                  disabled={buscando}
                >
                  {buscando ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {/* Error de búsqueda */}
              {errorBusqueda && (
                <div className="error-busqueda">
                  <AlertTriangle size={16} />
                  {errorBusqueda}
                </div>
              )}

              {/* Mesera encontrada */}
              {meseraEncontrada && (
                <div className="mesera-encontrada">
                  <div className="mesera-card">
                    {meseraEncontrada.foto ? (
                      <img 
                        src={meseraEncontrada.foto} 
                        alt={meseraEncontrada.nombre} 
                        className="mesera-foto-grande" 
                      />
                    ) : (
                      <div className="mesera-foto-placeholder">
                        <Users size={32} />
                      </div>
                    )}
                    <div className="mesera-datos">
                      <div className="mesera-nombre-grande">{meseraEncontrada.nombre}</div>
                      <div className="mesera-documento-grande">CC: {meseraEncontrada.documento}</div>
                      {meseraEncontrada.cargo && (
                        <div className="mesera-cargo">{meseraEncontrada.cargo}</div>
                      )}
                      {meseraEncontrada.area && (
                        <div className="mesera-area">{meseraEncontrada.area}</div>
                      )}
                    </div>
                  </div>

                  {/* Input para el monto a descontar */}
                  <div className="valor-sello-container">
                    <label className="valor-sello-label">Monto a descontar (COP)</label>
                    <input 
                      type="text"
                      className="valor-sello-input"
                      placeholder="Ej: 50000"
                      value={montoMesera}
                      onChange={(e) => setMontoMesera(e.target.value)}
                    />
                  </div>

                  <button className="btn-agregar-mesera-modal" onClick={agregarMesera}>
                    <Plus size={16} /> Agregar a la lista
                  </button>
                </div>
              )}

              {/* Lista de meseras agregadas */}
              {meseras.length > 0 && (
                <div className="meseras-agregadas">
                  <h4>Meseras agregadas ({meseras.length})</h4>
                  <div className="lista-meseras-modal">
                    {meseras.map((mesera) => (
                      <div key={mesera.documento} className="mesera-item-modal">
                        {mesera.foto && (
                          <img src={mesera.foto} alt={mesera.nombre} className="mesera-foto-pequena" />
                        )}
                        <div className="mesera-info-modal">
                          <span className="nombre">{mesera.nombre}</span>
                          <span className="documento">{mesera.documento}</span>
                        </div>
                        <div className="mesera-monto-modal">{fmt(mesera.monto)}</div>
                        <button 
                          className="btn-eliminar-pequeno"
                          onClick={() => eliminarMesera(mesera.documento)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cerrar" onClick={cerrarModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de responsable (sellos) */}
      {modalResponsable && (
        <div className="modal-overlay" onClick={cerrarModalResponsable}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Sello</h3>
              <button className="btn-cerrar-modal" onClick={cerrarModalResponsable}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Información del responsable (empleado actual) */}
              <div className="mesera-encontrada">
                <div className="mesera-card">
                  {empleadoData?.foto || empleadoData?.photo_url ? (
                    <img 
                      src={empleadoData.foto || empleadoData.photo_url} 
                      alt={empleadoData.nombre || empleadoData.full_name} 
                      className="mesera-foto-grande" 
                    />
                  ) : (
                    <div className="mesera-foto-placeholder">
                      <Users size={32} />
                    </div>
                  )}
                  <div className="mesera-datos">
                    <div className="mesera-nombre-grande">{empleadoData?.nombre || empleadoData?.full_name || "Sin nombre"}</div>
                    <div className="mesera-documento-grande">CC: {empleadoData?.documento || empleadoData?.document_number || "N/A"}</div>
                    {empleadoData?.cargo && (
                      <div className="mesera-cargo">{empleadoData.cargo}</div>
                    )}
                    {empleadoData?.area_nombre && (
                      <div className="mesera-area">{empleadoData.area_nombre}</div>
                    )}
                  </div>
                </div>

                {/* Input para el número de sello */}
                <div className="valor-sello-container">
                  <label className="valor-sello-label">Número de sello</label>
                  <input 
                    type="text"
                    className="valor-sello-input"
                    placeholder="Ingresa el número de sello"
                    value={numeroSello}
                    onChange={(e) => setNumeroSello(e.target.value)}
                  />
                </div>

                {/* Input para el valor del sello */}
                <div className="valor-sello-container">
                  <label className="valor-sello-label">Valor del sello (COP)</label>
                  <input 
                    type="text"
                    className="valor-sello-input"
                    placeholder="Ej: 500000"
                    value={valorSello}
                    onChange={(e) => setValorSello(e.target.value)}
                  />
                </div>

                <button className="btn-agregar-mesera-modal" onClick={agregarSello}>
                  <Plus size={16} /> Agregar sello
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cerrar" onClick={cerrarModalResponsable}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de venta producto */}
      {modalVentaProducto && (
        <div className="modal-overlay" onClick={cerrarModalVentaProducto}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Venta de Producto</h3>
              <button className="btn-cerrar-modal" onClick={cerrarModalVentaProducto}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Buscador de empleado */}
              <div className="buscar-mesera">
                <div className="input-buscar-container">
                  <Search size={18} className="icon-search" />
                  <input
                    type="text"
                    className="input-buscar-mesera"
                    placeholder="Número de documento"
                    value={documentoVentaProducto}
                    onChange={(e) => setDocumentoVentaProducto(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarEmpleadoVentaProducto()}
                  />
                </div>
                <button 
                  className="btn-buscar-mesera"
                  onClick={buscarEmpleadoVentaProducto}
                  disabled={buscandoEmpleadoVenta}
                >
                  {buscandoEmpleadoVenta ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {/* Error de búsqueda */}
              {errorVentaProducto && (
                <div className="error-busqueda">
                  <AlertTriangle size={16} />
                  {errorVentaProducto}
                </div>
              )}

              {/* Empleado encontrado */}
              {empleadoVentaProducto && (
                <div className="mesera-encontrada">
                  <div className="mesera-card">
                    {empleadoVentaProducto.foto ? (
                      <img 
                        src={empleadoVentaProducto.foto} 
                        alt={empleadoVentaProducto.nombre} 
                        className="mesera-foto-grande" 
                      />
                    ) : (
                      <div className="mesera-foto-placeholder">
                        <Users size={32} />
                      </div>
                    )}
                    <div className="mesera-datos">
                      <div className="mesera-nombre-grande">{empleadoVentaProducto.nombre}</div>
                      <div className="mesera-documento-grande">CC: {empleadoVentaProducto.documento}</div>
                      {empleadoVentaProducto.cargo && (
                        <div className="mesera-cargo">{empleadoVentaProducto.cargo}</div>
                      )}
                      {empleadoVentaProducto.area && (
                        <div className="mesera-area">{empleadoVentaProducto.area}</div>
                      )}
                    </div>
                  </div>

                  {/* Inputs para concepto y valor */}
                  <div className="valor-sello-container">
                    <label className="valor-sello-label">Concepto</label>
                    <input 
                      type="text"
                      className="valor-sello-input"
                      placeholder="Descripción del producto/servicio"
                      value={conceptoVentaProducto}
                      onChange={(e) => setConceptoVentaProducto(e.target.value)}
                    />
                  </div>

                  <div className="valor-sello-container">
                    <label className="valor-sello-label">Valor (COP)</label>
                    <input 
                      type="text"
                      className="valor-sello-input"
                      placeholder="Ej: 50000"
                      value={valorVentaProducto}
                      onChange={(e) => setValorVentaProducto(e.target.value)}
                    />
                  </div>

                  <button className="btn-agregar-mesera-modal" onClick={agregarVentaProducto}>
                    <Plus size={16} /> Agregar venta
                  </button>
                </div>
              )}

              {/* Lista de ventas agregadas en modal */}
              {ventasProductos.length > 0 && (
                <div className="meseras-agregadas">
                  <h4>Ventas agregadas ({ventasProductos.length})</h4>
                  <div className="lista-meseras-modal">
                    {ventasProductos.map((venta, i) => (
                      <div key={i} className="mesera-item-modal">
                        {venta.foto && (
                          <img src={venta.foto} alt={venta.nombre} className="mesera-foto-pequena" />
                        )}
                        <div className="mesera-info-modal">
                          <span className="nombre">{venta.nombre}</span>
                          <span className="documento">{venta.concepto}</span>
                        </div>
                        <div className="mesera-monto-modal">{fmt(venta.valor)}</div>
                        <button 
                          className="btn-eliminar-pequeno"
                          onClick={() => eliminarVentaProducto(i)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cerrar" onClick={cerrarModalVentaProducto}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
