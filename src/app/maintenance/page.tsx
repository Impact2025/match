export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🔧</div>
        <h1 className="text-3xl font-bold text-gray-900">
          We zijn zo terug
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Vrijwilligersmatch is momenteel in onderhoud. We zijn hard bezig om
          de site te verbeteren. Kom snel terug!
        </p>
        <p className="text-sm text-gray-400">
          Vragen? Neem contact op via{" "}
          <a
            href="mailto:info@vrijwilligersmatch.nl"
            className="underline hover:text-gray-600"
          >
            info@vrijwilligersmatch.nl
          </a>
        </p>
      </div>
    </div>
  )
}
