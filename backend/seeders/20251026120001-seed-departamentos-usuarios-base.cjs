"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
    // Insertar departamentos
    await queryInterface.bulkInsert("departamentos", [
      {
        numero: 1,
        descripcion: "Departamento en primer piso, vista al jardín",
        piso: 1,
        alquilerPrecio: 800.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero: 2,
        descripcion: "Departamento en primer piso, cerca del ascensor",
        piso: 1,
        alquilerPrecio: 850.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero: 3,
        descripcion: "Departamento en segundo piso, balcón amplio",
        piso: 2,
        alquilerPrecio: 900.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero: 4,
        descripcion: "Departamento en segundo piso, vista a la calle",
        piso: 2,
        alquilerPrecio: 950.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero: 5,
        descripcion: "Departamento en tercer piso, terraza privada",
        piso: 3,
        alquilerPrecio: 1000.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { transaction: t });

    // Obtener idRol para Administrador
    const [adminRol] = await queryInterface.sequelize.query(
      'SELECT idRol FROM roles WHERE rol = "administrador" LIMIT 1;'
    );
    const adminRolId = adminRol[0].idRol;

    // Obtener idRol para Residente
    const [residenteRol] = await queryInterface.sequelize.query(
      'SELECT idRol FROM roles WHERE rol = "residente" LIMIT 1;'
    );
    const residenteRolId = residenteRol[0].idRol;

    // Obtener idRol para Personal
    const [personalRol] = await queryInterface.sequelize.query(
      'SELECT idRol FROM roles WHERE rol = "personal" LIMIT 1;'
    );
    const personalRolId = personalRol[0].idRol;

    // Hash de contraseñas
    const hashedAdminPass = await bcrypt.hash("admin123", 10);
    const hashedResidentePass = await bcrypt.hash("residente123", 10);
    const hashedPersonalPass = await bcrypt.hash("personal123", 10);

    // Insertar usuarios (sin rolId, se asigna en tabla intermedia)
    await queryInterface.bulkInsert("usuarios", [
      // 1 Administrador
      {
        nombre: "Admin Principal",
        email: "admin@gmail.com",
        password: hashedAdminPass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // 5 Residentes
      {
        nombre: "Juan Pérez",
        email: "juan@gmail.com",
        password: hashedResidentePass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "María García",
        email: "maria@gmail.com",
        password: hashedResidentePass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Pedro López",
        email: "pedro@gmail.com",
        password: hashedResidentePass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Ana Rodríguez",
        email: "ana@gmail.com",
        password: hashedResidentePass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Luis Martínez",
        email: "luis@gmail.com",
        password: hashedResidentePass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // 5 Personal
      {
        nombre: "Carlos Sánchez",
        email: "carlos@gmail.com",
        password: hashedPersonalPass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Laura Díaz",
        email: "laura@gmail.com",
        password: hashedPersonalPass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Miguel Torres",
        email: "miguel@gmail.com",
        password: hashedPersonalPass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Sofia Ramírez",
        email: "sofia@gmail.com",
        password: hashedPersonalPass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Diego Flores",
        email: "diego@gmail.com",
        password: hashedPersonalPass,
        estado: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { transaction: t });

    // Obtener ids de usuarios insertados por nombre
    const nombresUsuarios = [
      "Admin Principal",
      "Juan Pérez",
      "María García",
      "Pedro López",
      "Ana Rodríguez",
      "Luis Martínez",
      "Carlos Sánchez",
      "Laura Díaz",
      "Miguel Torres",
      "Sofia Ramírez",
      "Diego Flores"
    ];
    const [usuarios] = await queryInterface.sequelize.query(
      `SELECT idUsuario, nombre FROM usuarios WHERE nombre IN (${nombresUsuarios.map(n => `'${n}'`).join(', ')}) ORDER BY idUsuario;`,
      { transaction: t }
    );

    const adminUser = usuarios.find(u => u.nombre === "Admin Principal");
    const residentes = usuarios.filter(u => ["Juan Pérez", "María García", "Pedro López", "Ana Rodríguez", "Luis Martínez"].includes(u.nombre));
    const personal = usuarios.filter(u => ["Carlos Sánchez", "Laura Díaz", "Miguel Torres", "Sofia Ramírez", "Diego Flores"].includes(u.nombre));

    // Asignar roles en tabla intermedia UsuarioRoles
    const usuarioRoles = [
      { usuarioId: adminUser.idUsuario, rolId: adminRolId },
      ...residentes.map(r => ({ usuarioId: r.idUsuario, rolId: residenteRolId })),
      ...personal.map(p => ({ usuarioId: p.idUsuario, rolId: personalRolId })),
    ];
    await queryInterface.bulkInsert("UsuarioRoles", usuarioRoles.map(ur => ({
      usuarioId: ur.usuarioId,
      rolId: ur.rolId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })), { transaction: t });

    // Insertar dependientes

    // Administrador
    await queryInterface.bulkInsert("administradores", [
      {
        cedula: "1234567890",
        usuarioId: adminUser.idUsuario,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { transaction: t });

    // Obtener ids de funciones
    const [funciones] = await queryInterface.sequelize.query(
      'SELECT idFuncion, cargo FROM funciones ORDER BY idFuncion;',
      { transaction: t }
    );

    // Personal (5, asignar funciones rotando)
    const personalData = personal.map((p, index) => ({
      fechaNacimiento: new Date(1980 + index, index % 12, 15),
      genero: index % 2 === 0 ? "Masculino" : "Femenino",
      telefono: `300${index + 1}000000`,
      direccion: `Calle ${index + 1} #${index + 10}`,
      funcionId: funciones[index % funciones.length].idFuncion,
      usuarioId: p.idUsuario,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await queryInterface.bulkInsert("personales", personalData, { transaction: t });

    // Residentes (5, asignar departamentos)
    const [departamentos] = await queryInterface.sequelize.query(
      'SELECT idDepartamento FROM departamentos ORDER BY idDepartamento;',
      { transaction: t }
    );

    const residentesData = residentes.map((r, index) => ({
      telefono: `301${index + 1}000000`,
      usuarioId: r.idUsuario,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await queryInterface.bulkInsert("residentes", residentesData, { transaction: t });

    // Habita (relación N:M Usuario-Departamento)
    const habitaData = residentes.map((r, index) => ({
      usuarioId: r.idUsuario,
      departamentoId: departamentos[index].idDepartamento,
      fecha: new Date(),
      tipoResidencia: "propietario",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await queryInterface.bulkInsert("habita", habitaData, { transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
},

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("habita", null, {});
    await queryInterface.bulkDelete("residentes", null, {});
    await queryInterface.bulkDelete("personales", null, {});
    await queryInterface.bulkDelete("administradores", null, {});
    await queryInterface.bulkDelete("UsuarioRoles", null, {});
    await queryInterface.bulkDelete("usuarios", null, {});
    await queryInterface.bulkDelete("departamentos", null, {});
  },
};
