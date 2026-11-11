const fallbackExamples = [
  {
    id: "mul2x2",
    label: "2x2 multiplier",
    title: "Unsigned 2x2 multiplier",
    description:
      "A compact AIG for a 2-bit multiplier. The internal nodes show how AND terms and carry logic become polynomial constraints.",
    stageNote:
      "This example is small enough to discuss every gate, but still shows non-trivial elimination and rewriting steps.",
    nodes: [
      { id: "a0", label: "a0", type: "input", x: 90, y: 86, role: "Primary input", signal: "Bit a0", polynomial: "a0 - a0 = 0" },
      { id: "a1", label: "a1", type: "input", x: 90, y: 166, role: "Primary input", signal: "Bit a1", polynomial: "a1 - a1 = 0" },
      { id: "b0", label: "b0", type: "input", x: 90, y: 246, role: "Primary input", signal: "Bit b0", polynomial: "b0 - b0 = 0" },
      { id: "b1", label: "b1", type: "input", x: 90, y: 326, role: "Primary input", signal: "Bit b1", polynomial: "b1 - b1 = 0" },
      { id: "n1", label: "n1", type: "and", x: 260, y: 76, role: "Partial product", signal: "a0 AND b0", polynomial: "n1 - a0*b0 = 0" },
      { id: "n2", label: "n2", type: "and", x: 260, y: 156, role: "Partial product", signal: "a0 AND b1", polynomial: "n2 - a0*b1 = 0" },
      { id: "n3", label: "n3", type: "and", x: 260, y: 236, role: "Partial product", signal: "a1 AND b0", polynomial: "n3 - a1*b0 = 0" },
      { id: "n4", label: "n4", type: "and", x: 260, y: 316, role: "Partial product", signal: "a1 AND b1", polynomial: "n4 - a1*b1 = 0" },
      { id: "n5", label: "m1", type: "and", x: 440, y: 186, role: "Merged middle support", signal: "Encoded support for n2 and n3", polynomial: "m1 - (n2 + n3 - 2*n2*n3) = 0" },
      { id: "n6", label: "c1", type: "and", x: 440, y: 286, role: "Carry support", signal: "carry from n2 and n3", polynomial: "c1 - n2*n3 = 0" },
      { id: "p0", label: "p0", type: "output", x: 636, y: 80, role: "Output bit", signal: "Least significant product bit", polynomial: "p0 - n1 = 0" },
      { id: "p1", label: "p1", type: "output", x: 636, y: 182, role: "Output bit", signal: "Middle product bit", polynomial: "p1 - m1 = 0" },
      { id: "p2", label: "p2", type: "output", x: 636, y: 284, role: "Output bit", signal: "Third product bit", polynomial: "p2 - (n4 + c1 - 2*n4*c1) = 0" },
      { id: "p3", label: "p3", type: "output", x: 636, y: 364, role: "Output bit", signal: "Most significant product bit", polynomial: "p3 - n4*c1 = 0" }
    ],
    edges: [
      { from: "a0", to: "n1" },
      { from: "b0", to: "n1" },
      { from: "a0", to: "n2" },
      { from: "b1", to: "n2" },
      { from: "a1", to: "n3" },
      { from: "b0", to: "n3" },
      { from: "a1", to: "n4" },
      { from: "b1", to: "n4" },
      { from: "n2", to: "n5" },
      { from: "n3", to: "n5" },
      { from: "n2", to: "n6" },
      { from: "n3", to: "n6" },
      { from: "n1", to: "p0" },
      { from: "n5", to: "p1" },
      { from: "n4", to: "p2" },
      { from: "n6", to: "p2" },
      { from: "n4", to: "p3" },
      { from: "n6", to: "p3" }
    ],
    stages: [
      {
        name: "Extract gate constraints",
        summary: "Start from local gate equations and expose each AIG edge as a Boolean polynomial relation.",
        polynomials: [
          { label: "g1", expression: "n1 - a0*b0 = 0" },
          { label: "g2", expression: "n2 - a0*b1 = 0" },
          { label: "g3", expression: "n3 - a1*b0 = 0" },
          { label: "g4", expression: "n4 - a1*b1 = 0" },
          { label: "g5", expression: "m1 - (n2 + n3 - 2*n2*n3) = 0" },
          { label: "g6", expression: "c1 - n2*n3 = 0" },
          { label: "g7", expression: "p0 - n1 = 0" },
          { label: "g8", expression: "p1 - m1 = 0" },
          { label: "g9", expression: "p2 - (n4 + c1 - 2*n4*c1) = 0" },
          { label: "g10", expression: "p3 - n4*c1 = 0" }
        ]
      },
      {
        name: "Normalize Boolean structure",
        summary: "Replace XOR-style support nodes with equivalent polynomial identities over the Boolean ring.",
        polynomials: [
          { label: "n5", expression: "m1 - n2 - n3 + 2*n2*n3 = 0" },
          { label: "n6", expression: "c1 - n2*n3 = 0" },
          { label: "p1", expression: "p1 - m1 = 0" },
          { label: "p2", expression: "p2 - n4 - c1 + 2*n4*c1 = 0" },
          { label: "bool", expression: "x^2 - x = 0 for each internal signal x" }
        ]
      },
      {
        name: "Eliminate local signals",
        summary: "Substitute away m1 and c1 so output relations depend on fewer internal variables.",
        polynomials: [
          { label: "p0", expression: "p0 - a0*b0 = 0" },
          { label: "p1", expression: "p1 - n2 - n3 + 2*n2*n3 = 0" },
          { label: "p2", expression: "p2 - n4 - n2*n3 + 2*n4*n2*n3 = 0" },
          { label: "p3", expression: "p3 - n4*n2*n3 = 0" }
        ]
      },
      {
        name: "Substitute partial products",
        summary: "Rewrite remaining support variables by their input monomials to expose the arithmetic shape of the circuit.",
        polynomials: [
          { label: "p0", expression: "p0 - a0*b0 = 0" },
          { label: "p1", expression: "p1 - a0*b1 - a1*b0 + 2*a0*a1*b0*b1 = 0" },
          { label: "p2", expression: "p2 - a1*b1 - a0*a1*b0*b1 + 2*a0*a1*b0*b1 = 0" },
          { label: "p3", expression: "p3 - a0*a1*b0*b1 = 0" }
        ]
      }
    ]
  },
  {
    id: "mul3x2",
    label: "3x2 multiplier",
    title: "Unsigned 3x2 multiplier",
    description:
      "A slightly wider example with another layer of accumulation. It gives you a second graph to compare the preprocessing cadence.",
    stageNote:
      "This graph emphasizes how preprocessing reduces a larger internal support set before the final arithmetic rewrite.",
    nodes: [
      { id: "a0", label: "a0", type: "input", x: 76, y: 66, role: "Primary input", signal: "Bit a0", polynomial: "a0 - a0 = 0" },
      { id: "a1", label: "a1", type: "input", x: 76, y: 134, role: "Primary input", signal: "Bit a1", polynomial: "a1 - a1 = 0" },
      { id: "a2", label: "a2", type: "input", x: 76, y: 202, role: "Primary input", signal: "Bit a2", polynomial: "a2 - a2 = 0" },
      { id: "b0", label: "b0", type: "input", x: 76, y: 286, role: "Primary input", signal: "Bit b0", polynomial: "b0 - b0 = 0" },
      { id: "b1", label: "b1", type: "input", x: 76, y: 354, role: "Primary input", signal: "Bit b1", polynomial: "b1 - b1 = 0" },
      { id: "n1", label: "u0", type: "and", x: 224, y: 60, role: "Partial product", signal: "a0 AND b0", polynomial: "u0 - a0*b0 = 0" },
      { id: "n2", label: "u1", type: "and", x: 224, y: 126, role: "Partial product", signal: "a1 AND b0", polynomial: "u1 - a1*b0 = 0" },
      { id: "n3", label: "u2", type: "and", x: 224, y: 192, role: "Partial product", signal: "a2 AND b0", polynomial: "u2 - a2*b0 = 0" },
      { id: "n4", label: "v0", type: "and", x: 224, y: 272, role: "Partial product", signal: "a0 AND b1", polynomial: "v0 - a0*b1 = 0" },
      { id: "n5", label: "v1", type: "and", x: 224, y: 338, role: "Partial product", signal: "a1 AND b1", polynomial: "v1 - a1*b1 = 0" },
      { id: "n6", label: "v2", type: "and", x: 224, y: 404, role: "Partial product", signal: "a2 AND b1", polynomial: "v2 - a2*b1 = 0" },
      { id: "s1", label: "s1", type: "and", x: 404, y: 126, role: "Weight-1 sum", signal: "support for u1 and v0", polynomial: "s1 - (u1 + v0 - 2*u1*v0) = 0" },
      { id: "c1", label: "c1", type: "and", x: 404, y: 214, role: "Weight-1 carry", signal: "carry from u1 and v0", polynomial: "c1 - u1*v0 = 0" },
      { id: "s2", label: "s2", type: "and", x: 404, y: 300, role: "Weight-2 sum", signal: "support for u2, v1, c1", polynomial: "s2 - (u2 + v1 + c1 - 2*u2*v1 - 2*u2*c1 - 2*v1*c1 + 4*u2*v1*c1) = 0" },
      { id: "c2", label: "c2", type: "and", x: 404, y: 388, role: "Weight-2 carry", signal: "carry support into top weight", polynomial: "c2 - (u2*v1 + u2*c1 + v1*c1 - 2*u2*v1*c1) = 0" },
      { id: "p0", label: "p0", type: "output", x: 640, y: 64, role: "Output bit", signal: "Weight 2^0", polynomial: "p0 - u0 = 0" },
      { id: "p1", label: "p1", type: "output", x: 640, y: 140, role: "Output bit", signal: "Weight 2^1", polynomial: "p1 - s1 = 0" },
      { id: "p2", label: "p2", type: "output", x: 640, y: 244, role: "Output bit", signal: "Weight 2^2", polynomial: "p2 - s2 = 0" },
      { id: "p3", label: "p3", type: "output", x: 640, y: 334, role: "Output bit", signal: "Weight 2^3", polynomial: "p3 - (v2 + c2 - 2*v2*c2) = 0" },
      { id: "p4", label: "p4", type: "output", x: 640, y: 404, role: "Output bit", signal: "Weight 2^4", polynomial: "p4 - v2*c2 = 0" }
    ],
    edges: [
      { from: "a0", to: "n1" },
      { from: "b0", to: "n1" },
      { from: "a1", to: "n2" },
      { from: "b0", to: "n2" },
      { from: "a2", to: "n3" },
      { from: "b0", to: "n3" },
      { from: "a0", to: "n4" },
      { from: "b1", to: "n4" },
      { from: "a1", to: "n5" },
      { from: "b1", to: "n5" },
      { from: "a2", to: "n6" },
      { from: "b1", to: "n6" },
      { from: "n2", to: "s1" },
      { from: "n4", to: "s1" },
      { from: "n2", to: "c1" },
      { from: "n4", to: "c1" },
      { from: "n3", to: "s2" },
      { from: "n5", to: "s2" },
      { from: "c1", to: "s2" },
      { from: "n3", to: "c2" },
      { from: "n5", to: "c2" },
      { from: "c1", to: "c2" },
      { from: "n1", to: "p0" },
      { from: "s1", to: "p1" },
      { from: "s2", to: "p2" },
      { from: "n6", to: "p3" },
      { from: "c2", to: "p3" },
      { from: "n6", to: "p4" },
      { from: "c2", to: "p4" }
    ],
    stages: [
      {
        name: "Extract gate constraints",
        summary: "Record one polynomial for each local gate relation and each output attachment.",
        polynomials: [
          { label: "u", expression: "u0=a0*b0, u1=a1*b0, u2=a2*b0" },
          { label: "v", expression: "v0=a0*b1, v1=a1*b1, v2=a2*b1" },
          { label: "s1", expression: "s1 - (u1 + v0 - 2*u1*v0) = 0" },
          { label: "c1", expression: "c1 - u1*v0 = 0" },
          { label: "s2", expression: "s2 - (u2 + v1 + c1 - 2*u2*v1 - 2*u2*c1 - 2*v1*c1 + 4*u2*v1*c1) = 0" },
          { label: "c2", expression: "c2 - (u2*v1 + u2*c1 + v1*c1 - 2*u2*v1*c1) = 0" }
        ]
      },
      {
        name: "Normalize support terms",
        summary: "Use Boolean identities to make the carry and sum equations explicit over the ring.",
        polynomials: [
          { label: "bool", expression: "x^2 - x = 0 for all support variables" },
          { label: "s1", expression: "s1 - u1 - v0 + 2*u1*v0 = 0" },
          { label: "s2", expression: "Expanded cubic support at weight 2^2" },
          { label: "c2", expression: "Carry support polynomial collected by weight" }
        ]
      },
      {
        name: "Eliminate carries",
        summary: "Substitute c1 first, then c2, so output equations collapse toward direct input support.",
        polynomials: [
          { label: "p1", expression: "p1 - u1 - v0 + 2*u1*v0 = 0" },
          { label: "p2", expression: "p2 - s2(u2, v1, u1*v0) = 0" },
          { label: "p3", expression: "p3 - v2 - c2 + 2*v2*c2 = 0" },
          { label: "p4", expression: "p4 - v2*c2 = 0" }
        ]
      },
      {
        name: "Substitute partial products",
        summary: "Rewrite u- and v-signals by the primary inputs to expose the arithmetic footprint.",
        polynomials: [
          { label: "p0", expression: "p0 - a0*b0 = 0" },
          { label: "p1", expression: "p1 - a1*b0 - a0*b1 + 2*a0*a1*b0*b1 = 0" },
          { label: "p2", expression: "p2 - arithmetic support at weight 2^2 in a0,a1,a2,b0,b1" },
          { label: "p3", expression: "p3 - arithmetic support at weight 2^3 in a0,a1,a2,b0,b1" },
          { label: "p4", expression: "p4 - a1*a2*b0*b1 + higher-order Boolean-normalized support = 0" }
        ]
      }
    ]
  }
];

let examples = fallbackExamples;

const REDUNDANT_STAGE_NAMES = new Set([
  "Detect partial products",
  "Identify xor support"
]);

const state = {
  exampleIndex: 0,
  stageIndex: 0,
  microStepIndex: null,
  activeNodeId: null,
  zoom: null,
  phase: "preprocessing",
  // How many gates of the specification rewrite have been substituted.
  specStepIndex: 0
};

const examplePicker = document.querySelector("#examplePicker");
const phaseTabsPreprocessing = document.querySelector("#phaseTabsPreprocessing");
const phaseTabsSpecification = document.querySelector("#phaseTabsSpecification");
const preprocessingView = document.querySelector("#preprocessingView");
const specificationView = document.querySelector("#specificationView");
const stageList = document.querySelector("#stageList");
const polynomialList = document.querySelector("#polynomialList");

const specPolynomial = document.querySelector("#specPolynomial");
const specTermCount = document.querySelector("#specTermCount");
const specStepCaption = document.querySelector("#specStepCaption");
const specStepLabel = document.querySelector("#specStepLabel");
const specStepBack = document.querySelector("#specStepBack");
const specStepForward = document.querySelector("#specStepForward");
const specStepBackMany = document.querySelector("#specStepBackMany");
const specStepForwardMany = document.querySelector("#specStepForwardMany");
const specStepRunAll = document.querySelector("#specStepRunAll");
const specStepReset = document.querySelector("#specStepReset");
const specZoomOut = document.querySelector("#specZoomOut");
const specZoomIn = document.querySelector("#specZoomIn");
const specZoomLabel = document.querySelector("#specZoomLabel");
const specZoomFit = document.querySelector("#specZoomFit");

const pipelineUndoAll = document.querySelector("#pipelineUndoAll");
const pipelineRunAll = document.querySelector("#pipelineRunAll");
const stageSummary = document.querySelector("#stageSummary");
const polynomialTitle = document.querySelector("#polynomialTitle");
const polynomialCount = document.querySelector("#polynomialCount");
const exampleTitle = document.querySelector("#exampleTitle");
const exampleDescription = document.querySelector("#exampleDescription");

const nodeName = document.querySelector("#nodeName");
const nodeRole = document.querySelector("#nodeRole");
const nodePolynomial = document.querySelector("#nodePolynomial");
const nodeSignal = document.querySelector("#nodeSignal");
const nodeParents = document.querySelector("#nodeParents");
const nodeChildren = document.querySelector("#nodeChildren");
const nodeInspector = document.querySelector("#nodeInspector");
const zoomOut = document.querySelector("#zoomOut");
const zoomIn = document.querySelector("#zoomIn");
const zoomReset = document.querySelector("#zoomReset");
const zoomLabel = document.querySelector("#zoomLabel");
const graphCard = document.querySelector("#graphCard");
const specGraphCard = document.querySelector("#specGraphCard");

function currentExample() {
  return examples[state.exampleIndex];
}

function activeEdges() {
  const overlay = currentOverlay();
  // Nothing has been eliminated yet: show the original, graphviz-laid-out
  // AIG edges (with their pretty stored bezier points) instead of an empty
  // computed set.
  return overlay.rootUpdates.length ? overlay.edges : currentExample().edges;
}

// The last box of the preprocessing pipeline: every elimination applied, i.e.
// the polynomial set the specification is then rewritten with. It needs no
// data of its own - a stage without microSteps shows the state after all
// stages before it have fully run (computeOverlayForStage) - and, being
// last, it is where "Run all" lands.
const FINAL_STAGE_NAME = "Final preprocessed encoding";

function finalPreprocessedStage() {
  return {
    name: FINAL_STAGE_NAME,
    summary: "Every elimination applied: the final preprocessed encoding, which the specification is rewritten with.",
    polynomials: []
  };
}

function normalizeExample(example) {
  const stages = Array.isArray(example.stages)
    ? example.stages.filter((stage) => !REDUNDANT_STAGE_NAMES.has(stage.name))
    : [];
  const kept = stages.length ? stages : example.stages ?? [];
  const withFinal = kept.length && kept[kept.length - 1].name !== FINAL_STAGE_NAME ? [...kept, finalPreprocessedStage()] : kept;

  return {
    ...example,
    stages: withFinal
  };
}

function currentStage() {
  return currentExample().stages[state.stageIndex];
}

const VARIABLE_TOKEN_RE = /[A-Za-z][A-Za-z0-9]*/g;

function variableTokens(expression) {
  return [...new Set(expression.match(VARIABLE_TOKEN_RE) ?? [])];
}

function applyMicroStep(step, dimmed, live) {
  if (step.eliminated) {
    dimmed.add(step.eliminated);
    live.delete(step.eliminated);
  }
  (step.updates ?? []).forEach((update) => {
    live.set(update.nodeId, update.expression);
  });
}

// How many of the current stage's microSteps (if any) are applied. Defaults
// to "all of them" whenever the stage is entered via Back/Next/Run all/the
// example picker (state.microStepIndex reset to null) - the forward/back
// node buttons dial state.microStepIndex to a specific count instead.
function currentMicroStepLimit() {
  const total = currentStage().microSteps?.length ?? 0;
  if (state.microStepIndex === null || state.microStepIndex === undefined) {
    return total;
  }
  return Math.max(0, Math.min(total, state.microStepIndex));
}

let overlayCache = { example: null, stageIndex: null, microStepLimit: null, overlay: null };

// A rewired edge (gate -> a variable of its updated polynomial) is the same
// object in every overlay that has it, like the original AIG edges are, so
// renderGraph can update the drawn graph by edge identity instead of
// rebuilding it on every step.
const rewiredEdgeCache = new WeakMap();

function rewiredEdge(example, from, to) {
  let edges = rewiredEdgeCache.get(example);
  if (!edges) {
    edges = new Map();
    rewiredEdgeCache.set(example, edges);
  }
  const key = `${from} ${to}`;
  let edge = edges.get(key);
  if (!edge) {
    edge = { from, to, inverted: false };
    edges.set(key, edge);
  }
  return edge;
}

// Reduction-phase stages (Eliminate internal xor gates / Eliminate
// single-occurrence nodes / Eliminate no clear COI nodes) don't carry a full
// resnapshot of every gate alive at that point - with 40-150+ individual
// eliminations per phase, that blew examples.json up to tens of megabytes
// and stalled the page on load. Instead each stage carries its phase's
// eliminations as an ordered `microSteps` delta list (one gate eliminated,
// plus whichever gate(s) got a new polynomial, per step), and this replays
// deltas forward from the nearest checkpoint stage (one with a
// `dimmedNodes` array of its own) up through the current stage - fully
// applying any reduction-phase stage strictly before it, and applying only
// the current stage's own microSteps up to currentMicroStepLimit().
function computeOverlayForStage(stageIndex, microLimit) {
  const example = currentExample();
  const stages = example.stages;
  let checkpointIndex = stageIndex;
  while (checkpointIndex > 0 && !Object.prototype.hasOwnProperty.call(stages[checkpointIndex], "dimmedNodes")) {
    checkpointIndex -= 1;
  }

  const checkpoint = stages[checkpointIndex];
  const dimmed = new Set(checkpoint.dimmedNodes ?? []);
  const live = new Map((checkpoint.rootUpdates ?? []).map((update) => [update.nodeId, update.expression]));

  for (let index = checkpointIndex + 1; index < stageIndex; index += 1) {
    (stages[index].microSteps ?? []).forEach((step) => applyMicroStep(step, dimmed, live));
  }
  if (stageIndex > checkpointIndex) {
    const microSteps = stages[stageIndex].microSteps ?? [];
    for (let i = 0; i < microLimit; i += 1) {
      applyMicroStep(microSteps[i], dimmed, live);
    }
  }

  const aliveIds = new Set(example.nodes.map((node) => node.id).filter((id) => !dimmed.has(id)));
  const edges = [];

  // Edge convention (matches the original AIG data): `from` is the
  // consuming gate, `to` is the child it depends on - e.g. l18's
  // polynomial "-l18+b0*a0" produces edges {from:l18,to:a0} and
  // {from:l18,to:b0}. A gate that was never touched (never absorbed a
  // child - only single-fanout children ever get eliminated, so this is
  // exactly the gates whose fan-in hasn't changed) still has its original,
  // unrewired edges: keep those as-is rather than dropping them just
  // because they aren't in the delta trail.
  example.edges.forEach((edge) => {
    if (!live.has(edge.from) && aliveIds.has(edge.from)) {
      edges.push(edge);
    }
  });

  live.forEach((expression, name) => {
    variableTokens(expression).forEach((token) => {
      if (token === name || !aliveIds.has(token)) {
        return;
      }
      edges.push(rewiredEdge(example, name, token));
    });
  });

  return {
    dimmedNodes: [...dimmed],
    rootUpdates: [...live.entries()].map(([nodeId, expression]) => ({ nodeId, expression })),
    edges,
    // The same data as lookup structures, shared read-only by every caller.
    dimmedSet: dimmed,
    rootUpdatesMap: live
  };
}

// Keyed on the example object rather than its index: a circuit's entry is
// swapped from its manifest stub to the full data once it has been fetched.
function currentOverlay() {
  const microLimit = currentMicroStepLimit();
  const example = currentExample();
  if (
    overlayCache.example === example &&
    overlayCache.stageIndex === state.stageIndex &&
    overlayCache.microStepLimit === microLimit
  ) {
    return overlayCache.overlay;
  }

  const overlay = computeOverlayForStage(state.stageIndex, microLimit);
  overlayCache = { example, stageIndex: state.stageIndex, microStepLimit: microLimit, overlay };
  return overlay;
}

// The complete, fully-rewritten polynomial set once every preprocessing
// stage has run to completion - independent of wherever state.stageIndex /
// state.microStepIndex happen to be, so the Specification rewrite tab can
// always show the finished set rather than a mid-preprocessing snapshot.
const finalOverlayCache = new WeakMap();

function finalOverlay() {
  const example = currentExample();
  if (!finalOverlayCache.has(example)) {
    const lastIndex = example.stages.length - 1;
    const microSteps = example.stages[lastIndex].microSteps ?? [];
    finalOverlayCache.set(example, computeOverlayForStage(lastIndex, microSteps.length));
  }
  return finalOverlayCache.get(example);
}

// Shared, read-only - these used to be rebuilt on every call, including once
// per graph node, which made a render O(n^2) and froze the page on the
// 48k-node sp-ar-rc-64.
function currentStageDimmedSet() {
  return currentOverlay().dimmedSet;
}

function currentStageRootUpdatesMap() {
  return currentOverlay().rootUpdatesMap;
}

// One shared collator: localeCompare with options builds a new one on every
// call, which made sorting the ~48k polynomials of sp-ar-rc-64 take seconds.
const labelCollator = new Intl.Collator(undefined, { numeric: true });

function compareLabels(left, right) {
  return labelCollator.compare(left, right);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPolynomialExpression(expression) {
  return expression.replace(/^\s*\d+\s+/, "").trim();
}

const EXAMPLES_MANIFEST_URL = "./data/generated/examples.json";

// examples.json is a manifest of {id, label, title, nodeCount, file} entries;
// each circuit's data lives in its own file and is fetched the first time it
// is selected, so the page doesn't download sp-ar-rc-64 (~34 MB) up front.
// A manifest entry is replaced by the full example once it has loaded.
function isExampleLoaded(example) {
  return Array.isArray(example?.stages);
}

const exampleRequests = new Map();

function loadExample(index, list = examples) {
  const entry = list[index];
  if (isExampleLoaded(entry)) {
    return Promise.resolve(entry);
  }
  if (!exampleRequests.has(index)) {
    const url = new URL(entry.file, new URL(EXAMPLES_MANIFEST_URL, document.baseURI));
    const request = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        list[index] = normalizeExample(data);
        return list[index];
      })
      .finally(() => exampleRequests.delete(index));
    exampleRequests.set(index, request);
  }
  return exampleRequests.get(index);
}

// The circuit whose data is being fetched after a click, if any. Only the
// most recent click wins when several are in flight.
let pendingExampleIndex = null;

async function selectExample(index) {
  pendingExampleIndex = index;
  buildExamplePicker();
  try {
    await loadExample(index);
  } catch (error) {
    if (pendingExampleIndex === index) {
      pendingExampleIndex = null;
      buildExamplePicker();
      exampleDescription.textContent = `Could not load ${examples[index].label} (${error.message}).`;
    }
    return;
  }
  if (pendingExampleIndex !== index) {
    return;
  }
  pendingExampleIndex = null;
  state.exampleIndex = index;
  state.stageIndex = 0;
  state.microStepIndex = null;
  state.activeNodeId = null;
  state.zoom = null;
  state.specStepIndex = 0;
  render();
}

// The picker shows two rows: the assorted multiplier designs (including the
// faulty one) first, then the correct sp-ar-rc family by size. Within a row,
// circuits keep their order from the manifest.
const SP_AR_RC_FAMILY_RE = /^sp-ar-rc-\d+$/;

function pickerRows() {
  const indexed = examples.map((example, index) => ({ example, index }));
  return [
    indexed.filter(({ example }) => !SP_AR_RC_FAMILY_RE.test(example.id ?? "")),
    indexed.filter(({ example }) => SP_AR_RC_FAMILY_RE.test(example.id ?? ""))
  ].filter((row) => row.length);
}

function buildExamplePicker() {
  const buttonMarkup = ({ example, index }) => {
    const isLoading = index === pendingExampleIndex;
    const classes = ["pill-button", index === state.exampleIndex ? "active" : "", isLoading ? "loading" : ""]
      .filter(Boolean)
      .join(" ");
    const nodeCount = example.nodeCount ?? example.nodes?.length;
    const title = nodeCount ? ` title="${nodeCount.toLocaleString("en-US")} nodes"` : "";
    return `
      <button
        class="${classes}"
        type="button"
        data-example-index="${index}"${title}
        ${isLoading ? 'aria-busy="true"' : ""}
      >
        ${escapeHtml(example.label)}${isLoading ? " &hellip;" : ""}
      </button>
    `;
  };
  examplePicker.innerHTML = pickerRows()
    .map((row) => `<div class="picker-row">${row.map(buttonMarkup).join("")}</div>`)
    .join("");

  examplePicker.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      selectExample(Number(button.dataset.exampleIndex));
    });
  });
}

const PHASES = [
  { id: "preprocessing", label: "1. Preprocessing" },
  { id: "specification", label: "2. Specification rewrite" }
];

function buildPhaseTabs() {
  const markup = PHASES.map(
    (phase) => `
      <button
        class="pill-button ${phase.id === state.phase ? "active" : ""}"
        type="button"
        role="tab"
        aria-selected="${phase.id === state.phase}"
        data-phase-id="${phase.id}"
      >
        ${escapeHtml(phase.label)}
      </button>
    `
  ).join("");

  // Rendered inside both the preprocessing and specification boxes (rather
  // than once above them) so the tabs stay reachable no matter which box is
  // currently visible.
  [phaseTabsPreprocessing, phaseTabsSpecification].forEach((container) => {
    container.innerHTML = markup;
    container.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        state.phase = button.dataset.phaseId;
        render();
      });
    });
  });
}

let graphViewCache = null;

const nodeIdsCache = new WeakMap();

function exampleNodeIds(example) {
  if (!nodeIdsCache.has(example)) {
    nodeIdsCache.set(example, new Set(example.nodes.map((node) => node.id)));
  }
  return nodeIdsCache.get(example);
}

// The visible nodes/edges for the current example and stage.
function currentGraphView() {
  const example = currentExample();
  const overlay = currentOverlay();
  const cached = graphViewCache;
  if (cached && cached.example === example && cached.overlay === overlay) {
    return cached;
  }

  const ids = exampleNodeIds(example);
  graphViewCache = {
    example,
    overlay,
    ids,
    nodes: example.nodes,
    edges: activeEdges().filter((edge) => ids.has(edge.from) && ids.has(edge.to))
  };
  return graphViewCache;
}

function visibleNodeIds() {
  return currentGraphView().ids;
}

function visibleNodes() {
  return currentGraphView().nodes;
}

function visibleEdges() {
  return currentGraphView().edges;
}

function renderGraphToolbar() {
  const label = `${Math.round(state.zoom * 100)}%`;
  zoomLabel.textContent = label;
  specZoomLabel.textContent = label;
}

// The two ends of the preprocessing pipeline: the untouched gate-constraint
// set (stage 0, nothing applied) and the fully preprocessed set (last stage,
// every microStep applied) - the same end state finalOverlay() computes.
function pipelineStartState() {
  const stages = currentExample().stages;
  return { stageIndex: 0, microStepIndex: stages[0].microSteps?.length ? 0 : null };
}

function pipelineEndState() {
  const stages = currentExample().stages;
  const lastIndex = stages.length - 1;
  return { stageIndex: lastIndex, microStepIndex: stages[lastIndex].microSteps?.length ?? 0 };
}

function isPipelineAtStart() {
  return state.stageIndex === 0 && currentMicroStepLimit() === 0;
}

function isPipelineAtEnd() {
  const stages = currentExample().stages;
  const lastIndex = stages.length - 1;
  return state.stageIndex === lastIndex && currentMicroStepLimit() === (stages[lastIndex].microSteps?.length ?? 0);
}

function jumpPipelineTo(target) {
  state.stageIndex = target.stageIndex;
  state.microStepIndex = target.microStepIndex;
  render();
}

function renderPipelineControls() {
  pipelineUndoAll.disabled = isPipelineAtStart();
  pipelineRunAll.disabled = isPipelineAtEnd();
}

pipelineUndoAll.addEventListener("click", () => jumpPipelineTo(pipelineStartState()));
pipelineRunAll.addEventListener("click", () => jumpPipelineTo(pipelineEndState()));

function renderStageList() {
  const example = currentExample();
  stageList.innerHTML = example.stages
    .map((stage, index) => {
      const itemClass = [
        "stage-item",
        index === state.stageIndex ? "active" : "",
        index < state.stageIndex ? "done" : ""
      ]
        .filter(Boolean)
        .join(" ");

      const microTotal = stage.microSteps?.length ?? 0;
      const showMicroControls = index === state.stageIndex && microTotal > 0;
      const microCurrent = showMicroControls ? currentMicroStepLimit() : 0;

      const microControlsMarkup = showMicroControls
        ? `
          <div class="micro-step-controls">
            <button type="button" class="ghost-button micro-step-button micro-undo-all" aria-label="Undo all nodes" ${microCurrent === 0 ? "disabled" : ""}>&laquo;</button>
            <button type="button" class="ghost-button micro-step-button micro-back" aria-label="Apply previous node" ${microCurrent === 0 ? "disabled" : ""}>&larr;</button>
            <span class="chip toolbar-chip micro-step-label">${microCurrent} / ${microTotal}</span>
            <button type="button" class="ghost-button accent-button micro-step-button micro-forward" aria-label="Apply next node" ${microCurrent === microTotal ? "disabled" : ""}>&rarr;</button>
            <button type="button" class="ghost-button accent-button micro-step-button micro-run-all" aria-label="Run all nodes" ${microCurrent === microTotal ? "disabled" : ""}>&raquo;</button>
          </div>
        `
        : "";

      return `
        <li
          class="${itemClass}"
          title="${escapeHtml(stage.summary)}"
          data-stage-index="${index}"
          role="button"
          tabindex="0"
          aria-label="Run to ${escapeHtml(stage.name)}"
        >
          <div class="stage-marker" aria-hidden="true"></div>
          <div class="stage-name">
            <span>${escapeHtml(stage.name)}</span>
            <span class="stage-number">0${index + 1}</span>
          </div>
          ${microControlsMarkup}
        </li>
      `;
    })
    .join("");

  stageList.querySelectorAll(".stage-item").forEach((item) => {
    const index = Number(item.dataset.stageIndex);
    const stage = example.stages[index];
    const runToStage = () => {
      state.stageIndex = index;
      // Landing on a reduction-phase box should start unapplied (0/X) so the
      // node-by-node arrows are the only way to actually run its steps -
      // the box itself no longer auto-completes its own phase.
      state.microStepIndex = stage.microSteps?.length ? 0 : null;
      render();
    };
    item.addEventListener("click", runToStage);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        runToStage();
      }
    });

    const microUndoAll = item.querySelector(".micro-undo-all");
    const microBack = item.querySelector(".micro-back");
    const microForward = item.querySelector(".micro-forward");
    const microRunAll = item.querySelector(".micro-run-all");
    [microUndoAll, microBack, microForward, microRunAll].forEach((button) => {
      button?.addEventListener("keydown", (event) => event.stopPropagation());
    });
    microUndoAll?.addEventListener("click", (event) => {
      event.stopPropagation();
      state.microStepIndex = 0;
      render();
    });
    microBack?.addEventListener("click", (event) => {
      event.stopPropagation();
      state.microStepIndex = Math.max(0, currentMicroStepLimit() - 1);
      render();
    });
    microForward?.addEventListener("click", (event) => {
      event.stopPropagation();
      const total = currentStage().microSteps?.length ?? 0;
      state.microStepIndex = Math.min(total, currentMicroStepLimit() + 1);
      render();
    });
    microRunAll?.addEventListener("click", (event) => {
      event.stopPropagation();
      state.microStepIndex = currentStage().microSteps?.length ?? 0;
      render();
    });
  });
}

// Every node that can have a row, in label order. Labels never change, so
// this is sorted once per circuit rather than on every step (~48k labels on
// sp-ar-rc-64).
const polynomialNodesCache = new WeakMap();

function polynomialNodesInLabelOrder() {
  const example = currentExample();
  if (!polynomialNodesCache.has(example)) {
    polynomialNodesCache.set(
      example,
      example.nodes.filter((node) => node.type !== "input").sort((left, right) => compareLabels(left.label, right.label))
    );
  }
  return polynomialNodesCache.get(example);
}

// The stage's live polynomial set in decreasing label order, preceded by any
// stage-level equations that don't belong to a single node. `key` identifies
// a row across steps, `textKey` its text (which its height depends on; see
// renderPolynomialWindow).
function buildPolynomialEntries(dimmedNodes, rootUpdates, extraPolynomials) {
  const entries = [];
  const seen = new Set();

  polynomialNodesInLabelOrder().forEach((node) => {
    if (dimmedNodes.has(node.id)) {
      return;
    }
    const expression = formatPolynomialExpression(rootUpdates.get(node.id) ?? node.polynomial);
    if (!expression) {
      return;
    }
    const textKey = `${node.label}::${expression}`;
    if (seen.has(textKey)) {
      return;
    }
    seen.add(textKey);
    entries.push({ key: `node:${node.id}`, textKey, label: node.label, expression, nodeId: node.id });
  });

  extraPolynomials.forEach((entry) => {
    const expression = formatPolynomialExpression(entry.expression);
    const textKey = `${entry.label}::${expression}`;
    if (seen.has(textKey)) {
      return;
    }
    seen.add(textKey);
    entries.push({ key: `extra:${textKey}`, textKey, label: entry.label, expression, nodeId: null });
  });

  return entries.reverse();
}

// `entry.step`, when present, is the specification-rewrite step that
// substitutes this polynomial (Specification rewrite tab only).
function polynomialEntryMarkup(entry) {
  const nodeAttributes = entry.nodeId
    ? ` data-poly-node-id="${escapeHtml(entry.nodeId)}" tabindex="0" role="button" aria-label="highlight ${escapeHtml(entry.label)}"`
    : "";
  const stepAttribute = entry.step ? ` data-spec-step="${entry.step}"` : "";
  return `
      <article class="poly-item compact-line"${nodeAttributes}${stepAttribute}>
        <h4>${escapeHtml(entry.label)}</h4>
        <p>${escapeHtml(entry.expression)}</p>
      </article>
    `;
}

const rowTemplate = document.createElement("template");

function polynomialEntryElement(entry) {
  rowTemplate.innerHTML = polynomialEntryMarkup(entry);
  return rowTemplate.content.firstElementChild;
}

// ---------------------------------------------------------------------------
// The polynomial list
//
// It has a row per polynomial - ~48k on sp-ar-rc-64 - but only the rows in
// and around view are in the DOM, and scrolling swaps rows in and out.
// Creating and laying out every row took seconds on the large circuits, on
// every tab switch and "Undo all". Rows wrap, so their heights differ: each
// is measured once it has been drawn and remembered by its text, and a row
// never drawn yet is assumed to be of average height.
// ---------------------------------------------------------------------------

// The space below each row (.poly-list.compact .poly-window > .poly-item).
const POLY_ROW_GAP = 4;
// How far beyond the visible part of the list rows are drawn, above and
// below, in list heights.
const POLY_OVERSCAN = 1;
// The height assumed for rows before any has been measured.
const POLY_DEFAULT_ROW_HEIGHT = 38;

const polySpacer = document.createElement("div");
polySpacer.className = "poly-rows";
const polyWindow = document.createElement("div");
polyWindow.className = "poly-window";
polySpacer.append(polyWindow);
polynomialList.append(polySpacer);

const polyView = {
  // The list shown ("preprocessing" / "specification") and its circuit: the
  // same list is updated in place, another one starts at the top.
  kind: null,
  example: null,
  entries: [],
  // offsets[i] is where row i starts, offsets[entries.length] the total.
  offsets: new Float64Array(1),
  indexByKey: new Map(),
  indexByNode: new Map(),
  // Measured row heights, gap included, by entry.textKey, at rowWidth, and
  // the height assumed for the others: the average measured when the list
  // was shown (changing it as rows are measured would move every row).
  heights: new Map(),
  measuredSum: 0,
  estimate: POLY_DEFAULT_ROW_HEIGHT,
  rowWidth: 0,
  // The width a drawn row turned out to need, should a browser break lines
  // less often than polynomialRowWidth assumes.
  overflowWidth: 0,
  // The rows in the DOM, by entry key, as { element, entry }.
  rows: new Map(),
  highlightedNodeId: null,
  // Specification rewrite tab: rows up to this step are used.
  specStep: 0
};

// Shows `entries`. The list already shown (same tab and circuit) is updated
// in place, keeping the rows on screen where they are; any other list starts
// at its top. Returns whether it did the latter.
function showPolynomialEntries(title, entries, kind) {
  const example = currentExample();
  const fresh = polyView.kind !== kind || polyView.example !== example;
  polynomialTitle.textContent = title;
  polynomialCount.textContent = `${entries.length} eqs`;
  // The row at the top of the view stays there if it still exists.
  const anchor = fresh ? null : polynomialAnchor();
  if (fresh) {
    polyView.kind = kind;
    polyView.example = example;
    polyView.rows.forEach((row) => row.element.remove());
    polyView.rows.clear();
    polyView.overflowWidth = 0;
    if (polyView.heights.size) {
      polyView.estimate = polyView.measuredSum / polyView.heights.size;
    }
    polynomialList.scrollTop = 0;
  }
  polyView.entries = entries;
  polyView.indexByKey = new Map();
  polyView.indexByNode = new Map();
  entries.forEach((entry, index) => {
    polyView.indexByKey.set(entry.key, index);
    if (entry.nodeId) {
      polyView.indexByNode.set(entry.nodeId, index);
    }
  });
  // Without scrolling to it, unlike a hover (highlightPolynomialRow).
  polyView.highlightedNodeId = state.activeNodeId;
  sizePolynomialRows();
  layoutPolynomialRows();
  renderPolynomialWindow(anchor);
  return fresh;
}

// Rows are all as wide as the widest needs to be (or the panel, if wider).
// With every row in the DOM that was the rows' min-content width; with only
// some there it is worked out here. A row needs its label plus the longest
// stretch of its polynomial without a line break opportunity, and those only
// come after a "-" (or at a space): some polynomials have none for hundreds
// of characters. Measuring the text of all ~48k rows would take a while, so
// only the rows with the most characters in such a stretch are measured.
const POLY_WIDTH_CANDIDATES = 32;
const rowTextInfo = new Map(); // entry.textKey -> { piece, chars, width }
let rowMetrics = null;

function longestUnbreakablePiece(text) {
  let longest = "";
  let start = 0;
  const take = (end) => {
    if (end - start > longest.length) {
      longest = text.slice(start, end);
    }
  };
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === " ") {
      take(index);
      start = index + 1;
    } else if (char === "-") {
      take(index + 1);
      start = index + 1;
    }
  }
  take(text.length);
  return longest;
}

function polynomialRowInfo(entry) {
  let info = rowTextInfo.get(entry.textKey);
  if (!info) {
    const piece = longestUnbreakablePiece(entry.expression);
    info = { piece, chars: entry.label.length + piece.length, width: 0 };
    rowTextInfo.set(entry.textKey, info);
  }
  return info;
}

// The fonts of a row's label and text, and its padding, borders and gap.
function polynomialRowMetrics() {
  if (!rowMetrics) {
    const probe = polynomialEntryElement({ label: "x", expression: "x", nodeId: null });
    polyWindow.append(probe);
    const label = probe.querySelector("h4");
    const text = probe.querySelector("p");
    const font = (element) => {
      const style = getComputedStyle(element);
      return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    };
    rowMetrics = {
      context: document.createElement("canvas").getContext("2d"),
      labelFont: font(label),
      textFont: font(text),
      chrome: probe.getBoundingClientRect().width - label.getBoundingClientRect().width - text.getBoundingClientRect().width
    };
    probe.remove();
  }
  return rowMetrics;
}

function polynomialRowWidth(entries) {
  // The candidates, fewest characters first.
  const candidates = [];
  entries.forEach((entry) => {
    const info = polynomialRowInfo(entry);
    if (candidates.length === POLY_WIDTH_CANDIDATES) {
      if (info.chars <= candidates[0].info.chars) {
        return;
      }
      candidates.shift();
    }
    let position = candidates.length;
    while (position > 0 && candidates[position - 1].info.chars > info.chars) {
      position -= 1;
    }
    candidates.splice(position, 0, { info, label: entry.label });
  });
  const metrics = polynomialRowMetrics();
  const { context } = metrics;
  let widest = 0;
  candidates.forEach(({ info, label }) => {
    if (!info.width) {
      context.font = metrics.labelFont;
      const labelWidth = context.measureText(label).width;
      context.font = metrics.textFont;
      info.width = metrics.chrome + labelWidth + context.measureText(info.piece).width;
    }
    widest = Math.max(widest, info.width);
  });
  return Math.ceil(widest);
}

// Sets the rows' width. Row heights measured at another width no longer
// hold (rows wrap differently), so they are forgotten.
function sizePolynomialRows() {
  polySpacer.style.width = `${Math.max(polynomialRowWidth(polyView.entries), polyView.overflowWidth)}px`;
  const width = polySpacer.getBoundingClientRect().width;
  if (width !== polyView.rowWidth) {
    polyView.rowWidth = width;
    polyView.heights.clear();
    polyView.measuredSum = 0;
  }
}

function layoutPolynomialRows() {
  const { entries, heights, estimate } = polyView;
  const offsets = new Float64Array(entries.length + 1);
  let top = 0;
  for (let index = 0; index < entries.length; index += 1) {
    offsets[index] = top;
    top += heights.get(entries[index].textKey) ?? estimate;
  }
  offsets[entries.length] = top;
  polyView.offsets = offsets;
  polySpacer.style.height = `${top}px`;
}

function rememberRowHeight(textKey, height) {
  const previous = polyView.heights.get(textKey);
  if (previous === height) {
    return false;
  }
  polyView.measuredSum += height - (previous ?? 0);
  polyView.heights.set(textKey, height);
  return true;
}

// The row at `y` pixels from the top of the list (the first or last row for
// a `y` beyond them).
function polynomialRowAt(y) {
  const offsets = polyView.offsets;
  let low = 0;
  let high = polyView.entries.length - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (offsets[middle] <= y) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  return low;
}

// How far a row element is below the top of the list's visible area.
function rowViewportTop(element) {
  return element.getBoundingClientRect().top - polynomialList.getBoundingClientRect().top - polynomialList.clientTop;
}

// A row in view and how far the view starts above or below it. Rows are
// placed by an estimated height until they have been drawn, so drawing some
// moves the ones after them; keeping this row where it is on screen
// (renderPolynomialWindow) stops the list from jumping about. It is the
// first row in view whose height is known, as the rows above it may still
// change, or else the top one.
function polynomialAnchor() {
  const { entries, offsets, heights } = polyView;
  if (!entries.length) {
    return null;
  }
  const viewTop = polynomialList.scrollTop;
  const viewBottom = viewTop + polynomialList.clientHeight;
  let index = polynomialRowAt(viewTop);
  for (let row = index; row < entries.length && offsets[row] < viewBottom; row += 1) {
    if (heights.has(entries[row].textKey)) {
      index = row;
      break;
    }
  }
  return { key: entries[index].key, shift: viewTop - offsets[index] };
}

function placePolynomialAnchor(anchor) {
  const index = anchor ? polyView.indexByKey.get(anchor.key) : undefined;
  if (index !== undefined) {
    const top = polyView.offsets[index] + anchor.shift;
    if (Math.abs(polynomialList.scrollTop - top) > 0.5) {
      polynomialList.scrollTop = top;
    }
  }
}

// Brings the rows in the DOM in line with the entries and the scroll
// position (the rows in view, and a list height either side), keeping
// `anchor` (see polynomialAnchor) where it is on screen.
function renderPolynomialWindow(anchor = polynomialAnchor()) {
  // Each pass places the rows by the heights known so far and measures the
  // new ones; it takes one or two for the rows in view to stop moving.
  for (let pass = 0; pass < 4; pass += 1) {
    placePolynomialAnchor(anchor);
    if (!drawPolynomialRows()) {
      return;
    }
  }
  placePolynomialAnchor(anchor);
  drawPolynomialRows();
}

// Draws the rows in view and a list height either side; returns whether any
// turned out to have another height than they were placed by.
function drawPolynomialRows() {
  const { entries, rows } = polyView;
  const viewTop = polynomialList.scrollTop;
  const viewHeight = polynomialList.clientHeight;
  const first = polynomialRowAt(viewTop - POLY_OVERSCAN * viewHeight);
  const last = entries.length ? polynomialRowAt(viewTop + (1 + POLY_OVERSCAN) * viewHeight) + 1 : 0;

  const wanted = new Set();
  for (let index = first; index < last; index += 1) {
    wanted.add(entries[index].key);
  }
  rows.forEach((row, key) => {
    if (!wanted.has(key)) {
      row.element.remove();
      rows.delete(key);
    }
  });
  // Rows that stay are left in place (moving one would drop its focus); the
  // others are inserted around them, in entry order.
  const created = [];
  let next = polyWindow.firstElementChild;
  for (let index = first; index < last; index += 1) {
    const entry = entries[index];
    const row = rows.get(entry.key);
    if (row) {
      if (row.element !== next) {
        polyWindow.insertBefore(row.element, next);
      }
      if (row.entry.expression !== entry.expression) {
        row.element.querySelector("p").textContent = entry.expression;
      }
      row.entry = entry;
      decoratePolynomialRow(row.element, entry);
      next = row.element.nextElementSibling;
    } else {
      const element = polynomialEntryElement(entry);
      decoratePolynomialRow(element, entry);
      rows.set(entry.key, { element, entry });
      polyWindow.insertBefore(element, next);
      created.push(element);
    }
  }
  polyWindow.style.transform = `translateY(${polyView.offsets[first]}px)`;

  // A new row whose text sticks out: widen them all.
  const overflow = created.reduce((most, element) => Math.max(most, element.scrollWidth - element.clientWidth), 0);
  if (overflow > 1) {
    polyView.overflowWidth = polyView.rowWidth + overflow;
    sizePolynomialRows();
    layoutPolynomialRows();
    return true;
  }

  let measuredNew = false;
  for (let index = first; index < last; index += 1) {
    const entry = entries[index];
    const height = rows.get(entry.key).element.getBoundingClientRect().height + POLY_ROW_GAP;
    measuredNew = rememberRowHeight(entry.textKey, height) || measuredNew;
  }
  if (measuredNew) {
    layoutPolynomialRows();
    polyWindow.style.transform = `translateY(${polyView.offsets[first]}px)`;
  }
  return measuredNew;
}

polynomialList.addEventListener("scroll", () => renderPolynomialWindow(), { passive: true });

// Re-sizes the rows (see sizePolynomialRows) without moving the list.
function resizePolynomialRows() {
  const anchor = polynomialAnchor();
  sizePolynomialRows();
  layoutPolynomialRows();
  renderPolynomialWindow(anchor);
}

// The panel's width can change the rows' (see polynomialRowWidth).
new ResizeObserver(resizePolynomialRows).observe(polynomialList);

// Text measured before the web fonts were in is off.
document.fonts?.addEventListener("loadingdone", () => {
  rowMetrics = null;
  rowTextInfo.forEach((info) => {
    info.width = 0;
  });
  resizePolynomialRows();
});

// The classes of a row that depend on the state rather than its entry.
function decoratePolynomialRow(element, entry) {
  element.classList.toggle("active-link", entry.nodeId !== null && entry.nodeId === polyView.highlightedNodeId);
  if (entry.step) {
    element.classList.toggle("spec-used", entry.step <= polyView.specStep);
    element.classList.toggle("spec-current", entry.step === polyView.specStep);
  }
}

function polynomialRowElement(nodeId) {
  const index = polyView.indexByNode.get(nodeId);
  return index === undefined ? null : polyView.rows.get(polyView.entries[index].key)?.element ?? null;
}

// Scrolls the list - just the list, not the page - so that row `index` is in
// view, and returns its element.
function revealPolynomialRow(index) {
  const list = polynomialList;
  const top = polyView.offsets[index];
  const bottom = polyView.offsets[index + 1] - POLY_ROW_GAP;
  let scrollTop = list.scrollTop;
  if (top < scrollTop) {
    scrollTop = top;
  } else if (bottom > scrollTop + list.clientHeight) {
    scrollTop = bottom - list.clientHeight;
  }
  renderPolynomialWindow({ key: polyView.entries[index].key, shift: scrollTop - top });
  const element = polyView.rows.get(polyView.entries[index].key)?.element;
  if (!element) {
    return null;
  }
  // Rows not measured before were placed by the average height; now that
  // this one is drawn, make sure it really is in view.
  const elementTop = rowViewportTop(element);
  const elementBottom = elementTop + element.getBoundingClientRect().height;
  if (elementTop < 0) {
    list.scrollTop += elementTop;
  } else if (elementBottom > list.clientHeight) {
    list.scrollTop += elementBottom - list.clientHeight;
  }
  return element;
}

// Moves the hover highlight in the list to `nodeId`'s row (null: none) and
// scrolls that row into view.
function highlightPolynomialRow(nodeId) {
  if (polyView.highlightedNodeId === nodeId) {
    return;
  }
  polynomialRowElement(polyView.highlightedNodeId)?.classList.remove("active-link");
  polyView.highlightedNodeId = nodeId;
  const index = nodeId === null ? undefined : polyView.indexByNode.get(nodeId);
  if (index !== undefined) {
    revealPolynomialRow(index)?.classList.add("active-link");
  }
}

function renderPolynomialList() {
  const stage = currentStage();
  const entries = buildPolynomialEntries(currentStageDimmedSet(), currentStageRootUpdatesMap(), stage.polynomials ?? []);
  showPolynomialEntries(`${stage.name} active set`, entries, "preprocessing");
}

function setActiveNode(nodeId) {
  if (state.activeNodeId === nodeId) {
    return;
  }
  state.activeNodeId = nodeId;
  updateGraphHighlight();
  renderInspector();
}

// One set of delegated listeners for the whole list instead of six per row
// (tens of thousands of rows on the large circuits). Same behavior as the
// old per-row mouseenter/mouseleave/focus/blur/click/keydown handlers.
function polynomialRowOf(target) {
  return target instanceof Element ? target.closest("[data-poly-node-id]") : null;
}

polynomialList.addEventListener("mouseover", (event) => {
  const row = polynomialRowOf(event.target);
  if (row) {
    setActiveNode(row.dataset.polyNodeId);
  }
});
polynomialList.addEventListener("mouseout", (event) => {
  const row = polynomialRowOf(event.target);
  if (row && !row.contains(event.relatedTarget)) {
    setActiveNode(null);
  }
});
polynomialList.addEventListener("focusin", (event) => {
  const row = polynomialRowOf(event.target);
  if (row) {
    setActiveNode(row.dataset.polyNodeId);
  }
});
polynomialList.addEventListener("focusout", (event) => {
  if (polynomialRowOf(event.target)) {
    setActiveNode(null);
  }
});
polynomialList.addEventListener("click", (event) => {
  const row = polynomialRowOf(event.target);
  if (!row) {
    return;
  }
  setActiveNode(row.dataset.polyNodeId);
  if (state.phase === "specification" && row.dataset.specStep) {
    setSpecStep(Number(row.dataset.specStep));
  }
});
polynomialList.addEventListener("keydown", (event) => {
  const row = polynomialRowOf(event.target);
  if (!row) {
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    setActiveNode(row.dataset.polyNodeId);
  }
  if (event.key === "Escape") {
    setActiveNode(null);
  }
});

const nodeMapCache = new WeakMap();

function nodeMap() {
  const example = currentExample();
  if (!nodeMapCache.has(example)) {
    nodeMapCache.set(example, new Map(example.nodes.map((node) => [node.id, node])));
  }
  return nodeMapCache.get(example);
}

// Scanning the edges (~96k on sp-ar-rc-64) takes a millisecond or two; an
// index of every node's edges took ten to build after each step.
function nodeParentsFor(nodeId) {
  const map = nodeMap();
  return currentGraphView()
    .edges.filter((edge) => edge.to === nodeId)
    .map((edge) => map.get(edge.from)?.label || edge.from);
}

function nodeChildrenFor(nodeId) {
  const map = nodeMap();
  return currentGraphView()
    .edges.filter((edge) => edge.from === nodeId)
    .map((edge) => `${edge.inverted ? "!" : ""}${map.get(edge.to)?.label || edge.to}`);
}

function renderInspector() {
  const example = currentExample();
  const activeNode = state.activeNodeId === null ? undefined : nodeMap().get(state.activeNodeId);
  const rootUpdates = currentStageRootUpdatesMap();

  if (!activeNode) {
    nodeInspector.classList.add("is-empty");
    nodeName.textContent = "Hover over a node to examine details";
    nodeRole.textContent = example.stageNote;
    const firstRoot = rootUpdates.entries().next().value;
    nodePolynomial.textContent = firstRoot
      ? `${firstRoot[0]}: ${firstRoot[1]}`
      : "The underlying circuit polynomial will appear here.";
    nodeSignal.textContent = "-";
    nodeParents.textContent = "-";
    nodeChildren.textContent = "-";
    return;
  }

  nodeInspector.classList.remove("is-empty");
  const parents = nodeParentsFor(activeNode.id);
  const children = nodeChildrenFor(activeNode.id);
  const stagePolynomial = rootUpdates.get(activeNode.id);
  const displayedPolynomial = formatPolynomialExpression(stagePolynomial ?? activeNode.polynomial);
  nodeName.textContent = activeNode.label;
  nodeRole.textContent = activeNode.role;
  nodePolynomial.textContent = displayedPolynomial;
  nodeSignal.textContent = activeNode.signal;
  nodeParents.textContent = parents.length ? parents.join(", ") : "primary source";
  nodeChildren.textContent = children.length ? children.join(", ") : "leaf output";
}

function renderHeader() {
  const example = currentExample();
  const stage = currentStage();

  stageSummary.textContent = stage.summary;
  exampleTitle.textContent = example.title;
  exampleDescription.textContent = example.description;
}

function visibleGraphBounds(nodes, edges) {
  const xValues = [];
  const yValues = [];

  nodes.forEach((node) => {
    const width = node.width ?? 48;
    const height = node.height ?? 36;
    xValues.push(node.x - width / 2 - 22, node.x + width / 2 + 22);
    yValues.push(node.y - height / 2 - 22, node.y + height / 2 + 22);
  });

  edges.forEach((edge) => {
    if (edge.points?.length) {
      edge.points.forEach((point) => {
        xValues.push(point[0]);
        yValues.push(point[1]);
      });
    }
  });

  const minX = Math.min(...xValues);
  const minY = Math.min(...yValues);
  const maxX = Math.max(...xValues);
  const maxY = Math.max(...yValues);
  return {
    minX,
    minY,
    width: Math.max(240, maxX - minX),
    height: Math.max(240, maxY - minY)
  };
}

// The coordinate box a graph is drawn in: the generated layout's own size, or
// (hand-made toy examples) the bounds of what is drawn.
function graphViewBox(nodes, edges) {
  const example = currentExample();
  if (example.graphWidth && example.graphHeight) {
    return { minX: 0, minY: 0, width: example.graphWidth, height: example.graphHeight };
  }
  return visibleGraphBounds(nodes, edges);
}

function currentGraphSize() {
  const box = graphViewBox(visibleNodes(), visibleEdges());
  return { width: box.width, height: box.height };
}

// Above this many visible nodes, node labels are only drawn from
// LABEL_MIN_ZOOM up: below it they are a few pixels tall and unreadable.
const LABEL_NODE_LIMIT = 5000;
const LABEL_MIN_ZOOM = 0.5;

function labelsShown(nodeCount) {
  return nodeCount <= LABEL_NODE_LIMIT || state.zoom >= LABEL_MIN_ZOOM;
}

// The space around a graph inside its card.
const GRAPH_MARGIN = 12;

function fitZoom() {
  const graphSize = currentGraphSize();
  // Both tabs draw the same layout; measure whichever card is on screen.
  const card = state.phase === "specification" ? specGraphCard : graphCard;
  const availableWidth = Math.max(260, card.clientWidth - 2 * GRAPH_MARGIN);
  const availableHeight = Math.max(220, card.clientHeight - 2 * GRAPH_MARGIN);
  return Math.min(availableWidth / graphSize.width, availableHeight / graphSize.height, 1) * 0.98;
}

// A circuit always opens zoomed to fit its whole graph in the card, however
// small that makes it (sp-ar-rc-64 opens at about 3%). Both tabs share the
// zoom, since they draw the same layout.
const MIN_ZOOM = 0.005;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 1.25;

function ensureZoomInitialized() {
  if (typeof state.zoom === "number") {
    return;
  }

  state.zoom = Math.max(MIN_ZOOM, fitZoom());
}

// ---------------------------------------------------------------------------
// Drawing the graphs
//
// Both graphs (preprocessing and specification rewrite) are drawn on canvases
// rather than built from SVG elements: sp-ar-rc-64 has ~48k nodes and ~96k
// edges, and as SVG those took seconds to create and lay out, and up to a
// second to repaint on every hover, step, zoom and scroll. A canvas only
// covers the part of its card in view - it sticks to the card, while a
// spacer as big as the zoomed graph gives the card its scroll range - so a
// frame draws only what is on screen. The hover highlight is drawn on a
// second canvas on top, so moving the mouse never redraws the graph itself.
// ---------------------------------------------------------------------------

// What the graph shows about a node, one bit each (GraphCanvas.setNodeFlags).
const NODE_DIMMED = 1; // eliminated by preprocessing
const NODE_ROOT_UPDATED = 2; // given a new polynomial by preprocessing
const NODE_SPEC_REWRITTEN = 4; // already substituted into the specification
const NODE_SPEC_IN_CUT = 8; // a variable of the current specification polynomial
const NODE_SPEC_CURRENT = 16; // the gate substituted last
const NODE_FLAG_BITS = 5;

// Node types by their number in a scene (other types are drawn as gates).
const NODE_TYPES = ["and", "input", "output", "constant"];

const SHAPE_ELLIPSE = 0;
const SHAPE_RECT = 1;
const SHAPE_TRIANGLE = 2;

// The look of the graphs, in graph units (which the zoom scales) unless
// noted. Colours are CSS custom properties (graphPalette).
const EDGE_WIDTH = 2.1;
const EDGE_OPACITY = 0.84;
const EDGE_REWRITTEN_OPACITY = 0.22; // out of an already substituted gate
const EDGE_ACTIVE_WIDTH = 3.3;
const EDGE_DASH = [5, 6]; // inverted edges
const DASH_PERIOD = EDGE_DASH[0] + EDGE_DASH[1];
const BUBBLE_RADIUS = 4.2; // the inversion bubble at an inverted edge's child end
const BUBBLE_STROKE_WIDTH = 1.4;
const NODE_STROKE_WIDTH = 2;
const NODE_MARKED_STROKE_WIDTH = 4; // root-updated, in the cut, or hovered
const NODE_DIMMED_OPACITY = 0.2;
const NODE_REWRITTEN_OPACITY = 0.22;
const NODE_GLOW_BLUR = 10; // around the hovered node
const LABEL_FONT = '13px "IBM Plex Mono", monospace';
const LABEL_FONT_SIZE = 13;
const CUT_WIDTH = 2.5; // screen pixels, at every zoom
const CUT_DASH = [7, 6]; // screen pixels, at every zoom

// Level of detail for zoomed-out views of the large circuits, in device
// pixels. Nodes less than TINY_NODE_PX tall are drawn as squares of the same
// area, in the average colour of their fill and outline - or in their
// outline colour if that marks them (root-updated, in the cut, just
// substituted), so the marking still shows. Inversion bubbles with a radius
// under TINY_BUBBLE_PX become squares too. A dash pattern shorter than
// MIN_DASH_PX becomes a solid line (dashes that small look solid anyway).
// Labels smaller than MIN_LABEL_PX are left out.
const TINY_NODE_PX = 4;
const TINY_NODE_SCALE = [Math.sqrt(Math.PI / 4), 1, Math.SQRT1_2]; // by shape
const TINY_BUBBLE_PX = 1.5;
const MIN_DASH_PX = 3;
const MIN_LABEL_PX = 2;
// Edges are never drawn thinner than this (CSS pixels): fully zoomed out,
// sp-ar-rc-64's edges are a twentieth of a pixel wide and all but vanish.
const MIN_EDGE_PX = 0.1;
// Edges are cut off this far outside the view: CSS pixels plus graph units
// (the latter for line caps and inversion bubbles, which scale).
const EDGE_CLIP_MARGIN_PX = 16;
const EDGE_CLIP_MARGIN = 8;
// Edges per path when strokes are wider than a device pixel (strokeEdges),
// and nodes per path (paintNodes).
const EDGE_BATCH = 8;
const NODE_BATCH = 16;
// Zoomed out, the hovered node and its edges are drawn at least this big
// (CSS pixels), and a node counts as hovered when the pointer is within
// HOVER_SLOP_PX of it - for nodes smaller than SMALL_NODE_PX on screen.
const MIN_ACTIVE_EDGE_PX = 1.5;
const MIN_ACTIVE_NODE_PX = 4;
const HOVER_SLOP_PX = 3;
const SMALL_NODE_PX = 12;

function graphPalette() {
  const style = getComputedStyle(document.documentElement);
  const color = (name) => style.getPropertyValue(name).trim();
  return {
    edge: color("--edge"),
    ink: color("--ink"),
    bubble: color("--surface-strong"),
    teal: color("--teal"),
    highlight: color("--highlight"),
    cut: color("--cut"),
    glow: color("--node-glow"),
    stroke: color("--node-stroke"),
    andStroke: color("--node-and-stroke"),
    fills: NODE_TYPES.map((type) => color(`--node-${type}`))
  };
}

// A CSS colour as [r, g, b, a] (0-255, alpha 0-1), as a canvas reads it.
const colorReader = document.createElement("canvas").getContext("2d");

function parseColor(color) {
  colorReader.fillStyle = "#000";
  colorReader.fillStyle = color;
  const value = colorReader.fillStyle;
  if (value.startsWith("#")) {
    return [1, 3, 5].map((start) => parseInt(value.slice(start, start + 2), 16)).concat(1);
  }
  const [red, green, blue, alpha = 1] = value.match(/[\d.]+/g).map(Number);
  return [red, green, blue, alpha];
}

// `top` painted over `bottom`.
function colorOver(top, bottom) {
  const alpha = top[3] + bottom[3] * (1 - top[3]);
  const channel = (index) => (alpha ? (top[index] * top[3] + bottom[index] * bottom[3] * (1 - top[3])) / alpha : 0);
  return [channel(0), channel(1), channel(2), alpha];
}

// What an area made of `parts` ([colour, area] pairs) looks like from far
// enough away for them to merge, as a CSS colour.
function averageColor(parts) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;
  let total = 0;
  parts.forEach(([[r, g, b, a], area]) => {
    red += r * a * area;
    green += g * a * area;
    blue += b * a * area;
    alpha += a * area;
    total += area;
  });
  if (!alpha) {
    return "rgba(0, 0, 0, 0)";
  }
  return `rgba(${Math.round(red / alpha)}, ${Math.round(green / alpha)}, ${Math.round(blue / alpha)}, ${(alpha / total).toFixed(3)})`;
}

// A node of the given size with its outline, merged into one colour.
function mergedNodeColor(fill, stroke, strokeWidth, halfWidth, halfHeight) {
  const fillColor = parseColor(fill);
  const strokeColor = parseColor(stroke);
  const area = Math.PI * halfWidth * halfHeight;
  // Half the outline lies over the fill, half outside it.
  const halfRing = (Math.PI * (halfWidth + halfHeight) * strokeWidth) / 2;
  return averageColor([
    [fillColor, area - halfRing],
    [colorOver(strokeColor, fillColor), halfRing],
    [strokeColor, halfRing]
  ]);
}

// An inversion bubble merged into one colour: its outline ring and its fill.
function mergedBubbleColor(palette) {
  const inner = BUBBLE_RADIUS - BUBBLE_STROKE_WIDTH / 2;
  const outer = BUBBLE_RADIUS + BUBBLE_STROKE_WIDTH / 2;
  return averageColor([
    [parseColor(palette.ink), Math.PI * (outer ** 2 - inner ** 2)],
    [parseColor(palette.bubble), Math.PI * inner ** 2]
  ]);
}

// How a node is drawn, by its type number and flags; `halfWidth` and
// `halfHeight` are a typical node's, for the colour of tiny ones.
function nodeStyle(type, flags, palette, halfWidth, halfHeight) {
  const current = (flags & NODE_SPEC_CURRENT) !== 0;
  const marked = (flags & (NODE_ROOT_UPDATED | NODE_SPEC_IN_CUT)) !== 0;
  let stroke = type === 0 ? palette.andStroke : palette.stroke;
  if (marked) {
    stroke = palette.teal;
  }
  if (current) {
    stroke = palette.highlight;
  }
  let opacity = 1;
  if (flags & NODE_DIMMED) {
    opacity = NODE_DIMMED_OPACITY;
  } else if ((flags & NODE_SPEC_REWRITTEN) && !current) {
    opacity = NODE_REWRITTEN_OPACITY;
  }
  const fill = current ? palette.highlight : palette.fills[type];
  const strokeWidth = marked ? NODE_MARKED_STROKE_WIDTH : NODE_STROKE_WIDTH;
  return {
    fill,
    stroke,
    strokeWidth,
    opacity,
    text: type === 0 && !current ? palette.ink : "white",
    // The colour of the square a tiny node becomes.
    dot: marked || current ? stroke : mergedNodeColor(fill, stroke, strokeWidth, halfWidth, halfHeight)
  };
}

// A graph's nodes as flat arrays, for drawing and hit-testing tens of
// thousands of them quickly. `index` maps a node id to its position.
function buildGraphScene(nodes, box) {
  const count = nodes.length;
  const scene = {
    nodes,
    box,
    count,
    index: new Map(),
    x: new Float64Array(count),
    y: new Float64Array(count),
    halfWidth: new Float64Array(count),
    halfHeight: new Float64Array(count),
    shape: new Uint8Array(count),
    type: new Uint8Array(count),
    // The average node size, for the level of detail.
    nodeWidth: 48,
    nodeHeight: 36
  };
  let widths = 0;
  let heights = 0;
  nodes.forEach((node, index) => {
    const output = node.type === "output";
    const width = node.width ?? (output ? 60 : 48);
    const height = node.height ?? 36;
    const shape = node.shape ?? (output ? "rect" : "circle");
    scene.index.set(node.id, index);
    scene.x[index] = node.x;
    scene.y[index] = node.y;
    scene.halfWidth[index] = width / 2;
    scene.halfHeight[index] = height / 2;
    scene.shape[index] = shape === "triangle" ? SHAPE_TRIANGLE : shape === "box" || output ? SHAPE_RECT : SHAPE_ELLIPSE;
    scene.type[index] = Math.max(0, NODE_TYPES.indexOf(node.type));
    widths += width;
    heights += height;
  });
  if (count) {
    scene.nodeWidth = widths / count;
    scene.nodeHeight = heights / count;
  }
  return scene;
}

function traceNode(context, scene, index) {
  const x = scene.x[index];
  const y = scene.y[index];
  const halfWidth = scene.halfWidth[index];
  const halfHeight = scene.halfHeight[index];
  switch (scene.shape[index]) {
    case SHAPE_RECT:
      context.rect(x - halfWidth, y - halfHeight, 2 * halfWidth, 2 * halfHeight);
      break;
    case SHAPE_TRIANGLE:
      context.moveTo(x, y - halfHeight);
      context.lineTo(x + halfWidth, y + halfHeight);
      context.lineTo(x - halfWidth, y + halfHeight);
      context.closePath();
      break;
    default:
      context.moveTo(x + halfWidth, y);
      context.ellipse(x, y, halfWidth, halfHeight, 0, 0, 2 * Math.PI);
      context.closePath();
  }
}

// Whether a point is on a node's shape, grown by `margin` all round.
function pointInNode(scene, index, pointX, pointY, margin) {
  const dx = pointX - scene.x[index];
  const dy = pointY - scene.y[index];
  const halfWidth = scene.halfWidth[index] + margin;
  const halfHeight = scene.halfHeight[index] + margin;
  switch (scene.shape[index]) {
    case SHAPE_RECT:
      return Math.abs(dx) <= halfWidth && Math.abs(dy) <= halfHeight;
    case SHAPE_TRIANGLE:
      return Math.abs(dy) <= halfHeight && Math.abs(dx) <= (halfWidth * (dy + halfHeight)) / (2 * halfHeight);
    default:
      return (dx / halfWidth) ** 2 + (dy / halfHeight) ** 2 <= 1;
  }
}

// An edge's bounding box, the end its inversion bubble goes on, and - for an
// edge without stored points (the toy examples, and edges preprocessing
// rewires) - the curve it is drawn as. Worked out once and kept on the edge,
// whose endpoints never move.
const EDGE_GEOMETRY = Symbol("edgeGeometry");

function edgeGeometry(edge, scene) {
  let geometry = edge[EDGE_GEOMETRY];
  if (geometry) {
    return geometry;
  }
  let curve = null;
  let points = edge.points;
  if (!points?.length) {
    const from = scene.index.get(edge.from);
    const to = scene.index.get(edge.to);
    const fromX = scene.x[from];
    const fromY = scene.y[from];
    const toX = scene.x[to];
    const toY = scene.y[to];
    const controlX = (fromX + toX) / 2;
    curve = [fromX + 22, fromY, controlX, fromY, controlX - 20, toY, toX - 28, toY];
    points = [
      [curve[0], curve[1]],
      [curve[2], curve[3]],
      [curve[4], curve[5]],
      [curve[6], curve[7]]
    ];
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  points.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  const end = points[points.length - 1];
  geometry = { curve, minX, minY, maxX, maxY, endX: end[0], endY: end[1] };
  edge[EDGE_GEOMETRY] = geometry;
  return geometry;
}

// Traces the part of an edge inside `area` (graph units, a little larger
// than the view so the ends cut off stay out of sight). Many edges of the
// large circuits are thousands of units long, and stroking them in full -
// mostly off screen - made a zoomed-in frame take a fifth of a second. A
// dashed edge (`dashPeriod` > 0) is cut a whole number of dash periods from
// its start, so its dashes stay where they are as the view moves.
function traceEdge(context, edge, geometry, area, dashPeriod) {
  const inside = geometry.minX >= area.minX && geometry.maxX <= area.maxX && geometry.minY >= area.minY && geometry.maxY <= area.maxY;
  const curve = geometry.curve;
  if (curve) {
    if (inside || dashPeriod) {
      context.moveTo(curve[0], curve[1]);
      context.bezierCurveTo(curve[2], curve[3], curve[4], curve[5], curve[6], curve[7]);
    } else {
      traceCurveIn(context, curve, area);
    }
    return;
  }
  const points = edge.points;
  if (inside) {
    context.moveTo(points[0][0], points[0][1]);
    for (let index = 1; index < points.length; index += 1) {
      context.lineTo(points[index][0], points[index][1]);
    }
    return;
  }
  tracePolylineIn(context, points, area, dashPeriod);
}

// The parameter range [t0, t1] of a segment inside `area` (Liang-Barsky),
// as clippedStart / clippedEnd, or false when none of it is.
let clippedStart = 0;
let clippedEnd = 1;

function clipSegment(x0, y0, x1, y1, area) {
  clippedStart = 0;
  clippedEnd = 1;
  const dx = x1 - x0;
  const dy = y1 - y0;
  return (
    clipBoundary(-dx, x0 - area.minX) &&
    clipBoundary(dx, area.maxX - x0) &&
    clipBoundary(-dy, y0 - area.minY) &&
    clipBoundary(dy, area.maxY - y0)
  );
}

function clipBoundary(p, q) {
  if (p === 0) {
    return q >= 0;
  }
  const t = q / p;
  if (p < 0) {
    if (t > clippedEnd) {
      return false;
    }
    clippedStart = Math.max(clippedStart, t);
  } else {
    if (t < clippedStart) {
      return false;
    }
    clippedEnd = Math.min(clippedEnd, t);
  }
  return true;
}

// A polyline from its first point in `area` to its last (dashed: from a
// whole number of dash periods along it, at or before that first point).
function tracePolylineIn(context, points, area, dashPeriod) {
  let start = Infinity;
  let end = -Infinity;
  let travelled = 0;
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1];
    const [x1, y1] = points[index];
    const length = Math.hypot(x1 - x0, y1 - y0);
    if (clipSegment(x0, y0, x1, y1, area)) {
      start = Math.min(start, travelled + clippedStart * length);
      end = Math.max(end, travelled + clippedEnd * length);
    }
    travelled += length;
  }
  if (start > end) {
    return;
  }
  if (dashPeriod) {
    start = Math.floor(start / dashPeriod) * dashPeriod;
  }
  travelled = 0;
  let drawing = false;
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1];
    const [x1, y1] = points[index];
    const length = Math.hypot(x1 - x0, y1 - y0);
    const from = travelled;
    travelled += length;
    if (travelled < start) {
      continue;
    }
    if (!drawing) {
      const t = length ? (start - from) / length : 0;
      context.moveTo(x0 + t * (x1 - x0), y0 + t * (y1 - y0));
      drawing = true;
    }
    if (travelled >= end) {
      const t = length ? (end - from) / length : 1;
      context.lineTo(x0 + t * (x1 - x0), y0 + t * (y1 - y0));
      return;
    }
    context.lineTo(x1, y1);
  }
}

// The pieces of a cubic Bezier curve inside `area`: it is halved (de
// Casteljau) until a piece lies wholly inside or outside, or is tiny.
const CURVE_SPLIT_DEPTH = 12;
let curvePenX = NaN;
let curvePenY = NaN;

function traceCurveIn(context, curve, area) {
  curvePenX = NaN;
  curvePenY = NaN;
  traceCurvePiece(context, ...curve, area, CURVE_SPLIT_DEPTH);
}

function traceCurvePiece(context, x0, y0, x1, y1, x2, y2, x3, y3, area, depth) {
  const minX = Math.min(x0, x1, x2, x3);
  const maxX = Math.max(x0, x1, x2, x3);
  const minY = Math.min(y0, y1, y2, y3);
  const maxY = Math.max(y0, y1, y2, y3);
  if (maxX < area.minX || minX > area.maxX || maxY < area.minY || minY > area.maxY) {
    return;
  }
  if (!depth || (minX >= area.minX && maxX <= area.maxX && minY >= area.minY && maxY <= area.maxY)) {
    // Pieces next to each other along the curve make one subpath.
    if (x0 !== curvePenX || y0 !== curvePenY) {
      context.moveTo(x0, y0);
    }
    context.bezierCurveTo(x1, y1, x2, y2, x3, y3);
    curvePenX = x3;
    curvePenY = y3;
    return;
  }
  const ax = (x0 + x1) / 2;
  const ay = (y0 + y1) / 2;
  const bx = (x1 + x2) / 2;
  const by = (y1 + y2) / 2;
  const cx = (x2 + x3) / 2;
  const cy = (y2 + y3) / 2;
  const abx = (ax + bx) / 2;
  const aby = (ay + by) / 2;
  const bcx = (bx + cx) / 2;
  const bcy = (by + cy) / 2;
  const mx = (abx + bcx) / 2;
  const my = (aby + bcy) / 2;
  traceCurvePiece(context, x0, y0, ax, ay, abx, aby, mx, my, area, depth - 1);
  traceCurvePiece(context, mx, my, bcx, bcy, cx, cy, x3, y3, area, depth - 1);
}

// The SVG labels had dominant-baseline: middle, which puts the middle of the
// x-height on the anchor. Canvas text sits on its baseline instead, so labels
// go down by half the font's x-height (measured once the font is loaded).
let labelMiddle = 3.35;

function measureLabelFont() {
  const context = document.createElement("canvas").getContext("2d");
  context.font = LABEL_FONT;
  const xHeight = context.measureText("x").actualBoundingBoxAscent;
  if (xHeight > 0) {
    labelMiddle = xHeight / 2;
  }
}

// One graph card: the graph drawn on a canvas, the hover highlight on a
// second one above it, both kept in view while the card scrolls.
class GraphCanvas {
  // `highlightEdges`: hovering a node highlights its edges too.
  // `fadeRewrittenEdges`: edges out of NODE_SPEC_REWRITTEN gates fade.
  constructor(card, { highlightEdges, fadeRewrittenEdges }) {
    this.card = card;
    this.surface = card.querySelector(".graph-surface");
    this.viewport = card.querySelector(".graph-viewport");
    [this.base, this.overlay] = this.viewport.querySelectorAll("canvas");
    this.baseContext = this.base.getContext("2d");
    this.overlayContext = this.overlay.getContext("2d");
    this.highlightEdges = highlightEdges;
    this.fadeRewrittenEdges = fadeRewrittenEdges;

    this.scene = null;
    this.zoom = 1;
    this.edges = [];
    this.edgeSources = null;
    this.flags = new Uint8Array(0);
    this.labels = false;
    this.cut = null;
    this.activeIndex = -1;
    // The visible part of the card in CSS pixels, and device pixels per CSS
    // pixel.
    this.width = 0;
    this.height = 0;
    this.pixelRatio = 1;

    this.palette = null;
    this.styles = [];
    this.tinyBubbleColor = null;
    // Nodes in view grouped by style (type and flags), reused every frame.
    this.buckets = Array.from({ length: NODE_TYPES.length << NODE_FLAG_BITS }, () => []);
    this.frame = 0;
    this.baseStale = false;
    this.overlayStale = false;

    card.addEventListener("scroll", () => this.redraw(), { passive: true });
    // Drawn right away rather than in the next frame, so a card that has
    // just been shown or resized never shows an empty frame.
    new ResizeObserver(() => {
      this.layout();
      this.flush();
    }).observe(card);
    this.viewport.addEventListener("mousemove", (event) => this.hover(event));
    this.viewport.addEventListener("mouseleave", () => setActiveNode(null));
    this.viewport.addEventListener("click", (event) => {
      const nodeId = this.nodeAt(event.clientX, event.clientY);
      if (nodeId !== null) {
        setActiveNode(nodeId);
      }
    });
  }

  // Shows `scene` at `zoom`: a new one from its top left corner, the one
  // already shown just zoomed (see setZoom).
  show(scene, zoom) {
    // The card may have just been unhidden (a tab switch), which its
    // ResizeObserver only reports later.
    this.layout();
    if (scene === this.scene) {
      this.setZoom(zoom);
      return;
    }
    this.scene = scene;
    this.styles = [];
    this.zoom = zoom;
    this.edges = [];
    this.edgeSources = null;
    this.flags = new Uint8Array(scene.count);
    this.cut = null;
    this.activeIndex = -1;
    this.sizeSurface();
    this.card.scrollLeft = 0;
    this.card.scrollTop = 0;
    this.redraw();
  }

  clear() {
    this.scene = null;
    this.edges = [];
    this.edgeSources = null;
    this.cut = null;
    this.activeIndex = -1;
    this.sizeSurface();
    this.redraw();
  }

  // Zooms about the middle of the view, which stays on the same point of
  // the graph.
  setZoom(zoom) {
    if (zoom === this.zoom) {
      return;
    }
    const { card } = this;
    const anchor = this.scene && this.width && this.height ? this.toGraph(card.scrollLeft + this.width / 2, card.scrollTop + this.height / 2) : null;
    this.zoom = zoom;
    this.sizeSurface();
    if (anchor) {
      const point = this.toSurface(anchor.x, anchor.y);
      card.scrollLeft = point.x - this.width / 2;
      card.scrollTop = point.y - this.height / 2;
    }
    this.redraw();
  }

  setEdges(edges) {
    if (edges !== this.edges) {
      this.edges = edges;
      this.edgeSources = null;
      this.redraw();
    }
  }

  // One NODE_* bit set per scene node.
  setNodeFlags(flags) {
    if (flags !== this.flags) {
      this.flags = flags;
      this.redraw();
    }
  }

  setLabels(shown) {
    if (shown !== this.labels) {
      this.labels = shown;
      this.redraw();
    }
  }

  // The specification rewrite's cut line, a Path2D in graph units, or null.
  setCut(path) {
    this.cut = path;
    this.redraw();
  }

  setActive(nodeId) {
    const index = nodeId === null || !this.scene ? -1 : this.scene.index.get(nodeId) ?? -1;
    if (index !== this.activeIndex) {
      this.activeIndex = index;
      this.overlayStale = true;
      this.schedule();
    }
  }

  // Scrolls the card to put a node in the middle of the view, unless it is
  // in view and at least `margin` pixels from its edges already.
  scrollNodeIntoView(nodeId, margin) {
    const index = nodeId === null ? undefined : this.scene?.index.get(nodeId);
    if (index === undefined || !this.width || !this.height) {
      return;
    }
    const { card } = this;
    const point = this.toSurface(this.scene.x[index], this.scene.y[index]);
    if (point.x < card.scrollLeft + margin || point.x > card.scrollLeft + this.width - margin) {
      card.scrollLeft = Math.max(0, point.x - this.width / 2);
    }
    if (point.y < card.scrollTop + margin || point.y > card.scrollTop + this.height - margin) {
      card.scrollTop = Math.max(0, point.y - this.height / 2);
    }
  }

  // Fits the canvases to the visible part of the card.
  layout() {
    this.width = this.card.clientWidth;
    this.height = this.card.clientHeight;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.sizeSurface();
    this.viewport.style.width = `${this.width}px`;
    this.viewport.style.height = `${this.height}px`;
    const pixelWidth = Math.round(this.width * this.pixelRatio);
    const pixelHeight = Math.round(this.height * this.pixelRatio);
    [this.base, this.overlay].forEach((canvas) => {
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        // This also clears it.
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        this.baseStale = true;
      }
    });
    if (this.baseStale) {
      this.schedule();
    }
  }

  // The scroll range: the zoomed graph and its margin, or the card if that
  // is bigger.
  sizeSurface() {
    const box = this.scene?.box;
    const width = box ? box.width * this.zoom + 2 * GRAPH_MARGIN : 0;
    const height = box ? box.height * this.zoom + 2 * GRAPH_MARGIN : 0;
    this.surface.style.width = `${Math.max(this.width, width)}px`;
    this.surface.style.height = `${Math.max(this.height, height)}px`;
  }

  // Where the graph's box starts on the surface, in CSS pixels: inside the
  // margin, and centred across a card wider than the zoomed graph.
  origin() {
    const graphWidth = this.scene.box.width * this.zoom;
    return { x: GRAPH_MARGIN + Math.max(0, (this.width - 2 * GRAPH_MARGIN - graphWidth) / 2), y: GRAPH_MARGIN };
  }

  toGraph(surfaceX, surfaceY) {
    const origin = this.origin();
    const box = this.scene.box;
    return { x: box.minX + (surfaceX - origin.x) / this.zoom, y: box.minY + (surfaceY - origin.y) / this.zoom };
  }

  toSurface(x, y) {
    const origin = this.origin();
    const box = this.scene.box;
    return { x: origin.x + (x - box.minX) * this.zoom, y: origin.y + (y - box.minY) * this.zoom };
  }

  // Redraws the graph (and the highlight) in the next frame.
  redraw() {
    this.baseStale = true;
    this.schedule();
  }

  schedule() {
    if (!this.frame) {
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.flush();
      });
    }
  }

  // Draws whatever is out of date now.
  flush() {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
    if (this.baseStale) {
      this.baseStale = false;
      this.overlayStale = true;
      this.drawBase();
    }
    if (this.overlayStale) {
      this.overlayStale = false;
      this.drawOverlay();
    }
  }

  // Makes `context` draw in graph units, as the graph sits in view.
  applyTransform(context) {
    const scale = this.pixelRatio * this.zoom;
    const origin = this.origin();
    const box = this.scene.box;
    context.setTransform(
      scale,
      0,
      0,
      scale,
      this.pixelRatio * (origin.x - this.card.scrollLeft) - scale * box.minX,
      this.pixelRatio * (origin.y - this.card.scrollTop) - scale * box.minY
    );
  }

  // The part of the graph in view, in graph units, and (drawing) a margin
  // around it wide enough for whatever is cut off there to stay unseen.
  visibleArea(drawing = false) {
    const margin = drawing ? EDGE_CLIP_MARGIN_PX + EDGE_CLIP_MARGIN * this.zoom : 0;
    const topLeft = this.toGraph(this.card.scrollLeft - margin, this.card.scrollTop - margin);
    return {
      minX: topLeft.x,
      minY: topLeft.y,
      maxX: topLeft.x + (this.width + 2 * margin) / this.zoom,
      maxY: topLeft.y + (this.height + 2 * margin) / this.zoom
    };
  }

  // Whether nodes are too small on screen to show their shape.
  nodesAreTiny() {
    return this.scene.nodeHeight * this.zoom * this.pixelRatio < TINY_NODE_PX;
  }

  labelsVisible() {
    return this.labels && LABEL_FONT_SIZE * this.zoom * this.pixelRatio >= MIN_LABEL_PX;
  }

  nodeStyle(key) {
    this.palette ??= graphPalette();
    this.styles[key] ??= nodeStyle(key & 3, key >> 2, this.palette, this.scene.nodeWidth / 2, this.scene.nodeHeight / 2);
    return this.styles[key];
  }

  styleKey(index) {
    return (this.flags[index] << 2) | this.scene.type[index];
  }

  // Edges first, then the cut, then the nodes - only those in view.
  drawBase() {
    const context = this.baseContext;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, this.base.width, this.base.height);
    if (!this.scene || !this.width || !this.height) {
      return;
    }
    this.palette ??= graphPalette();
    const area = this.visibleArea(true);
    this.applyTransform(context);
    this.drawEdges(context, area);
    if (this.cut) {
      this.drawCut(context);
    }
    this.drawNodes(context, area);
  }

  drawEdges(context, area) {
    const { scene, flags, edges } = this;
    const reach = BUBBLE_RADIUS + BUBBLE_STROKE_WIDTH;
    const sources = this.fadeRewrittenEdges ? this.edgeSourceIndexes() : null;
    // Plain and inverted edges, and both again out of substituted gates.
    const groups = [[], [], [], []];
    for (let index = 0; index < edges.length; index += 1) {
      const edge = edges[index];
      const geometry = edgeGeometry(edge, scene);
      if (
        geometry.maxX + reach < area.minX ||
        geometry.minX - reach > area.maxX ||
        geometry.maxY + reach < area.minY ||
        geometry.minY - reach > area.maxY
      ) {
        continue;
      }
      const rewritten = sources !== null && (flags[sources[index]] & NODE_SPEC_REWRITTEN) !== 0;
      groups[(edge.inverted ? 1 : 0) + (rewritten ? 2 : 0)].push(edge);
    }
    groups.forEach((group, kind) => {
      if (group.length) {
        // Faded edges may fade all the way out.
        const rewritten = (kind & 2) !== 0;
        const width = rewritten ? EDGE_WIDTH : Math.max(EDGE_WIDTH, MIN_EDGE_PX / this.zoom);
        const opacity = rewritten ? EDGE_REWRITTEN_OPACITY : EDGE_OPACITY;
        this.strokeEdges(context, group, (kind & 1) === 1, opacity, this.palette.edge, width, area);
      }
    });
  }

  // Each edge's source gate, by its position in the scene.
  edgeSourceIndexes() {
    this.edgeSources ??= Int32Array.from(this.edges, (edge) => this.scene.index.get(edge.from) ?? 0);
    return this.edgeSources;
  }

  // Strokes edges of one look in one go, as far as they are in `area`:
  // inverted ones dashed, then their bubbles on top.
  strokeEdges(context, edges, inverted, opacity, color, width, area) {
    const scale = this.zoom * this.pixelRatio;
    const dashed = inverted && DASH_PERIOD * scale >= MIN_DASH_PX;
    context.globalAlpha = opacity;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.setLineDash(dashed ? EDGE_DASH : []);
    // Strokes thinner than a device pixel are fastest all in one path. Wider
    // ones, thousands in one path fall off the GPU's fast path (140 ms on
    // sp-ar-rc-64 at 50% zoom); in batches they take 18.
    const batch = width * scale > 1 ? EDGE_BATCH : edges.length;
    for (let start = 0; start < edges.length; start += batch) {
      context.beginPath();
      const end = Math.min(edges.length, start + batch);
      for (let index = start; index < end; index += 1) {
        traceEdge(context, edges[index], edgeGeometry(edges[index], this.scene), area, dashed ? DASH_PERIOD : 0);
      }
      context.stroke();
    }
    context.setLineDash([]);
    if (!inverted) {
      return;
    }
    const tiny = BUBBLE_RADIUS * scale < TINY_BUBBLE_PX;
    // A square with the area of the whole bubble, outline included.
    const half = (Math.sqrt(Math.PI) * (BUBBLE_RADIUS + BUBBLE_STROKE_WIDTH / 2)) / 2;
    context.beginPath();
    edges.forEach((edge) => {
      const { endX, endY } = edgeGeometry(edge, this.scene);
      if (endX < area.minX || endX > area.maxX || endY < area.minY || endY > area.maxY) {
        return;
      }
      if (tiny) {
        context.rect(endX - half, endY - half, 2 * half, 2 * half);
      } else {
        context.moveTo(endX + BUBBLE_RADIUS, endY);
        context.arc(endX, endY, BUBBLE_RADIUS, 0, 2 * Math.PI);
      }
    });
    if (tiny) {
      this.tinyBubbleColor ??= mergedBubbleColor(this.palette);
      context.fillStyle = this.tinyBubbleColor;
      context.fill();
      return;
    }
    context.fillStyle = this.palette.bubble;
    context.fill();
    context.lineWidth = BUBBLE_STROKE_WIDTH;
    context.strokeStyle = this.palette.ink;
    context.stroke();
  }

  drawCut(context) {
    context.globalAlpha = 1;
    context.strokeStyle = this.palette.cut;
    context.lineWidth = CUT_WIDTH / this.zoom;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.setLineDash(CUT_DASH.map((length) => length / this.zoom));
    context.stroke(this.cut);
    context.setLineDash([]);
  }

  drawNodes(context, area) {
    const { scene, buckets } = this;
    const { x, y, halfWidth, halfHeight } = scene;
    const reach = NODE_MARKED_STROKE_WIDTH;
    const keys = [];
    for (let index = 0; index < scene.count; index += 1) {
      if (
        x[index] + halfWidth[index] + reach < area.minX ||
        x[index] - halfWidth[index] - reach > area.maxX ||
        y[index] + halfHeight[index] + reach < area.minY ||
        y[index] - halfHeight[index] - reach > area.maxY
      ) {
        continue;
      }
      const key = this.styleKey(index);
      if (!buckets[key].length) {
        keys.push(key);
      }
      buckets[key].push(index);
    }
    const tiny = this.nodesAreTiny();
    keys.forEach((key) => this.paintNodes(context, buckets[key], this.nodeStyle(key), tiny));
    if (this.labelsVisible()) {
      keys.forEach((key) => this.paintLabels(context, buckets[key], this.nodeStyle(key)));
    }
    keys.forEach((key) => {
      buckets[key].length = 0;
    });
  }

  // Fills and outlines nodes of one style in one go.
  paintNodes(context, indexes, style, tiny) {
    const { scene } = this;
    context.globalAlpha = style.opacity;
    context.beginPath();
    if (tiny) {
      indexes.forEach((index) => {
        const scale = TINY_NODE_SCALE[scene.shape[index]];
        const halfWidth = scene.halfWidth[index] * scale;
        const halfHeight = scene.halfHeight[index] * scale;
        context.rect(scene.x[index] - halfWidth, scene.y[index] - halfHeight, 2 * halfWidth, 2 * halfHeight);
      });
      context.fillStyle = style.dot;
      context.fill();
      return;
    }
    context.fillStyle = style.fill;
    context.lineWidth = style.strokeWidth;
    context.lineJoin = "miter";
    context.miterLimit = 4;
    context.strokeStyle = style.stroke;
    // In batches, like wide edges (strokeEdges): 5k ellipses in one path
    // took 156 ms, in batches 10.
    for (let start = 0; start < indexes.length; start += NODE_BATCH) {
      context.beginPath();
      const end = Math.min(indexes.length, start + NODE_BATCH);
      for (let position = start; position < end; position += 1) {
        traceNode(context, scene, indexes[position]);
      }
      context.fill();
      context.stroke();
    }
  }

  paintLabels(context, indexes, style) {
    const { scene } = this;
    context.globalAlpha = style.opacity;
    context.fillStyle = style.text;
    context.font = LABEL_FONT;
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    indexes.forEach((index) => {
      // As in the SVG: 1 unit below the centre, 6 in a triangle.
      const offset = scene.shape[index] === SHAPE_TRIANGLE ? 6 : 1;
      context.fillText(scene.nodes[index].label, scene.x[index], scene.y[index] + offset + labelMiddle);
    });
  }

  // The hovered node, outlined in the highlight colour with a glow, and on
  // the preprocessing graph its edges with the nodes at their other ends.
  drawOverlay() {
    const context = this.overlayContext;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, this.overlay.width, this.overlay.height);
    const active = this.activeIndex;
    if (!this.scene || active < 0 || !this.width || !this.height) {
      return;
    }
    this.palette ??= graphPalette();
    this.applyTransform(context);
    const { scene, zoom, palette } = this;
    const tiny = this.nodesAreTiny();
    const labels = this.labelsVisible();

    if (this.highlightEdges) {
      const id = scene.nodes[active].id;
      const plain = [];
      const inverted = [];
      const neighbours = new Set();
      this.edges.forEach((edge) => {
        if (edge.from !== id && edge.to !== id) {
          return;
        }
        (edge.inverted ? inverted : plain).push(edge);
        const other = scene.index.get(edge.from === id ? edge.to : edge.from);
        if (other !== undefined && other !== active) {
          neighbours.add(other);
        }
      });
      const width = Math.max(EDGE_ACTIVE_WIDTH, MIN_ACTIVE_EDGE_PX / zoom);
      const area = this.visibleArea(true);
      if (plain.length) {
        this.strokeEdges(context, plain, false, 1, palette.highlight, width, area);
      }
      if (inverted.length) {
        this.strokeEdges(context, inverted, true, 1, palette.highlight, width, area);
      }
      // Nodes go on top of edges, as in the graph below.
      neighbours.forEach((index) => {
        const style = this.nodeStyle(this.styleKey(index));
        this.paintNodes(context, [index], style, tiny);
        if (labels) {
          this.paintLabels(context, [index], style);
        }
      });
    }

    const style = this.nodeStyle(this.styleKey(active));
    if (tiny) {
      context.globalAlpha = 1;
      context.beginPath();
      context.arc(scene.x[active], scene.y[active], Math.max(scene.halfHeight[active], MIN_ACTIVE_NODE_PX / zoom), 0, 2 * Math.PI);
      context.fillStyle = palette.highlight;
      context.fill();
      return;
    }
    context.globalAlpha = style.opacity;
    context.beginPath();
    traceNode(context, scene, active);
    context.shadowColor = palette.glow;
    context.shadowBlur = NODE_GLOW_BLUR * zoom * this.pixelRatio;
    context.fillStyle = style.fill;
    context.fill();
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.lineWidth = NODE_MARKED_STROKE_WIDTH;
    context.lineJoin = "miter";
    context.miterLimit = 4;
    // A node in the cut keeps its teal outline while hovered.
    context.strokeStyle = this.flags[active] & NODE_SPEC_IN_CUT ? palette.teal : palette.highlight;
    context.stroke();
    if (labels) {
      this.paintLabels(context, [active], style);
    }
  }

  hover(event) {
    if (isPanning()) {
      this.viewport.style.cursor = "";
      return;
    }
    const nodeId = this.nodeAt(event.clientX, event.clientY);
    this.viewport.style.cursor = nodeId === null ? "" : "pointer";
    if (nodeId !== null) {
      setActiveNode(nodeId);
    }
  }

  // The id of the node at a point on screen, or null: the topmost node whose
  // shape (outline included) is there or, for nodes too small on screen to
  // point at, the nearest one within HOVER_SLOP_PX.
  nodeAt(clientX, clientY) {
    const { scene, zoom } = this;
    if (!scene || !this.width) {
      return null;
    }
    const bounds = this.viewport.getBoundingClientRect();
    const point = this.toGraph(clientX - bounds.left + this.card.scrollLeft, clientY - bounds.top + this.card.scrollTop);
    const margin = NODE_STROKE_WIDTH / 2;
    const slop = scene.nodeHeight * zoom < SMALL_NODE_PX ? HOVER_SLOP_PX / zoom : 0;
    let best = -1;
    let bestDistance = Infinity;
    for (let index = 0; index < scene.count; index += 1) {
      const dx = Math.abs(point.x - scene.x[index]) - scene.halfWidth[index] - margin;
      const dy = Math.abs(point.y - scene.y[index]) - scene.halfHeight[index] - margin;
      if (dx > slop || dy > slop) {
        continue;
      }
      let distance = 0;
      if (!pointInNode(scene, index, point.x, point.y, margin)) {
        if (!slop) {
          continue;
        }
        distance = Math.max(Number.EPSILON, Math.hypot(Math.max(0, dx), Math.max(0, dy)));
        if (distance > slop) {
          continue;
        }
      }
      // Later nodes are drawn on top, so they win ties.
      if (distance <= bestDistance) {
        best = index;
        bestDistance = distance;
      }
    }
    return best < 0 ? null : scene.nodes[best].id;
  }
}

const preprocessingCanvas = new GraphCanvas(graphCard, { highlightEdges: true, fadeRewrittenEdges: false });
const specCanvas = new GraphCanvas(specGraphCard, { highlightEdges: false, fadeRewrittenEdges: true });

// Canvas text doesn't wait for web fonts: draw the labels again once the
// label font is in.
document.fonts?.load(LABEL_FONT).then(
  () => {
    measureLabelFont();
    preprocessingCanvas.redraw();
    specCanvas.redraw();
  },
  () => {}
);

// Moving the window to a screen with another pixel density changes no CSS
// size, so the card's ResizeObserver doesn't notice.
function watchPixelRatio() {
  matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
    "change",
    () => {
      preprocessingCanvas.layout();
      specCanvas.layout();
      watchPixelRatio();
    },
    { once: true }
  );
}
watchPixelRatio();

const preprocessingScenes = new WeakMap();

// The preprocessing graph shows every node of the circuit, eliminated ones
// faded.
function preprocessingScene(example) {
  if (!preprocessingScenes.has(example)) {
    preprocessingScenes.set(example, buildGraphScene(example.nodes, graphViewBox(example.nodes, example.edges)));
  }
  return preprocessingScenes.get(example);
}

const preprocessingFlagsCache = new WeakMap();

function preprocessingFlags(scene, overlay) {
  let flags = preprocessingFlagsCache.get(overlay);
  if (!flags) {
    flags = new Uint8Array(scene.count);
    const mark = (id, flag) => {
      const index = scene.index.get(id);
      if (index !== undefined) {
        flags[index] |= flag;
      }
    };
    overlay.dimmedSet.forEach((id) => mark(id, NODE_DIMMED));
    overlay.rootUpdatesMap.forEach((_, id) => mark(id, NODE_ROOT_UPDATED));
    preprocessingFlagsCache.set(overlay, flags);
  }
  return flags;
}

// Draws the preprocessing graph for the current state.
function renderGraph() {
  const view = currentGraphView();
  const scene = preprocessingScene(currentExample());
  preprocessingCanvas.show(scene, state.zoom);
  preprocessingCanvas.setEdges(view.edges);
  preprocessingCanvas.setNodeFlags(preprocessingFlags(scene, currentOverlay()));
  preprocessingCanvas.setLabels(labelsShown(view.nodes.length));
  preprocessingCanvas.setActive(state.activeNodeId);
  updatePannable(graphCard);
}

// Moves the hover highlight - on both graphs and in the list - to
// state.activeNodeId.
function updateGraphHighlight() {
  preprocessingCanvas.setActive(state.activeNodeId);
  specCanvas.setActive(state.activeNodeId);
  highlightPolynomialRow(state.activeNodeId);
}

// ---------------------------------------------------------------------------
// Specification rewrite
//
// The specification polynomial is rewritten gate by gate, from the outputs
// down, until nothing but 0 is left (for a correct multiplier). Each entry of
// `specification.steps` names the gate it substitutes, the gate polynomial
// used and the change (`delta`) that substitution makes to the whole
// polynomial; the polynomial after k steps is the initial one plus the first
// k deltas. Coefficients reach 2^127 on sp-ar-rc-64, hence BigInt.
// ---------------------------------------------------------------------------

const POLYNOMIAL_TERM_RE = /([+-]?)([^+-]+)/g;

function addSpecTerm(terms, key, value) {
  const next = (terms.get(key) ?? 0n) + value;
  if (next === 0n) {
    terms.delete(key);
  } else {
    terms.set(key, next);
  }
}

// {monomial: coefficient}, each monomial a "*"-joined variable list in
// decreasing variable order ("" for the constant). Variables are Boolean
// (x*x = x), so repeated factors collapse.
function parseSpecPolynomial(text, model) {
  const terms = new Map();
  const body = String(text).trim().replace(/;$/, "").replace(/\s+/g, "");
  if (!body || body === "0") {
    return terms;
  }
  for (const [, sign, term] of body.matchAll(POLYNOMIAL_TERM_RE)) {
    let coefficient = 1n;
    const variables = new Set();
    term.split("*").forEach((factor) => {
      if (/^\d+$/.test(factor)) {
        coefficient *= BigInt(factor);
      } else {
        variables.add(factor);
      }
    });
    const key = [...variables].sort((left, right) => model.rankOf(right) - model.rankOf(left) || compareLabels(left, right)).join("*");
    addSpecTerm(terms, key, sign === "-" ? -coefficient : coefficient);
  }
  return terms;
}

// AMulet's term order: outputs above gates above inputs, each by index;
// monomials compared variable by variable, longer first on a tie, the
// constant last.
function formatSpecPolynomial(terms, model) {
  if (!terms.size) {
    return "0";
  }
  const keys = [...terms.keys()].sort((left, right) => {
    const leftRanks = model.ranksOf(left);
    const rightRanks = model.ranksOf(right);
    const shared = Math.min(leftRanks.length, rightRanks.length);
    for (let index = 0; index < shared; index += 1) {
      if (leftRanks[index] !== rightRanks[index]) {
        return rightRanks[index] - leftRanks[index];
      }
    }
    return rightRanks.length - leftRanks.length;
  });
  return keys
    .map((key, index) => {
      const coefficient = terms.get(key);
      const negative = coefficient < 0n;
      const magnitude = negative ? -coefficient : coefficient;
      const body = key === "" ? magnitude.toString() : magnitude === 1n ? key : `${magnitude}*${key}`;
      if (index === 0) {
        return negative ? `-${body}` : body;
      }
      return negative ? ` - ${body}` : ` + ${body}`;
    })
    .join("");
}

const specModelCache = new WeakMap();

// Null when the example has no gate-by-gate rewrite data (the built-in toy
// examples).
function specModel() {
  const example = currentExample();
  if (specModelCache.has(example)) {
    return specModelCache.get(example);
  }
  const spec = example.specification;
  let model = null;
  if (spec && Array.isArray(spec.steps) && spec.steps.every((step) => typeof step.delta === "string")) {
    const inputIndex = new Map(example.nodes.filter((node) => node.type === "input").map((node, index) => [node.id, index]));
    const rankOf = (name) => {
      const output = /^s(\d+)$/.exec(name);
      if (output) {
        return 3e9 + Number(output[1]);
      }
      const gate = /^l(\d+)$/.exec(name);
      if (gate) {
        return 1e9 + Number(gate[1]);
      }
      return inputIndex.get(name) ?? -1;
    };
    const keyRanks = new Map();
    model = {
      spec,
      rankOf,
      ranksOf(key) {
        if (!keyRanks.has(key)) {
          keyRanks.set(key, key === "" ? [] : key.split("*").map(rankOf));
        }
        return keyRanks.get(key);
      },
      deltas: new Array(spec.steps.length),
      stepOfGate: new Map(spec.steps.map((step, index) => [step.gate, index + 1])),
      cursor: null
    };
    model.cursor = { index: 0, terms: parseSpecPolynomial(spec.polynomial, model) };
  }
  specModelCache.set(example, model);
  return model;
}

function specDelta(model, step) {
  model.deltas[step - 1] ??= parseSpecPolynomial(model.spec.steps[step - 1].delta, model);
  return model.deltas[step - 1];
}

// The polynomial after `step` substitutions. Walks from wherever it was last
// (or from the start, when that is closer), so stepping costs one delta.
function specTermsAt(model, step) {
  const cursor = model.cursor;
  if (step < cursor.index && step < cursor.index - step) {
    cursor.index = 0;
    cursor.terms = parseSpecPolynomial(model.spec.polynomial, model);
  }
  while (cursor.index < step) {
    cursor.index += 1;
    specDelta(model, cursor.index).forEach((value, key) => addSpecTerm(cursor.terms, key, value));
  }
  while (cursor.index > step) {
    specDelta(model, cursor.index).forEach((value, key) => addSpecTerm(cursor.terms, key, -value));
    cursor.index -= 1;
  }
  return cursor.terms;
}

function specCutVariables(terms) {
  const variables = new Set();
  terms.forEach((_, key) => {
    if (key) {
      key.split("*").forEach((variable) => variables.add(variable));
    }
  });
  return variables;
}

// The cut line. The x axis is split into narrow bins; in each one the line
// runs just above the highest gate not substituted yet, but always below
// every gate that already is. Once a column is done it drops to just above
// the inputs; columns with no gates at all interpolate between their
// neighbours. So it starts above the outputs, moves down past each gate as
// it is substituted, and ends flat above the inputs.
const CUT_BIN_WIDTH = 20;
const CUT_GAP = 10;

function prepareSpecCut(nodes) {
  let minX = Infinity;
  let maxX = -Infinity;
  let maxBottom = -Infinity;
  let inputTop = Infinity;
  nodes.forEach((node) => {
    const halfWidth = (node.width ?? 48) / 2;
    const halfHeight = (node.height ?? 36) / 2;
    minX = Math.min(minX, node.x - halfWidth);
    maxX = Math.max(maxX, node.x + halfWidth);
    maxBottom = Math.max(maxBottom, node.y + halfHeight);
    if (node.type === "input") {
      inputTop = Math.min(inputTop, node.y - halfHeight);
    }
  });
  minX -= CUT_GAP;
  maxX += CUT_GAP;
  const binOf = (x) => Math.floor((x - minX) / CUT_BIN_WIDTH);
  const gates = nodes
    .filter((node) => node.type !== "input")
    .map((node) => {
      const halfWidth = (node.width ?? 48) / 2;
      const halfHeight = (node.height ?? 36) / 2;
      return {
        id: node.id,
        firstBin: binOf(node.x - halfWidth),
        lastBin: binOf(node.x + halfWidth),
        top: node.y - halfHeight,
        bottom: node.y + halfHeight
      };
    });
  return {
    minX,
    binCount: binOf(maxX) + 1,
    floor: Number.isFinite(inputTop) ? inputTop - CUT_GAP : maxBottom + CUT_GAP,
    gates
  };
}

function specCutPath(cut, isSubstituted) {
  const lowestDone = new Array(cut.binCount).fill(-Infinity);
  const highestOpen = new Array(cut.binCount).fill(Infinity);
  cut.gates.forEach((gate) => {
    const done = isSubstituted(gate.id);
    for (let bin = gate.firstBin; bin <= gate.lastBin; bin += 1) {
      if (done) {
        lowestDone[bin] = Math.max(lowestDone[bin], gate.bottom);
      } else {
        highestOpen[bin] = Math.min(highestOpen[bin], gate.top);
      }
    }
  });

  const ys = new Array(cut.binCount).fill(null);
  for (let bin = 0; bin < cut.binCount; bin += 1) {
    if (Number.isFinite(highestOpen[bin])) {
      ys[bin] = highestOpen[bin] - CUT_GAP;
      if (Number.isFinite(lowestDone[bin])) {
        ys[bin] = Math.max(ys[bin], lowestDone[bin] + CUT_GAP);
      }
    } else if (Number.isFinite(lowestDone[bin])) {
      ys[bin] = Math.max(cut.floor, lowestDone[bin] + CUT_GAP);
    }
  }
  const defined = [];
  ys.forEach((y, bin) => {
    if (y !== null) {
      defined.push(bin);
    }
  });
  if (!defined.length) {
    return "";
  }
  let next = 0;
  for (let bin = 0; bin < cut.binCount; bin += 1) {
    if (ys[bin] !== null) {
      continue;
    }
    while (next < defined.length && defined[next] < bin) {
      next += 1;
    }
    const left = next > 0 ? defined[next - 1] : null;
    const right = next < defined.length ? defined[next] : null;
    if (left === null) {
      ys[bin] = ys[right];
    } else if (right === null) {
      ys[bin] = ys[left];
    } else {
      ys[bin] = ys[left] + ((ys[right] - ys[left]) * (bin - left)) / (right - left);
    }
  }

  const round = (value) => Math.round(value * 10) / 10;
  let path = `M ${round(cut.minX)} ${round(ys[0])}`;
  for (let bin = 0; bin < cut.binCount; bin += 1) {
    path += ` H ${round(cut.minX + (bin + 1) * CUT_BIN_WIDTH)}`;
    if (bin + 1 < cut.binCount && ys[bin + 1] !== ys[bin]) {
      path += ` V ${round(ys[bin + 1])}`;
    }
  }
  return path;
}

// The circuit as preprocessing left it: the gates it did not eliminate and
// the edges between them, plus what the cut line needs. Fixed per circuit.
const specScenes = new WeakMap();

function specScene() {
  const example = currentExample();
  if (!specScenes.has(example)) {
    const overlay = finalOverlay();
    const nodes = example.nodes.filter((node) => !overlay.dimmedSet.has(node.id));
    const ids = new Set(nodes.map((node) => node.id));
    const edges = (overlay.rootUpdates.length ? overlay.edges : example.edges).filter(
      (edge) => ids.has(edge.from) && ids.has(edge.to)
    );
    const scene = buildGraphScene(nodes, graphViewBox(nodes, edges));
    scene.edges = edges;
    scene.cut = prepareSpecCut(nodes);
    specScenes.set(example, scene);
  }
  return specScenes.get(example);
}

// Draws the specification graph after `step` substitutions: the gates
// substituted so far (and the edges out of them) faded, the last one
// highlighted, the polynomial's variables outlined, and the cut.
function renderSpecGraph(model, step, terms) {
  const scene = specScene();
  const steps = model.spec.steps;
  specCanvas.show(scene, state.zoom);
  specCanvas.setEdges(scene.edges);

  const flags = new Uint8Array(scene.count);
  const mark = (id, flag) => {
    const index = scene.index.get(id);
    if (index !== undefined) {
      flags[index] |= flag;
    }
  };
  for (let index = 0; index < step; index += 1) {
    mark(steps[index].gate, NODE_SPEC_REWRITTEN);
  }
  const currentGate = step > 0 ? steps[step - 1].gate : null;
  if (currentGate !== null) {
    mark(currentGate, NODE_SPEC_CURRENT);
  }
  // The variables the polynomial is currently written in.
  specCutVariables(terms).forEach((id) => mark(id, NODE_SPEC_IN_CUT));
  specCanvas.setNodeFlags(flags);
  specCanvas.setCut(new Path2D(specCutPath(scene.cut, (id) => (model.stepOfGate.get(id) ?? Infinity) <= step)));
  specCanvas.setLabels(labelsShown(scene.count));
  specCanvas.setActive(state.activeNodeId);
  // Keep the gate just substituted on screen when stepping through a graph
  // larger than its card.
  specCanvas.scrollNodeIntoView(currentGate, 60);
  updatePannable(specGraphCard);
}

// The left panel on the Specification rewrite tab: the preprocessed
// polynomials in the order they are substituted. Rows already used fade,
// the one just used is marked, and clicking a row jumps to its step.
const specEntriesCache = new WeakMap();

function specRewriteEntries(model) {
  const example = currentExample();
  if (!specEntriesCache.has(example)) {
    const map = nodeMap();
    const entry = (key, label, expression, nodeId, step) => ({ key, textKey: `${label}::${expression}`, label, expression, nodeId, step });
    const entries = model.spec.steps.map((step, index) =>
      entry(`step:${index + 1}`, map.get(step.gate)?.label ?? step.gate, formatPolynomialExpression(step.polynomial), step.gate, index + 1)
    );
    // Gates that survive preprocessing but are never substituted, e.g. the one
    // the fault in sp-ar-rc-4_faulty disconnects from every output.
    const overlay = finalOverlay();
    example.nodes.forEach((node) => {
      if (node.type !== "input" && !overlay.dimmedSet.has(node.id) && !model.stepOfGate.has(node.id)) {
        const expression = formatPolynomialExpression(overlay.rootUpdatesMap.get(node.id) ?? node.polynomial);
        entries.push(entry(`node:${node.id}`, node.label, expression, node.id, undefined));
      }
    });
    specEntriesCache.set(example, entries);
  }
  return specEntriesCache.get(example);
}

function renderSpecPolynomialList() {
  const model = specModel();
  if (showPolynomialEntries("Rewrite order", model ? specRewriteEntries(model) : [], "specification")) {
    // A list shown afresh scrolls to the row used last
    // (updateSpecPolynomialRows), as on any change of step.
    polyView.specStep = -1;
  }
}

function updateSpecPolynomialRows(step) {
  const changed = polyView.specStep !== step;
  polyView.specStep = step;
  polyView.rows.forEach(({ element, entry }) => decoratePolynomialRow(element, entry));
  if (changed && step > 0) {
    revealPolynomialRow(step - 1);
  }
}

function renderSpecCaption(model, step) {
  const steps = model.spec.steps;
  if (step === 0) {
    specStepCaption.textContent = "Step 0: nothing substituted yet, this is the specification itself.";
    return;
  }
  const { gate } = steps[step - 1];
  const label = nodeMap().get(gate)?.label ?? gate;
  specStepCaption.innerHTML = `Step ${step}: substituted <code>${escapeHtml(label)}</code>.`;
}

// The current polynomial; once every gate is substituted, the verdict sits in
// large type right under the remainder (0 for a correct multiplier).
function renderSpecPolynomial(model, step, terms) {
  const text = `<span class="spec-polynomial-text">${escapeHtml(formatSpecPolynomial(terms, model))}</span>`;
  if (step < model.spec.steps.length) {
    specPolynomial.innerHTML = text;
    return;
  }
  const result = model.spec.result ?? (terms.size ? "INCORRECT MULTIPLIER" : "CORRECT MULTIPLIER");
  const correct = result === "CORRECT MULTIPLIER";
  specPolynomial.innerHTML = `${text}<span class="spec-verdict-banner${correct ? "" : " incorrect"}">${escapeHtml(result)}</span>`;
}

// "+10%" / "-10%" move by a tenth of all substitutions at once (at least one).
const SPEC_JUMP_FRACTION = 0.1;

function specJumpSize(total) {
  return Math.max(1, Math.ceil(total * SPEC_JUMP_FRACTION));
}

function renderSpecView() {
  const model = specModel();
  if (!model) {
    specPolynomial.textContent = "No specification rewrite data for this example.";
    specTermCount.textContent = "";
    specStepCaption.textContent = "";
    specCanvas.clear();
    specStepLabel.textContent = "0 / 0";
    [specStepBack, specStepForward, specStepBackMany, specStepForwardMany, specStepRunAll, specStepReset].forEach((button) => {
      button.disabled = true;
    });
    return;
  }

  const total = model.spec.steps.length;
  state.specStepIndex = Math.max(0, Math.min(state.specStepIndex, total));
  const step = state.specStepIndex;
  const terms = specTermsAt(model, step);

  renderSpecPolynomial(model, step, terms);
  specTermCount.textContent = `${terms.size.toLocaleString("en-US")} ${terms.size === 1 ? "term" : "terms"}`;
  renderSpecCaption(model, step);
  specStepLabel.textContent = `${step} / ${total}`;
  specStepBack.disabled = step === 0;
  specStepBackMany.disabled = step === 0;
  specStepReset.disabled = step === 0;
  specStepForward.disabled = step === total;
  specStepForwardMany.disabled = step === total;
  specStepRunAll.disabled = step === total;
  const jump = specJumpSize(total);
  specStepForwardMany.title = `Substitute the next 10% of the gates (${jump} ${jump === 1 ? "step" : "steps"})`;
  specStepBackMany.title = `Undo the last 10% of the substitutions (${jump} ${jump === 1 ? "step" : "steps"})`;

  renderSpecGraph(model, step, terms);
  updateSpecPolynomialRows(step);
}

function setSpecStep(step) {
  state.specStepIndex = step;
  renderSpecView();
}

function render() {
  if (!examples.length || !isExampleLoaded(currentExample())) {
    return;
  }

  if (state.activeNodeId && !visibleNodeIds().has(state.activeNodeId)) {
    state.activeNodeId = null;
  }

  buildExamplePicker();
  buildPhaseTabs();
  preprocessingView.hidden = state.phase !== "preprocessing";
  specificationView.hidden = state.phase !== "specification";
  // After the tabs are shown/hidden: fitting measures the visible graph card.
  ensureZoomInitialized();

  renderHeader();

  if (state.phase === "specification") {
    renderGraphToolbar();
    renderSpecPolynomialList();
    renderSpecView();
    updatePannable(specGraphCard);
    return;
  }

  renderStageList();
  renderPipelineControls();
  renderPolynomialList();
  renderGraphToolbar();
  renderGraph();
  renderInspector();
}

// Grab-and-drag panning of a zoomed-in graph, as an alternative to the
// scrollbars. Mouse only: touch screens already scroll the card natively.
// A press only turns into a drag after a few pixels, so clicking a node still
// works; the click that ends a drag is swallowed instead.
const PAN_THRESHOLD = 4;
let pan = null;
let suppressClickUntil = 0;

function isPanning() {
  return Boolean(pan?.moved);
}

// Only offer dragging (and the grab cursor) when there is something to drag.
function updatePannable(card) {
  const pannable = card.scrollWidth > card.clientWidth + 1 || card.scrollHeight > card.clientHeight + 1;
  card.classList.toggle("pannable", pannable);
}

function enablePanning(card) {
  card.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !card.classList.contains("pannable")) {
      return;
    }
    pan = { card, pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: card.scrollLeft, top: card.scrollTop, moved: false };
  });
  card.addEventListener("pointermove", (event) => {
    if (!pan || pan.card !== card || event.pointerId !== pan.pointerId) {
      return;
    }
    const dx = event.clientX - pan.x;
    const dy = event.clientY - pan.y;
    if (!pan.moved) {
      if (Math.hypot(dx, dy) < PAN_THRESHOLD) {
        return;
      }
      pan.moved = true;
      card.setPointerCapture(event.pointerId);
      card.classList.add("panning");
    }
    card.scrollLeft = pan.left - dx;
    card.scrollTop = pan.top - dy;
  });
  const endPan = (event) => {
    if (!pan || pan.card !== card || event.pointerId !== pan.pointerId) {
      return;
    }
    if (pan.moved) {
      card.classList.remove("panning");
      suppressClickUntil = Date.now() + 150;
    }
    pan = null;
  };
  card.addEventListener("pointerup", endPan);
  card.addEventListener("pointercancel", endPan);
  card.addEventListener(
    "click",
    (event) => {
      if (Date.now() < suppressClickUntil) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    { capture: true }
  );
}

enablePanning(graphCard);
enablePanning(specGraphCard);
window.addEventListener("resize", () => {
  updatePannable(graphCard);
  updatePannable(specGraphCard);
});

// Both tabs share one zoom level (they draw the same layout).
function setZoom(zoom) {
  state.zoom = zoom;
  renderGraphToolbar();
  if (state.phase === "specification") {
    renderSpecView();
  } else {
    renderGraph();
    renderInspector();
  }
}

// Multiplicative steps: zoom runs from ~3% (sp-ar-rc-64 fitted) to 250%,
// where fixed +-0.15 steps were far too coarse at the low end. Zooming out
// stops at whatever shows the whole graph (or 45% for small graphs).
function zoomOutLevel() {
  ensureZoomInitialized();
  const floor = Math.max(MIN_ZOOM, Math.min(0.45, fitZoom()));
  return Math.min(state.zoom, Math.max(floor, state.zoom / ZOOM_STEP));
}

function zoomInLevel() {
  ensureZoomInitialized();
  return Math.min(MAX_ZOOM, state.zoom * ZOOM_STEP);
}

zoomOut.addEventListener("click", () => setZoom(zoomOutLevel()));
zoomIn.addEventListener("click", () => setZoom(zoomInLevel()));
specZoomOut.addEventListener("click", () => setZoom(zoomOutLevel()));
specZoomIn.addEventListener("click", () => setZoom(zoomInLevel()));

zoomReset.addEventListener("click", () => {
  state.zoom = null;
  render();
});
specZoomFit.addEventListener("click", () => setZoom(Math.max(MIN_ZOOM, fitZoom())));

const specStepTotal = () => specModel()?.spec.steps.length ?? 0;

specStepBack.addEventListener("click", () => setSpecStep(Math.max(0, state.specStepIndex - 1)));
specStepForward.addEventListener("click", () => setSpecStep(Math.min(specStepTotal(), state.specStepIndex + 1)));
specStepRunAll.addEventListener("click", () => setSpecStep(specStepTotal()));
specStepForwardMany.addEventListener("click", () =>
  setSpecStep(Math.min(specStepTotal(), state.specStepIndex + specJumpSize(specStepTotal())))
);
specStepBackMany.addEventListener("click", () => setSpecStep(Math.max(0, state.specStepIndex - specJumpSize(specStepTotal()))));
specStepReset.addEventListener("click", () => setSpecStep(0));

document.addEventListener("keydown", (event) => {
  if (state.phase === "specification") {
    // Shift+arrow jumps 10% of the substitutions, like the -10% / +10% buttons.
    const distance = event.shiftKey ? specJumpSize(specStepTotal()) : 1;
    if (event.key === "ArrowLeft") {
      setSpecStep(Math.max(0, state.specStepIndex - distance));
    }
    if (event.key === "ArrowRight") {
      setSpecStep(Math.min(specStepTotal(), state.specStepIndex + distance));
    }
    return;
  }

  if (event.key === "ArrowLeft") {
    state.stageIndex = Math.max(0, state.stageIndex - 1);
    state.microStepIndex = null;
    render();
  }

  if (event.key === "ArrowRight") {
    state.stageIndex = Math.min(currentExample().stages.length - 1, state.stageIndex + 1);
    state.microStepIndex = null;
    render();
  }
});

async function loadGeneratedExamples() {
  // Shown if the generated data can't be loaded.
  examples = fallbackExamples.map(normalizeExample);
  try {
    const response = await fetch(EXAMPLES_MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length) {
      // Entries may be manifest stubs or (older single-file format) full
      // examples; either way only the first circuit is needed to start.
      // Swapped in only once the first circuit is there, so nothing ever
      // renders (or handles a key press) against an unloaded entry.
      const entries = data.map((entry) => (isExampleLoaded(entry) ? normalizeExample(entry) : entry));
      await loadExample(0, entries);
      examples = entries;
      state.exampleIndex = 0;
      state.stageIndex = 0;
      state.microStepIndex = null;
      state.activeNodeId = null;
      state.zoom = null;
      state.specStepIndex = 0;
    }
  } catch {
    examples = fallbackExamples.map(normalizeExample);
  }
}

loadGeneratedExamples().finally(render);