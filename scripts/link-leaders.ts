import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("Iniciando vinculación de líderes...");

  const leaders = await prisma.leader.findMany();
  
  for (const leader of leaders) {
    // Si ya tiene youthId, saltar
    if (leader.youthId) continue;

    // Buscar un joven con el mismo primer nombre (ignorar tildes o casos es complicado en JS simple, usaremos exact match o findFirst por nombre)
    const youth = await prisma.youth.findFirst({
      where: {
        firstName: leader.firstName,
        status: 'LEADER'
      }
    });

    if (youth) {
      console.log(`Vinculando Líder ${leader.firstName} con Joven ${youth.firstName} ${youth.lastName}`);
      await prisma.leader.update({
        where: { id: leader.id },
        data: { youthId: youth.id }
      });
    } else {
      console.log(`No se encontró Joven Líder para ${leader.firstName}`);
    }
  }

  console.log("¡Vinculación completada exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
