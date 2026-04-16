export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Clock, MapPin, Video, LogIn } from "lucide-react"
import { CheckInButton } from "@/components/activities/checkin-button"

export default async function CheckInPage({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = await params
  const session = await auth()

  const activity = await prisma.groupActivity.findUnique({
    where: { qrToken },
    include: {
      organisation: { select: { name: true, logo: true } },
      registrations: {
        where: session?.user?.id ? { volunteerId: session.user.id } : { id: "" },
        select: { id: true, status: true, checkedInAt: true },
      },
    },
  })

  if (!activity) notFound()

  const myRegistration = activity.registrations[0] ?? null
  const isAlreadyCheckedIn = myRegistration?.checkedInAt !== null && myRegistration?.checkedInAt !== undefined
  const isAttended = myRegistration?.status === "ATTENDED"

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            {isAlreadyCheckedIn ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : (
              <Clock className="w-8 h-8 text-white" />
            )}
          </div>
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1">
            {isAlreadyCheckedIn ? "Aanwezig!" : "Check-in"}
          </p>
          <h1 className="text-xl font-bold leading-snug">{activity.title}</h1>
        </div>

        {/* Activiteitsinfo */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>
              {new Date(activity.startDateTime).toLocaleDateString("nl-NL", {
                weekday: "long", day: "numeric", month: "long",
              })}{" "}
              · {new Date(activity.startDateTime).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}–
              {new Date(activity.endDateTime).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {activity.online ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>Online</span>
            </div>
          ) : activity.city ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{[activity.location, activity.city].filter(Boolean).join(" · ")}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            {activity.organisation.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activity.organisation.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
            )}
            <span className="text-sm text-gray-500">{activity.organisation.name}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-6 space-y-3">
          {!session?.user ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">Log in om je aanwezigheid te bevestigen</p>
              <Link
                href={`/login?callbackUrl=/checkin/${qrToken}`}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Inloggen en check-in
              </Link>
            </div>
          ) : isAlreadyCheckedIn || isAttended ? (
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-green-700 font-semibold text-sm">Je bent aanwezig gemeld!</p>
              {myRegistration?.checkedInAt && (
                <p className="text-xs text-gray-400">
                  Ingeschreven om {new Date(myRegistration.checkedInAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          ) : !myRegistration ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-red-500 font-medium">Je bent niet aangemeld voor deze activiteit</p>
              <Link href={`/activiteiten/${activity.id}`} className="text-sm text-orange-600 hover:underline">
                Naar de activiteitspagina →
              </Link>
            </div>
          ) : myRegistration.status === "WAITLISTED" ? (
            <p className="text-center text-sm text-amber-600 font-medium">Je staat op de wachtlijst</p>
          ) : myRegistration.status === "CANCELLED" ? (
            <p className="text-center text-sm text-red-500 font-medium">Je aanmelding is geannuleerd</p>
          ) : (
            <CheckInButton activityId={activity.id} qrToken={qrToken} />
          )}

          <Link
            href="/activiteiten"
            className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Terug naar activiteiten
          </Link>
        </div>
      </div>
    </div>
  )
}
