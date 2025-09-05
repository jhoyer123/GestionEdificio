import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import Personal from "../models/Personal.js";
import Funcion from "../models/funcion.js";
import Planilla from "../models/Planilla.js";
import Habita from "../models/Habita.js";
import Departamento from "../models/Departamento.js";
import Residente from "../models/Residente.js";

//Asociaciones

//Asociacion 1:N Rol - Usuario
Rol.hasMany(Usuario, { foreignKey: "rolId", as: "usuarios" });
Usuario.belongsTo(Rol, { foreignKey: "rolId", as: "rol" });

// Asociacion 1:1 personal - usuario
Usuario.hasOne(Personal, { foreignKey: "usuarioId", as: "personal" });
Personal.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

// Asociacion 1:1 residente - usuario
Usuario.hasOne(Residente, { foreignKey: "id", as: "residente" });
Residente.belongsTo(Usuario, { foreignKey: "id", as: "usuario" });

// Asociacion 1:N funcion - personal
Funcion.hasMany(Personal, { foreignKey: "funcionId", as: "personal" });
Personal.belongsTo(Funcion, { foreignKey: "funcionId", as: "funcion" });

// Asociacion 1:N Personal - Planilla
Personal.hasMany(Planilla, { foreignKey: "personalId", as: "planillas" });
Planilla.belongsTo(Personal, { foreignKey: "personalId", as: "personal" });

// Asociacion N:M Usuario - Departamento a traves de Habita
Usuario.belongsToMany(Departamento, {
  through: Habita,
  foreignKey: "usuarioId",      // FK en Habita que apunta a Usuario
  otherKey: "departamentoId",     // FK en Habita que apunta a Departamento
  as: "departamentos",
});

Departamento.belongsToMany(Usuario, {
  through: Habita,
  foreignKey: "departamentoId",  // FK en Habita que apunta a Departamento
  otherKey: "usuarioId",        // FK en Habita que apunta a Usuario
  as: "usuarios",
});