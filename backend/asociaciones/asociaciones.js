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

//Asociaciones

// Usuario 1---N Reserva
Residente.hasMany(Reserva, {
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
});

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
Reserva.hasOne(Pago, {
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
});

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
