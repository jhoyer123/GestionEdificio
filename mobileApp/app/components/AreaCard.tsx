// components/AreaCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { type AreaComun } from "../services/areasService";
import { Clock, Tag } from "lucide-react-native"; // Iconos para los detalles

interface Props {
  area: AreaComun;
  onReservar: (area: AreaComun) => void;
}

// URL base para servir imágenes. Preferible usar EXPO_PUBLIC_API_URL en .env
// Si no está definida usamos un fallback local (ajusta a tu IP si hace falta).
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.3:3000";

// Calcula el ancho de la tarjeta para mostrarse a pantalla completa (una tarjeta por fila)
const { width } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_PADDING = 12;
const CARD_WIDTH = width - CARD_MARGIN * 2;

export function AreaCard({ area, onReservar }: Props) {
  // area.imageUrl puede venir en varias formas desde el backend:
  // - string: 'abcd.jpg', 'uploads/abcd.jpg' o 'http://.../abcd.jpg'
  // - array: ['file1.jpg', 'file2.jpg']
  // - object: { url, path, filename }
  const rawImage = (area as any).imageUrl;

  function resolvePath(p: any): string {
    if (p === null || p === undefined) return "";
    const s = String(p);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/")) return `${API_URL}${s}`;
    if (s.startsWith("uploads/")) return `${API_URL}/${s}`;
    return `${API_URL}/uploads/${s}`;
  }

  function resolveObjectPath(obj: any): string {
    if (!obj) return "";
    const candidates = [obj.url, obj.path, obj.filename, obj.fileName, obj.src];
    for (const c of candidates) {
      if (c && typeof c === "string") return resolvePath(c);
    }
    return "";
  }

  let imageUrl = "";
  if (!rawImage) {
    imageUrl = "";
  } else if (Array.isArray(rawImage) && rawImage.length > 0) {
    const v = rawImage[0];
    imageUrl = typeof v === "string" ? resolvePath(v) : resolveObjectPath(v);
  } else if (typeof rawImage === "string") {
    imageUrl = resolvePath(rawImage);
  } else if (typeof rawImage === "object") {
    imageUrl = resolveObjectPath(rawImage);
  }
  const costoTexto =
    area.tipoArea === "gimnasio"
      ? `Costo: ${area.costoBase} Bs/día`
      : `Costo: ${area.costoBase} Bs/hora`;
  const horarioTexto =
    area.tipoArea === "parqueo"
      ? "Abierto 24/7"
      : `Horario: ${area.horarioApertura.slice(
          0,
          5
        )} - ${area.horarioCierre.slice(0, 5)}`;

  return (
    <View style={styles.card}>
      {/* Imagen */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}

      {/* Header (Título y Descripción) */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{area.nombreAreaComun}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {area.descripcion}
        </Text>
      </View>

      {/* Content (Info) */}
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Tag size={14} color="#6b7280" />
          <Text style={styles.infoText}>{costoTexto}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.infoText}>{horarioTexto}</Text>
        </View>
      </View>

      {/* Footer (Botón) */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onReservar(area)}
        >
          <Text style={styles.buttonText}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden", // Para que la imagen respete el borde
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    
    // flex-col (implícito)
  },
  cardImage: {
    height: 140, // h-40
    width: "100%",
    backgroundColor: "#e5e7eb", // bg-gray-200
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#6b7280",
    fontSize: 14,
  },
  cardHeader: {
    padding: CARD_PADDING,
  },
  cardTitle: {
    fontSize: 16, // text-lg
    fontWeight: "600", // font-semibold
    color: "#111827",
  },
  cardDescription: {
    fontSize: 12, // text-sm
    color: "#6b7280", // text-muted-foreground
    marginTop: 4,
  },
  cardContent: {
    paddingHorizontal: CARD_PADDING,
    paddingBottom: CARD_PADDING,
    gap: 6, // gap-1
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500", // font-medium
  },
  cardFooter: {
    padding: CARD_PADDING,
    marginTop: "auto", // mt-auto (empuja el footer hacia abajo)
  },
  button: {
    backgroundColor: "#1F2937", // Color del botón de UI (oscuro)
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
