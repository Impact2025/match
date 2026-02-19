import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateOrgDescription } from "@/lib/ai"

export async function POST(req: Request) {
  const session = await auth()
  const user = session?.user as { id?: string; role?: string } | undefined

  if (!user?.id) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
  }
  if (user.role !== "ORGANISATION") {
    return NextResponse.json({ error: "Alleen voor organisaties" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { name, categories } = body as { name?: string; categories?: string[] }

    if (!name || !categories?.length) {
      return NextResponse.json(
        { error: "Naam en categorieën zijn verplicht" },
        { status: 400 }
      )
    }

    const description = await generateOrgDescription(name, categories)
    return NextResponse.json({ description })
  } catch (error) {
    console.error("[ORG_DESCRIPTION_ERROR]", error)
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 })
  }
}
