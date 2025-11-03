import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { getFacturaById } from "../services/facturaService";
import PagoQRMobile from "../components/PagoQRMobile";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InvoiceDetailScreen({ route, navigation }: any) {
  const { facturaId } = route.params ?? {};
  const [factura, setFactura] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPago, setShowPago] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await AsyncStorage.getItem("user");
        if (u) {
          const parsed = JSON.parse(u);
          setUserId(parsed.id ?? null);
        }
      } catch (e) {
        console.warn(e);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (!facturaId) return;
      setLoading(true);
      try {
        const res = await getFacturaById(facturaId);
        setFactura(res);
      } catch (e) {
        console.error("Error fetching factura", e);
        Alert.alert("Error", "No se pudo obtener la factura");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [facturaId]);

  const generateHtml = (f: any) => {
    // Simple HTML representation of the factura. Keep minimal and printable.
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 16px; color: #111827 }
            h1 { font-size: 20px; }
            .row { display:flex; justify-content:space-between; margin-bottom:8px }
            .muted { color: #6b7280 }
            .box { border:1px solid #e5e7eb; padding:12px; border-radius:8px; margin-top:12px }
          </style>
        </head>
        <body>
          <h1>Factura ${f.nroFactura}</h1>
          <div class="muted">Emitida: ${f.fechaEmision}</div>
          <div class="muted">Vencimiento: ${f.fechaVencimiento ?? '—'}</div>

          <div class="box">
            <div class="row"><div>Usuario</div><div>${f.nombreUsuario ?? '—'}</div></div>
            <div class="row"><div>Email</div><div>${f.emailUsuario ?? '—'}</div></div>
            <div class="row"><div>Telefono</div><div>${f.telefonoUsuario ?? '—'}</div></div>
          </div>

          <div style="margin-top:12px;">
            <div style="font-weight:700; font-size:18px;">Monto: Bs. ${f.montoTotal}</div>
            <div class="muted">Estado: ${f.estado}</div>
          </div>

          <div style="margin-top:18px; font-size:12px; color:#6b7280">Factura generada desde la app móvil.</div>
        </body>
      </html>
    `;
  };

  const handleDownloadPdf = async () => {
    if (!factura) return;
    try {
      const html = generateHtml(factura);
      const { uri } = await Print.printToFileAsync({ html });
      // Optionally share
      await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    } catch (e) {
      console.error("PDF generation error", e);
      Alert.alert("Error", "No se pudo generar el PDF");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <TopBar title="Factura" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (!factura) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <TopBar title="Factura" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>No se encontró la factura.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <TopBar title={`Factura ${factura.nroFactura}`} />
      <View style={styles.container}>
        <View style={styles.row}><Text style={styles.label}>Emitida:</Text><Text>{factura.fechaEmision}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Vencimiento:</Text><Text>{factura.fechaVencimiento ?? '—'}</Text></View>
        <View style={[styles.box]}>
          <Text style={{ fontWeight: '700', marginBottom: 6 }}>{factura.nombreUsuario ?? '—'}</Text>
          <Text style={styles.muted}>{factura.emailUsuario ?? '—'}</Text>
          <Text style={styles.muted}>{factura.telefonoUsuario ?? '—'}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Bs. {factura.montoTotal}</Text>
          <Text style={styles.muted}>Estado: {factura.estado}</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity style={styles.btn} onPress={handleDownloadPdf}>
            <Text style={styles.btnText}>Descargar / Compartir PDF</Text>
          </TouchableOpacity>

          {factura.estado !== 'pagada' && (
            <TouchableOpacity style={[styles.btn, { marginTop: 10, backgroundColor: '#111827' }]} onPress={() => setShowPago(true)}>
              <Text style={[styles.btnText, { color: '#fff' }]}>Pagar factura</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal visible={showPago} animationType="slide">
          <SafeAreaView style={{ flex: 1 }}>
            <TopBar title="Pago" />
            <View style={{ flex: 1 }}>
              <PagoQRMobile
                usuarioId={userId}
                facturaId={factura.idFactura}
                monto={factura.montoTotal}
                reservaId={factura.reservaId ?? null}
                onClose={() => setShowPago(false)}
                onPagoConfirmado={() => {
                  setShowPago(false);
                  // reload factura
                  getFacturaById(facturaId).then((f) => setFactura(f)).catch(() => {});
                }}
              />
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#fff', flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: '#6b7280' },
  box: { borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginTop: 12 },
  muted: { color: '#6b7280' },
  btn: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#111827', fontWeight: '700' },
});
