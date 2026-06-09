import { useState, useMemo, useEffect, useCallback } from "react";

// ── CREDENCIALES ─────────────────────────────────────────────────
const USUARIOS = [
  { usuario: "20.1821.180-0", clave: "odnoliub1234" },
  { usuario: "15.077.122-6", clave: "marley1234" },
];

// ── URL DEL BACKEND (Google Apps Script) ─────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbxXaAFB7Vci4yutVQ5SntQNrxEo1WCz8g1zYZC6Bwfd0dmhyId_af7aC_7wsF9YCa_o/exec";

// ── API HELPERS ──────────────────────────────────────────────────
async function cargarDatos() {
  try {
    const r = await fetch(API_URL);
    const json = await r.json();
    if (json.ok && json.data && json.data !== "{}") {
      let raw = json.data;
      // Si tiene timestamp al inicio (ej: "2026-06-05T...\t{...}"), extraer solo el JSON
      const idx = raw.indexOf("{");
      if (idx > 0) raw = raw.substring(idx);
      return JSON.parse(raw);
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
  { id: 1, nombre: "MAODENTAL", localidad: "Villarrica", doctor: "Maria Jose Muñoz Ortega", telefono: "569 7979 4140", direccion: "Pedro Montt N° 774", email: "", estado: "CLIENTE", convenio: true },
  { id: 2, nombre: "LOS NOTROS", localidad: "Villarrica", doctor: "Sebastian Robles", telefono: "569 51230389", direccion: "Saturnino Epulef N° 899", email: "", estado: "CLIENTE" },
  { id: 3, nombre: "VIDADENTAL", localidad: "Villarrica", doctor: "Mariajose Olivares", telefono: "569 45889855", direccion: "Segunda Faja N° 805, Local 1", email: "", estado: "CLIENTE" },
  { id: 4, nombre: "CABRAPAN DENTAL", localidad: "Villarrica", doctor: "Yerti Cabrapan G", telefono: "569 96433456", direccion: "Edificio Pehuen", email: "", estado: "CLIENTE" },
  { id: 5, nombre: "CLINICA SAN CLEMENTE", localidad: "Panguipulli", doctor: "Diego Fuentes", telefono: "", direccion: "", email: "", estado: "CLIENTE" },
  { id: 6, nombre: "CLINICA ARAUCARIA", localidad: "Villarrica", doctor: "Cristobal Pereira", telefono: "", direccion: "", email: "", estado: "PROSPECTO" },
  { id: 7, nombre: "CLINICA KUTRALKO", localidad: "Villarrica", doctor: "Alarcon", telefono: "", direccion: "", email: "", estado: "CLIENTE" },
  { id: 8, nombre: "CLINICA DENTALIZ", localidad: "Villarrica", doctor: "Licet Salazar", telefono: "", direccion: "", email: "", estado: "CLIENTE" },
  { id: 9, nombre: "CLINICA ZX PUCON", localidad: "Pucón", doctor: "", telefono: "", direccion: "", email: "", estado: "CLIENTE" },
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
  { id: 18, mes: "2026-05", localidad: "Villarrica", area: "Fija", clinica: "CLINICA ARAUCARIA", doctor: "Cristobal Pereira", paciente: "Diego Rios", tipo: "INCRUSTACION", cantidad: 1, valor: 43000, observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "2026-05-28", fecha_entrega: "" },
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
  { id: 1, mes: "2026-03", tipo_gasto: "Variable", categoria: "Insumos", descripcion: "ALCOHOL ISOPROPILICO", medida: "LTS", cantidad: 2, valor_unit: 4500, valor_total: 9000, proveedor: "", observaciones: "" },
  { id: 2, mes: "2026-03", tipo_gasto: "Variable", categoria: "Insumos", descripcion: "TORNILLO HYRAX", medida: "UN", cantidad: 3, valor_unit: 8000, valor_total: 24000, proveedor: "", observaciones: "" },
  { id: 3, mes: "2026-03", tipo_gasto: "Variable", categoria: "Insumos", descripcion: "LAMINA DE ACETATO", medida: "UN", cantidad: 2, valor_unit: 3500, valor_total: 7000, proveedor: "", observaciones: "" },
  { id: 4, mes: "2026-03", tipo_gasto: "Variable", categoria: "Insumos", descripcion: "TORNILLO ESQUELETICO", medida: "UN", cantidad: 1, valor_unit: 9000, valor_total: 9000, proveedor: "", observaciones: "" },
  { id: 5, mes: "2026-04", tipo_gasto: "Variable", categoria: "Insumos", descripcion: "LAMINA DE ACETATO", medida: "UN", cantidad: 2, valor_unit: 3500, valor_total: 7000, proveedor: "", observaciones: "" },
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
const ESTADOS_PAGO = ["PAGADO", "FACTURADO", "NO FACTURADO", "EN PROCESO", "FACTURAR", "ENTREGADO", "PENDIENTE"];
const CATS_GASTO = ["Insumos", "Servicios", "Arriendo", "Transporte", "Maquinaria", "Otro"];
const CATS_INV = ["Ortodoncia", "Acrílicos", "Removible", "Impresión 3D", "Maquinaria", "General"];
const CLINICAS_CONVENIO = ["MAODENTAL"]; // clínicas con convenio

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
  "FACTURAR": "pill-facturar",
  "ENTREGADO": "pill-entregado",
  "PENDIENTE": "pill-pend",
};

const emptyT = { mes: "2026-06", localidad: "Villarrica", area: "Ortodoncia", clinica: "", doctor: "", paciente: "", tipo: "", cantidad: 1, valor: "", valor_base: "", extra: "", descuento: "", observaciones: "", estado_pago: "EN PROCESO", nro_factura: "", fecha_ingreso: "", fecha_entrega: "", nro_ot: "" };
const emptyG = { mes: "2026-06", tipo_gasto: "Variable", categoria: "Insumos", descripcion: "", medida: "UN", cantidad: 1, valor_unit: "", valor_total: "", proveedor: "", observaciones: "" };
const emptyI = { categoria: "Ortodoncia", descripcion: "", medida: "UN", cantidad: 0, cantidad_minima: 1, observaciones: "" };

// ── ARANCEL PLANO (para autocompletar) ──────────────────────────
const ARANCEL_PLANO = [
  { nombre: "Placa de Expansión o Schwartz", precio: 40000, area: "Ortodoncia" },
  { nombre: "Placa de Contención (acetato)", precio: 35000, area: "Ortodoncia" },
  { nombre: "Disyuntor Mc.Namara (sin bandas ni ganchos)", precio: 60000, area: "Ortodoncia" },
  { nombre: "Disyuntor Hyrax con alambre contorneado (sin bandas)", precio: 60000, area: "Ortodoncia" },
  { nombre: "Botón de Nance (sin bandas)", precio: 40000, area: "Ortodoncia" },
  { nombre: "Mantenedor de espacio (sin bandas)", precio: 30000, area: "Ortodoncia" },
  { nombre: "Placa de Contención Hawley", precio: 40000, area: "Ortodoncia" },
  { nombre: "Aparato de Mauricio (con tornillo)", precio: 46000, area: "Ortodoncia" },
  { nombre: "Contención de Begg", precio: 46000, area: "Ortodoncia" },
  { nombre: "Disyuntor Hass", precio: 58000, area: "Ortodoncia" },
  { nombre: "Barra Lingual de Nance", precio: 40000, area: "Ortodoncia" },
  { nombre: "Quad Helix", precio: 50000, area: "Ortodoncia" },
  { nombre: "Barra Transpalatina (BTP o TPA)", precio: 38000, area: "Ortodoncia" },
  { nombre: "Bionator 1 (estándar)", precio: 88000, area: "Ortodoncia" },
  { nombre: "Aparato Monoblock de Mauricio", precio: 48000, area: "Ortodoncia" },
  { nombre: "Reparación simple ortodoncia", precio: 15000, area: "Ortodoncia" },
  { nombre: "Reparación compleja ortodoncia", precio: 20000, area: "Ortodoncia" },
  { nombre: "Prótesis parcial", precio: 65000, area: "Removible" },
  { nombre: "Prótesis total", precio: 65000, area: "Removible" },
  { nombre: "Prótesis con base metálica", precio: 100000, area: "Removible" },
  { nombre: "Prótesis inmediata", precio: 65000, area: "Removible" },
  { nombre: "Prótesis cosmética (hasta 3 dientes)", precio: 38000, area: "Removible" },
  { nombre: "Prótesis flexible", precio: 90000, area: "Removible" },
  { nombre: "Rebasado total o parcial", precio: 30000, area: "Removible" },
  { nombre: "Reparación simple prótesis", precio: 25000, area: "Removible" },
  { nombre: "Reparación compleja prótesis", precio: 25000, area: "Removible" },
  { nombre: "Plano de relajación acrílico", precio: 50000, area: "Plano" },
  { nombre: "Plano Estampado", precio: 35000, area: "Plano" },
  { nombre: "Plano relajación blando-dura", precio: 50000, area: "Plano" },
  { nombre: "Cubetillas de blanqueamiento", precio: 24000, area: "Plano" },
  { nombre: "Protector bucal personal simple", precio: 40000, area: "Plano" },
  { nombre: "Protector bucal personal doble", precio: 55000, area: "Plano" },
  { nombre: "Dientes Provisorios", precio: 15000, area: "Removible" },
  { nombre: "Impresión 3D 1 Arcada", precio: 10000, area: "Impresión 3D" },
  { nombre: "Impresión 3D 2 Arcadas", precio: 12000, area: "Impresión 3D" },
  { nombre: "Plano de relajación 3D", precio: 70000, area: "Plano" },
  { nombre: "Corona periférica (resina)", precio: 50000, area: "Fija" },
  { nombre: "Carillas (resina)", precio: 45000, area: "Fija" },
  { nombre: "Incrustación onlay (resina)", precio: 40000, area: "Fija" },
  { nombre: "Incrustación inlay (resina)", precio: 33000, area: "Fija" },
  { nombre: "Corona sobre implante (resina)", precio: 53000, area: "Fija" },
  { nombre: "Prótesis fija plural (por pieza) Zirconio", precio: 108000, area: "Fija" },
  { nombre: "Carillas Zirconio", precio: 100000, area: "Fija" },
  { nombre: "Corona Zirconio", precio: 107000, area: "Fija" },
  { nombre: "Corona sobre implante Zirconio", precio: 123000, area: "Fija" },
  { nombre: "Núcleo Zirconio", precio: 70000, area: "Fija" },
  { nombre: "Aplicación de cerámica para Zirconio", precio: 50000, area: "Fija" },
  { nombre: "Corona periférica E.MAX", precio: 100000, area: "Fija" },
  { nombre: "Carillas E.MAX", precio: 95000, area: "Fija" },
  { nombre: "Incrustación E.MAX", precio: 94000, area: "Fija" },
];

// ── COMPONENTE CALENDARIO ─────────────────────────────────────────
function Calendario({ trabajos, setTrabajos, eventos, setEventos, guardarTodo, clinicas, gastos, inventario, capitalBase, facturas, metas }) {
  const [calMes, setCalMes] = useState(() => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}`; });
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [showFormEv, setShowFormEv] = useState(false);
  const [formEv, setFormEv] = useState({ fecha:"", titulo:"", descripcion:"", tipo:"tarea" });

  const partes = calMes.split("-").map(Number);
  const anio = partes[0];
  const mes = partes[1];
  const primerDia = new Date(anio, mes-1, 1).getDay();
  const diasEnMes = new Date(anio, mes, 0).getDate();
  const hoy = new Date().toISOString().split("T")[0];

  const dias = [];
  for (let i=0; i<primerDia; i++) dias.push(null);
  for (let d=1; d<=diasEnMes; d++) dias.push(d);

  const add5DiasHabiles = (fechaStr) => {
    if (!fechaStr) return null;
    const d = new Date(fechaStr + "T12:00:00");
    let agregados = 0;
    while (agregados < 5) {
      d.setDate(d.getDate() + 1);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) agregados++;
    }
    return d.toISOString().split("T")[0];
  };

  const evsDia = (fecha) => {
    const manuales = eventos.filter(e=>e.fecha===fecha);
    // Trabajos con fecha_entrega explícita
    const conFecha = trabajos
      .filter(t=>t.fecha_entrega===fecha)
      .map(t=>({ id:`t_${t.id}`, titulo:`🦷 ${t.tipo}`, descripcion:`${t.clinica}${t.paciente&&t.paciente!=="-"?" · "+t.paciente:""}`, tipo:"trabajo", entregado:t.entregado||false, trabajoId:t.id, fecha, estimada:false }));
    // Trabajos EN PROCESO sin fecha_entrega → +5 días hábiles
    const enProceso = trabajos
      .filter(t=>t.estado_pago==="EN PROCESO"&&t.fecha_ingreso&&!t.fecha_entrega&&add5DiasHabiles(t.fecha_ingreso)===fecha)
      .map(t=>({ id:`t_${t.id}`, titulo:`🦷 ${t.tipo}`, descripcion:`${t.clinica}${t.paciente&&t.paciente!=="-"?" · "+t.paciente:""}`, tipo:"trabajo", entregado:false, trabajoId:t.id, fecha, estimada:true }));
    return [...manuales, ...conFecha, ...enProceso];
  };

  const todosEvsMes = [];
  for (let d=1; d<=diasEnMes; d++) {
    const fecha = `${anio}-${String(mes).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    evsDia(fecha).forEach(ev=>todosEvsMes.push({...ev,fecha}));
  }
  const trabajosMesCal = todosEvsMes.filter(e=>e.tipo==="trabajo");
  const eventosManualesMes = todosEvsMes.filter(e=>e.tipo!=="trabajo");

  const irMes = (delta) => {
    const d = new Date(anio, mes-1+delta, 1);
    setCalMes(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
    setDiaSeleccionado(null);
  };

  const marcarEntregado = (trabajoId) => {
    const next = trabajos.map(t => {
      if (t.id !== trabajoId) return t;
      const nuevoEntregado = !t.entregado;
      const nuevoEstado = nuevoEntregado && t.estado_pago === "EN PROCESO" ? "FACTURAR" : t.estado_pago;
      const estadoFinal = !nuevoEntregado && t.estado_pago === "FACTURAR" ? "EN PROCESO" : nuevoEstado;
      return { ...t, entregado: nuevoEntregado, estado_pago: estadoFinal };
    });
    setTrabajos(next);
    guardarTodo(next, clinicas, gastos, inventario, capitalBase, facturas, eventos, metas);
  };

  const saveEv = () => {
    if (!formEv.titulo.trim()) return;
    const newEv = { ...formEv, id: Math.max(0, ...eventos.map(x=>x.id), 0)+1 };
    const next = [...eventos, newEv];
    setEventos(next);
    guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, facturas, next, metas);
    setShowFormEv(false);
    setFormEv({ fecha:"", titulo:"", descripcion:"", tipo:"tarea" });
  };

  const delEv = (id) => {
    const next = eventos.filter(e=>e.id!==id);
    setEventos(next);
    guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, facturas, next, metas);
  };

  const MESES_CAL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
        <div style={{ background:"#18181b", border:"1px solid #7c2d12", borderRadius:"8px", padding:"12px", textAlign:"center" }}>
          <p style={{ fontSize:"10px", color:"#71717a", marginBottom:"3px" }}>Entregas pendientes</p>
          <p style={{ fontSize:"22px", fontWeight:700, color:"#fb923c" }}>{trabajosMesCal.filter(e=>!e.entregado).length}</p>
        </div>
        <div style={{ background:"#18181b", border:"1px solid #14532d", borderRadius:"8px", padding:"12px", textAlign:"center" }}>
          <p style={{ fontSize:"10px", color:"#71717a", marginBottom:"3px" }}>Entregados</p>
          <p style={{ fontSize:"22px", fontWeight:700, color:"#4ade80" }}>{trabajosMesCal.filter(e=>e.entregado).length}</p>
        </div>
        <div style={{ background:"#18181b", border:"1px solid #1e3a5f", borderRadius:"8px", padding:"12px", textAlign:"center" }}>
          <p style={{ fontSize:"10px", color:"#71717a", marginBottom:"3px" }}>Eventos</p>
          <p style={{ fontSize:"22px", fontWeight:700, color:"#93c5fd" }}>{eventosManualesMes.length}</p>
        </div>
      </div>

      {/* Nav mes */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#18181b", border:"1px solid #3f3f46", borderRadius:"8px", padding:"10px 16px" }}>
        <button style={{ background:"#27272a", border:"1px solid #52525b", color:"#f4f4f5", padding:"6px 14px", borderRadius:"6px", cursor:"pointer", fontSize:"18px" }} onClick={()=>irMes(-1)}>‹</button>
        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fff", fontSize:"16px" }}>{MESES_CAL[mes-1]} {anio}</p>
        <button style={{ background:"#27272a", border:"1px solid #52525b", color:"#f4f4f5", padding:"6px 14px", borderRadius:"6px", cursor:"pointer", fontSize:"18px" }} onClick={()=>irMes(1)}>›</button>
      </div>

      {/* Grid */}
      <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"12px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"3px", marginBottom:"6px" }}>
          {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d=>(
            <div key={d} style={{ textAlign:"center", fontSize:"10px", color:"#52525b", padding:"4px", fontWeight:700 }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"3px" }}>
          {dias.map((d,i) => {
            if (!d) return <div key={"v"+i} style={{ minHeight:"52px" }}/>;
            const fecha = `${anio}-${String(mes).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const evs = evsDia(fecha);
            const esHoy = fecha===hoy;
            const sel = diaSeleccionado===fecha;
            const tienePend = evs.some(e=>e.tipo==="trabajo"&&!e.entregado);
            const tieneEnt = evs.some(e=>e.tipo==="trabajo"&&e.entregado);
            const tieneEv = evs.some(e=>e.tipo!=="trabajo");
            return (
              <div key={d} onClick={()=>setDiaSeleccionado(sel?null:fecha)}
                style={{ background:sel?"#1e3a5f":esHoy?"#0c1a0f":"#09090b", border:`1px solid ${sel?"#3b82f6":esHoy?"#22c55e":"#27272a"}`, borderRadius:"6px", padding:"5px 4px", cursor:"pointer", minHeight:"52px" }}>
                <p style={{ fontSize:"11px", fontWeight:esHoy?700:400, color:esHoy?"#4ade80":"#d4d4d8", textAlign:"center", marginBottom:"3px" }}>{d}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                  {evsDia(fecha).some(e=>e.tipo==="trabajo"&&!e.entregado&&e.estimada) && <div style={{ fontSize:"8px", background:"#78350f", color:"#fbbf24", borderRadius:"3px", padding:"1px 3px", textAlign:"center" }}>📋</div>}
                  {tienePend && !evsDia(fecha).every(e=>e.estimada||e.tipo!=="trabajo"||e.entregado) && <div style={{ fontSize:"8px", background:"#7c2d12", color:"#fb923c", borderRadius:"3px", padding:"1px 3px", textAlign:"center" }}>⏳</div>}
                  {tieneEnt && <div style={{ fontSize:"8px", background:"#14532d", color:"#4ade80", borderRadius:"3px", padding:"1px 3px", textAlign:"center" }}>✅</div>}
                  {tieneEv && <div style={{ fontSize:"8px", background:"#1e3a5f", color:"#93c5fd", borderRadius:"3px", padding:"1px 3px", textAlign:"center" }}>📌</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
        {[["⏳","#7c2d12","#fb923c","Entrega pendiente"],["✅","#14532d","#4ade80","Entregado"],["📌","#1e3a5f","#93c5fd","Evento"],["📋","#78350f","#fbbf24","Entrega estimada"]].map(([ico,bg,col,lbl])=>(
          <div key={lbl} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <div style={{ fontSize:"10px", background:bg, color:col, padding:"2px 6px", borderRadius:"3px" }}>{ico}</div>
            <span style={{ fontSize:"11px", color:"#71717a" }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* Detalle día */}
      {diaSeleccionado && (
        <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#fff", fontSize:"14px" }}>
              📅 {new Date(diaSeleccionado+"T12:00:00").toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"})}
            </p>
            <button style={{ background:"#22d3ee", color:"#09090b", padding:"6px 14px", borderRadius:"6px", fontWeight:700, fontSize:"12px", cursor:"pointer", border:"none", fontFamily:"monospace" }}
              onClick={()=>{ setFormEv({fecha:diaSeleccionado,titulo:"",descripcion:"",tipo:"tarea"}); setShowFormEv(true); }}>+ Evento</button>
          </div>
          {evsDia(diaSeleccionado).length===0 && <p style={{ color:"#52525b", fontSize:"13px" }}>Sin eventos este día</p>}
          {evsDia(diaSeleccionado).map((ev,idx)=>(
            <div key={idx} style={{ background:"#09090b", borderRadius:"8px", padding:"12px", marginBottom:"8px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:"6px", alignItems:"center", marginBottom:"5px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"3px",
                      background:ev.tipo==="trabajo"?(ev.entregado?"#14532d":"#7c2d12"):ev.tipo==="reunion"?"#4c1d95":ev.tipo==="recordatorio"?"#713f12":ev.tipo==="pago"?"#064e3b":"#1e3a5f",
                      color:ev.tipo==="trabajo"?(ev.entregado?"#4ade80":"#fb923c"):ev.tipo==="reunion"?"#c4b5fd":ev.tipo==="recordatorio"?"#fcd34d":ev.tipo==="pago"?"#6ee7b7":"#93c5fd"
                    }}>{ev.tipo==='trabajo'&&ev.estimada?'📋 EST. ENTREGA':ev.tipo.toUpperCase()}</span>
                    {ev.tipo==="trabajo" && (
                      <button onClick={()=>marcarEntregado(ev.trabajoId)} style={{ fontSize:"11px", padding:"3px 10px", borderRadius:"20px", cursor:"pointer", border:"none", fontFamily:"monospace", fontWeight:700,
                        background:ev.entregado?"#7c2d12":"#14532d", color:ev.entregado?"#fb923c":"#4ade80" }}>
                        {ev.entregado?"↩ Pendiente":"✅ Entregado"}
                      </button>
                    )}
                  </div>
                  <p style={{ color:"#fff", fontSize:"13px", fontWeight:600, marginBottom:"3px" }}>{ev.titulo}</p>
                  {ev.descripcion && <p style={{ color:"#71717a", fontSize:"12px" }}>{ev.descripcion}</p>}
                </div>
                {ev.tipo!=="trabajo" && (
                  <button style={{ background:"transparent", border:"none", color:"#f87171", cursor:"pointer", fontSize:"18px" }} onClick={()=>delEv(ev.id)}>🗑</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista entregas pendientes del mes */}
      {trabajosMesCal.filter(e=>!e.entregado).length>0 && (
        <div style={{ background:"#18181b", border:"1px solid #7c2d12", borderRadius:"10px", padding:"16px" }}>
          <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, color:"#fb923c", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"12px" }}>⏳ Entregas pendientes este mes</p>
          {trabajosMesCal.filter(e=>!e.entregado).sort((a,b)=>a.fecha>b.fecha?1:-1).map((ev,idx)=>(
            <div key={idx} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #27272a" }}>
              <div>
                <p style={{ color:"#fff", fontSize:"13px", fontWeight:600 }}>{ev.titulo}</p>
                <p style={{ color:"#71717a", fontSize:"12px" }}>{ev.descripcion}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:ev.estimada?"#fbbf24":"#fb923c", fontSize:"12px", fontWeight:700 }}>{ev.fecha}{ev.estimada?" (est.)":""}</p>
                <button onClick={()=>marcarEntregado(ev.trabajoId)} style={{ fontSize:"11px", padding:"3px 10px", borderRadius:"20px", cursor:"pointer", border:"none", fontFamily:"monospace", fontWeight:700, background:"#14532d", color:"#4ade80", marginTop:"4px" }}>✅ Entregado</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo evento */}
      {showFormEv && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:"16px" }}>
          <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"12px", width:"100%", maxWidth:"400px", padding:"24px" }}>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>
              Nuevo Evento · {formEv.fecha && new Date(formEv.fecha+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long"})}
            </p>
            <div style={{ marginBottom:"12px" }}>
              <label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Tipo</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
                {[["tarea","📋 Tarea","#1e3a5f","#93c5fd"],["reunion","🤝 Reunión","#4c1d95","#c4b5fd"],["recordatorio","🔔 Recordatorio","#713f12","#fcd34d"],["pago","💰 Pago","#064e3b","#6ee7b7"]].map(([val,lbl,bg,col])=>(
                  <button key={val} onClick={()=>setFormEv(f=>({...f,tipo:val}))}
                    style={{ padding:"8px", borderRadius:"6px", cursor:"pointer", border:`2px solid ${formEv.tipo===val?col:"#3f3f46"}`,
                      background:formEv.tipo===val?bg:"transparent", color:formEv.tipo===val?col:"#71717a", fontFamily:"monospace", fontSize:"12px", fontWeight:formEv.tipo===val?700:400 }}>{lbl}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:"12px" }}>
              <label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Título</label>
              <input style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"10px 14px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }}
                value={formEv.titulo} onChange={e=>setFormEv(f=>({...f,titulo:e.target.value}))} placeholder="Ej: Llamar a MAODENTAL"/>
            </div>
            <div style={{ marginBottom:"16px" }}>
              <label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Descripción (opcional)</label>
              <textarea style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"10px 14px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }}
                rows={2} value={formEv.descripcion} onChange={e=>setFormEv(f=>({...f,descripcion:e.target.value}))}/>
            </div>
            <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
              <button style={{ background:"transparent", border:"1px solid #52525b", color:"#a1a1aa", padding:"9px 20px", borderRadius:"7px", fontSize:"13px", cursor:"pointer", fontFamily:"monospace" }}
                onClick={()=>setShowFormEv(false)}>Cancelar</button>
              <button style={{ background:"#22d3ee", color:"#09090b", padding:"9px 20px", borderRadius:"7px", fontWeight:700, fontSize:"13px", cursor:"pointer", border:"none", fontFamily:"monospace" }}
                onClick={saveEv}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [ready, setReady] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [trabajos, setTrabajos] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [capitalBase, setCapitalBase] = useState(1000000);

  const [filtroMes, setFiltroMes] = useState(() => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}`; });
  const [busqueda, setBusqueda] = useState("");
  const [filtroInvCat, setFiltroInvCat] = useState("Todas");
  const [facturas, setFacturas] = useState([]);
  const [showFormF, setShowFormF] = useState(false);
  const [editandoF, setEditandoF] = useState(null);
  const [formF, setFormF] = useState({ mes:"2026-06", tipo:"venta", nro_factura:"", fecha:"", monto:"", quien:"", estado:"PENDIENTE", link:"", observaciones:"" });
  const [filtroFactMes, setFiltroFactMes] = useState(() => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}`; });
  const [filtroFactTipo, setFiltroFactTipo] = useState("Todas");

  // Eventos
  const [eventos, setEventos] = useState([]);

  // Metas
  const [metas, setMetas] = useState({});
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaInput, setMetaInput] = useState("");
  const [editMetaForm, setEditMetaForm] = useState({ ingresos:"", trabajos:"", gastos:"" });
  const [busqArancel, setBusqArancel] = useState("");
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [catSeleccionada, setCatSeleccionada] = useState("Todas");
  // Cotizaciones
  const [cotizaciones, setCotizaciones] = useState([]);
  const [showFormCot, setShowFormCot] = useState(false);
  const [editandoCot, setEditandoCot] = useState(null);
  const [formCot, setFormCot] = useState({ clinica:"", doctor:"", fecha:"", validez:"30", observaciones:"", items:[] });
  const [busqCotItem, setBusqCotItem] = useState("");
  const [fichaClinicaId, setFichaClinicaId] = useState(null);
  const [busquedaGlobal, setBusquedaGlobal] = useState("");


  // Registro de actividad
  const [actividad, setActividad] = useState([]);
  const [usuarioActual] = useState(() => sessionStorage.getItem("lab_usuario") || "Álvaro");

  // Deudas
  const [deudas, setDeudas] = useState([]);
  const [showFormD, setShowFormD] = useState(false);
  const [formD, setFormD] = useState({ clinica:"", monto:"", desde:"", descripcion:"", estado:"PENDIENTE" });
  const [editandoCapital, setEditandoCapital] = useState(false);
  const [capitalInput, setCapitalInput] = useState("1000000");

  const [showFormT, setShowFormT] = useState(false); const [editandoT, setEditandoT] = useState(null); const [formT, setFormT] = useState(emptyT);
  const [showFormC, setShowFormC] = useState(false); const [editandoC, setEditandoC] = useState(null); const [formC, setFormC] = useState({ nombre: "", localidad: "Villarrica", doctor: "", telefono: "", direccion: "", email: "", estado: "PROSPECTO" });
  const [showFormG, setShowFormG] = useState(false); const [editandoG, setEditandoG] = useState(null); const [formG, setFormG] = useState(emptyG);
  const [showFormI, setShowFormI] = useState(false); const [editandoI, setEditandoI] = useState(null); const [formI, setFormI] = useState(emptyI);

  useEffect(() => {
    (async () => {
      const d = await cargarDatos();
      if (d) {
        const trabajosRaw = d.trabajos || TRABAJOS_INICIALES;
        // Asignar OT a trabajos que no tienen
        let changed = false;
        const trabajosConOT = trabajosRaw.map(t => {
          if (!t.nro_ot) { changed = true; return { ...t, nro_ot: `OT-${String(t.id).padStart(3,"0")}` }; }
          return t;
        });
        setTrabajos(trabajosConOT);
        setClinicas(d.clinicas || CLINICAS_INICIALES);
        setGastos(d.gastos || GASTOS_INICIALES);
        setInventario(d.inventario || INVENTARIO_INICIAL);
        if (d.capitalBase !== undefined) { setCapitalBase(d.capitalBase); setCapitalInput(String(d.capitalBase)); }
        setFacturas(d.facturas || []);
        setEventos(d.eventos || []);
        setMetas(d.metas || {});
        setDeudas(d.deudas || []);
        setActividad(d.actividad || []);
        setCotizaciones(d.cotizaciones || []);
      } else {
        setTrabajos(TRABAJOS_INICIALES.map(t=>({...t, nro_ot: t.nro_ot||`OT-${String(t.id).padStart(3,"0")}`}))); setClinicas(CLINICAS_INICIALES);
        setGastos(GASTOS_INICIALES); setInventario(INVENTARIO_INICIAL);
      }
      setReady(true);
    })();
  }, []);

  const registrarActividad = (accion, detalle, act) => {
    const registro = {
      id: Date.now(),
      fecha: new Date().toLocaleString("es-CL"),
      usuario: usuarioActual,
      accion,
      detalle
    };
    return [...(act || actividad).slice(-99), registro];
  };

  const guardarTodo = useCallback(async (t, c, g, i, cap, f, ev, mt, deu, act) => {
    setGuardando(true);
    await guardarDatos({ 
      trabajos: t, 
      clinicas: c, 
      gastos: g, 
      inventario: i, 
      capitalBase: cap !== undefined ? cap : capitalBase,
      facturas: f !== undefined ? f : facturas,
      eventos: ev !== undefined ? ev : eventos,
      metas: mt !== undefined ? mt : metas,
      deudas: deu !== undefined ? deu : deudas,
      actividad: act !== undefined ? act : actividad,
      cotizaciones: cotizaciones,
    });
    setTimeout(() => setGuardando(false), 1200);
  }, [capitalBase, facturas, eventos, metas, deudas, actividad]);

  const stats = useMemo(() => {
    const porMes = {};
    MESES.forEach(m => {
      const ts = trabajos.filter(t => t.mes === m.value);
      const gs = gastos.filter(g => g.mes === m.value);
      const fs = facturas.filter(f => f.mes === m.value && f.tipo === "compra");
      const totalGastos = gs.reduce((s, g) => s + Number(g.valor_total || 0), 0);
      const totalFacturasCompra = fs.reduce((s, f) => s + Number(f.monto || 0), 0);
      porMes[m.value] = {
        ingresos: ts.reduce((s, t) => s + Number(t.valor), 0),
        count: ts.length,
        pagado: ts.filter(t => ["PAGADO","FACTURADO"].includes(t.estado_pago)).reduce((s, t) => s + Number(t.valor), 0),
        pendiente: ts.filter(t => ["EN PROCESO","NO FACTURADO","PENDIENTE"].includes(t.estado_pago)).reduce((s, t) => s + Number(t.valor), 0),
        gastos: totalGastos + totalFacturasCompra,
        gastosSolo: totalGastos,
        facturasCompra: totalFacturasCompra,
      };
    });
    return { porMes, mesFiltrado: trabajos.filter(t => t.mes === filtroMes) };
  }, [trabajos, gastos, facturas, filtroMes]);

  const trabajosFiltrados = useMemo(() => trabajos.filter(t => t.mes === filtroMes).filter(t => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return [t.clinica, t.doctor, t.paciente, t.tipo, t.estado_pago].some(v => v?.toLowerCase().includes(q));
  }), [trabajos, filtroMes, busqueda]);

  const gastosFiltrados = useMemo(() => gastos.filter(g => g.mes === filtroMes), [gastos, filtroMes]);
  const invFiltrado = useMemo(() => inventario.filter(i => filtroInvCat === "Todas" || i.categoria === filtroInvCat), [inventario, filtroInvCat]);
  const stockBajo = useMemo(() => inventario.filter(i => i.cantidad <= i.cantidad_minima), [inventario]);

  const toggleEntregaT = (id) => {
    const next = trabajos.map(t => {
      if (t.id !== id) return t;
      const nuevoEntregado = !t.entregado;
      const nuevoEstado = nuevoEntregado && t.estado_pago === "EN PROCESO" ? "FACTURAR" : t.estado_pago;
      const estadoFinal = !nuevoEntregado && t.estado_pago === "FACTURAR" ? "EN PROCESO" : nuevoEstado;
      return { ...t, entregado: nuevoEntregado, estado_pago: estadoFinal };
    });
    setTrabajos(next); guardarTodo(next, clinicas, gastos, inventario);
  };

  const saveT = () => {
    const nextId = Math.max(0, ...trabajos.map(x => x.id)) + 1;
    const nextOt = editandoT !== null ? formT.nro_ot : `OT-${String(nextId).padStart(3,"0")}`;
    let next = editandoT !== null ? trabajos.map(t => t.id === editandoT ? { ...formT, id: editandoT } : t) : [...trabajos, { ...formT, id: nextId, nro_ot: nextOt }];
    setTrabajos(next); guardarTodo(next, clinicas, gastos, inventario);
    setShowFormT(false); setEditandoT(null); setFormT(emptyT);
  };
  const editT = (t) => { setFormT({ ...t }); setEditandoT(t.id); setShowFormT(true); };
  const delT = (id) => { if (!window.confirm("¿Eliminar?")) return; const next = trabajos.filter(t => t.id !== id); setTrabajos(next); guardarTodo(next, clinicas, gastos, inventario); };

  const saveC = () => {
    let next = editandoC !== null
      ? clinicas.map(x => x.id === editandoC ? { ...formC, id: editandoC } : x)
      : [...clinicas, { ...formC, id: Math.max(0, ...clinicas.map(x => x.id)) + 1 }];
    setClinicas(next); guardarTodo(trabajos, next, gastos, inventario);
    setShowFormC(false); setEditandoC(null); setFormC({ nombre: "", localidad: "Villarrica", doctor: "", telefono: "", direccion: "", email: "", estado: "PROSPECTO" });
  };
  const editC = (c) => { setFormC({ ...c }); setEditandoC(c.id); setShowFormC(true); };

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





  // ── HANDLERS METAS ──
  const saveMeta = () => {
    const next = { ...metas, [filtroMes]: Number(metaInput)||0 };
    setMetas(next); guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, facturas, eventos, next);
    setEditandoMeta(false);
  };



  // ── HANDLERS COTIZACIONES ──
  const saveCot = (cot) => {
    const nextId = Math.max(0, ...cotizaciones.map(x=>x.id), 0) + 1;
    const nroCot = `COT-${String(nextId).padStart(3,"0")}`;
    let next;
    if (editandoCot !== null) {
      next = cotizaciones.map(x => x.id === editandoCot ? { ...cot, id: editandoCot } : x);
    } else {
      next = [...cotizaciones, { ...cot, id: nextId, nro: nroCot, fecha_creacion: new Date().toLocaleDateString("es-CL"), estado: "PENDIENTE" }];
    }
    setCotizaciones(next);
    const datos = { trabajos, clinicas, gastos, inventario, capitalBase, facturas, eventos, metas, deudas, actividad, cotizaciones: next };
    guardarDatos(datos);
    setShowFormCot(false); setEditandoCot(null);
    setFormCot({ clinica:"", doctor:"", fecha:"", validez:"30", observaciones:"", items:[] });
  };
  const delCot = (id) => {
    if (!window.confirm("¿Eliminar cotización?")) return;
    const next = cotizaciones.filter(c=>c.id!==id);
    setCotizaciones(next);
    const datos = { trabajos, clinicas, gastos, inventario, capitalBase, facturas, eventos, metas, deudas, actividad, cotizaciones: next };
    guardarDatos(datos);
  };
  const toggleEstadoCot = (id) => {
    const estados = ["PENDIENTE","ACEPTADA","RECHAZADA"];
    const next = cotizaciones.map(c => {
      if (c.id !== id) return c;
      const idx = estados.indexOf(c.estado);
      return { ...c, estado: estados[(idx+1)%estados.length] };
    });
    setCotizaciones(next);
    const datos = { trabajos, clinicas, gastos, inventario, capitalBase, facturas, eventos, metas, deudas, actividad, cotizaciones: next };
    guardarDatos(datos);
  };

  // ── HANDLERS DEUDAS ──
  const saveD = () => {
    const next = [...deudas, { ...formD, id: Math.max(0,...deudas.map(x=>x.id),0)+1 }];
    setDeudas(next); guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, facturas, eventos, metas, next);
    setShowFormD(false); setFormD({ clinica:"", monto:"", desde:"", descripcion:"", estado:"PENDIENTE" });
  };
  const delD = (id) => { const next = deudas.filter(d=>d.id!==id); setDeudas(next); guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, facturas, eventos, metas, next); };
  const toggleDeuda = (id) => { const next = deudas.map(d=>d.id===id?{...d,estado:d.estado==="PENDIENTE"?"COBRADA":"PENDIENTE"}:d); setDeudas(next); guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, facturas, eventos, metas, next); };

  const mesActual = stats.porMes[filtroMes] || { ingresos: 0, count: 0, pagado: 0, pendiente: 0, gastos: 0 };

  // ── LOGIN ──
  const [logueado, setLogueado] = useState(() => sessionStorage.getItem("lab_auth") === "ok");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (USUARIOS.some(u => u.usuario === loginUser && u.clave === loginPass)) {
      sessionStorage.setItem("lab_auth", "ok");
      const nombreUsuario = loginUser === "20.1821.180-0" ? "Álvaro" : "Mayra";
      sessionStorage.setItem("lab_usuario", nombreUsuario);
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
        .pill-fact { background: rgba(109,40,217,0.3); color: #c4b5fd; border-color: #7c3aed; }
        .pill-nofact { background: rgba(127,29,29,0.5); color: #fca5a5; border-color: #7f1d1d; }
        .pill-proc { background: rgba(120,53,15,0.5); color: #fcd34d; border-color: #78350f; }
        .pill-pend { background: rgba(39,39,42,0.5); color: #a1a1aa; border-color: #3f3f46; }
        .pill-entregado { background: rgba(6,78,59,0.4); color: #4ade80; border-color: #166534; font-weight: 700; }
        .pill-convenio { background: rgba(245,158,11,0.2); color: #fbbf24; border-color: #d97706; font-weight: 700; letter-spacing: 0.5px; }
        .card-convenio { background: linear-gradient(135deg, #18181b 0%, #1c1a0f 100%); border: 2px solid #f59e0b; border-radius: 10px; box-shadow: 0 0 16px rgba(245,158,11,0.25); }
        .pill-facturar { background: rgba(29,78,216,0.3); color: #93c5fd; border-color: #1d4ed8; font-weight: 700; }
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
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ position:"relative" }}>
            <input
              style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"20px", padding:"7px 14px 7px 32px", color:"#f4f4f5", fontFamily:"monospace", fontSize:"12px", width:"180px", outline:"none" }}
              placeholder="🔍 Buscar..."
              value={busquedaGlobal}
              onChange={e=>setBusquedaGlobal(e.target.value)}
            />
            {busquedaGlobal && (
              <button onClick={()=>setBusquedaGlobal("")} style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#71717a", cursor:"pointer", fontSize:"14px", padding:0, lineHeight:1 }}>✕</button>
            )}
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:"11px", color:"#52525b" }}>Álvaro Jofre K.</p>
            {stockBajo.length > 0 && <p style={{ fontSize:"11px", color:"#f59e0b", fontWeight:700 }}>⚠ {stockBajo.length} stock bajo</p>}
          </div>
        </div>
      </div>

      {/* BUSCADOR GLOBAL */}
      {busquedaGlobal && (
        <div style={{ background:"#09090b", borderBottom:"1px solid #27272a", padding:"8px 20px" }}>
          <div style={{ maxWidth:"900px", margin:"0 auto" }}>
            {(() => {
              const q = busquedaGlobal.toLowerCase();
              const resultados = trabajos.filter(t =>
                [t.clinica,t.doctor,t.paciente,t.tipo,t.estado_pago,t.nro_ot,t.observaciones].some(v=>v?.toLowerCase().includes(q))
              );
              return resultados.length === 0
                ? <p style={{ color:"#52525b", fontSize:"13px", padding:"8px 0" }}>Sin resultados para "{busquedaGlobal}"</p>
                : (
                  <div>
                    <p style={{ fontSize:"11px", color:"#71717a", marginBottom:"8px" }}>{resultados.length} resultado{resultados.length!==1?"s":""} encontrado{resultados.length!==1?"s":""}</p>
                    {resultados.slice(0,8).map(t=>{
                      const esConv = CLINICAS_CONVENIO.includes(t.clinica);
                      return (
                        <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#18181b", borderRadius:"8px", marginBottom:"6px", border:`1px solid ${esConv?"#f59e0b":"#3f3f46"}`, gap:"12px", flexWrap:"wrap" }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", gap:"6px", alignItems:"center", flexWrap:"wrap", marginBottom:"3px" }}>
                              {t.nro_ot && <span style={{ fontSize:"10px", background:"#27272a", color:"#22d3ee", border:"1px solid #164e63", padding:"1px 6px", borderRadius:"3px", fontFamily:"monospace", fontWeight:700 }}>{t.nro_ot}</span>}
                              <span className={`pill ${PILL_CLASS[t.estado_pago]||"pill-pend"}`} style={{ fontSize:"10px", padding:"1px 6px" }}>{t.estado_pago}</span>
                              <span style={{ fontSize:"10px", color:"#52525b" }}>{mesLabel(t.mes)}</span>
                            </div>
                            <p style={{ color:"#fff", fontSize:"13px", fontWeight:600 }}>{t.tipo}</p>
                            <p style={{ color:esConv?"#f59e0b":"#71717a", fontSize:"11px" }}>{esConv?"⭐ ":""}{t.clinica}{t.paciente&&t.paciente!=="-"?" · "+t.paciente:""}</p>
                          </div>
                          <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"14px", whiteSpace:"nowrap" }}>{fmt(t.valor)}</p>
                        </div>
                      );
                    })}
                    {resultados.length > 8 && <p style={{ fontSize:"11px", color:"#52525b", textAlign:"center", marginTop:"4px" }}>...y {resultados.length-8} más. Busca en Trabajos para ver todos.</p>}
                  </div>
                );
            })()}
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ borderBottom:"1px solid #27272a", display:"flex", overflowX:"auto" }} className="scrollbar-hide">
        {[["dashboard","📊 Resumen"],["trabajos","🔧 Trabajos"],["gastos","💸 Gastos"],["inventario","📦 Inventario"],["clinicas","🏥 Clínicas"],["facturas","🧾 Facturas"],["calendario","📅 Calendario"],["metas","🎯 Metas"],["ranking","🏆 Ranking"],["deudas","💰 Deudas"],["arancel","📋 Arancel"],["convenio","🤝 Convenio"],["cotizaciones","📄 Cotizador"]].map(([k,l]) => (
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
              <span style={{ color:"#fb923c", fontWeight:700 }}>{trabajosFiltrados.filter(t=>t.estado_pago==="FACTURAR").length > 0 ? `${trabajosFiltrados.filter(t=>t.estado_pago==="FACTURAR").length} por facturar` : ""}</span>
            </div>
            {trabajosFiltrados.length===0 && <div className="card" style={{ padding:"40px", textAlign:"center", color:"#52525b", fontSize:"14px" }}>Sin trabajos este mes</div>}
            {trabajosFiltrados.map(t => {
              const esConv = CLINICAS_CONVENIO.includes(t.clinica);
              return (
              <div key={t.id} className={esConv?"card-convenio":"card"} style={{ padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"6px" }}>
                      <span style={{ fontSize:"11px", background:"#27272a", color:"#71717a", padding:"2px 8px", borderRadius:"4px" }}>{t.area}</span>
                      <span className={`pill ${PILL_CLASS[t.estado_pago]||"pill-pend"}`}>{t.estado_pago}</span>
                      {t.entregado && <span className="pill pill-entregado">✅ Entregado</span>}
                      {t.nro_factura && <span style={{ fontSize:"11px", color:"#52525b" }}>Fact.#{t.nro_factura}</span>}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"3px" }}>
                      {t.nro_ot && <span style={{ fontSize:"10px", background:"#27272a", color:"#22d3ee", border:"1px solid #164e63", padding:"2px 8px", borderRadius:"4px", fontFamily:"monospace", fontWeight:700, letterSpacing:"1px" }}>{t.nro_ot}</span>}
                      <p style={{ fontWeight:700, color:"#fff", fontSize:"14px", margin:0 }}>{t.tipo}</p>
                    </div>
                    <p style={{ fontSize:"12px", color:esConv?"#f59e0b":"#71717a", fontWeight:esConv?700:400 }}>{esConv?"⭐ ":""}{t.clinica} · {t.doctor}</p>
                    {t.paciente && t.paciente!=="-" && <p style={{ fontSize:"12px", color:"#52525b" }}>Pac: {t.paciente}</p>}
                    {t.observaciones && <p style={{ fontSize:"11px", color:"#3f3f46", fontStyle:"italic", marginTop:"3px" }}>"{t.observaciones}"</p>}
                    <div style={{ display:"flex", gap:"12px", marginTop:"4px" }}>
                      {t.fecha_ingreso && <span style={{ fontSize:"11px", color:"#3f3f46" }}>Ing: {t.fecha_ingreso}</span>}
                      {t.fecha_entrega && <span style={{ fontSize:"11px", color:"#3f3f46" }}>Ent: {t.fecha_entrega}</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                    <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"16px" }}>{fmt(t.valor)}</p>
                    <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", justifyContent:"flex-end" }}>
                      <button onClick={()=>toggleEntregaT(t.id)} style={{ fontSize:"11px", padding:"4px 10px", borderRadius:"20px", cursor:"pointer", border:"none", fontFamily:"monospace", fontWeight:700, background:t.entregado?"#7c2d12":"#14532d", color:t.entregado?"#fb923c":"#4ade80" }}>
                        {t.entregado?"↩ Pendiente":"✅ Entregar"}
                      </button>
                      <button className="bsm" onClick={()=>editT(t)}>✏️</button>
                      <button className="bsm" style={{ color:"#f87171" }} onClick={()=>delT(t.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
            {showFormT && (
              <div className="overlay">
                <div className="modal">
                  <p className="tf" style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>{editandoT?"Editar Trabajo":"Nuevo Trabajo"}</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                    <div><label className="lbl">Mes</label><select className="inp" value={formT.mes} onChange={e=>setFormT(f=>({...f,mes:e.target.value}))}>{MESES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
                    <div><label className="lbl">Área</label><select className="inp" value={formT.area} onChange={e=>setFormT(f=>({...f,area:e.target.value}))}>{AREAS.map(a=><option key={a}>{a}</option>)}</select></div>
                  </div>
                  <div style={{ marginBottom:"12px" }}>
                    <label className="lbl">Clínica</label>
                    <input className="inp" list="lista-clinicas" value={formT.clinica} onChange={e=>{
                      const clin = clinicas.find(c=>c.nombre===e.target.value);
                      setFormT(f=>({...f, clinica:e.target.value, doctor: clin?.doctor || f.doctor}));
                    }} placeholder="Selecciona o escribe..."/>
                    <datalist id="lista-clinicas">
                      {clinicas.map(c=><option key={c.id} value={c.nombre}/>)}
                    </datalist>
                  </div>
                  {[["Doctor/a","doctor"],["Paciente","paciente"],["Tipo de trabajo","tipo"],["Localidad","localidad"]].map(([lb,k])=>(
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
                  {editandoT && formT.nro_ot && <div style={{ marginBottom:"12px" }}><label className="lbl">N° OT</label><input className="inp" value={formT.nro_ot} readOnly style={{ opacity:0.5, cursor:"not-allowed" }}/></div>}
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
            {(() => {
              const factCompra = facturas.filter(f=>f.mes===filtroMes&&f.tipo==="compra");
              const totalGastos = gastosFiltrados.reduce((s,g)=>s+Number(g.valor_total||0),0);
              const totalFactComp = factCompra.reduce((s,f)=>s+Number(f.monto||0),0);
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
                    <div className="card" style={{ padding:"14px" }}>
                      <p className="lbl">Gastos registrados</p>
                      <p style={{ fontSize:"16px", fontWeight:700, color:"#f87171" }}>{fmt(totalGastos)}</p>
                    </div>
                    <div className="card" style={{ padding:"14px" }}>
                      <p className="lbl">Facturas de compra</p>
                      <p style={{ fontSize:"16px", fontWeight:700, color:"#f87171" }}>{fmt(totalFactComp)}</p>
                    </div>
                    <div className="card" style={{ padding:"14px", borderColor:"#7f1d1d" }}>
                      <p className="lbl">Total gastos</p>
                      <p style={{ fontSize:"16px", fontWeight:700, color:"#f87171" }}>{fmt(totalGastos+totalFactComp)}</p>
                    </div>
                  </div>
                  {factCompra.length > 0 && (
                    <div className="card" style={{ padding:"10px 16px", fontSize:"12px", color:"#71717a" }}>
                      💡 Incluye {factCompra.length} factura{factCompra.length!==1?"s":""} de compra · {fmt(totalFactComp)}
                    </div>
                  )}
                </div>
              );
            })()}
            {gastosFiltrados.length===0 && <div className="card" style={{ padding:"40px", textAlign:"center", color:"#52525b" }}>Sin gastos este mes</div>}
            {gastosFiltrados.map(g=>(
              <div key={g.id} className="card" style={{ padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:"12px" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:"6px", marginBottom:"6px", flexWrap:"wrap" }}>
                      <span style={{ fontSize:"11px", background:"#27272a", color:"#71717a", padding:"2px 8px", borderRadius:"4px" }}>{g.categoria}</span>
                      <span style={{ fontSize:"11px", padding:"2px 8px", borderRadius:"4px", background: g.tipo_gasto==="Fijo"?"rgba(127,29,29,0.5)": g.tipo_gasto==="Variable"?"rgba(124,45,18,0.5)":"rgba(76,29,149,0.5)", color: g.tipo_gasto==="Fijo"?"#f87171": g.tipo_gasto==="Variable"?"#fb923c":"#a78bfa" }}>{g.tipo_gasto||"Variable"}</span>
                    </div>
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
              const expandida = fichaClinicaId === c.id;
              const esConvClinica = CLINICAS_CONVENIO.includes(c.nombre);
              return (
                <div key={c.id} className={esConvClinica?"card-convenio":"card"} style={{ padding:0, overflow:"hidden" }}>
                  {esConvClinica && (()=>{
                    const mesHoy=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
                    const tMes=trabajos.filter(t=>t.clinica===c.nombre&&t.mes===mesHoy).length;
                    const META=10;
                    const pct=Math.min(Math.round(tMes/META*100),100);
                    const activo=tMes>=META;
                    return (
                      <div>
                        <div style={{ background:"linear-gradient(90deg,#92400e,#d97706)", padding:"6px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontSize:"11px", color:"#fef3c7", fontWeight:700, letterSpacing:"1px" }}>⭐ CLÍNICA CON CONVENIO</span>
                          <span style={{ fontSize:"11px", color:activo?"#fff":"#fef3c7", fontWeight:700 }}>{tMes}/{META} trabajos · {activo?"✅ ACTIVO":"⏳ falta "+(META-tMes)}</span>
                        </div>
                        <div style={{ background:"#78350f", height:"5px" }}>
                          <div style={{ background:activo?"#4ade80":"#fbbf24", height:"5px", width:`${pct}%`, transition:"width 0.5s" }}/>
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{ padding:"16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px", flexWrap:"wrap" }}>
                          <p style={{ fontWeight:700, color:esConvClinica?"#fbbf24":"#fff", fontSize:esConvClinica?"15px":"14px" }}>{c.nombre}</p>
                          <span className={`pill ${c.estado==="CLIENTE"?"pill-pagado":"pill-pend"}`}>{c.estado}</span>
                          {esConvClinica && <span className="pill pill-convenio">⭐ CONVENIO ACTIVO</span>}
                        </div>
                        <p style={{ fontSize:"12px", color:"#71717a" }}>{c.localidad} · {c.doctor}</p>
                        {c.telefono && <p style={{ fontSize:"12px", color:"#52525b" }}>📞 {c.telefono}</p>}
                        {c.direccion && <p style={{ fontSize:"11px", color:"#3f3f46" }}>{c.direccion}</p>}
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ color:"#22d3ee", fontWeight:700 }}>{fmt(tCli.reduce((s,t)=>s+Number(t.valor),0))}</p>
                        <p style={{ fontSize:"12px", color:"#52525b", marginBottom:"6px" }}>{tCli.length} trabajo{tCli.length!==1?"s":""}</p>
                        <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end", flexWrap:"wrap", marginTop:"6px" }}>
                          <button onClick={()=>editC(c)} style={{ fontSize:"11px", padding:"4px 12px", borderRadius:"20px", cursor:"pointer", border:"1px solid #52525b", fontFamily:"monospace", fontWeight:700, background:"transparent", color:"#a1a1aa" }}>✏️ Editar</button>
                          {tCli.length > 0 && (
                            <button onClick={()=>setFichaClinicaId(expandida?null:c.id)}
                              style={{ fontSize:"11px", padding:"4px 12px", borderRadius:"20px", cursor:"pointer", border:"1px solid", fontFamily:"monospace", fontWeight:700,
                                background:expandida?"#27272a":"transparent",
                                color:expandida?"#f4f4f5":"#22d3ee",
                                borderColor:expandida?"#52525b":"#22d3ee" }}>
                              {expandida?"▲ Ocultar":"▼ Ver trabajos"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DETALLE DE TRABAJOS */}
                    {expandida && tCli.length > 0 && (
                      <div style={{ marginTop:"16px", borderTop:"1px solid #27272a", paddingTop:"16px" }}>
                        <p style={{ fontSize:"10px", color:"#71717a", fontWeight:700, textTransform:"uppercase", letterSpacing:"2px", marginBottom:"12px" }}>
                          Historial de trabajos · {tCli.length} en total
                        </p>
                        {(() => {
                          const mesesConTrabajos = [...new Set(tCli.map(t=>t.mes))].sort((a,b)=>b>a?1:-1);
                          return mesesConTrabajos.map(mes => {
                            const tMes = tCli.filter(t=>t.mes===mes).sort((a,b)=>a.fecha_ingreso>b.fecha_ingreso?-1:1);
                            const totalMes = tMes.reduce((s,t)=>s+Number(t.valor),0);
                            return (
                              <div key={mes} style={{ marginBottom:"16px" }}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px", padding:"6px 10px", background:"#09090b", borderRadius:"6px" }}>
                                  <p style={{ fontSize:"11px", color:"#22d3ee", fontWeight:700 }}>{mesLabel(mes)}</p>
                                  <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                                    <span style={{ fontSize:"11px", color:"#52525b" }}>{tMes.length} trabajo{tMes.length!==1?"s":""}</span>
                                    <span style={{ fontSize:"12px", color:"#22d3ee", fontWeight:700 }}>{fmt(totalMes)}</span>
                                  </div>
                                </div>
                                {tMes.map((t,idx)=>(
                                  <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"8px 4px", borderBottom: idx<tMes.length-1?"1px solid #27272a":"none", gap:"12px", flexWrap:"wrap" }}>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"4px" }}>
                                        {t.nro_ot && <span style={{ fontSize:"10px", background:"#27272a", color:"#22d3ee", border:"1px solid #164e63", padding:"1px 6px", borderRadius:"3px", fontFamily:"monospace", fontWeight:700 }}>{t.nro_ot}</span>}
                                        <span style={{ fontSize:"10px", background:"#27272a", color:"#71717a", padding:"1px 6px", borderRadius:"3px" }}>{t.area}</span>
                                        <span className={`pill ${PILL_CLASS[t.estado_pago]||"pill-pend"}`} style={{ fontSize:"10px", padding:"1px 6px" }}>{t.estado_pago}</span>
                                      </div>
                                      <p style={{ color:"#f4f4f5", fontSize:"13px", fontWeight:600 }}>{t.tipo}</p>
                                      {t.paciente && t.paciente!=="-" && <p style={{ color:"#52525b", fontSize:"11px" }}>Pac: {t.paciente}</p>}
                                      {t.observaciones && <p style={{ color:"#3f3f46", fontSize:"11px", fontStyle:"italic" }}>"{t.observaciones}"</p>}
                                      <div style={{ display:"flex", gap:"10px", marginTop:"3px" }}>
                                        {t.fecha_ingreso && <span style={{ fontSize:"10px", color:"#3f3f46" }}>Ing: {t.fecha_ingreso}</span>}
                                        {t.fecha_entrega && <span style={{ fontSize:"10px", color:"#3f3f46" }}>Ent: {t.fecha_entrega}</span>}
                                      </div>
                                    </div>
                                    <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"14px", whiteSpace:"nowrap" }}>{fmt(t.valor)}</p>
                                  </div>
                                ))}
                              </div>
                            );
                          });
                        })()}
                        <div style={{ marginTop:"4px", paddingTop:"12px", borderTop:"1px solid #3f3f46", display:"flex", justifyContent:"flex-end" }}>
                          <p style={{ fontSize:"14px", color:"#22d3ee", fontWeight:700 }}>Total general: {fmt(tCli.reduce((s,t)=>s+Number(t.valor),0))}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {showFormC && (
              <div className="overlay">
                <div className="modal">
                  <p className="tf" style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>{editandoC?"Editar Clínica":"Nueva Clínica"}</p>
                  {[["Nombre","nombre"],["Localidad","localidad"],["Doctor/a","doctor"],["Teléfono","telefono"],["Dirección","direccion"],["Email","email"]].map(([lb,k])=>(
                    <div key={k} style={{ marginBottom:"12px" }}><label className="lbl">{lb}</label><input className="inp" value={formC[k]} onChange={e=>setFormC(f=>({...f,[k]:e.target.value}))}/></div>
                  ))}
                  <div style={{ marginBottom:"16px" }}><label className="lbl">Estado</label><select className="inp" value={formC.estado} onChange={e=>setFormC(f=>({...f,estado:e.target.value}))}><option>PROSPECTO</option><option>CLIENTE</option><option>INACTIVO</option></select></div>
                  <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                    <button className="btng" onClick={()=>{setShowFormC(false);setEditandoC(null);}}>Cancelar</button>
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


        {/* ════ CALENDARIO ════ */}
        {tab === "calendario" && (
          <Calendario
            trabajos={trabajos}
            setTrabajos={setTrabajos}
            eventos={eventos}
            setEventos={setEventos}
            guardarTodo={guardarTodo}
            clinicas={clinicas}
            gastos={gastos}
            inventario={inventario}
            capitalBase={capitalBase}
            facturas={facturas}
            metas={metas}
          />
        )}

        {/* ════ METAS ════ */}
        {tab === "metas" && (() => {
          const fmtCLP = (n) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(n);
          const metaMes = metas[filtroMes] || {};
          const metaIngresos = metaMes.ingresos || 0;
          const metaTrabajos = metaMes.trabajos || 0;
          const metaGastos = metaMes.gastos || 0;

          const ingresadoMes = mesActual.ingresos || 0;
          const trabajosMes = mesActual.count || 0;
          const gastosMes = mesActual.gastos || 0;

          const pctIng = metaIngresos > 0 ? Math.min(Math.round(ingresadoMes/metaIngresos*100),100) : 0;
          const pctTrab = metaTrabajos > 0 ? Math.min(Math.round(trabajosMes/metaTrabajos*100),100) : 0;
          const pctGas = metaGastos > 0 ? Math.min(Math.round(gastosMes/metaGastos*100),100) : 0;

          const guardarMeta = () => {
            const next = { ...metas, [filtroMes]: { ingresos: Number(editMetaForm.ingresos)||0, trabajos: Number(editMetaForm.trabajos)||0, gastos: Number(editMetaForm.gastos)||0 }};
            setMetas(next); guardarTodo(trabajos, clinicas, gastos, inventario, capitalBase, facturas, eventos, next);
            setEditandoMeta(false);
          };

          const BarraMeta = ({label, actual, meta, pct, colorOk, colorMal, unidad, invertir}) => {
            const bien = invertir ? gastosMes <= metaGastos : pct >= 100;
            const color = meta > 0 ? (pct >= 100 ? (invertir ? colorMal : colorOk) : pct >= 60 ? "#f59e0b" : (invertir ? colorOk : colorMal)) : "#52525b";
            return (
              <div style={{ background:"#09090b", borderRadius:"8px", padding:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                  <div>
                    <p style={{ fontSize:"12px", color:"#d4d4d8", fontWeight:600 }}>{label}</p>
                    <p style={{ fontSize:"11px", color:"#52525b", marginTop:"2px" }}>Meta: {meta > 0 ? (unidad==="$" ? fmtCLP(meta) : `${meta} trabajos`) : "Sin meta definida"}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:"20px", fontWeight:700, color }}>{unidad==="$" ? fmtCLP(actual) : actual}</p>
                    {meta > 0 && <p style={{ fontSize:"12px", color, fontWeight:700 }}>{pct}%</p>}
                  </div>
                </div>
                {meta > 0 && (
                  <div style={{ background:"#27272a", borderRadius:"99px", height:"8px", overflow:"hidden" }}>
                    <div style={{ background:color, height:"8px", borderRadius:"99px", width:`${Math.min(pct,100)}%`, transition:"width 0.5s" }}/>
                  </div>
                )}
                {meta > 0 && pct >= 100 && !invertir && <p style={{ fontSize:"11px", color:"#4ade80", marginTop:"6px", fontWeight:700 }}>🎉 ¡Meta cumplida!</p>}
                {meta > 0 && invertir && gastosMes > metaGastos && <p style={{ fontSize:"11px", color:"#f87171", marginTop:"6px", fontWeight:700 }}>⚠️ Gastos sobre el límite</p>}
              </div>
            );
          };

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {/* Selector mes */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <label style={{ fontSize:"11px", color:"#71717a" }}>Mes:</label>
                  <select style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", fontFamily:"monospace", fontSize:"13px" }} value={filtroMes} onChange={e=>setFiltroMes(e.target.value)}>
                    {MESES.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <button onClick={()=>{ setEditMetaForm({ ingresos:String(metaIngresos||""), trabajos:String(metaTrabajos||""), gastos:String(metaGastos||"") }); setEditandoMeta(true); }} style={{ background:"#27272a", border:"1px solid #52525b", color:"#f4f4f5", padding:"8px 16px", borderRadius:"6px", fontSize:"13px", cursor:"pointer", fontFamily:"monospace" }}>✏️ Editar metas</button>
              </div>

              {/* Modal editar metas */}
              {editandoMeta && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:"16px" }}>
                  <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"12px", width:"100%", maxWidth:"380px", padding:"24px" }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"4px" }}>🎯 Metas · {MESES.find(m=>m.value===filtroMes)?.label}</p>
                    <p style={{ fontSize:"12px", color:"#52525b", marginBottom:"16px" }}>Deja en 0 si no quieres usar esa meta</p>
                    {[
                      ["Meta de ingresos ($)", "ingresos", "Ej: 800000"],
                      ["Meta de trabajos", "trabajos", "Ej: 20"],
                      ["Límite de gastos ($)", "gastos", "Ej: 150000"],
                    ].map(([lbl, key, ph])=>(
                      <div key={key} style={{ marginBottom:"12px" }}>
                        <label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>{lbl}</label>
                        <input type="number" style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"10px 14px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"14px", boxSizing:"border-box" }} placeholder={ph} value={editMetaForm[key]} onChange={e=>setEditMetaForm(f=>({...f,[key]:e.target.value}))}/>
                      </div>
                    ))}
                    <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end", marginTop:"4px" }}>
                      <button style={{ background:"transparent", border:"1px solid #52525b", color:"#a1a1aa", padding:"9px 20px", borderRadius:"7px", fontSize:"13px", cursor:"pointer", fontFamily:"monospace" }} onClick={()=>setEditandoMeta(false)}>Cancelar</button>
                      <button style={{ background:"#22d3ee", color:"#09090b", padding:"9px 20px", borderRadius:"7px", fontWeight:700, fontSize:"13px", cursor:"pointer", border:"none", fontFamily:"monospace" }} onClick={guardarMeta}>Guardar</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Barras de progreso */}
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                <BarraMeta label="💰 Ingresos del mes" actual={ingresadoMes} meta={metaIngresos} pct={pctIng} colorOk="#4ade80" colorMal="#f87171" unidad="$" invertir={false}/>
                <BarraMeta label="🔧 Trabajos realizados" actual={trabajosMes} meta={metaTrabajos} pct={pctTrab} colorOk="#4ade80" colorMal="#f87171" unidad="N" invertir={false}/>
                <BarraMeta label="💸 Control de gastos" actual={gastosMes} meta={metaGastos} pct={pctGas} colorOk="#4ade80" colorMal="#f87171" unidad="$" invertir={true}/>
              </div>

              {/* Historial */}
              <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, color:"#71717a", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"12px" }}>Historial 2026</p>
                {MESES.filter(m => metas[m.value] && (metas[m.value].ingresos||metas[m.value].trabajos||metas[m.value].gastos)).map(m => {
                  const mt = metas[m.value] || {};
                  const ing = (stats.porMes[m.value]||{}).ingresos||0;
                  const trab = (stats.porMes[m.value]||{}).count||0;
                  const pI = mt.ingresos>0 ? Math.min(Math.round(ing/mt.ingresos*100),100) : null;
                  return (
                    <div key={m.value} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #27272a" }}>
                      <span style={{ color:"#d4d4d8", fontSize:"13px" }}>{m.label}</span>
                      <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                        {pI !== null && <span style={{ color: pI>=100?"#4ade80":pI>=60?"#f59e0b":"#f87171", fontWeight:700, fontSize:"12px" }}>💰 {pI}%</span>}
                        {mt.trabajos>0 && <span style={{ color: trab>=mt.trabajos?"#4ade80":"#f59e0b", fontSize:"12px" }}>🔧 {trab}/{mt.trabajos}</span>}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(metas).length===0 && <p style={{ color:"#52525b", fontSize:"13px" }}>Sin metas registradas aún</p>}
              </div>
            </div>
          );
        })()}

        {/* ════ RANKING ANUAL ════ */}
        {tab === "ranking" && (() => {
          const fmtCLP = (n) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(n);
          
          // Ranking por clínica (todo el año)
          const rankClin = {};
          trabajos.forEach(t => {
            if (!rankClin[t.clinica]) rankClin[t.clinica] = { total:0, count:0, cobrado:0 };
            rankClin[t.clinica].total += Number(t.valor);
            rankClin[t.clinica].count += 1;
            if (["PAGADO","FACTURADO"].includes(t.estado_pago)) rankClin[t.clinica].cobrado += Number(t.valor);
          });
          const rankArr = Object.entries(rankClin).sort((a,b)=>b[1].total-a[1].total);
          const maxTotal = rankArr[0]?.[1]?.total || 1;

          // Ranking por área
          const rankArea = {};
          trabajos.forEach(t => {
            if (!rankArea[t.area]) rankArea[t.area] = { total:0, count:0 };
            rankArea[t.area].total += Number(t.valor);
            rankArea[t.area].count += 1;
          });
          const rankAreaArr = Object.entries(rankArea).sort((a,b)=>b[1].total-a[1].total);

          // Ingresos por mes para gráfico anual
          const maxIng = Math.max(...MESES.map(m=>(stats.porMes[m.value]||{}).ingresos||0),1);

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {/* Gráfico anual */}
              <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, color:"#71717a", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"16px" }}>📊 Ingresos mensuales 2026</p>
                <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", height:"100px" }}>
                  {MESES.map(m => {
                    const ing = (stats.porMes[m.value]||{}).ingresos||0;
                    const gas = (stats.porMes[m.value]||{}).gastos||0;
                    const h = Math.round(ing/maxIng*88);
                    const hg = Math.round(gas/maxIng*88);
                    const esActual = m.value === filtroMes;
                    return (
                      <div key={m.value} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
                        {ing>0 && <p style={{ fontSize:"8px", color:"#52525b" }}>{(ing/1000).toFixed(0)}k</p>}
                        <div style={{ width:"100%", display:"flex", alignItems:"flex-end", gap:"1px", height:"88px" }}>
                          <div style={{ flex:1, background: esActual?"#22d3ee":"#164e63", borderRadius:"3px 3px 0 0", height:`${h}%`, minHeight:ing>0?"2px":"0" }}/>
                          <div style={{ flex:1, background:"#7f1d1d", borderRadius:"3px 3px 0 0", height:`${hg}%`, minHeight:gas>0?"2px":"0" }}/>
                        </div>
                        <p style={{ fontSize:"8px", color: esActual?"#22d3ee":"#52525b", fontWeight: esActual?700:400 }}>{m.label.slice(0,3)}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:"16px", marginTop:"8px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"4px" }}><div style={{ width:"8px", height:"8px", borderRadius:"2px", background:"#22d3ee" }}/><span style={{ fontSize:"10px", color:"#71717a" }}>Ingresos</span></div>
                  <div style={{ display:"flex", alignItems:"center", gap:"4px" }}><div style={{ width:"8px", height:"8px", borderRadius:"2px", background:"#7f1d1d" }}/><span style={{ fontSize:"10px", color:"#71717a" }}>Gastos</span></div>
                </div>
              </div>

              {/* Ranking clínicas */}
              <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, color:"#71717a", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"12px" }}>🏆 Ranking clínicas — Todo 2026</p>
                {rankArr.map(([nombre, d], idx) => (
                  <div key={nombre} style={{ marginBottom:"12px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <span style={{ fontSize:"16px", fontWeight:700, color: idx===0?"#fbbf24": idx===1?"#94a3b8": idx===2?"#b45309":"#52525b" }}>{idx===0?"🥇":idx===1?"🥈":idx===2?"🥉":`${idx+1}.`}</span>
                        <span style={{ color:"#d4d4d8", fontSize:"13px" }}>{nombre}</span>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"13px" }}>{fmtCLP(d.total)}</p>
                        <p style={{ color:"#52525b", fontSize:"11px" }}>{d.count} trabajos</p>
                      </div>
                    </div>
                    <div style={{ background:"#27272a", borderRadius:"99px", height:"6px" }}>
                      <div style={{ background: idx===0?"#fbbf24": idx===1?"#94a3b8": idx===2?"#b45309":"#22d3ee", height:"6px", borderRadius:"99px", width:`${d.total/maxTotal*100}%` }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ranking por área */}
              <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, color:"#71717a", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"12px" }}>📋 Por área de trabajo — Todo 2026</p>
                {rankAreaArr.map(([area, d]) => {
                  const maxA = rankAreaArr[0]?.[1]?.total||1;
                  return (
                    <div key={area} style={{ marginBottom:"10px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", marginBottom:"3px" }}>
                        <span style={{ color:"#d4d4d8" }}>{area}</span>
                        <span style={{ color:"#4ade80", fontWeight:700 }}>{fmtCLP(d.total)} <span style={{ color:"#52525b", fontWeight:400 }}>({d.count} trabajos)</span></span>
                      </div>
                      <div style={{ background:"#27272a", borderRadius:"99px", height:"5px" }}>
                        <div style={{ background:"#22c55e", height:"5px", borderRadius:"99px", width:`${d.total/maxA*100}%` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totales anuales */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
                  <p style={{ fontSize:"11px", color:"#71717a", marginBottom:"4px" }}>Total ingresos 2026</p>
                  <p style={{ fontSize:"18px", fontWeight:700, color:"#22d3ee" }}>{fmtCLP(trabajos.reduce((s,t)=>s+Number(t.valor),0))}</p>
                </div>
                <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"16px" }}>
                  <p style={{ fontSize:"11px", color:"#71717a", marginBottom:"4px" }}>Total trabajos 2026</p>
                  <p style={{ fontSize:"18px", fontWeight:700, color:"#fff" }}>{trabajos.length}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ════ DEUDAS ════ */}
        {tab === "deudas" && (() => {
          const fmtCLP = (n) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(n);
          
          // Trabajos FACTURADOS agrupados por clínica (deudas automáticas)
          const facturadosPorClinica = {};
          trabajos.filter(t => t.estado_pago === "FACTURADO").forEach(t => {
            if (!facturadosPorClinica[t.clinica]) facturadosPorClinica[t.clinica] = { trabajos:[], total:0 };
            facturadosPorClinica[t.clinica].trabajos.push(t);
            facturadosPorClinica[t.clinica].total += Number(t.valor);
          });
          const totalFacturado = Object.values(facturadosPorClinica).reduce((s,c)=>s+c.total,0);

          const deudaPendiente = deudas.filter(d=>d.estado==="PENDIENTE").reduce((s,d)=>s+Number(d.monto||0),0);
          const deudaCobrada = deudas.filter(d=>d.estado==="COBRADA").reduce((s,d)=>s+Number(d.monto||0),0);

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:"13px", color:"#71717a" }}>{deudas.filter(d=>d.estado==="PENDIENTE").length + Object.keys(facturadosPorClinica).length} deudas pendientes</p>
                <button style={{ background:"#22d3ee", color:"#09090b", padding:"9px 20px", borderRadius:"7px", fontWeight:700, fontSize:"13px", cursor:"pointer", border:"none", fontFamily:"monospace" }} onClick={()=>setShowFormD(true)}>+ Deuda manual</button>
              </div>

              {/* KPIs */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
                <div style={{ background:"#18181b", border:"1px solid #7c2d12", borderRadius:"10px", padding:"14px" }}>
                  <p style={{ fontSize:"10px", color:"#71717a", marginBottom:"4px" }}>Trabajos facturados</p>
                  <p style={{ fontSize:"16px", fontWeight:700, color:"#fb923c" }}>{fmtCLP(totalFacturado)}</p>
                </div>
                <div style={{ background:"#18181b", border:"1px solid #7f1d1d", borderRadius:"10px", padding:"14px" }}>
                  <p style={{ fontSize:"10px", color:"#71717a", marginBottom:"4px" }}>Deudas manuales</p>
                  <p style={{ fontSize:"16px", fontWeight:700, color:"#f87171" }}>{fmtCLP(deudaPendiente)}</p>
                </div>
                <div style={{ background:"#18181b", border:"1px solid #14532d", borderRadius:"10px", padding:"14px" }}>
                  <p style={{ fontSize:"10px", color:"#71717a", marginBottom:"4px" }}>Cobradas</p>
                  <p style={{ fontSize:"16px", fontWeight:700, color:"#4ade80" }}>{fmtCLP(deudaCobrada)}</p>
                </div>
              </div>

              {/* TRABAJOS FACTURADOS AUTOMÁTICOS */}
              {Object.keys(facturadosPorClinica).length > 0 && (
                <div>
                  <p style={{ fontSize:"11px", color:"#fb923c", fontWeight:700, marginBottom:"8px", textTransform:"uppercase", letterSpacing:"1px" }}>🧾 Trabajos facturados sin cobrar</p>
                  {Object.entries(facturadosPorClinica).map(([clinica, data]) => (
                    <div key={clinica} style={{ background:"#18181b", border:"1px solid #7c2d12", borderRadius:"10px", padding:"16px", marginBottom:"8px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:"12px", flexWrap:"wrap", marginBottom:"8px" }}>
                        <div>
                          <p style={{ fontWeight:700, color:"#fff", fontSize:"14px" }}>{clinica}</p>
                          <p style={{ fontSize:"12px", color:"#71717a" }}>{data.trabajos.length} trabajo{data.trabajos.length>1?"s":""} facturado{data.trabajos.length>1?"s":""}</p>
                        </div>
                        <p style={{ fontWeight:700, fontSize:"18px", color:"#fb923c" }}>{fmtCLP(data.total)}</p>
                      </div>
                      {data.trabajos.map(t => (
                        <div key={t.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 8px", background:"#09090b", borderRadius:"6px", marginBottom:"4px", fontSize:"12px" }}>
                          <span style={{ color:"#d4d4d8" }}>🦷 {t.tipo} {t.paciente&&t.paciente!=="-"?`· ${t.paciente}`:""}</span>
                          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                            <span style={{ color:"#71717a" }}>{t.mes}</span>
                            <span style={{ color:"#fb923c", fontWeight:700 }}>{fmtCLP(t.valor)}</span>
                          </div>
                        </div>
                      ))}
                      <p style={{ fontSize:"10px", color:"#52525b", marginTop:"6px" }}>💡 Cambia el estado a "PAGADO" en Trabajos cuando cobres</p>
                    </div>
                  ))}
                </div>
              )}

              {/* DEUDAS MANUALES */}
              {deudas.length===0 && Object.keys(facturadosPorClinica).length===0 && (
                <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"10px", padding:"40px", textAlign:"center", color:"#52525b" }}>Sin deudas registradas</div>
              )}
              
              {["PENDIENTE","COBRADA"].map(estado => {
                const lista = deudas.filter(d=>d.estado===estado);
                if (lista.length===0) return null;
                return (
                  <div key={estado}>
                    <p style={{ fontSize:"11px", color: estado==="PENDIENTE"?"#f87171":"#4ade80", fontWeight:700, marginBottom:"8px", textTransform:"uppercase", letterSpacing:"1px" }}>{estado==="PENDIENTE"?"⏳ Deudas manuales pendientes":"✅ Cobradas"}</p>
                    {lista.map(d => (
                      <div key={d.id} style={{ background:"#18181b", border:`1px solid ${d.estado==="PENDIENTE"?"#7f1d1d":"#14532d"}`, borderRadius:"10px", padding:"16px", marginBottom:"8px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                          <div style={{ flex:1 }}>
                            <p style={{ fontWeight:700, color:"#fff", fontSize:"14px", marginBottom:"3px" }}>{d.clinica}</p>
                            {d.descripcion && <p style={{ fontSize:"12px", color:"#71717a", marginBottom:"3px" }}>{d.descripcion}</p>}
                            {d.desde && <p style={{ fontSize:"11px", color:"#52525b" }}>Desde: {d.desde}</p>}
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                            <p style={{ fontWeight:700, fontSize:"16px", color: d.estado==="PENDIENTE"?"#f87171":"#4ade80" }}>{fmtCLP(d.monto||0)}</p>
                            <div style={{ display:"flex", gap:"4px" }}>
                              <button onClick={()=>toggleDeuda(d.id)} style={{ fontSize:"11px", padding:"4px 10px", borderRadius:"20px", cursor:"pointer", border:"none", fontFamily:"monospace", fontWeight:700, background: d.estado==="PENDIENTE"?"#14532d":"#7f1d1d", color: d.estado==="PENDIENTE"?"#4ade80":"#f87171" }}>
                                {d.estado==="PENDIENTE"?"✅ Marcar cobrada":"↩ Reabrir"}
                              </button>
                              <button style={{ padding:"5px 10px", fontSize:"12px", borderRadius:"5px", cursor:"pointer", border:"1px solid #52525b", background:"transparent", color:"#f87171" }} onClick={()=>delD(d.id)}>🗑</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {showFormD && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:"16px" }}>
                  <div style={{ background:"#18181b", border:"1px solid #3f3f46", borderRadius:"12px", width:"100%", maxWidth:"400px", padding:"24px" }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>Nueva Deuda</p>
                    <div style={{ marginBottom:"12px" }}><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Clínica / Deudor</label>
                      <input style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} value={formD.clinica} onChange={e=>setFormD(f=>({...f,clinica:e.target.value}))}/></div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                      <div><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Monto ($)</label>
                        <input type="number" style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} value={formD.monto} onChange={e=>setFormD(f=>({...f,monto:e.target.value}))}/></div>
                      <div><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Desde</label>
                        <input type="date" style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} value={formD.desde} onChange={e=>setFormD(f=>({...f,desde:e.target.value}))}/></div>
                    </div>
                    <div style={{ marginBottom:"16px" }}><label style={{ fontSize:"11px", color:"#71717a", display:"block", marginBottom:"4px" }}>Descripción</label>
                      <textarea style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"8px 12px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }} rows={2} value={formD.descripcion} onChange={e=>setFormD(f=>({...f,descripcion:e.target.value}))}/></div>
                    <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                      <button style={{ background:"transparent", border:"1px solid #52525b", color:"#a1a1aa", padding:"9px 20px", borderRadius:"7px", fontSize:"13px", cursor:"pointer", fontFamily:"monospace" }} onClick={()=>setShowFormD(false)}>Cancelar</button>
                      <button style={{ background:"#22d3ee", color:"#09090b", padding:"9px 20px", borderRadius:"7px", fontWeight:700, fontSize:"13px", cursor:"pointer", border:"none", fontFamily:"monospace" }} onClick={saveD}>Guardar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}



        {/* ════ ARANCEL ════ */}
        {tab === "arancel" && (() => {
          const fmtCLP = (n) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(n);
          
          const ARANCEL = [
            {
              categoria: "🦷 Aparatos de Ortodoncia",
              color: "#1e3a5f",
              border: "#3b82f6",
              items: [
                { nombre: "Placa de Expansión o Schwartz", precio: 40000 },
                { nombre: "Placa de Contención (acetato)", precio: 35000 },
                { nombre: "Disyuntor Mc.Namara (sin bandas ni ganchos)", precio: 60000 },
                { nombre: "Disyuntor Hyrax con alambre contorneado (sin bandas)", precio: 60000 },
                { nombre: "Botón de Nance (sin bandas)", precio: 40000 },
                { nombre: "Mantenedor de espacio (sin bandas)", precio: 30000 },
                { nombre: "Placa de Contención Hawley", precio: 40000 },
                { nombre: "Aparato de Mauricio (con tornillo)", precio: 46000 },
                { nombre: "Contención de Begg", precio: 46000 },
                { nombre: "Disyuntor Hass", precio: 58000 },
                { nombre: "Barra Lingual de Nance", precio: 40000 },
                { nombre: "Quad Helix", precio: 50000 },
                { nombre: "Barra Transpalatina (BTP o TPA)", precio: 38000 },
                { nombre: "Bionator 1 (estándar)", precio: 88000 },
                { nombre: "Aparato Monoblock de Mauricio", precio: 48000 },
                { nombre: "Reparaciones simple (Resortes, Retenedores, etc)", precio: 15000 },
                { nombre: "Reparaciones complejas (Arco, Tornillo, etc)", precio: 20000 },
              ]
            },
            {
              categoria: "🦷 Prótesis Removibles",
              color: "#14532d",
              border: "#22c55e",
              items: [
                { nombre: "Prótesis parcial", precio: 65000 },
                { nombre: "Prótesis total", precio: 65000 },
                { nombre: "Prótesis con base metálica", precio: 100000 },
                { nombre: "Prótesis inmediata", precio: 65000 },
                { nombre: "Prótesis cosmética (hasta 3 dientes)", precio: 38000 },
                { nombre: "Prótesis flexibles", precio: 90000 },
                { nombre: "Rebasados total o parcial", precio: 30000 },
                { nombre: "Reparación simple", precio: 25000 },
                { nombre: "Reparación compleja", precio: 25000 },
              ]
            },
            {
              categoria: "😁 Planos",
              color: "#4c1d95",
              border: "#a855f7",
              items: [
                { nombre: "Plano de relajación acrílico", precio: 50000 },
                { nombre: "Plano Estampado", precio: 35000 },
                { nombre: "Plano relajación blando-dura", precio: 50000 },
                { nombre: "Cubetillas de blanqueamiento", precio: 24000 },
                { nombre: "Protector bucal personal simple", precio: 40000 },
                { nombre: "Protector bucal personal doble", precio: 55000 },
                { nombre: "Dientes Provisorios", precio: 15000 },
              ]
            },
            {
              categoria: "🖨️ Impresión 3D",
              color: "#713f12",
              border: "#f59e0b",
              items: [
                { nombre: "1 Arcada", precio: 10000 },
                { nombre: "2 Arcadas", precio: 12000 },
                { nombre: "Planos de relajación (3D)", precio: 70000 },
              ]
            },
            {
              categoria: "🦷 Prótesis Fija — Resinas",
              color: "#7f1d1d",
              border: "#ef4444",
              items: [
                { nombre: "Corona periférica (resina)", precio: 50000 },
                { nombre: "Carillas (resina)", precio: 45000 },
                { nombre: "Incrustación onlay (resina)", precio: 40000 },
                { nombre: "Incrustación inlay (resina)", precio: 33000 },
                { nombre: "Corona sobre implante (resina)", precio: 53000 },
              ]
            },
            {
              categoria: "🦷 Prótesis Fija — Zirconio",
              color: "#1e3a5f",
              border: "#60a5fa",
              items: [
                { nombre: "Prótesis fija plural (por pieza)", precio: 108000 },
                { nombre: "Carillas (zirconio)", precio: 100000 },
                { nombre: "Corona (zirconio)", precio: 107000 },
                { nombre: "Corona sobre implante (zirconio)", precio: 123000 },
                { nombre: "Núcleo zirconio", precio: 70000 },
                { nombre: "Aplicación de cerámica para zirconio", precio: 50000 },
              ]
            },
            {
              categoria: "🦷 Prótesis Fija — E.MAX (Cadcam Silicato)",
              color: "#064e3b",
              border: "#10b981",
              items: [
                { nombre: "Corona periférica (E.MAX)", precio: 100000 },
                { nombre: "Carillas (E.MAX)", precio: 95000 },
                { nombre: "Incrustación (E.MAX)", precio: 94000 },
              ]
            },
          ];

          const arancelFiltrado = ARANCEL.map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
              busqArancel === "" || item.nombre.toLowerCase().includes(busqArancel.toLowerCase())
            )
          })).filter(cat =>
            (catSeleccionada === "Todas" || cat.categoria === catSeleccionada) &&
            cat.items.length > 0
          );

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, color:"#fff" }}>📋 Arancel Dentis 2026</p>

              {/* Buscador */}
              <input
                style={{ background:"#27272a", border:"1px solid #52525b", borderRadius:"6px", padding:"10px 14px", color:"#f4f4f5", width:"100%", fontFamily:"monospace", fontSize:"13px", boxSizing:"border-box" }}
                placeholder="🔍 Buscar trabajo..."
                value={busqArancel}
                onChange={e=>setBusqArancel(e.target.value)}
              />

              {/* Filtro por categoría */}
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {["Todas",...ARANCEL.map(c=>c.categoria)].map(cat=>(
                  <button key={cat} onClick={()=>setCatSeleccionada(cat)} style={{ fontSize:"11px", padding:"4px 10px", borderRadius:"20px", cursor:"pointer", border:"1px solid", fontFamily:"monospace", background: catSeleccionada===cat?"#22d3ee":"transparent", color: catSeleccionada===cat?"#09090b":"#71717a", borderColor: catSeleccionada===cat?"#22d3ee":"#3f3f46" }}>
                    {cat.length > 25 ? cat.slice(0,25)+"..." : cat}
                  </button>
                ))}
              </div>

              {/* Lista por categoría */}
              {arancelFiltrado.map(cat=>(
                <div key={cat.categoria} style={{ background:"#18181b", border:`1px solid ${cat.border}`, borderRadius:"10px", overflow:"hidden" }}>
                  <div style={{ background:cat.color, padding:"10px 16px" }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"13px", fontWeight:700, color:"#fff" }}>{cat.categoria}</p>
                  </div>
                  {cat.items.map((item, idx)=>(
                    <div key={idx} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderBottom: idx<cat.items.length-1?"1px solid #27272a":"none", gap:"12px" }}>
                      <p style={{ color:"#d4d4d8", fontSize:"13px", flex:1 }}>{item.nombre}</p>
                      <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"15px", shrink:0, whiteSpace:"nowrap" }}>{fmtCLP(item.precio)}</p>
                    </div>
                  ))}
                </div>
              ))}

              <p style={{ fontSize:"11px", color:"#52525b", textAlign:"center", marginTop:"4px" }}>* Bandas no incluidas · Urgencias tienen cargo adicional</p>
            </div>
          );
        })()}

        {/* ════ CONVENIO ════ */}
        {tab === "convenio" && (() => {
          const fmtCLP = (n) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(n);

          const ARANCEL_CONVENIO = [
            {
              categoria: "🦷 Aparatos de Ortodoncia",
              color: "#1e3a5f", border: "#3b82f6",
              items: [
                { nombre: "Placa de Expansión o Schwartz", normal: 40000, convenio: 36000 },
                { nombre: "Placa de Contención (acetato)", normal: 35000, convenio: 32000 },
                { nombre: "Disyuntor Mc.Namara (sin bandas ni ganchos)", normal: 60000, convenio: 57000 },
                { nombre: "Disyuntor Hyrax con alambre contorneado (sin bandas)", normal: 60000, convenio: 58000 },
                { nombre: "Botón de Nance (sin bandas)", normal: 40000, convenio: 38000 },
                { nombre: "Mantenedor de espacio (sin bandas)", normal: 30000, convenio: 27000 },
                { nombre: "Placa de Contención Hawley", normal: 40000, convenio: 38000 },
                { nombre: "Aparato de Mauricio (con tornillo)", normal: 46000, convenio: 42000 },
                { nombre: "Contención de Begg", normal: 46000, convenio: 46000 },
                { nombre: "Disyuntor Hass", normal: 58000, convenio: 55000 },
                { nombre: "Barra Lingual de Nance", normal: 40000, convenio: 37000 },
                { nombre: "Quad Helix", normal: 50000, convenio: 46000 },
                { nombre: "Barra Transpalatina (BTP o TPA)", normal: 38000, convenio: 35000 },
                { nombre: "Bionator 1 (estándar)", normal: 88000, convenio: 85000 },
                { nombre: "Aparato Monoblock de Mauricio", normal: 48000, convenio: 44000 },
              ]
            },
            {
              categoria: "🦷 Prótesis Removibles",
              color: "#14532d", border: "#22c55e",
              items: [
                { nombre: "Prótesis parcial", normal: 65000, convenio: 52000 },
                { nombre: "Prótesis total", normal: 65000, convenio: 52000 },
                { nombre: "Prótesis con base metálica", normal: 100000, convenio: 92000 },
                { nombre: "Prótesis inmediata", normal: 65000, convenio: 52000 },
                { nombre: "Prótesis cosmética (hasta 3 dientes)", normal: 38000, convenio: 35000 },
                { nombre: "Prótesis flexible", normal: 90000, convenio: 85000 },
                { nombre: "Rebasado total o parcial", normal: 30000, convenio: 28000 },
                { nombre: "Reparación simple", normal: 25000, convenio: 22000 },
                { nombre: "Reparación compleja", normal: 25000, convenio: 22000 },
              ]
            },
            {
              categoria: "😁 Planos",
              color: "#4c1d95", border: "#a855f7",
              items: [
                { nombre: "Plano de relajación acrílico", normal: 50000, convenio: 45000 },
                { nombre: "Plano Estampado", normal: 35000, convenio: 30000 },
                { nombre: "Plano relajación blando-dura", normal: 50000, convenio: 48000 },
                { nombre: "Cubetillas de blanqueamiento", normal: 24000, convenio: 20000 },
                { nombre: "Protector bucal simple", normal: 40000, convenio: 35000 },
                { nombre: "Protector bucal doble", normal: 55000, convenio: 50000 },
                { nombre: "Dientes Provisorios", normal: 15000, convenio: 12000 },
              ]
            },
            {
              categoria: "🖨️ Impresión 3D",
              color: "#713f12", border: "#f59e0b",
              items: [
                { nombre: "1 Arcada", normal: 10000, convenio: 9000 },
                { nombre: "2 Arcadas", normal: 12000, convenio: 10000 },
                { nombre: "Plano de relajación 3D", normal: 70000, convenio: 65000 },
              ]
            },
            {
              categoria: "🦷 Área Fija",
              color: "#7f1d1d", border: "#ef4444",
              nota: "⚠️ No aplica rebaja en fija, pero los trabajos sí cuentan para el flujo de 10 mensuales.",
              items: []
            },
          ];

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {/* Header convenio */}
              <div style={{ background:"linear-gradient(135deg,#92400e,#d97706)", borderRadius:"12px", padding:"20px" }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"18px", fontWeight:800, color:"#fff", marginBottom:"6px" }}>🤝 Convenio Laboratorio Dentis</p>
                <p style={{ fontSize:"12px", color:"#fef3c7", lineHeight:1.5 }}>Dirigido a clínicas con mínimo <strong>10 trabajos mensuales</strong>. Accede a precios rebajados en removible, ortodoncia, planos e impresión 3D.</p>
                <div style={{ marginTop:"12px", display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  <span style={{ background:"rgba(0,0,0,0.2)", color:"#fef3c7", padding:"4px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:700 }}>📍 Villarrica, Araucanía</span>
                  <span style={{ background:"rgba(0,0,0,0.2)", color:"#fef3c7", padding:"4px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:700 }}>📞 +569 91315887</span>
                  <span style={{ background:"rgba(0,0,0,0.2)", color:"#fef3c7", padding:"4px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:700 }}>✅ Cupos ilimitados · Solo 2026</span>
                </div>
              </div>

              {/* Tabla de precios */}
              {ARANCEL_CONVENIO.map(cat => (
                <div key={cat.categoria} style={{ background:"#18181b", border:`1px solid ${cat.border}`, borderRadius:"10px", overflow:"hidden" }}>
                  <div style={{ background:cat.color, padding:"10px 16px" }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"13px", fontWeight:700, color:"#fff" }}>{cat.categoria}</p>
                  </div>
                  {cat.nota && (
                    <div style={{ padding:"14px 16px", fontSize:"12px", color:"#f59e0b" }}>{cat.nota}</div>
                  )}
                  {cat.items.length > 0 && (
                    <div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"8px", padding:"8px 16px", borderBottom:"1px solid #27272a" }}>
                        <span style={{ fontSize:"10px", color:"#52525b", fontWeight:700 }}>TRABAJO</span>
                        <span style={{ fontSize:"10px", color:"#52525b", fontWeight:700, textAlign:"right" }}>NORMAL</span>
                        <span style={{ fontSize:"10px", color:"#f59e0b", fontWeight:700, textAlign:"right" }}>CONVENIO</span>
                      </div>
                      {cat.items.map((item, idx) => {
                        const ahorro = item.normal - item.convenio;
                        return (
                          <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"8px", padding:"10px 16px", borderBottom: idx<cat.items.length-1?"1px solid #27272a":"none", alignItems:"center" }}>
                            <div>
                              <p style={{ color:"#d4d4d8", fontSize:"13px" }}>{item.nombre}</p>
                              {ahorro > 0 && <p style={{ color:"#4ade80", fontSize:"10px", marginTop:"2px" }}>Ahorro: {fmtCLP(ahorro)}</p>}
                            </div>
                            <p style={{ color:"#52525b", fontSize:"13px", textDecoration:"line-through", textAlign:"right", whiteSpace:"nowrap" }}>{fmtCLP(item.normal)}</p>
                            <p style={{ color:"#fbbf24", fontWeight:700, fontSize:"14px", textAlign:"right", whiteSpace:"nowrap" }}>{fmtCLP(item.convenio)}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <p style={{ fontSize:"11px", color:"#52525b", textAlign:"center" }}>* Reparaciones y urgencias con cargo adicional · Bandas no incluidas</p>
            </div>
          );
        })()}


        {/* ════ COTIZADOR ════ */}
        {tab === "cotizaciones" && (() => {
          const fmtCLP = (n) => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(n);

          const ARANCEL_COT = [
            { nombre:"Placa de Expansión o Schwartz", precio:40000, area:"Ortodoncia" },
            { nombre:"Placa de Contención (acetato)", precio:35000, area:"Ortodoncia" },
            { nombre:"Disyuntor Mc.Namara", precio:60000, area:"Ortodoncia" },
            { nombre:"Disyuntor Hyrax", precio:60000, area:"Ortodoncia" },
            { nombre:"Botón de Nance", precio:40000, area:"Ortodoncia" },
            { nombre:"Mantenedor de espacio", precio:30000, area:"Ortodoncia" },
            { nombre:"Placa de Contención Hawley", precio:40000, area:"Ortodoncia" },
            { nombre:"Aparato de Mauricio", precio:46000, area:"Ortodoncia" },
            { nombre:"Contención de Begg", precio:46000, area:"Ortodoncia" },
            { nombre:"Disyuntor Hass", precio:58000, area:"Ortodoncia" },
            { nombre:"Barra Lingual de Nance", precio:40000, area:"Ortodoncia" },
            { nombre:"Quad Helix", precio:50000, area:"Ortodoncia" },
            { nombre:"Barra Transpalatina (TPA)", precio:38000, area:"Ortodoncia" },
            { nombre:"Bionator 1", precio:88000, area:"Ortodoncia" },
            { nombre:"Reparación simple ortodoncia", precio:15000, area:"Ortodoncia" },
            { nombre:"Reparación compleja ortodoncia", precio:20000, area:"Ortodoncia" },
            { nombre:"Prótesis parcial", precio:65000, area:"Removible" },
            { nombre:"Prótesis total", precio:65000, area:"Removible" },
            { nombre:"Prótesis con base metálica", precio:100000, area:"Removible" },
            { nombre:"Prótesis flexible", precio:90000, area:"Removible" },
            { nombre:"Rebasado total o parcial", precio:30000, area:"Removible" },
            { nombre:"Reparación simple prótesis", precio:25000, area:"Removible" },
            { nombre:"Plano de relajación acrílico", precio:50000, area:"Plano" },
            { nombre:"Plano Estampado", precio:35000, area:"Plano" },
            { nombre:"Cubetillas de blanqueamiento", precio:24000, area:"Plano" },
            { nombre:"Protector bucal simple", precio:40000, area:"Plano" },
            { nombre:"Protector bucal doble", precio:55000, area:"Plano" },
            { nombre:"Impresión 3D 1 Arcada", precio:10000, area:"3D" },
            { nombre:"Impresión 3D 2 Arcadas", precio:12000, area:"3D" },
            { nombre:"Plano de relajación 3D", precio:70000, area:"3D" },
            { nombre:"Corona periférica (resina)", precio:50000, area:"Fija" },
            { nombre:"Carillas (resina)", precio:45000, area:"Fija" },
            { nombre:"Incrustación onlay (resina)", precio:40000, area:"Fija" },
            { nombre:"Incrustación inlay (resina)", precio:33000, area:"Fija" },
            { nombre:"PFU Zirconio (por pieza)", precio:108000, area:"Fija" },
            { nombre:"Corona Zirconio", precio:107000, area:"Fija" },
            { nombre:"Carillas Zirconio", precio:100000, area:"Fija" },
            { nombre:"Corona sobre implante Zirconio", precio:123000, area:"Fija" },
            { nombre:"Corona E.MAX", precio:100000, area:"Fija" },
            { nombre:"Carillas E.MAX", precio:95000, area:"Fija" },
            { nombre:"Incrustación E.MAX", precio:94000, area:"Fija" },
          ];

          const ESTADO_COT = {
            "PENDIENTE": { color:"#fcd34d", bg:"rgba(120,53,15,0.5)", border:"#78350f" },
            "ACEPTADA":  { color:"#4ade80", bg:"rgba(6,78,59,0.5)",  border:"#065f46" },
            "RECHAZADA": { color:"#f87171", bg:"rgba(127,29,29,0.5)", border:"#7f1d1d" },
          };

          const generarPDF = (cot) => {
            const total = cot.items.reduce((s,i)=>s+i.precio*i.cantidad,0);
            const fecha = cot.fecha || cot.fecha_creacion || new Date().toLocaleDateString("es-CL");

            const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; background:#fff; color:#1a1a1a; padding:40px; position:relative; }
  body::before {
    content: "";
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 500px;
    background-image: url("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAFEAdoDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAcBBAUGCAMCCf/EAE8QAAEDAwIDBAcEBgcECAcBAAEAAgMEBREGIQcSMRNBUWEIFCIycYGRFUKhsSMkUmLB0RYzQ1NygpJjouHwFyU0RKOys9IYNTZFc4PC4v/EABsBAQACAwEBAAAAAAAAAAAAAAADBAIFBgEH/8QANhEAAgIBAwIEBAUCBQUAAAAAAAECAwQREiEFMRMiQVEGMmFxQoGRobEUFTRSwdHwIzNDYuH/2gAMAwEAAhEDEQA/AOykREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEVFVAEVFVNQEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAFRVVDhAD8V8h3mFo3EXiRZ9Kk0bB69cyBinjcMR56F57vhufrlQpqDiJqy+zP7W7SUcJO0FGTG0eXN7x+ZW1wui5GX5lwvdmmzut42I9vzP6HUb5oWe/KxvxOFVssbhlj2uHkVxw98s7y+aWSRxO5dIXEn4le9HJUU7+eCaaJ3cWSkH8Cto/hmWnFi/Q1S+KFr/wBv9zsHOeiqdlzBadY6rtx/Vr9Vlv7MzjK36Pyt1sHFy5wkMu9vhqmgYL4D2bj8jkH6hUb+gZNfMdJF7H+Isax6TTj9yaQvparp7XmnLwWxxV4pp3bCGp9hxPgCdj8iVs7SMZGMLUWUzrek1ozdVX13LWt6o+lVURRkxVFRVQBERAEREARUyPFEBVERAERUQFUREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBEVEAJA7x81GXGviGNMUv2RaXsfeKlhy7qKZh++fF37I+Z7gd01rfqXTWmq281mDHBHlrM47R/RrR5kkD5rj27XSrvF1qbnXzGWpqZDJI4nvO+AO4DpjyW96H01ZVniTXlj+7ND1vqDx6/Crfmf7IqJJJpnTTSySyyOLnvkcXOcT3knvK94uqs4nK6iOxPcOq7qKSWiOElq3qy6Yvdh3Vsw5IKy9hst3vUnJabfU1ZB3dGPYHxOwH1WFk4QWs3oeQhOx7YLU8WHYEq4Zt12W8WvhFqapw+rqKGjB6guMjh8gMfis9BwYw0drqAh3fyUoH/8AS1VnWMSHDn/qbOvo2ZYtVAi9rh4ggjBC2PTmsr9YntFLVumgb/3ec8zMeXe35H6rczwcjx7OoJs/vUwI/NWtTwhuLG/qd6ppT+zLAWD6glV59U6fkLZZL9UWa+ldRx5b64/ozbdKcRLNeOSCrIt9W44DJT7Dj+67+GxW5scD0IKgK58PtU0TXH7PFUwd8Egf+BwVeaX1jftNTChr4aialb0gqQWStHi0n8jstPk9LpsTniz1+mpu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U8RpaGslmdUTPczlc8OYwYa1rsd+XFbwmF7K1yfKPIwSNRt1r1FFxIuN9qILa221NFDSR8k73TN7J8ruct5APa7TGAdsd61P0heEjOI9nhqba+Gj1FQtLaSpd7LZI3e/C9zRnlIzg92TjqVLSqkbXF7kHWmtpb0cRhpoouhYxrdhtsFFGrtCavunHOxa+o47M2hstO+mjgkqpBLM1wfl20ZDff6DPTqpeTwSNjg9wlHcjXde0uo6zS1bQ6XNLBc6mF8MdRUTFjacuaR2jS1pJLdiOm+Fc6Utz7TpS3Wk0kFN6nTMpxBFIXxtDG8ow4tBOQM9FmVQ9yxUuNpltWpEHBLh9qzh/qHULJPsg6bu1c+tp6SCeQvoXHOwywB2Ryg4I91U1VofW1Zx2tnESggsUlJa6F9FFSzVkjJJg7tMPJERDf6zpv067qYUUnjy3OWhH4S04NG9U1/cdY2KruEdot1koHzS1UNLWyyy1TzE5kYIMTQGtLs9eoC3hucbgA96qqqNvUl9QiIvAEREAREQBERAEREAREQBERAWd0oaS4UzqatpmVETvuuGd/4LH2nTVotlQailpcS9A9zi4geAz0WbRZq2cVtT4IpU1ye6UeQ3PeMKqoFVYEoREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQH//2Q==");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.07;
    pointer-events: none;
    z-index: 0;
  }
  body > * { position: relative; z-index: 1; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:20px; border-bottom:3px solid #0ea5e9; }
  .lab-name { font-size:24px; font-weight:900; color:#0ea5e9; letter-spacing:1px; }
  .lab-sub { font-size:12px; color:#64748b; margin-top:4px; }
  .lab-contact { font-size:11px; color:#64748b; margin-top:2px; }
  .cot-info { text-align:right; }
  .cot-num { font-size:18px; font-weight:700; color:#1e293b; }
  .cot-fecha { font-size:12px; color:#64748b; margin-top:4px; }
  .cot-validez { font-size:11px; color:#94a3b8; margin-top:2px; }
  .destinatario { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:24px; }
  .dest-label { font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .dest-name { font-size:16px; font-weight:700; color:#1e293b; }
  .dest-doctor { font-size:13px; color:#475569; margin-top:3px; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  thead tr { background:#0ea5e9; }
  thead th { color:#fff; padding:10px 12px; font-size:11px; font-weight:700; text-align:left; text-transform:uppercase; letter-spacing:0.5px; }
  thead th:last-child { text-align:right; }
  thead th:nth-child(2), thead th:nth-child(3) { text-align:center; }
  tbody tr { border-bottom:1px solid #f1f5f9; }
  tbody tr:nth-child(even) { background:#f8fafc; }
  tbody td { padding:10px 12px; font-size:13px; color:#1e293b; }
  tbody td:nth-child(2) { text-align:center; color:#475569; }
  tbody td:nth-child(3) { text-align:center; color:#475569; }
  tbody td:last-child { text-align:right; font-weight:600; }
  .area-badge { display:inline-block; background:#e0f2fe; color:#0369a1; font-size:10px; padding:1px 6px; border-radius:10px; margin-left:6px; }
  .total-row { background:#0ea5e9 !important; }
  .total-row td { color:#fff !important; font-weight:700 !important; font-size:15px !important; padding:12px !important; }
  .obs { background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:12px 16px; margin-bottom:24px; font-size:12px; color:#92400e; }
  .obs-label { font-weight:700; margin-bottom:4px; }
  .footer { text-align:center; padding-top:20px; border-top:1px solid #e2e8f0; }
  .footer p { font-size:11px; color:#94a3b8; margin-bottom:3px; }
  .footer .gracias { font-size:13px; font-weight:700; color:#0ea5e9; margin-bottom:6px; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="lab-name">🦷 LABORATORIO DENTAL DENTIS</div>
    <div class="lab-sub">Villarrica, Araucanía · Chile</div>
    <div class="lab-contact">📞 +569 91315887</div>
  </div>
  <div class="cot-info">
    <div class="cot-num">${cot.nro || "COT-001"}</div>
    <div class="cot-fecha">Fecha: ${fecha}</div>
    <div class="cot-validez">Válida por ${cot.validez || "30"} días</div>
  </div>
</div>

<div class="destinatario">
  <div class="dest-label">Cotización para</div>
  <div class="dest-name">${cot.clinica || "—"}</div>
  ${cot.doctor ? `<div class="dest-doctor">Dr./Dra. ${cot.doctor}</div>` : ""}
</div>

<table>
  <thead>
    <tr>
      <th>Descripción del trabajo</th>
      <th>Cant.</th>
      <th>Precio unit.</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    ${cot.items.map(item=>`
    <tr>
      <td>${item.nombre}<span class="area-badge">${item.area}</span></td>
      <td>${item.cantidad}</td>
      <td>${new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(item.precio)}</td>
      <td>${new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(item.precio*item.cantidad)}</td>
    </tr>`).join("")}
    <tr class="total-row">
      <td colspan="3">TOTAL COTIZACIÓN</td>
      <td>${new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(total)}</td>
    </tr>
  </tbody>
</table>

${cot.observaciones ? `<div class="obs"><div class="obs-label">📋 Observaciones:</div>${cot.observaciones}</div>` : ""}

<div class="footer">
  <p class="gracias">¡Gracias por confiar en Laboratorio Dental Dentis!</p>
  <p>Bandas no incluidas · Urgencias con cargo adicional</p>
  <p>Para consultas: +569 91315887 · Villarrica, Araucanía</p>
</div>
</body>
</html>`;

            const win = window.open("", "_blank");
            win.document.write(htmlContent);
            win.document.close();
            setTimeout(() => { win.print(); }, 800);
          };

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <p className="tf" style={{ fontSize:"16px", fontWeight:700, color:"#fff" }}>📄 Cotizador</p>
                  <p style={{ fontSize:"12px", color:"#71717a" }}>{cotizaciones.length} cotización{cotizaciones.length!==1?"es":""} guardada{cotizaciones.length!==1?"s":""}</p>
                </div>
                <button className="btn1" onClick={()=>{ setFormCot({ clinica:"", doctor:"", fecha:new Date().toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit",year:"numeric"}), validez:"30", observaciones:"", items:[] }); setEditandoCot(null); setShowFormCot(true); }}>+ Nueva cotización</button>
              </div>

              {/* LISTA DE COTIZACIONES */}
              {cotizaciones.length === 0 && (
                <div className="card" style={{ padding:"40px", textAlign:"center", color:"#52525b" }}>
                  <p style={{ fontSize:"32px", marginBottom:"8px" }}>📄</p>
                  <p>Sin cotizaciones aún. Crea la primera.</p>
                </div>
              )}
              {[...cotizaciones].reverse().map(cot => {
                const total = cot.items.reduce((s,i)=>s+i.precio*i.cantidad, 0);
                const est = ESTADO_COT[cot.estado] || ESTADO_COT["PENDIENTE"];
                return (
                  <div key={cot.id} className="card" style={{ padding:"16px", borderColor: est.border }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"6px", alignItems:"center" }}>
                          <span style={{ fontSize:"11px", background:"#27272a", color:"#22d3ee", border:"1px solid #164e63", padding:"2px 8px", borderRadius:"4px", fontFamily:"monospace", fontWeight:700 }}>{cot.nro}</span>
                          <span style={{ fontSize:"11px", background:est.bg, color:est.color, border:`1px solid ${est.border}`, padding:"2px 8px", borderRadius:"20px" }}>{cot.estado}</span>
                          <span style={{ fontSize:"11px", color:"#52525b" }}>{cot.fecha_creacion}</span>
                        </div>
                        <p style={{ fontWeight:700, color:"#fff", fontSize:"14px" }}>{cot.clinica || "Sin clínica"}</p>
                        {cot.doctor && <p style={{ fontSize:"12px", color:"#71717a" }}>Dr./Dra. {cot.doctor}</p>}
                        <p style={{ fontSize:"12px", color:"#52525b", marginTop:"3px" }}>{cot.items.length} ítem{cot.items.length!==1?"s":""} · Válida {cot.validez} días</p>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                        <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"18px" }}>{fmtCLP(total)}</p>
                        <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", justifyContent:"flex-end" }}>
                          <button onClick={()=>generarPDF(cot)} style={{ fontSize:"11px", padding:"5px 12px", borderRadius:"6px", cursor:"pointer", border:"none", fontFamily:"monospace", fontWeight:700, background:"#22d3ee", color:"#09090b" }}>📄 PDF</button>
                          <button onClick={()=>toggleEstadoCot(cot.id)} style={{ fontSize:"11px", padding:"5px 10px", borderRadius:"6px", cursor:"pointer", border:`1px solid ${est.border}`, fontFamily:"monospace", background:"transparent", color:est.color }}>↻ Estado</button>
                          <button onClick={()=>{ setFormCot({...cot}); setEditandoCot(cot.id); setShowFormCot(true); }} className="bsm">✏️</button>
                          <button onClick={()=>delCot(cot.id)} className="bsm" style={{ color:"#f87171" }}>🗑</button>
                        </div>
                      </div>
                    </div>
                    {/* Items preview */}
                    {cot.items.length > 0 && (
                      <div style={{ marginTop:"10px", paddingTop:"10px", borderTop:"1px solid #27272a" }}>
                        {cot.items.slice(0,3).map((item,idx)=>(
                          <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", padding:"2px 0", color:"#71717a" }}>
                            <span>{item.nombre} <span style={{ color:"#3f3f46" }}>×{item.cantidad}</span></span>
                            <span style={{ color:"#a1a1aa" }}>{fmtCLP(item.precio*item.cantidad)}</span>
                          </div>
                        ))}
                        {cot.items.length > 3 && <p style={{ fontSize:"11px", color:"#3f3f46", marginTop:"3px" }}>...y {cot.items.length-3} ítem{cot.items.length-3!==1?"s":""} más</p>}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* MODAL NUEVA/EDITAR COTIZACIÓN */}
              {showFormCot && (
                <div className="overlay">
                  <div className="modal" style={{ maxWidth:"600px" }}>
                    <p className="tf" style={{ fontSize:"16px", fontWeight:700, color:"#fff", marginBottom:"16px" }}>{editandoCot?"Editar Cotización":"Nueva Cotización"}</p>

                    {/* Datos básicos */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                      <div>
                        <label className="lbl">Clínica</label>
                        <input className="inp" list="lista-clinicas-cot" value={formCot.clinica}
                          onChange={e=>{
                            const clin = clinicas.find(c=>c.nombre===e.target.value);
                            setFormCot(f=>({...f, clinica:e.target.value, doctor: clin?.doctor || f.doctor}));
                          }} placeholder="Selecciona o escribe..."/>
                        <datalist id="lista-clinicas-cot">{clinicas.map(c=><option key={c.id} value={c.nombre}/>)}</datalist>
                      </div>
                      <div>
                        <label className="lbl">Doctor/a</label>
                        <input className="inp" value={formCot.doctor} onChange={e=>setFormCot(f=>({...f,doctor:e.target.value}))}/>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
                      <div>
                        <label className="lbl">Fecha</label>
                        <input className="inp" value={formCot.fecha} onChange={e=>setFormCot(f=>({...f,fecha:e.target.value}))}/>
                      </div>
                      <div>
                        <label className="lbl">Validez (días)</label>
                        <input type="number" className="inp" value={formCot.validez} onChange={e=>setFormCot(f=>({...f,validez:e.target.value}))}/>
                      </div>
                    </div>

                    {/* Buscador de items */}
                    <label className="lbl">Agregar trabajos al presupuesto</label>
                    <input className="inp" style={{ marginBottom:"8px" }} placeholder="🔍 Buscar trabajo del arancel..." value={busqCotItem} onChange={e=>setBusqCotItem(e.target.value)}/>

                    {busqCotItem.length > 1 && (
                      <div style={{ background:"#09090b", border:"1px solid #3f3f46", borderRadius:"8px", maxHeight:"180px", overflowY:"auto", marginBottom:"12px" }}>
                        {ARANCEL_COT.filter(a=>a.nombre.toLowerCase().includes(busqCotItem.toLowerCase())).map((a,idx)=>(
                          <div key={idx} onClick={()=>{
                            const exists = formCot.items.findIndex(i=>i.nombre===a.nombre);
                            if (exists>=0) {
                              setFormCot(f=>({...f, items: f.items.map((it,i)=>i===exists?{...it,cantidad:it.cantidad+1}:it)}));
                            } else {
                              setFormCot(f=>({...f, items:[...f.items, {...a, cantidad:1}]}));
                            }
                            setBusqCotItem("");
                          }} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderBottom:"1px solid #27272a", cursor:"pointer" }}
                            onMouseEnter={e=>e.currentTarget.style.background="#18181b"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <div>
                              <p style={{ color:"#f4f4f5", fontSize:"13px" }}>{a.nombre}</p>
                              <p style={{ color:"#52525b", fontSize:"10px" }}>{a.area}</p>
                            </div>
                            <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"13px", whiteSpace:"nowrap" }}>{fmtCLP(a.precio)}</p>
                          </div>
                        ))}
                        {ARANCEL_COT.filter(a=>a.nombre.toLowerCase().includes(busqCotItem.toLowerCase())).length===0 && (
                          <p style={{ padding:"12px", color:"#52525b", fontSize:"13px" }}>Sin resultados</p>
                        )}
                      </div>
                    )}

                    {/* Items seleccionados */}
                    {formCot.items.length > 0 && (
                      <div style={{ background:"#09090b", borderRadius:"8px", padding:"12px", marginBottom:"12px", maxHeight:"200px", overflowY:"auto" }}>
                        <p style={{ fontSize:"10px", color:"#71717a", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", marginBottom:"8px" }}>Trabajos cotizados</p>
                        {formCot.items.map((item,idx)=>(
                          <div key={idx} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #27272a", gap:"8px" }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ color:"#f4f4f5", fontSize:"12px" }}>{item.nombre}</p>
                              <p style={{ color:"#52525b", fontSize:"10px" }}>{item.area}</p>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                              <button onClick={()=>setFormCot(f=>({...f,items:f.items.map((it,i)=>i===idx&&it.cantidad>1?{...it,cantidad:it.cantidad-1}:it)}))}
                                style={{ background:"#27272a", border:"1px solid #52525b", color:"#f4f4f5", width:"24px", height:"24px", borderRadius:"4px", cursor:"pointer", fontSize:"14px", lineHeight:1 }}>−</button>
                              <span style={{ color:"#22d3ee", fontWeight:700, fontSize:"13px", minWidth:"20px", textAlign:"center" }}>{item.cantidad}</span>
                              <button onClick={()=>setFormCot(f=>({...f,items:f.items.map((it,i)=>i===idx?{...it,cantidad:it.cantidad+1}:it)}))}
                                style={{ background:"#27272a", border:"1px solid #52525b", color:"#f4f4f5", width:"24px", height:"24px", borderRadius:"4px", cursor:"pointer", fontSize:"14px", lineHeight:1 }}>+</button>
                              <span style={{ color:"#a1a1aa", fontSize:"12px", minWidth:"72px", textAlign:"right" }}>{fmtCLP(item.precio*item.cantidad)}</span>
                              <button onClick={()=>setFormCot(f=>({...f,items:f.items.filter((_,i)=>i!==idx)}))}
                                style={{ background:"transparent", border:"none", color:"#f87171", cursor:"pointer", fontSize:"16px", padding:"0 2px" }}>×</button>
                            </div>
                          </div>
                        ))}
                        <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:"8px" }}>
                          <p style={{ color:"#22d3ee", fontWeight:700, fontSize:"15px" }}>
                            Total: {fmtCLP(formCot.items.reduce((s,i)=>s+i.precio*i.cantidad,0))}
                          </p>
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom:"16px" }}>
                      <label className="lbl">Observaciones (opcional)</label>
                      <textarea className="inp" rows={2} value={formCot.observaciones} onChange={e=>setFormCot(f=>({...f,observaciones:e.target.value}))} placeholder="Ej: Incluye modelos de estudio, plazo de entrega 5 días hábiles..."/>
                    </div>

                    <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                      <button className="btng" onClick={()=>{setShowFormCot(false);setEditandoCot(null);setBusqCotItem("");}}>Cancelar</button>
                      <button className="btn1" onClick={()=>saveCot(formCot)} disabled={!formCot.clinica||formCot.items.length===0}
                        style={{ opacity:(!formCot.clinica||formCot.items.length===0)?0.5:1 }}>
                        Guardar cotización
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
