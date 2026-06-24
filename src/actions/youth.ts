"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { YouthStatus, DiscipleshipStatus } from "@prisma/client"

export async function getYouth() {
  return await prisma.youth.findMany({
    include: {
      leader: true,
      group: true,
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function createYouth(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const status = formData.get("status") as YouthStatus
  
  const existingYouth = await prisma.youth.findFirst({
    where: { firstName, lastName }
  })

  if (existingYouth) {
    return { error: "Este joven ya está registrado en el sistema." }
  }

  const newYouth = await prisma.youth.create({
    data: {
      firstName,
      lastName,
      phone,
      email,
      status: status || YouthStatus.VISITOR,
    }
  })

  // Sincronizar Líder
  if (status === "LEADER") {
    await prisma.leader.create({
      data: {
        youthId: newYouth.id,
        firstName: newYouth.firstName,
        lastName: newYouth.lastName,
        phone: newYouth.phone,
        email: newYouth.email,
        gender: newYouth.gender,
        birthDate: newYouth.birthDate,
      }
    })
  }

  revalidatePath("/youth")
  revalidatePath("/leaders")
  return { success: true }
}

export async function deleteYouth(id: string) {
  await prisma.youth.delete({
    where: { id }
  })
  revalidatePath("/youth")
}

export async function getYouthById(id: string) {
  return await prisma.youth.findUnique({
    where: { id },
    include: {
      leader: true,
      group: true,
      attendances: {
        include: { meeting: true },
        orderBy: { meeting: { date: "desc" } },
        take: 10
      },
      followUps: {
        include: { leader: true },
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  })
}

export async function updateYouthNotes(id: string, formData: FormData) {
  const notes = formData.get("notes") as string
  
  await prisma.youth.update({
    where: { id },
    data: { observations: notes }
  })
  
  revalidatePath(`/youth/${id}`)
}

export async function updateYouthInfo(id: string, formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const birthDateStr = formData.get("birthDate") as string
  const status = formData.get("status") as YouthStatus
  
  let birthDate = null
  if (birthDateStr) {
    birthDate = new Date(birthDateStr)
  }

  await prisma.youth.update({
    where: { id },
    data: {
      firstName,
      lastName,
      phone: phone || null,
      birthDate,
      status
    }
  })

  revalidatePath(`/youth/${id}`)
  revalidatePath(`/youth`)
}
