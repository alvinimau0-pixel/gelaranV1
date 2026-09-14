import type { Drawing } from "@/lib/drawings";

function TitleBlock({ d }: { d: Drawing }) {
  return (
    <g>
      <rect x="20" y="620" width="760" height="60" fill="#fff" stroke="#1b2430" strokeWidth="1.2" />
      <line x1="200" y1="620" x2="200" y2="680" stroke="#1b2430" />
      <line x1="520" y1="620" x2="520" y2="680" stroke="#1b2430" />
      <line x1="640" y1="620" x2="640" y2="680" stroke="#1b2430" />
      <text x="30" y="640" fill="#5c6775" fontSize="8">
        GELARAN MAJU SDN BHD
      </text>
      <text x="30" y="656" fill="#1b2430" fontSize="10" fontWeight="600">
        THE CAPITOL / MSK
      </text>
      <text x="30" y="672" fill="#5c6775" fontSize="8">
        MEP shop drawing
      </text>
      <text x="212" y="640" fill="#5c6775" fontSize="8">
        TITLE
      </text>
      <text x="212" y="662" fill="#1b2430" fontSize="12" fontWeight="600">
        {d.title}
      </text>
      <text x="532" y="640" fill="#5c6775" fontSize="8">
        DWG
      </text>
      <text x="532" y="662" fill="#1b2430" fontSize="12" fontWeight="600">
        {d.id}
      </text>
      <text x="652" y="640" fill="#5c6775" fontSize="8">
        SCALE / REV
      </text>
      <text x="652" y="662" fill="#1b2430" fontSize="12" fontWeight="600">
        {d.scale} · {d.rev}
      </text>
    </g>
  );
}

function Frame() {
  return (
    <>
      <rect x="12" y="12" width="776" height="676" fill="#fbfcfe" stroke="#1b2430" strokeWidth="2" />
      <rect x="20" y="20" width="760" height="592" fill="#fff" stroke="#c9d0da" />
    </>
  );
}

function Riser({ x, label, top, bot }: { x: number; label: string; top: number; bot: number }) {
  return (
    <g>
      <line x1={x} y1={top} x2={x} y2={bot} stroke="#3d8bff" strokeWidth="4" />
      <text x={x} y={top - 8} textAnchor="middle" fontSize="10" fill="#1b2430" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

function Floors({ x, levels }: { x: number; levels: string[] }) {
  return (
    <g>
      {levels.map((lv, i) => {
        const y = 80 + i * 22;
        return (
          <g key={lv}>
            <line x1={x - 18} y1={y} x2={x + 18} y2={y} stroke="#1b2430" strokeWidth="1.4" />
            <text x={x + 26} y={y + 3} fontSize="8" fill="#5c6775">
              {lv}
            </text>
          </g>
        );
      })}
    </g>
  );
}

const LVS = ["31M", "31", "30", "28", "26", "24", "22", "20", "18", "16", "14", "13"];

export function DrawingArt({ id }: { id: string }) {
  if (id === "CW-P-01") {
    return (
      <g>
        <text x="40" y="48" fontSize="11" fill="#5c6775">
          SS TRANSFER MAIN · Ø PER SCHEDULE · FLOW ↑
        </text>
        <path d="M60 560 L60 140 L180 140 L180 90" fill="none" stroke="#3d8bff" strokeWidth="5" />
        <circle cx="60" cy="560" r="10" fill="#1b2430" />
        <text x="78" y="564" fontSize="10">
          PUMP L31
        </text>
        <rect x="168" y="78" width="36" height="22" fill="none" stroke="#1b2430" />
        <text x="170" y="93" fontSize="8">
          PANEL
        </text>
        {[
          [60, 500, "L13 10.75m"],
          [60, 430, "L14–21 4.5m"],
          [60, 320, "ELBOW"],
          [60, 240, "CHECK VALVE"],
          [180, 140, "L31 12.7m"],
        ].map(([x, y, t]) => (
          <g key={String(t)}>
            <circle cx={Number(x)} cy={Number(y)} r="4" fill="#1b2430" />
            <text x={Number(x) + 12} y={Number(y) + 4} fontSize="9">
              {t}
            </text>
          </g>
        ))}
        <text x="420" y="200" fontSize="10" fill="#5c6775">
          Tower A advanced to L21
        </text>
        <text x="420" y="220" fontSize="10" fill="#5c6775">
          Tower B SS pipe from L21–L29
        </text>
        <text x="420" y="260" fontSize="10">
          Sampling point @ L13 (done) and L23 (open)
        </text>
      </g>
    );
  }
  if (id === "SAN-R-01" || id === "SAN-T-01") {
    return (
      <g>
        <Riser x={160} label="STACK A" top={70} bot={560} />
        <Riser x={280} label="STACK B" top={70} bot={560} />
        <Floors x={160} levels={LVS} />
        <Floors x={280} levels={LVS} />
        {[80, 124, 168, 212, 256, 300].map((y) => (
          <g key={y}>
            <rect x="400" y={y} width="70" height="28" fill="none" stroke="#1b2430" />
            <text x="410" y={y + 18} fontSize="9">
              WC · WB
            </text>
            <line x1="400" y1={y + 14} x2="280" y2={y + 14} stroke="#1b2430" strokeWidth="1.5" />
          </g>
        ))}
        <text x="500" y="96" fontSize="10" fill="#5c6775">
          4 toilet sets L25–L31
        </text>
        <text x="500" y="116" fontSize="10" fill="#5c6775">
          Hosereel + floor trap 6 nos / floor
        </text>
        <circle cx="160" cy="560" r="14" fill="none" stroke="#3d8bff" strokeWidth="2" />
        <text x="140" y="590" fontSize="9">
          Gully / FT
        </text>
      </g>
    );
  }
  if (id === "IRR-01") {
    return (
      <g>
        <rect x="80" y="80" width="120" height="50" fill="none" stroke="#1b2430" />
        <text x="92" y="110" fontSize="11" fontWeight="600">
          IRR PANEL
        </text>
        <line x1="200" y1="105" x2="320" y2="105" stroke="#3d8bff" strokeWidth="3" />
        <text x="220" y="96" fontSize="9">
          24V CONTROL
        </text>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 180 + i * 70;
          return (
            <g key={i}>
              <circle cx="320" cy={y} r="8" fill="none" stroke="#1b2430" strokeWidth="2" />
              <line x1="320" y1={y} x2="480" y2={y} stroke="#3d8bff" strokeWidth="2" />
              <rect x="480" y={y - 14} width="80" height="28" fill="none" stroke="#1b2430" />
              <text x="492" y={y + 4} fontSize="9">
                OUTLET
              </text>
              <text x="340" y={y - 10} fontSize="8" fill="#5c6775">
                INLET L{13 + i * 4}
              </text>
            </g>
          );
        })}
      </g>
    );
  }
  if (id === "RF-31") {
    return (
      <g>
        <rect x="80" y="80" width="640" height="220" fill="none" stroke="#1b2430" />
        <text x="96" y="104" fontSize="12" fontWeight="600">
          L31 PLANT
        </text>
        <rect x="120" y="140" width="90" height="70" fill="#eef1f5" stroke="#1b2430" />
        <text x="138" y="180" fontSize="10">
          PUMP A
        </text>
        <rect x="230" y="140" width="90" height="70" fill="#eef1f5" stroke="#1b2430" />
        <text x="248" y="180" fontSize="10">
          PUMP B
        </text>
        <rect x="360" y="150" width="110" height="50" fill="none" stroke="#3d8bff" strokeWidth="2" />
        <text x="372" y="180" fontSize="10">
          CONTROL PANEL
        </text>
        <rect x="80" y="340" width="640" height="140" fill="none" stroke="#1b2430" strokeDasharray="4 3" />
        <text x="96" y="364" fontSize="12" fontWeight="600">
          31M ROOF
        </text>
        <path d="M160 400 H640" stroke="#3d8bff" strokeWidth="4" />
        <text x="160" y="430" fontSize="10">
          Roof piping — not started
        </text>
      </g>
    );
  }
  if (id === "TYP-FL") {
    return (
      <g>
        <rect x="80" y="80" width="300" height="420" fill="none" stroke="#1b2430" />
        <text x="96" y="104" fontSize="11" fontWeight="600">
          TOWER FLOOR PLATE (TYP.)
        </text>
        <rect x="110" y="140" width="100" height="140" fill="#eef1f5" stroke="#1b2430" />
        <text x="128" y="210" fontSize="10">
          TOILET CORE
        </text>
        <rect x="240" y="160" width="70" height="50" fill="none" stroke="#3d8bff" />
        <text x="248" y="190" fontSize="9">
          HOSEREEL
        </text>
        <rect x="110" y="320" width="220" height="80" fill="none" stroke="#1b2430" strokeDasharray="3 2" />
        <text x="128" y="365" fontSize="10">
          TENANT CW / SAN
        </text>
        <rect x="430" y="80" width="280" height="420" fill="none" stroke="#1b2430" />
        <text x="446" y="104" fontSize="11" fontWeight="600">
          SERVICES KEY
        </text>
        <text x="446" y="140" fontSize="10">
          1. Pipe sleeve at slab
        </text>
        <text x="446" y="164" fontSize="10">
          2. Backshaft CW & FW
        </text>
        <text x="446" y="188" fontSize="10">
          3. Toilet distribution
        </text>
        <text x="446" y="212" fontSize="10">
          4. Irrigation offtakes
        </text>
        <text x="446" y="260" fontSize="10" fill="#5c6775">
          Transfer SS in shaft
        </text>
      </g>
    );
  }
  return (
    <g>
      <Riser x={220} label="CW A" top={70} bot={560} />
      <Riser x={360} label="CW B" top={70} bot={560} />
      <Floors x={220} levels={LVS} />
      <Floors x={360} levels={LVS} />
      <rect x="500" y="80" width="240" height="160" fill="none" stroke="#1b2430" />
      <text x="516" y="104" fontSize="11" fontWeight="600">
        NOTES
      </text>
      <text x="516" y="128" fontSize="10">
        Sleeve complete most floors
      </text>
      <text x="516" y="148" fontSize="10">
        A transfer pipe leads B
      </text>
      <text x="516" y="168" fontSize="10">
        Roof piping 0%
      </text>
      <text x="516" y="188" fontSize="10">
        Pumps at L31 ~95%
      </text>
    </g>
  );
}

export function DrawingSheet({ drawing }: { drawing: Drawing }) {
  return (
    <svg viewBox="0 0 800 700" className="h-auto w-full bg-surface" role="img" aria-label={drawing.title}>
      <Frame />
      <DrawingArt id={drawing.id} />
      <TitleBlock d={drawing} />
    </svg>
  );
}
