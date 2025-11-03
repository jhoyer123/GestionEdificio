import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { crearPago, confirmarPagoApi } from "../services/pagosService";
import { getFacturasByUsuario } from "../services/facturaService";

interface PagoQRProps {
  usuarioId: number | null;
  reservaId: number;
  facturaId: number | null;
  monto: number;
  onClose?: () => void;
  onPagoConfirmado?: () => void;
}

export default function PagoQRMobile({
  usuarioId,
  reservaId,
  facturaId,
  monto,
  onClose,
  onPagoConfirmado,
}: PagoQRProps) {
  React.useEffect(() => {
    console.log("[PagoQRMobile] mounted", { usuarioId, reservaId, facturaId, monto });
  }, []);
  const [qr, setQr] = useState<string | null>(null);
  const [idPago, setIdPago] = useState<number | null>(null);
  const [estado, setEstado] = useState<string>("pendiente");

  const registrarPago = async () => {
    if (!usuarioId || !facturaId) {
      Alert.alert("Error", "Faltan datos para generar el pago.");
      return;
    }
    try {
      console.log("[PagoQRMobile] registrarPago called", { usuarioId, reservaId, facturaId, monto });
      const res = await crearPago({
        usuarioId,
        reservaId,
        facturaId,
        monto,
      });
      setQr(res.qr || null);
      setIdPago(res.idPago || null);
      setEstado(res.estado || "pendiente");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo generar el pago.");
    }
  };

  const confirmarPago = async () => {
    if (!idPago) return;
    try {
      await confirmarPagoApi(idPago);
      setEstado("confirmado");
      Alert.alert("Pago confirmado", "El pago fue confirmado correctamente.");
      // actualizar facturas en pantalla si es necesario
      try {
        if (usuarioId) {
          await getFacturasByUsuario(usuarioId);
        }
      } catch (e) {
        // no bloquear por esto
        console.warn(e);
      }
      onPagoConfirmado?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo confirmar el pago.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simulador de Pago</Text>
      <Text style={styles.subtitle}>Monto: Bs. {monto}</Text>

      {!qr && (
        <TouchableOpacity style={styles.button} onPress={registrarPago}>
          <Text style={styles.buttonText}>Generar QR de pago</Text>
        </TouchableOpacity>
      )}

      {qr && (
        <View style={styles.qrBox}>
          <Image source={{ uri: qr }} style={styles.qrImage} />
          <Text style={{ marginTop: 8 }}>Estado: {estado}</Text>
          {estado === "pendiente" && (
            <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={confirmarPago}>
              <Text style={styles.buttonText}>Confirmar el pago</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={[styles.button, styles.close]} onPress={onClose}>
        <Text style={styles.buttonText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 12 },
  button: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  close: { marginTop: 12, backgroundColor: "#6B7280" },
  buttonText: { color: "#fff", fontWeight: "700" },
  qrBox: { alignItems: "center" },
  qrImage: { width: 200, height: 200, backgroundColor: "#fff" },
});
