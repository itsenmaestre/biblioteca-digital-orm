const sequelize = require('./database');
const { Autor, Libro, Usuario, Prestamo } = require('./models');
const servicio = require('./servicio');

async function main() {
  try {
    console.log('🚀 Biblioteca Digital\n');
    
    // Crear tablas
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos creada\n');
    
    // Datos de ejemplo
    // Datos de ejemplo (R7: 3 autores, 5 libros, 2 usuarios, 2 préstamos)
console.log('📝 Insertando datos de ejemplo...');

// 3 AUTORES
const autor1 = await Autor.create({ nombre: 'Gabriel', apellido: 'García Márquez', nacionalidad: 'Colombiana' });
const autor2 = await Autor.create({ nombre: 'Isabel', apellido: 'Allende', nacionalidad: 'Chilena' });
const autor3 = await Autor.create({ nombre: 'Jorge Luis', apellido: 'Borges', nacionalidad: 'Argentina' });

// 2 USUARIOS
const usuario1 = await Usuario.create({ nombre: 'Ana López', email: 'ana@email.com', activo: true });
const usuario2 = await Usuario.create({ nombre: 'Carlos Ruiz', email: 'carlos@email.com', activo: true });

console.log('✅ Autores y usuarios creados\n');
    
    // Registrar libros
    // 5 LIBROS (con relaciones a autores)
console.log('=== 1. REGISTRANDO LIBROS ===');
const libro1 = await servicio.registrarLibro('Cien años de soledad', '9788437604947', 1967, 3, [autor1.id]);
const libro2 = await servicio.registrarLibro('La casa de los espíritus', '9788408049922', 1982, 2, [autor2.id]);
const libro3 = await servicio.registrarLibro('Ficciones', '9788420633309', 1944, 2, [autor3.id]);
const libro4 = await servicio.registrarLibro('El Aleph', '9788420633316', 1949, 1, [autor3.id]);
const libro5 = await servicio.registrarLibro('El amor en los tiempos del cólera', '9788437604954', 1985, 2, [autor1.id]);
    // Listar
    console.log('\n=== 2. LISTANDO LIBROS ===');
    await servicio.listarLibrosActivos();
    
    // Préstamos
    console.log('\n=== 3. REGISTRANDO PRÉSTAMOS ===');
    await servicio.registrarPrestamo(usuario1.id, libro1.id, 14);
    await servicio.registrarPrestamo(usuario2.id, libro2.id, 10);
    
    // Préstamos activos
    console.log('\n=== 4. PRÉSTAMOS ACTIVOS ===');
    await servicio.prestamosActivos();
    
    // Devolver
    console.log('\n=== 5. REGISTRANDO DEVOLUCIÓN ===');
    const prestamos = await Prestamo.findAll();
    if (prestamos.length) await servicio.registrarDevolucion(prestamos[0].id);
    
    // Préstamos activos después
    console.log('\n=== 6. PRÉSTAMOS ACTIVOS (DESPUÉS) ===');
    await servicio.prestamosActivos();
    
    console.log('\n✅ ¡COMPLETADO CON ÉXITO!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

main();