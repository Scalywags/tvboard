import { useState } from "react";
import DateTimeWidget from "../components/widgets/DateTimeWidget";
import WeatherWidget from "../components/widgets/WeatherWidget";
import CalendarWidget from "../components/widgets/CalendarWidget";
import TransitWidget from "../components/widgets/TransitWidget";
import WaterWidget from "../components/widgets/WaterWidget";
import SunWidget from "../components/widgets/SunWidget";
import AlertsWidget from "../components/widgets/AlertsWidget";
import HomeWidget from "../components/widgets/HomeWidget";
import { supabase } from "../lib/supabase";

const GOOGLE_TOKEN = import.meta.env.VITE_GOOGLE_OAUTH_TOKEN || "";

const WIDGETS = {
  weather:  true,
  sun:      true,
  alerts:   true,
  transit:  true,
  calendar: true,
  datetime: true,
  water:    true,
  home:     true,
};

export default function Board() {
  const [wxData, setWxData] = useState(null);

  return (
    <div style={s.board}>
      <DateTimeWidget />
      {WIDGETS.weather  && <WeatherWidget onData={setWxData} />}
      {WIDGETS.sun      && <SunWidget wx={wxData?.wx} hourly={wxData?.hourly} />}
      {WIDGETS.alerts   && <AlertsWidget alert={wxData?.alert} />}
      {WIDGETS.water    && <WaterWidget />}
      {WIDGETS.calendar && <CalendarWidget googleToken={GOOGLE_TOKEN} />}
      {WIDGETS.transit  && <TransitWidget />}
      {WIDGETS.home     && <HomeWidget />}

      <button style={s.signOut} onClick={() => supabase.auth.signOut()}>
        Sign out
      </button>
    </div>
  );
}

const s = {
  board: {
    display: "grid",
    width: "100vw",
    height: "100vh",
    padding: "var(--gap)",
    gap: "var(--gap)",
    gridTemplateColumns: "1.1fr 1.5fr 1fr",
    gridTemplateRows: "0.4fr 1.2fr 0.9fr 1fr 1fr",
    gridTemplateAreas: `
      "datetime  home     calendar"
      "weather   home     calendar"
      "sun       transit  calendar"
      "alerts    transit  calendar"
      "alerts    water    calendar"
    `,
  },
  signOut: {
    position: "fixed",
    bottom: 10,
    right: 14,
    background: "none",
    border: "none",
    fontFamily: "var(--mono)",
    fontSize: 9,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-4)",
    cursor: "pointer",
    padding: 0,
    zIndex: 50,
  },
};