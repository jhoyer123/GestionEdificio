"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { type facturas } from "../gestiondeFacturasAdmin/ColumnsFacturas";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#374151",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "2 solid #2563EB",
    marginBottom: 25,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
  },
  companyInfoContainer: { textAlign: "right" },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1F2937",
  },
  companyInfo: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
  },
  title: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 8,
    borderBottom: "1 solid #E5E7EB",
    paddingBottom: 4,
  },
  infoText: { fontSize: 10, marginBottom: 3 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    color: "white",
    paddingVertical: 7,
    fontFamily: "Helvetica-Bold",
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #E5E7EB",
    paddingVertical: 8,
  },
  colConcepto: { width: "40%", paddingLeft: 5 },
  colDescripcion: { width: "45%", paddingLeft: 5 },
  colMonto: { width: "15%", textAlign: "right", paddingRight: 5 },
  totalContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    width: "40%",
    padding: 10,
    backgroundColor: "#EFF6FF",
    border: "1 solid #2563EB",
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Bold",
  },
  totalText: { fontSize: 14, color: "#2563EB" },
  footer: {
    position: "absolute",
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 9,
    color: "#6B7280",
  },
});

interface ReservaFactura {
  factura: facturas | null;
  reservaData: any;
}

// 📄 PDF de factura de reserva
export const FacturaReservaPDF = ({ factura, reservaData }: ReservaFactura) => {
  if (!reservaData) return null;

  // --- Lógica para formatear el detalle según tipo de área ---
  const tipo = reservaData.areaComun.tipoArea?.toLowerCase();
  const nombreArea = reservaData.areaComun.nombreAreaComun;

  let detalle = "";

  if (tipo === "gimnasio") {
    // Solo por horas
    detalle = `${nombreArea} — ${reservaData.fechaReserva} (${reservaData.horaInicio} - ${reservaData.horaFin})`;
  } else if (reservaData.fechaFinReserva) {
    // Por días (reserva prolongada)
    detalle = `${nombreArea} — del ${reservaData.fechaReserva} al ${reservaData.fechaFinReserva}`;
  } else {
    // Por horas
    detalle = `${nombreArea} — ${reservaData.fechaReserva} (${reservaData.horaInicio} - ${reservaData.horaFin})`;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- Encabezado --- */}
        <View style={styles.headerContainer} fixed>
          <View>
            <Text style={styles.logo}>HABITAT360</Text>
            <Text style={styles.companyInfo}>
              Administración de Propiedades
            </Text>
          </View>
          <View style={styles.companyInfoContainer}>
            <Text style={styles.companyName}>Edificio Las Palmeras</Text>
            <Text style={styles.companyInfo}>Av. Bolívar #123 - La Paz</Text>
            <Text style={styles.companyInfo}>Tel: (591) 700-00000</Text>
            <Text style={styles.companyInfo}>edificio@palmeras.com</Text>
          </View>
        </View>

        {/* --- Resumen --- */}
        <View style={styles.section}>
          <Text style={styles.title}>FACTURA DE RESERVA</Text>
          <Text style={styles.infoText}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>N° de Factura:</Text>{" "}
            {factura?.nroFactura}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>
              Fecha de Emisión:
            </Text>{" "}
            {factura?.fechaEmision}
          </Text>
        </View>

        {/* --- Datos del residente --- */}
        <View style={styles.section}>
          <Text style={styles.title}>DATOS DEL RESIDENTE</Text>
          <Text style={styles.infoText}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Nombre:</Text>{" "}
            {factura?.nombreUsuario}
          </Text>
          {factura?.emailUsuario && (
            <Text style={styles.infoText}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Email:</Text>{" "}
              {factura.emailUsuario}
            </Text>
          )}
          {factura?.telefonoUsuario && (
            <Text style={styles.infoText}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Teléfono:</Text>{" "}
              {factura.telefonoUsuario}
            </Text>
          )}
        </View>

        {/* --- Detalle de la reserva --- */}
        <View>
          <Text style={styles.title}>DETALLE DE LA RESERVA</Text>

          <View style={styles.tableHeader}>
            <Text style={styles.colConcepto}>CONCEPTO</Text>
            <Text style={styles.colDescripcion}>DETALLE</Text>
            <Text style={styles.colMonto}>MONTO (Bs)</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colConcepto}>Reserva</Text>
            <Text style={styles.colDescripcion}>{detalle}</Text>
            <Text style={styles.colMonto}>
              {Number(
                factura?.montoTotal || reservaData?.costoTotal || 0
              )}
            </Text>
          </View>
        </View>

        {/* --- Total --- */}
        <View style={styles.totalContainer}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>TOTAL PAGADO:</Text>
              <Text style={styles.totalText}>
                {Number(
                  factura?.montoTotal || reservaData?.costoTotal || 0
                )}{" "}
                Bs
              </Text>
            </View>
          </View>
        </View>

        {/* --- Pie --- */}
        <Text style={styles.footer} fixed>
          Comprobante generado automáticamente por Habitat360 — Reserva
          confirmada.
        </Text>
      </Page>
    </Document>
  );
};

// 💾 Botón de descarga
export const DescargarFacturaReserva = ({
  factura,
  reservaData,
}: ReservaFactura) => (
  <PDFDownloadLink
    document={<FacturaReservaPDF factura={factura} reservaData={reservaData} />}
    fileName={`Factura-Reserva-${factura?.nroFactura}.pdf`}
  >
    {({ loading }) =>
      loading ? "Generando factura..." : "Descargar Factura de Reserva"
    }
  </PDFDownloadLink>
);
