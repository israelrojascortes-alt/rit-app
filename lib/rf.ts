// Riesgos de Fatalidad aplicables a DRT (Línea Base RF v2, 05-10-2026 · SIGO-ECC-003)
// Editar aquí para agregar/quitar RF o controles críticos.
export type Control = { code: string; text: string };
export type RiesgoFatalidad = { code: string; name: string; evento: string; energia: string; controles: Control[] };

export const RF: RiesgoFatalidad[] = [
  {
    "code": "RF01",
    "name": "Energía eléctrica",
    "evento": "Interacción con energía eléctrica",
    "energia": "Eléctrica",
    "controles": [
      {
        "code": "CCP1",
        "text": "Personal acreditado para trabajos eléctricos"
      },
      {
        "code": "CCP2",
        "text": "Acceso restringido a equipos e instalaciones eléctricas"
      },
      {
        "code": "CCP3",
        "text": "Equipos y herramientas eléctricas verificadas"
      },
      {
        "code": "CCP4",
        "text": "Intervención de equipos en condición eléctricamente segura"
      },
      {
        "code": "CCM1",
        "text": "Selección y uso de EPP específico para la actividad"
      },
      {
        "code": "CCM2",
        "text": "Protecciones eléctricas en sistemas de alta y media tensión"
      },
      {
        "code": "CCM3",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF02",
    "name": "Trabajo en altura",
    "evento": "Pérdida de equilibrio en altura física",
    "energia": "Mecánica: potencial gravitatoria + cinética",
    "controles": [
      {
        "code": "CCP1",
        "text": "Plataformas y superficies de trabajo estables e íntegras"
      },
      {
        "code": "CCP2",
        "text": "Personal acreditado realiza trabajos en altura"
      },
      {
        "code": "CCM1",
        "text": "Uso correcto de sistema personal para detención de caídas (SPDC)"
      },
      {
        "code": "CCM2",
        "text": "Puntos de anclaje y líneas de vida"
      },
      {
        "code": "CCM3",
        "text": "Capacidad de rescate en suspensión"
      }
    ]
  },
  {
    "code": "RF03",
    "name": "Maniobras de izaje",
    "evento": "Pérdida de control de maniobras de izaje",
    "energia": "Mecánica: potencial gravitatoria + cinética; hidráulica, potencial elástica y eléctricas",
    "controles": [
      {
        "code": "CCP1",
        "text": "Equipos y elementos de izaje conforme a especificaciones técnicas"
      },
      {
        "code": "CCP2",
        "text": "Estabilizadores operativos y posicionamiento seguro de equipos de izaje móviles"
      },
      {
        "code": "CCP3",
        "text": "Personal acreditado para maniobras de izaje"
      },
      {
        "code": "CCP4",
        "text": "Comunicación bidireccional efectiva entre operador y rigger"
      },
      {
        "code": "CCP5",
        "text": "Plan de izaje"
      },
      {
        "code": "CCM1",
        "text": "Segregación y control de acceso en área de maniobras"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF04",
    "name": "Liberación descontrolada de energías",
    "evento": "Pérdida de control de energías (hidráulica, neumática, mecánica, potencial, entre otras)",
    "energia": "Hidráulica, neumática, mecánica, potencial, entre otras",
    "controles": [
      {
        "code": "CCP1",
        "text": "Identificación, aislación, bloqueo y verificación de energía cero"
      },
      {
        "code": "CCP2",
        "text": "Sistemas y elementos de contención de energía"
      },
      {
        "code": "CCP3",
        "text": "Dispositivos de protección y alivio de presión"
      },
      {
        "code": "CCM1",
        "text": "Segregación y control de acceso"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF05",
    "name": "Caída de rocas en mina rajo",
    "evento": "Pérdida de control de rocas en operaciones mineras a cielo abierto",
    "energia": "Mecánica: cinética, gravitatoria",
    "controles": [
      {
        "code": "CCP1",
        "text": "Modelo y monitoreo geotécnico de estabilidad de taludes y bancos"
      },
      {
        "code": "CCP2",
        "text": "Saneamiento y limpieza de bermas y taludes"
      },
      {
        "code": "CCP3",
        "text": "Control topográfico y drenaje"
      },
      {
        "code": "CCM1",
        "text": "Segregación física y contención estructural"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF06",
    "name": "Incendio",
    "evento": "Pérdida de control de variables del fuego",
    "energia": "Química / calórica",
    "controles": [
      {
        "code": "CCP1",
        "text": "Mapeo de áreas críticas y gestión de materiales combustibles e inflamables"
      },
      {
        "code": "CCP2",
        "text": "Control de trabajos en caliente"
      },
      {
        "code": "CCP3",
        "text": "Sistemas de protección contra fuentes de ignición"
      },
      {
        "code": "CCM1",
        "text": "Sistemas de detección y extinción de incendios"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencias"
      }
    ]
  },
  {
    "code": "RF07",
    "name": "Sustancias peligrosas",
    "evento": "Pérdida de control del manejo de sustancias químicas peligrosas",
    "energia": "Química / bioquímica",
    "controles": [
      {
        "code": "CCP1",
        "text": "Diseño, operación y señalización en procesos de manejo y almacenamiento de sustancias químicas peligrosas"
      },
      {
        "code": "CCP2",
        "text": "Competencias para manipulación segura de sustancias peligrosas"
      },
      {
        "code": "CCP3",
        "text": "Aislación, bloqueo y segregación para sustancias peligrosas"
      },
      {
        "code": "CCM1",
        "text": "Sistemas de detección / control de fugas, derrames, incendios y EPP químicos"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencia química"
      }
    ]
  },
  {
    "code": "RF08",
    "name": "Tronaduras y explosivos",
    "evento": "Pérdida de control del proceso de tronadura",
    "energia": "Físico-química",
    "controles": [
      {
        "code": "CCP1",
        "text": "Personal acreditado en tronadura y manejo de explosivos"
      },
      {
        "code": "CCP2",
        "text": "Tronaduras ejecutadas según diseño aprobado"
      },
      {
        "code": "CCP3",
        "text": "Diseño y ejecución de tronadura conforme a condiciones reales"
      },
      {
        "code": "CCP4",
        "text": "Aislación física y evacuación segura de la zona de tronadura"
      },
      {
        "code": "CCP5",
        "text": "Vehículos acreditados y seguros para transporte y fabricación de explosivos"
      },
      {
        "code": "CCM1",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF09",
    "name": "Partes móviles",
    "evento": "Interacción con partes móviles",
    "energia": "Mecánica",
    "controles": [
      {
        "code": "CCP1",
        "text": "Guardas y protecciones en partes móviles"
      },
      {
        "code": "CCP2",
        "text": "Aislación, bloqueo y verificación de energía cero"
      },
      {
        "code": "CCM1",
        "text": "Sistema de parada de emergencia"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF10",
    "name": "Vehículos",
    "evento": "Pérdida de control del vehículo",
    "energia": "Cinética",
    "controles": [
      {
        "code": "CCP1",
        "text": "Conductor acreditado y apto física y psicológicamente"
      },
      {
        "code": "CCP2",
        "text": "Integridad mecánica y sistemas activos del vehículo"
      },
      {
        "code": "CCP3",
        "text": "Sistema integral de asistencia y monitoreo a la conducción"
      },
      {
        "code": "CCP4",
        "text": "Infraestructura vial conforme a diseño"
      },
      {
        "code": "CCM1",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF11",
    "name": "Espacios confinados",
    "evento": "Interacción con espacios confinados",
    "energia": "Química, térmica, mecánica",
    "controles": [
      {
        "code": "CCP1",
        "text": "Sistema de ingreso controlado y vigilado"
      },
      {
        "code": "CCP2",
        "text": "Evaluación y monitoreo de atmósfera"
      },
      {
        "code": "CCP3",
        "text": "Identificación y preparación de espacios confinados"
      },
      {
        "code": "CCM1",
        "text": "Capacidad de respuesta y rescate ante emergencia en espacios confinados"
      }
    ]
  },
  {
    "code": "RF13",
    "name": "Caída de objetos",
    "evento": "Pérdida de control de objetos en altura",
    "energia": "Mecánica gravitacional",
    "controles": [
      {
        "code": "CCP1",
        "text": "Estructuras y materiales sujetos en altura"
      },
      {
        "code": "CCP2",
        "text": "Control de trabajos en la vertical"
      },
      {
        "code": "CCM1",
        "text": "Sistemas de contención y segregación"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF20",
    "name": "Sílice",
    "evento": "Pérdida de control de fuentes de emisión de polvo",
    "energia": "Química / bioquímica",
    "controles": [
      {
        "code": "CCP1",
        "text": "Supresión, humectación, colección y confinamiento de fuentes"
      },
      {
        "code": "CCP2",
        "text": "Control de emisiones en equipos productivos"
      },
      {
        "code": "CCM1",
        "text": "Ventilación subterránea y presurización de cabinas e instalaciones"
      },
      {
        "code": "CCM2",
        "text": "Aseo industrial no contaminante (control de dispersión)"
      },
      {
        "code": "CCM3",
        "text": "Protección respiratoria efectiva"
      }
    ]
  },
  {
    "code": "RF22",
    "name": "Falla de estructuras para tránsito",
    "evento": "Pérdida de control de estructuras para tránsito y uso de personas",
    "energia": "Mecánica: dinámica + cinética + potencial gravitatoria; deformación",
    "controles": [
      {
        "code": "CCP1",
        "text": "Diseño estructural y construcción de ETP conforme a normativa técnica vigente"
      },
      {
        "code": "CCP2",
        "text": "Inspección visual para identificar condiciones de riesgo a las personas en ETP operativas"
      },
      {
        "code": "CCP3",
        "text": "Restitución de funcionalidad segura y conservación de las ETP operativas"
      },
      {
        "code": "CCM1",
        "text": "Segregación física y señalización de ETP con vanos abiertos o condiciones de riesgo"
      },
      {
        "code": "CCM2",
        "text": "Respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF24",
    "name": "Taludes",
    "evento": "Pérdida de control de la estabilidad del talud",
    "energia": "Mecánica: cinética gravitatoria",
    "controles": [
      {
        "code": "CCP1",
        "text": "Sistema integral de caracterización, modelamiento y monitoreo geotécnico"
      },
      {
        "code": "CCP2",
        "text": "Perforación y tronadura conforme a diseño geotécnico (control de daño)"
      },
      {
        "code": "CCP3",
        "text": "Estabilización conforme a diseño geotécnico (saneamiento y fortificación de taludes)"
      },
      {
        "code": "CCM1",
        "text": "Pretiles y segregación de áreas"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF25",
    "name": "Equipos mineros e industriales",
    "evento": "Pérdida de control de equipos mineros e industriales",
    "energia": "Cinética",
    "controles": [
      {
        "code": "CCP1",
        "text": "Conductor acreditado y apto física y psicológicamente"
      },
      {
        "code": "CCP2",
        "text": "Sistema integral de asistencia y monitoreo a la conducción"
      },
      {
        "code": "CCP3",
        "text": "Integridad de componentes críticos del equipo (mecánicos, hidráulicos y eléctricos)"
      },
      {
        "code": "CCP4",
        "text": "Infraestructura vial conforme a diseño (bermas, pretiles, radios, drenaje)"
      },
      {
        "code": "CCM1",
        "text": "Cabinas de protección (ROPS y FOPS)"
      },
      {
        "code": "CCM2",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF26",
    "name": "Equipos autónomos",
    "evento": "Pérdida de control de equipos autónomos",
    "energia": "Cinética",
    "controles": [
      {
        "code": "CCP1",
        "text": "Sistemas ODS y GPS (navegación segura del equipo autónomo)"
      },
      {
        "code": "CCP2",
        "text": "Frenos, dirección, neumáticos y sistemas tecnológicos en condición segura"
      },
      {
        "code": "CCP3",
        "text": "Personal acreditado para operar y supervisar equipos autónomos"
      },
      {
        "code": "CCP4",
        "text": "Infraestructura vial para equipos autónomos (rutas, tránsito y control de acceso)"
      },
      {
        "code": "CCM1",
        "text": "Capacidad de respuesta ante emergencia y parada de emergencia"
      }
    ]
  },
  {
    "code": "RF27",
    "name": "Atropello",
    "evento": "Interacción de personas con equipos / vehículos",
    "energia": "Cinética",
    "controles": [
      {
        "code": "CCP1",
        "text": "Rutas vehiculares y peatonales conforme a diseño (segregación, señalética, iluminación)"
      },
      {
        "code": "CCP2",
        "text": "Sistema anti atropello y advertencia de proximidad"
      },
      {
        "code": "CCP3",
        "text": "Alta visibilidad en personas, vehículos y equipos"
      },
      {
        "code": "CCP4",
        "text": "Comunicación bidireccional efectiva entre personal y conductores"
      },
      {
        "code": "CCM1",
        "text": "Capacidad de respuesta ante emergencia"
      }
    ]
  },
  {
    "code": "RF29",
    "name": "Caída a cuerpos líquidos",
    "evento": "Caída a cuerpos líquidos",
    "energia": "Cinética + potencial gravitatoria",
    "controles": [
      {
        "code": "CCP1",
        "text": "Zonas de cuerpos líquidos aisladas y señalizadas"
      },
      {
        "code": "CCP2",
        "text": "Personal capacitado para trabajos en cuerpos líquidos"
      },
      {
        "code": "CCP3",
        "text": "Infraestructura segura y comunicación operativa en cuerpos líquidos"
      },
      {
        "code": "CCM1",
        "text": "Capacidad de respuesta y rescate ante emergencia en cuerpos líquidos"
      }
    ]
  },
  {
    "code": "RF30",
    "name": "Tiro y arrastre",
    "evento": "Pérdida de control de maniobras de tiro y arrastre",
    "energia": "Mecánica",
    "controles": [
      {
        "code": "CCP1",
        "text": "Sistemas de tiro y arrastre íntegros y operativos antes de uso"
      },
      {
        "code": "CCP2",
        "text": "Dispositivos de seguridad instalados y operativos en maniobras de arrastre"
      },
      {
        "code": "CCP3",
        "text": "Accesorios de arrastre certificados y áreas de maniobra señalizadas"
      },
      {
        "code": "CCM1",
        "text": "Barreras físicas instaladas para contener fallas de arrastre"
      },
      {
        "code": "CCM2",
        "text": "Respuesta inmediata ante emergencias en maniobras de arrastre"
      }
    ]
  },
  {
    "code": "RF31",
    "name": "Incendio de equipos mineros e industriales",
    "evento": "Pérdida de control de variables del fuego en equipos mineros e industriales",
    "energia": "Calórica",
    "controles": [
      {
        "code": "CCP1",
        "text": "Operador acreditado y apto física/psicológicamente"
      },
      {
        "code": "CCP2",
        "text": "Integridad de sistemas eléctricos, hidráulicos, combustible y lubricación"
      },
      {
        "code": "CCM1",
        "text": "Sistema de detección y supresión de incendios"
      },
      {
        "code": "CCM2",
        "text": "Respuesta inmediata ante incendio en equipo"
      }
    ]
  }
];

export const RF_BY_CODE: Record<string, RiesgoFatalidad> = Object.fromEntries(RF.map((r) => [r.code, r]));
