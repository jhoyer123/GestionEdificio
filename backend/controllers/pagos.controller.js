import Pagos from "../models/Pagos.js";
import Usuario from "../models/Usuario.js";
import Factura from "../models/Factura.js";
import Reserva from "../models/Reserva.js"; 
import qrcode from "qrcode";

// Registrar un pago ficticio
export const registrarPago = async (req, res) => {
  try {
    const { usuarioId, facturaId, monto, reservaId } = req.body;

    if (!usuarioId || !monto) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (facturaId) {
      const factura = await Factura.findByPk(facturaId);
      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }
    }

    if (reservaId) {
      const reserva = await Reserva.findByPk(reservaId);
      if (!reserva) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }
    }

    const fecha = new Date();

    // Crear el pago
    const pago = await Pagos.create({
      usuarioId,
      facturaId,
      reservaId,
      monto,
      metodoPago: "QR",
      fechaPago: fecha,
    });

    // 2. Generar la URL para el simulador
    const iplocal = "192.168.26.3";
    const urlSimulador = `http://${iplocal}:5173/simulador-pago/${pago.idPago}`;

    // 3. Generar el QR code a partir de la URL
    const qrCodeDataUrl = await qrcode.toDataURL(urlSimulador);

    pago.id_unico_pago = qrCodeDataUrl; // Guardar el QR code en la base de datos
    await pago.save();

    // 4. Devolver el QR al frontend
    res.json({ qr: qrCodeDataUrl, idPago: pago.idPago });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el pago" });
  }
};

//actuaizar estado del pago a pagado
export const confirmarPago = async (req, res) => {
  try {
    const { idPago } = req.params;

    const pago = await Pagos.findByPk(idPago);
    if (!pago) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    pago.estado = "confirmado";
    pago.fechaPago = new Date();
    await pago.save();

    const factura = await Factura.findByPk(pago.facturaId);
    if (factura) {
      factura.estado = "pagada";
      await factura.save();
    }

    const reserva = await Reserva.findByPk(pago.reservaId);
    if (reserva) {
      reserva.pagado = true;
      reserva.estado = "confirmada";
      await reserva.save();
    }

    res.status(200).json({
      message: "Se ha realizado el pago con exito",
      pago,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el estado del pago" });
  }
};

//obterner pago por el id
export const obtenerPagoPorId = async (req, res) => {
  try {
    const { idPago } = req.params;
    const pago = await Pagos.findByPk(idPago);
    if (!pago) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }
    res.status(200).json(pago);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el pago" });
  }
};
