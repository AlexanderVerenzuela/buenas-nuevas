import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { YouthStatus } from '@prisma/client';

const parseDate = (dateStr?: string) => {
  if (!dateStr || dateStr.trim() === '') return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return null;
};

const mapStatus = (tipoStr: string): { status: YouthStatus, observationNote: string } => {
  const t = tipoStr.toLowerCase().trim();
  if (t.includes('miembro')) return { status: 'MEMBER', observationNote: '' };
  if (t.includes('nuevo')) return { status: 'NEW', observationNote: '' };
  if (t.includes('comisión') || t.includes('comision')) return { status: 'COMMISSION', observationNote: '' };
  if (t.includes('prédica') || t.includes('predica')) return { status: 'PREACHING', observationNote: '' };
  if (t.includes('familiar')) return { status: 'FAMILY', observationNote: '' };
  if (t.includes('visita')) return { status: 'VISITOR', observationNote: '' };
  
  // Por defecto
  return { status: 'VISITOR', observationNote: `[Tipo Original: ${tipoStr}]` };
};

const youthData = [
  { Nombre: "Aaron", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Sobrino de Maite" },
  { Nombre: "Adrián", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Primo de Jesús" },
  { Nombre: "Aitana", Cumpleaños: "24/11/2024", Teléfono: "918 399 476", Tipo: "Miembro", Notas: "" },
  { Nombre: "Alberto", Cumpleaños: "22/03/2025", Teléfono: "", Tipo: "Miembro", Notas: "Nuevo" },
  { Nombre: "Aldair", Cumpleaños: "", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Alexander", Cumpleaños: "10/09/2025", Teléfono: "973 099 649", Tipo: "Comisión", Notas: "" },
  { Nombre: "Amigo de Christian", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "" },
  { Nombre: "Amir", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "Primo de Joao y Leonardo" },
  { Nombre: "Analucía", Cumpleaños: "01/04/2025", Teléfono: "923 604 712", Tipo: "Miembro", Notas: "" },
  { Nombre: "Anderson", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Nuevo, adolescente" },
  { Nombre: "Anderson ", Cumpleaños: "02/12/2024", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Andrea", Cumpleaños: "20/02/2025", Teléfono: "", Tipo: "Comisión", Notas: "" },
  { Nombre: "Andreita", Cumpleaños: "24/08/2025", Teléfono: "", Tipo: "Miembro", Notas: "Nieta de la hna Ana María T." },
  { Nombre: "Belén", Cumpleaños: "21/06/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Benjamín", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Nuevo" },
  { Nombre: "Camila", Cumpleaños: "05/07/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Carlos", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Invitado de hno Guillermo" },
  { Nombre: "Christian", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "Trajecito" },
  { Nombre: "César", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Invitado de hno Guillermo" },
  { Nombre: "César ", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "" },
  { Nombre: "Daniel", Cumpleaños: "", Teléfono: "", Tipo: "Miembro", Notas: "Hermano de Sofía" },
  { Nombre: "Daniela", Cumpleaños: "12/08/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Deciderio", Cumpleaños: "22/07/2025", Teléfono: "", Tipo: "Comisión", Notas: "" },
  { Nombre: "Diego", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Nuevo" },
  { Nombre: "Diego S", Cumpleaños: "11/12/2024", Teléfono: "", Tipo: "Miembro", Notas: "Hijo de Miguel" },
  { Nombre: "Dylan", Cumpleaños: "14/01/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Edward", Cumpleaños: "20/02/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Emilia", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Camote" },
  { Nombre: "Emmanuel", Cumpleaños: "06/03/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Ernesto", Cumpleaños: "03/12/2024", Teléfono: "", Tipo: "Comisión", Notas: "" },
  { Nombre: "Fabiano", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Sobrino de Maite" },
  { Nombre: "Facundo", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "Amigo de Daniel" },
  { Nombre: "Gabriela", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "" },
  { Nombre: "Hermana de Valeria J.", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Hijo de Mabel", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Hijo de Mabel" },
  { Nombre: "Hijo de Mabel 2", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Hijo de Mabel 2" },
  { Nombre: "Hna Cristina", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Hna Ricardina", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Hna Rocío", Cumpleaños: "27/06/2025", Teléfono: "", Tipo: "Prédica", Notas: "" },
  { Nombre: "Hno Guillermo", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Hno Michael", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Hno. Joseph", Cumpleaños: "", Teléfono: "", Tipo: "Prédica", Notas: "" },
  { Nombre: "Itatie", Cumpleaños: "11/04/2025", Teléfono: "936 426 002", Tipo: "Miembro", Notas: "" },
  { Nombre: "Jeremy", Cumpleaños: "25/02/2025", Teléfono: "", Tipo: "Comisión", Notas: "" },
  { Nombre: "Jesús", Cumpleaños: "27/06/2025", Teléfono: "", Tipo: "Comisión", Notas: "" },
  { Nombre: "Joao", Cumpleaños: "17/01/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Joaquín", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "Hermano de Facundo" },
  { Nombre: "Katherine", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Amiga de Belén" },
  { Nombre: "Keren", Cumpleaños: "06/09/2025", Teléfono: "", Tipo: "Nuevo", Notas: "Prima de Itatie" },
  { Nombre: "Kevin", Cumpleaños: "", Teléfono: "939 061 998", Tipo: "Miembro", Notas: "Nuevo 16/11" },
  { Nombre: "Leonardo", Cumpleaños: "08/06/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Linda", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Amiga de Belén" },
  { Nombre: "Lucy", Cumpleaños: "17/07/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Luis", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Amigo de Yamile" },
  { Nombre: "Maité", Cumpleaños: "13/05/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Mamá de Gabriela y Yamile", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Marco", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Hermano de hna Cristina" },
  { Nombre: "Mia", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Camote" },
  { Nombre: "Milagros", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Cuñada de la hna Cristina" },
  { Nombre: "Miriam", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Amiga de Belén" },
  { Nombre: "Papá de Alice", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Papá de Benjamín", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Papá de Gabriela y Yamile", Cumpleaños: "", Teléfono: "", Tipo: "Familiar", Notas: "" },
  { Nombre: "Priscila", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "" },
  { Nombre: "Ps Daniel", Cumpleaños: "19/10/2025", Teléfono: "", Tipo: "Comisión, Prédica", Notas: "" },
  { Nombre: "Ray", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Sobrino de hna Melissa" },
  { Nombre: "Ronald", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Amigo de Deciderio" },
  { Nombre: "Santiago", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Hermano de Aitana" },
  { Nombre: "Sebastián", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "Primo de Joao y Leo" },
  { Nombre: "Serena", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Amiga de Miriam" },
  { Nombre: "Sergio", Cumpleaños: "04/08/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Sofía", Cumpleaños: "21/08/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Susan", Cumpleaños: "29/12/2024", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Tiara", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Amiga de Itatie" },
  { Nombre: "Tracy", Cumpleaños: "28/06/2025", Teléfono: "", Tipo: "Nuevo", Notas: "Amiga de Itatie" },
  { Nombre: "Valentina", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Hermana de Andrea" },
  { Nombre: "Valeria A.", Cumpleaños: "14/02/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Valeria J.", Cumpleaños: "08/11/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Walter", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Walter Pampa chica" },
  { Nombre: "Yamile", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Hermana de Aitana" },
  { Nombre: "Yamilet", Cumpleaños: "", Teléfono: "", Tipo: "Nuevo", Notas: "Sobrina hno Enrique" },
  { Nombre: "Yan ker", Cumpleaños: "18/05/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Yuliet", Cumpleaños: "", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Yuriko", Cumpleaños: "", Teléfono: "", Tipo: "Visita", Notas: "Amiga de Belén" },
  { Nombre: "Zacarías", Cumpleaños: "04/10/2025", Teléfono: "", Tipo: "Miembro", Notas: "" },
  { Nombre: "Ángela", Cumpleaños: "08/12/2024", Teléfono: "", Tipo: "Miembro", Notas: "" }
];

async function main() {
  console.log("Iniciando migración de datos...");

  // 1. Limpiar jóvenes actuales
  console.log("Eliminando datos anteriores...");
  await prisma.youth.deleteMany({});
  
  // 2. Insertar nuevos jóvenes
  console.log(`Insertando ${youthData.length} jóvenes...`);
  
  for (const youth of youthData) {
    const { status, observationNote } = mapStatus(youth.Tipo);
    
    // Unir notas si hay
    let finalObservations = youth.Notas.trim();
    if (observationNote) {
      finalObservations = finalObservations 
        ? `${observationNote}\n${finalObservations}` 
        : observationNote;
    }

    const birthDate = parseDate(youth.Cumpleaños);
    
    // Tratamos de separar nombres (muy básico para esta data)
    const nameParts = youth.Nombre.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    await prisma.youth.create({
      data: {
        firstName,
        lastName,
        phone: youth.Teléfono.trim() || null,
        birthDate: birthDate,
        status: status,
        observations: finalObservations || null,
      }
    });
  }

  console.log("¡Migración completada exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
