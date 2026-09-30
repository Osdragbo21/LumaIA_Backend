// 1. Limpieza de colecciones para evitar duplicados en cada ejecución
db.usuarios.deleteMany({});
db.medicamentos.deleteMany({});
db.citas.deleteMany({});
db.notas_personales.deleteMany({});
db.registros_toma.deleteMany({});
db.logs_interaccion.deleteMany({});

// 2. Generación de ObjectIds estáticos para mantener la integridad referencial
const adultoMayorId = new ObjectId();
const cuidadorId = new ObjectId();
const devId = new ObjectId();
const med1Id = new ObjectId();
const med2Id = new ObjectId();

// 3. Inserción de Usuarios con red de desnormalización de emergencia
db.usuarios.insertMany([
  {
    _id: adultoMayorId,
    nombre: "Pedro",
    correo: "pedro@lumaia.local",
    password_hash: "$2b$10$hashedpasswordxyz",
    rol: "Adulto Mayor",
    cuidador_vinculado_id: cuidadorId,
    estado_activo: true,
    tokens_dispositivo: ["token_celular_pedro"],
    contactos_emergencia: [
      { nombre_contacto: "Osvaldo", telefono: "555-0101", parentesco: "Nieto y Cuidador" },
      { nombre_contacto: "Yeni", telefono: "555-0202", parentesco: "Hija" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: cuidadorId,
    nombre: "Osvaldo Salinas Aranda",
    correo: "osvaldo@lumaia.local",
    password_hash: "$2b$10$hashedpasswordxyz",
    rol: "Cuidador",
    estado_activo: true,
    tokens_dispositivo: ["token_celular_osvaldo"],
    contactos_emergencia: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: devId,
    nombre: "Jaredtzi Aide",
    correo: "jaredtzi@lumaia.local",
    password_hash: "$2b$10$hashedpasswordxyz",
    rol: "Cuidador",
    estado_activo: true,
    tokens_dispositivo: ["token_laptop_jaredtzi"],
    contactos_emergencia: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 4. Inserción de Medicamentos (Esquemas de tratamiento)
db.medicamentos.insertMany([
  {
    _id: med1Id,
    usuario_id: adultoMayorId,
    nombre_farmaco: "Losartán",
    dosis: "1 pastilla",
    frecuencia_horas: 12,
    horarios_especificos: ["08:00", "20:00"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: med2Id,
    usuario_id: adultoMayorId,
    nombre_farmaco: "Metformina",
    dosis: "850mg",
    frecuencia_horas: 24,
    horarios_especificos: ["14:00"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 5. Inserción de Citas (Agenda)
db.citas.insertMany([
  {
    usuario_id: adultoMayorId,
    titulo_evento: "Revisión General",
    fecha_hora: new Date("2026-10-15T10:00:00Z"),
    ubicacion: "Clínica del Centro, Consultorio 4",
    estado: "Programada",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 6. Inserción de Notas Personales
db.notas_personales.insertMany([
  {
    usuario_id: adultoMayorId,
    contenido: "Preguntar al doctor sobre el cambio de marca del medicamento.",
    fecha_creacion: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 7. Inserción de Registros de Toma Transaccionales (Historial de Adherencia)
db.registros_toma.insertMany([
  {
    medicamento_id: med1Id,
    fecha_programada: new Date("2026-09-29T08:00:00Z"),
    estado_toma: "Confirmada",
    fecha_confirmacion: new Date("2026-09-29T08:05:00Z"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    medicamento_id: med2Id,
    fecha_programada: new Date("2026-09-29T14:00:00Z"),
    estado_toma: "Pendiente",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 8. Inserción de Logs de Interacción (Auditoría del Asistente Lógico)
db.logs_interaccion.insertMany([
  {
    usuario_id: adultoMayorId,
    premisa_entrada: "¿Qué pastilla me toca a las 2 de la tarde?",
    respuesta_generada: "Te toca tomar Metformina, 850mg.",
    bloqueo_medico: false,
    fecha_interaccion: new Date()
  },
  {
    usuario_id: adultoMayorId,
    premisa_entrada: "Siento mucha presión en el pecho, ¿qué hago?",
    respuesta_generada: "Por tu seguridad, no puedo dar consejos médicos. Por favor, contacta a Osvaldo o presiona el botón SOS.",
    bloqueo_medico: true,
    fecha_interaccion: new Date()
  }
]);

print("✅ Datos de prueba insertados exitosamente.");