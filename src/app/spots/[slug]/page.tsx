import { notFound } from "next/navigation";
import { AlertTriangle, ExternalLink, Waves, Wind } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RatingCard } from "@/components/RatingCard";
import { getSpotWithForecast } from "@/lib/rankings";
import { regionLabel } from "@/lib/i18n";

function spotTypeLabel(type: string) {
  const labels: Record<string, string> = {
    flat: "Flachwasser",
    chop: "Kabbelwasser",
    wave: "Welle"
  };
  return labels[type] ?? type;
}

function translateSpotNote(note?: string | null) {
  if (!note) return "";
  const translations: Record<string, string> = {
    "Respect marked bathing zones during summer.": "Markierte Badezonen im Sommer beachten.",
    "Nature protection zones must be observed year-round.": "Naturschutzzonen muessen ganzjaehrig beachtet werden.",
    "Use official kite zones and respect reed beds.": "Offizielle Kitezonen nutzen und Schilfbereiche respektieren.",
    "Follow campsite and beach zone rules.": "Campingplatz- und Strandzonenregeln beachten.",
    "Observe protected coastal zones.": "Geschuetzte Kuestenzonen beachten.",
    "Summer bathing zones and lifeguard rules apply.": "Sommerliche Badezonen und Rettungsschwimmer-Regeln beachten.",
    "Respect national park and bathing zone rules.": "Nationalpark- und Badezonenregeln beachten.",
    "Respect bathing areas and local water sport zones.": "Badebereiche und lokale Wassersportzonen beachten.",
    "Respect bathing zones and local launch markings.": "Badezonen und lokale Startmarkierungen beachten.",
    "Respect marina, sailing, and event zones.": "Hafen-, Segel- und Veranstaltungszonen beachten.",
    "Bathing zones are relevant in summer.": "Badezonen sind im Sommer relevant.",
    "Respect beach, bathing, and national park rules.": "Strand-, Bade- und Nationalparkregeln beachten.",
    "Nature protection zones around Monchgut must be observed.": "Naturschutzzonen rund um Moenchgut beachten.",
    "Bathing zones and beach rules apply.": "Badezonen und Strandregeln beachten.",
    "Respect harbor, beach, and national park restrictions.": "Hafen-, Strand- und Nationalparkbeschraenkungen beachten.",
    "National park and beach zones are strict.": "Nationalpark- und Strandzonen sind streng geregelt.",
    "Beach zones, events, and nature rules apply.": "Strandzonen, Veranstaltungen und Naturschutzregeln beachten.",
    "Local rules and bathing zones apply.": "Lokale Regeln und Badezonen beachten.",
    "Large campsite area with beach access.": "Grosser Campingbereich mit Strandzugang.",
    "Deep lake with thermal and storm wind patterns.": "Tiefer See mit Thermik- und Sturmwindmustern.",
    "Deep lake, wind quality depends on launch side.": "Tiefer See, Windqualitaet haengt von der Startseite ab."
  };
  return translations[note] ?? note;
}

export default async function SpotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSpotWithForecast(slug);
  if (!data) notFound();

  const { spot, ratings } = data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-lagoon">{regionLabel(spot.region, "de")}</p>
          <h1 className="mt-1 text-4xl font-black text-slate-950">{spot.name}</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <span className="rounded-lg border border-slate-200 bg-white p-4 font-bold shadow-soft">Guter Wind: {spot.suitableWindDirections.join(", ")}</span>
            <span className="rounded-lg border border-slate-200 bg-white p-4 font-bold shadow-soft">Unsicher: {spot.offshoreWindDirections.join(", ")}</span>
            <span className="rounded-lg border border-slate-200 bg-white p-4 font-bold shadow-soft">Ideal: {spot.idealMinWindKnots}-{spot.idealMaxWindKnots} kt</span>
          </div>
          <div className="mt-5">
            <FavoriteButton spotId={spot.id} />
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-black text-slate-950">Spotprofil</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">Einsteiger</dt>
              <dd className="font-black">{spot.beginnerFriendly ? "Freundlich" : "Nur mit Vorsicht"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">Wasser</dt>
              <dd className="font-black">{spot.spotTypes.map(spotTypeLabel).join(", ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">Tide</dt>
              <dd className="font-black">{spot.tideRelevant ? "Relevant" : "Nicht relevant"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">Thermal</dt>
              <dd className="font-black">{spot.thermalPotential}/3</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-black text-slate-950">
              <Waves size={18} />
              Lokale Hinweise
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{translateSpotNote(spot.parkingInfo)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{translateSpotNote(spot.waterDepth)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{translateSpotNote(spot.seasonRestrictions)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{spot.dangerNotes.map(translateSpotNote).join(" ")}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-black text-slate-950">
              <AlertTriangle size={18} />
              Sicherheitslogik
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Offshore- und fast-offshore Richtungen werden stark abgewertet.</li>
              <li>Starke Boeenfaktoren erzeugen Vorsicht- oder Sturmwarnungen.</li>
              <li>Kalte Luft, Regen, Tide und Beschraenkungen senken den Score.</li>
              <li>Einsteigerfilter werten anspruchsvolle Start- und Rettungsbedingungen ab.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-black text-slate-950">
              <ExternalLink size={18} />
              Links
            </h2>
            <div className="mt-3 space-y-2 text-sm font-bold text-lagoon">
              {spot.webcamUrl ? <a href={spot.webcamUrl}>Webcam</a> : <p className="text-slate-500">Noch keine Webcam gespeichert.</p>}
              {spot.localInfoUrl ? <a className="block" href={spot.localInfoUrl}>Lokale Infos</a> : null}
            </div>
          </div>
        </aside>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-slate-950">
            <Wind size={22} />
            Vorhersagebewertungen
          </h2>
          <div className="grid gap-4">
            {ratings.map((rating, index) => (
              <RatingCard key={`${rating.spot.id}-${rating.windowStart.toISOString()}`} rating={rating} rank={index + 1} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
