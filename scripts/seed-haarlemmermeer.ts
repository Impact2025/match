/**
 * scripts/seed-haarlemmermeer.ts
 *
 * Maakt een Haarlemmermeer-gemeente aan in de database + een demo gemeente-admin account.
 * Veilig om meerdere keren uit te voeren (upsert).
 *
 * Gebruik:
 *   pnpm tsx scripts/seed-haarlemmermeer.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("\n🌱  Seeding Haarlemmermeer gemeente data...\n")

  // ── 1. Gemeente ────────────────────────────────────────────────────────────
  await prisma.gemeente.upsert({
    where: { slug: "haarlemmermeer" },
    update: {
      name: "HaarlemmermeerVrijwilligers",
      displayName: "Haarlemmermeer",
      tagline: "Vrijwilligerswerk in Haarlemmermeer & omgeving",
    },
    create: {
      id: "gemeente-haarlemmermeer",
      slug: "haarlemmermeer",
      name: "HaarlemmermeerVrijwilligers",
      displayName: "Haarlemmermeer",
      primaryColor: "#0f4c8a",
      accentColor: "#1d6fc4",
      tagline: "Vrijwilligerswerk in Haarlemmermeer & omgeving",
      website: "https://www.haarlemmermeer.nl",
      contactEmail: "info@haarlemmermeer.nl",
    },
  })
  console.log("✅  Gemeente Haarlemmermeer aangemaakt / bijgewerkt")

  // ── 2. Gemeente admin account ──────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@haarlemmermeer-demo.nl" },
    update: {},
    create: {
      name: "Gemeente Admin Haarlemmermeer",
      email: "admin@haarlemmermeer-demo.nl",
      password: await bcrypt.hash("demo1234", 10),
      role: "GEMEENTE_ADMIN",
      status: "ACTIVE",
      onboarded: true,
      gemeenteSlug: "haarlemmermeer",
    },
  })
  console.log(`✅  Gemeente admin: ${adminUser.email}  (wachtwoord: demo1234)`)

  console.log("\n✅  Klaar!\n")
  console.log("   Subdomain: haarlemmermeer.vrijwilligersmatch.nl")
  console.log("   Admin URL: haarlemmermeer.vrijwilligersmatch.nl/admin/gemeenten/haarlemmermeer")
  console.log("   Login:     admin@haarlemmermeer-demo.nl / demo1234\n")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
