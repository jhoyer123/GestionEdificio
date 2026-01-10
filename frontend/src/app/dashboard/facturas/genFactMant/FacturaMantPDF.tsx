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
    alignItems: "flex-start",
    borderBottom: "2 solid #059669",
    marginBottom: 25,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  companyInfoContainer: {
    textAlign: "right",
  },
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 3,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#059669",
    color: "white",
    paddingVertical: 7,
    fontFamily: "Helvetica-Bold",
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #E5E7EB",
    paddingVertical: 8,
    alignItems: "center",
  },

  colConcepto: { width: "30%", paddingLeft: 5 },
  colDescripcion: { width: "55%", paddingLeft: 5 },
  colMonto: { width: "15%", textAlign: "right", paddingRight: 5 },

  totalContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    width: "40%",
    padding: 10,
    backgroundColor: "#E0F7FA",
    border: "1 solid #059669",
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Bold",
  },
  totalText: {
    fontSize: 14,
    color: "#059669",
  },

  //PIE DE PÁGINA
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

interface FacturaMantPDFProps {
  factura: facturas | null;
}

export const FacturaMantPDF = ({ factura }: FacturaMantPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* --- ENCABEZADO Y LOGO (Habitat360) --- */}
      <View style={styles.headerContainer} fixed>
        <View>
          <Text style={styles.logo}>HABITAT360</Text>
          <Text style={styles.companyInfo}>Administración de Propiedades</Text>
        </View>
        <View style={styles.companyInfoContainer}>
          <Text style={styles.companyName}>Edificio Las Palmeras</Text>
          <Text style={styles.companyInfo}>Av. Bolívar #123 - La Paz</Text>
          <Text style={styles.companyInfo}>Tel: (591) 700-00000</Text>
          <Text style={styles.companyInfo}>edificio@palmeras.com</Text>
        </View>
      </View>

      {/* --- Datos de factura --- */}
      <View style={styles.section}>
        <Text style={styles.title}>RESUMEN DE FACTURA</Text>
        <View style={styles.infoRow}>
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
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>
              Fecha de Vencimiento:
            </Text>{" "}
            {factura?.fechaVencimiento}
          </Text>
        </View>
      </View>

      {/* --- Datos del cliente --- */}
      <View style={styles.section}>
        <Text style={styles.title}>INFORMACIÓN DEL CLIENTE</Text>
        <Text style={styles.infoText}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Propietario:</Text>{" "}
          {factura?.nombreUsuario}
        </Text>
        <Text style={styles.infoText}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Email:</Text>{" "}
          {factura?.emailUsuario}
        </Text>
        <Text style={styles.infoText}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Teléfono:</Text>{" "}
          {factura?.telefonoUsuario}
        </Text>
      </View>

      {/* --- Tabla de conceptos --- */}
      <View>
        <Text style={styles.title}>DETALLE DE CONCEPTOS</Text>

        {/* Cabecera de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={styles.colConcepto}>CONCEPTO</Text>
          <Text style={styles.colDescripcion}>DESCRIPCIÓN</Text>
          <Text style={styles.colMonto}>MONTO (Bs)</Text>
        </View>

        {/* Filas de la tabla */}
        {factura?.conceptos.map((c) => (
          <View key={c.idConcepto} style={styles.tableRow}>
            <Text style={styles.colConcepto}>{c.titulo}</Text>
            <Text style={styles.colDescripcion}>{c.descripcion}</Text>
            <Text style={styles.colMonto}>{Number(c.monto).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* --- Totales --- */}
      <View style={styles.totalContainer}>
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>TOTAL A PAGAR: </Text>
            <Text style={styles.totalText}>
              {Number(factura?.montoTotal).toFixed(2)} Bs
            </Text>
          </View>
        </View>
      </View>

      {/* --- Pie de página --- */}
      <Text style={styles.footer} fixed>
        Gracias por ser parte de la comunidad Habitat360. Por favor, asegúrese
        de realizar el pago antes de la fecha de vencimiento.
      </Text>
    </Page>
  </Document>
);

interface DescargarFacturaProps {
  factura: facturas | null;
}

export const DescargarFactura = ({ factura }: DescargarFacturaProps) => (
  <PDFDownloadLink
    document={<FacturaMantPDF factura={factura} />}
    fileName={`Factura-${factura?.nroFactura}.pdf`}
  >
    {({ loading }) =>
      loading ? "Generando factura..." : "Descargar Factura PDF"
    }
  </PDFDownloadLink>
);
