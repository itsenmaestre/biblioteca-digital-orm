const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// Autor
const Autor = sequelize.define('Autor', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: DataTypes.STRING,
  apellido: DataTypes.STRING,
  nacionalidad: DataTypes.STRING
});

// Libro
const Libro = sequelize.define('Libro', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: DataTypes.STRING,
  isbn: { type: DataTypes.STRING, unique: true },
  anio_publicacion: DataTypes.INTEGER,
  copias_disponibles: { type: DataTypes.INTEGER, defaultValue: 1 },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Usuario
const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Prestamo
const Prestamo = sequelize.define('Prestamo', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fecha_prestamo: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fecha_devolucion_esperada: DataTypes.DATE,
  fecha_devolucion_real: DataTypes.DATE
});

// ========== RELACIONES ==========
// Many-to-Many: Libro ↔ Autor
Libro.belongsToMany(Autor, { through: 'LibroAutor' });
Autor.belongsToMany(Libro, { through: 'LibroAutor' });

// One-to-Many: Prestamo con Usuario y Libro
Prestamo.belongsTo(Usuario);
Prestamo.belongsTo(Libro);
Usuario.hasMany(Prestamo);
Libro.hasMany(Prestamo);

module.exports = { Autor, Libro, Usuario, Prestamo };