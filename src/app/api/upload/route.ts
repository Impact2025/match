import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return Response.json({ error: "Geen bestand" }, { status: 400 })
  }

  const type = request.nextUrl.searchParams.get("type") ?? "upload"

  // Valideer bestandsgrootte
  const maxSize = type === "vacancyImage" ? 8 * 1024 * 1024 : 4 * 1024 * 1024
  if (file.size > maxSize) {
    return Response.json({ error: "Bestand te groot" }, { status: 400 })
  }

  // Valideer bestandstype
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Alleen afbeeldingen toegestaan" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const filename = `${type}-${session.user.id}-${Date.now()}.${ext}`

  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadDir, { recursive: true })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(path.join(uploadDir, filename), buffer)

  const url = `/uploads/${filename}`

  // Profielfoto direct opslaan in DB
  if (type === "profileImage") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: url },
    })
  }

  return Response.json({ url })
}
