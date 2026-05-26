const sequelize = require('./database');
const { Autor, Libro, Usuario, Prestamo } = require('./models');

async function verificar() {
    console.log('\n📊 CONTADORES:');
    console.log('Autores:', await Autor.count());
    console.log('Libros:', await Libro.count());
    console.log('Usuarios:', await Usuario.count());
    console.log('Préstamos:', await Prestamo.count());
    
    console.log('\n📚 LISTA COMPLETA DE LIBROS:');
    const libros = await Libro.findAll({ include: [{ model: Autor, through: { attributes: [] } }] });
    libros.forEach(l => {
        const autores = l.Autors.map(a => a.nombre + ' ' + a.apellido).join(', ');
        console.log(`   ${l.id}. ${l.titulo} (${l.copias_disponibles} copias) - ${autores}`);
    });
    
    await sequelize.close();
}

verificar();