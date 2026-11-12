// Ronda de preguntas, consultas e inquietudes – criterios acordados con Seguridad
export type Pregunta = { n: number; pregunta: string; respuesta: string };
export const PREGUNTAS: { grupo: string; items: Pregunta[] }[] = [
  {
    "grupo": "Alcance y relación con la ART",
    "items": [
      {
        "n": 1,
        "pregunta": "¿La RIT reemplaza a la ART?",
        "respuesta": "No."
      },
      {
        "n": 2,
        "pregunta": "¿Se registran las mismas actividades de la ART o solo las actividades no rutinarias?",
        "respuesta": "Las mismas actividades de la ART."
      },
      {
        "n": 3,
        "pregunta": "Trabajador único de turno noche (p. ej., capataz mecánico): ¿debe hacer RIT además del COP y la ART?",
        "respuesta": "Sí."
      },
      {
        "n": 4,
        "pregunta": "¿En la RIT solo se registran riesgos de fatalidad? Si una actividad no tiene RF asociado, ¿igual se registra?",
        "respuesta": "Sí, toda actividad se registra, tenga o no RF asociado."
      },
      {
        "n": 5,
        "pregunta": "Si en una actividad planificada en la RIT cambia alguna condición de riesgo, ¿el control se gestiona en la ART?",
        "respuesta": "Sí."
      },
      {
        "n": 6,
        "pregunta": "¿Las condiciones del entorno se registran en el mismo recuadro de riesgos y consecuencias de los RF?",
        "respuesta": "No."
      }
    ]
  },
  {
    "grupo": "Cuándo, dónde y quién",
    "items": [
      {
        "n": 7,
        "pregunta": "¿La cartilla debe enviarse todos los días en la mañana, antes del inicio de las actividades en terreno?",
        "respuesta": "Sí."
      },
      {
        "n": 8,
        "pregunta": "¿Se realiza en terreno con cada cuadrilla o en la charla de 5 minutos previa a salir a terreno?",
        "respuesta": "En la reunión de planificación, antes de salir a terreno."
      },
      {
        "n": 9,
        "pregunta": "Distribución de tiempos: ¿cómo cumple el supervisor si debe asistir a reuniones en paralelo?",
        "respuesta": "Delegando funciones en capataces, líderes o trabajadores."
      },
      {
        "n": 10,
        "pregunta": "¿Se hace una sola RIT con todos los trabajadores o cada supervisor completa una cartilla independiente?",
        "respuesta": "Una RIT por cuadrilla de trabajo."
      },
      {
        "n": 11,
        "pregunta": "¿Cómo se registran las actividades cruzadas entre distintas cuadrillas o empresas contratistas?",
        "respuesta": "Cada empresa o cuadrilla genera su RIT, y se elabora la ART cruzada."
      }
    ]
  },
  {
    "grupo": "Cambios y actividades no planificadas",
    "items": [
      {
        "n": 12,
        "pregunta": "Si cambian las actividades planificadas (p. ej., cambia el área o frente de trabajo), ¿se actualiza y reenvía la cartilla o se hace una nueva RIT?",
        "respuesta": "Se realiza una nueva RIT."
      },
      {
        "n": 13,
        "pregunta": "Actividad nueva no considerada en la mañana (p. ej., a las 16:00 h): ¿se registra en la cartilla original o en un nuevo documento?",
        "respuesta": "Nueva RIT: reunir al personal y planificar la actividad."
      },
      {
        "n": 14,
        "pregunta": "¿Cómo proceder cuando una actividad no planificada debe ejecutarse de manera urgente?",
        "respuesta": "Ninguna urgencia justifica no planificar: se genera una RIT."
      }
    ]
  },
  {
    "grupo": "Formato y soporte",
    "items": [
      {
        "n": 15,
        "pregunta": "¿Debe llenarse en una pizarra, según el documento de apoyo? ¿Se dispondrán pizarras en las instalaciones?",
        "respuesta": "Pizarra, formato digital o papel: lo más efectivo para cada empresa."
      },
      {
        "n": 16,
        "pregunta": "¿Puede hacerse en formato digital y cargarse a la carpeta de la GSSO, declarando así las actividades diarias (similar al COP)?",
        "respuesta": "En proceso de definición con la GCSSO."
      }
    ]
  },
  {
    "grupo": "Llenado de la cartilla",
    "items": [
      {
        "n": 17,
        "pregunta": "¿Los trabajadores en terreno deben portar una copia de la RIT o basta con que quede en poder del supervisor?",
        "respuesta": "La cuadrilla debe mantener una copia en terreno."
      },
      {
        "n": 18,
        "pregunta": "El campo de asistentes («Registro»): ¿corresponde al número de participantes o a un listado con datos y firmas?",
        "respuesta": "Solo el número de asistentes."
      },
      {
        "n": 19,
        "pregunta": "¿El ítem «Instructivos y/o PTS» incluye también los procedimientos?",
        "respuesta": "Sí."
      },
      {
        "n": 20,
        "pregunta": "En el aporte a la gestión de riesgos, ¿quién figura como responsable: el supervisor o quien lo levanta?",
        "respuesta": "El supervisor."
      },
      {
        "n": 21,
        "pregunta": "¿Los reconocimientos (aporte a la gestión de riesgos) se registran a diario o al final del turno?",
        "respuesta": "Al término del turno."
      }
    ]
  }
];
