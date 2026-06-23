import { useState, useEffect } from "react";

const TRASH_DAYS = [0, 1, 2, 3, 4]; // Sun-Thu
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AMENITIES = [
  { name: "Fitness / Package rooms", hours: "24/7", open: () => true },
  {
    name: "Lounge / Clubhouse / Game Room",
    hours: "7am – 10pm",
    open: (h) => h >= 7 && h < 22,
  },
  { name: "Pool", hours: "10am – 10pm", open: (h) => h >= 10 && h < 22 },
];

export default function HomeWidget() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  const now = new Date();
  const today = now.getDay();
  const hour = now.getHours();
  const min = now.getMinutes();
  const totalMin = hour * 60 + min;

  const hasTrash = TRASH_DAYS.includes(today);
  const bagOutStart = 18 * 60;
  const bagOutEnd = 20 * 60;
  const bagInDeadline = 9 * 60;

  const isOutWindow = totalMin >= bagOutStart && totalMin < bagOutEnd;
  const isPastOut = totalMin >= bagOutEnd;
  const isMorning = totalMin < bagInDeadline;

  return (
    <div className="card" style={{ gridArea: "home", gap: 12 }}>
      <div className="card-label">Home</div>

      {/* Trash section */}
      <div style={s.section}>
        <div style={s.sectionTitle}>🗑 Trash</div>

        {/* Day strip */}
        <div style={s.dayStrip}>
          {DAYS_SHORT.map((d, i) => {
            const isToday = i === today;
            const trashDay = TRASH_DAYS.includes(i);
            return (
              <div
                key={d}
                style={{
                  ...s.dayChip,
                  ...(isToday && trashDay ? s.dayChipToday : {}),
                  ...(isToday && !trashDay ? s.dayChipNoTrash : {}),
                }}
              >
                <div
                  style={{
                    ...s.dayChipName,
                    color: isToday ? "#fff" : "var(--text-7)",
                  }}
                >
                  {d}
                </div>
                <div style={s.dayChipIcon}>{trashDay ? "🗑" : "✕"}</div>
              </div>
            );
          })}
        </div>

        {/* Today's status */}
        {hasTrash ? (
          <div style={s.trashStatus}>
            {isMorning && (
              <div
                style={{
                  ...s.trashBanner,
                  background: "#fef9c3",
                  borderColor: "#f5c542",
                }}
              >
                <div style={{ ...s.trashBannerTitle, color: "#713f12" }}>
                  🌅 Bags inside by 9am
                </div>
                <div style={{ ...s.trashBannerSub, color: "#92400e" }}>
                  Bring bins in before{" "}
                  {(() => {
                    const totalRemaining = 9 * 60 - totalMin;
                    const hrsLeft = Math.floor(totalRemaining / 60);
                    const minLeft = totalRemaining % 60;
                    if (hrsLeft > 0 && minLeft > 0)
                      return `${hrsLeft}h ${minLeft}min`;
                    if (hrsLeft > 0) return `${hrsLeft}h`;
                    return `${minLeft}min`;
                  })()}
                </div>
              </div>
            )}

            {isOutWindow && (
              <div
                style={{
                  ...s.trashBanner,
                  background: "#dcfce7",
                  borderColor: "#86efac",
                }}
              >
                <div style={{ ...s.trashBannerTitle, color: "#166534" }}>
                  🟢 Put bags out now
                </div>
                <div style={{ ...s.trashBannerSub, color: "#166534" }}>
                  Window closes at 8pm
                </div>
              </div>
            )}

            {!isMorning && !isOutWindow && !isPastOut && (
              <div style={s.trashUpcomingWrap}>
                <div style={s.trashUpcomingRow}>
                  <span style={s.trashUpcomingLabel}>Bags outside</span>
                  <span
                    style={{
                      ...s.timeTag,
                      background: isOutWindow ? "#dcfce7" : "#fee2e2",
                      color: isOutWindow ? "#166534" : "#991b1b",
                    }}
                  >
                    6pm – 8pm
                  </span>
                </div>
                <div style={s.trashUpcomingRow}>
                  <span style={s.trashUpcomingLabel}>Bags inside by</span>
                  <span style={s.timeTagNeutral}>9am</span>
                </div>
              </div>
            )}

            {isPastOut && !isMorning && (
              <div
                style={{
                  ...s.trashBanner,
                  background: "#f1f5f9",
                  borderColor: "var(--border-light)",
                }}
              >
                <div style={{ ...s.trashBannerTitle, color: "var(--text-5)" }}>
                  ✓ Bags should be out
                </div>
                <div style={{ ...s.trashBannerSub, color: "var(--text-4)" }}>
                  Bring in by 9am tomorrow
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={s.noTrash}>No trash pickup today</div>
        )}
      </div>

      <div style={s.divider} />

      {/* Amenities */}
      <div style={s.section}>
        <div style={s.sectionTitle}>🏢 Amenities</div>
        <div style={s.amenitiesList}>
          {AMENITIES.map((a) => {
            const open = a.open(hour);
            return (
              <div key={a.name} style={s.amenityRow}>
                <div style={s.amenityDot(open)} />
                <div style={s.amenityInfo}>
                  <div style={s.amenityName}>{a.name}</div>
                  <div style={s.amenityHours}>{a.hours}</div>
                </div>
                <div
                  style={{
                    ...s.amenityBadge,
                    ...(open ? s.amenityOpen : s.amenityClosed),
                  }}
                >
                  {open ? "Open" : "Closed"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s = {
  section: { display: "flex", flexDirection: "column", gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-6)",
    fontFamily: "'Times New Roman', serif",
  },
  dayStrip: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 },
  dayChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "8px 4px",
    borderRadius: 8,
    border: "1px solid var(--border-light)",
    background: "var(--bg)",
  },
  dayChipToday: {
    background: "var(--accent)",
    borderColor: "var(--accent-dark)",
  },
  dayChipNoTrash: { background: "#f1f5f9", borderColor: "var(--border-light)" },
  dayChipName: {
    fontFamily: "var(--mono)",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  dayChipIcon: { fontSize: "1rem" },
  trashStatus: { display: "flex", flexDirection: "column", gap: 6 },
  trashBanner: { border: "1px solid", borderRadius: 8, padding: "10px 12px" },
  trashBannerTitle: { fontSize: 12, fontWeight: 600, marginBottom: 3 },
  trashBannerSub: { fontSize: 10, fontFamily: "var(--mono)" },
  trashUpcomingWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "4px 0",
  },
  trashUpcomingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trashUpcomingLabel: {
    fontFamily: "var(--mono)",
    fontSize: 9,
    color: "var(--text-4)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  timeTag: {
    fontFamily: "'Times New Roman', serif",
    fontSize: 14,
    fontWeight: 600,
    padding: "2px 10px",
    borderRadius: 5,
  },
  timeTagNeutral: {
    fontFamily: "'Times New Roman', serif",
    fontSize: 14,
    fontWeight: 600,
    padding: "2px 10px",
    borderRadius: 5,
    background: "var(--accent-light)",
    color: "var(--accent)",
  },
  noTrash: {
    fontFamily: "var(--mono)",
    fontSize: 10,
    color: "var(--text-4)",
    letterSpacing: "0.06em",
    padding: "4px 0",
  },
  divider: { height: 1, background: "var(--border-light)" },
  amenitiesList: { display: "flex", flexDirection: "column", gap: 8 },
  amenityRow: { display: "flex", alignItems: "center", gap: 10 },
  amenityDot: (open) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    background: open ? "#22c55e" : "#cbd5e1",
  }),
  amenityInfo: { flex: 1 },
  amenityName: { fontSize: 11, color: "var(--text-7)", fontWeight: 500 },
  amenityHours: {
    fontFamily: "var(--mono)",
    fontSize: 9,
    color: "var(--text-4)",
    letterSpacing: "0.04em",
    marginTop: 1,
  },
  amenityBadge: {
    fontFamily: "var(--mono)",
    fontSize: 9,
    padding: "2px 7px",
    borderRadius: 4,
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
  amenityOpen: { background: "#dcfce7", color: "#166534" },
  amenityClosed: { background: "#f1f5f9", color: "var(--text-4)" },
};
