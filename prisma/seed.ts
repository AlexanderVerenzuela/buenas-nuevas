import "dotenv/config"
import { PrismaClient, Role, YouthStatus, MeetingType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando el sembrado (seed) de la base de datos...')

  // 1. Limpiar BD (opcional en desarrollo, útil para no duplicar en múltiples corridas)
  await prisma.attendance.deleteMany()
  await prisma.followUp.deleteMany()
  await prisma.youth.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.discipleshipGroup.deleteMany()
  await prisma.leader.deleteMany()
  await prisma.user.deleteMany()

  // 2. Crear Admin General
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@juventud.com',
      password: adminPassword,
      name: 'Admin Principal',
      role: Role.ADMIN,
    },
  })
  console.log('Admin creado:', adminUser.email)

  // 3. Crear 2 Líderes con sus Usuarios
  const leaderPassword = await bcrypt.hash('lider123', 10)
  
  const userLeader1 = await prisma.user.create({
    data: {
      email: 'juan@juventud.com',
      password: leaderPassword,
      name: 'Juan Pérez',
      role: Role.LEADER,
    },
  })
  const leader1 = await prisma.leader.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez',
      userId: userLeader1.id,
    },
  })

  const userLeader2 = await prisma.user.create({
    data: {
      email: 'maria@juventud.com',
      password: leaderPassword,
      name: 'María Gómez',
      role: Role.LEADER,
    },
  })
  const leader2 = await prisma.leader.create({
    data: {
      firstName: 'María',
      lastName: 'Gómez',
      userId: userLeader2.id,
    },
  })
  console.log('Líderes creados: Juan y María')

  // 4. Crear 2 Grupos de Discipulado
  const group1 = await prisma.discipleshipGroup.create({
    data: {
      name: 'Grupo Raíces',
      meetingDay: 'Martes',
      meetingTime: '19:00',
      leaderId: leader1.id,
    }
  })

  const group2 = await prisma.discipleshipGroup.create({
    data: {
      name: 'Grupo Fuego',
      meetingDay: 'Jueves',
      meetingTime: '20:00',
      leaderId: leader2.id,
    }
  })

  // 5. Crear 12 Jóvenes (asignados a los grupos)
  const youthData = [
    { firstName: 'Carlos', lastName: 'Ruiz', status: YouthStatus.MEMBER, leaderId: leader1.id, groupId: group1.id },
    { firstName: 'Ana', lastName: 'López', status: YouthStatus.MEMBER, leaderId: leader1.id, groupId: group1.id },
    { firstName: 'Pedro', lastName: 'Díaz', status: YouthStatus.NEW, leaderId: leader1.id, groupId: group1.id },
    { firstName: 'Lucía', lastName: 'Martínez', status: YouthStatus.VISITOR, leaderId: leader1.id, groupId: group1.id },
    { firstName: 'Miguel', lastName: 'Torres', status: YouthStatus.MEMBER, leaderId: leader1.id, groupId: group1.id },
    { firstName: 'Sofía', lastName: 'Flores', status: YouthStatus.INACTIVE, leaderId: leader1.id, groupId: group1.id },
    
    { firstName: 'David', lastName: 'Ramírez', status: YouthStatus.MEMBER, leaderId: leader2.id, groupId: group2.id },
    { firstName: 'Laura', lastName: 'Herrera', status: YouthStatus.MEMBER, leaderId: leader2.id, groupId: group2.id },
    { firstName: 'Jorge', lastName: 'Castro', status: YouthStatus.NEW, leaderId: leader2.id, groupId: group2.id },
    { firstName: 'Elena', lastName: 'Vargas', status: YouthStatus.VISITOR, leaderId: leader2.id, groupId: group2.id },
    { firstName: 'Daniel', lastName: 'Rojas', status: YouthStatus.MEMBER, leaderId: leader2.id, groupId: group2.id },
    { firstName: 'Carmen', lastName: 'Molina', status: YouthStatus.INACTIVE, leaderId: leader2.id, groupId: group2.id },
  ]

  const createdYouth = await Promise.all(
    youthData.map(data => prisma.youth.create({ data }))
  )
  console.log('12 Jóvenes creados.')

  // 6. Crear 3 Reuniones Generales
  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'Reunión General - Semana 1',
      type: MeetingType.GENERAL,
      date: new Date(new Date().setDate(new Date().getDate() - 14)), // Hace 2 semanas
    }
  })
  
  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'Reunión General - Semana 2',
      type: MeetingType.GENERAL,
      date: new Date(new Date().setDate(new Date().getDate() - 7)), // Hace 1 semana
    }
  })

  const meeting3 = await prisma.meeting.create({
    data: {
      title: 'Reunión General - Actual',
      type: MeetingType.GENERAL,
      date: new Date(), // Hoy
    }
  })
  console.log('3 Reuniones creadas.')

  console.log('¡Seed completado con éxito!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
