export type Locale = "de" | "en";

export const defaultLocale: Locale = "de";

export function getLocale(value: string | string[] | undefined): Locale {
  return value === "en" ? "en" : "de";
}

export function withLocale(href: string, locale: Locale) {
  if (locale === defaultLocale) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}lang=${locale}`;
}

export const dictionary = {
  de: {
    nav: {
      dashboard: "Dashboard",
      rankings: "Rankings",
      map: "Karte",
      calendar: "Kalender",
      alerts: "Alerts",
      profile: "Profil",
      admin: "Admin"
    },
    layout: {
      tagline: "Vorhersagen werden zu Kite-Entscheidungen"
    },
    home: {
      eyebrow: "Live Kite-Spot Ranking",
      intro:
        "Wind, Boeen, Regen, Temperatur, Tageslicht, Sicherheitswinkel, Spot-Typ und Fahrerprofil werden zu einem Kite-Score von 0 bis 100 verarbeitet.",
      openRankings: "Rankings offnen",
      createAlert: "Alert erstellen",
      currentLead: "Aktuell vorne",
      noData: "Noch keine Ranking-Daten vorhanden.",
      filtersEyebrow: "Dashboard Filter",
      filtersTitle: "Alle Dashboard-Karten anpassen",
      clearFilters: "Filter zurucksetzen",
      weekendTitle: "Beste Spots am Wochenende",
      weekendSubtitle: "Wochenend-Ranking mit Sicherheitsbewertung.",
      tomorrowTitle: "Beste Spots morgen",
      tomorrowSubtitle: "Top Sessions fur den nachsten Vorhersagetag.",
      weekdayTitle: "Beste Wochentag-Sessions",
      weekdaySubtitle: "Gute Fenster fur Sessions unter der Woche."
    },
    filters: {
      date: "Datum",
      region: "Region",
      allGermany: "Ganz Deutschland",
      minWind: "Min. Wind",
      maxWind: "Max. Wind",
      direction: "Richtung",
      any: "Egal",
      minTemp: "Min. Temp.",
      weekend: "Wochenende",
      weekday: "Wochentag",
      beginner: "Einsteigerfreundlich",
      flatWater: "Flachwasser",
      wave: "Welle",
      avoidRain: "Regen vermeiden",
      avoidOffshore: "Offshore vermeiden",
      updateRankings: "Rankings aktualisieren"
    }
  },
  en: {
    nav: {
      dashboard: "Dashboard",
      rankings: "Rankings",
      map: "Map",
      calendar: "Calendar",
      alerts: "Alerts",
      profile: "Profile",
      admin: "Admin"
    },
    layout: {
      tagline: "Forecasts translated into ride decisions"
    },
    home: {
      eyebrow: "Live kite-condition ranking",
      intro:
        "Wind, gusts, rain, temperature, daylight, safety angles, spot type, and rider preferences are converted into a 0-100 kite score.",
      openRankings: "Open rankings",
      createAlert: "Create alert",
      currentLead: "Current lead",
      noData: "No ranking data yet.",
      filtersEyebrow: "Dashboard filters",
      filtersTitle: "Tune every dashboard card",
      clearFilters: "Clear filters",
      weekendTitle: "Best spots this weekend",
      weekendSubtitle: "Weekend ranking with safety evaluation.",
      tomorrowTitle: "Best spots tomorrow",
      tomorrowSubtitle: "Top sessions for the next forecast day.",
      weekdayTitle: "Best weekday sessions",
      weekdaySubtitle: "Good windows for weekday sessions."
    },
    filters: {
      date: "Date",
      region: "Region",
      allGermany: "All Germany",
      minWind: "Min wind",
      maxWind: "Max wind",
      direction: "Direction",
      any: "Any",
      minTemp: "Min temp",
      weekend: "Weekend",
      weekday: "Weekday",
      beginner: "Beginner friendly",
      flatWater: "Flat water",
      wave: "Wave",
      avoidRain: "Avoid rain",
      avoidOffshore: "Avoid offshore",
      updateRankings: "Update rankings"
    }
  }
} as const;
