/**
 * Maak (of herstel) het platform-admin account op elke database.
 *
 * Gebruik:
 *   DATABASE_URL="postgresql://..." pnpm tsx scripts/create-admin.ts
 *
 * Of maak een .env.production.local met DATABASE_URL en run:
 *   pnpm dotenv -e .env.production.local -- tsx scripts/create-admin.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const EMAIL = "admin@vrijwilligersmatch.nl"
const PASSWORD = "Admin123!"

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12)

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { password: hash, role: "ADMIN", status: "ACTIVE", onboarded: true },
    create: {
      name: "Platform Admin",
      email: EMAIL,
      password: hash,
      role: "ADMIN",
      status: "ACTIVE",
      onboarded: true,
    },
  })

  console.log(`✅  Admin user klaar: ${user.email}  (wachtwoord: ${PASSWORD})`)
}

main()
  .catch((e) => {
    console.error("❌  Fout:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
