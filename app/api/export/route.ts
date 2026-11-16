import ExcelJS from "exceljs";
import { filasExport, aportesExport, listarRits } from "@/lib/rit-repo";
import { filtrosDe } from "@/lib/filtros";
import { RF_BY_CODE } from "@/lib/rf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NARANJO = "FFE4450D", GRAFITO = "FF333333";
const sn = (v: unknown) => (v === true ? "SÍ" : v === false ? "NO" : "");
const f10 = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v ? String(v).slice(0, 10) : "");

function hoja(wb: ExcelJS.Workbook, nombre: string, cols: { header: string; key: string; width: number }[], rows: Record<string, unknown>[], color = GRAFITO) {
  const ws = wb.addWorksheet(nombre, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = cols;
  ws.addRows(rows);
  const h = ws.getRow(1);
  h.font = { bold: true, color: { argb: "FFFFFFFF" } };
  h.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
  h.alignment = { vertical: "middle", wrapText: true };
  h.height = 30;
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  return ws;
}

export async function GET(req: Request) {
  const f = filtrosDe(new URL(req.url).searchParams);
  const [det, { aportes, recon }, res] = await Promise.all([filasExport(f), aportesExport(f), listarRits(f, 100000)]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "RIT DRT · GSSO";
  wb.created = new Date();

  hoja(wb, "RIT", [
    { header: "ID RIT", key: "id", width: 8 }, { header: "Fecha", key: "fecha", width: 12 }, { header: "Turno", key: "turno", width: 7 }, { header: "Gerencia", key: "gerencia", width: 16 },
    { header: "Área / Frente", key: "area", width: 26 }, { header: "Supervisor", key: "supervisor", width: 24 }, { header: "N.º asistentes", key: "nAsistentes", width: 11 },
    { header: "EE.CC.", key: "eecc", width: 26 }, { header: "N.º contrato", key: "nContrato", width: 14 }, { header: "RF del turno", key: "rfs", width: 34 },
    { header: "Actividades", key: "actividades", width: 11 }, { header: "Act. no preparadas", key: "noPreparadas", width: 13 },
  ], res.map((r) => ({ ...r, rfs: r.rfs.join(", ") })), NARANJO);

  hoja(wb, "Actividades y análisis", [
    { header: "ID RIT", key: "rit_id", width: 8 }, { header: "Fecha", key: "fecha", width: 12 }, { header: "Gerencia", key: "gerencia", width: 14 },
    { header: "Superintendencia", key: "superintendencia", width: 18 }, { header: "Área / Frente", key: "area", width: 24 }, { header: "Supervisor", key: "supervisor", width: 22 },
    { header: "EE.CC.", key: "eecc", width: 24 }, { header: "N.º contrato", key: "n_contrato", width: 13 }, { header: "Turno", key: "turno_rit", width: 7 },
    { header: "Act. N.º", key: "act_n", width: 8 }, { header: "Actividad", key: "descripcion", width: 40 },
    { header: "Instructivos / PTS", key: "instructivos", width: 11 }, { header: "Materiales", key: "materiales", width: 11 }, { header: "Herramientas", key: "herramientas", width: 12 }, { header: "EPP", key: "epp", width: 8 },
    { header: "RF", key: "rf", width: 8 }, { header: "Nombre RF", key: "rf_nombre", width: 28 }, { header: "Riesgo / evento top", key: "riesgo", width: 40 },
    { header: "Consecuencia", key: "consecuencia", width: 30 }, { header: "Controles verificados", key: "controles", width: 40 },
  ], det.map((r) => ({
    ...r, fecha: f10(r.fecha), instructivos: sn(r.instructivos), materiales: sn(r.materiales), herramientas: sn(r.herramientas), epp: sn(r.epp),
    rf_nombre: r.rf ? RF_BY_CODE[String(r.rf)]?.name ?? "" : "",
  })));

  hoja(wb, "Aportes", [
    { header: "ID RIT", key: "rit_id", width: 8 }, { header: "Fecha RIT", key: "fecha", width: 12 }, { header: "Gerencia", key: "gerencia", width: 14 }, { header: "EE.CC.", key: "eecc", width: 24 },
    { header: "Supervisor", key: "supervisor", width: 22 }, { header: "Propuesta", key: "propuesta", width: 60 }, { header: "Responsable", key: "responsable", width: 22 }, { header: "Fecha compromiso", key: "fecha_compromiso", width: 14 },
  ], aportes.map((r) => ({ ...r, fecha: f10(r.fecha), fecha_compromiso: f10(r.fecha_compromiso) })));

  hoja(wb, "Reconocimientos", [
    { header: "ID RIT", key: "rit_id", width: 8 }, { header: "Fecha RIT", key: "fecha", width: 12 }, { header: "Gerencia", key: "gerencia", width: 14 }, { header: "EE.CC.", key: "eecc", width: 24 },
    { header: "Supervisor", key: "supervisor", width: 22 }, { header: "Quién", key: "quien", width: 26 }, { header: "Motivo", key: "motivo", width: 60 },
  ], recon.map((r) => ({ ...r, fecha: f10(r.fecha) })));

  const buf = await wb.xlsx.writeBuffer();
  const nombre = `RIT_DRT_${f.desde ?? "inicio"}_${f.hasta ?? "hoy"}.xlsx`;
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nombre}"`,
    },
  });
}
