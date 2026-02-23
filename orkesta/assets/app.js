
// URL del gestor de tareas en línea (proyectos con ?focus=vencidas según DEMO del repo gestor-tareas)
const GESTOR_TAREAS_BASE_URL = "https://carlosmoreno-hmodevs.github.io/gestor-tareas/proyectos";

const state = {
  // Página de inicio (home): ERP Connect · Validación
  layer: "erp",
  view: "erp-validacion",
  mode: "objetivos", // objetivos | reales
  month: "May",
  store: "Todas",
  area: "Todas",
  loading: false,

  // Subvista dentro de "KPIs / Datos"
  bscDatosView: "tabla", // "tabla" | "catalogo"

  // Filtros del Catálogo KPI (Normateca)
  kpiCatalogQuery: "",
  kpiCatalogCapa: "Todas",
  kpiCatalogFreq: "Todas",
  kpiCatalogFuente: "Todas",

  // Filtros Cat Objetivos (catálogo ferretería)
  catObjetivosQ: "",
  catObjetivosCat: "Todas",
  catObjetivosStatus: "all",
};

const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const stores = ["Todas","Sucursal Centro","Sucursal Norte","Sucursal Sur","Sucursal Oriente","Sucursal Poniente"];
const areas = ["Todas","Cadena de Suministro","Inventarios","Ventas","Operación en Tiendas","Nómina","Logística","Servicio al Cliente"];

// Árbol de navegación (padres y nodos hijo) para el menú moderno
const navTree = {
  estrategia: {
    title: "Estrategia",
    subtitle: "BSC y mapa estratégico",
    children: [
      { view: "dashboard", label: "Dashboard", icon: "📊" },
      { view: "bsc-cat-objetivos", label: "Cat Objetivos", icon: "📋" },
      { view: "bsc-datos", label: "KPIs / Datos", icon: "🧾" },
      { view: "bsc-mapa", label: "Mapa estratégico", icon: "🧭" },
      { view: "bsc-scorecard", label: "Scorecard", icon: "🚦" },
      { view: "bsc-iniciativas", label: "Iniciativas", icon: "🗂️" },
    ],
  },
  ejecucion: {
    title: "Ejecución",
    subtitle: "Motor de tareas",
    children: [
      { view: "exec-tareas", label: "Motor de tareas", icon: "✅" },
      { view: "exec-tablero", label: "Tablero", icon: "🧩" },
    ],
  },
  erp: {
    title: "ERP Connect",
    subtitle: "Extracción de datos",
    children: [
      { view: "erp-connect", label: "Conectores", icon: "💼" },
      { view: "erp-validacion", label: "Validación", icon: "🧪" },
    ],
  },
  control: {
    title: "Auditoría",
    subtitle: "Control y evidencia",
    children: [
      { view: "audit-control", label: "Supervisión", icon: "🛡️" },
      { view: "audit-evidencia", label: "Evidencia", icon: "📎" },
    ],
  },
};

// Catálogo Objetivos (ferretería) - categorías y helper
const CATEGORIES_CAT_OBJ = [
  "Caja / Liquidez", "Utilidad / Margen", "Inventario", "Control / Merma",
  "Ventas B2B / Proyectos", "Abasto / Logística", "Operación Multi-sucursal", "Expansión", "Tecnología / Datos"
];
function catObjKpi(nombre, unidad, actual, meta, direccion, history){
  return { nombre, unidad, actual, meta, direccion, history: history || [] };
}

const catalogObjetivosData = [
  { id:"OBJ-01", categoria:"Caja / Liquidez", titulo:"Liberar caja y fortalecer liquidez (capital de trabajo)", quote:"\"Traigo bodega llena y caja flaca.\"", explicacion:"Si pagas proveedor rápido pero tardas en vender y cobrar, financias el negocio con tu bolsa. Bajar inventario parado y acelerar cobranza suelta efectivo sin vender más.", causas:["Inventario lento / muerto acumulado","Compra sin planeación (por pánico a quiebres)","Crédito suelto (cobranza reactiva)","Pagos a proveedor sin negociación de plazos"], kpis:[catObjKpi("Días de inventario (DIO)","días",72,55,"lower_better",[78,76,74,72,71,72]),catObjKpi("Días de cobranza (DSO)","días",49,38,"lower_better",[53,51,50,49,48,49]),catObjKpi("% cartera vencida","%",12.4,8.0,"lower_better",[13.5,13.0,12.8,12.6,12.5,12.4]),catObjKpi("Ciclo de caja (CCC)","días",84,62,"lower_better",[92,90,87,86,85,84]),catObjKpi("Flujo operativo mensual","MXN",820000,1100000,"higher_better",[760000,790000,810000,840000,830000,820000])] },
  { id:"OBJ-02", categoria:"Utilidad / Margen", titulo:"Mejorar margen bruto por mezcla y disciplina comercial", quote:"\"No es vender mucho, es vender bien.\"", explicacion:"Un punto de margen en ventas grandes es muchísimo dinero. Si el descuento se descontrola o vendes pura línea de bajo margen, el negocio se ve grande… pero no deja.", causas:["Descuentos fuera de política (para \"sacar la venta\")","Mezcla cargada a bajo margen","Costos mal capturados (flete/bonos no prorrateados)","Devoluciones y notas de crédito elevadas"], kpis:[catObjKpi("Margen bruto total","%",22.8,24.5,"higher_better",[23.1,23.0,22.9,22.7,22.8,22.8]),catObjKpi("Descuento promedio","%",7.6,6.0,"lower_better",[7.2,7.3,7.5,7.7,7.6,7.6]),catObjKpi("Ventas fuera de política","%",3.9,2.0,"lower_better",[4.4,4.2,4.1,4.0,3.9,3.9]),catObjKpi("Utilidad por ticket","MXN",248,275,"higher_better",[252,250,249,247,248,248]),catObjKpi("Devoluciones / notas de crédito","%",1.8,1.2,"lower_better",[1.9,1.9,1.8,1.8,1.8,1.8])] },
  { id:"OBJ-03", categoria:"Utilidad / Margen", titulo:"Crecimiento rentable (no solo ventas)", quote:"\"Crecer con puro descuento te deja sin lana.\"", explicacion:"Puedes subir ventas y aun así ganar menos si el margen baja y el gasto sube. Crecer rentable es ventas + margen + gasto bajo control.", causas:["Promociones sin contribución (precio sin costo real)","Gasto operativo creciendo más rápido que ventas","Fletes extraordinarios por urgencias","Nómina sobredimensionada vs tráfico real"], kpis:[catObjKpi("Ventas mismas tiendas (YoY)","%",8.2,10.0,"higher_better",[6.5,7.1,7.6,8.0,8.2,8.2]),catObjKpi("Margen operativo","%",6.1,7.5,"higher_better",[6.4,6.3,6.2,6.1,6.1,6.1]),catObjKpi("Gasto operativo / ventas","%",16.9,16.0,"lower_better",[16.4,16.6,16.8,16.9,16.9,16.9]),catObjKpi("EBITDA","MXN",1450000,1750000,"higher_better",[1500000,1490000,1480000,1460000,1450000,1450000])] },
  { id:"OBJ-04", categoria:"Inventario", titulo:"Excelencia en inventario (disponibilidad con rotación sana)", quote:"\"Lo que se vende no está… y lo que está no se vende.\"", explicacion:"Quiebre = venta perdida. Inventario muerto = caja enterrada. El objetivo es asegurar disponibilidad del Top y limpiar lo que no gira.", causas:["Reabasto basado en intuición, no en consumo","Top SKUs sin mínimos/máximos por tienda","Compras por \"precio\" sin rotación","Exactitud baja (sistema no refleja piso)"], kpis:[catObjKpi("Quiebres en Top 200 SKUs","%",9.8,5.0,"lower_better",[10.6,10.2,10.0,9.9,9.8,9.8]),catObjKpi("Fill rate (surtido completo)","%",91.2,95.0,"higher_better",[89.8,90.3,90.9,91.1,91.2,91.2]),catObjKpi("% inventario lento/muerto","%",18.5,12.0,"lower_better",[19.2,19.0,18.8,18.6,18.5,18.5]),catObjKpi("Exactitud de inventario","%",95.6,98.0,"higher_better",[94.8,95.1,95.3,95.5,95.6,95.6]),catObjKpi("Rotación (vueltas/año)","x",6.4,7.5,"higher_better",[6.1,6.2,6.3,6.4,6.4,6.4])] },
  { id:"OBJ-05", categoria:"Control / Merma", titulo:"Gobernanza y control (merma, pérdidas, disciplina)", quote:"\"La fuga es la que mata.\"", explicacion:"La merma y las diferencias de caja no se notan en un día, pero al mes son dinero real. Control = trazabilidad + acciones cerradas.", causas:["Ajustes sin causa raíz ni responsable","Devoluciones sin evidencia o autorizaciones laxas","Compras sin OC / sin aprobación","Acciones correctivas que se quedan abiertas"], kpis:[catObjKpi("Merma total","%",1.6,1.0,"lower_better",[1.7,1.7,1.6,1.6,1.6,1.6]),catObjKpi("Diferencias de inventario (ajustes)","%",0.9,0.5,"lower_better",[1.0,1.0,0.95,0.92,0.90,0.90]),catObjKpi("Diferencias de caja","MXN",68000,30000,"lower_better",[72000,70000,69000,68000,68000,68000]),catObjKpi("Acciones cerradas a tiempo","%",74.0,90.0,"higher_better",[68,70,72,73,74,74])] },
  { id:"OBJ-06", categoria:"Ventas B2B / Proyectos", titulo:"Ganar participación en clientes B2B (proyectos, industria)", quote:"\"La obra deja… si cobras.\"", explicacion:"En obra se mueve volumen, pero si no controlas margen por proyecto y cobranza, terminas siendo banco. Aquí manda margen+DSO B2B.", causas:["Cotizaciones sin estructura (costos incompletos)","Crédito sin reglas por cliente","Entregas parciales que generan reclamos","No medir margen por proyecto (solo ventas)"], kpis:[catObjKpi("Ventas B2B / total","%",21.5,26.0,"higher_better",[19.8,20.4,20.9,21.2,21.5,21.5]),catObjKpi("Margen B2B","%",18.9,20.0,"higher_better",[19.4,19.2,19.0,18.9,18.9,18.9]),catObjKpi("DSO B2B","días",62,45,"lower_better",[66,65,64,63,62,62]),catObjKpi("OTIF (entrega completa y a tiempo)","%",88.0,93.0,"higher_better",[86,87,87,88,88,88]),catObjKpi("Cotizaciones ganadas","%",33.0,38.0,"higher_better",[31,32,32,33,33,33])] },
  { id:"OBJ-07", categoria:"Abasto / Logística", titulo:"Eficiencia logística y cadena de suministro", quote:"\"Si todo es urgencia, todo sale caro.\"", explicacion:"Sin planeación, pierdes venta por quiebre y luego pagas flete extraordinario para rescatar. Mejor proveedor+lead time+reabasto fino bajan costo y suben servicio.", causas:["Lead time real desconocido por proveedor","Traspasos por apagar fuegos","Flete extraordinario recurrente","Mala programación de reabasto por tienda"], kpis:[catObjKpi("Costo logístico / ventas","%",3.4,2.8,"lower_better",[3.2,3.3,3.4,3.4,3.4,3.4]),catObjKpi("Cumplimiento de proveedor (OTD)","%",87.5,92.0,"higher_better",[86,86.5,87,87.2,87.5,87.5]),catObjKpi("Fletes extraordinarios","MXN",210000,120000,"lower_better",[240000,230000,220000,215000,210000,210000]),catObjKpi("Traspasos por urgencia","#",148,90,"lower_better",[170,162,155,150,148,148])] },
  { id:"OBJ-08", categoria:"Operación Multi-sucursal", titulo:"Estandarizar la operación multi-sucursal (ejecución consistente)", quote:"\"No puede haber tiendas de primera y de tercera.\"", explicacion:"Cuando cada tienda opera distinto, el margen y la merma varían como locos. Estandarizar procesos y rutinas hace que la red se parezca a la mejor tienda.", causas:["Rutinas no auditadas (apertura, caja, devoluciones)","Descuentos por criterio personal","Exhibición y surtido disparejo por tienda","Capacitación y roles inconsistentes"], kpis:[catObjKpi("Margen por tienda (promedio)","%",22.8,24.5,"higher_better",[23.1,23.0,22.9,22.8,22.8,22.8]),catObjKpi("Merma por tienda (promedio)","%",1.6,1.0,"lower_better",[1.7,1.7,1.6,1.6,1.6,1.6]),catObjKpi("Productividad (ventas / persona)","MXN",86000,95000,"higher_better",[83000,84000,85000,86000,86000,86000]),catObjKpi("Cumplimiento de rutinas","%",78.0,90.0,"higher_better",[72,74,76,77,78,78])] },
  { id:"OBJ-09", categoria:"Expansión", titulo:"Expandir con una tesis clara de red (nuevas tiendas / regiones)", quote:"\"Abrir es fácil; que se pague sola es la prueba.\"", explicacion:"Una tienda nueva puede vender bien y aún así chupar caja si no deja contribución. Aquí manda payback + contribución real + renta sana.", causas:["Formato incorrecto para la zona","Renta alta para el tráfico real","Inventario inicial inflado","No medir contribución con costos reales"], kpis:[catObjKpi("Payback estimado","meses",26,20,"lower_better",[28,27,27,26,26,26]),catObjKpi("Contribución tienda nueva","%",4.8,6.0,"higher_better",[5.2,5.1,5.0,4.9,4.8,4.8]),catObjKpi("Renta / ventas","%",7.2,6.0,"lower_better",[6.9,7.0,7.1,7.2,7.2,7.2])] },
  { id:"OBJ-10", categoria:"Tecnología / Datos", titulo:"Modernización tecnológica y data (una sola verdad para decidir)", quote:"\"Cada quien trae su Excel y nadie trae la verdad.\"", explicacion:"Si los números salen tarde o diferentes por tienda, compras y descuentas mal. Una sola verdad baja el error y acelera decisiones sobre caja, margen e inventario.", causas:["Cierre tardío y datos incompletos","Costos mal integrados (flete/bonos)","Baja adopción de tableros por operación","Catálogos y reglas sin estandarización"], kpis:[catObjKpi("Días de cierre","días",7,3,"lower_better",[8,8,7,7,7,7]),catObjKpi("Exactitud de costo (puesto en piso)","%",93.0,97.0,"higher_better",[92,92.3,92.6,92.8,93,93]),catObjKpi("Movimientos capturados (completitud)","%",95.0,99.0,"higher_better",[93,94,94.5,95,95,95]),catObjKpi("Uso semanal del tablero (adopción)","%",62.0,80.0,"higher_better",[55,57,59,60,62,62])] }
];

const semaforo = {
  good: 0.90,
  warn: 0.70
};
// Variación por sucursal (para que el filtro cambie los valores de forma visible)
const storeFactors = {
  "Todas": 1.00,
  "Sucursal Centro": 1.02,     // mejor desempeño
  "Sucursal Norte": 0.99,
  "Sucursal Sur": 0.97,
  "Sucursal Oriente": 0.95,    // más rezagada
  "Sucursal Poniente": 0.98
};

function higherIsBetterKpi(kpi){
  // reglas simples para el demo
  return !(kpi.includes("(días)") || kpi.includes("DOH") || kpi.includes("CCC") || kpi.includes("Merma") || kpi.includes("Cierre contable"));
}

function adjustByStore(kpi, unit, value, store){
  const f = storeFactors[store] ?? 1.0;
  if(store === "Todas") return value;

  const higherBetter = higherIsBetterKpi(kpi);
  let v = higherBetter ? (value * f) : (value / f);

  // redondeos según tipo
  if(unit === "#" || unit === "$" || unit === "d") v = Math.round(v);
  if(unit === "%") v = Math.max(0, v); // evita negativos por redondeo/variación

  return v;
}

function getKpiTarget(kpi, mi){
  const data = model.objetivos;
  for(const sec of Object.values(data)){
    for(const r of sec){
      if(r.kpi === kpi) return r.values[mi];
    }
  }
  return null;
}

function getKpiValue(kpi, mi){
  const data = model[state.mode];
  for(const sec of Object.values(data)){
    for(const r of sec){
      if(r.kpi === kpi){
        const base = r.values[mi];
        return (state.mode === "reales") ? adjustByStore(r.kpi, r.unit, base, state.store) : base;
      }
    }
  }
  return null;
}

// Dataset demo (ferretería) - números ejemplo
const model = {
  objetivos: {
    "Finanzas": [
      { obj:"Mejorar márgenes del negocio", kpi:"Margen Bruto %", unit:"%", values:[24.0,24.2,24.4,24.7,25.0,25.2,25.4,25.6,25.8,26.0,26.2,26.5] },
      { obj:"Mejorar liquidez del negocio", kpi:"Ciclo de Conversión de Efectivo (días)", unit:"d", values:[78,76,74,72,70,68,66,65,64,63,62,60] },
      { obj:"Mejorar liquidez del negocio", kpi:"Días Inventario (DOH)", unit:"d", values:[92,90,88,86,84,82,80,79,78,77,76,74] },
    ],
    "Clientes": [
      { obj:"Eliminar quiebres sin sobreinventario", kpi:"Nivel de Servicio (Fill Rate)", unit:"%", values:[92,93,93,94,95,95,96,96,96,97,97,98] },
      { obj:"Eliminar quiebres sin sobreinventario", kpi:"Top quiebres resueltos (SKU críticos)", unit:"#", values:[45,55,60,70,80,90,95,100,105,110,120,130] },
      { obj:"Mejorar márgenes del negocio", kpi:"Ticket Promedio", unit:"$", values:[720,725,735,740,750,758,765,770,778,785,792,805] }
    ],
    "Procesos Internos": [
      { obj:"Eliminar quiebres sin sobreinventario", kpi:"Exactitud de Inventario", unit:"%", values:[94,94,95,95,95,96,96,96,97,97,97,98] },
      { obj:"Mejorar márgenes del negocio", kpi:"Merma / Ajustes sin soporte", unit:"%", values:[1.6,1.55,1.50,1.45,1.40,1.35,1.32,1.30,1.28,1.25,1.22,1.20] },
      { obj:"Mejorar liquidez del negocio", kpi:"Cumplimiento de recepción vs factura", unit:"%", values:[91,92,93,94,94,95,95,96,96,97,97,98] },
    ],
    "Personal": [
      { obj:"Eliminar quiebres sin sobreinventario", kpi:"Productividad surtido (líneas/h)", unit:"#", values:[42,44,45,46,47,48,49,50,51,52,53,55] },
      { obj:"Mejorar márgenes del negocio", kpi:"Cumplimiento de política de descuentos", unit:"%", values:[88,89,90,90,91,92,93,93,94,95,95,96] },
      { obj:"Mejorar liquidez del negocio", kpi:"Cierre contable a tiempo (días)", unit:"d", values:[7,7,6,6,6,5,5,5,4,4,4,4] },
    ],
  },
  reales: {
  "Finanzas": [
    { obj:"Mejorar márgenes del negocio", kpi:"Margen Bruto %", unit:"%", values:[17.28, 17.91, 18.54, 19.51, 20.25, 20.92, 21.59, 22.53, 23.22, 23.92, 24.89, 27.03] },
    { obj:"Mejorar liquidez del negocio", kpi:"Ciclo de Conversión de Efectivo (días)", unit:"d", values:[126, 119, 112, 106, 100, 94, 89, 86, 82, 79, 75, 70] },
    { obj:"Mejorar liquidez del negocio", kpi:"Días Inventario (DOH)", unit:"d", values:[153, 145, 138, 130, 124, 117, 111, 107, 103, 97, 93, 87] },
  ],
  "Clientes": [
    { obj:"Eliminar quiebres sin sobreinventario", kpi:"Nivel de Servicio (Fill Rate)", unit:"%", values:[75.4, 78.1, 79.0, 81.8, 83.6, 85.5, 88.3, 89.3, 91.2, 93.1, 95.1, 98.0] },
    { obj:"Eliminar quiebres sin sobreinventario", kpi:"Top quiebres resueltos (SKU críticos)", unit:"#", values:[16, 22, 27, 35, 46, 58, 68, 78, 88, 97, 113, 136] },
    { obj:"Mejorar márgenes del negocio", kpi:"Ticket Promedio", unit:"$", values:[576, 594, 610, 622, 638, 652, 673, 693, 716, 730, 752, 805] }
  ],
  "Procesos Internos": [
    { obj:"Eliminar quiebres sin sobreinventario", kpi:"Exactitud de Inventario", unit:"%", values:[88.4, 88.4, 90.2, 90.2, 90.2, 92.2, 92.2, 92.2, 94.1, 94.1, 95.1, 98.0] },
    { obj:"Mejorar márgenes del negocio", kpi:"Merma / Ajustes sin soporte", unit:"%", values:[2.67, 2.5, 2.34, 2.2, 2.06, 1.93, 1.83, 1.76, 1.68, 1.6, 1.49, 1.41] },
    { obj:"Mejorar liquidez del negocio", kpi:"Cumplimiento de recepción vs factura", unit:"%", values:[68.2, 70.8, 74.4, 77.1, 79.0, 81.7, 83.6, 86.4, 88.3, 90.2, 92.1, 98.0] },
  ],
  "Personal": [
    { obj:"Eliminar quiebres sin sobreinventario", kpi:"Productividad surtido (líneas/h)", unit:"#", values:[29, 32, 33, 35, 37, 38, 40, 42, 44, 46, 49, 55] },
    { obj:"Mejorar márgenes del negocio", kpi:"Cumplimiento de política de descuentos", unit:"%", values:[66.0, 68.5, 71.1, 72.9, 75.5, 78.2, 80.9, 81.8, 84.6, 87.4, 90.2, 96.0] },
    { obj:"Mejorar liquidez del negocio", kpi:"Cierre contable a tiempo (días)", unit:"d", values:[11, 11, 9, 9, 8, 7, 7, 6, 5, 5, 5, 5] },
  ],
},
  kpiCatalog: [
{
      id:"FIN-MB-001",
      nombre:"Margen Bruto %",
      capa:"Financiero",
      bloque:"Rentabilidad",
      definicion:"Rentabilidad básica de la venta (antes de gastos).",
      formula:"(Ventas - Costo de ventas) / Ventas",
      fuenteERP:[
        "Ventas",
        "Costo de ventas"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:{
        verde:">= 30",
        amarillo:"25–29",
        rojo:"< 25"
      },
      notas:"Recomendado por categoría, sucursal y canal."
    },
{
      id:"FIN-MO-002",
      nombre:"Margen Operativo %",
      capa:"Financiero",
      bloque:"Rentabilidad",
      definicion:"Utilidad operativa después de gastos operativos (sin costos financieros e impuestos).",
      formula:"Utilidad operativa / Ventas",
      fuenteERP:[
        "Estado de resultados",
        "Gastos operativos"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:{
        verde:">= 12",
        amarillo:"8–11",
        rojo:"< 8"
      },
      notas:"Señala eficiencia operativa por sucursal."
    },
{
      id:"FIN-EB-003",
      nombre:"EBITDA",
      capa:"Financiero",
      bloque:"Rentabilidad",
      definicion:"Flujo operativo antes de depreciación/amortización.",
      formula:"Utilidad operativa + Depreciación + Amortización",
      fuenteERP:[
        "Contabilidad",
        "Catálogo de cuentas"
      ],
      frecuencia:"Mensual",
      unidad:"$",
      umbrales:null,
      notas:"Útil para comparar desempeño y capacidad de caja."
    },
{
      id:"FIN-CCE-004",
      nombre:"Ciclo de Conversión de Efectivo (CCE)",
      capa:"Financiero",
      bloque:"Capital de trabajo",
      definicion:"Días que tarda el efectivo en regresar a caja desde compras→inventario→ventas→cobro.",
      formula:"DIO + DSO - DPO",
      fuenteERP:[
        "Inventarios",
        "Cuentas por cobrar",
        "Cuentas por pagar"
      ],
      frecuencia:"Mensual",
      unidad:"d",
      umbrales:{
        verde:"< 60",
        amarillo:"60–90",
        rojo:"> 90"
      },
      notas:"En retail ferretero es clave por inventario pesado."
    },
{
      id:"FIN-FEO-005",
      nombre:"Flujo de efectivo operativo",
      capa:"Financiero",
      bloque:"Liquidez",
      definicion:"Efectivo generado por la operación (sin financiamiento/inversión).",
      formula:"Entradas operativas - Salidas operativas",
      fuenteERP:[
        "Bancos",
        "Contabilidad"
      ],
      frecuencia:"Mensual",
      unidad:"$",
      umbrales:null,
      notas:"Se interpreta por tendencia y contra presupuesto."
    },
{
      id:"COM-SSS-101",
      nombre:"Ventas mismas tiendas (SSS)",
      capa:"Comercial",
      bloque:"Ventas",
      definicion:"Crecimiento solo en sucursales comparables (existían en ambos periodos).",
      formula:"(Ventas comparables t - Ventas comparables t-1) / Ventas comparables t-1",
      fuenteERP:[
        "Ventas por sucursal",
        "Catálogo sucursales (fecha apertura)"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:{
        verde:"> 5",
        amarillo:"0–5",
        rojo:"< 0"
      },
      notas:"Evita confundir expansión con crecimiento real."
    },
{
      id:"COM-TKT-102",
      nombre:"Ticket promedio",
      capa:"Comercial",
      bloque:"Ventas",
      definicion:"Valor promedio por compra.",
      formula:"Ventas / Número de tickets",
      fuenteERP:[
        "POS / Ventas"
      ],
      frecuencia:"Diario",
      unidad:"$",
      umbrales:null,
      notas:"Acompañar con # transacciones."
    },
{
      id:"COM-TRX-103",
      nombre:"Número de transacciones",
      capa:"Comercial",
      bloque:"Ventas",
      definicion:"Cantidad de tickets/facturas emitidas.",
      formula:"Conteo de tickets",
      fuenteERP:[
        "POS / Ventas"
      ],
      frecuencia:"Diario",
      unidad:"#",
      umbrales:null,
      notas:"Sirve para separar efecto tráfico vs ticket."
    },
{
      id:"COM-VXM2-104",
      nombre:"Ventas por m²",
      capa:"Comercial",
      bloque:"Eficiencia tienda",
      definicion:"Eficiencia del piso de venta.",
      formula:"Ventas / m² de tienda",
      fuenteERP:[
        "Ventas",
        "Maestro tiendas (m²)"
      ],
      frecuencia:"Mensual",
      unidad:"$/m²",
      umbrales:null,
      notas:"Benchmark interno entre sucursales."
    },
{
      id:"COM-VXV-105",
      nombre:"Ventas por vendedor",
      capa:"Comercial",
      bloque:"Productividad",
      definicion:"Productividad comercial por vendedor o por caja.",
      formula:"Ventas / Nº vendedores (o cajas)",
      fuenteERP:[
        "Ventas",
        "RH / Nómina"
      ],
      frecuencia:"Mensual",
      unidad:"$",
      umbrales:null,
      notas:"Ideal por turno/horario."
    },
{
      id:"INV-ROT-201",
      nombre:"Rotación de inventario",
      capa:"Inventario",
      bloque:"Eficiencia",
      definicion:"Veces que el inventario se vende/reemplaza en el periodo.",
      formula:"Costo de ventas / Inventario promedio",
      fuenteERP:[
        "Inventarios",
        "Costo de ventas"
      ],
      frecuencia:"Mensual",
      unidad:"x",
      umbrales:{
        verde:">= 4.0",
        amarillo:"3.0–3.9",
        rojo:"< 3.0"
      },
      notas:"Medir global y por categoría (ABC/alta rotación)."
    },
{
      id:"INV-DIO-202",
      nombre:"Días de inventario (DIO / DOH)",
      capa:"Inventario",
      bloque:"Eficiencia",
      definicion:"Días de cobertura del inventario.",
      formula:"365 / Rotación (o Inventario / Costo diario)",
      fuenteERP:[
        "Inventarios",
        "Costo de ventas"
      ],
      frecuencia:"Mensual",
      unidad:"d",
      umbrales:{
        verde:"< 90",
        amarillo:"90–120",
        rojo:"> 120"
      },
      notas:"Se usa para capital de trabajo y exceso."
    },
{
      id:"INV-GMROI-203",
      nombre:"GMROI",
      capa:"Inventario",
      bloque:"Rentabilidad del inventario",
      definicion:"Retorno del margen bruto sobre el capital invertido en inventario.",
      formula:"Margen bruto / Inventario promedio",
      fuenteERP:[
        "Ventas",
        "Costo de ventas",
        "Inventarios"
      ],
      frecuencia:"Mensual",
      unidad:"x",
      umbrales:{
        verde:">= 1.5",
        amarillo:"1.2–1.49",
        rojo:"< 1.2"
      },
      notas:"Excelente para mix de surtido (no solo rotación)."
    },
{
      id:"INV-QB-204",
      nombre:"Quiebres de stock %",
      capa:"Inventario",
      bloque:"Disponibilidad",
      definicion:"Proporción de SKUs activos en stock cero (o bajo mínimo) con demanda.",
      formula:"SKUs en quiebre / SKUs activos",
      fuenteERP:[
        "Inventarios",
        "Catálogo SKUs",
        "Mínimos/Maximos (si aplica)"
      ],
      frecuencia:"Semanal",
      unidad:"%",
      umbrales:{
        verde:"< 5",
        amarillo:"5–10",
        rojo:"> 10"
      },
      notas:"Separar quiebre en piso vs bodega/almacén."
    },
{
      id:"INV-OBS-205",
      nombre:"Inventario obsoleto / lento %",
      capa:"Inventario",
      bloque:"Calidad",
      definicion:"Inventario sin movimiento por encima de X días (p.ej. 120/180).",
      formula:"Inventario sin movimiento / Inventario total",
      fuenteERP:[
        "Inventarios",
        "Kárdex",
        "Ventas"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:{
        verde:"< 8",
        amarillo:"8–15",
        rojo:"> 15"
      },
      notas:"Definir ventanas por familia (pintura vs tornillería)."
    },
{
      id:"INV-ACC-206",
      nombre:"Exactitud de inventario %",
      capa:"Inventario",
      bloque:"Calidad",
      definicion:"Precisión del inventario del ERP vs conteos físicos.",
      formula:"1 - (|diferencia| / inventario contado)",
      fuenteERP:[
        "Conteos físicos",
        "Inventarios"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:{
        verde:">= 97",
        amarillo:"94–96",
        rojo:"< 94"
      },
      notas:"Base para confiabilidad de reposición automática."
    },
{
      id:"CMP-FILL-301",
      nombre:"Fill rate proveedor",
      capa:"Compras",
      bloque:"Cumplimiento",
      definicion:"Qué tanto el proveedor surtió lo pedido (cantidad).",
      formula:"Cantidad surtida / Cantidad pedida",
      fuenteERP:[
        "Compras (OC)",
        "Recepciones"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:{
        verde:">= 95",
        amarillo:"90–94",
        rojo:"< 90"
      },
      notas:"Complementar con lead time y calidad."
    },
{
      id:"CMP-LT-302",
      nombre:"Lead time de reposición (días)",
      capa:"Compras",
      bloque:"Tiempo",
      definicion:"Días desde que se ordena hasta que se recibe.",
      formula:"Fecha recepción - Fecha OC",
      fuenteERP:[
        "Compras (OC)",
        "Recepciones"
      ],
      frecuencia:"Mensual",
      unidad:"d",
      umbrales:null,
      notas:"Por proveedor y familia."
    },
{
      id:"CMP-URG-303",
      nombre:"Compras urgentes %",
      capa:"Compras",
      bloque:"Planeación",
      definicion:"Porcentaje de compras fuera de plan (reactivas).",
      formula:"Compras urgentes / Compras totales",
      fuenteERP:[
        "Compras"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:{
        verde:"< 10",
        amarillo:"10–20",
        rojo:"> 20"
      },
      notas:"Suele explicar sobrecostos y desorden en inventario."
    },
{
      id:"CMP-CVAR-304",
      nombre:"Variación de costo de compra %",
      capa:"Compras",
      bloque:"Costo",
      definicion:"Cambio de precio de compra vs periodo anterior o lista negociada.",
      formula:"(Costo actual - Costo anterior) / Costo anterior",
      fuenteERP:[
        "Compras",
        "Catálogo SKUs",
        "Costos"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:null,
      notas:"Afecta margen y valuación de inventario."
    },
{
      id:"OPS-VXE-401",
      nombre:"Ventas por empleado",
      capa:"Operación",
      bloque:"Productividad",
      definicion:"Productividad general por plantilla.",
      formula:"Ventas / Nº empleados",
      fuenteERP:[
        "Ventas",
        "RH / Nómina"
      ],
      frecuencia:"Mensual",
      unidad:"$",
      umbrales:null,
      notas:"Comparar por turno, sucursal y categoría."
    },
{
      id:"OPS-CUM-402",
      nombre:"Cumplimiento operativo tienda %",
      capa:"Operación",
      bloque:"Ejecución",
      definicion:"Porcentaje de checklists/estándares operativos cumplidos.",
      formula:"Checks OK / Checks totales",
      fuenteERP:[
        "VerifyQA (checklists)",
        "Operación"
      ],
      frecuencia:"Semanal",
      unidad:"%",
      umbrales:{
        verde:">= 90",
        amarillo:"70–89",
        rojo:"< 70"
      },
      notas:"Ideal para auditoría operativa y disciplina en piso."
    },
{
      id:"AUD-MER-501",
      nombre:"Mermas %",
      capa:"Riesgo y Control",
      bloque:"Pérdidas",
      definicion:"Pérdidas de inventario (ajustes/mermas) respecto a ventas.",
      formula:"Mermas / Ventas",
      fuenteERP:[
        "Inventarios (ajustes)",
        "Ventas"
      ],
      frecuencia:"Mensual",
      unidad:"%",
      umbrales:{
        verde:"< 1.5",
        amarillo:"1.5–3.0",
        rojo:"> 3.0"
      },
      notas:"Separar merma operativa vs sin soporte (riesgo)."
    },
{
      id:"AUD-CJA-502",
      nombre:"Diferencias de caja",
      capa:"Riesgo y Control",
      bloque:"Pérdidas",
      definicion:"Desviaciones en arqueos/cortes de caja.",
      formula:"Diferencia neta por corte (o % sobre ventas en caja)",
      fuenteERP:[
        "POS / Caja"
      ],
      frecuencia:"Diario",
      unidad:"$",
      umbrales:null,
      notas:"Debe tender a cero; disparador de investigación."
    },
{
      id:"AUD-HAL-503",
      nombre:"Hallazgos de auditoría (conteo)",
      capa:"Riesgo y Control",
      bloque:"Auditoría",
      definicion:"Número de hallazgos levantados en auditorías operativas/financieras.",
      formula:"Conteo de hallazgos",
      fuenteERP:[
        "VerifyQA"
      ],
      frecuencia:"Mensual",
      unidad:"#",
      umbrales:null,
      notas:"Acompañar con severidad y reincidencia."
    },
{
      id:"AUD-CAPA-504",
      nombre:"Acciones vencidas %",
      capa:"Riesgo y Control",
      bloque:"Auditoría",
      definicion:"Porcentaje de acciones correctivas/preventivas vencidas.",
      formula:"Acciones vencidas / Acciones totales",
      fuenteERP:[
        "VerifyQA (CAPA)"
      ],
      frecuencia:"Semanal",
      unidad:"%",
      umbrales:{
        verde:"< 10",
        amarillo:"10–20",
        rojo:"> 20"
      },
      notas:"Mide disciplina y cierre de brechas."
    },
{
      id:"AUD-RCR-505",
      nombre:"Riesgos críticos abiertos (conteo)",
      capa:"Riesgo y Control",
      bloque:"Riesgo",
      definicion:"Número de riesgos críticos sin mitigar o sin plan activo.",
      formula:"Conteo de riesgos con severidad crítica y estado abierto",
      fuenteERP:[
        "VerifyQA (riesgos)"
      ],
      frecuencia:"Mensual",
      unidad:"#",
      umbrales:null,
      notas:"Debe bajar con iniciativas y controles."
    }
  ],
  initiatives: [
    {
      id:"I-01",
      name:"Reposición automática por rotación y quiebre",
      owner:"Abasto",
      progress:62,
      related:["Nivel de Servicio (Fill Rate)","Días Inventario (DOH)","Exactitud de Inventario"],
      tasksTotal:120,
      overdue:2,
      quarter:"Q1–Q4",
      desc:"Este piloto toma del ERP las ventas por SKU y sucursal (tickets/facturas), las existencias por ubicación (piso/bodega/almacén), los pedidos en tránsito (OC abiertas/traspasos) y los tiempos de entrega (lead time de compras). Con eso calcula cuánto reponer para no quedarnos sin producto (quiebre) sin inflar inventario: <code>Punto de reorden = demanda diaria × lead time + stock de seguridad</code> y <code>Cantidad a pedir = Máx(0, objetivo de cobertura − (existencia + en tránsito − reservado))</code>. Ejemplo: si “pintura 19L” vende 6 pzas/día, lead time 5 días y seguridad 10 pzas, reorden = 40 pzas; cuando el ERP ve que hay 35 (incluyendo en tránsito), dispara reposición y genera tareas de surtido/transferencia por sucursal." 
    },
    {
      id:"I-02",
      name:"Top 200 SKU críticos: cero quiebres",
      owner:"Operación Tiendas",
      progress:44,
      related:["Top quiebres resueltos (SKU críticos)","Nivel de Servicio (Fill Rate)"],
      tasksTotal:80,
      overdue:11,
      quarter:"Q1–Q3",
      desc:"Aquí el ERP nos da el Top 200 por sucursal (unidades y $ de venta) y su disponibilidad diaria (existencia por ubicación + ventas). Se considera “quiebre” cuando un SKU crítico tiene 0 existencia mientras su demanda sigue activa (histórico de ventas): <code>Días en quiebre = días con existencia=0 y demanda&gt;0</code>. El módulo convierte eso en lista priorizada y tareas (piso/bodega/abasto) para evitar el típico “sí hay en bodega pero no en anaquel”. Ejemplo: si “varilla 3/8” estuvo 3 días en 0 y normalmente vende 20 pzas/día, el sistema estima 60 ventas en riesgo y dispara reposición/traspaso y verificación en tienda con evidencia." 
    },
    {
      id:"I-03",
      name:"Gobierno de descuentos y precios (política + auditoría)",
      owner:"Ventas",
      progress:70,
      related:["Cumplimiento de política de descuentos","Margen Bruto %","Ticket Promedio"],
      tasksTotal:60,
      overdue:0,
      quarter:"Q1–Q4",
      desc:"Esta iniciativa usa del ERP/POS: precio lista, precio vendido, descuento aplicado (incluye “override” en caja), costo del SKU (promedio/última compra) y autorizaciones por rol. Calcula el impacto en margen y marca excepciones: <code>%Descuento = 1 − (Precio venta / Precio lista)</code> y <code>%Margen = (Precio venta − Costo) / Precio venta</code>. Ejemplo: si un taladro tiene lista $2,500, se vende en $1,900 (24% desc.) y su costo es $1,650, el margen queda 13.2%; si la política permitía 10% sin autorización, se crea alerta y tarea de revisión, con trazabilidad de quién lo autorizó." 
    },
    {
      id:"I-04",
      name:"Racionalización de inventario (lento/obsoleto)",
      owner:"Inventarios",
      progress:51,
      related:["Días Inventario (DOH)","Ciclo de Conversión de Efectivo (días)"],
      tasksTotal:90,
      overdue:6,
      quarter:"Q2–Q4",
      desc:"El ERP aporta existencias valuadas (costo), fecha de última venta, entradas/salidas (kárdex) y ventas por SKU/sucursal. Con eso detecta inventario lento/obsoleto y cuánto “sobra” vs la cobertura objetivo: <code>DOH = Inventario promedio / Costo de ventas diario</code> y <code>Exceso = Máx(0, existencia − (cobertura objetivo × demanda diaria))</code>. Ejemplo: si un accesorio de plomería no se vende hace 120 días y hay 80 pzas, pero la demanda es 0.2/día y la cobertura objetivo es 30 días (6 pzas), el sistema marca 74 pzas como exceso y propone traslado, liquidación o devolución a proveedor (sin destruir margen)." 
    },
    {
      id:"I-05",
      name:"Recepción contra factura (3-way match)",
      owner:"Finanzas",
      progress:36,
      related:["Cumplimiento de recepción vs factura","Ciclo de Conversión de Efectivo (días)"],
      tasksTotal:70,
      overdue:14,
      quarter:"Q2–Q4",
      desc:"Esta práctica cruza 3 documentos del ERP: Orden de Compra (lo pedido y a qué precio), Recepción/Entrada (lo que realmente llegó) y Factura del proveedor (lo que nos quieren cobrar). Calcula diferencias simples para evitar fugas de caja: <code>ΔCantidad = Recibido − Facturado</code> y <code>ΔPrecio = Precio factura − Precio OC</code>. Ejemplo: si se pidió 100 cajas de tornillo a $120, se recibieron 98 y la factura llega por 100 a $125, el sistema bloquea pago, pide aclaración y deja evidencia. Eso mejora liquidez porque pagamos lo correcto y a tiempo, sin “sorpresas” en cuentas por pagar." 
    },
  ]
};

function el(tag, attrs={}, children=[]){
  const n = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k==="class") n.className=v;
    else if(k==="html") n.innerHTML=v;
    else if(k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k,v);
  }
  for(const c of children){
    if(typeof c === "string") n.appendChild(document.createTextNode(c));
    else if(c) n.appendChild(c);
  }
  return n;
}

function renderNavChildren(){
  const host = document.getElementById("navChildren");
  if(!host) return;
  host.innerHTML = "";

  const def = navTree[state.layer] || navTree.estrategia;

  host.appendChild(el("div", {class:"subHdr"}, [
    el("div", {class:"subHdrTitle"}, [def.title]),
    el("div", {class:"subHdrSub"}, [def.subtitle])
  ]));

  const grid = el("div", {class:"subGrid"}, def.children.map(ch=>{
    const isActive = (state.view === ch.view);
    return el("button", {
      class: `subTile ${isActive?"active":""}`,
      type: "button",
      "data-view": ch.view,
      "aria-current": isActive ? "page" : "false"
    }, [
      el("div", {class:"subIcon"}, [ch.icon]),
      el("div", {class:"subLbl"}, [ch.label])
    ]);
  }));
  host.appendChild(grid);
}

function setActiveNav(){
  // Menú moderno: activa padre, regenera submenú y activa hijo
  document.querySelectorAll("[data-layer]").forEach(x=>{
    const open = x.dataset.layer===state.layer;
    x.classList.toggle("active", open);
    x.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Render submenú según capa activa
  renderNavChildren();

  // Marcar activo el sub-nodo
  document.querySelectorAll("[data-view]").forEach(x=>{
    x.classList.toggle("active", x.dataset.view===state.view);
  });
  // Tabs
  document.querySelectorAll(".pill").forEach(x=>{
    x.classList.toggle("active", x.dataset.mode===state.mode);
  });
}

function pctColor(p){
  if(p>=semaforo.good) return {cls:"good", color:"var(--good)"};
  if(p>=semaforo.warn) return {cls:"warn", color:"var(--warn)"};
  return {cls:"bad", color:"var(--bad)"};
}

// --- Initiative progress helpers (Avance real vs Avance esperado a la fecha) ---
function qRange(q){
  const norm = (q||"Q1–Q4").replace(/[–—]/g,"-");
  const parts = norm.split("-").map(s=>s.trim());
  const qs = parseInt(parts[0].replace("Q",""),10) || 1;
  const qe = parseInt((parts[1]||parts[0]).replace("Q",""),10) || qs;
  const start = (qs-1)*3;      // 0=Ene
  const end   = qe*3 - 1;      // 11=Dic
  return {start, end};
}
function expectedProgress(quarter, monthIdx){
  const {start,end} = qRange(quarter);
  if(monthIdx < start) return 0;
  if(monthIdx > end) return 100;
  const dur = (end - start + 1);
  const pos = (monthIdx - start + 1);
  const frac = pos / dur;
  // ligera "carga al frente": en retail las iniciativas críticas deben avanzar más temprano
  const f = Math.pow(frac, 0.75);
  return Math.round(f*100);
}
function deltaBadge(delta){
  if(delta >= 0) return {cls:"good", txt:`Adelantado +${delta} pts`};
  if(delta >= -10) return {cls:"warn", txt:`Atraso ${Math.abs(delta)} pts`};
  return {cls:"bad", txt:`Atraso ${Math.abs(delta)} pts`};
}

function sparkline(values){
  const w=130,h=46,pad=6;
  const min=Math.min(...values), max=Math.max(...values);
  const xs = values.map((_,i)=> pad + (i*(w-2*pad)/(values.length-1)));
  const ys = values.map(v=>{
    const t = (v-min)/(max-min || 1);
    return h-pad - t*(h-2*pad);
  });
  let d = `M ${xs[0].toFixed(2)} ${ys[0].toFixed(2)} `;
  for(let i=1;i<xs.length;i++) d += `L ${xs[i].toFixed(2)} ${ys[i].toFixed(2)} `;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" fill="none">
    <path d="${d}" stroke="currentColor" stroke-width="3" opacity=".85" />
    <circle cx="${xs.at(-1)}" cy="${ys.at(-1)}" r="4" fill="currentColor"/>
  </svg>`;
}

// --- ERP Loading Overlay (2.5s) ---
let loadingTimer = null;

function showLoading(){
  const o = document.getElementById("loadingOverlay");
  if(!o) return;
  o.classList.add("show");
  o.setAttribute("aria-hidden","false");
}

function hideLoading(){
  const o = document.getElementById("loadingOverlay");
  if(!o) return;
  o.classList.remove("show");
  o.setAttribute("aria-hidden","true");
}

function syncTabActive(){
  document.querySelectorAll(".tab").forEach(t=>{
    const id = t.getAttribute("data-tab");
    t.classList.toggle("active", id===state.view);
  });
}

function navigate(next, force=false){
  const prevLayer = state.layer;
  const prevView  = state.view;

  if(next.layer) state.layer = next.layer;
  if(next.view)  state.view  = next.view;

  if(!force && prevLayer===state.layer && prevView===state.view){
    render();
    return;
  }

  // ERP Connect (Conectores / Validación) entra directo: sin overlay global de "Enlazando datos..."
  if(String(state.view).startsWith("erp-")){
    window.clearTimeout(loadingTimer);
    state.loading = false;
    hideLoading();
    render();
    return;
  }

  state.loading = true;
  showLoading();
  setActiveNav();
  syncTabActive();

  window.clearTimeout(loadingTimer);
  loadingTimer = window.setTimeout(()=>{
    state.loading = false;
    hideLoading();
    render();
  }, 3000);
}

function kpiCard(title, value, sub, series){
  return el("div", {class:"card"}, [
    el("h3",{html:title}),
    el("div",{class:"kpi"},[
      el("div",{},[
        el("div",{class:"val", html:value}),
        el("div",{class:"sub", html:sub})
      ]),
      el("div",{html:sparkline(series), class:"small"})
    ])
  ]);
}


function donutSVG(ratio, color){
  const pct = Math.max(0, Math.min(1, ratio));
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const strokeW = 14;
  return `
    <svg viewBox="0 0 92 92" class="donut" aria-hidden="true">
      <circle cx="46" cy="46" r="${r}" stroke="rgba(0,0,0,.08)" stroke-width="${strokeW}" fill="none"></circle>
      <circle cx="46" cy="46" r="${r}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" fill="none"
              stroke-dasharray="${dash} ${c - dash}" transform="rotate(-90 46 46)"></circle>
      <circle cx="46" cy="46" r="26" fill="#ffffff" stroke="rgba(0,0,0,.06)" stroke-width="1"></circle>
    </svg>
  `;
}

function donutKpiCard(title, actualValue, metaLine, ratio){
  const c = pctColor(ratio);
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return el("div", {class:"card donutCard"}, [
    el("h3",{html:title}),
    el("div",{class:"donutRow"},[
      el("div",{class:"donutWrap"},[
        el("div",{class:"donutSvg", html:donutSVG(ratio, c.color)}),
        el("div",{class:"donutCenter"},[
          el("div",{class:"donutPct", html:`${pct.toFixed(0)}%`}),
          el("div",{class:"donutLbl", html:"vs meta"})
        ])
      ]),
      el("div",{class:"donutInfo"},[
        el("div",{class:"val", html:actualValue}),
        el("div",{class:"sub", html:`<span class="sema" style="background:${c.color}"></span> ${metaLine}`})
      ])
    ])
  ]);
}


function viewDashboard(){
  // Quick summary based on selected month and mode
  const mi = months.indexOf(state.month);
  const data = model[state.mode];

  const find = (kpi)=> getKpiValue(kpi, mi);

  const fill = find("Nivel de Servicio (Fill Rate)");
  const doh  = find("Días Inventario (DOH)");
  const gm   = find("Margen Bruto %");
  const ccc  = find("Ciclo de Conversión de Efectivo (días)");

  const acc  = find("Exactitud de Inventario");
  const merma = find("Merma / Ajustes sin soporte");

  const root = el("div",{},[
    el("div",{class:"grid"},[
      donutKpiCard("Nivel de Servicio (Fill Rate)", `${fill.toFixed(1)}%`, `Meta: 98% · Mes: ${state.month} · Sucursal: ${state.store}`, ratioValue(fill, 98, true)),
      donutKpiCard("Margen Bruto", `${gm.toFixed(1)}%`, `Meta: 26.5% · Mes: ${state.month} · Área: ${state.area}`, ratioValue(gm, 26.5, true)),
      donutKpiCard("Liquidez (CCC)", `${ccc.toFixed(0)} días`, `Meta: 60 días · Enfoque: caja`, ratioValue(ccc, 60, false)),
    ]),
    el("div",{class:"row"},[
      // Semáforo ejecutivo (ocupa todo el ancho)
      el("div",{class:"card", style:"grid-column:1 / -1;"},[
        el("h3",{html:"Semáforo ejecutivo (3 objetivos 2026)"}),
        el("div",{style:"margin-top:12px; display:grid; gap:10px;"},[
          scoreLine("Mejorar márgenes", ratioValue(gm, 26.5, true), `${gm.toFixed(1)}% vs meta 26.5%`),
          scoreLine("Mejorar liquidez", ratioValue(ccc, 60, false), `${ccc.toFixed(0)} días vs meta 60 días`),
          scoreLine("Cero quiebres sin sobreinventario", ratioValue(fill, 98, true), `${fill.toFixed(1)}% vs meta 98%`),
        ]),
        el("div",{class:"note", style:"margin-top:10px;"},[
          "Este tablero es la vista rápida. Las pantallas BSC (Datos / Mapa / Scorecard / Iniciativas) viven dentro de Estrategia."
        ])
      ])
    ]),

    // Inventario (salud): 3 donas simétricas como las de arriba
    el("div",{style:"margin-top:14px; font-weight:800; color: var(--muted);"},["Inventario (salud)"]),
    el("div",{class:"grid", style:"margin-top:10px;"},[
      donutKpiCard("Días inventario (DOH)", `${doh.toFixed(0)} días`, `Meta: 74 días · Mes: ${state.month} · Sucursal: ${state.store}`, ratioValue(doh, 74, false)),
      donutKpiCard("Exactitud inventario", `${acc.toFixed(1)}%`, `Meta: 98% · Mes: ${state.month} · Sucursal: ${state.store}`, ratioValue(acc, 98, true)),
      donutKpiCard("Merma / ajustes sin soporte", `${merma.toFixed(2)}%`, `Meta: 1.20% · Mes: ${state.month} · Sucursal: ${state.store}`, ratioValue(merma, 1.2, false)),
    ]),
  ]);
  return root;
}

function ratioValue(actual, target, higherIsBetter){
  // returns ratio 0..1 where 1 means hitting target
  if(higherIsBetter){
    return Math.max(0, Math.min(1, actual/target));
  }
  // lower is better
  return Math.max(0, Math.min(1, target/actual));
}

function scoreLine(name, ratio, meta){
  const c = pctColor(ratio);
  const pct = (ratio*100);
  const row = el("div",{class:"scoreRow"},[
    el("div",{},[
      el("div",{class:"name", html:name}),
      el("div",{class:"meta", html:meta})
    ]),
    el("div",{class:"meter"},[
      el("i",{style:`width:${Math.max(2,Math.min(100,pct)).toFixed(0)}%; background:${c.color}`})
    ]),
    el("div",{class:"pct"},[
      el("span",{class:"sema", style:`background:${c.color}`}),
      el("span",{html:`${pct.toFixed(0)}%`})
    ])
  ]);
  return row;
}

// Bullet graph helpers (viñetas)
function bulletBounds(actual, target, higherIsBetter){
  const min = 0;

  if(higherIsBetter){
    // Si parece porcentaje, mantenemos escala 0..100
    const looksPct = (target <= 100 && actual <= 120);
    let max = looksPct ? 100 : Math.max(target * 1.20, actual * 1.10);
    const badEnd  = 0.70 * target;
    const warnEnd = 0.90 * target;
    // Asegura que el rango cubra al menos la meta
    max = Math.max(max, warnEnd * 1.10, target * 1.05);
    return {min, max, splits:[badEnd, warnEnd], order:["bad","warn","good"]};
  }

  // Menor es mejor: convertimos umbrales de ratio (>=.90 / >=.70) a valores reales
  const goodEnd = target / semaforo.good; // p.ej. 74/0.90
  const warnEnd = target / semaforo.warn; // p.ej. 74/0.70
  const max = Math.max(warnEnd * 1.25, actual * 1.10, goodEnd * 1.35);
  return {min, max, splits:[goodEnd, warnEnd], order:["good","warn","bad"]};
}

function bulletLine(name, actual, target, higherIsBetter, meta){
  const ratio = ratioValue(actual, target, higherIsBetter);
  const c = pctColor(ratio);

  const b = bulletBounds(actual, target, higherIsBetter);
  const clamp = (v)=> Math.max(b.min, Math.min(b.max, v));
  const pct = (v)=> ((clamp(v) - b.min) / (b.max - b.min)) * 100;

  const p1 = pct(b.splits[0]);
  const p2 = pct(b.splits[1]);
  const pA = pct(actual);
  const pT = pct(target);

  const segs = [
    {from:0,  to:p1, cls:b.order[0]},
    {from:p1, to:p2, cls:b.order[1]},
    {from:p2, to:100,cls:b.order[2]},
  ];

  return el("div",{class:"bulletRow"},[
    el("div",{class:"bText"},[
      el("div",{class:"name", html:name}),
      el("div",{class:"meta", html:meta}),
    ]),
    el("div",{class:"bullet"},[
      ...segs.map(s=> el("div",{class:`range ${s.cls}`, style:`left:${s.from}%; width:${Math.max(0, s.to - s.from)}%;`})),
      el("div",{class:"measure", style:`width:${Math.max(0, Math.min(100, pA)).toFixed(1)}%;`}),
      el("div",{class:"target", style:`left:${Math.max(0, Math.min(100, pT)).toFixed(1)}%;`}),
    ]),
    el("div",{class:"pct"},[
      el("span",{class:"sema", style:`background:${c.color}`}),
      el("span",{html:`${(ratio*100).toFixed(0)}%`})
    ])
  ]);
}

function viewBscDatos(){
  // Subvista: tabla (por mes) o catálogo KPI (Normateca)
  const sub = state.bscDatosView || "tabla";
  if(sub === "catalogo") return viewKpiCatalog();

  const data = model[state.mode];
  const hdr = el("div",{class:"tablewrap"},[
    el("div",{class:"tablehdr"},[
      el("h2",{html:"BSC1 · Datos de Objetivos y KPIs (por mes)"}),
      el("div",{class:"right"},[
        // Subvista
        el("div",{class:"pills"},[
          el("div",{class:`pill ${sub==="tabla"?"active":""}`, onclick:()=>{state.bscDatosView="tabla"; render();}},["KPIs (por mes)"]),
          el("div",{class:`pill ${sub==="catalogo"?"active":""}`, onclick:()=>{state.bscDatosView="catalogo"; render();}},["Catálogo KPIs"]),
        ]),
        // Modo (objetivos/reales)
        el("div",{class:"pills"},[
          el("div",{class:"pill", "data-mode":"objetivos", onclick:()=>{state.mode="objetivos"; render();}},["Objetivos"]),
          el("div",{class:"pill", "data-mode":"reales", onclick:()=>{state.mode="reales"; render();}},["Reales"]),
        ]),
        el("span",{class:"badge"},[
          el("span",{class:"dot good"}), "Verde ≥ 90%",
        ]),
        el("span",{class:"badge"},[
          el("span",{class:"dot warn"}), "Amarillo ≥ 70%",
        ]),
        el("span",{class:"badge"},[
          el("span",{class:"dot bad"}), "Rojo < 70%",
        ]),
      ])
    ]),
    buildDataTable(data)
  ]);
  return el("div",{},[hdr]);
}

function viewKpiCatalog(){
  const capas = ["Todas", ...Array.from(new Set((model.kpiCatalog||[]).map(k=>k.capa).filter(Boolean)))];
  const freqs = ["Todas", ...Array.from(new Set((model.kpiCatalog||[]).map(k=>k.frecuencia).filter(Boolean)))];
  const fuentes = ["Todas", ...Array.from(new Set((model.kpiCatalog||[]).flatMap(k=>k.fuenteERP||[]).filter(Boolean)))];

  const wrap = el("div",{class:"tablewrap"},[
    el("div",{class:"tablehdr"},[
      el("h2",{html:"Catálogo de KPIs · Normateca (diccionario técnico)"}),
      el("div",{class:"right"},[
        el("div",{class:"pills"},[
          el("div",{class:`pill ${state.bscDatosView==="tabla"?"active":""}`, onclick:()=>{state.bscDatosView="tabla"; render();}},["KPIs (por mes)"]),
          el("div",{class:`pill ${state.bscDatosView==="catalogo"?"active":""}`, onclick:()=>{state.bscDatosView="catalogo"; render();}},["Catálogo KPIs"]),
        ]),
        el("button",{class:"btn", onclick:exportKpiCatalogCsv},["Export CSV"]),
      ])
    ]),
    el("div",{class:"card", style:"margin-top:12px"},[
      el("div",{class:"filters"},[
        el("input",{class:"ksearch", placeholder:"Buscar KPI (ID, nombre, fórmula, fuente…)", value: state.kpiCatalogQuery || "",
          oninput:(e)=>{state.kpiCatalogQuery = e.target.value; render();}}),
        el("span",{class:"select"},[
          el("span",{class:"small"},["Capa"]),
          (function(){
            const s = el("select",{onchange:(e)=>{state.kpiCatalogCapa=e.target.value; render();}});
            capas.forEach(x=>{
              const o = el("option",{value:x},[x]);
              if((state.kpiCatalogCapa||"Todas")===x) o.selected = true;
              s.appendChild(o);
            });
            return s;
          })()
        ]),
        el("span",{class:"select"},[
          el("span",{class:"small"},["Frecuencia"]),
          (function(){
            const s = el("select",{onchange:(e)=>{state.kpiCatalogFreq=e.target.value; render();}});
            freqs.forEach(x=>{
              const o = el("option",{value:x},[x]);
              if((state.kpiCatalogFreq||"Todas")===x) o.selected = true;
              s.appendChild(o);
            });
            return s;
          })()
        ]),
        el("span",{class:"select"},[
          el("span",{class:"small"},["Fuente ERP"]),
          (function(){
            const s = el("select",{onchange:(e)=>{state.kpiCatalogFuente=e.target.value; render();}});
            fuentes.forEach(x=>{
              const o = el("option",{value:x},[x]);
              if((state.kpiCatalogFuente||"Todas")===x) o.selected = true;
              s.appendChild(o);
            });
            return s;
          })()
        ]),
        el("div",{class:"note small", style:"margin-left:auto"},[
          "Click en un KPI para ver detalle (definición, fórmula, umbrales y notas)."
        ])
      ]),
      buildKpiCatalogTable()
    ])
  ]);

  return wrap;
}

function buildKpiCatalogTable(){
  const q = (state.kpiCatalogQuery || "").trim().toLowerCase();
  const capa = state.kpiCatalogCapa || "Todas";
  const freq = state.kpiCatalogFreq || "Todas";
  const fuente = state.kpiCatalogFuente || "Todas";

  const list = (model.kpiCatalog || []).filter(k=>{
    if(capa !== "Todas" && k.capa !== capa) return false;
    if(freq !== "Todas" && k.frecuencia !== freq) return false;
    if(fuente !== "Todas" && !(k.fuenteERP||[]).includes(fuente)) return false;

    if(!q) return true;
    const blob = [
      k.id, k.nombre, k.capa, k.bloque, k.definicion, k.formula,
      (k.fuenteERP||[]).join(" "), k.frecuencia, k.unidad,
      (k.notas||"")
    ].join(" ").toLowerCase();
    return blob.includes(q);
  });

  const thead = el("thead",{},[
    el("tr",{},[
      el("th",{},["ID"]),
      el("th",{},["KPI"]),
      el("th",{},["Clasificación"]),
      el("th",{},["Frecuencia"]),
      el("th",{},["Fuente ERP"]),
      el("th",{},["Unidad"]),
      el("th",{},["Umbrales"]),
    ])
  ]);

  const tbody = el("tbody");
  if(!list.length){
    tbody.appendChild(el("tr",{},[
      el("td",{colspan:7, class:"note"},["Sin resultados con los filtros actuales."])
    ]));
  }else{
    list.forEach(k=>{
      const tr = el("tr",{class:"rowClick", onclick:()=>openDrawerKpiCatalog(k)},[
        el("td",{class:"mono"},[k.id]),
        el("td",{},[
          el("div",{class:"kpiName", html:k.nombre}),
          el("div",{class:"small muted", html:(k.definicion||"")})
        ]),
        el("td",{},[
          el("div",{class:"small", html:`${k.capa} · ${k.bloque}`})
        ]),
        el("td",{class:"small"},[k.frecuencia || "—"]),
        el("td",{class:"small"},[(k.fuenteERP||[]).slice(0,2).join(", ") + ((k.fuenteERP||[]).length>2 ? "…" : "")]),
        el("td",{class:"small"},[k.unidad || "—"]),
        el("td",{},[
          renderUmbralesBadges(k.umbrales)
        ]),
      ]);
      tbody.appendChild(tr);
    });
  }

  return el("div",{class:"tablewrap2"},[
    el("table",{class:"tbl"},[thead,tbody])
  ]);
}

function renderUmbralesBadges(u){
  if(!u) return el("span",{class:"badge"},["—"]);
  return el("div",{class:"kbadges"},[
    el("span",{class:"badge good"},[`🟢 ${u.verde}`]),
    el("span",{class:"badge warn"},[`🟡 ${u.amarillo}`]),
    el("span",{class:"badge bad"},[`🔴 ${u.rojo}`]),
  ]);
}

function openDrawerKpiCatalog(k){
  const drawer = document.getElementById("drawer");
  const sub = document.getElementById("drawerSubtitle");
  if(sub) sub.textContent = "";

  drawer.querySelector(".title").textContent = `KPI · ${k.nombre}`;
  const body = drawer.querySelector(".body");
  body.innerHTML = "";

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Ficha técnica"}),
    el("div",{class:"list"},[
      ["ID", k.id],
      ["Capa", k.capa],
      ["Bloque", k.bloque],
      ["Frecuencia", k.frecuencia || "—"],
      ["Unidad", k.unidad || "—"],
      ["Fuente ERP", (k.fuenteERP||[]).join(" · ") || "—"],
    ].map(([kk,vv])=> el("div",{class:"item"},[
      el("div",{class:"l", html:kk}),
      el("div",{class:"r", html:vv})
    ])))
  ]));

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Definición"}),
    el("div",{class:"note", html:k.definicion || "—"})
  ]));

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Fórmula"}),
    el("div",{class:"note", html:`<span class=\"mono\">${(k.formula || "—")}</span>`})
  ]));

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Umbrales / Semáforo"}),
    el("div",{class:"pmeta"},[
      renderUmbralesBadges(k.umbrales)
    ])
  ]));

  if(k.notas){
    body.appendChild(el("div",{class:"dblock"},[
      el("h4",{html:"Notas"}),
      el("div",{class:"note", html:k.notas})
    ]));
  }

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Conexión ORKESTA"}),
    el("div",{class:"note", html:`
      <b>ERP Connect:</b> extrae los datos base (ventas, inventarios, compras, cartera, pagos).<br>
      <b>Estrategia:</b> este KPI se publica en Scorecard y se semaforiza vs meta.<br>
      <b>Ejecución:</b> cuando cae a amarillo/rojo, dispara tareas (abasto, piso, caja, auditoría).<br>
      <b>Control:</b> VerifyQA valida evidencia y cierre de acciones (CAPA).
    `})
  ]));

  drawer.classList.add("open");
}

function exportKpiCatalogCsv(){
  const headers = ["id","nombre","capa","bloque","definicion","formula","fuenteERP","frecuencia","unidad","verde","amarillo","rojo","notas"];
  const lines = [headers.join(",")];

  (model.kpiCatalog||[]).forEach(k=>{
    const row = [
      k.id, k.nombre, k.capa, k.bloque,
      k.definicion||"", k.formula||"",
      (k.fuenteERP||[]).join(" | "),
      k.frecuencia||"", k.unidad||"",
      k.umbrales?.verde||"", k.umbrales?.amarillo||"", k.umbrales?.rojo||"",
      k.notas||""
    ].map(csvEscape).join(",");
    lines.push(row);
  });

  const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orkesta_kpi_catalog.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(v){
  const s = String(v ?? "");
  if(/[",\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
  return s;
}

function buildDataTable(data){
  const thead = el("thead",{},[
    el("tr",{},[
      el("th",{},["Perspectiva / Objetivo"]),
      el("th",{},["Indicador"]),
      ...months.map(m=> el("th",{},[m]))
    ])
  ]);
  const tbody = el("tbody");

  // index de metas (objetivos) por KPI
  const targetMap = {};
  for(const sec of Object.values(model.objetivos)){
    for(const r of sec){
      targetMap[r.kpi] = r;
    }
  }

  for(const [sec, rows] of Object.entries(data)){
    tbody.appendChild(el("tr",{},[
      el("td",{class:"sec", colspan:14},[sec])
    ]));

    for(const r of rows){
      const tr = el("tr",{},[
        el("td",{},[
          el("div",{class:"obj", html:r.obj}),
        ]),
        el("td",{},[
          el("div",{class:"kpiName", html:r.kpi})
        ]),
      ]);

      const higherBetter = higherIsBetterKpi(r.kpi);
      const targetRow = targetMap[r.kpi] || r;

      r.values.forEach((base, i)=>{
        const v = (state.mode==="reales") ? adjustByStore(r.kpi, r.unit, base, state.store) : base;

        // semáforo por mes:
        // - en "Reales": compara contra el objetivo del mismo mes
        // - en "Objetivos": compara contra la meta de Diciembre (para ver avance del plan)
        const target = (state.mode==="reales") ? (targetRow.values[i]) : (targetRow.values[11]);

        const ratio = ratioValue(v, target, higherBetter);
        const c = pctColor(ratio);

        const formatted = (r.unit==="%") ? v.toFixed(2) : (r.unit==="$") ? v.toFixed(0) : v.toFixed(0);
        const td = el("td",{},[
          el("span",{class:`cell ${c.cls}`, title:`${(ratio*100).toFixed(0)}% vs meta`},[formatted])
        ]);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    }
  }

  return el("table",{class:"tbl"},[thead, tbody]);
}


function viewBscMapa(){
  const mi = months.indexOf(state.month);

  const perspectives = [
    {key:"Finanzas", label:"Finanzas"},
    {key:"Clientes", label:"Clientes"},
    {key:"Procesos Internos", label:"Procesos"},
    {key:"Personal", label:"Personal"},
  ];

  // Helpers
  const byKpi = (rows)=> Object.fromEntries(rows.map(r=>[r.kpi, r]));
  const targetIndex = {};
  for(const [sec, rows] of Object.entries(model.objetivos)){
    targetIndex[sec] = byKpi(rows);
  }
  const actualIndex = {};
  for(const [sec, rows] of Object.entries(model[state.mode])){
    actualIndex[sec] = byKpi(rows);
  }

  const chip = (ratio)=> {
    const c = pctColor(ratio);
    return `<span class="chip ${c.cls}">${(ratio*100).toFixed(0)}%</span>`;
  };

  const cardFor = (secKey, secLabel, kpiKey)=>{
    const tRow = (targetIndex[secKey]||{})[kpiKey];
    const aRow = (actualIndex[secKey]||{})[kpiKey] || tRow;
    if(!tRow || !aRow) return null;

    const higherBetter = higherIsBetterKpi(kpiKey);

    // Valor mostrado
    const base = aRow.values[mi];
    const shown = (state.mode==="reales") ? adjustByStore(aRow.kpi, aRow.unit, base, state.store) : base;

    // Meta:
    // - Reales: meta del mismo mes
    // - Objetivos: meta final de diciembre (para ver avance del plan)
    const meta = (state.mode==="reales") ? tRow.values[mi] : tRow.values[11];

    const ratio = ratioValue(shown, meta, higherBetter);
    const c = pctColor(ratio);

    const vTxt = formatKpi(kpiKey, shown);
    const mTxt = formatKpi(kpiKey, meta);

    const n = { t: tRow.obj, s: secLabel, k: kpiKey };

    return el("div",{class:"mapcard", onclick:()=>openDrawerObjective(n, model[state.mode])},[
      el("div",{class:"obj", html: tRow.obj}),
      el("div",{class:"kpi", html: kpiKey}),
      el("div",{class:"chips", html:
        chip(ratio) +
        `<span class="chip">Valor: ${vTxt}</span>` +
        `<span class="chip">Meta: ${mTxt}</span>`
      })
    ]);
  };

  const rows = el("div",{class:"maprows"},
    perspectives.map(p=>{
      const secRows = model.objetivos[p.key] || [];
      const cards = secRows.map(r=> cardFor(p.key, p.label, r.kpi)).filter(Boolean);

      return el("div",{class:"maprow"},[
        el("div",{class:"laneLabel"},[p.label]),
        el("div",{class:"laneCards"}, cards.length ? cards : [el("div",{class:"note"},["—"])])
      ]);
    })
  );

  const map = el("div",{class:"mapwrap"},[
    el("div",{class:"tablehdr", style:"border-bottom:1px solid var(--line); border-radius:14px; box-shadow:none; background:transparent; padding:0 0 12px 0;"},[
      el("h2",{html:"BSC2 · Mapa Estratégico (de lo general a lo particular)"}),
      el("div",{class:"right"},[
        el("div",{class:"pills"},[
          el("div",{class:"pill", "data-mode":"objetivos", onclick:()=>{state.mode="objetivos"; render();}},["Objetivos"]),
          el("div",{class:"pill", "data-mode":"reales", onclick:()=>{state.mode="reales"; render();}},["Reales"]),
        ]),
        el("span",{class:"select"},[
          el("span",{class:"small"},["Seleccionar mes"]),
          buildMonthSelect()
        ])
      ])
    ]),
    rows
  ]);

  return map;
}


function buildMapLinksSvg(nodes){
  // simple arrows between nodes by id order (macro -> micro)
  const byId = Object.fromEntries(nodes.map(n=>[n.id,n]));
  const links = [
    ["N6","N4"],["N4","N5"],["N5","N3"],["N3","N1"],["N3","N2"]
  ];
  const path = (a,b)=>{
    const x1=a.x+110, y1=a.y+30;
    const x2=b.x+110, y2=b.y+30;
    const mx=(x1+x2)/2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  };
  let out = `
    <defs>
      <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <path d="M 0 0 L 12 6 L 0 12 z" fill="rgba(45,140,255,.55)"></path>
      </marker>
    </defs>
  `;
  for(const [sa,sb] of links){
    const a=byId[sa], b=byId[sb];
    out += `<path d="${path(a,b)}" stroke="rgba(45,140,255,.40)" stroke-width="3" fill="none" marker-end="url(#arrow)"/>`;
  }
  return out;
}

function formatKpi(kpi, val){
  if(val===null || val===undefined) return "—";
  if(kpi.includes("%") || kpi.includes("Fill Rate") || kpi.includes("Exactitud")) return `${val.toFixed(1)}%`;
  if(kpi.includes("Ticket")) return `$${val.toFixed(0)}`;
  if(kpi.includes("(días)") || kpi.includes("DOH") || kpi.includes("CCC")) return `${val.toFixed(0)} d`;
  return `${val}`;
}

function viewBscScorecard(){
  const mi = months.indexOf(state.month);
  const data = model[state.mode];

  const sections = [
    {name:"Finanzas", color:"var(--brand)"},
    {name:"Clientes", color:"var(--accent)"},
    {name:"Procesos Internos", color:"var(--brand)"},
    {name:"Personal", color:"var(--accent)"},
  ];

  // build cards by perspective with KPI rows (Actual/Meta/Achievement + spark)
  const root = el("div",{},[
    el("div",{class:"tablewrap"},[
      el("div",{class:"tablehdr"},[
        el("h2",{html:"BSC3 · Balanced Scorecard (Semaforizado: Planeado vs Real)"}),
        el("div",{class:"right"},[
          el("div",{class:"pills"},[
            el("div",{class:"pill", "data-mode":"objetivos", onclick:()=>{state.mode="objetivos"; render();}},["Planeado (Objetivos)"]),
            el("div",{class:"pill", "data-mode":"reales", onclick:()=>{state.mode="reales"; render();}},["Real"]),
          ]),
          el("span",{class:"select"},[
            el("span",{class:"small"},["Seleccionar mes"]),
            buildMonthSelect()
          ])
        ])
      ]),
      el("div",{style:"padding:14px; display:grid; grid-template-columns:1fr 1fr; gap:14px;"},[
        scorecardPerspective("Finanzas", data["Finanzas"], mi),
        scorecardPerspective("Clientes", data["Clientes"], mi),
        scorecardPerspective("Procesos Internos", data["Procesos Internos"], mi),
        scorecardPerspective("Personal", data["Personal"], mi),
      ])
    ])
  ]);
  return root;
}

function scorecardPerspective(title, rows, mi){
  // For demo: compare against objectives even if mode is reales or objetivos
  const targetRows = model.objetivos[title==="Procesos Internos" ? "Procesos Internos" : title] || [];
  const actualRows = (state.mode==="reales") ? (model.reales[title==="Procesos Internos" ? "Procesos Internos" : title] || []) : (model.objetivos[title==="Procesos Internos" ? "Procesos Internos" : title] || []);
  const box = el("div",{class:"card"},[
    el("h3",{html:title}),
    el("div",{style:"margin-top:10px; border-top:1px solid var(--line); padding-top:10px;"})
  ]);
  const body = box.querySelector("div[style*='padding-top']");
  for(let i=0;i<actualRows.length;i++){
    const a = actualRows[i];
    const t = targetRows[i] || a;
    const target = t.values[mi];
    const higherBetter = higherIsBetterKpi(a.kpi);
    const baseActual = a.values[mi];
    const actual = (state.mode==="reales") ? adjustByStore(a.kpi, a.unit, baseActual, state.store) : baseActual;
    const ratio = ratioValue(actual, target, higherBetter);
    const c = pctColor(ratio);
    const row = el("div",{class:"scoreRow", style:"grid-template-columns: 1.2fr 1fr 0.9fr;"},[
      el("div",{},[
        el("div",{class:"name", html:a.obj}),
        el("div",{class:"meta", html:`${a.kpi}`})
      ]),
      el("div",{class:"meter"},[
        el("i",{style:`width:${Math.max(2,Math.min(100,ratio*100)).toFixed(0)}%; background:${c.color}`})
      ]),
      el("div",{class:"pct"},[
        el("span",{class:"sema", style:`background:${c.color}`}),
        el("span",{html:`${formatKpi(a.kpi, actual)} / ${formatKpi(a.kpi, target)}`})
      ])
    ]);
    body.appendChild(row);
  }
  return box;
}

// --- Cat Objetivos (catálogo ferretería): helpers y vista ---
const thresholdsCatObj = { ok: 0.90, warn: 0.70 };
function clampCatObj(n, a, b){ return Math.max(a, Math.min(b, n)); }
function achievementCatObj(k){
  if (k.direccion === "lower_better") {
    if (k.actual <= 0) return 0;
    return k.meta / k.actual;
  }
  if (k.meta <= 0) return 0;
  return k.actual / k.meta;
}
function statusFromAchCatObj(a){
  if (a >= thresholdsCatObj.ok) return "ok";
  if (a >= thresholdsCatObj.warn) return "warn";
  return "bad";
}
function fmtCatObj(n, unit){
  const isMoney = unit === "MXN";
  const isPct = unit === "%";
  const isX = unit === "x";
  if (typeof n !== "number" || !isFinite(n)) return String(n);
  const abs = Math.abs(n);
  let val;
  if (isMoney){
    if (abs >= 1e6) val = (n/1e6).toFixed(2) + "M";
    else if (abs >= 1e3) val = (n/1e3).toFixed(0) + "K";
    else val = n.toFixed(0);
    return "$" + val + " " + unit;
  }
  if (isPct) return n.toFixed(1) + unit;
  if (unit === "días" || unit === "meses") return n.toFixed(0) + " " + unit;
  if (isX) return n.toFixed(1) + unit;
  if (unit === "#") return n.toFixed(0);
  return n.toLocaleString("es-MX", { maximumFractionDigits: 1 });
}
function objectiveStatusCatObj(obj){
  const achs = obj.kpis.map(k => achievementCatObj(k));
  const avg = achs.reduce((a,b)=>a+b,0) / Math.max(1, achs.length);
  return statusFromAchCatObj(avg);
}
function objectiveScoreCatObj(obj){
  const achs = obj.kpis.map(k => achievementCatObj(k));
  const avg = achs.reduce((a,b)=>a+b,0) / Math.max(1, achs.length);
  return clampCatObj(avg, 0, 1.25);
}
function escapeHtmlCat(s){
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m]));
}
function donutSvgCatObj(pct01, status){
  const r = 18, c = 2 * Math.PI * r;
  const pct = clampCatObj(pct01, 0, 1);
  const dash = (pct * c).toFixed(2);
  const stroke = status === "ok" ? "var(--good)" : status === "warn" ? "var(--warn)" : "var(--bad)";
  return `<svg class="donut catObjDonut" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="${r}" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="6"></circle><circle cx="22" cy="22" r="${r}" fill="none" stroke-width="6" stroke-linecap="round" stroke="${stroke}" stroke-dasharray="${dash} ${c}" transform="rotate(-90 22 22)"></circle><text x="22" y="25" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ink)">${Math.round(pct*100)}%</text></svg>`;
}
function sparkSvgCatObj(values, status){
  const w = 120, h = 28, pad = 3;
  const v = (values && values.length) ? values : [0,0,0,0,0,0];
  const min = Math.min(...v), max = Math.max(...v), span = (max - min) || 1;
  const pts = v.map((val, i) => {
    const x = pad + (i * (w - pad*2) / (v.length - 1));
    const y = pad + (h - pad*2) * (1 - ((val - min) / span));
    return [x,y];
  });
  const d = pts.map((p,i)=> (i===0 ? `M ${p[0].toFixed(2)} ${p[1].toFixed(2)}` : `L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`)).join(" ");
  const stroke = status === "ok" ? "var(--good)" : status === "warn" ? "var(--warn)" : "var(--bad)";
  return `<svg class="spark catObjSpark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function matchesCatObj(obj, q, cat, status){
  const text = (obj.titulo + " " + obj.categoria + " " + obj.quote + " " + obj.kpis.map(k=>k.nombre).join(" ")).toLowerCase();
  const okQ = !q || text.includes(q);
  const okCat = (cat === "Todas" || obj.categoria === cat);
  const okStatus = (status === "all" || objectiveStatusCatObj(obj) === status);
  return okQ && okCat && okStatus;
}

function viewBscCatObjetivos(){
  const q = (state.catObjetivosQ || "").trim().toLowerCase();
  const cat = state.catObjetivosCat || "Todas";
  const st = state.catObjetivosStatus || "all";

  const items = catalogObjetivosData
    .slice()
    .sort((a,b)=> CATEGORIES_CAT_OBJ.indexOf(a.categoria) - CATEGORIES_CAT_OBJ.indexOf(b.categoria))
    .filter(o => matchesCatObj(o, q, cat, st));

  const counts = { ok: 0, warn: 0, bad: 0 };
  let worst = null;
  catalogObjetivosData.forEach(o => {
    const s = objectiveStatusCatObj(o);
    counts[s]++;
    if (!worst || objectiveScoreCatObj(o) < objectiveScoreCatObj(worst)) worst = o;
  });
  const quickText = `Total: ${catalogObjetivosData.length} objetivos · Verde: ${counts.ok} · Amarillo: ${counts.warn} · Rojo: ${counts.bad}`;
  const quickSub = worst ? `Ojo: el más presionado hoy es "${worst.titulo}" (${worst.categoria}).` : "";

  const currentCat = state.catObjetivosCat || "Todas";
  const currentStatus = state.catObjetivosStatus || "all";
  const catOptions = ["Todas"].concat(CATEGORIES_CAT_OBJ).map(c => el("option", { value: c, ...(c === currentCat ? { selected: true } : {}) }, [c]));

  const toolbar = el("div", { class: "catObjToolbar" }, [
    el("div", { class: "select catObjField" }, [
      el("span", { class: "small" }, ["Buscar"]),
      el("input", { type: "search", placeholder: "Ej. margen, caja, quiebre…", value: state.catObjetivosQ || "", oninput: function(e){ state.catObjetivosQ = e.target.value; clearTimeout(window._catObjSearchDebounce); window._catObjSearchDebounce = setTimeout(function(){ render(); if (state.view === "bsc-cat-objetivos") { setTimeout(function(){ var inp = document.querySelector(".catObjetivosWrap input[type=search]"); if (inp) { inp.focus(); var len = (inp.value || "").length; inp.setSelectionRange(len, len); } }, 0); } }, 280); } })
    ]),
    el("div", { class: "select catObjField" }, [
      el("span", { class: "small" }, ["Categoría"]),
      el("select", { onchange: function(e){ state.catObjetivosCat = e.target.value; render(); } }, catOptions)
    ]),
    el("div", { class: "select catObjField" }, [
      el("span", { class: "small" }, ["Semáforo"]),
      el("select", { onchange: function(e){ state.catObjetivosStatus = e.target.value; render(); } }, [
        el("option", { value: "all", ...(currentStatus === "all" ? { selected: true } : {}) }, ["Todos"]),
        el("option", { value: "ok", ...(currentStatus === "ok" ? { selected: true } : {}) }, ["Verde"]),
        el("option", { value: "warn", ...(currentStatus === "warn" ? { selected: true } : {}) }, ["Amarillo"]),
        el("option", { value: "bad", ...(currentStatus === "bad" ? { selected: true } : {}) }, ["Rojo"])
      ])
    ]),
    el("button", { class: "btn", type: "button", onclick: function(){ state.catObjetivosQ = ""; state.catObjetivosCat = "Todas"; state.catObjetivosStatus = "all"; render(); } }, [
      el("span", { class: "dot" }),
      "Limpiar"
    ])
  ]);

  const summaryRow = el("div", { class: "catObjSummaryRow" }, [
    el("div", { class: "card catObjPanel" }, [
      el("h3", {}, ["Cómo leer este catálogo"]),
      el("p", { class: "note" }, ["Cada tarjeta es un objetivo típico de CEO/Consejo en una cadena ferretería. La frase entre comillas es jerga de piso. Abre cualquier tarjeta para ver KPIs, semáforo y explicación."]),
      el("div", { class: "legend catObjLegend" }, [
        el("span", { class: "legend-item good" }, [el("span", { class: "dot" }), " Verde ≥ 90%"]),
        el("span", { class: "legend-item warn" }, [el("span", { class: "dot" }), " Amarillo ≥ 70%"]),
        el("span", { class: "legend-item bad" }, [el("span", { class: "dot" }), " Rojo < 70%"])
      ])
    ]),
    el("div", { class: "card catObjPanel" }, [
      el("h3", {}, ["Vista rápida"]),
      el("p", { id: "catObjQuickText" }, [quickText]),
      el("div", { class: "small", id: "catObjQuickSub" }, [quickSub])
    ])
  ]);

  const grid = el("div", { class: "grid catObjGrid" });
  if (!items.length) {
    grid.appendChild(el("div", { class: "card", style: "grid-column:1/-1;" }, [
      el("h3", {}, ["Sin resultados"]),
      el("p", { class: "note" }, ["Prueba cambiar el texto de búsqueda o selecciona otra categoría/semáforo."])
    ]));
  } else {
    items.forEach(obj => {
      const s = objectiveStatusCatObj(obj);
      const score = objectiveScoreCatObj(obj);
      const topKpis = obj.kpis.slice(0, 3).map(k => {
        const a = clampCatObj(achievementCatObj(k), 0, 1.25);
        const ks = statusFromAchCatObj(a);
        const pct = clampCatObj(a, 0, 1);
        return { k, a, ks, pct };
      });
      const donutHtml = donutSvgCatObj(clampCatObj(score, 0, 1), s);
      const miniHtml = topKpis.map(({ k, a, ks }) => {
        const pct = clampCatObj(a, 0, 1.25);
        const w = (clampCatObj(pct, 0, 1) * 100).toFixed(0);
        return `<div class="kpi-mini catObjKpiMini"><div class="left"><div class="name">${escapeHtmlCat(k.nombre)}</div><div class="val">${escapeHtmlCat(fmtCatObj(k.actual, k.unidad))} <span class="muted">/ meta ${escapeHtmlCat(fmtCatObj(k.meta, k.unidad))}</span></div></div><div class="bar"><i class="${ks}" style="width:${w}%"></i></div></div>`;
      }).join("");
      const card = el("article", {
        class: "card catObjCard",
        role: "button",
        tabIndex: 0,
        "data-id": obj.id,
        onclick: () => openDrawerCatObjetivo(obj),
        onkeydown: function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawerCatObjetivo(obj); } }
      }, []);
      card.innerHTML = `
        <div class="card-head catObjCardHead">
          <div><div class="badge catObjBadge">${escapeHtmlCat(obj.categoria)}</div>
          <h3 class="obj-title">${escapeHtmlCat(obj.titulo)}</h3>
          <div class="quote">${escapeHtmlCat(obj.quote)}</div></div>
          <div class="catObjDonutWrap">${donutHtml}</div>
        </div>
        <div class="mini">${miniHtml}</div>
        <div class="footer-note catObjFooter">Semáforo: <span class="chip"><span class="dot ${s}"></span><strong>${s === "ok" ? "Verde" : s === "warn" ? "Amarillo" : "Rojo"}</strong></span> · Click para ver detalle</div>
      `;
      grid.appendChild(card);
    });
  }

  const root = el("div", { class: "catObjetivosWrap" }, [
    el("h2", { class: "catObjTitle" }, ["Catálogo de Objetivos del Negocio (Ferretería)"]),
    toolbar,
    summaryRow,
    grid
  ]);
  return root;
}

function openDrawerCatObjetivo(obj){
  const drawer = document.getElementById("drawer");
  const sub = document.getElementById("drawerSubtitle");
  if (sub) sub.innerHTML = `${escapeHtmlCat(obj.categoria)} · Semáforo ${objectiveStatusCatObj(obj) === "ok" ? "Verde" : objectiveStatusCatObj(obj) === "warn" ? "Amarillo" : "Rojo"}`;
  drawer.querySelector(".title").textContent = obj.titulo;
  const body = drawer.querySelector(".body");
  body.innerHTML = "";

  body.appendChild(el("div", { class: "dblock" }, [
    el("h4", {}, ["Objetivo (explicación)"]),
    el("div", { class: "note" }, [obj.explicacion])
  ]));
  body.appendChild(el("div", { class: "dblock" }, [
    el("h4", {}, ["Jerga de piso"]),
    el("div", { class: "note" }, [obj.quote])
  ]));
  body.appendChild(el("div", { class: "dblock" }, [
    el("h4", {}, ["Causas típicas"]),
    el("ul", {}, (obj.causas || []).map(c => el("li", {}, [c])))
  ]));
  const rows = obj.kpis.map(k => {
    const aRaw = clampCatObj(achievementCatObj(k), 0, 1.25);
    const a = clampCatObj(aRaw, 0, 1);
    const ks = statusFromAchCatObj(aRaw);
    const pct = Math.round(a * 100);
    const barW = (a * 100).toFixed(0);
    return el("tr", { class: "kpi-row catObjKpiRow" }, [
      el("td", { style: "width:60%;" }, [
        el("div", { class: "kpi-name" }, [k.nombre]),
        el("div", { class: "kpi-meta" }, [(k.direccion === "lower_better" ? "Mientras más bajo, mejor." : "Mientras más alto, mejor.") + " · " + obj.quote])
      ]),
      el("td", {}, [
        el("div", { class: "bar" }, [el("i", { class: ks, style: `width:${barW}%` })]),
        el("div", { class: "kpi-meta" }, ["Cumplimiento: ", el("strong", {}, [pct + "%"])])
      ]),
      el("td", { class: "kpi-right" }, [
        el("div", { class: "chip" }, [el("span", { class: "dot " + ks }), el("strong", {}, [fmtCatObj(k.actual, k.unidad)])]),
        el("div", { class: "kpi-meta", html: `Meta: <strong>${escapeHtmlCat(fmtCatObj(k.meta, k.unidad))}</strong>${sparkSvgCatObj(k.history, ks)}` })
      ])
    ]);
  });
  const tbody = el("tbody", {}, rows);
  const table = el("table", { class: "kpi-table" }, [tbody]);
  body.appendChild(el("div", { class: "dblock" }, [
    el("h4", {}, ["KPIs que mueven el objetivo"]),
    table,
    el("p", { class: "note muted" }, ["Semáforo calculado por cumplimiento vs meta (promedio simple)."])
  ]));
  drawer.classList.add("open");
}

function viewBscIniciativas(){
  const root = el("div",{},[
    el("div",{class:"tablewrap"},[
      el("div",{class:"tablehdr"},[
        el("h2",{html:"BSC4 · Iniciativas Estratégicas (Objetivos × Iniciativas)"}),
        el("div",{class:"right"},[
          el("span",{class:"select"},[
            el("span",{class:"small"},["Sucursal"]),
            buildStoreSelect()
          ]),
          el("span",{class:"select"},[
            el("span",{class:"small"},["Área"]),
            buildAreaSelect()
          ]),
          el("button",{class:"btn primary", onclick:()=>openDrawerInitiative(model.initiatives[0])},["+ Nueva iniciativa"])
        ])
      ]),
      el("div",{style:"padding:14px;"},[
        el("div",{class:"matrix"},[
          initiativesMatrix()
        ])
      ])
    ])
  ]);
  return root;
}

function initiativesList(){
  const wrap = el("div",{class:"initList"});
  const mi = months.indexOf(state.month);

  model.initiatives.forEach(init=>{
    const expected = expectedProgress(init.quarter, mi);
    const delta = init.progress - expected;
    const badge = deltaBadge(delta);

    const tasksTotal = init.tasksTotal || 60;
    const tasksDone = Math.round(tasksTotal * (init.progress/100));
    const overdue = init.overdue || 0;

    const fill = (badge.cls==="good") ? "var(--good)" : (badge.cls==="warn" ? "var(--warn)" : "var(--bad)");
    const expectedPct = Math.max(0, Math.min(100, expected));
    const actualPct = Math.max(0, Math.min(100, init.progress));

    const card = el("div",{class:"initCard", onclick:()=>openDrawerInitiative(init)},[
      el("div",{class:"n", html:`${init.id} · ${init.name}`}),
      el("div",{class:"m", html:`Dueño: ${init.owner} · Ventana: ${init.quarter}`}),
      el("div",{class:"pmeta"},[
        el("span",{class:`badge ${badge.cls}`},[badge.txt]),
        el("span",{class:"pmain", html:`Avance <b>${actualPct}%</b> (${tasksDone}/${tasksTotal}) · Esperado <b>${expectedPct}%</b> · Δ <b>${delta>=0?"+":""}${delta}</b> pts`}),
        ...(overdue>0 ? [el("span",{class:"badge bad"},[`Vencidas: ${overdue}`])] : [])
      ]),
      el("div",{class:"pbarDual"},[
        el("span",{class:"actual", style:`width:${actualPct}%; background:${fill}`}),
        el("span",{class:"expected", style:`left:${expectedPct}%`})
      ])
    ]);
    wrap.appendChild(card);
  });
  return wrap;
}

// --- Initiative ↔ Objective mapping (razonado) ---
function findKpiObjectiveName(kpiName){
  // Busca el KPI en el catálogo (objetivos o reales) y regresa el nombre del objetivo estratégico al que pertenece
  const pools = [model.objetivos, model.reales];
  for(const pool of pools){
    for(const arr of Object.values(pool||{})){
      const f = (arr||[]).find(x=>x.kpi===kpiName);
      if(f && f.obj) return f.obj;
    }
  }
  return "";
}
function objectiveKeyFromName(objName){
  const n = (objName||"").toLowerCase();
  if(n.includes("margen")) return "margenes";
  if(n.includes("liquidez") || n.includes("efectivo")) return "liquidez";
  if(n.includes("quiebre") || n.includes("fill rate") || n.includes("sobreinvent")) return "quiebres";
  return "";
}
function initiativeObjectiveKeys(init){
  const s = new Set();
  (init.related||[]).forEach(kpi=>{
    const objName = findKpiObjectiveName(kpi);
    const key = objectiveKeyFromName(objName);
    if(key) s.add(key);
  });
  // fallback (si algún KPI no está en catálogo, usa heurística por nombre)
  if(s.size===0){
    const nm = (init.name||"").toLowerCase();
    if(nm.includes("descuento") || nm.includes("precio") || nm.includes("margen")) s.add("margenes");
    if(nm.includes("factura") || nm.includes("caja") || nm.includes("ccc") || nm.includes("inventario")) s.add("liquidez");
    if(nm.includes("quiebre") || nm.includes("top 200") || nm.includes("fill")) s.add("quiebres");
  }
  return s;
}

function initiativesMatrix(){
  // Invertida: filas = iniciativas (tarjetas) | columnas = objetivos (3)
  const objCols = [
    {
      k:"margenes",
      t:"Mejorar márgenes",
      icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M6.5 14.5L10 11l3 2.5 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 7h3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      k:"liquidez",
      t:"Mejorar flujos de efectivo",
      icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 7h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M7 12h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M7 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M17 17l2 2 2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 19V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    {
      k:"quiebres",
      t:"Reducir quiebres de stock",
      icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 9l8-5 8 5v10l-8 5-8-5V9z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M12 4v20" stroke="currentColor" stroke-width="2" opacity=".15"/>
        <path d="M8.5 12.5l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M15.5 12.5l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    }
  ];
  const rows = model.initiatives;

  const thead = el("thead",{},[
    el("tr",{},[
      el("th",{},["Iniciativa"]),
      ...objCols.map(o=>el("th",{},[
        el("div",{class:"objHead"},[
          el("span",{class:`objIcon ${o.k}`, html:o.icon}),
          el("span",{class:"objLabel", html:o.t})
        ])
      ]))
    ])
  ]);

  const tbody = el("tbody");

  rows.forEach(init=>{
    const mi = months.indexOf(state.month);
    const expected = expectedProgress(init.quarter, mi);
    const delta = init.progress - expected;
    const badge = deltaBadge(delta);

    const tasksTotal = init.tasksTotal || 60;
    const tasksDone = Math.round(tasksTotal * (init.progress/100));
    const overdue = init.overdue || 0;

    const fill = (badge.cls==="good") ? "var(--good)" : (badge.cls==="warn" ? "var(--warn)" : "var(--bad)");
    const expectedPct = Math.max(0, Math.min(100, expected));
    const actualPct = Math.max(0, Math.min(100, init.progress));

    const card = el("div",{class:"initCard mini", onclick:()=>openDrawerInitiative(init)},[
      el("div",{class:"n", html:`${init.id} · ${init.name}`}),
      el("div",{class:"m", html:`Dueño: ${init.owner} · Ventana: ${init.quarter}`}),
      el("div",{class:"m", style:"margin-top:6px;", html:`KPIs: <b>${(init.related||[]).slice(0,3).join(", ") || "—"}</b>`}),
      el("div",{class:"pmeta"},[
        el("span",{class:`badge ${badge.cls}`},[badge.txt]),
        el("span",{class:"pmain", html:`Avance <b>${actualPct}%</b> (${tasksDone}/${tasksTotal}) · Esperado <b>${expectedPct}%</b> · Δ <b>${delta>=0?"+":""}${delta}</b> pts`}),
        ...(overdue>0 ? [el("span",{class:"badge bad"},[`Vencidas: ${overdue}`])] : [])
      ]),
      el("div",{class:"pbarDual"},[
        el("span",{class:"actual", style:`width:${actualPct}%; background:${fill}`}),
        el("span",{class:"expected", style:`left:${expectedPct}%`})
      ])
    ]);

    const tr = el("tr",{},[
      el("td",{class:"initCell"},[card])
    ]);

    objCols.forEach(o=>{
      // Mapping razonado: deriva objetivos impactados desde los KPIs relacionados
      const keys = initiativeObjectiveKeys(init);
      const on = keys.has(o.k);
      tr.appendChild(el("td",{class:"tickCell"},[
        el("div",{class:`tick ${on?"on":""}`},[on?"×":""])
      ]));
    });

    tbody.appendChild(tr);
  });

  return el("div",{class:"matrixTable"},[
    el("table",{class:"mtbl"},[thead,tbody])
  ]);
}

function buildMonthSelect(){
  const s = el("select",{onchange:(e)=>{state.month=e.target.value; render();}});
  months.forEach(m=>{
    const o = el("option",{value:m},[m]);
    if(m===state.month) o.selected = true;
    s.appendChild(o);
  });
  return s;
}
function buildStoreSelect(){
  const s = el("select",{onchange:(e)=>{state.store=e.target.value; render();}});
  stores.forEach(m=>{
    const o = el("option",{value:m},[m]);
    if(m===state.store) o.selected = true;
    s.appendChild(o);
  });
  return s;
}
function buildAreaSelect(){
  const s = el("select",{onchange:(e)=>{state.area=e.target.value; render();}});
  areas.forEach(m=>{
    const o = el("option",{value:m},[m]);
    if(m===state.area) o.selected = true;
    s.appendChild(o);
  });
  return s;
}

function openDrawerObjective(n, data){
  const mi = months.indexOf(state.month);
  const val = (k)=> getKpiValue(k, mi);

  const blocks = [
    {k:"Objetivo", v:n.t},
    {k:"Perspectiva", v:n.s},
    {k:"KPI principal", v:n.k},
    {k:"Mes", v:state.month},
    {k:"Valor", v:formatKpi(n.k, val(n.k))},
  ];

  const suggestions = {
    "Mejorar márgenes": [
      ["Acción inmediata","Bloquear descuentos fuera de política (alerta en caja)"],
      ["Acción táctica","Revisión de mix: top margen vs top rotación (por sucursal)"],
      ["Acción semanal","Comité de precios (20 min) con tablero de excepciones"]
    ],
    "Mejorar liquidez": [
      ["Acción inmediata","Foco en lento/obsoleto: liquidación controlada sin dañar margen"],
      ["Acción táctica","Ajustar política de compras por rotación y lead time"],
      ["Acción semanal","Seguimiento CCC: inventario + cartera + pagos a proveedores"]
    ],
    "Cero quiebres": [
      ["Acción inmediata","Lista Top 200 SKU críticos por sucursal + reposición automática"],
      ["Acción táctica","Calendario de conteo cíclico y exactitud por ubicación"],
      ["Acción semanal","War room de quiebres: causas (abasto, piso, bodega)"]
    ]
  };

  let key = "Cero quiebres";
  if(n.t.toLowerCase().includes("margen")) key="Mejorar márgenes";
  if(n.t.toLowerCase().includes("liquidez")) key="Mejorar liquidez";
  if(n.t.toLowerCase().includes("quiebre") || n.t.toLowerCase().includes("top 200")) key="Cero quiebres";

  const drawer = document.getElementById("drawer");
  const sub = document.getElementById("drawerSubtitle");
  if(sub) sub.textContent = "";
  drawer.querySelector(".title").textContent = `${n.t}`;
  const body = drawer.querySelector(".body");
  body.innerHTML = "";

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Resumen"}),
    el("div",{class:"list"}, blocks.map(b=> el("div",{class:"item"},[
      el("div",{class:"l", html:b.k}),
      el("div",{class:"r", html:b.v})
    ])))
  ]));

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Qué haría esta semana"}),
    el("div",{class:"list"}, suggestions[key].map(([a,b])=> el("div",{class:"item"},[
      el("div",{class:"l", html:a}),
      el("div",{class:"r", html:b})
    ])))
  ]));

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Conexión a capas ORKESTA"}),
    el("div",{class:"note", html:`
      <b>ERP Connect:</b> ventas, existencias, compras, descuentos, facturación, pagos.<br>
      <b>Ejecución:</b> tareas y checklists (piso/bodega/abasto) con SLA.<br>
      <b>Control:</b> auditoría de excepciones, evidencia y trazabilidad.
    `})
  ]));

  drawer.classList.add("open");
}

function openDrawerInitiative(init){
  const drawer = document.getElementById("drawer");
  const sub = document.getElementById("drawerSubtitle");
  if(sub) sub.innerHTML = init.desc || "";
  drawer.querySelector(".title").textContent = `${init.id} · ${init.name}`;
  const body = drawer.querySelector(".body");
  body.innerHTML = "";

  const mi = months.indexOf(state.month);
  const expected = expectedProgress(init.quarter, mi);
  const delta = init.progress - expected;
  const tasksTotal = init.tasksTotal || 60;
  const tasksDone = Math.round(tasksTotal * (init.progress/100));
  const overdue = init.overdue || 0;

  const projectId = "bsc-" + init.id.toLowerCase();
  const projectHref = GESTOR_TAREAS_BASE_URL + "/" + projectId;
  const vencidasHref = projectHref + "?focus=vencidas";

  const fichaRows = [
    ["Dueño","Abasto, Compras o Finanzas (según iniciativa)"],
    ["Responsable","Jefe de área + Líder de tienda"],
    ["Avance real", `${init.progress}%`],
    ["Esperado (al mes)", `${expected}% · ${state.month}`],
    ["Δ vs esperado", `${delta>=0?"+":""}${delta} pts`],
    ["Tareas", null],
    ["Vencidas", null],
    ["Ventana", init.quarter],
    ["KPIs impactados", init.related.join(" · ")]
  ];

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Ficha"}),
    el("div",{class:"list"}, fichaRows.map(([k,v])=> {
      if (k === "Tareas") {
        return el("a",{
          class:"item item-tareas tareas-link",
          href: projectHref,
          target:"_blank",
          rel:"noopener noreferrer",
          title:"Abrir proyecto en Gestor de Tareas"
        },[
          el("span",{class:"l", html:k}),
          el("span",{class:"r", html: `${tasksDone}/${tasksTotal}`})
        ]);
      }
      if (k === "Vencidas") {
        return el("a",{
          class:"item item-vencidas vencidas-link",
          href: vencidasHref,
          target:"_blank",
          rel:"noopener noreferrer",
          title:"Abrir proyecto en Gestor de Tareas (tareas vencidas)"
        },[
          el("span",{class:"l", html:k}),
          el("span",{class:"r vencidas-value", html: String(overdue || 0)})
        ]);
      }
      return el("div",{class:"item"},[
        el("div",{class:"l", html:k}),
        el("div",{class:"r", html:v})
      ]);
    }))
  ]));

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Plan de trabajo (ejemplo)"}),
    el("div",{class:"note", html:`
      <b>Semana 1:</b> diagnóstico por sucursal (Top 20 excepciones).<br>
      <b>Semana 2:</b> reglas y parámetros (mín/max, lead time, cobertura).<br>
      <b>Semana 3:</b> piloto en 2 tiendas + ajustes.<br>
      <b>Semana 4:</b> despliegue + tablero de seguimiento + auditoría.
    `})
  ]));

  body.appendChild(el("div",{class:"dblock"},[
    el("h4",{html:"Salida hacia Ejecución"}),
    el("div",{class:"note", html:`
      Esta iniciativa se convierte en <b>épicas</b> y <b>planes</b> dentro del motor de tareas:
      reposición diaria, conteo cíclico, validación de descuentos, recepción contra factura.
    `})
  ]));

  drawer.classList.add("open");
}

function closeDrawer(){
  document.getElementById("drawer").classList.remove("open");
}

function viewPlaceholder(title, subtitle){
  return el("div", {class:"card"}, [
    el("h3", {html: title}),
    el("div", {class:"note", html: subtitle || "Próximamente…"})
  ]);
}

function viewErpValidacion(){
  return el("div", {class:"card validacionWrap"}, [
    el("h2", {class:"validacionTitle", html: "ERP Connect · Validación"}),
    el("p", {class:"note validacionSub"}, ["Reglas de calidad: duplicados, faltantes, conciliaciones y bitácora de sincronización."]),
    el("div", {class:"validacionImageWrap"}, [
      el("img", {
        class: "validacionHeroImg",
        src: "assets/EstrategiaEjecucion.png",
        alt: "De la estrategia a la ejecución: ERP vs ORKesta + VerifyQA"
      })
    ])
  ]);
}

// --- ERP Connect: pantalla integrada + simulación de sincronización (30s) ---
const ERP_SYNC_MS = 30000;
let __lastView = null;
let __erpTimer = null;
let __erpInterval = null;
let __erpCursorInterval = null;

function stopErpSync(){
  if(__erpTimer){ window.clearTimeout(__erpTimer); __erpTimer = null; }
  if(__erpInterval){ window.clearInterval(__erpInterval); __erpInterval = null; }
  if(__erpCursorInterval){ window.clearInterval(__erpCursorInterval); __erpCursorInterval = null; }
}

function restartGif(imgEl){
  if(!imgEl) return;
  const base = (imgEl.dataset.src || imgEl.getAttribute("src") || "").split("?")[0];
  if(!base) return;
  // cache-busting para que el GIF arranque desde el frame 1 cada vez que entras
  imgEl.src = `${base}?t=${Date.now()}`;
}

function buildErpLogScript(){
  // Script determinístico (0s → 30s) para emular extracción real de un ERP:
  // catálogos → hechos/transacciones → validaciones → carga DW → refresh KPIs
  const lines = [];
  const add = (t, kind, html)=>lines.push({t, kind, html});

  const ts = (t)=>{
    const mm = String(Math.floor(t/60)).padStart(2,"0");
    const ss = String(Math.floor(t%60)).padStart(2,"0");
    return `${mm}:${ss}`;
  };

  const ok = (t, msg)=>add(t,"ok",`<span class="tTs">${ts(t)}</span> <span class="tOk">[OK]</span> ${msg}`);
  const info = (t, msg)=>add(t,"info",`<span class="tTs">${ts(t)}</span> <span class="tInfo">[INFO]</span> ${msg}`);
  const warn = (t, msg)=>add(t,"warn",`<span class="tTs">${ts(t)}</span> <span class="tWarn">[WARN]</span> ${msg}`);

  // --- handshake ---
  info(0.0,"Inicializando conector <b>ERP Connect</b> (modo demo) …");
  info(0.4,"Resolviendo endpoint ERP: <span class='tDim'>https://erp.local/api</span>");
  info(0.8,"Abriendo sesión segura (TLS) y verificando latencia …");
  ok(1.2,"Conexión establecida. Latencia promedio: <b>34 ms</b>.");
  info(1.6,"Autenticando credenciales y obteniendo token …");
  ok(2.1,"Token emitido. Alcance: lectura + extracción. Expira: 60 min.");
  info(2.6,"Cargando diccionario de tablas, llaves y relaciones …");
  ok(3.2,"Metadatos listos. 42 tablas detectadas · 11 catálogos · 9 hechos.");

  // --- catálogos (3.6s → 9.5s) ---
  const catalogs = [
    ["Sucursales","adm_sucursales",6],
    ["Áreas / Departamentos","adm_areas",18],
    ["Almacenes","inv_almacenes",9],
    ["Usuarios / Roles","seg_usuarios",24],
    ["Centros de costo","fin_centros_costo",36],
    ["Cuentas contables","fin_cuentas",1240],
    ["Clientes","crm_clientes",6840],
    ["Proveedores","cxc_proveedores",920],
    ["Productos / SKU","inv_productos",12840],
    ["Familias / Categorías","inv_familias",94],
    ["Marcas","inv_marcas",68]
  ];

  let t = 3.8;
  catalogs.forEach((c,i)=>{
    const [name, table, rows] = c;
    info(t,`Extrayendo catálogo: <b>${name}</b> <span class='tDim'>(tabla ${table})</span> …`);
    t += 0.35;
    ok(t,`Catálogo cargado: <b>${rows.toLocaleString()}</b> registros → <span class='tDim'>staging.dim_${table}</span>`);
    t += 0.25;
  });

  // --- transacciones / hechos (9.6s → 22.5s) ---
  info(9.6,"Iniciando extracción de transacciones (hechos) por rangos y chunks …");

  const facts = [
    ["Ventas (tickets/facturas)","fac_ventas",6, "fact_ventas"],
    ["Detalles de venta (líneas)","fac_ventas_det",8,"fact_ventas_det"],
    ["Compras (OC/recepciones)","cmp_compras",4,"fact_compras"],
    ["Movimientos de inventario (kardex)","inv_movimientos",7,"fact_kardex"],
    ["Existencias por almacén","inv_existencias",4,"snap_existencias"],
    ["Cuentas por cobrar (CxC)","fin_cxc",5,"fact_cxc"],
    ["Cuentas por pagar (CxP)","fin_cxp",5,"fact_cxp"],
    ["Bancos (movimientos)","ban_movimientos",4,"fact_bancos"],
    ["Pólizas contables","fin_polizas",6,"fact_polizas"]
  ];

  let t2 = 10.2;
  facts.forEach(([name, table, chunks, target])=>{
    info(t2,`Extrayendo: <b>${name}</b> <span class='tDim'>(tabla ${table})</span> …`);
    t2 += 0.25;
    for(let k=1;k<=chunks;k++){
      const pct = Math.round((k/chunks)*100);
      info(t2,`↳ chunk ${k}/${chunks} · ${pct}%  <span class='tDim'>(${table})</span>`);
      t2 += 0.28;
      if(k===Math.ceil(chunks/2)){
        info(t2,`Validación intermedia: llaves, tipos, nulos, duplicados …`);
        t2 += 0.22;
        ok(t2,`OK · integridad parcial confirmada.`);
        t2 += 0.18;
      }
    }
    ok(t2,`Carga a staging completa → <span class='tDim'>staging.${target}</span>`);
    t2 += 0.35;
  });

  // --- validaciones globales (22.6s → 26.8s) ---
  info(22.6,"Ejecutando validaciones globales y cruces entre catálogos ↔ hechos …");
  info(23.0,"• Integridad referencial: SKU ↔ movimientos ↔ ventas");
  info(23.4,"• Reconciliación: ventas ↔ bancos ↔ CxC");
  info(23.8,"• Reconciliación: compras ↔ CxP ↔ pólizas");
  ok(24.4,"Validación global: OK (sin errores críticos).");
  warn(24.9,"2 advertencias: registros huérfanos en inventario (se aíslan para revisión).");
  info(25.4,"Normalizando monedas, redondeos y reglas fiscales …");
  ok(26.0,"Normalización completada.");
  info(26.4,"Preparando cargas finales (DW) y agregados …");

  // --- carga DW + semántico (26.9s → 29.8s) ---
  const merges = [
    ["dim_sucursales","staging.dim_adm_sucursales"],
    ["dim_producto","staging.dim_inv_productos"],
    ["dim_cliente","staging.dim_crm_clientes"],
    ["fact_ventas","staging.fact_ventas"],
    ["fact_kardex","staging.fact_kardex"],
    ["fact_polizas","staging.fact_polizas"]
  ];
  let t3 = 26.9;
  merges.forEach(([dw, st])=>{
    info(t3,`MERGE <b>${dw}</b> ⇐ <span class='tDim'>${st}</span> …`);
    t3 += 0.28;
    ok(t3,`MERGE ${dw}: OK`);
    t3 += 0.22;
  });

  info(29.0,"Actualizando modelo semántico (fórmulas / KPIs / umbrales) …");
  ok(29.5,"Agregados y caché listos.");
  ok(30.0,"Sincronización completada. KPIs listos para recalcular en <b>Estrategia</b>.");

  return lines.sort((a,b)=>a.t-b.t);
}

function startErpSync(){
  stopErpSync();

  const note = document.getElementById("erpSyncNote");
  const btn  = document.getElementById("erpSyncGo");

  // UI targets (terminal overlay)
  const fill   = document.getElementById("erpBarFill");
  const pctEl  = document.getElementById("erpPct");
  const gbEl   = document.getElementById("erpGb");
  const timeEl = document.getElementById("erpTime");
  const stEl   = document.getElementById("erpStatus");
  const cursor = document.getElementById("erpCursor");
  const logsEl = document.getElementById("erpLogs");


  if(note) note.textContent = "Conectando al ERP: Extracción + Validación + Carga (ELT)…";
  if(btn) btn.style.display = "none";

  // logs
  if(logsEl){ logsEl.innerHTML = ""; logsEl.scrollTop = 0; }
  // Autoscroll robusto: mantener siempre visible el último registro.
  // (scrollTop puede fallar si se llama antes de que el browser recalcule el layout)
  let __scrollPending = false;
  const __scrollToBottom = ()=>{
    if(!logsEl) return;
    if(__scrollPending) return;
    __scrollPending = true;
    requestAnimationFrame(()=>{
      __scrollPending = false;
      try{
        // 1) scrollTop directo
        logsEl.scrollTop = logsEl.scrollHeight;
        // 2) scrollTo (algunos browsers lo respetan mejor)
        if(typeof logsEl.scrollTo === "function"){
          logsEl.scrollTo({ top: logsEl.scrollHeight, left: 0, behavior: "auto" });
        }
      }catch(_e){
        // fallback silencioso
        logsEl.scrollTop = logsEl.scrollHeight;
      }
    });
  };
  const __logScript = buildErpLogScript();
  let __logIdx = 0;
  const __appendLog = (kind, html)=>{
    if(!logsEl) return;
    const d = document.createElement("div");
    d.className = `termLine ${kind||""}`.trim();
    d.innerHTML = html;
    logsEl.appendChild(d);
    // autoscroll (sin barra visible)
    __scrollToBottom();
    // evita que el DOM crezca infinito
    if(logsEl.children.length > 240){
      for(let i=0;i<80;i++) logsEl.removeChild(logsEl.firstChild);
    }
  };
  // imprime las primeras líneas al instante
  while(__logIdx < __logScript.length && __logScript[__logIdx].t <= 0.2){
    const it = __logScript[__logIdx++];
    __appendLog(it.kind, it.html);
  }
  __scrollToBottom();


  const totalSec = Math.round(ERP_SYNC_MS / 1000);
  const totalGb  = 30.0;
  const startTs  = performance.now();

  const pad2 = (n)=>String(n).padStart(2,"0");
  const fmtTime = (sec)=>{
    const s = Math.max(0, Math.floor(sec));
    return `${pad2(Math.floor(s/60))}:${pad2(s%60)}`;
  };

  const tick = ()=>{
    const now = performance.now();
    const elapsedMs = Math.min(ERP_SYNC_MS, now - startTs);
    const p = Math.max(0, Math.min(1, elapsedMs / ERP_SYNC_MS));
    const pct = p * 100;

    if(fill) fill.style.width = `${pct.toFixed(1)}%`;
    if(pctEl) pctEl.textContent = `${pct.toFixed(1)}%`;
    if(gbEl) gbEl.textContent = `${(p*totalGb).toFixed(1)} GB / ${totalGb.toFixed(1)} GB`;
    if(timeEl) timeEl.textContent = `${fmtTime(elapsedMs/1000)} / ${fmtTime(totalSec)}`;
    if(stEl) stEl.textContent = (elapsedMs < ERP_SYNC_MS) ? "SINCRONIZANDO" : "COMPLETADO";

    // stream logs according to elapsed time
    const elapsedSec = elapsedMs/1000;
    while(__logIdx < __logScript.length && __logScript[__logIdx].t <= elapsedSec + 0.02){
      const it = __logScript[__logIdx++];
      __appendLog(it.kind, it.html);
    }

    if(elapsedMs >= ERP_SYNC_MS){
      stopErpSync();
      if(note) note.textContent = "Sincronización completada. Datos listos para recalcular KPIs en Estrategia.";
      if(btn) btn.style.display = "inline-flex";
    }
  };

  // start from 0 immediately
  tick();
  __erpInterval = window.setInterval(tick, 120);

  // blinking cursor
  if(cursor){
    let on = true;
    __erpCursorInterval = window.setInterval(()=>{
      cursor.style.opacity = on ? "1" : "0.15";
      on = !on;
    }, 520);
  }

  // safety timeout (in case tab throttling pauses intervals)
  __erpTimer = window.setTimeout(()=>{
    __erpTimer = null;
    tick();
  }, ERP_SYNC_MS + 100);
}

function viewErpConnect(){
  return el("div",{class:"card erpCard"},[
    el("div",{class:"erpHead"},[
      el("h3",{html:"ERP Connect · Conectores"}),
      el("div",{class:"note", html:"En producción: selección de ERP, credenciales, mapeo de tablas y pruebas de extracción."})
    ]),
    el("div",{class:"erpStage"},[
      el("div",{class:"erpFrame"},[
        el("div",{class:"erpTerm", "data-bg":"assets/erp-connect-extraction.gif"},[
          el("div",{class:"termTop"},[
            el("div",{class:"termDots"},[
              el("span",{class:"dot red"}),
              el("span",{class:"dot yellow"}),
              el("span",{class:"dot green"})
            ]),
            el("div",{class:"termTitle", html:"orkesta@erp-connect:~/estrategia — extracción en tiempo real"})
          ]),
          el("div",{class:"termBody"},[
            el("div",{class:"termMain"},[
              el("div",{class:"termBanner", html:">>> Conectando al ERP • Extracción + Validación + Carga (ELT) <<<"}),
              el("div",{class:"termLogsWrap"},[
                el("div",{class:"termLogs", id:"erpLogs"})
              ])
            ])
          ]),
          el("div",{class:"termFooter"},[
            el("div",{class:"termCmd"},[
              el("span",{class:"termDollar", html:"$"}),
              el("span",{class:"termCmdText", html:" orkesta ingest --source ERP --target estrategia"}),
              el("span",{class:"termCursor", id:"erpCursor", html:"█"})
            ]),
            el("div",{class:"termRow"},[
              el("div",{class:"termLabel", html:"Progreso total:"}),
              el("div",{class:"termPct", id:"erpPct", html:"0.0%"}),
              el("div",{class:"termBar"},[
                el("div",{class:"termBarFill", id:"erpBarFill", style:"width:0%"})
              ]),
              el("div",{class:"termGb", id:"erpGb", html:"0.0 GB / 30.0 GB"})
            ]),
            el("div",{class:"termRow2"},[
              el("div",{class:"termTimeWrap"},[
                el("span",{class:"termLabel", html:"Tiempo:"}),
                el("span",{class:"termTime", id:"erpTime", html:"00:00 / 00:30"})
              ]),
              el("div",{class:"termStatusWrap"},[
                el("span",{class:"termLabel", html:"Estado:"}),
                el("span",{class:"termStatus", id:"erpStatus", html:"SINCRONIZANDO"})
              ])
            ])
          ])
        ])
      ])
    ]),
    el("div",{class:"erpBelow"},[
      el("div",{class:"note small", id:"erpSyncNote", html:""}),
      el("div",{class:"erpActions"},[
        el("button",{class:"btn primary", id:"erpSyncGo", style:"display:none", onclick:()=>navigate({layer:"estrategia", view:"dashboard"})},["Ir a Estrategia"])
      ])
    ])
  ]);
}

function render(){
  // header text and view
  setActiveNav();

  const content = document.getElementById("content");
  content.innerHTML = "";
  const __enteringView = (state.view !== __lastView);
  const __leavingErp = (__lastView === "erp-connect" && state.view !== "erp-connect");
  if(__leavingErp) stopErpSync();
  // Solo Scorecard inicia con "Real"; Dashboard y demás con "Planeado"
  if(__enteringView){
    if(state.view==="bsc-scorecard") state.mode = "reales";
    else if(state.view==="dashboard" || state.view==="bsc-datos") state.mode = "objetivos";
  }

  // top tabs for BSC
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";
  const tabDefs = [
    {id:"dashboard", label:"Dashboard"},
    {id:"bsc-cat-objetivos", label:"Cat Objetivos"},
    {id:"bsc-datos", label:"KPIs / Datos"},
    {id:"bsc-mapa", label:"Strategy map"},
    {id:"bsc-scorecard", label:"Scorecard"},
    {id:"bsc-iniciativas", label:"Iniciativas"}
  ];
  tabDefs.forEach(t=>{
    const isActive = (state.view===t.id) || (state.view==="dashboard" && t.id==="dashboard");
    const node = el("div",{class:`tab ${isActive?"active":""}`, "data-tab":t.id, onclick:()=>navigate({view:t.id})},[t.label]);
    tabs.appendChild(node);
  });

  // render view
  if(state.view==="dashboard") content.appendChild(viewDashboard());
  if(state.view==="bsc-datos") content.appendChild(viewBscDatos());
  if(state.view==="bsc-mapa") content.appendChild(viewBscMapa());
  if(state.view==="bsc-scorecard") content.appendChild(viewBscScorecard());
  if(state.view==="bsc-iniciativas") content.appendChild(viewBscIniciativas());
  if(state.view==="bsc-cat-objetivos") content.appendChild(viewBscCatObjetivos());

  if(state.view==="exec-tareas") content.appendChild(viewPlaceholder("Ejecución · Motor de tareas","Esta es una vista demo. Aquí vivirán planes, tareas, responsables y evidencias de ejecución."));
  if(state.view==="exec-tablero") content.appendChild(viewPlaceholder("Ejecución · Tablero","Vista tipo Kanban/Backlog para priorizar iniciativas y tareas por semana."));

  if(state.view==="erp-connect") content.appendChild(viewErpConnect());
  if(state.view==="erp-validacion") content.appendChild(viewErpValidacion());

  if(state.view==="audit-control") content.appendChild(viewPlaceholder("Auditoría · Supervisión","En producción: revisión de hallazgos, aprobaciones, liberación/rechazo y trazabilidad."));
  if(state.view==="audit-evidencia") content.appendChild(viewPlaceholder("Auditoría · Evidencia","En producción: evidencias, fotografías, adjuntos, geolocalización y firmas."));

  // ERP Connect: al entrar, iniciar sincronización (30s)
  if(__enteringView && state.view==="erp-connect") startErpSync();
  __lastView = state.view;

  // update global selectors
  const monthSel = document.getElementById("monthSel");
  monthSel.innerHTML = "";
  monthSel.appendChild(buildMonthSelect());
  const storeSel = document.getElementById("storeSel");
  storeSel.innerHTML = "";
  storeSel.appendChild(buildStoreSelect());

  // pills active
  document.querySelectorAll(".pill").forEach(x=>{
    x.classList.toggle("active", x.dataset.mode===state.mode);
  });
}

function bindNav(){
  // Delegación para soportar submenús renderizados dinámicamente
  const sidebar = document.querySelector(".sidebar");
  if(sidebar){
    sidebar.addEventListener("click", (e)=>{
      const viewNode = e.target.closest("[data-view]");
      if(viewNode){
        navigate({view: viewNode.dataset.view});
        return;
      }
      const layerNode = e.target.closest("[data-layer]");
      if(layerNode){
        const layer = layerNode.dataset.layer;
        if (layer === "ejecucion" || layer === "control") return; // Enlaces externos
        const defView = layerNode.dataset.defaultView;
        // si solo re-hacemos click en el mismo layer, no forzamos cambio de vista
        const view = (layer === state.layer)
          ? state.view
          : (defView || (layer === "estrategia" ? "dashboard" : "dashboard"));
        navigate({layer, view});
      }
    });
  }

  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  document.getElementById("drawer").addEventListener("click",(e)=>{
    if(e.target.id==="drawer") closeDrawer();
  });
}

function bindBrandHome(){
  const btn = document.getElementById("brandHome");
  if (btn) btn.addEventListener("click", function(){ navigate({ layer: "erp", view: "erp-validacion" }); });
}

function bindWhatsAppModal(){
  const btn = document.getElementById("whatsappBtn");
  const overlay = document.getElementById("whatsappOverlay");
  const closeBtn = document.getElementById("whatsappModalClose");
  if (!btn || !overlay) return;
  function openWhatsApp(){
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("open");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }
  function closeWhatsApp(){
    overlay.setAttribute("aria-hidden", "true");
    overlay.classList.remove("open");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }
  btn.addEventListener("click", openWhatsApp);
  if (closeBtn) closeBtn.addEventListener("click", closeWhatsApp);
  overlay.addEventListener("click", function(e){
    if (e.target === overlay) closeWhatsApp();
  });
}

window.addEventListener("DOMContentLoaded", ()=>{
  bindNav();
  bindBrandHome();
  bindWhatsAppModal();
  navigate({layer: state.layer, view: state.view}, true);
});
