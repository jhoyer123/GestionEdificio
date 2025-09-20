import Pagos from "../models/Pagos.js";
import Reservas from "../models/Reserva.js";

// Registrar un pago ficticio
export const registrarPago = async (req, res) => {
  try {
    const { idReserva, monto, metodoPago } = req.body;

    // Verificar que la reserva exista
    const reserva = await Reservas.findByPk(idReserva);
    if (!reserva) {
      return res.status(404).json({ message: "La reserva no existe" });
    }

    // Crear el pago
    const pago = await Pagos.create({
      idReserva,
      monto,
      metodoPago,
      estado: "confirmado", // siempre confirmado en el ficticio
    });

    // Actualizar la reserva como pagada
    await reserva.update({ pagado: true });

    res.status(201).json({
      message: "Pago registrado correctamente",
      pago,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el pago" });
  }
};

