import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import Personal from "../models/Personal.js";
import Funcion from "../models/funcion.js";
import Planilla from "../models/Planilla.js";
import Habita from "../models/Habita.js";
import Departamento from "../models/Departamento.js";
import Residente from "../models/Residente.js";
import Turno from "../models/Turno.js";
import Administrador from "../models/Administrador.js";
import Infraestructura from "../models/Infraestructura.js";
import Empresa from "../models/Empresa.js";
import Factura from "../models/Factura.js";
import DetalleFactura from "../models/DetallesFactura.js";
// RESERVAs
import Reserva from "../models/Reserva.js";
import Pago from "../models/Pagos.js";
import AreaComun from "../models/AreaComun.js";
import Bloqueos from "../models/Bloqueos.js";
import ParqueoCaja from "../models/ParqueoCaja.js";
//Mantenimientos
import ConceptoMantenimiento from "../models/ConceptoMantenimiento.js";
import Notificacion from "../models/Notificaciones.js";
//Asociaciones

//Asociar reserva con factura
Reserva.hasOne(Factura, {
  foreignKey: "reservaId",
  as: "factura",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Factura.belongsTo(Reserva, {
  foreignKey: "reservaId",
  as: "reserva",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//Asociacion usuario - pago de 1:N
Usuario.hasMany(Pago, {
  foreignKey: "usuarioId",
  as: "pagos",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Pago.belongsTo(Usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//Asociacion factura - pago de 1:1
Factura.hasOne(Pago, {
  foreignKey: "facturaId",
  as: "pago",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Pago.belongsTo(Factura, {
  foreignKey: "facturaId",
  as: "factura",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// factura se relaciona con concepto de mantenimiento de n:m a traves de factura_concepto
Factura.belongsToMany(ConceptoMantenimiento, {
  through: "factura_concepto",
  foreignKey: "facturaId",
  otherKey: "conceptoMantenimientoId",
  as: "conceptosMantenimiento",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ConceptoMantenimiento.belongsToMany(Factura, {
  through: "factura_concepto",
  foreignKey: "conceptoMantenimientoId",
  otherKey: "facturaId",
  as: "facturas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Usuario 1---N Notificacion
Usuario.hasMany(Notificacion, {
  foreignKey: "usuarioId",
  as: "notificaciones",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Notificacion.belongsTo(Usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//reservas y parqueo cajas
// ParqueoCaja 1---N Reserva
ParqueoCaja.hasMany(Reserva, {
  foreignKey: "cajaId",
  as: "reservas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Reserva.belongsTo(ParqueoCaja, {
  foreignKey: "cajaId",
  as: "parqueoCaja",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// AreaComun 1---N Bloqueos
AreaComun.hasMany(Bloqueos, {
  foreignKey: "areaComunId",
  as: "bloqueos",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Bloqueos.belongsTo(AreaComun, {
  foreignKey: "areaComunId",
  as: "areaComun",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Usuario 1---N Reserva
Usuario.hasMany(Reserva, {
  foreignKey: "usuarioId",
  as: "reservas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Reserva.belongsTo(Usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
/* Residente.hasMany(Reserva, {
  foreignKey: "usuarioId",
  as: "reservas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Reserva.belongsTo(Residente, {
  foreignKey: "usuarioId",
  as: "residente",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
}); */

// AreaComun 1---N Reserva
AreaComun.hasMany(Reserva, {
  foreignKey: "areaComunId",
  as: "reservas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Reserva.belongsTo(AreaComun, {
  foreignKey: "areaComunId",
  as: "areaComun",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Reserva 1---1 Pago (ficticio)
/* Reserva.hasOne(Pago, {
  foreignKey: "reservaId",
  as: "pago",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Pago.belongsTo(Reserva, {
  foreignKey: "reservaId",
  as: "reserva",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
}); */

/* //Asociacion 1:N Rol - Usuario
Rol.hasMany(Usuario, { foreignKey: "rolId", as: "usuarios" });
Usuario.belongsTo(Rol, { foreignKey: "rolId", as: "rol" }); */

// Asociacion 1:N Rol - Usuario
Usuario.belongsToMany(Rol, {
  through: "UsuarioRoles", // Nombre de la tabla intermedia
  foreignKey: "usuarioId",
  otherKey: "rolId",
  as: "roles",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Rol.belongsToMany(Usuario, {
  through: "UsuarioRoles",
  foreignKey: "rolId",
  otherKey: "usuarioId",
  as: "usuarios",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Asociacion 1:1 personal - usuario
Usuario.hasOne(Personal, {
  foreignKey: "usuarioId",
  as: "personal",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Personal.belongsTo(Usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Asociacion 1:1 residente - usuario
Usuario.hasOne(Residente, {
  foreignKey: "usuarioId",
  as: "residente",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Residente.belongsTo(Usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Asociacion 1:1 administrador - usuario
Usuario.hasOne(Administrador, {
  foreignKey: "usuarioId",
  as: "administrador",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Administrador.belongsTo(Usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Asociacion 1:N funcion - personal
Funcion.hasMany(Personal, {
  foreignKey: "funcionId",
  as: "personales",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Personal.belongsTo(Funcion, {
  foreignKey: "funcionId",
  as: "funcion",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Asociacion 1:N Personal - Planilla
Personal.hasMany(Planilla, {
  foreignKey: "personalId",
  as: "planillas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Planilla.belongsTo(Personal, {
  foreignKey: "personalId",
  as: "personal",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//Asociacion N:M Personal - Turno a traves de personalTurno
Personal.belongsToMany(Turno, {
  through: "personalTurno",
  foreignKey: "personalId",
  otherKey: "turnoId",
  as: "turnos",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Turno.belongsToMany(Personal, {
  through: "personalTurno",
  foreignKey: "turnoId",
  otherKey: "personalId",
  as: "personales",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//Asociacion N:M Infraestructura - personal
Infraestructura.belongsToMany(Personal, {
  through: "InfraestructuraPersonal",
  foreignKey: "infraestructuraId",
  otherKey: "personalId",
  as: "personales",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Personal.belongsToMany(Infraestructura, {
  through: "InfraestructuraPersonal",
  foreignKey: "personalId",
  otherKey: "infraestructuraId",
  as: "infraestructuras",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Asociacion 1:N Administrador - Empresa
Administrador.hasMany(Empresa, {
  foreignKey: "administradorId",
  as: "empresas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Empresa.belongsTo(Administrador, {
  foreignKey: "administradorId",
  as: "administrador",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Asociacion N:M Usuario - Departamento a traves de Habita
Usuario.belongsToMany(Departamento, {
  through: Habita,
  foreignKey: "usuarioId", // FK en Habita que apunta a Usuario
  otherKey: "departamentoId", // FK en Habita que apunta a Departamento
  as: "departamentos",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Departamento.belongsToMany(Usuario, {
  through: Habita,
  foreignKey: "departamentoId", // FK en Habita que apunta a Departamento
  otherKey: "usuarioId", // FK en Habita que apunta a Usuario
  as: "usuarios",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//Asociacion 1:N Departamento - Factura
Departamento.hasMany(Factura, {
  foreignKey: "departamentoId",
  as: "facturas",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Factura.belongsTo(Departamento, {
  foreignKey: "departamentoId",
  as: "departamento",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//Asociacion 1:N Factura - DetalleFactura
Factura.hasMany(DetalleFactura, {
  foreignKey: "facturaId",
  as: "detalles",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
DetalleFactura.belongsTo(Factura, {
  foreignKey: "facturaId",
  as: "factura",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
