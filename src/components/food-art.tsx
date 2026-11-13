export function FoodArt({ variant, name }: { variant: number; name: string }) {
  const kind = variant % 6;
  return (
    <svg
      viewBox="0 0 400 240"
      role="img"
      aria-label={`Original food illustration for ${name}`}
      className="h-full w-full bg-muted"
    >
      <path
        d={`M0 ${120 + variant * 3} Q200 0 400 100 V240 H0Z`}
        className="fill-primary/10"
      />
      <ellipse
        cx="208"
        cy="188"
        rx="112"
        ry="20"
        className="fill-foreground/10"
      />
      <ellipse cx="200" cy="124" rx="112" ry="80" className="fill-plate" />
      <ellipse cx="200" cy="124" rx="94" ry="64" className="fill-food" />
      {kind === 3 ? (
        <>
          <path d="M120 116 Q200 25 280 116Z" className="fill-food" />
          <path d="M121 129 H279 L267 151 H133Z" className="fill-topping" />
          <path
            d="M128 124 Q156 145 184 125 T272 125"
            fill="none"
            strokeWidth="12"
            className="stroke-leaf"
          />
        </>
      ) : (
        <>
          {Array.from({ length: 8 }, (_, position) => {
            const angle = (position * Math.PI) / 4 + variant;
            return (
              <ellipse
                key={position}
                cx={200 + Math.cos(angle) * 61}
                cy={124 + Math.sin(angle) * 38}
                rx={kind === 2 ? 22 : 13}
                ry={kind === 2 ? 9 : 12}
                transform={`rotate(${position * 30} ${200 + Math.cos(angle) * 61} ${124 + Math.sin(angle) * 38})`}
                className={position % 2 ? "fill-leaf" : "fill-topping"}
              />
            );
          })}
          <ellipse
            cx="200"
            cy="120"
            rx={kind === 5 ? 38 : 20}
            ry="25"
            className="fill-plate/80"
          />
        </>
      )}
      <path
        d="M331 55 V181 M342 55 V89 Q337 106 326 89 V55"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-muted-foreground/50"
      />
    </svg>
  );
}
