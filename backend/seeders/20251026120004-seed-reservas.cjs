"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // Obtener ids de usuarios residentes (solo usuarios con rol residente)
      const residentesResult = await queryInterface.sequelize.query(
        `SELECT DISTINCT u.idUsuario 
         FROM usuarios u 
         INNER JOIN UsuarioRoles ur ON u.idUsuario = ur.usuarioId 
         INNER JOIN roles r ON ur.rolId = r.idRol 
         WHERE r.rol = 'residente' AND u.nombre != 'Admin Principal';`,
        { transaction: t }
      );
      const residentes = residentesResult[0] || [];

      // Obtener ids de areas comunes
      const areasResult = await queryInterface.sequelize.query(
        'SELECT idAreaComun, nombreAreaComun, costoBase, tipoArea FROM Areas_Comunes ORDER BY idAreaComun;',
        { transaction: t }
      );
      const areas = areasResult[0] || [];

      // Obtener ids de parqueo cajas
      const cajasResult = await queryInterface.sequelize.query(
        'SELECT idParqueoCaja FROM parqueocajas WHERE estado = true ORDER BY idParqueoCaja;',
        { transaction: t }
      );
      const cajas = cajasResult[0] || [];

      if (residentes.length === 0 || areas.length === 0) {
        throw new Error("No hay usuarios o areas comunes para crear reservas");
      }

      // Función para calcular costo
      const parseDateLocal = (dateStr) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
      };
      const toHours = (hhmm) => {
        if (!hhmm) return 0;
        const [hh, mm] = hhmm.split(":").map(Number);
        return hh + mm / 60;
      };
      const calcularCosto = (area, reserva) => {
        const esGimnasio = area.tipoArea === "gimnasio";
        const esPorHoras = !!reserva.horaInicio && !!reserva.horaFin && !reserva.fechaFinReserva;
        const esPorDias = !!reserva.fechaFinReserva && !reserva.horaInicio && !reserva.horaFin;
        let costoCalculado = 0;
        if (esGimnasio) {
          costoCalculado = parseFloat(area.costoBase);
        } else {
          if (esPorHoras) {
            const duracionEnHoras = toHours(reserva.horaFin) - toHours(reserva.horaInicio);
            if (duracionEnHoras > 0) {
              costoCalculado = duracionEnHoras * parseFloat(area.costoBase);
            }
          } else if (esPorDias) {
            const fechaInicio = parseDateLocal(reserva.fechaReserva);
            const fechaFin = parseDateLocal(reserva.fechaFinReserva);
            const diffTime = Math.abs(fechaFin - fechaInicio);
            const numeroDeDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            let horasAbiertoPorDia = toHours(area.horarioCierre) - toHours(area.horarioApertura);
            if (horasAbiertoPorDia === 0) {
              horasAbiertoPorDia = 24;
            }
            if (numeroDeDias > 0 && horasAbiertoPorDia > 0) {
              costoCalculado = numeroDeDias * horasAbiertoPorDia * parseFloat(area.costoBase);
            }
          }
        }
        return costoCalculado.toFixed(2);
      };

      // Crear reservas para 4 meses diferentes (del actual hacia atrás)
      const meses = [10, 9, 8, 7]; // Octubre, Septiembre, Agosto, Julio
      const reservasData = [];
      let reservaIndex = 0;

      meses.forEach(month => {
        const numReservas = Math.floor(Math.random() * 3) + 3; // 3 a 5 reservas por mes
        for (let i = 0; i < numReservas; i++) {
          // Elegir área: 20% salón, 40% gimnasio, 40% parqueo
          let areaIndex;
          const rand = Math.random();
          if (rand < 0.2) areaIndex = 0; // salón
          else if (rand < 0.6) areaIndex = 1; // gimnasio
          else areaIndex = 2; // parqueo

          const area = areas[areaIndex];

          // Fecha aleatoria en el mes
          const year = 2025;
          const day = Math.floor(Math.random() * 28) + 1;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          // Tipo de reserva
          let esPorHoras = true;
          let esPorDias = false;
          if (area.tipoArea !== 'gimnasio' && Math.random() < 0.3) { // 30% por días para salón y parqueo
            esPorDias = true;
            esPorHoras = false;
          }

          let fechaFinReserva = null;
          if (esPorDias) {
            const extraDays = Math.floor(Math.random() * 2) + 1; // 1-2 días
            const finDate = new Date(year, month - 1, day + extraDays);
            fechaFinReserva = finDate.toISOString().split('T')[0];
          }

          let horaInicio = null, horaFin = null;
          if (esPorHoras) {
            const startHour = Math.floor(Math.random() * 10) + 8; // 8-17
            const duration = area.tipoArea === 'gimnasio' ? 1 : Math.floor(Math.random() * 4) + 1;
            const endHour = startHour + duration;
            horaInicio = `${String(startHour).padStart(2, '0')}:00:00`;
            horaFin = `${String(endHour).padStart(2, '0')}:00:00`;
          }

          // Asistentes
          let numAsistentes;
          if (area.tipoArea === 'gimnasio') numAsistentes = Math.floor(Math.random() * 10) + 1;
          else if (area.tipoArea === 'parqueo') numAsistentes = 1;
          else numAsistentes = Math.floor(Math.random() * 30) + 1;

          // Motivo
          const motivos = {
            'gimnasio': ['Ejercicio', 'Yoga', 'Entrenamiento'],
            'parqueo': ['Parqueo diario', 'Visita', 'Reserva espacio'],
            'salones': ['Reunión', 'Fiesta', 'Taller', 'Evento']
          };
          const motivo = motivos[area.tipoArea][Math.floor(Math.random() * motivos[area.tipoArea].length)];

          // Usuario
          const usuarioId = residentes[reservaIndex % residentes.length].idUsuario;
          reservaIndex++;

          // Caja para parqueo
          let cajaId = null;
          if (area.tipoArea === 'parqueo') {
            cajaId = cajas[Math.floor(Math.random() * cajas.length)]?.idParqueoCaja || null;
          }

          reservasData.push({
            usuarioId,
            areaComunId: area.idAreaComun,
            fechaReserva: dateStr,
            horaInicio,
            horaFin,
            fechaFinReserva,
            motivo,
            numAsistentes,
            cajaId,
            estado: 'confirmada',
            pagado: true,
          });
        }
      });

      // Agregar 3 reservas para el día actual
      const fechaActual = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      for (let i = 0; i < 3; i++) {
        // Elegir área aleatoria
        const areaIndex = Math.floor(Math.random() * areas.length);
        const area = areas[areaIndex];

        // Tipo de reserva (solo por horas para el día actual)
        const startHour = Math.floor(Math.random() * 8) + 9; // 9-16
        const duration = area.tipoArea === 'gimnasio' ? 1 : Math.floor(Math.random() * 3) + 1;
        const endHour = startHour + duration;
        const horaInicio = `${String(startHour).padStart(2, '0')}:00:00`;
        const horaFin = `${String(endHour).padStart(2, '0')}:00:00`;

        // Asistentes
        let numAsistentes;
        if (area.tipoArea === 'gimnasio') numAsistentes = Math.floor(Math.random() * 10) + 1;
        else if (area.tipoArea === 'parqueo') numAsistentes = 1;
        else numAsistentes = Math.floor(Math.random() * 30) + 1;

        // Motivo
        const motivos = {
          'gimnasio': ['Ejercicio', 'Yoga', 'Entrenamiento'],
          'parqueo': ['Parqueo diario', 'Visita', 'Reserva espacio'],
          'salones': ['Reunión', 'Fiesta', 'Taller', 'Evento']
        };
        const motivo = motivos[area.tipoArea][Math.floor(Math.random() * motivos[area.tipoArea].length)];

        // Usuario
        const usuarioId = residentes[reservaIndex % residentes.length].idUsuario;
        reservaIndex++;

        // Caja para parqueo
        let cajaId = null;
        if (area.tipoArea === 'parqueo') {
          cajaId = cajas[Math.floor(Math.random() * cajas.length)]?.idParqueoCaja || null;
        }

        reservasData.push({
          usuarioId,
          areaComunId: area.idAreaComun,
          fechaReserva: fechaActual,
          horaInicio,
          horaFin,
          fechaFinReserva: null,
          motivo,
          numAsistentes,
          cajaId,
          estado: 'confirmada',
          pagado: true,
        });
      }

      // Calcular costoTotal para cada reserva
      reservasData.forEach(reserva => {
        const area = areas.find(a => a.idAreaComun === reserva.areaComunId);
        reserva.costoTotal = calcularCosto(area, reserva);
      });

      await queryInterface.bulkInsert("reservas", reservasData.map(r => ({
        ...r,
        createdAt: new Date(),
        updatedAt: new Date(),
      })), { transaction: t });

      // Obtener ids de las reservas insertadas
      const reservasInsertadasResult = await queryInterface.sequelize.query(
        `SELECT idReserva, costoTotal, fechaReserva FROM reservas ORDER BY idReserva DESC LIMIT ${reservasData.length};`,
        { transaction: t }
      );
      const reservasInsertadas = reservasInsertadasResult[0] || [];

      // Crear facturas para cada reserva
      const fechaFactura = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const facturasData = reservasInsertadas.map((reserva, index) => ({
        nroFactura: `FAC-${fechaFactura}-${String(index + 1).padStart(3, '0')}`,
        fechaEmision: new Date(reserva.fechaReserva), // Usar la fecha de la reserva
        montoTotal: reserva.costoTotal,
        estado: "pagada",
        reservaId: reserva.idReserva,
      }));

      await queryInterface.bulkInsert("facturas", facturasData.map(f => ({
        ...f,
        createdAt: new Date(),
        updatedAt: new Date(),
      })), { transaction: t });

      // Obtener ids de las facturas insertadas con fecha de reserva
      const facturasInsertadasResult = await queryInterface.sequelize.query(
        `SELECT f.idFactura, f.reservaId, f.montoTotal, r.fechaReserva 
         FROM facturas f 
         INNER JOIN reservas r ON f.reservaId = r.idReserva 
         ORDER BY f.idFactura DESC LIMIT ${reservasData.length};`,
        { transaction: t }
      );
      const facturasInsertadas = facturasInsertadasResult[0] || [];

      // Crear pagos para cada factura
      const pagosData = facturasInsertadas.map((factura, index) => {
        // Encontrar la reserva correspondiente para obtener su fecha
        const reservaCorrespondiente = reservasInsertadas.find(r => r.idReserva === factura.reservaId);

        return {
          id_unico_pago: `PAY-${String(index + 1).padStart(3, '0')}`,
          usuarioId: residentes[index % residentes.length].idUsuario,
          facturaId: factura.idFactura,
          reservaId: factura.reservaId,
          monto: factura.montoTotal,
          metodoPago: index % 2 === 0 ? "QR" : "transferencia",
          fechaPago: new Date(reservaCorrespondiente.fechaReserva), // Usar la fecha de la reserva
          estado: "confirmado",
        };
      });

      await queryInterface.bulkInsert("pagos", pagosData.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date(),
      })), { transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("reservas", null, {});
  },
};