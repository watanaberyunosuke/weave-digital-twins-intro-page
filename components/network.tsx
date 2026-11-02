export function Network() {
  return (
    <figure className="network-panel">
      <div className="panel-top">
        <span>NETWORK EXPLORER</span>
        <span className="concept-badge">CONCEPT / NOT LIVE</span>
      </div>
      <svg
        viewBox="0 0 660 450"
        role="img"
        aria-labelledby="network-title network-desc"
      >
        <title id="network-title">A conceptual water-network topology</title>
        <desc id="network-desc">
          An illustrative reservoir feeds connected pipes. Synthetic meter
          locations sit on the network. No actual geography, measurements or
          model results are shown.
        </desc>
        <defs>
          <pattern
            id="grid"
            width="25"
            height="25"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M25 0H0V25"
              fill="none"
              stroke="currentColor"
              strokeWidth=".4"
              opacity=".16"
            />
          </pattern>
        </defs>
        <rect width="660" height="450" fill="url(#grid)" />
        <g fill="none" stroke="currentColor" opacity=".12">
          <path d="M-50 150Q160 60 290 130T700 80M-50 170Q160 80 290 150T700 100M-50 190Q160 100 290 170T700 120M-50 360Q140 260 290 330T700 280M-50 380Q140 280 290 350T700 300" />
        </g>
        <path
          d="M148 133L315 80 514 155 555 319 367 387 151 320 101 210Z"
          className="zone"
        />
        <g className="network-pipes" fill="none" strokeWidth="3">
          <path d="M99 89L161 161 276 205 380 145 507 193 471 281 354 313 236 290 161 161M276 205L236 290 151 319M276 205L354 313 395 370M276 205L292 112M354 313L471 281 535 333M380 145L406 88" />
        </g>
        <g className="network-nodes" strokeWidth="3">
          {[
            [161, 161],
            [276, 205],
            [380, 145],
            [507, 193],
            [471, 281],
            [354, 313],
            [236, 290],
            [151, 319],
            [395, 370],
            [292, 112],
            [406, 88],
            [535, 333],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
          ))}
        </g>
        <g className="network-meters">
          {[
            [216, 182],
            [329, 174],
            [190, 229],
            [294, 247],
            [412, 298],
            [491, 235],
            [444, 171],
            [258, 263],
          ].map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              x={x - 4}
              y={y - 4}
              width="8"
              height="8"
              rx="1"
            />
          ))}
        </g>
        <circle cx="99" cy="89" r="24" fill="var(--facility)" opacity=".12" />
        <rect
          x="89"
          y="79"
          width="20"
          height="20"
          rx="3"
          fill="var(--facility)"
        />
        <g className="map-text">
          <text x="131" y="87">
            SUPPLY NODE
          </text>
          <text x="131" y="103" className="map-subtext">
            Fixed-head boundary
          </text>
          <text x="420" y="362">
            DERIVED DMA
          </text>
        </g>
        <g transform="translate(28 365)">
          <rect width="220" height="59" rx="4" className="map-callout" />
          <text className="map-text" x="14" y="23">
            METERS FOLLOW THE GEOMETRY
          </text>
          <text className="map-subtext" x="14" y="42">
            Generated IDs · explicit provenance
          </text>
        </g>
        <g className="crosshair" stroke="currentColor" opacity=".4">
          <path d="M610 29v24M598 41h24" />
        </g>
      </svg>
      <figcaption>
        <div className="map-legend">
          <span>
            <i className="line-key" />
            Pipe topology
          </span>
          <span>
            <i className="meter-key" />
            Synthetic meter
          </span>
          <span>
            <i className="supply-key" />
            Supply
          </span>
        </div>
        <p>Illustrative topology. No actual GIS or telemetry values.</p>
      </figcaption>
    </figure>
  );
}
