import generated from "@/lib/notion-content.generated.json";
import DocGettingStarted from "@/content/getting-started.mdx";
import DocConcepts from "@/content/concepts.mdx";
import DocArchitecture from "@/content/architecture.mdx";
import DocConfiguration from "@/content/configuration.mdx";
import DocRegions from "@/content/regions.mdx";
import DocTelemetry from "@/content/telemetry.mdx";
import DocModelling from "@/content/modelling.mdx";
import DocConsoleAndGis from "@/content/console-and-gis.mdx";
import DocOperations from "@/content/operations.mdx";
import DocApi from "@/content/api.mdx";
import DocContributing from "@/content/contributing.mdx";

const repositoryDocs = [
  {
    slug: "getting-started",
    title: "Getting started",
    group: "Start here",
    description:
      "Bring up a local stack, load a network and verify each stage.",
    source: "README.md",
    headings: [
      { title: "Before you start", id: "before-you-start" },
      { title: "Prepare the repository", id: "prepare-the-repository" },
      { title: "Start services", id: "start-services" },
      { title: "Bootstrap the twin", id: "bootstrap-the-twin" },
      { title: "Start stream processing", id: "start-stream-processing" },
      { title: "Verify the result", id: "verify-the-result" },
    ],
    searchText:
      " Before you start\n\nInstall Docker with Compose 2.24.4 or later, Git and a shell. The services run in containers; the twin has no local application build. Allocate resources for Kafka, Flink, Postgres and the model, and begin with a limited GIS load when evaluating a large network.\n\nThe website and the twin are separate projects. These commands belong in the weave-digital-twins repository, not the website directory. Published service ports bind to loopback.\n\n Prepare the repository\n\nbash\ngit clone https://github.com/watanaberyunosuke/weave-digital-twins.git\ncd weave-digital-twins\n./scripts/fetch-confluent-stack.sh\ncp .env.example .env\n\n\nEdit .env for your region and review its GIS source configuration before starting. The fetch script supplies the git-ignored base Compose file; the override cannot run by itself.\n\nbash\n./scripts/init-secrets.sh\n./scripts/download-flink-connectors.sh\n\n\nThe secrets script fills blank console secrets and asks for an admin password. Do not publish .env or paste its tokens into support requests.\n\n Start services\n\nbash\ndocker compose up -d broker connect control-center flink-jobmanager \\\n  flink-taskmanager flink-sql-client postgres ingest-market \\\n  ingest-hydrometry ingest-storage gis-loader simulator console featureserv\n\n\nCheck docker compose ps and wait for dependencies to become healthy. A running container alone does not establish a working data pipeline.\n\n Bootstrap the twin\n\nbash\n./scripts/bootstrap.sh\n\n\nBootstrap creates topics, loads GIS and topology, samples elevation, seeds synthetic registries, registers generators, builds the model and starts the ELK read copy. A full region can take time.\n\nData change: seeding truncates the synthetic DMA, water-meter and pressure-logger registries and regenerates schemas. Connector registration deletes and recreates its Datagen connectors. Review the region and existing data before rerunning bootstrap.\n\n Start stream processing\n\nbash\ndocker exec -it flink-sql-client sql-client.sh\n\n\nInside the SQL client, run these in order:\n\nsql\nSOURCE '/sql/01_sources.sql';\nSOURCE '/sql/02_sinks.sql';\nSOURCE '/sql/03_pipelines.sql';\n\n\nStart one statement set only. Duplicate jobs can write duplicate telemetry; the telemetry hypertables do not deduplicate those writes.\n\n Verify the result\n\nOpen the local console at http://localhost:8090. Check topics, connector state, Flink jobs, row counts and telemetry timestamps. Then inspect the network and latest model residual. The first model status can be UNKNOWN while a baseline is accumulating.\n\nKafka is managed in Control Center on port 9021; Flink jobs are managed in the Flink UI on 9081. See [Operations](/docs/operations/) if a stage is incomplete.\n",
    Component: DocGettingStarted,
  },
  {
    slug: "concepts",
    title: "Core concepts",
    group: "Start here",
    description: "Understand the real, synthetic and modelled parts of a twin.",
    source: "postgres/init/02_asset_graph.sql",
    headings: [
      { title: "A physical foundation", id: "a-physical-foundation" },
      { title: "Three kinds of information", id: "three-kinds-of-information" },
      { title: "Zones and registries", id: "zones-and-registries" },
      { title: "Database organisation", id: "database-organisation" },
      { title: "What an anomaly means", id: "what-an-anomaly-means" },
    ],
    searchText:
      " A physical foundation\n\nWeave uses public GIS geometry for network assets. It derives graph nodes from pipe endpoints. Real source geometry can still be incomplete, disconnected or inaccurate; \u201creal\u201d describes provenance, not an assurance of engineering quality.\n\n Three kinds of information\n\n| Category | Examples | Interpretation |\n| --- | --- | --- |\n| Real | Public pipes, facilities and gauge observations | Published source data, subject to source quality and licensing |\n| Synthetic | Derived DMAs, meters and generated readings | Generated test data anchored to real geometry |\n| Modelled | EPANET pressure and flow results | A calculation under configured assumptions |\n\nTelemetry messages and tables carry is_synthetic; real and synthetic telemetry is stored separately. Registry objects use a synthetic flag. A graph drawn over real geography does not make generated readings real.\n\n Zones and registries\n\nA District Metered Area (DMA) groups pipes for analysis. Here, these zones are synthetic clusters, not verified operational boundaries. The seeder places meters along real pipe geometry and builds schemas from the resulting registry IDs. Generated readings therefore refer to existing objects.\n\n Database organisation\n\nasset holds topology and derived DMAs. ref holds device and gauge registries. twin holds telemetry, model output and residuals. Postgres remains the system of record; Elasticsearch is a disposable inspection copy.\n\n What an anomaly means\n\nA pressure residual is modelled pressure minus observed pressure. The classifier checks how far that residual has moved from the DMA\u2019s own baseline. A flag is an investigation cue. Synthetic observations cannot establish real-world detection accuracy.\n\nContinue with [Modelling](/docs/modelling/) for the scoring method and its limitations.\n",
    Component: DocConcepts,
  },
  {
    slug: "architecture",
    title: "Architecture",
    group: "Understand",
    description: "Trace the services, data paths and storage boundaries.",
    source: "docker-compose.override.yml",
    headings: [
      { title: "System boundaries", id: "system-boundaries" },
      { title: "Data flow", id: "data-flow" },
      { title: "Source of truth", id: "source-of-truth" },
      { title: "Read and operation paths", id: "read-and-operation-paths" },
      { title: "Region isolation", id: "region-isolation" },
    ],
    searchText:
      " System boundaries\n\nThe Confluent base Compose file supplies Kafka, Connect, Control Center and Flink. Weave\u2019s override supplies Postgres, GIS loading, feed adapters, the simulator, console, features service and ELK services.\n\nThe project name is weave. Keep active Docker bind mounts in a location that Docker Desktop can access reliably. Website deployment is independent of this stack.\n\n Data flow\n\ntext\nPublic GIS \u2192 raw assets \u2192 conformed assets \u2192 topology\n                                      \u2193\n                        synthetic zones and registries\n                                      \u2193\nReal feed adapters + Datagen \u2192 Kafka \u2192 Flink \u2192 twin telemetry\n                                                \u2193\nPostGIS topology + meter demands \u2192 EPANET \u2192 residuals\n                                                \u2193\n                              Console / GIS / ELK inspection\n\n\nStorage-level observations follow a separate batch path directly into Postgres; a daily reading does not require a Kafka stream.\n\n Source of truth\n\nPostGIS supplies geometry, spatial seeding and model topology. TimescaleDB stores telemetry in hypertables in the same Postgres system. The model writes element results, residuals and latest DMA state back there.\n\nLogstash polls selected tables into Elasticsearch. The mirrored window is bounded to seven days. Kibana reads that derived copy, not Postgres. Filebeat adds container logs; it excludes the ELK services to avoid feedback loops.\n\n Read and operation paths\n\nThe admin console reads Postgres in read-only transactions and uses existing service endpoints for health. Its operations invoke an allow-listed set of documented commands. One operation runs at a time because seeding, loading and modelling share state.\n\nThe optional public console has no Docker socket. Roles and relay routes govern which operations are available. The project website has no connection to those routes.\n\n Region isolation\n\nRegion sources and extent belong in gis/regions/.yml; feed endpoints and IDs belong in .env. Do not introduce region coordinates or agency IDs into general code when adding a region.\n",
    Component: DocArchitecture,
  },
  {
    slug: "configuration",
    title: "Configuration",
    group: "Build a twin",
    description:
      "Configure feeds, modelling and access without embedding a region in code.",
    source: ".env.example",
    headings: [
      { title: "Configuration files", id: "configuration-files" },
      { title: "Main settings", id: "main-settings" },
      { title: "Console secrets", id: "console-secrets" },
      { title: "External Elasticsearch", id: "external-elasticsearch" },
      { title: "Literal Flink settings", id: "literal-flink-settings" },
    ],
    searchText:
      " Configuration files\n\nCopy .env.example to .env in the twin repository. Set GIS_REGION_CONFIG to a region YAML file. Docker Compose reads .env; the website does not read it.\n\nNever commit deployment secrets. Use .env.example as the inventory of published environment settings and inspect the module source for additional model settings and defaults.\n\n Main settings\n\n| Setting | Purpose |\n| --- | --- |\n| GIS_REGION_CONFIG | GIS catalogue, layers and extent |\n| MARKET_DISPATCH_URL, MARKET_REGION | Market adapter endpoint and region identifier |\n| HYDRO_URL, HYDRO_SITES | Hydrometry endpoint and selected gauges |\n| STORAGE_URL, STORAGE_BBOX | Storage endpoint and local extent filter |\n| CONSOLE_PORT, CONSOLE_BASEMAP | Local console port and optional starting basemap |\n| SIM_MAX_PIPES, SIM_MAX_SNAP_M | Supplied subgraph cap and reservoir snap limit |\n| SIM_RESIDUAL_MIN_SAMPLES | Minimum residual baseline count |\n| SIM_RESULT_RETENTION_HOURS | Per-element result retention |\n\nChanging the model subgraph settings requires applying them to both the seeder and simulator, then reseeding and rebuilding. Reseeding replaces synthetic registries.\n\n Console secrets\n\nbash\n./scripts/init-secrets.sh\n\n\nAdd --totp when you want an authenticator secret. The script fills blank entries without printing the secrets. Public admin access requires the password hash, relay URL and separate admin token. Set secure cookies for an HTTPS deployment and configure allowed hosts appropriately.\n\n External Elasticsearch\n\nUse ELASTICSEARCH_URL, network, credentials and CA settings for an existing cluster. Run scripts/elk-up.sh to select and validate the target. A TLS or authentication error needs correction; do not bypass the script by starting Logstash directly.\n\n Literal Flink settings\n\nFlink SQL does not substitute environment variables. Its JDBC URL and credentials in flink/sql/02_sinks.sql must agree with Compose. Logstash does support environment substitution. Changing .env alone does not rewrite Flink SQL.\n",
    Component: DocConfiguration,
  },
  {
    slug: "regions",
    title: "Configure a region",
    group: "Build a twin",
    description: "Load source geometry, derive topology and sample elevations.",
    source: "gis/regions/TEMPLATE.yml",
    headings: [
      { title: "Start from the template", id: "start-from-the-template" },
      { title: "Supported source shapes", id: "supported-source-shapes" },
      { title: "Inspect a small load", id: "inspect-a-small-load" },
      {
        title: "Build topology and elevation",
        id: "build-topology-and-elevation",
      },
      { title: "Supply and model selection", id: "supply-and-model-selection" },
    ],
    searchText:
      " Start from the template\n\nCopy gis/regions/TEMPLATE.yml to your own file and set GIS_REGION_CONFIG in .env. Define the region label, source ID, extent and layers. Check each source\u2019s licence, attribution and permitted use independently.\n\nKeep region-specific coordinates, agency names and identifiers in the region file and .env.\n\n Supported source shapes\n\nA layer can use an ArcGIS item ID, a WFS 2.0 URL and type name, or an Overpass query. Optional source filters belong in the layer definition. The Overpass query defines its own area; the region extent is not applied to it.\n\nUse attribute_hints to resolve varying source fields through the loader\u2019s pick() helper. Do not add hardcoded source column names to general loader logic.\n\n Inspect a small load\n\nbash\ndocker exec gis-loader python gis/discover_layers.py --search reservoir\ndocker exec gis-loader python gis/load_gis.py --layer water_main --limit 500\n\n\nThe layer name must match your configuration. Inspect loaded raw attributes and conformed geometry before a full load.\n\n Build topology and elevation\n\nbash\ndocker exec gis-loader python gis/load_gis.py --all --build-topology\ndocker exec gis-loader python gis/load_elevation.py\n\n\nTopology snaps pipe endpoints to shared nodes using PostGIS. Existing nodes retain IDs across reruns. Changing snap tolerance needs a deliberate topology rebuild and assessment of downstream references.\n\nThe DEM loader samples configured elevation tiles onto nodes without an elevation. Without a usable sample the model uses a default ground level; that is an assumption, not a measured elevation.\n\n Supply and model selection\n\nThe water model starts from recognised reservoirs and keeps connected supplied pipes. A mapped dam or tank is not automatically a valid fixed-head supply. Review facility classification and reservoir-to-node distance.\n\nNo valid reservoir or no supplied pipe causes model building to stop with a diagnostic. See [Modelling](/docs/modelling/) before seeding and building a full network.\n",
    Component: DocRegions,
  },
  {
    slug: "telemetry",
    title: "Telemetry & pipelines",
    group: "Build a twin",
    description:
      "Keep generated IDs coherent and distinguish batch feeds from streams.",
    source: "flink/sql/03_pipelines.sql",
    headings: [
      { title: "Real feed adapters", id: "real-feed-adapters" },
      { title: "Synthetic registries first", id: "synthetic-registries-first" },
      { title: "Kafka to Flink", id: "kafka-to-flink" },
      { title: "Storage observations", id: "storage-observations" },
      { title: "Verify a pipeline", id: "verify-a-pipeline" },
    ],
    searchText:
      " Real feed adapters\n\nMarket and hydrometry pollers adapt API shapes. Endpoint URLs and region IDs come from .env. A new service with the same response shape may need only configuration; a different response structure needs an adapter change.\n\nPoll failures are logged and retried. Assess freshness against the configured polling interval and the publisher\u2019s cadence, rather than calling every recent-looking value live.\n\n Synthetic registries first\n\nbash\ndocker exec gis-loader python scripts/seed_synthetic_network.py --dmas 40 --meters-per-dma 25\n./scripts/register-connectors.sh\n\n\nData change: the seeder truncates DMA, water-meter and pressure-logger registries, derives replacements and writes generated Avro schemas. Registration deletes and recreates Datagen connectors. Generated schemas must exist before registration.\n\nDMAs are derived from the same modelled-pipe selection used by the simulator. Meters sit on pipe geometry; schema ID options come from the newly created registries.\n\n Kafka to Flink\n\nTopics use the pattern domain.subject.raw.v1 with explicit retention. Flink source tables use JSON and start at the latest offsets. Starting a pipeline does not promise historical replay of earlier Kafka data.\n\nSource, sink and pipeline SQL must be sourced in order. The pipeline file executes one statement set, including passthrough telemetry and a 15-minute tumbling DMA balance. Its source-specific synthetic flags preserve provenance.\n\n Storage observations\n\nThe KiWIS storage adapter discovers series, filters locally to STORAGE_BBOX, retrieves values in batches and upserts daily means on (ts, storage_name) directly into Postgres. It links gauges to candidate storage assets with name, distance and capacity checks.\n\nA percent-full value requires a published asset capacity. Missing capacity is not a zero-percent storage observation.\n\n Verify a pipeline\n\nCheck connector state, the running Flink job and actual table timestamps together. A healthy broker alone does not establish successful ingestion. If a stage stalls, use [Operations](/docs/operations/) to narrow the failure boundary.\n",
    Component: DocTelemetry,
  },
  {
    slug: "modelling",
    title: "Hydraulic modelling",
    group: "Understand",
    description:
      "Understand EPANET topology, demand assignment and residual scoring.",
    source: "model/residuals.py",
    headings: [
      {
        title: "Build topology, then apply demands",
        id: "build-topology-then-apply-demands",
      },
      {
        title: "Assumptions and limitations",
        id: "assumptions-and-limitations",
      },
      { title: "Residual method", id: "residual-method" },
      { title: "Reset after recalibration", id: "reset-after-recalibration" },
      { title: "Result retention", id: "result-retention" },
    ],
    searchText:
      " Build topology, then apply demands\n\nbash\ndocker exec simulator python run_sim.py --build\ndocker exec simulator python run_sim.py --once\n\n\nThe build creates network.inp from PostGIS. It walks supplied components outward from reservoir nodes in deterministic order, keeping pipes within SIM_MAX_PIPES. Reservoirs beyond SIM_MAX_SNAP_M are excluded.\n\nAt each solve, demands are calculated from the last hour\u2019s synthetic water-meter readings: average each meter first, then sum at its nearest node. Junction demands are reset before applying the current values. Silent meters add no demand and are counted in the log.\n\n Assumptions and limitations\n\nMissing geometry attributes require defaults, including diameter, roughness or ground level. Reservoir head is snapped ground level plus configured reservoir depth. The DEM loader improves elevation coverage but does not calibrate the hydraulic model.\n\nThe implemented solver is EPANET via WNTR. Electricity and transport schemas do not establish implemented simulation for those domains. Synthetic pressures and demands demonstrate processing, not validated field detection.\n\n Residual method\n\nPressure residual is modelled minus observed pressure, aggregated by DMA. The classifier compares the current residual with the mean and standard deviation of earlier residuals in that DMA\u2019s baseline.\n\n| Setting | Default in model source | Interpretation |\n| --- | --- | --- |\n| SIM_RESIDUAL_BASELINE_DAYS | 7 | Baseline window in days |\n| SIM_RESIDUAL_MIN_SAMPLES | 8 | Fewer samples produces UNKNOWN |\n| SIM_RESIDUAL_Z_WATCH | 2 | Absolute z-score WATCH threshold |\n| SIM_RESIDUAL_Z_LEAK | 3 | Absolute z-score SUSPECTED_LEAK threshold |\n| SIM_RESIDUAL_SIGMA_FLOOR_M | 0.1 | Minimum baseline spread in metres |\n| SIM_RESIDUAL_RELEARN_HOURS | 24 | Delay before flagged samples rejoin baseline |\n\nThese are method parameters, not measured performance results. Report a score with its baseline count; UNKNOWN is insufficient evidence, not OK.\n\n Reset after recalibration\n\nbash\ndocker exec simulator python run_sim.py --reset-baseline\n\n\nAdd --dma ID to scope a reset. This changes which history counts from now onward; it does not delete old residuals. A lasting change may be learned after the relearning period, so a cleared flag alone does not prove a physical issue was repaired.\n\n Result retention\n\nOnly the latest run is read for current per-element output. Historical twin.sim_result rows are pruned according to SIM_RESULT_RETENTION_HOURS. Residual history and per-element result history serve different purposes.\n",
    Component: DocModelling,
  },
  {
    slug: "console-and-gis",
    title: "Console & GIS",
    group: "Explore",
    description: "Inspect pipeline state and connect desktop GIS clients.",
    source: "console/app.py",
    headings: [
      { title: "Local inspection", id: "local-inspection" },
      { title: "Public console roles", id: "public-console-roles" },
      { title: "Basemap privacy", id: "basemap-privacy" },
      { title: "PostGIS direct", id: "postgis-direct" },
      { title: "OGC API Features", id: "ogc-api-features" },
    ],
    searchText:
      " Local inspection\n\nOpen http://localhost:8090 after starting the admin console. Inspect the pipeline stages, topology map, telemetry freshness, real feeds and residual flags. Operation previews show the command that will run; one operation is allowed at a time.\n\nThe console holds the Docker socket. Keep its loopback binding, host validation and required POST header. The public project website does not relay administrative commands.\n\n Public console roles\n\nThe optional public Compose profile serves a separate console on port 8091 without the Docker socket. Anonymous readers view the twin. Demo users can try a limited safe relay list; other actions are simulated. Admin relay access requires separate configuration and credentials.\n\nbash\ndocker compose --profile public up -d console-public\n\n\nThis starts a local service; it does not by itself publish an internet demo. Do not label an unconfigured deployment as available.\n\n Basemap privacy\n\nNo basemap is drawn until configured or selected. Tile requests disclose the viewed area to the provider. Public Google tiles require explicit enablement; the repository also records an outstanding Google logo attribution limitation. Review provider requirements before using them publicly.\n\n PostGIS direct\n\nUse a read-only weave_reader connection to the local database on port 5432. The console\u2019s GIS clients tab supplies connection details and QGIS XML files. Consult postgres/init/04_gis_reader.sql for grants and session safeguards.\n\nThe initialisation SQL runs only on an empty volume. For an older database, apply reviewed reader-role changes manually rather than recreating the volume.\n\n OGC API Features\n\nThe features service listens on http://localhost:9000. Its page limit must cover the requested layer. Since it does not emit a next-page link, a client may treat a truncated response as a complete layer. Prefer PostGIS direct for layers above the configured OGC page size.\n\nasset.dma_status joins DMA geometry to the latest state for thematic maps. A DMA\u2019s synthetic boundary remains synthetic even when displayed alongside real pipes.\n",
    Component: DocConsoleAndGis,
  },
  {
    slug: "operations",
    title: "Operations & troubleshooting",
    group: "Operate",
    description:
      "Diagnose a stalled pipeline without discarding database state.",
    source: "scripts/elk-up.sh",
    headings: [
      {
        title: "Start with the failing boundary",
        id: "start-with-the-failing-boundary",
      },
      {
        title: "Compose cannot find a base file",
        id: "compose-cannot-find-a-base-file",
      },
      { title: "No synthetic telemetry", id: "no-synthetic-telemetry" },
      { title: "No model or residual", id: "no-model-or-residual" },
      { title: "ELK is empty", id: "elk-is-empty" },
      { title: "Preserve the database", id: "preserve-the-database" },
      { title: "Verification checklist", id: "verification-checklist" },
    ],
    searchText:
      " Start with the failing boundary\n\nbash\ndocker compose ps\ndocker compose logs --tail=100 gis-loader simulator console\n\n\nCheck expected service health, then inspect the output of the incomplete stage. Redact endpoints, tokens and region details before sharing logs. A successful syntax check is not runtime verification.\n\n Compose cannot find a base file\n\nRun scripts/fetch-confluent-stack.sh from the twin repository. The base file is git-ignored and is required alongside the override. Check that Docker can read the active bind-mount directory, especially when a source checkout is held in cloud-synchronised storage.\n\n No synthetic telemetry\n\nConfirm topics exist, seeding completed, schemas/.avsc was generated, and Datagen connectors are running. Then check that the Flink statement set is running and that sink timestamps advance. Avoid starting a second statement set.\n\n No model or residual\n\nReview reservoir classification, snap distance, topology node references and supplied connectivity. Build the network after topology changes. Confirm readings exist before expecting non-zero demand. A fresh baseline remains UNKNOWN until enough prior residuals exist.\n\n ELK is empty\n\nbash\n./scripts/elk-up.sh\n\n\nUse this supported entry point to select local or external ELK. It probes from the intended container network. Authentication and certificate failures require correction. Logstash resets saved positions when its target changes so the new cluster receives the bounded backfill.\n\nCheck Postgres first: Elasticsearch is only a derived copy. Its retention does not describe the full Postgres history.\n\n Preserve the database\n\nDo not run docker compose down -v as routine troubleshooting: it can destroy the loaded database and other volumes. Postgres initialisation scripts run only on a fresh volume. Use a reviewed manual migration for an existing database, backed by an appropriate backup and rollback plan.\n\nRestarting or rebuilding containers does not apply every SQL schema change. Check the database itself before declaring a migration complete.\n\n Verification checklist\n\nConfirm service health, connector state, a single intended Flink pipeline, advancing observation timestamps, the latest solve and baseline sample count. Report stale, unavailable and insufficient-history states explicitly.\n",
    Component: DocOperations,
  },
  {
    slug: "api",
    title: "HTTP API reference",
    group: "Reference",
    description:
      "Find the existing console interfaces and their access boundaries.",
    source: "console/app.py",
    headings: [
      { title: "Scope", id: "scope" },
      { title: "Read interfaces", id: "read-interfaces" },
      { title: "Session and operations", id: "session-and-operations" },
      { title: "GIS interfaces", id: "gis-interfaces" },
      { title: "Example local read", id: "example-local-read" },
    ],
    searchText:
      " Scope\n\nThe twin exposes an existing FastAPI console API. This website does not host or proxy it. The routes below are a source-level guide, not a claim that an endpoint is currently reachable. Inspect the linked implementation for exact response fields and active role checks.\n\n Read interfaces\n\n| Route | Purpose |\n| --- | --- |\n| GET /api/status | Derived pipeline and service state |\n| GET /api/config | Console configuration |\n| GET /api/freshness | Telemetry freshness information |\n| GET /api/feeds | Feed information |\n| GET /api/anomalies | Flagged residuals |\n| GET /api/geo/pipes | Pipe map features |\n| GET /api/geo/dmas | DMA map features |\n| GET /api/geo/facilities | Facility map features |\n| GET /api/geo/gauges | Hydrometry map features |\n| GET /api/geo/storages | Storage map features |\n| GET /api/geo/meters | Meter map features |\n| GET /api/dma/{dma_id} | DMA detail |\n| GET /api/device/{kind}/{device_id} | Device detail |\n| GET /api/storage/{station_no} | Storage history |\n\nGeospatial endpoints can apply source-defined bounds, limits or role filtering. Do not treat a map response as an exhaustive export without checking the contract.\n\n Session and operations\n\nGET /api/session, POST /api/login and POST /api/logout manage console sessions. Password hashes, signed cookies and optional TOTP belong to the console deployment, not this site.\n\nGET /api/actions lists actions. POST /api/actions/{action}/preview builds a preview; POST /api/actions/{action} starts the allowed operation. Job state is exposed under /api/jobs and /api/jobs/{jid}. Operations require the console\u2019s host, role and request-header protections.\n\nRelay endpoints under /api/relay/ use separate demo and admin token boundaries. They are internal integration surfaces, not public website endpoints. Do not put relay tokens into frontend code.\n\n GIS interfaces\n\nThe console provides admin-protected GIS connection exports. The separate features service exposes OGC API Features on port 9000. Read-only PostGIS access is also available; see [Console and GIS](/docs/console-and-gis/).\n\n Example local read\n\nbash\ncurl --fail http://localhost:8090/api/status\n\n\nRun this only against your own configured local service. A returned status response must be interpreted with its component state and timestamps, rather than assumed to mean every downstream stage is healthy.\n",
    Component: DocApi,
  },
  {
    slug: "contributing",
    title: "Contributing",
    group: "Reference",
    description:
      "Change a component, verify it and keep the contracts aligned.",
    source: ".github/workflows/ci.yml",
    headings: [
      {
        title: "Work in the right repository",
        id: "work-in-the-right-repository",
      },
      { title: "Syntax and unit checks", id: "syntax-and-unit-checks" },
      { title: "Dependency changes", id: "dependency-changes" },
      { title: "Preserve project contracts", id: "preserve-project-contracts" },
      { title: "Describe the evidence", id: "describe-the-evidence" },
    ],
    searchText:
      " Work in the right repository\n\nThe project website and the utility twin are separate directories. Website changes use the Node commands in the website README. The checks below apply to the Python and container-based twin repository.\n\nRead the repository\u2019s current agent and contributor guidance. Use a meaningful issue branch of the form type/hdh-number-description when work is tracked in Linear. Preserve the configured repository-owner authorship and omit tool attribution.\n\n Syntax and unit checks\n\nbash\npython3 -m py_compile gis/.py ingest/.py scripts/seed_synthetic_network.py model/.py console/.py\npython3 -m unittest discover -s model -p 'test_.py'\npython3 -m unittest discover -s console -p 'test_.py'\nbash -n scripts/.sh\nnode --check console/static/app.js\n\n\nSome tests skip without component dependencies. CI installs each component\u2019s locked requirements and explicitly imports WNTR so a broken solver dependency cannot hide behind a skip. GIS integration tests use a PostGIS database; do not run them against a production database.\n\n Dependency changes\n\nEdit requirements.in and regenerate the hash-locked requirements.txt using scripts/lock-requirements.sh. Do not hand-edit the lock. Images and CI use --require-hashes; the Locks check detects disagreement between input and output.\n\n Preserve project contracts\n\nKeep region identifiers in configuration, synthetic provenance explicit, and public ports on loopback. Add model or ingest tests to the appropriate CI component. Keep operation commands aligned with the scripts used by the console.\n\nA new twin table may require schema migration, Flink sink changes, provenance fields and an ELK input with a stable natural-key document ID. Review all consumers rather than only adding one writer.\n\n Describe the evidence\n\nReport what changed, which checks executed, which skipped and whether runtime behaviour was exercised. Do not claim a live deployment from passing syntax tests or a merged pull request.\n",
    Component: DocContributing,
  },
];
type NotionPage = {
  markdown: string;
  headings: { title: string; id: string }[];
  searchText: string;
};
const synced = generated as Record<string, NotionPage>;
export const docs = repositoryDocs.map((doc) => ({
  ...doc,
  ...(synced[doc.slug] || {}),
  notionMarkdown: synced[doc.slug]?.markdown,
}));
export const repository =
  "https://github.com/watanaberyunosuke/weave-digital-twins";
