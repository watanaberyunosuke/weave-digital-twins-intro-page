import { DocsLink } from "@/components/docs-link";
import { Network } from "@/components/network";
export default function Home() {
  return (
    <main id="main">
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-square" /> THE UTILITY NETWORK FIELD GUIDE
          </p>
          <h1>
            See the network.
            <br />
            Understand
            <br />
            <span>the behaviour.</span>
          </h1>
          <p className="hero-description">
            A framework for exploring utility digital twins. Connect public GIS,
            explicitly synthetic telemetry and hydraulic modelling in one
            traceable workflow.
          </p>
          <div className="hero-actions">
            <DocsLink className="button" href="/docs/getting-started/">
              Build your first twin <span>→</span>
            </DocsLink>
            <DocsLink className="text-link" href="/docs/architecture/">
              Explore the architecture ↗
            </DocsLink>
          </div>
          <div className="scope-tag">
            <span>IMPLEMENTED FOCUS</span>
            <strong>Water networks · EPANET</strong>
          </div>
        </div>
        <Network />
      </section>
      <section className="provenance-strip">
        <div className="container">
          <p>
            Real geography.
            <br />
            <strong>Visible assumptions.</strong>
          </p>
          <div>
            <span className="data-label real">REAL</span>
            <p>
              Public network geometry
              <br />
              and source observations
            </p>
          </div>
          <div>
            <span className="data-label synthetic">SYNTHETIC</span>
            <p>
              Derived zones, meter locations
              <br />
              and generated readings
            </p>
          </div>
          <div>
            <span className="data-label modelled">MODELLED</span>
            <p>
              Hydraulic calculations
              <br />
              under stated assumptions
            </p>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / THE METHOD</p>
            <h2>
              A twin you can
              <br />
              trace back to its source.
            </h2>
          </div>
          <p>
            Follow each layer from published geometry to a residual worth
            investigating. No hidden switch from generated data to measured
            truth.
          </p>
        </div>
        <div className="method-grid">
          <article>
            <span className="step-number">01</span>
            <h3>Ground it in geography</h3>
            <p>
              Load public GIS into PostGIS. Derive pipe connectivity and place
              synthetic meters on the real network geometry.
            </p>
            <DocsLink href="/docs/regions/">Configure a region ↗</DocsLink>
          </article>
          <article>
            <span className="step-number">02</span>
            <h3>Connect the observations</h3>
            <p>
              Stream adapter and Datagen feeds through Kafka and Flink,
              preserving the distinction between real and synthetic telemetry.
            </p>
            <DocsLink href="/docs/telemetry/">Follow the pipeline ↗</DocsLink>
          </article>
          <article>
            <span className="step-number">03</span>
            <h3>Make the model explainable</h3>
            <p>
              Run EPANET with current meter-derived demands. Assess pressure
              residuals against each DMA’s own history.
            </p>
            <DocsLink href="/docs/modelling/">Understand the method ↗</DocsLink>
          </article>
        </div>
      </section>
      <section className="architecture-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / SYSTEM MAP</p>
              <h2>
                One workflow.
                <br />
                Clear boundaries.
              </h2>
            </div>
            <DocsLink className="text-link" href="/docs/architecture/">
              Read the architecture ↗
            </DocsLink>
          </div>
          <div className="system-flow">
            <div>
              <span>FOUNDATION</span>
              <h3>GIS → PostGIS</h3>
              <p>
                Geometry, connectivity
                <br />
                and device registries
              </p>
            </div>
            <b aria-hidden="true">→</b>
            <div>
              <span>OBSERVATIONS</span>
              <h3>Kafka → Flink</h3>
              <p>
                Real and synthetic feeds
                <br />
                into TimescaleDB
              </p>
            </div>
            <b aria-hidden="true">→</b>
            <div>
              <span>CALCULATION</span>
              <h3>EPANET</h3>
              <p>
                Hydraulic solves
                <br />
                and pressure residuals
              </p>
            </div>
            <b aria-hidden="true">→</b>
            <div>
              <span>INSPECTION</span>
              <h3>Console & GIS</h3>
              <p>
                Map, freshness, flags
                <br />
                and ELK read copy
              </p>
            </div>
          </div>
          <div className="system-footnote">
            <span>Postgres is the system of record.</span>
            <p>
              Storage observations use a direct batch path. Elasticsearch holds
              a derived copy for inspection.
            </p>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / FIND YOUR PATH</p>
            <h2>
              From curious
              <br />
              to configured.
            </h2>
          </div>
          <p>
            A practical guide for understanding the framework, running a local
            stack and adapting it to a region.
          </p>
        </div>
        <div className="path-grid">
          <DocsLink href="/docs/concepts/">
            <span className="eyebrow">UNDERSTAND</span>
            <h3>New to digital twins?</h3>
            <p>
              Start with assets, provenance and what the model can tell you.
            </p>
            <span className="path-arrow">↗</span>
          </DocsLink>
          <DocsLink href="/docs/getting-started/">
            <span className="eyebrow">BUILD</span>
            <h3>Run Weave locally</h3>
            <p>
              Prepare the stack, bootstrap a network and verify the pipeline.
            </p>
            <span className="path-arrow">↗</span>
          </DocsLink>
          <DocsLink href="/docs/regions/">
            <span className="eyebrow">ADAPT</span>
            <h3>Bring a new region</h3>
            <p>Configure public sources, derive topology and inspect supply.</p>
            <span className="path-arrow">↗</span>
          </DocsLink>
        </div>
      </section>
      <section className="limits-section container">
        <div>
          <p className="eyebrow">SCOPE / READ BEFORE YOU BUILD</p>
          <h2>
            Useful exploration.
            <br />
            Honest limits.
          </h2>
        </div>
        <div>
          <p>
            The current hydraulic implementation is for{" "}
            <strong>water networks using EPANET</strong>. Electricity and
            transport asset schemas provide an extension foundation; their
            simulation models require further work.
          </p>
          <p>
            Published topology may have gaps. Model defaults need review.
            Residual flags are investigation cues, and synthetic observations do
            not validate field detection accuracy.
          </p>
          <DocsLink className="text-link" href="/docs/modelling/">
            Read assumptions and limits ↗
          </DocsLink>
        </div>
      </section>
      <section className="closing container">
        <div>
          <p className="eyebrow">OPEN THE FIELD GUIDE</p>
          <h2>
            Start with the network.
            <br />
            Keep the context.
          </h2>
        </div>
        <DocsLink className="button" href="/docs/">
          Explore the documentation →
        </DocsLink>
      </section>
    </main>
  );
}
