const path = require("path");
const fs = require("fs");
const { createRequire } = require("module");

const ROOT = "C:\\Users\\daniel\\Desktop\\projects\\dandev\\cruzcontroltours\\website\\nodejs-cruzcontroltours";
const rootRequire = createRequire(path.join(ROOT, "package.json"));
const ts = rootRequire("typescript");
rootRequire("zod");

const stubRouter = () => ({ get() {}, post() {}, put() {}, delete() {}, use() {} });
const cache = new Map();
function resolveFile(base) {
  for (const c of [`${base}.ts`, path.join(base, "index.ts")]) {
    try { if (fs.statSync(c).isFile()) return c; } catch {}
  }
  throw new Error("Unresolved: " + base);
}
function loadProject(file) {
  const full = resolveFile(file);
  if (cache.has(full)) return cache.get(full).exports;
  const src = fs.readFileSync(full, "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  cache.set(full, mod);
  const localRequire = (spec) => {
    if (spec === "express") return { Router: stubRouter };
    if (spec.includes("service")) return {};
    if (spec.startsWith(".")) return loadProject(path.resolve(path.dirname(full), spec));
    return rootRequire(spec);
  };
  new Function("require", "module", "exports", js)(localRequire, mod, mod.exports);
  return mod.exports;
}

const { reviewSchema } = loadProject(path.join(ROOT, "src/routes/v1/review-routes"));
const { protocolSchema } = loadProject(path.join(ROOT, "src/routes/v1/protocol-routes"));
const { categorySchema } = loadProject(path.join(ROOT, "src/routes/v1/category-routes"));
const { departureSchema } = loadProject(path.join(ROOT, "src/routes/v1/departure-routes"));
const { faqSchema } = loadProject(path.join(ROOT, "src/routes/v1/faq-routes"));
const { bookingCreateSchema } = loadProject(path.join(ROOT, "src/routes/v1/booking-routes"));
const { rentalSchema } = loadProject(path.join(ROOT, "src/routes/v1/rental-routes"));
const { coversCriteria } = loadProject(path.join(ROOT, "src/controllers/review-controller"));

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
}

const UUID_1 = "11111111-1111-4111-8111-111111111111";
const UUID_2 = "22222222-2222-4222-8222-222222222222";
const goodReview = {
  tourId: UUID_1, bookingId: UUID_2, userId: "user_abc",
  ratings: [{ criterion: "Guide", score: 5 }, { criterion: "Food", score: 4 }],
  comment: "Great",
};
check("R1 valid review", reviewSchema.safeParse(goodReview).success);
check("R2 score 0 fails", !reviewSchema.safeParse({ ...goodReview, ratings: [{ criterion: "Guide", score: 0 }] }).success);
check("R3 score 6 fails", !reviewSchema.safeParse({ ...goodReview, ratings: [{ criterion: "Guide", score: 6 }] }).success);
const coerced = reviewSchema.safeParse({ ...goodReview, ratings: [{ criterion: "Guide", score: "3" }] });
check("R4 coerce score", coerced.success && coerced.data.ratings[0].score === 3 && coerced.data.tourId === UUID_1);
check("R4b non-uuid tourId fails", !reviewSchema.safeParse({ ...goodReview, tourId: "1" }).success);
check("R5 empty ratings fails", !reviewSchema.safeParse({ ...goodReview, ratings: [] }).success);
check("R6 missing userId fails", (() => { const b = { ...goodReview }; delete b.userId; return !reviewSchema.safeParse(b).success; })());
check("R7 no comment passes", (() => { const b = { ...goodReview }; delete b.comment; return reviewSchema.safeParse(b).success; })());

check("C1 exact coverage", coversCriteria(["Guide", "Food"], [{ criterion: "Guide" }, { criterion: "Food" }]) === true);
check("C2 missing fails", coversCriteria(["Guide", "Food"], [{ criterion: "Guide" }]) === false);
check("C3 extra fails", coversCriteria(["Guide"], [{ criterion: "Guide" }, { criterion: "Food" }]) === false);
check("C4 duplicate fails", coversCriteria(["Guide", "Food"], [{ criterion: "Guide" }, { criterion: "Guide" }]) === false);
check("C5 wrong name fails", coversCriteria(["Guide"], [{ criterion: "guide" }]) === false);

const goodCat = { name: "Adventure", slug: "adventure", description: "Fun" };
check("G1 valid category", categorySchema.safeParse(goodCat).success);
check("G2 bad slug fails", !categorySchema.safeParse({ ...goodCat, slug: "My Slug!" }).success);
check("G3 missing name fails", !categorySchema.safeParse({ slug: "x" }).success);

const goodDep = { tourId: UUID_1, startDate: "2026-12-01", endDate: "2026-12-05", capacity: 20 };
check("D1 valid departure", departureSchema.safeParse(goodDep).success);
check("D2 end<start fails", !departureSchema.safeParse({ ...goodDep, endDate: "2026-11-30" }).success);
check("D3 bad date fails", !departureSchema.safeParse({ ...goodDep, startDate: "12/01/2026" }).success);
check("D4 capacity 0 fails", !departureSchema.safeParse({ ...goodDep, capacity: 0 }).success);
check("D5 bad override fails", !departureSchema.safeParse({ ...goodDep, priceOverride: "abc" }).success);
check("D6 null override passes", departureSchema.safeParse({ ...goodDep, priceOverride: null }).success);

check("F1 valid faq", faqSchema.safeParse({ question: "Q?", answer: "A." }).success);
check("F2 empty question fails", !faqSchema.safeParse({ question: " ", answer: "A." }).success);

const goodBooking = { tourId: UUID_1, userId: "cli_123", guests: 2, totalPrice: "120.00" };
check("B1 valid booking", bookingCreateSchema.safeParse(goodBooking).success);
check("B2 missing tourId fails", !bookingCreateSchema.safeParse({ userId: "x", guests: 1, totalPrice: "10" }).success);
check("B3 non-uuid tourId fails", !bookingCreateSchema.safeParse({ ...goodBooking, tourId: "1" }).success);
check("B4 guests 0 fails", !bookingCreateSchema.safeParse({ ...goodBooking, guests: 0 }).success);

const goodRental = { date: "2026-12-01", time: "14:30", customerName: "Ana", pickupPlace: "Aeropuerto", destination: "Hotel" };
check("N1 valid rental", rentalSchema.safeParse(goodRental).success);
check("N2 missing customer fails", !rentalSchema.safeParse({ date: "2026-12-01", time: "14:30", pickupPlace: "A", destination: "B" }).success);
check("N3 bad date fails", !rentalSchema.safeParse({ ...goodRental, date: "12/01/2026" }).success);
check("N4 bad time fails", !rentalSchema.safeParse({ ...goodRental, time: "25:00" }).success);
check("N5 bad status fails", !rentalSchema.safeParse({ ...goodRental, status: "lost" }).success);

check("P1 valid protocol", protocolSchema.safeParse({ tourId: UUID_2, title: "Safety" }).success);
check("P2 missing tourId fails", !protocolSchema.safeParse({ title: "Safety" }).success);
check("P3 non-uuid tourId fails", !protocolSchema.safeParse({ tourId: "2", title: "Safety" }).success);
check("P4 numeric tourId fails", !protocolSchema.safeParse({ tourId: 0, title: "Safety" }).success);

console.log(`\nTOTAL pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
