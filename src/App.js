import { useState, useMemo, useEffect, useCallback } from "react";

// ── CREDENCIALES ─────────────────────────────────────────────────
const USUARIOS = [
  { usuario: "20.1821.180-0", clave: "odnoliub1234" },
  { usuario: "15.077.122-6", clave: "marley1234" },
];

// ── URL DEL BACKEND (Google Apps Script) ─────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbwACd4P_ByyuDn99sYgmdc_DddCfOsE2TLjwQFiWgb7OMXA3l963HwCUGNGDOxzzReL/exec";

// ── API HELPERS ──────────────────────────────────────────────────
async function cargarDatos() {
  try {
    const r = await fetch(API_URL);
    const json = await r.json();
    if (json.ok && json.data && json.data !== "{}") {
      return JSON.parse(json.data);
    }
  } catch (e) { console.error("Error cargando:", e); }
  return null;
}

async function guardarDatos(datos) {
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(datos),
    });
  } catch (e) { console.error("Error guardando:", e); }
}

// ── DATOS INICIALES ──────────────────────────────────────────────
const CLINICAS_INICIALES = [
  { id: 1, nombre: "MAODENTAL", localidad: "Villarrica", doctor: "Maria Jose Muñoz Ortega", telefono: "569 7979 4140", direccion: "Pedro Montt N° 774", email: "", estado: "CLIENTE" },
  { id: 2, nombre: "LOS NOTROS", localidad: "Villarrica", doctor: "Sebastian Robles", telefono: "569 51230389", direccion: "Saturnino Epulef N° 899", email: "", estado: "CLIENTE" },
  { id: 3, nombre: "VIDADENTAL", localidad: "Villarrica", doctor: "Mariajose Olivares", telefono: "569 45889855", direccion: "Segunda Faja N° 805, Local 1", email: "", estado: "CLIENTE" },
  { id: 4, nombre: "CABRAPAN DENTAL", localidad: "Villarrica", doctor: "Yerti Cabrapan G", telefono: "569 96433456", direccion: "Edificio Pehuen", email: "", estado: "CLIENTE" },
  { id: 5, nombre: "CLINICA SAN CLEMENTE", localidad: "Panguipulli", doctor: "Diego Fuentes", telefono: "", direccion: "", email: "", estado: "CLIENTE" },
  { id: 6, nombre: "CLINICA ARAUCANIA", localidad: "Villarrica", doctor: "Cristobal Pereira", telefono: "", direccion: "", email: "", estado: "PROSPECTO" },
  { id: 7, nombre: "CLINICA KUTRALKO", localidad: "Villarrica", doctor: "Alarcon", telefono: "", direccion: "", email: "", estado: "CLIENTE" },
  { id: 8, nombre: "CLINICA DENTALIZ", localidad: "Villarrica", doctor: "Licet Salazar", telefono: "", direccion: "", email: "", estado: "CLIENTE" },
];

const TRABAJOS_INICIALES = [
  { id: 1, mes: "2026-03", localidad: "Villarrica", area: "Ortodoncia", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Antonella Martinez", tipo: "HYRAX", cantidad: 1, valor: 60000, observaciones: "No le cobramos las bandas", estado_pago: "PAGADO", nro_factura: "2", fecha_ingreso: "2026-03-06", fecha_entrega: "2026-03-08" },
  { id: 2, mes: "2026-03", localidad: "Villarrica", area: "Removible", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Catalina Lopez", tipo: "ESTAMPADO", cantidad: 1, valor: 35000, observaciones: "", estado_pago: "PAGADO", nro_factura: "2", fecha_ingreso: "2026-03-06", fecha_entrega: "2026-03-08" },
  { id: 3, mes: "2026-03", localidad: "Villarrica", area: "Ortodoncia", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Amanda Sepulveda", tipo: "HYRAX", cantidad: 1, valor: 60000, observaciones: "No le cobramos las bandas", estado_pago: "PAGADO", nro_factura: "2", fecha_ingreso: "2026-03-12", fecha_entrega: "2026-03-16" },
  { id: 4, mes: "2026-03", localidad: "Villarrica", area: "Removible", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Patricia Muñoz", tipo: "ESTAMPADO", cantidad: 1, valor: 35000, observaciones: "", estado_pago: "PAGADO", nro_factura: "15", fecha_ingreso: "2026-03-23", fecha_entrega: "2026-03-26" },
  { id: 5, mes: "2026-03", localidad: "Villarrica", area: "Ortodoncia", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Dominic Vargas", tipo: "HYRAX", cantidad: 1, valor: 65000, observaciones: "Se cobran 2 bandas", estado_pago: "PAGADO", nro_factura: "15", fecha_ingreso: "2026-03-25", fecha_entrega: "2026-03-30" },
  { id: 6, mes: "2026-03", localidad: "Villarrica", area: "Ortodoncia", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Daniel Ortega", tipo: "DISYUNTOR VAMER", cantidad: 1, valor: 58000, observaciones: "", estado_pago: "PAGADO", nro_factura: "15", fecha_ingreso: "2026-03-25", fecha_entrega: "2026-03-30" },
  { id: 7, mes: "2026-04", localidad: "Villarrica", area: "Fija", clinica: "LOS NOTROS", doctor: "Sebastian Robles", paciente: "-", tipo: "PROTESIS FIJA DE ZIRCONIO SOBRE CERAMICA", cantidad: 1, valor: 54000, observaciones: "Se lo enviamos al Victor (PAGADO)", estado_pago: "PAGADO", nro_factura: "16", fecha_ingreso: "2026-04-10", fecha_entrega: "2026-04-15" },
  { id: 8, mes: "2026-04", localidad: "Villarrica", area: "Removible", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Katherine Maldonado", tipo: "ESTAMPADO", cantidad: 1, valor: 35000, observaciones: "", estado_pago: "PAGADO", nro_factura: "17", fecha_ingreso: "2026-04-15", fecha_entrega: "2026-04-16" },
  { id: 9, mes: "2026-04", localidad: "Villarrica", area: "Removible", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Catalina Segura", tipo: "ESTAMPADO", cantidad: 1, valor: 40000, observaciones: "5.000 extra por envio archivo SLT", estado_pago: "PAGADO", nro_factura: "17", fecha_ingreso: "2026-04-15", fecha_entrega: "2026-04-16" },
  { id: 10, mes: "2026-05", localidad: "Villarrica", area: "Plano", clinica: "CABRAPAN DENTAL", doctor: "Yerti Cabrapan G", paciente: "-", tipo: "PLANO DE RELAJACION", cantidad: 1, valor: 25000, observaciones: "Esta incluido el descuento", estado_pago: "PAGADO", nro_factura: "19", fecha_ingreso: "2026-05-01", fecha_entrega: "2026-05-04" },
  { id: 11, mes: "2026-05", localidad: "Villarrica", area: "Removible", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Catalina Vega", tipo: "ESTAMPADO", cantidad: 1, valor: 40000, observaciones: "", estado_pago: "FACTURADO", nro_factura: "20", fecha_ingreso: "2026-05-04", fecha_entrega: "2026-05-11" },
  { id: 12, mes: "2026-05", localidad: "Villarrica", area: "Ortodoncia", clinica: "VIDADENTAL", doctor: "Mariajose Olivares", paciente: "-", tipo: "HYRAX", cantidad: 1, valor: 35000, observaciones: "", estado_pago: "NO FACTURADO", nro_factura: "", fecha_ingreso: "2026-05-11", fecha_entrega: "2026-05-12" },
  { id: 13, mes: "2026-05", localidad: "Villarrica", area: "Fija", clinica: "LOS NOTROS", doctor: "Sebastian Robles", paciente: "Isaias Caniulef", tipo: "PFU DE ZIRCONIO", cantidad: 1, valor: 108000, observaciones: "VICTOR cobro 70.000.- (pagado)", estado_pago: "FACTURADO", nro_factura: "22", fecha_ingreso: "2026-05-19", fecha_entrega: "2026-05-29" },
  { id: 14, mes: "2026-05", localidad: "Villarrica", area: "Fija", clinica: "LOS NOTROS", doctor: "Sebastian Robles", paciente: "Jose Alejandro Vera Sanhueza", tipo: "PFU METAL-CERAMICA", cantidad: 1, valor: 61000, observaciones: "VICTOR cobro 45.000.- (pagado)", estado_pago: "FACTURADO", nro_factura: "22", fecha_ingreso: "2026-05-20", fecha_entrega: "2026-05-29" },
  { id: 15, mes: "2026-05", localidad: "Villarrica", area: "Fija", clinica: "LOS NOTROS", doctor: "Sebastian Robles", paciente: "Victor Araneda Ruiz", tipo: "PFU METAL-CERAMICA", cantidad: 1, valor: 61000, observaciones: "VICTOR cobro 45.000.- (pagado)", estado_pago: "FACTURADO", nro_factura: "22", fecha_ingreso: "2026-05-20", fecha_entrega: "2026-05-29" },
  { id: 16, mes: "2026-05", localidad: "Villarrica", area: "Fija", clinica: "VIDADENTAL", doctor: "Mariajose Olivares", paciente: "Lorena Beltran", tipo: "PFU DISILICATO", cantidad: 1, valor: 100000, observaciones: "JHON (55.000) pagado", estado_pago: "NO FACTURADO", nro_factura: "", fecha_ingreso: "2026-05-26", fecha_entrega: "" },
  { id: 17, mes: "2026-05", localidad: "Villarrica", area: "Removible", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "Felipe", tipo: "ESTAMPADO", cantidad: 1, valor: 40000, observaciones: "5.000 extra, archivo stl.", estado_pago: "FACTURADO", nro_factura: "20", fecha_ingreso: "2026-05-26", fecha_entrega: "2026-05-28" },
  { id: 18, mes: "2026-05", localidad: "Villarrica", area: "Fija", clinica: "CLINICA ARAUCANIA", doctor: "Cristobal Pereira", paciente: "Diego Rios", tipo: "INCRUSTACION", cantidad: 1, valor: 43000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-28", fecha_entrega: "" },
  { id: 19, mes: "2026-05", localidad: "Panguipulli", area: "Ortodoncia", clinica: "CLINICA SAN CLEMENTE", doctor: "Diego Fuentes", paciente: "Oscar Muñoz", tipo: "MCNAMARA", cantidad: 1, valor: 60000, observaciones: "No se cobran los modelos.", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-28", fecha_entrega: "" },
  { id: 20, mes: "2026-05", localidad: "Panguipulli", area: "Ortodoncia", clinica: "CLINICA SAN CLEMENTE", doctor: "Diego Fuentes", paciente: "Martin Viveres", tipo: "HYRAX", cantidad: 1, valor: 60000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-28", fecha_entrega: "" },
  { id: 21, mes: "2026-05", localidad: "Panguipulli", area: "Ortodoncia", clinica: "CLINICA SAN CLEMENTE", doctor: "Diego Fuentes", paciente: "Joaquin Bustos", tipo: "MCNAMARA", cantidad: 1, valor: 60000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-28", fecha_entrega: "" },
  { id: 22, mes: "2026-05", localidad: "Villarrica", area: "Removible", clinica: "CLINICA KUTRALKO", doctor: "Alarcon", paciente: "Gladys Cifuentes", tipo: "RODETES PARA PROTESIS", cantidad: 1, valor: 65000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-29", fecha_entrega: "" },
  { id: 23, mes: "2026-05", localidad: "Villarrica", area: "Removible", clinica: "CLINICA KUTRALKO", doctor: "Alarcon", paciente: "Luis Gralt", tipo: "RODETES PARA PROTESIS", cantidad: 1, valor: 65000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-29", fecha_entrega: "" },
  { id: 24, mes: "2026-05", localidad: "Villarrica", area: "Fija", clinica: "CLINICA DENTALIZ", doctor: "Licet Salazar", paciente: "Glenda Henriquez", tipo: "INCRUSTACION", cantidad: 1, valor: 43000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-29", fecha_entrega: "" },
  { id: 25, mes: "2026-05", localidad: "Villarrica", area: "Ortodoncia", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "-", tipo: "HYRAX", cantidad: 1, valor: 60000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-30", fecha_entrega: "" },
  { id: 26, mes: "2026-05", localidad: "Villarrica", area: "Ortodoncia", clinica: "MAODENTAL", doctor: "Maria Jose Muñoz Ortega", paciente: "-", tipo: "HYRAX", cantidad: 1, valor: 60000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-30", fecha_entrega: "" },
];

const GASTOS_INICIALES = [
  { id: 1, mes: "2026-03", categoria: "Insumos", descripcion: "ALCOHOL ISOPROPILICO", medida: "LTS", cantidad: 2, valor_unit: 4500, valor_total: 9000, proveedor: "", observaciones: "" },
  { id: 2, mes: "2026-03", categoria: "Insumos", descripcion: "TORNILLO HYRAX", medida: "UN", cantidad: 3, valor_unit: 8000, valor_total: 24000, proveedor: "", observaciones: "" },
  { id: 3, mes: "2026-03", categoria: "Insumos", descripcion: "LAMINA DE ACETATO", medida: "UN", cantidad: 2, valor_unit: 3500, valor_total: 7000, proveedor: "", observaciones: "" },
  { id: 4, mes: "2026-03", categoria: "Insumos", descripcion: "TORNILLO ESQUELETICO", medida: "UN", cantidad: 1, valor_unit: 9000, valor_total: 9000, proveedor: "", observaciones: "" },
  { id: 5, mes: "2026-04", categoria: "Insumos", descripcion: "LAMINA DE ACETATO", medida: "UN", cantidad: 2, valor_unit: 3500, valor_total: 7000, proveedor: "", observaciones: "" },
];

const INVENTARIO_INICIAL = [
  { id: 1, categoria: "Ortodoncia", descripcion: "ALCOHOL ISOPROPILICO", medida: "LTS", cantidad: 2, cantidad_minima: 1, observaciones: "" },
  { id: 2, categoria: "Ortodoncia", descripcion: "TORNILLO HYRAX", medida: "UN", cantidad: 1, cantidad_minima: 3, observaciones: "" },
  { id: 3, categoria: "Ortodoncia", descripcion: "LAMINAS DE ACETATO 2.0", medida: "UN", cantidad: 18, cantidad_minima: 5, observaciones: "" },
  { id: 4, categoria: "Ortodoncia", descripcion: "TORNILLOS MORELLI 9", medida: "UN", cantidad: 10, cantidad_minima: 5, observaciones: "" },
  { id: 5, categoria: "Ortodoncia", descripcion: "TORNILLOS MORELLI 11", medida: "UN", cantidad: 10, cantidad_minima: 5, observaciones: "" },
  { id: 6, categoria: "Ortodoncia", descripcion: "TUBOS DE ORTODONCIA", medida: "UN", cantidad: 100, cantidad_minima: 20, observaciones: "" },
  { id: 7, categoria: "Ortodoncia", descripcion: "BANDAS 37", medida: "UN", cantidad: 20, cantidad_minima: 10, observaciones: "" },
  { id: 8, categoria: "Ortodoncia", descripcion: "BANDAS 38", medida: "UN", cantidad: 20, cantidad_minima: 10, observaciones: "" },
  { id: 9, categoria: "Ortodoncia", descripcion: "RETENDORES DE BOLITA", medida: "UN", cantidad: 25, cantidad_minima: 10, observaciones: "" },
  { id: 10, categoria: "Ortodoncia", descripcion: "TORNILLO DE EXPANSION", medida: "UN", cantidad: 12, cantidad_minima: 5, observaciones: "" },
  { id: 11, categoria: "Acrílicos", descripcion: "ACRILICO ROSADO JDO VRX (TERMO)", medida: "KG", cantidad: 1, cantidad_minima: 1, observaciones: "" },
  { id: 12, categoria: "Acrílicos", descripcion: "MONOMERO (TERMO)", medida: "LTS", cantidad: 1, cantidad_minima: 1, observaciones: "" },
  { id: 13, categoria: "Removible", descripcion: "LAMINAS DE CERA ROSADAS", medida: "CAJA", cantidad: 6, cantidad_minima: 2, observaciones: "" },
  { id: 14, categoria: "Removible", descripcion: "ALGINATOS", medida: "UN", cantidad: 2, cantidad_minima: 2, observaciones: "" },
  { id: 15, categoria: "Impresión 3D", descripcion: "RESINA DE MODELO", medida: "UN", cantidad: 3, cantidad_minima: 1, observaciones: "" },
  { id: 16, categoria: "Impresión 3D", descripcion: "ALCOHOL ISOPROPILICO", medida: "LTS", cantidad: 6, cantidad_minima: 2, observaciones: "" },
  { id: 17, categoria: "Maquinaria", descripcion: "IMPRESORA 3D ELEGOO", medida: "UN", cantidad: 1, cantidad_minima: 1, observaciones: "" },
  { id: 18, categoria: "Maquinaria", descripcion: "SCANNER", medida: "UN", cantidad: 1, cantidad_minima: 1, observaciones: "" },
];

const MESES = [
  { value: "2026-01", label: "Enero 2026" }, { value: "2026-02", label: "Febrero 2026" },
  { value: "2026-03", label: "Marzo 2026" }, { value: "2026-04", label: "Abril 2026" },
  { value: "2026-05", label: "Mayo 2026" }, { value: "2026-06", label: "Junio 2026" },
  { value: "2026-07", label: "Julio 2026" }, { value: "2026-08", label: "Agosto 2026" },
  { value: "2026-09", label: "Septiembre 2026" }, { value: "2026-10", label: "Octubre 2026" },
  { value: "2026-11", label: "Noviembre 2026" }, { value: "2026-12", label: "Diciembre 2026" },
];
const AREAS = ["Ortodoncia", "Removible", "Fija", "Plano", "Implante", "Otro"];
const ESTADOS_PAGO = ["PAGADO", "FACTURADO", "NO FACTURADO", "EN PROCESO", "PENDIENTE"];
const CATS_GASTO = ["Insumos", "Servicios", "Arriendo", "Transporte", "Maquinaria", "Otro"];
const CATS_INV = ["Ortodoncia", "Acrílicos", "Removible", "Impresión 3D", "Maquinaria", "General"];

const fmt = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
const mesLabel = (v) => MESES.find(m => m.value === v)?.label || v;

const PILL = {
  "PAGADO": "bg-em-hi text-em-lo border-em-mid",
  "FACTURADO": "bg-sky-hi text-sky-lo border-sky-mid",
  "NO FACTURADO": "bg-ro-hi text-ro-lo border-ro-mid",
  "EN PROCESO": "bg-am-hi text-am-lo border-am-mid",
  "PENDIENTE": "bg-zn-hi text-zn-lo border-zn-mid",
};
const PILL_CLASS = {
  "PAGADO": "pill-pagado",
  "FACTURADO": "pill-fact",
  "NO FACTURADO": "pill-nofact",
  "EN PROCESO": "pill-proc",
  "PENDIENTE": "pill-pend",
};

const emptyT = { mes: "2026-06", localidad: "Villarrica", area: "Ortodoncia", clinica: "", doctor: "", paciente: "", tipo: "", cantidad: 1, valor: "", observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "", fecha_entrega: "" };
const emptyG = { mes: "2026-06", categoria: "Insumos", descripcion: "", medida: "UN", cantidad: 1, valor_unit: "", valor_total: "", proveedor: "", observaciones: "" };
const emptyI = { categoria: "Ortodoncia", descripcion: "", medida: "UN", cantidad: 0, cantidad_minima: 1, observaciones: "" };

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [ready, setReady] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [trabajos, setTrabajos] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [capitalBase, setCapitalBase] = useState(1000000);

  const [filtroMes, setFiltroMes] = useState("2026-05");
  const [busqueda, setBusqueda] = useState("");
  const [filtroInvCat, setFiltroInvCat] = useState("Todas");
  const [facturas, setFacturas] = useState([]);
  const [showFormF, setShowFormF] = useState(false);
  const [editandoF, setEditandoF] = useState(null);
  const [formF, setFormF] = useState({ mes:"2026-06", tipo:"venta", nro_factura:"", fecha:"", monto:"", quien:"", estado:"PENDIENTE", link:"", observaciones:"" });
  const [filtroFactMes, setFiltroFactMes] = useState("2026-05");
  const [filtroFactTipo, setFiltroFactTipo] = useState("Todas");
  const [editandoCapital, setEditandoCapital] = useState(false);
  const [capitalInput, setCapitalInput] = useState("1000000");

  const [showFormT, setShowFormT] = useState(false); const [editandoT, setEditandoT] = useState(null); const [formT, setFormT] = useState(emptyT);
  const [showFormC, setShowFormC] = useState(false); const [formC, setFormC] = useState({ nombre: "", localidad: "Villarrica", doctor: "", telefono: "", direccion: "", email: "", estado: "PROSPECTO" });
  const [showFormG, setShowFormG] = useState(false); const [editandoG, setEditandoG] = useState(null); const [formG, setFormG] = useState(emptyG);
  const [showFormI, setShowFormI] = useState(false); const [editandoI, setEditandoI] = useState(null); const [formI, setFormI] = useState(emptyI);

  useEffect(() => {
    (async () => {
      const d = await cargarDatos();
      if (d) {
        setTrabajos(d.trabajos || TRABAJOS_INICIALES);
        setClinicas(d.clinicas || CLINICAS_INICIALES);
        setGastos(d.gastos || GASTOS_INICIALES);
        setInventario(d.inventario || INVENTARIO_INICIAL);
        if (d.capitalBase !== undefined) { setCapitalBase(d.capitalBase); setCapitalInput(String(d.capitalBase)); }
        setFacturas(d.facturas || []);
      } else {
        setTrabajos(TRABAJOS_INICIALES); setClinicas(CLINICAS_INICIALES);
        setGastos(GASTOS_INICIALES); setInventario(INVENTARIO_INICIAL);
      }
      setReady(true);
    })();
  }, []);

  const guardarTodo = useCallback(async (t, c, g, i, cap, f) => {
    setGuardando(true);
    await guardarDatos({ 
      trabajos: t, 
      clinicas: c, 
      gastos: g, 
      inventario: i, 
      capitalBase: cap !== undefined ? cap : capitalBase,
      facturas: f !== undefined ? f : facturas
    });
    setTimeout(() => setGuardando(false), 1200);
  }, [capitalBase, facturas]);

  const stats = useMemo(() => {
    const porMes = {};
    MESES.forEach(m => {
      const ts = trabajos.filter(t => t.mes === m.value);
      const gs = gastos.filter(g => g.mes === m.value);
      porMes[m.value] = {
        ingresos: ts.reduce((s, t) => s + Number(t.valor), 0),
        count: ts.length,
        pagado: ts.filter(t => ["PAGADO","FACTURADO"].includes(t.estado_pago)).reduce((s, t) => s + Number(t.valor), 0),
        pendiente: ts.filter(t => ["EN PROCESO","NO FACTURADO","PENDIENTE"].includes(t.estado_pago)).reduce((s, t) => s + Number(t.valor), 0),
        gastos: gs.reduce((s, g) => s + Number(g.valor_total || 0), 0),
      };
    });
    return { porMes, mesFiltrado: trabajos.filter(t => t.mes === filtroMes) };
  }, [trabajos, gastos, filtroMes]);

  const trabajosFiltrados = useMemo(() => trabajos.filter(t => t.mes === filtroMes).filter(t => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return [t.clinica, t.doctor, t.paciente, t.tipo, t.estado_pago].some(v => v?.toLowerCase().includes(q));
  }), [trabajos, filtroMes, busqueda]);

  const gastosFiltrados = useMemo(() => gastos.filter(g => g.mes === filtroMes), [gastos, filtroMes]);
  const invFiltrado = useMemo(() => inventario.filter(i => filtroInvCat === "Todas" || i.categoria === filtroInvCat), [inventario, filtroInvCat]);
  const stockBajo = useMemo(() => inventario.filter(i => i.cantidad <= i.cantidad_minima), [inventario]);

  const saveT = () => {
    let next = editandoT !== null ? trabajos.map(t => t.id === editandoT ? { ...formT, id: editandoT } : t) : [...trabajos, { ...formT, id: Math.max(0, ...trabajos.map(x => x.id)) + 1 }];
    setTrabajos(next); guardarTodo(next, clinicas, gastos, inventario);
    setShowFormT(false); setEditandoT(null); setFormT(emptyT);
  };
  const editT = (t) => { setFormT({ ...t }); setEditandoT(t.id); setShowFormT(true); };
  const delT = (id) => { if (!window.confirm("¿Eliminar?")) return; const next = trabajos.filter(t => t.id !== id); setTrabajos(next); guardarTodo(next, clinicas, gastos, inventario); };

  const saveC = () => {
    const next = [...clinicas, { ...formC, id: Math.max(0, ...clinicas.map(x => x.id)) + 1 }];
    setClinicas(next); guardarTodo(trabajos, next, gastos, inventario);
    setShowFormC(false); setFormC({ nombre: "", localidad: "Villarrica", doctor: "", telefono: "", direccion: "", email: "", estado: "PROSPECTO" });
  };

  const saveG = () => {
    const vt = formG.valor_total || (Number(formG.cantidad) * Number(formG.valor_unit));
    const g = { ...formG, valor_total: vt };
    let next = editandoG !== null ? gastos.map(x => x.id === editandoG ? { ...g, id: editandoG } : x) : [...gastos, { ...g, id: Math.max(0, ...gastos.map(x => x.id)) + 1 }];
    setGastos(next); guardarTodo(trabajos, clinicas, next, inventario);
    setShowFormG(false); setEditandoG(null); setFormG(emptyG);
  };
  const editG = (g) => { setFormG({ ...g }); setEditandoG(g.id); setShowFormG(true); };
  const delG = (id) => { if (!window.confirm("¿Eliminar?")) return; const next = gastos.filter(g => g.id !== id); setGastos(next); guardarTodo(trabajos, clinicas, next, inventario); };

  const saveI = () => {
    let next = editandoI !== null ? inventario.map(x => x.id === editandoI ? { ...formI, id: editandoI } : x) : [...inventario, { ...formI, id: Math.max(0, ...inventario.map(x => x.id)) + 1 }];
    setInventario(next); guardarTodo(trabajos, clinicas, gastos, next);
    setShowFormI(false); setEditandoI(null); setFormI(emptyI);
  };
  const editI = (i) => { setFormI({ ...i }); setEditandoI(i.id); setShowFormI(true); };
  const delI = (id) => { if (!window.confirm("¿Eliminar?")) return; const next = inventario.filter(i => i.id !== id); setInventario(next); guardarTodo(trabajos, clinicas, gastos, next); };
  const ajustar = (id, delta) => { const next = inventario.map(i => i.id === id ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i); setInventario(next); guardarTodo(trabajos, clinicas, gastos, next); };

  // ── HANDLERS FACTURAS ──
  const saveF = () => {
    let next = editandoF !== null ? facturas.map(x => x.id === editandoF ? { ...formF, id: editandoF } : x) : [...facturas, { ...formF, id: Math.max(0, ...facturas.map(x => x.id), 0) + 1 }];
    setFacturas(next); guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, next);
    setShowFormF(false); setEditandoF(null); setFormF({ mes:"2026-06", tipo:"venta", nro_factura:"", fecha:"", monto:"", quien:"", estado:"PENDIENTE", link:"", observaciones:"" });
  };
  const editF = (f) => { setFormF({ ...f }); setEditandoF(f.id); setShowFormF(true); };
  const delF = (id) => { if (!window.confirm("¿Eliminar?")) return; const next = facturas.filter(f => f.id !== id); setFacturas(next); guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, next); };

  const facturasFiltradas = facturas.filter(f => f.mes === filtroFactMes && (filtroFactTipo === "Todas" || f.tipo === filtroFactTipo));

  const mesActual = stats.porMes[filtroMes] || { ingresos: 0, count: 0, pagado: 0, pendiente: 0, gastos: 0 };

  // ── LOGIN ──
  const [logueado, setLogueado] = useState(() => sessionStorage.getItem("lab_auth") === "ok");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (USUARIOS.some(u => u.usuario === loginUser && u.clave === loginPass)) {
      sessionStorage.setItem("lab_auth", "ok");
      setLogueado(true);
      setLoginError("");
    } else {
      setLoginError("Usuario o contraseña incorrectos");
    }
  };

  if (!logueado) return (
    <div style={{ minHeight:"100vh", background:"#09090b", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"12px", padding:"40px", width:"100%", maxWidth:"360px" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontSize:"48px", marginBottom:"8px" }}>🦷</div>
          <h1 style={{ color:"#fff", fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, margin:0 }}>LAB. DENTAL</h1>
          <p style={{ color:"#52525b", fontSize:"12px", fontFamily:"monospace", marginTop:"4px" }}>Villarrica · 2026</p>
        </div>
        <div style={{ marginBottom:"16px" }}>
          <label style={{ display:"block", fontSize:"11px", color:"#71717a", marginBottom:"4px", fontFamily:"monospace" }}>Usuario</label>
          <input
            style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"10px 14px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"14px", boxSizing:"border-box" }}
            value={loginUser}
            onChange={e => setLoginUser(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="usuario"
          />
        </div>
        <div style={{ marginBottom:"24px" }}>
          <label style={{ display:"block", fontSize:"11px", color:"#71717a", marginBottom:"4px", fontFamily:"monospace" }}>Contraseña</label>
          <input
            type="password"
            style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"10px 14px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"14px", boxSizing:"border-box" }}
            value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="contraseña"
          />
        </div>
        {loginError && <p style={{ color:"#f87171", fontSize:"12px", fontFamily:"monospace", marginBottom:"16px", textAlign:"center" }}>{loginError}</p>}
        <button
          onClick={handleLogin}
          style={{ background:"#22d3ee", color:"#09090b", padding:"12px", borderRadius:"7px", fontWeight:700, fontSize:"14px", cursor:"pointer", border:"none", width:"100%", fontFamily:"monospace" }}
        >
          Entrar
        </button>
      </div>
    </div>
  );

  if (!ready) return (
    <div style={{ minHeight:"100vh", background:"#09090b", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" }}>
      <div style={{ fontSize:"48px" }}>🦷</div>
      <p style={{ color:"#71717a", fontFamily:"monospace", fontSize:"14px" }}>Cargando Lab Dental...</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#09090b", color:"#f4f4f5", fontFamily:"'Space Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; }
        .tf { font-family: 'Syne', sans-serif; }
        .card { background: #18181b; border: 1px solid #3f3f46; border-radius: 10px; }
        .inp { background: #27272a; border: 1px solid #52525b; border-radius: 6px; padding: 8px 12px; color: #f4f4f5; width: 100%; font-family: 'Space Mono', monospace; font-size: 13px; }
        .inp:focus { outline: none; border-color: #22d3ee; }
        .btn1 { background: #22d3ee; color: #09090b; padding: 9px 20px; border-radius: 7px; font-weight: 700; font-size: 13px; cursor: pointer; border: none; font-family: 'Space Mono', monospace; }
        .btn1:hover { background: #67e8f9; }
        .btng { background: transparent; border: 1px solid #52525b; color: #a1a1aa; padding: 9px 20px; border-radius: 7px; font-size: 13px; cursor: pointer; font-family: 'Space Mono', monospace; }
        .btng:hover { border-color: #a1a1aa; color: #f4f4f5; }
        .bsm { padding: 5px 10px; font-size: 12px; border-radius: 5px; cursor: pointer; border: 1px solid #52525b; background: transparent; color: #a1a1aa; font-family: 'Space Mono', monospace; }
        .bsm:hover { color: #f4f4f5; }
        .tab { padding: 12px 16px; font-size: 12px; cursor: pointer; border: none; background: transparent; color: #71717a; border-bottom: 2px solid transparent; white-space: nowrap; font-family: 'Space Mono', monospace; }
        .tab.on { color: #22d3ee; border-bottom-color: #22d3ee; }
        .tab:hover { color: #e4e4e7; }
        .lbl { font-size: 11px; color: #71717a; display: block; margin-bottom: 4px; }
        .bar { border-radius: 4px; transition: height 0.4s; }
        .pill { font-size: 11px; padding: 2px 8px; border-radius: 20px; border: 1px solid; display: inline-block; }
        .pill-pagado { background: rgba(6,78,59,0.5); color: #6ee7b7; border-color: #065f46; }
        .pill-fact { background: rgba(12,74,110,0.5); color: #7dd3fc; border-color: #0c4a6e; }
        .pill-nofact { background: rgba(127,29,29,0.5); color: #fca5a5; border-color: #7f1d1d; }
        .pill-proc { background: rgba(120,53,15,0.5); color: #fcd34d; border-color: #78350f; }
        .pill-pend { background: rgba(39,39,42,0.5); color: #a1a1aa; border-color: #3f3f46; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 16px; }
        .modal { background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 24px; }
        .saving { position: fixed; bottom: 20px; right: 20px; background: #052e16; border: 1px solid #166534; color: #4ade80; padding: 8px 16px; border-radius: 8px; font-size: 12px; z-index: 9999; font-family: 'Space Mono', monospace; }
        select.inp option { background: #27272a; }
        @media (max-width: 640px) { .hide-sm { display: none; } }
      `}</style>

      {guardando && <div className="saving">💾 Guardando...</div>}

      {/* HEADER */}
      <div style={{ borderBottom:"1px solid #27272a", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 className="tf" style={{ fontSize:"18px", fontWeight:800, color:"#fff" }}>🦷 LAB. DENTAL</h1>
          <p style={{ fontSize:"11px", color:"#52525b" }}>Villarrica · 2026</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:"11px", color:"#52525b" }}>Álvaro Jofre K.</p>
          {stockBajo.length > 0 && <p style={{ fontSize:"11px", color:"#f59e0b", fontWeight:700 }}>⚠ {stockBajo.length} stock bajo</p>}
        </div>
      </div>

      {/* TABS */}
      <div style={{ borderBottom:"1px solid #27272a", display:"flex", overflowX:"auto" }} className="scrollbar-hide">
        {[["dashboard","📊 Resumen"],["capital","💰 Capital"],["trabajos","🔧 Trabajos"],["gastos","💸 Gastos"],["inventario","📦 Inventario"],["clinicas","🏥 Clínicas"],["facturas","🧾 Facturas"]].map(([k,l]) => (
          <button key={k} className={`tab ${tab===k?"on":""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div style={{ padding:"16px", maxWidth:"900px", margin:"0 auto" }}>

        {/* ════ DASHBOARD ════ */}
        {tab === "dashboard" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <label className="lbl" style={{ marginBottom:0 }}>Mes:</label>
              <select className="inp" style={{ width:"180px" }} value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
                {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              {[
                { l:"Ingresos", v:fmt(mesActual.ingresos), c:"#22d3ee" },
                { l:"Gastos", v:fmt(mesActual.gastos), c:"#f87171" },
                { l:"Resultado neto", v:fmt(mesActual.ingresos-mesActual.gastos), c: mesActual.ingresos-mesActual.gastos>=0?"#4ade80":"#f87171" },
                { l:"Trabajos", v:mesActual.count, c:"#fff" },
              ].map(k => (
                <div key={k.l} className="card" style={{ padding:"16px" }}>
                  <p className="lbl">{k.l}</p>
                  <p style={{ fontSize:"16px", fontWeight:700, color:k.c }}>{k.v}</p>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding:"16px" }}>
              <p className="tf lbl" style={{ fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"16px" }}>Ingresos vs Gastos 2026</p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:"110px" }}>
                {MESES.slice(0,6).map(m => {
                  const d = stats.porMes[m.value]||{ingresos:0,gastos:0};
                  const mx = Math.max(...MESES.slice(0,6).map(mm => Math.max((stats.porMes[mm.value]||{}).ingresos||0,(stats.porMes[mm.value]||{}).gastos||0)),1);
                  return (
                    <div key={m.value} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                      <div style={{ width:"100%", display:"flex", alignItems:"flex-end", justifyContent:"center", gap:"2px", height:"88px" }}>
                        <div className="bar" style={{ flex:1, background: m.value===filtroMes?"#22d3ee":"#164e63", height:`${Math.round(d.ingresos/mx*88)}%`, minHeight:d.ingresos>0?"3px":"0" }}/>
                        <div className="bar" style={{ flex:1, background:"#7f1d1d", height:`${Math.round(d.gastos/mx*88)}%`, minHeight:d.gastos>0?"3px":"0" }}/>
                      </div>
                      <p style={{ fontSize:"9px", color:"#52525b" }}>{m.label.slice(0,3)}</p>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:"16px", marginTop:"8px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"4px" }}><div style={{ width:"8px", height:"8px", borderRadius:"2px", background:"#22d3ee" }}/><span style={{ fontSize:"11px", color:"#71717a" }}>Ingresos</span></div>
                <div style={{ display:"flex", alignItems:"center", gap:"4px" }}><div style={{ width:"8px", height:"8px", borderRadius:"2px", background:"#7f1d1d" }}/><span style={{ fontSize:"11px", color:"#71717a" }}>Gastos</span></div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div className="card" style={{ padding:"16px" }}><p className="lbl">Cobrado/Facturado</p><p style={{ fontSize:"15px", fontWeight:700, color:"#4ade80" }}>{fmt(mesActual.pagado)}</p></div>
              <div className="card" style={{ padding:"16px" }}><p className="lbl">Pendiente de cobro</p><p style={{ fontSize:"15px", fontWeight:700, color:"#f59e0b" }}>{fmt(mesActual.pendiente)}</p></div>
            </div>

            {stockBajo.length > 0 && (
              <div className="card" style={{ padding:"16px", borderColor:"#92400e" }}>
                <p className="tf lbl" style={{ color:"#f59e0b", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>⚠ Stock bajo o agotado</p>
                {stockBajo.slice(0,4).map(i => (
                  <div key={i.id} style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", padding:"3px 0" }}>
                    <span style={{ color:"#d4d4d8" }}>{i.descripcion}</span>
                    <span style={{ color: i.cantidad===0?"#f87171":"#f59e0b", fontWeight:700 }}>{i.cantidad} {i.medida}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="card" style={{ padding:"16px" }}>
              <p className="tf lbl" style={{ fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>Top clínicas · {mesLabel(filtroMes)}</p>
              {(() => {
                const cl={};
                stats.mesFiltrado.forEach(t=>{cl[t.clinica]=(cl[t.clinica]||0)+Number(t.valor);});
                return Object.entries(cl).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([c,v])=>(
                  <div key={c} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #27272a", fontSize:"12px" }}>
                    <span style={{ color:"#d4d4d8" }}>{c}</span>
                    <span style={{ color:"#4ade80", fontWeight:700 }}>{fmt(v)}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* ════ CAPITAL ════ */}
        {tab === "capital" && (() => {
          const cobrado = trabajos.filter(t=>["PAGADO","FACTURADO"].includes(t.estado_pago)).reduce((s,t)=>s+Number(t.valor),0);
          const gastado = gastos.reduce((s,g)=>s+Number(g.valor_total||0),0);
          const pendiente = trabajos.filter(t=>["EN PROCESO","NO FACTURADO","PENDIENTE"].includes(t.estado_pago)).reduce((s,t)=>s+Number(t.valor),0);
          const capitalActual = capitalBase + cobrado - gastado;
          const capitalProyectado = capitalActual + pendiente;
          const areaIng={};
          trabajos.filter(t=>["PAGADO","FACTURADO"].includes(t.estado_pago)).forEach(t=>{areaIng[t.area]=(areaIng[t.area]||0)+Number(t.valor);});
          const totalAreaIng=Object.values(areaIng).reduce((s,v)=>s+v,0)||1;
          const catGastos={};
          gastos.forEach(g=>{catGastos[g.categoria]=(catGastos[g.categoria]||0)+Number(g.valor_total||0);});
          const totalCatG=Object.values(catGastos).reduce((s,v)=>s+v,0)||1;
          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div className="card" style={{ padding:"20px", borderColor:"#92400e", background:"#1c1408" }}>
                <p className="tf lbl" style={{ color:"#f59e0b", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>💰 Capital en Efectivo</p>
                <p style={{ fontSize:"11px", color:"#52525b", marginBottom:"16px" }}>Dinero al contado · sin trabajos no cobrados</p>
                {editandoCapital ? (
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                    <input type="number" className="inp" style={{ width:"180px", fontSize:"18px", fontWeight:700 }} value={capitalInput} onChange={e=>setCapitalInput(e.target.value)} autoFocus />
                    <button className="btn1" onClick={()=>{ const v=Number(capitalInput)||0; setCapitalBase(v); setEditandoCapital(false); guardarTodo(trabajos,clinicas,gastos,inventario,v); }}>Guardar</button>
                    <button className="btng" onClick={()=>setEditandoCapital(false)}>✕</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <p style={{ fontSize:"32px", fontWeight:700, color:"#fbbf24" }}>{fmt(capitalBase)}</p>
                    <button className="bsm" onClick={()=>{setCapitalInput(String(capitalBase));setEditandoCapital(true);}}>✏️ Editar</button>
                  </div>
                )}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                {[
                  { l:"Capital actual (cobrado)", v:fmt(capitalActual), c:"#4ade80", sub:"Base + cobrado − gastos", bc:"#14532d" },
                  { l:"Capital proyectado", v:fmt(capitalProyectado), c:"#60a5fa", sub:"Incluyendo pendientes", bc:"#1e3a5f" },
                  { l:"Total cobrado", v:fmt(cobrado), c:"#22d3ee", sub:"Desde inicio", bc:"" },
                  { l:"Total gastado", v:fmt(gastado), c:"#f87171", sub:"Desde inicio", bc:"" },
                  { l:"Por cobrar", v:fmt(pendiente), c:"#f59e0b", sub:"Trabajos pendientes", bc:"" },
                  { l:"Rentabilidad neta", v:fmt(cobrado-gastado), c:cobrado-gastado>=0?"#4ade80":"#f87171", sub:"Ingresos − Gastos", bc:"" },
                ].map(k => (
                  <div key={k.l} className="card" style={{ padding:"16px", borderColor:k.bc||"#3f3f46" }}>
                    <p className="lbl">{k.l}</p>
                    <p style={{ fontSize:"16px", fontWeight:700, color:k.c }}>{k.v}</p>
                    <p style={{ fontSize:"10px", color:"#52525b", marginTop:"2px" }}>{k.sub}</p>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding:"16px" }}>
                <p className="tf lbl" style={{ fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>Ingresos cobrados por área</p>
                {Object.entries(areaIng).sort((a,b)=>b[1]-a[1]).map(([area,val])=>(
                  <div key={area} style={{ marginBottom:"10px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", marginBottom:"4px" }}>
                      <span style={{ color:"#d4d4d8" }}>{area}</span>
                      <span style={{ color:"#4ade80", fontWeight:700 }}>{fmt(val)} <span style={{ color:"#52525b", fontWeight:400 }}>({Math.round(val/totalAreaIng*100)}%)</span></span>
                    </div>
                    <div style={{ background:"#27272a", borderRadius:"99px", height:"6px" }}>
                      <div style={{ background:"#22c55e", height:"6px", borderRadius:"99px", width:`${val/totalAreaIng*100}%` }}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding:"16px" }}>
                <p className="tf lbl" style={{ fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>Gastos por categoría</p>
                {Object.entries(catGastos).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>(
                  <div key={cat} style={{ marginBottom:"10px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", marginBottom:"4px" }}>
                      <span style={{ color:"#d4d4d8" }}>{cat}</span>
                      <span style={{ color:"#f87171", fontWeight:700 }}>{fmt(val)} <span style={{ color:"#52525b", fontWeight:400 }}>({Math.round(val/totalCatG*100)}%)</span></span>
                    </div>
                    <div style={{ background:"#27272a", borderRadius:"99px", height:"6px" }}>
                      <div style={{ background:"#ef4444", height:"6px", borderRadius:"99px", width:`${val/totalCatG*100}%` }}/>
                    </div>
                  </div>
                ))}
                {Object.keys(catGastos).length===0 && <p style={{ fontSize:"12px", color:"#52525b" }}>Sin gastos registrados</p>}
              </div>
            </div>
          );
        })()}

        {/* ════ TRABAJOS ════ */}
        {tab === "trabajos" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"space-between" }}>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                <select className="inp" style={{ width:"160px" }} value={filtroMes} onChange={e=>setFiltroMes(e.target.value)}>{MESES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select>
                <input className="inp" style={{ width:"160px" }} placeholder="Buscar..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
              </div>
              <button className="btn1" onClick={()=>{setFormT({...emptyT,mes:filtroMes});setEditandoT(null);setShowFormT(true);}}>+ Trabajo</button>
            </div>
            <div className="card" style={{ padding:"10px 16px", display:"flex", flexWrap:"wrap", gap:"12px", fontSize:"12px" }}>
              <span style={{ color:"#71717a" }}>{trabajosFiltrados.length} trabajos</span>
              <span style={{ color:"#22d3ee", fontWeight:700 }}>{fmt(trabajosFiltrados.reduce((s,t)=>s+Number(t.valor),0))}</span>
              <span style={{ color:"#4ade80" }}>{trabajosFiltrados.filter(t=>["PAGADO","FACTURADO"].includes(t.estado_pago)).length} cobrados</span>
              <span style={{ color:"#f59e0b" }}>{trabajosFiltrados.filter(t=>["EN PROCESO","NO FACTURADO"].includes(t.estado_pago)).length} pendientes</span>
            </div>
            {trabajosFiltrados.length===0 && <div className="card" style={{ padding:"40px", textAlign:"center", color:"#52525b", fontSize:"14px" }}>Sin trabajos este mes</div>}
            {trabajosFiltrados.map(t => (
              <div key={t.id} className="card" style={{ padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"6px" }}>
                      <span style={{ fontSize:"11px", background:"#27272a", color:"#71717a", padding:"2px 8px", borderRadius:"4px" }}>{t.area}</span>
                      <span className={`pill ${PILL_CLASS[t.estado_pago]||"pill-pend"}`}>{t.estado_pago}</span>
                      {t.nro_factura && <span style={{ fontSize:"11px", color:"#52525b" }}>Fact.#{t.nro_factura}</span>}
                    </div>
                    <p style={{ fontWeight:700, color:"#fff", fontSize:"14px", marginBottom:"3px" }}>{t.tipo}</p>
                    <p style={{ fontSize:"12px", color:"#71717a" }}>{t.clinica} · {t.doctor}</p>
                    {t.paciente && t.paciente!=="-" && <p style={{ fontSize:"12px", color:"#52525b" }}>Pac: {t.paciente}</p>}
                    {t.observaciones && <p style={{ fontSize:"11px", color:"#3f3f46", fontStyle:"italic", marginTop:"3px" }}>"{t.observaciones}"</p>}
                    <div style={{ display:"flex", gap:"12px", marginTop:"4px" }}>
                      {t.fecha_ingreso && <span style={{ fontSize:"11px", color:"#3f3f46" }}>Ing: {t.fecha_ingreso}</span>}
                      {t.fecha_entrega && <span style={{ fontSize:"11px", color:"#3f3f46" }}>Ent: {t.fecha_entrega}</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                    <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"16px" }}>{fmt(t.valor)}</p>
                    <div style={{ display:"flex", gap:"4px" }}>
                      <button className="bsm" onClick={()=>editT(t)}>✏️</button>
                      <button className="bsm" style={{ color:"#f87171" }} onClick={()=>delT(t.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {showFormT && (
              <div className="overlay">
                <div className="modal">
                  <p className="tf" style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>{editandoT?"Editar Trabajo":"Nuevo Trabajo"}</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label className="lbl">Mes</label><select className="inp" value={formT.mes} onChange={e=>setFormT(f=>({...f,mes:e.target.value}))}>{MESES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
                    <div><label className="lbl">Área</label><select className="inp" value={formT.area} onChange={e=>setFormT(f=>({...f,area:e.target.value}))}>{AREAS.map(a=><option key={a}>{a}</option>)}</select></div>
                  </div>
                  {[["Clínica","clinica"],["Doctor/a","doctor"],["Paciente","paciente"],["Tipo de trabajo","tipo"],["Localidad","localidad"]].map(([lb,k])=>(
                    <div key={k} style={{ marginBottom:"12px" }}><label className="lbl">{lb}</label><input className="inp" value={formT[k]} onChange={e=>setFormT(f=>({...f,[k]:e.target.value}))}/></div>
                  ))}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label className="lbl">Valor ($)</label><input type="number" className="inp" value={formT.valor} onChange={e=>setFormT(f=>({...f,valor:e.target.value}))}/></div>
                    <div><label className="lbl">N° Factura</label><input className="inp" value={formT.nro_factura} onChange={e=>setFormT(f=>({...f,nro_factura:e.target.value}))}/></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label className="lbl">Fecha Ingreso</label><input type="date" className="inp" value={formT.fecha_ingreso} onChange={e=>setFormT(f=>({...f,fecha_ingreso:e.target.value}))}/></div>
                    <div><label className="lbl">Fecha Entrega</label><input type="date" className="inp" value={formT.fecha_entrega} onChange={e=>setFormT(f=>({...f,fecha_entrega:e.target.value}))}/></div>
                  </div>
                  <div style={{ marginBottom:"12px" }}><label className="lbl">Estado de pago</label><select className="inp" value={formT.estado_pago} onChange={e=>setFormT(f=>({...f,estado_pago:e.target.value}))}>{ESTADOS_PAGO.map(e=><option key={e}>{e}</option>)}</select></div>
                  <div style={{ marginBottom:"16px" }}><label className="lbl">Observaciones</label><textarea className="inp" rows={2} value={formT.observaciones} onChange={e=>setFormT(f=>({...f,observaciones:e.target.value}))}/></div>
                  <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                    <button className="btng" onClick={()=>{setShowFormT(false);setEditandoT(null);}}>Cancelar</button>
                    <button className="btn1" onClick={saveT}>Guardar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ GASTOS ════ */}
        {tab === "gastos" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"8px" }}>
              <select className="inp" style={{ width:"180px" }} value={filtroMes} onChange={e=>setFiltroMes(e.target.value)}>{MESES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select>
              <button className="btn1" onClick={()=>{setFormG({...emptyG,mes:filtroMes});setEditandoG(null);setShowFormG(true);}}>+ Gasto</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div className="card" style={{ padding:"16px" }}><p className="lbl">Total gastos {mesLabel(filtroMes)}</p><p style={{ fontSize:"18px", fontWeight:700, color:"#f87171" }}>{fmt(gastosFiltrados.reduce((s,g)=>s+Number(g.valor_total||0),0))}</p></div>
              <div className="card" style={{ padding:"16px" }}><p className="lbl">Ítems</p><p style={{ fontSize:"18px", fontWeight:700, color:"#fff" }}>{gastosFiltrados.length}</p></div>
            </div>
            {gastosFiltrados.length===0 && <div className="card" style={{ padding:"40px", textAlign:"center", color:"#52525b" }}>Sin gastos este mes</div>}
            {gastosFiltrados.map(g=>(
              <div key={g.id} className="card" style={{ padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:"12px" }}>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:"11px", background:"#27272a", color:"#71717a", padding:"2px 8px", borderRadius:"4px", display:"inline-block", marginBottom:"6px" }}>{g.categoria}</span>
                    <p style={{ fontWeight:700, color:"#fff", fontSize:"14px" }}>{g.descripcion}</p>
                    <p style={{ fontSize:"12px", color:"#52525b" }}>{g.cantidad} {g.medida} × {fmt(g.valor_unit||0)}</p>
                    {g.proveedor && <p style={{ fontSize:"12px", color:"#3f3f46" }}>Prov: {g.proveedor}</p>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                    <p style={{ color:"#f87171", fontWeight:700, fontSize:"16px" }}>{fmt(g.valor_total||0)}</p>
                    <div style={{ display:"flex", gap:"4px" }}>
                      <button className="bsm" onClick={()=>editG(g)}>✏️</button>
                      <button className="bsm" style={{ color:"#f87171" }} onClick={()=>delG(g.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {showFormG && (
              <div className="overlay">
                <div className="modal">
                  <p className="tf" style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>{editandoG?"Editar Gasto":"Nuevo Gasto"}</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label className="lbl">Mes</label><select className="inp" value={formG.mes} onChange={e=>setFormG(f=>({...f,mes:e.target.value}))}>{MESES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
                    <div><label className="lbl">Categoría</label><select className="inp" value={formG.categoria} onChange={e=>setFormG(f=>({...f,categoria:e.target.value}))}>{CATS_GASTO.map(c=><option key={c}>{c}</option>)}</select></div>
                  </div>
                  <div style={{ marginBottom:"12px" }}><label className="lbl">Descripción</label><input className="inp" value={formG.descripcion} onChange={e=>setFormG(f=>({...f,descripcion:e.target.value}))}/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label className="lbl">Cantidad</label><input type="number" className="inp" value={formG.cantidad} onChange={e=>setFormG(f=>({...f,cantidad:e.target.value,valor_total:Number(e.target.value)*Number(f.valor_unit)}))}/></div>
                    <div><label className="lbl">Medida</label><input className="inp" value={formG.medida} onChange={e=>setFormG(f=>({...f,medida:e.target.value}))}/></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label className="lbl">Valor unitario ($)</label><input type="number" className="inp" value={formG.valor_unit} onChange={e=>setFormG(f=>({...f,valor_unit:e.target.value,valor_total:Number(f.cantidad)*Number(e.target.value)}))}/></div>
                    <div><label className="lbl">Total ($)</label><input type="number" className="inp" value={formG.valor_total} onChange={e=>setFormG(f=>({...f,valor_total:e.target.value}))}/></div>
                  </div>
                  <div style={{ marginBottom:"12px" }}><label className="lbl">Proveedor</label><input className="inp" value={formG.proveedor} onChange={e=>setFormG(f=>({...f,proveedor:e.target.value}))}/></div>
                  <div style={{ marginBottom:"16px" }}><label className="lbl">Observaciones</label><textarea className="inp" rows={2} value={formG.observaciones} onChange={e=>setFormG(f=>({...f,observaciones:e.target.value}))}/></div>
                  <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                    <button className="btng" onClick={()=>{setShowFormG(false);setEditandoG(null);}}>Cancelar</button>
                    <button className="btn1" onClick={saveG}>Guardar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ INVENTARIO ════ */}
        {tab === "inventario" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"8px" }}>
              <select className="inp" style={{ width:"180px" }} value={filtroInvCat} onChange={e=>setFiltroInvCat(e.target.value)}>
                <option value="Todas">Todas las categorías</option>
                {CATS_INV.map(c=><option key={c}>{c}</option>)}
              </select>
              <button className="btn1" onClick={()=>{setFormI(emptyI);setEditandoI(null);setShowFormI(true);}}>+ Ítem</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
              <div className="card" style={{ padding:"12px", textAlign:"center" }}><p className="lbl">Ítems</p><p style={{ fontWeight:700, fontSize:"18px", color:"#fff" }}>{invFiltrado.length}</p></div>
              <div className="card" style={{ padding:"12px", textAlign:"center" }}><p className="lbl">Stock OK</p><p style={{ fontWeight:700, fontSize:"18px", color:"#4ade80" }}>{invFiltrado.filter(i=>i.cantidad>i.cantidad_minima).length}</p></div>
              <div className="card" style={{ padding:"12px", textAlign:"center" }}><p className="lbl">Stock bajo</p><p style={{ fontWeight:700, fontSize:"18px", color:"#f59e0b" }}>{invFiltrado.filter(i=>i.cantidad<=i.cantidad_minima).length}</p></div>
            </div>
            {invFiltrado.map(i=>{
              const bajo=i.cantidad<=i.cantidad_minima, agotado=i.cantidad===0;
              return (
                <div key={i.id} className="card" style={{ padding:"16px", borderColor: agotado?"#7f1d1d":bajo?"#78350f":"#3f3f46" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"4px" }}>
                        <span style={{ fontSize:"11px", background:"#27272a", color:"#71717a", padding:"2px 8px", borderRadius:"4px" }}>{i.categoria}</span>
                        {agotado && <span className="pill pill-nofact">AGOTADO</span>}
                        {!agotado && bajo && <span className="pill pill-proc">STOCK BAJO</span>}
                      </div>
                      <p style={{ fontWeight:700, color:"#fff", fontSize:"14px" }}>{i.descripcion}</p>
                      <p style={{ fontSize:"11px", color:"#52525b" }}>Mín: {i.cantidad_minima} {i.medida}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                        <button className="bsm" style={{ width:"32px", height:"32px", fontSize:"18px" }} onClick={()=>ajustar(i.id,-1)}>−</button>
                        <div style={{ textAlign:"center", width:"52px" }}>
                          <p style={{ fontSize:"22px", fontWeight:700, color: agotado?"#f87171":bajo?"#f59e0b":"#4ade80" }}>{i.cantidad}</p>
                          <p style={{ fontSize:"10px", color:"#52525b" }}>{i.medida}</p>
                        </div>
                        <button className="bsm" style={{ width:"32px", height:"32px", fontSize:"18px" }} onClick={()=>ajustar(i.id,1)}>+</button>
                      </div>
                      <div style={{ display:"flex", gap:"4px" }}>
                        <button className="bsm" onClick={()=>editI(i)}>✏️</button>
                        <button className="bsm" style={{ color:"#f87171" }} onClick={()=>delI(i.id)}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {showFormI && (
              <div className="overlay">
                <div className="modal">
                  <p className="tf" style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>{editandoI?"Editar Ítem":"Nuevo Ítem"}</p>
                  <div style={{ marginBottom:"12px" }}><label className="lbl">Categoría</label><select className="inp" value={formI.categoria} onChange={e=>setFormI(f=>({...f,categoria:e.target.value}))}>{CATS_INV.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div style={{ marginBottom:"12px" }}><label className="lbl">Descripción</label><input className="inp" value={formI.descripcion} onChange={e=>setFormI(f=>({...f,descripcion:e.target.value}))}/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"16px" }}>
                    <div><label className="lbl">Cantidad</label><input type="number" className="inp" value={formI.cantidad} onChange={e=>setFormI(f=>({...f,cantidad:Number(e.target.value)}))}/></div>
                    <div><label className="lbl">Stock mín.</label><input type="number" className="inp" value={formI.cantidad_minima} onChange={e=>setFormI(f=>({...f,cantidad_minima:Number(e.target.value)}))}/></div>
                    <div><label className="lbl">Medida</label><input className="inp" value={formI.medida} onChange={e=>setFormI(f=>({...f,medida:e.target.value}))}/></div>
                  </div>
                  <div style={{ marginBottom:"16px" }}><label className="lbl">Observaciones</label><textarea className="inp" rows={2} value={formI.observaciones} onChange={e=>setFormI(f=>({...f,observaciones:e.target.value}))}/></div>
                  <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                    <button className="btng" onClick={()=>{setShowFormI(false);setEditandoI(null);}}>Cancelar</button>
                    <button className="btn1" onClick={saveI}>Guardar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ CLÍNICAS ════ */}
        {tab === "clinicas" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontSize:"13px", color:"#71717a" }}>{clinicas.length} clínicas</p>
              <button className="btn1" onClick={()=>setShowFormC(true)}>+ Clínica</button>
            </div>
            {clinicas.map(c=>{
              const tCli=trabajos.filter(t=>t.clinica===c.nombre);
              return (
                <div key={c.id} className="card" style={{ padding:"16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                        <p style={{ fontWeight:700, color:"#fff" }}>{c.nombre}</p>
                        <span className={`pill ${c.estado==="CLIENTE"?"pill-pagado":"pill-pend"}`}>{c.estado}</span>
                      </div>
                      <p style={{ fontSize:"12px", color:"#71717a" }}>{c.localidad} · {c.doctor}</p>
                      {c.telefono && <p style={{ fontSize:"12px", color:"#52525b" }}>📞 {c.telefono}</p>}
                      {c.direccion && <p style={{ fontSize:"11px", color:"#3f3f46" }}>{c.direccion}</p>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ color:"#22d3ee", fontWeight:700 }}>{fmt(tCli.reduce((s,t)=>s+Number(t.valor),0))}</p>
                      <p style={{ fontSize:"12px", color:"#52525b" }}>{tCli.length} trabajos</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {showFormC && (
              <div className="overlay">
                <div className="modal">
                  <p className="tf" style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>Nueva Clínica</p>
                  {[["Nombre","nombre"],["Localidad","localidad"],["Doctor/a","doctor"],["Teléfono","telefono"],["Dirección","direccion"],["Email","email"]].map(([lb,k])=>(
                    <div key={k} style={{ marginBottom:"12px" }}><label className="lbl">{lb}</label><input className="inp" value={formC[k]} onChange={e=>setFormC(f=>({...f,[k]:e.target.value}))}/></div>
                  ))}
                  <div style={{ marginBottom:"16px" }}><label className="lbl">Estado</label><select className="inp" value={formC.estado} onChange={e=>setFormC(f=>({...f,estado:e.target.value}))}><option>PROSPECTO</option><option>CLIENTE</option><option>INACTIVO</option></select></div>
                  <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                    <button className="btng" onClick={()=>setShowFormC(false)}>Cancelar</button>
                    <button className="btn1" onClick={saveC}>Guardar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ════ FACTURAS ════ */}
        {tab === "facturas" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                <select style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", fontFamily:"monospace", fontSize:"13px" }} value={filtroFactMes} onChange={e=>setFiltroFactMes(e.target.value)}>
                  {MESES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", fontFamily:"monospace", fontSize:"13px" }} value={filtroFactTipo} onChange={e=>setFiltroFactTipo(e.target.value)}>
                  <option value="Todas">Todas</option>
                  <option value="venta">Venta</option>
                  <option value="compra">Compra</option>
                </select>
              </div>
              <button style={{ background:"#22d3ee", color:"#09090b", padding:"9px 20px", borderRadius:"7px", fontWeight:700, fontSize:"13px", cursor:"pointer", border:"none", fontFamily:"monospace" }} onClick={()=>{setFormF({mes:filtroFactMes, tipo:"venta", nro_factura:"", fecha:"", monto:"", quien:"", estado:"PENDIENTE", link:"", observaciones:""});setEditandoF(null);setShowFormF(true);}}>+ Factura</button>
            </div>

            {/* Resumen */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
                <p style={{ fontSize:"11px", color:"#71717a", marginBottom:"4px" }}>Total ventas</p>
                <p style={{ fontSize:"16px", fontWeight:700, color:"#4ade80" }}>{new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(facturasFiltradas.filter(f=>f.tipo==="venta").reduce((s,f)=>s+Number(f.monto||0),0))}</p>
              </div>
              <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
                <p style={{ fontSize:"11px", color:"#71717a", marginBottom:"4px" }}>Total compras</p>
                <p style={{ fontSize:"16px", fontWeight:700, color:"#f87171" }}>{new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(facturasFiltradas.filter(f=>f.tipo==="compra").reduce((s,f)=>s+Number(f.monto||0),0))}</p>
              </div>
            </div>

            {/* Lista */}
            {facturasFiltradas.length === 0 && <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"40px", textAlign:"center", color:"#52525b", fontSize:"14px" }}>Sin facturas este mes</div>}
            {facturasFiltradas.map(f => (
              <div key={f.id} style={{ background:"#18181b", border:`1px solid ${f.tipo==="venta"?"#14532d":"#7f1d1d"}`, borderRadius:"10px", padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"6px" }}>
                      <span style={{ fontSize:"11px", background: f.tipo==="venta"?"rgba(20,83,45,0.5)":"rgba(127,29,29,0.5)", color: f.tipo==="venta"?"#4ade80":"#f87171", border:`1px solid ${f.tipo==="venta"?"#166534":"#991b1b"}`, padding:"2px 8px", borderRadius:"20px" }}>{f.tipo === "venta" ? "VENTA" : "COMPRA"}</span>
                      <span style={{ fontSize:"11px", background:"#27272a", color:"#a1a1aa", padding:"2px 8px", borderRadius:"4px" }}>{f.estado}</span>
                      {f.nro_factura && <span style={{ fontSize:"11px", color:"#52525b" }}>N° {f.nro_factura}</span>}
                    </div>
                    <p style={{ fontWeight:700, color:"#fff", fontSize:"14px", marginBottom:"3px" }}>{f.quien || "Sin nombre"}</p>
                    {f.fecha && <p style={{ fontSize:"12px", color:"#71717a" }}>📅 {f.fecha}</p>}
                    {f.observaciones && <p style={{ fontSize:"11px", color:"#52525b", fontStyle:"italic", marginTop:"3px" }}>"{f.observaciones}"</p>}
                    {f.link && <a href={f.link} target="_blank" rel="noreferrer" style={{ fontSize:"12px", color:"#22d3ee", display:"inline-block", marginTop:"4px" }}>📎 Ver factura</a>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                    <p style={{ fontWeight:700, fontSize:"16px", color: f.tipo==="venta"?"#4ade80":"#f87171" }}>{new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(f.monto||0)}</p>
                    <div style={{ display:"flex", gap:"4px" }}>
                      <button style={{ padding:"5px 10px", fontSize:"12px", borderRadius:"5px", cursor:"pointer", border:"1px solid #52525b", background:"transparent", color:"#a1a1aa" }} onClick={()=>editF(f)}>✏️</button>
                      <button style={{ padding:"5px 10px", fontSize:"12px", borderRadius:"5px", cursor:"pointer", border:"1px solid #52525b", background:"transparent", color:"#f87171" }} onClick={()=>delF(f.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Modal */}
            {showFormF && (
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:"16px" }}>
                <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"12px", width:"100%", maxWidth:"500px", maxHeight:"90vh", overflowY:"auto", padding:"24px" }}>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>{editandoF?"Editar Factura":"Nueva Factura"}</p>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Mes</label>
                      <select style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px" }} value={formF.mes} onChange={e=>setFormF(f=>({...f,mes:e.target.value}))}>
                        {MESES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                      </select></div>
                    <div><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Tipo</label>
                      <select style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px" }} value={formF.tipo} onChange={e=>setFormF(f=>({...f,tipo:e.target.value}))}>
                        <option value="venta">Venta</option>
                        <option value="compra">Compra</option>
                      </select></div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>N° Factura</label>
                      <input style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} value={formF.nro_factura} onChange={e=>setFormF(f=>({...f,nro_factura:e.target.value}))}/></div>
                    <div><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Fecha</label>
                      <input type="date" style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} value={formF.fecha} onChange={e=>setFormF(f=>({...f,fecha:e.target.value}))}/></div>
                  </div>

                  <div style={{ marginBottom:"12px" }}><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Clínica / Proveedor</label>
                    <input style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} value={formF.quien} onChange={e=>setFormF(f=>({...f,quien:e.target.value}))}/></div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Monto ($)</label>
                      <input type="number" style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} value={formF.monto} onChange={e=>setFormF(f=>({...f,monto:e.target.value}))}/></div>
                    <div><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Estado</label>
                      <select style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px" }} value={formF.estado} onChange={e=>setFormF(f=>({...f,estado:e.target.value}))}>
                        <option>PENDIENTE</option><option>PAGADA</option><option>ANULADA</option>
                      </select></div>
                  </div>

                  <div style={{ marginBottom:"12px" }}><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Link foto/archivo (Google Drive)</label>
                    <input style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} placeholder="https://drive.google.com/..." value={formF.link} onChange={e=>setFormF(f=>({...f,link:e.target.value}))}/></div>

                  <div style={{ marginBottom:"16px" }}><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Observaciones</label>
                    <textarea style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} rows={2} value={formF.observaciones} onChange={e=>setFormF(f=>({...f,observaciones:e.target.value}))}/></div>

                  <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                    <button style={{ background:"transparent", border:"1px solid #52525b", color:"#a1a1aa", padding:"9px 20px", borderRadius:"7px", fontSize:"13px", cursor:"pointer", fontFamily:"monospace" }} onClick={()=>{setShowFormF(false);setEditandoF(null);}}>Cancelar</button>
                    <button style={{ background:"#22d3ee", color:"#09090b", padding:"9px 20px", borderRadius:"7px", fontWeight:700, fontSize:"13px", cursor:"pointer", border:"none", fontFamily:"monospace" }} onClick={saveF}>Guardar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
