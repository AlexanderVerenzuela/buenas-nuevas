import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { YouthStatus } from '@prisma/client';

async function main() {
  console.log("Iniciando promoción de líderes...");

  // 1. Eliminar líderes de ejemplo ("Juan Pérez" y "María Gómez" o cualquier líder que no tenga un Youth relacionado si es el caso)
  // Pero como los datos de semilla tenían nombres específicos, vamos a borrarlos todos y recrearlos basados en los jóvenes con status LEADER.
  console.log("Eliminando grupos y líderes antiguos (ejemplos)...");
  await prisma.discipleshipGroup.deleteMany({});
  await prisma.leader.deleteMany({});

  // 2. Cambiar jóvenes que están en 'COMMISSION' a 'LEADER'
  console.log("Actualizando jóvenes de COMMISSION a LEADER...");
  await prisma.youth.updateMany({
    where: {
      status: 'COMMISSION' as YouthStatus
    },
    data: {
      status: 'LEADER'
    }
  });

  // 3. Obtener todos los jóvenes que son líderes (antiguos y recién promovidos)
  const leaderYouths = await prisma.youth.findMany({
    where: {
      status: 'LEADER'
    }
  });

  console.log(`Creando ${leaderYouths.length} perfiles en la tabla Leader...`);

  // 4. Crear su perfil de líder para que aparezcan en el equipo de liderazgo
  for (const youth of leaderYouths) {
    await prisma.leader.create({
      data: {
        firstName: youth.firstName,
        lastName: youth.lastName,
        phone: youth.phone,
        email: youth.email,
        gender: youth.gender,
        birthDate: youth.birthDate,
      }
    });
  }

  console.log("¡Promoción completada exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
