const sequelize = require('./database');
const { Autor, Libro, Usuario, Prestamo } = require('./models');

// 1. Registrar libro con autores
async function registrarLibro(titulo, isbn, anio, copias, autoresIds) {
  const t = await sequelize.transaction();
  try {
    const libro = await Libro.create({
      titulo, isbn, anio_publicacion: anio, copias_disponibles: copias
    }, { transaction: t });
    
    if (autoresIds && autoresIds.length) {
      for (const autorId of autoresIds) {
        await sequelize.query(
          `INSERT INTO LibroAutor (LibroId, AutorId, createdAt, updatedAt) 
           VALUES (${libro.id}, ${autorId}, datetime('now'), datetime('now'))`,
          { transaction: t }
        );
      }
    }
    
    await t.commit();
    console.log(`✅ Libro "${titulo}" registrado con ID ${libro.id}`);
    return libro;
  } catch (error) {
    await t.rollback();
    console.error("❌ Error al registrar libro:", error.message);
    throw error;
  }
}

// 2. Listar libros activos con sus autores (CORREGIDO)
async function listarLibrosActivos() {
  const libros = await Libro.findAll({
    where: { activo: true },
    include: [{ model: Autor, through: { attributes: [] } }]
  });
  
  console.log(`\n📚 ${libros.length} libros activos encontrados:`);
  for (const libro of libros) {
    // Sequelize devuelve los autores en 'Autors' (con 's')
    const autoresArray = libro.Autors || [];
    const autores = autoresArray.map(a => `${a.nombre} ${a.apellido}`).join(', ');
    console.log(`- ${libro.titulo} (${libro.copias_disponibles} copias) por ${autores}`);
  }
  return libros;
}

// 3. Registrar préstamo
async function registrarPrestamo(usuarioId, libroId, diasPrestamo = 14) {
  const t = await sequelize.transaction();
  try {
    const libro = await Libro.findByPk(libroId, { transaction: t });
    if (!libro) throw new Error("Libro no encontrado");
    if (libro.copias_disponibles <= 0) throw new Error("No hay copias disponibles");
    
    const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
    if (!usuario) throw new Error("Usuario no encontrado");
    if (!usuario.activo) throw new Error("Usuario inactivo");
    
    const fechaEsperada = new Date();
    fechaEsperada.setDate(fechaEsperada.getDate() + diasPrestamo);
    
    const prestamo = await Prestamo.create({
      UsuarioId: usuarioId,
      LibroId: libroId,
      fecha_devolucion_esperada: fechaEsperada
    }, { transaction: t });
    
    libro.copias_disponibles--;
    await libro.save({ transaction: t });
    
    await t.commit();
    console.log(`✅ Préstamo registrado: "${libro.titulo}" a ${usuario.nombre}`);
    return prestamo;
  } catch (error) {
    await t.rollback();
    console.error("❌ Error en préstamo:", error.message);
    throw error;
  }
}

// 4. Registrar devolución
async function registrarDevolucion(prestamoId) {
  const t = await sequelize.transaction();
  try {
    const prestamo = await Prestamo.findByPk(prestamoId, {
      include: [Libro],
      transaction: t
    });
    
    if (!prestamo) throw new Error("Préstamo no encontrado");
    if (prestamo.fecha_devolucion_real) throw new Error("Este préstamo ya fue devuelto");
    
    prestamo.fecha_devolucion_real = new Date();
    await prestamo.save({ transaction: t });
    
    prestamo.Libro.copias_disponibles++;
    await prestamo.Libro.save({ transaction: t });
    
    await t.commit();
    console.log(`✅ Devolución registrada para préstamo ID ${prestamoId}`);
    return prestamo;
  } catch (error) {
    await t.rollback();
    console.error("❌ Error en devolución:", error.message);
    throw error;
  }
}

// 5. Consultar préstamos activos
async function prestamosActivos() {
  const prestamos = await Prestamo.findAll({
    where: { fecha_devolucion_real: null },
    include: [Usuario, Libro]
  });
  
  console.log(`\n📖 ${prestamos.length} préstamos activos:`);
  for (const p of prestamos) {
    console.log(`- ${p.Usuario.nombre} → "${p.Libro.titulo}" (venc: ${new Date(p.fecha_devolucion_esperada).toLocaleDateString()})`);
  }
  return prestamos;
}

module.exports = {
  registrarLibro,
  listarLibrosActivos,
  registrarPrestamo,
  registrarDevolucion,
  prestamosActivos
};