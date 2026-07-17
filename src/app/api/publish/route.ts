import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createHash, timingSafeEqual } from "crypto";
import { PrismaClient } from "@prisma/client";

// Machine-endpoint voor volautomatische publicatie (Agent OS → live):
// artikel in de `content`-tabel (type=BLOG, status=PUBLISHED), pagina direct
// live (revalidate) en klaar voor IndexNow/GSC.
// Auth: Authorization: Bearer *** (vergelijkbaar met IctusGo /api/publish).
// Agent OS levert HTML-body (rendert 1:1 in de blog-pagina via dangerouslySetInnerHTML).

const prisma = new PrismaClient();

function isAuthorized(request: NextRequest): boolean {
  const key = process.env.PUBLISH_API_KEY;
  const auth = request.headers.get("authorization");
  if (key && auth?.startsWith("Bearer ")) {
    const provided = auth.slice(7);
    const a = createHash("sha256").update(provided).digest();
    const b = createHash("sha256").update(key).digest();
    if (timingSafeEqual(a, b)) return true;
  }
  return false;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function deriveExcerpt(text: string, max = 200): string {
  const clean = (text || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  let out = "";
  for (const sent of sentences) {
    const cand = (out + " " + sent).trim();
    if (cand.length > max && out) break;
    out = cand;
  }
  if (!out) out = clean.slice(0, max).replace(/\s+\S*$/, "");
  return out;
}

// Agent OS stuurt `tags` (array) en `seoTitle`/`seoDescription`. De content-tabel
// gebruikt comma-gescheiden `tags`/`keywords`/`metaTitle`/`metaDescription`.
function toCsv(v: unknown): string | null {
  if (Array.isArray(v)) return v.map(String).filter(Boolean).join(",") || null;
  if (typeof v === "string") return v.trim() || null;
  return null;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      slug: requestedSlug,
      excerpt,
      seoTitle,
      seoDescription,
      tags,
      keywords,
      source = "agent-os",
      category,
    } = body as {
      title?: string;
      content?: string;
      slug?: string;
      excerpt?: string;
      seoTitle?: string;
      seoDescription?: string;
      tags?: string[] | string;
      keywords?: string[] | string;
      source?: string;
      category?: string;
    };

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "title en content zijn verplicht" }, { status: 400 });
    }

    const type = category === "kennisbank" || category === "kb" ? "KB" : "BLOG";
    const baseSlug = (requestedSlug?.trim() && slugify(requestedSlug)) || slugify(title);
    if (!baseSlug) {
      return NextResponse.json({ error: "kon geen geldige slug afleiden" }, { status: 400 });
    }

    const plainText = (content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const finalExcerpt = (excerpt?.trim() || seoDescription?.trim() || deriveExcerpt(plainText, 200)) || null;
    const tagCsv = toCsv(tags) ?? toCsv(keywords);
    const kwCsv = toCsv(keywords) ?? toCsv(tags);
    const metaTitle = (seoTitle?.trim() || title.trim()).slice(0, 180);
    const metaDescription = (seoDescription?.trim() || finalExcerpt || "").slice(0, 320);
    const readingTime = Math.max(1, Math.ceil(plainText.split(/\s+/).length / 200));

    const existing = await prisma.content.findUnique({ where: { slug: baseSlug } });
    const isUpdate = !!existing;

    const data = {
      type: type as "BLOG" | "KB",
      status: "PUBLISHED" as const,
      title: title.trim(),
      html: content,
      excerpt: finalExcerpt,
      metaTitle,
      metaDescription,
      keywords: kwCsv,
      tags: tagCsv,
      readingTime,
      author: "Vincent van Munster",
      publishedAt: new Date(),
    };

    if (isUpdate) {
      await prisma.content.update({ where: { slug: baseSlug }, data });
    } else {
      await prisma.content.create({ data: { ...data, slug: baseSlug } });
    }

    const url = `https://vrijwilligersmatch.nl/${type === "KB" ? "kennisbank" : "blog"}/${baseSlug}`;

    // Direct live — niet wachten op ISR-window.
    revalidatePath(`/${type === "KB" ? "kennisbank" : "blog"}`);
    revalidatePath(`/${type === "KB" ? "kennisbank" : "blog"}/${baseSlug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json(
      {
        success: true,
        slug: baseSlug,
        url,
        type,
        source,
        action: isUpdate ? "updated" : "created",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[publish] error:", error);
    return NextResponse.json(
      { error: "Publiceren mislukt", detail: String(error).slice(0, 300) },
      { status: 500 },
    );
  }
}
