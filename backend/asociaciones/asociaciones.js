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

//Asociaciones

/* //Asociacion 1:N Rol - Usuario
Rol.hasMany(Usuario, { foreignKey: "rolId", as: "usuarios" });
Usuario.belongsTo(Rol, { foreignKey: "rolId", as: "rol" }); */

// Asociacion 1:N Rol - Usuario
Usuario.belongsToMany(Rol, { 
  through: 'UsuarioRoles', // Nombre de la tabla intermedia
  foreignKey: 'usuarioId',
  otherKey: 'rolId',
  as: 'roles'
});

Rol.belongsToMany(Usuario, { 
  through: 'UsuarioRoles',
  foreignKey: 'rolId',
  otherKey: 'usuarioId',
  as: 'usuarios'
});

// Asociacion 1:1 personal - usuario
Usuario.hasOne(Personal, { foreignKey: "usuarioId", as: "personal" });
Personal.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

// Asociacion 1:1 residente - usuario
Usuario.hasOne(Residente, { foreignKey: "usuarioId", as: "residente"});
Residente.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario"});

// Asociacion 1:1 administrador - usuario
Usuario.hasOne(Administrador, { foreignKey: "usuarioId", as: "administrador" });
Administrador.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

// Asociacion 1:N funcion - personal
Funcion.hasMany(Personal, { foreignKey: "funcionId", as: "personales" });
Personal.belongsTo(Funcion, { foreignKey: "funcionId", as: "funcion" });

// Asociacion 1:N Personal - Planilla
Personal.hasMany(Planilla, { foreignKey: "personalId", as: "planillas" });
Planilla.belongsTo(Personal, { foreignKey: "personalId", as: "personal" });

//Asociacion N:M Personal - Turno a traves de personalTurno
Personal.belongsToMany(Turno, {
  through: "personalTurno",
  foreignKey: "personalId",
  otherKey: "turnoId",
  as: "turnos",
});

Turno.belongsToMany(Personal, {
  through: "personalTurno",
  foreignKey: "turnoId",
  otherKey: "personalId",
  as: "personales",
});

//Asociacion N:M Infraestructura - personal
Infraestructura.belongsToMany(Personal, {
  through: "InfraestructuraPersonal",
  foreignKey: "infraestructuraId",
  otherKey: "personalId",
  as: "personales",
});

Personal.belongsToMany(Infraestructura, {
  through: "InfraestructuraPersonal",
  foreignKey: "personalId",
  otherKey: "infraestructuraId",
  as: "infraestructuras",
});

// Asociacion 1:N Administrador - Empresa
Administrador.hasMany(Empresa, {
  foreignKey: "administradorId",
  as: "empresas",
});

Empresa.belongsTo(Administrador, {
  foreignKey: "administradorId",
  as: "administrador",
});

// Asociacion N:M Usuario - Departamento a traves de Habita
Usuario.belongsToMany(Departamento, {
  through: Habita,
  foreignKey: "usuarioId", // FK en Habita que apunta a Usuario
  otherKey: "departamentoId", // FK en Habita que apunta a Departamento
  as: "departamentos",
});

Departamento.belongsToMany(Usuario, {
  through: Habita,
  foreignKey: "departamentoId", // FK en Habita que apunta a Departamento
  otherKey: "usuarioId", // FK en Habita que apunta a Usuario
  as: "usuarios",
});

//Asociacion 1:N Departamento - Factura
Departamento.hasMany(Factura, { foreignKey: "departamentoId", as: "facturas" });
Factura.belongsTo(Departamento, { foreignKey: "departamentoId", as: "departamento" });

//Asociacion 1:N Factura - DetalleFactura
Factura.hasMany(DetalleFactura, { foreignKey: "facturaId", as: "detalles" });
DetalleFactura.belongsTo(Factura, { foreignKey: "facturaId", as: "factura" });