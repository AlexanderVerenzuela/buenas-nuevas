"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { MeetingType, MeetingStatus } from "@prisma/client"

export async function getMeetings() {
  return await prisma.meeting.findMany({
    include: {
      leader: true,
      _count: {
        select: { attendances: true }
      }
    },
    orderBy: { date: "desc" }
  })
}

export async function createMeeting(formData: FormData) {
  const title = formData.get("title") as string
  const type = formData.get("type") as MeetingType
  const dateStr = formData.get("date") as string
  const time = formData.get("time") as string
  const location = formData.get("location") as string
  
  await prisma.meeting.create({
    data: {
      title,
      type: type || MeetingType.GENERAL,
      date: new Date(dateStr),
      time,
      location,
      status: MeetingStatus.SCHEDULED,
    }
  })

  revalidatePath("/meetings")
}

export async function deleteMeeting(id: string) {
  await prisma.meeting.delete({
    where: { id }
  })
  revalidatePath("/meetings")
}
