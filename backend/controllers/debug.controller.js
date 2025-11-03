//eliminar este archivo por completo despues de pruebas
import Reserva from "../models/Reserva.js";
import Factura from "../models/Factura.js";
import Pagos from "../models/Pagos.js";

// Endpoint de depuración para comprobar si una reserva/factura/pago existe
export const checkByReservaId = async (req, res) => {
  try {
    const { reservaId } = req.params;

    if (!reservaId) {
      return res.status(400).json({ message: "Falta reservaId en params" });
    }

    const reserva = await Reserva.findByPk(reservaId);
    const factura = await Factura.findOne({ where: { reservaId } });
    const pago = await Pagos.findOne({ where: { reservaId } });

    return res.status(200).json({
      checkedAt: new Date().toISOString(),
      reserva: reserva ? reserva.toJSON() : null,
      factura: factura ? factura.toJSON() : null,
      pago: pago ? pago.toJSON() : null,
    });
  } catch (error) {
    console.error("debug.checkByReservaId error:", error);
    return res.status(500).json({ message: "Error interno en debug check", error: error.message });
  }
};

export const checkByFacturaId = async (req, res) => {
  try {
    const { facturaId } = req.params;
    if (!facturaId) return res.status(400).json({ message: "Falta facturaId" });
    const factura = await Factura.findByPk(facturaId);
    const pago = await Pagos.findOne({ where: { facturaId } });
    return res.status(200).json({ factura: factura ? factura.toJSON() : null, pago: pago ? pago.toJSON() : null });
  } catch (error) {
    console.error("debug.checkByFacturaId error:", error);
    return res.status(500).json({ message: "Error interno en debug check factura", error: error.message });
  }
};

export const getEnvInfo = async (req, res) => {
  try {
    // Devuelve solo datos no sensibles para ayudar a depurar entornos
    return res.status(200).json({
      NODE_ENV: process.env.NODE_ENV || null,
      API_PORT: process.env.PORT || null,
      DB_HOST: process.env.DB_HOST || null,
      DB_NAME: process.env.DB_NAME || null,
    });
  } catch (error) {
    console.error("debug.getEnvInfo error:", error);
    return res.status(500).json({ message: "Error interno al obtener env info" });
  }
};
