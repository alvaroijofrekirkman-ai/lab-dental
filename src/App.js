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
        {[["dashboard","📊 Resumen"],["trabajos","🔧 Trabajos"],["gastos","💸 Gastos"],["inventario","📦 Inventario"],["clinicas","🏥 Clínicas"],["facturas","🧾 Facturas"],["calendario","📅 Calendario"],["metas","🎯 Metas"],["ranking","🏆 Ranking"],["deudas","💰 Deudas"],["arancel","📋 Arancel"],["convenio","🤝 Convenio"]].map(([k,l]) => (
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

      </div>
    </div>
  );
}
