import Anuncio from "../models/Anuncio.js";
import Usuario from "../models/Usuario.js";
import AnuncioUsuario from "../models/AnuncioUsuario.js";

//Crear un nuevo anuncio
export const createAnuncio = async (req, res) => {
  try {
    const { titulo, descripcion, visiblePara, fechaExpiracion, usuarioId } =
      req.body;
    if (
      !titulo ||
      !descripcion ||
      !visiblePara ||
      !fechaExpiracion ||
      !usuarioId
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const nuevoAnuncio = await Anuncio.create({
      titulo,
      descripcion,
      fechaCreacion: new Date(),
      visiblePara,
      fechaExpiracion,
      usuarioId,
    });
    res.status(201).json({
      nuevoAnuncio: nuevoAnuncio,
      message: "Anuncio creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear anuncio:", error);
    res.status(500).json({ error: "Error al crear anuncio" });
  }
};

//Actualizar un anuncio existente
export const updateAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, visiblePara, fechaExpiracion } = req.body;
    const anuncio = await Anuncio.findByPk(id);
    if (!anuncio) {
      return res.status(404).json({ message: "Anuncio no encontrado" });
    }
    anuncio.titulo = titulo || anuncio.titulo;
    anuncio.descripcion = descripcion || anuncio.descripcion;
    anuncio.visiblePara = visiblePara || anuncio.visiblePara;
    anuncio.fechaExpiracion = fechaExpiracion || anuncio.fechaExpiracion;
    await anuncio.save();
    res.json({ anuncio, message: "Anuncio actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar anuncio:", error);
    res.status(500).json({ error: "Error al actualizar anuncio" });
  }
};

//Eliminar un anuncio
export const deleteAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = await Anuncio.findByPk(id);
    if (!anuncio) {
      return res.status(404).json({ message: "Anuncio no encontrado" });
    }
    await anuncio.destroy();
    res.json({ message: "Anuncio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar anuncio:", error);
    res.status(500).json({ error: "Error al eliminar anuncio" });
  }
};

export const getAnuncios = async (req, res) => {
  try {
    const anunciosDB = await Anuncio.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const anuncios = anunciosDB.map((anuncio) => {
      const data = anuncio.get({ plain: true });

      return {
        ...data,
        fechaCreacion: data.fechaCreacion
          ? new Date(data.fechaCreacion).toLocaleDateString("es-BO", {
              timeZone: "America/La_Paz",
            })
          : null,
        fechaExpiracion: data.fechaExpiracion
          ? new Date(data.fechaExpiracion).toLocaleDateString("es-BO", {
              timeZone: "America/La_Paz",
            })
          : null,
      };
    });

    res.json(anuncios);
  } catch (error) {
    console.error("Error al obtener anuncios:", error);
    res.status(500).json({ error: "Error al obtener anuncios" });
  }
};

// Marcar un anuncio como visto por un usuario
export const marcarAnuncioVisto = async (req, res) => {
  try {
    const { usuarioId, anuncioId } = req.body;

    // Verificamos si ya lo vio
    const yaExiste = await AnuncioUsuario.findOne({
      where: { usuarioId, anuncioId },
    });

    if (yaExiste) {
      return res.json({ message: "El anuncio ya fue marcado como visto." });
    }

    // Registramos la relación
    await AnuncioUsuario.create({
      usuarioId,
      anuncioId,
      visto: true,
      fechaVisto: new Date(),
    });

    res.json({ message: "Anuncio marcado como visto correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al marcar el anuncio como visto" });
  }
};
