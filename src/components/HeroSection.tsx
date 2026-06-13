"use client";

type HeroSectionProps = {
  onGetStarted: () => void;
  onGenerateReport: () => void;
};

const previewRows = [
  { label: "Profile intake", value: "Ready", width: "w-[92%]" },
  { label: "Career map", value: "Live", width: "w-[78%]" },
  { label: "Portfolio plan", value: "Built", width: "w-[66%]" },
];

export function HeroSection({
  onGetStarted,
  onGenerateReport,
}: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 py-16 lg:grid-cols-[0.94fr_1.06fr] lg:py-24">
        <div className="max-w-3xl">
          <nav className="mb-16 flex items-center justify-between gap-5 text-sm text-aimura-muted">
            <a className="text-xl font-semibold tracking-tight text-aimura-white" href="#top">
              Aimura AI
            </a>
            <div className="hidden items-center gap-7 md:flex">
              <a className="transition hover:text-aimura-white" href="#account">
                Account
              </a>
              <a className="transition hover:text-aimura-white" href="#wizard">
                Wizard
              </a>
              <a className="transition hover:text-aimura-white" href="#report">
                Report
              </a>
              <a className="transition hover:text-aimura-white" href="#safety">
                Safety
              </a>
            </div>
          </nav>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-aimura-white sm:text-6xl lg:text-7xl">
            Plan your study path. Build your career path.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-aimura-muted sm:text-lg">
            Aimura AI turns academics, interests, budget, country preferences,
            and dream roles into one explainable education-to-career pathway
            report with honest risks and a month-by-month readiness plan.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              className="aimura-focus-ring aimura-green-glow rounded-control bg-aimura-green px-7 py-4 text-sm font-semibold text-white transition hover:bg-aimura-mint"
              onClick={onGetStarted}
              type="button"
            >
              Get Started
            </button>
            <button
              className="aimura-focus-ring rounded-control border border-aimura-moss/70 px-7 py-4 text-sm font-semibold text-aimura-white transition hover:border-aimura-green hover:text-aimura-green"
              onClick={onGenerateReport}
              type="button"
            >
              Generate Report
            </button>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-3 gap-3 text-sm">
            {["Login + storage", "Free API signals", "Portfolio roadmap"].map((item) => (
              <div
                className="rounded-2xl border border-aimura-moss/30 bg-aimura-panel/70 px-4 py-3 text-aimura-muted"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 rounded-[3rem] bg-aimura-green/10 blur-3xl" />
          <div className="aimura-card relative overflow-hidden rounded-[2rem] p-4 sm:p-5">
            <div className="rounded-[1.5rem] border border-aimura-moss/40 bg-white p-4">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-aimura-muted">Pathway cockpit</p>
                  <h2 className="text-xl font-semibold text-aimura-white">
                    Your student OS
                  </h2>
                </div>
                <div className="rounded-control bg-aimura-green px-4 py-2 text-xs font-bold text-white">
                  Fresh
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr]">
                <div className="rounded-[1.25rem] border border-aimura-moss/30 bg-aimura-panel p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-aimura-green">
                    Wizard
                  </p>
                  <div className="mt-5 space-y-3">
                    {["Profile", "Interests", "Budget", "Review"].map(
                      (step, index) => (
                        <div
                          className="flex items-center gap-3 rounded-2xl border border-aimura-moss/20 bg-aimura-panel-2 p-3"
                          key={step}
                        >
                          <span
                            className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                              index === 1
                                ? "bg-aimura-green text-white"
                                : "bg-aimura-panel-2 text-aimura-muted"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="text-sm text-aimura-white">
                            {step}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-aimura-moss/30 bg-aimura-panel p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.22em] text-aimura-green">
                      Report
                    </p>
                    <span className="text-xs text-aimura-muted">After intake</span>
                  </div>
                  <div className="mt-5 space-y-5">
                    {previewRows.map((row) => (
                      <div key={row.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-aimura-muted">{row.label}</span>
                          <span className="text-aimura-white">{row.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-aimura-moss/20">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r from-aimura-green to-aimura-mint ${row.width}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-aimura-green/25 bg-aimura-green/10 p-4">
                    <p className="text-sm font-medium text-aimura-white">
                      Machine Learning Engineer
                    </p>
                    <p className="mt-1 text-xs leading-5 text-aimura-muted">
                      Achievable with a 2-4 year role ladder and early portfolio
                      evidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
