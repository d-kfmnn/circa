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

const graphElement = document.querySelector("#graph");
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
const specGraphElement = document.querySelector("#specGraph");
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
const graphCard = document.querySelector(".graph-card");
const specGraphCard = specGraphElement.closest(".graph-card");

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

// The visible nodes/edges for the current example and stage, plus each
// node's parent/child edges. Hovering reads parents/children on every node
// change, so this is computed once per state instead of filtering every edge
// per hover (~96k edges on sp-ar-rc-64).
function currentGraphView() {
  const example = currentExample();
  const overlay = currentOverlay();
  const cached = graphViewCache;
  if (cached && cached.example === example && cached.overlay === overlay) {
    return cached;
  }

  const nodes = example.nodes;
  const ids = new Set(nodes.map((node) => node.id));
  const edges = activeEdges().filter((edge) => ids.has(edge.from) && ids.has(edge.to));
  const parents = new Map();
  const children = new Map();
  edges.forEach((edge) => {
    if (!children.has(edge.from)) {
      children.set(edge.from, []);
    }
    children.get(edge.from).push(edge);
    if (!parents.has(edge.to)) {
      parents.set(edge.to, []);
    }
    parents.get(edge.to).push(edge);
  });

  graphViewCache = {
    example,
    overlay,
    ids,
    nodes,
    edges,
    parents,
    children
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
// a row across steps (see updatePolynomialEntries).
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
    const dedupeKey = `${node.label}::${expression}`;
    if (seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    entries.push({ key: `node:${node.id}`, label: node.label, expression, nodeId: node.id });
  });

  extraPolynomials.forEach((entry) => {
    const expression = formatPolynomialExpression(entry.expression);
    const dedupeKey = `${entry.label}::${expression}`;
    if (seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    entries.push({ key: `extra:${dedupeKey}`, label: entry.label, expression, nodeId: null });
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

// Rebuilds the whole list. `kind` names which list this is, so the
// preprocessing list can later be updated in place (updatePolynomialEntries)
// as long as it is still the one on screen.
function renderPolynomialEntries(title, entries, kind = null) {
  polynomialTitle.textContent = title;
  polynomialCount.textContent = `${entries.length} eqs`;
  // The rows sit in one wrapper that is as wide as the widest row (see
  // .poly-rows), so they all share that width like grid items would.
  polynomialList.innerHTML = `<div class="poly-rows">${entries.map(polynomialEntryMarkup).join("")}</div>`;

  polyDom = {
    kind,
    example: currentExample(),
    container: polynomialList.firstElementChild,
    elements: new Map(),
    rows: new Map(),
    highlightedNodeId: null
  };
  if (kind) {
    const elements = polynomialList.querySelectorAll(".poly-item");
    entries.forEach((entry, index) => {
      polyDom.rows.set(entry.key, { element: elements[index], expression: entry.expression, nodeId: entry.nodeId });
    });
  }
  polynomialList.querySelectorAll("[data-poly-node-id]").forEach((element) => {
    polyDom.elements.set(element.dataset.polyNodeId, element);
  });
}

// Brings the rendered preprocessing list to `entries` by touching only the
// rows that changed: a node-by-node step removes the eliminated gate's row
// and rewrites its parent's. Rebuilding all ~48k rows of sp-ar-rc-64 instead
// took seconds per click. Rows keep their relative order (label order), so a
// row that comes back (stepping backwards) goes right after its predecessor.
// Returns false when most rows would be new anyway, where one rebuild is
// cheaper than inserting them one by one.
function updatePolynomialEntries(title, entries) {
  const rows = polyDom.rows;
  const added = entries.reduce((count, entry) => count + (rows.has(entry.key) ? 0 : 1), 0);
  if (added > Math.max(500, entries.length / 4)) {
    return false;
  }

  polynomialTitle.textContent = title;
  polynomialCount.textContent = `${entries.length} eqs`;
  const keys = new Set(entries.map((entry) => entry.key));
  rows.forEach((row, key) => {
    if (!keys.has(key)) {
      row.element.remove();
      rows.delete(key);
      if (row.nodeId) {
        polyDom.elements.delete(row.nodeId);
      }
    }
  });

  let previous = null;
  entries.forEach((entry) => {
    let row = rows.get(entry.key);
    if (!row) {
      row = { element: polynomialEntryElement(entry), expression: entry.expression, nodeId: entry.nodeId };
      if (previous) {
        previous.after(row.element);
      } else {
        polyDom.container.prepend(row.element);
      }
      rows.set(entry.key, row);
      if (entry.nodeId) {
        polyDom.elements.set(entry.nodeId, row.element);
        row.element.classList.toggle("active-link", entry.nodeId === polyDom.highlightedNodeId);
      }
    } else if (row.expression !== entry.expression) {
      row.element.querySelector("p").textContent = entry.expression;
      row.expression = entry.expression;
    }
    previous = row.element;
  });
  return true;
}

function renderPolynomialList() {
  const stage = currentStage();
  const entries = buildPolynomialEntries(currentStageDimmedSet(), currentStageRootUpdatesMap(), stage.polynomials ?? []);
  const title = `${stage.name} active set`;
  const inPlace = polyDom.kind === "preprocessing" && polyDom.example === currentExample();
  if (!inPlace || !updatePolynomialEntries(title, entries)) {
    renderPolynomialEntries(title, entries, "preprocessing");
  }
}

// The rendered polynomial list: row elements by node id, and which one
// currently carries the hover highlight, so a hover touches two rows instead
// of every row. For the preprocessing list also every row by entry key, for
// updatePolynomialEntries.
let polyDom = { kind: null, example: null, container: null, elements: new Map(), rows: new Map(), highlightedNodeId: null };

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

function nodeParentsFor(nodeId) {
  const map = nodeMap();
  return (currentGraphView().parents.get(nodeId) ?? []).map((edge) => map.get(edge.from)?.label || edge.from);
}

function nodeChildrenFor(nodeId) {
  const map = nodeMap();
  return (currentGraphView().children.get(nodeId) ?? []).map(
    (edge) => `${edge.inverted ? "!" : ""}${map.get(edge.to)?.label || edge.to}`
  );
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

function edgeClassNames(edge) {
  const classes = ["graph-edge"];
  if (edge.inverted) {
    classes.push("inverted");
  }
  if (state.activeNodeId && (edge.from === state.activeNodeId || edge.to === state.activeNodeId)) {
    classes.push("active");
  }
  return classes.join(" ");
}

function nodeMarkup(node, dimmedNodes, rootUpdates, showLabels) {
  const isActive = node.id === state.activeNodeId;
  const isDimmed = dimmedNodes.has(node.id);
  const isRootUpdated = rootUpdates.has(node.id);
  const classes = [
    "graph-node",
    node.type,
    isActive ? "active" : "",
    isDimmed ? "dimmed" : "",
    isRootUpdated ? "root-updated" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const width = node.width ?? (node.type === "output" ? 60 : 48);
  const height = node.height ?? 36;
  const ariaLabel = escapeHtml(node.label);
  const labelMarkup = (y) => (showLabels ? `<text y="${y}">${ariaLabel}</text>` : "");
  const shape = node.shape ?? (node.type === "output" ? "rect" : "circle");

  if (shape === "triangle") {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return `
      <g class="${classes}" data-node-id="${node.id}" tabindex="0" role="button" aria-label="${ariaLabel}" transform="translate(${node.x}, ${node.y})">
        <polygon points="0,${-halfHeight} ${halfWidth},${halfHeight} ${-halfWidth},${halfHeight}"></polygon>
        ${labelMarkup(6)}
      </g>
    `;
  }

  if (shape === "box" || node.type === "output") {
    return `
      <g class="${classes}" data-node-id="${node.id}" tabindex="0" role="button" aria-label="${ariaLabel}" transform="translate(${node.x}, ${node.y})">
        <rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}"></rect>
        ${labelMarkup(1)}
      </g>
    `;
  }

  return `
    <g class="${classes}" data-node-id="${node.id}" tabindex="0" role="button" aria-label="${ariaLabel}" transform="translate(${node.x}, ${node.y})">
      <ellipse rx="${width / 2}" ry="${height / 2}"></ellipse>
      ${labelMarkup(1)}
    </g>
  `;
}

// Delegated from the <svg> rather than bound per node: the graph is rebuilt
// on every render, and re-binding four listeners on each of 48k nodes was a
// large share of a render on sp-ar-rc-64.
function graphNodeOf(target) {
  return target instanceof Element ? target.closest("[data-node-id]") : null;
}

graphElement.addEventListener("mouseover", (event) => {
  const element = graphNodeOf(event.target);
  if (element && !isPanning()) {
    setActiveNode(element.dataset.nodeId);
  }
});
graphElement.addEventListener("focusin", (event) => {
  const element = graphNodeOf(event.target);
  if (element) {
    setActiveNode(element.dataset.nodeId);
  }
});
graphElement.addEventListener("click", (event) => {
  const element = graphNodeOf(event.target);
  if (element) {
    setActiveNode(element.dataset.nodeId);
  }
});
graphElement.addEventListener("keydown", (event) => {
  const element = graphNodeOf(event.target);
  if (element && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    setActiveNode(element.dataset.nodeId);
  }
});

graphElement.addEventListener("mouseleave", () => {
  setActiveNode(null);
});

function edgePath(edge, map) {
  if (edge.points?.length) {
    return edge.points.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0]} ${point[1]}`).join(" ");
  }

  const fromNode = map.get(edge.from);
  const toNode = map.get(edge.to);
  const controlX = (fromNode.x + toNode.x) / 2;
  return `M ${fromNode.x + 22} ${fromNode.y} C ${controlX} ${fromNode.y}, ${controlX - 20} ${toNode.y}, ${toNode.x - 28} ${toNode.y}`;
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

function sizeGraphElement(element, box) {
  element.setAttribute("viewBox", `${box.minX} ${box.minY} ${box.width} ${box.height}`);
  element.style.width = `${box.width * state.zoom}px`;
  element.style.height = `${box.height * state.zoom}px`;
}

// Above this many visible nodes, node labels are only drawn from
// LABEL_MIN_ZOOM up: below it they are a few pixels tall and unreadable, and
// leaving them out spares the browser tens of thousands of <text> elements
// on the large circuits. Zooming re-renders the graph, so they come back as
// soon as they are legible.
const LABEL_NODE_LIMIT = 5000;
const LABEL_MIN_ZOOM = 0.5;

function fitZoom() {
  const graphSize = currentGraphSize();
  // Both tabs draw the same layout; measure whichever card is on screen.
  const card = state.phase === "specification" ? specGraphCard : graphCard;
  const availableWidth = Math.max(260, card.clientWidth - 24);
  const availableHeight = Math.max(220, card.clientHeight - 24);
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

// The rendered preprocessing graph: which state it shows (`view`, and the
// overlay's dimmed / root-updated sets) and its elements - nodes by id, edge
// paths by edge object - so a step or a hover only restyles what changed
// (see renderGraph and updateGraphHighlight).
let graphDom = {
  example: null,
  view: null,
  showLabels: null,
  dimmedSet: new Set(),
  rootUpdatesMap: new Map(),
  nodeElements: new Map(),
  edgeElements: new Map(),
  edgeLayer: null,
  highlightedNodeId: null
};

// Node labels are left out of large graphs below LABEL_MIN_ZOOM (see there).
function labelsShown(nodeCount) {
  return nodeCount <= LABEL_NODE_LIMIT || state.zoom >= LABEL_MIN_ZOOM;
}

const SVG_NS = "http://www.w3.org/2000/svg";

// Marker ids are document-global, so each graph gets its own.
function inversionMarkerDefs(id) {
  return `
    <defs>
      <marker id="${id}" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto" markerUnits="userSpaceOnUse">
        <circle cx="6" cy="6" r="4.2" fill="var(--surface-strong)" stroke="var(--ink)" stroke-width="1.4"></circle>
      </marker>
    </defs>
  `;
}

function edgeLayerMarkup(edges, map, markerId) {
  return edges
    .map((edge, index) => {
      const marker = edge.inverted ? ` marker-end="url(#${markerId})"` : "";
      return `<path class="${edgeClassNames(edge)}" data-edge-index="${index}" d="${edgePath(edge, map)}"${marker}></path>`;
    })
    .join("");
}

// Draws the preprocessing graph for the current state. The SVG is only built
// from scratch for a new circuit or when labels come or go with the zoom;
// otherwise a step updates it in place (updateGraphInPlace) and a zoom just
// resizes it - rebuilding sp-ar-rc-64's ~190k SVG elements took seconds.
function renderGraph() {
  const example = currentExample();
  const view = currentGraphView();
  sizeGraphElement(graphElement, graphViewBox(view.nodes, view.edges));
  const showLabels = labelsShown(view.nodes.length);
  if (graphDom.example !== example || graphDom.showLabels !== showLabels) {
    buildGraph(view, showLabels);
  } else {
    updateGraphInPlace(view);
  }
  updatePannable(graphCard);
}

function buildGraph(view, showLabels) {
  const overlay = currentOverlay();
  const map = nodeMap();
  const nodeLayer = view.nodes.map((node) => nodeMarkup(node, overlay.dimmedSet, overlay.rootUpdatesMap, showLabels)).join("");

  graphElement.innerHTML = `
    ${inversionMarkerDefs("inversionBubble")}
    <g class="edge-layer">${edgeLayerMarkup(view.edges, map, "inversionBubble")}</g>
    <g class="node-layer">${nodeLayer}</g>
  `;

  const nodeElements = new Map();
  graphElement.querySelectorAll("[data-node-id]").forEach((element) => {
    nodeElements.set(element.dataset.nodeId, element);
  });
  // querySelectorAll returns document order, which is the edges' index order.
  const edgeElements = new Map();
  graphElement.querySelectorAll("[data-edge-index]").forEach((element, index) => {
    edgeElements.set(view.edges[index], element);
  });
  graphDom = {
    example: currentExample(),
    view,
    showLabels,
    dimmedSet: overlay.dimmedSet,
    rootUpdatesMap: overlay.rootUpdatesMap,
    nodeElements,
    edgeElements,
    edgeLayer: graphElement.querySelector(".edge-layer"),
    highlightedNodeId: state.activeNodeId
  };
}

function edgeElement(edge, map, markerId) {
  const element = document.createElementNS(SVG_NS, "path");
  element.setAttribute("class", edgeClassNames(edge));
  element.setAttribute("d", edgePath(edge, map));
  if (edge.inverted) {
    element.setAttribute("marker-end", `url(#${markerId})`);
  }
  return element;
}

// Adds or removes the classes of the nodes that entered or left a set.
function toggleChangedNodes(previous, next, className) {
  if (previous === next) {
    return;
  }
  for (const id of previous.keys()) {
    if (!next.has(id)) {
      graphDom.nodeElements.get(id)?.classList.remove(className);
    }
  }
  for (const id of next.keys()) {
    if (!previous.has(id)) {
      graphDom.nodeElements.get(id)?.classList.add(className);
    }
  }
}

// Moves the drawn graph from the state it shows to `view`: only the nodes
// whose dimmed / root-updated status changed are restyled, and only the edges
// that appeared or disappeared are added or removed (edges are the same
// objects in every state, see rewiredEdge). Even "Undo all" from the end is
// cheaper this way than a rebuild (measured on sp-ar-rc-64).
function updateGraphInPlace(view) {
  if (graphDom.view === view) {
    return;
  }
  const overlay = currentOverlay();
  const edgeElements = graphDom.edgeElements;
  const added = view.edges.filter((edge) => !edgeElements.has(edge));
  const next = new Set(view.edges);
  edgeElements.forEach((element, edge) => {
    if (!next.has(edge)) {
      element.remove();
      edgeElements.delete(edge);
    }
  });
  if (added.length) {
    const map = nodeMap();
    const fragment = document.createDocumentFragment();
    added.forEach((edge) => {
      const element = edgeElement(edge, map, "inversionBubble");
      edgeElements.set(edge, element);
      fragment.append(element);
    });
    graphDom.edgeLayer.append(fragment);
  }

  toggleChangedNodes(graphDom.dimmedSet, overlay.dimmedSet, "dimmed");
  toggleChangedNodes(graphDom.rootUpdatesMap, overlay.rootUpdatesMap, "root-updated");
  graphDom.dimmedSet = overlay.dimmedSet;
  graphDom.rootUpdatesMap = overlay.rootUpdatesMap;
  graphDom.view = view;

  // New edges were drawn with the highlight of state.activeNodeId; bring the
  // rest in line if the highlight moved since the graph was last updated.
  syncGraphHighlight();
}

// Moves the hover highlight on the preprocessing graph from the node that
// has it to state.activeNodeId: those two nodes and their edges only (it
// used to restyle every node and look each edge up with its own
// querySelector - quadratic in the edge count).
function syncGraphHighlight() {
  if (graphDom.highlightedNodeId === state.activeNodeId) {
    return;
  }
  const view = graphDom.view;
  [graphDom.highlightedNodeId, state.activeNodeId].forEach((nodeId) => {
    if (nodeId === null) {
      return;
    }
    graphDom.nodeElements.get(nodeId)?.classList.toggle("active", nodeId === state.activeNodeId);
    [...(view.children.get(nodeId) ?? []), ...(view.parents.get(nodeId) ?? [])].forEach((edge) => {
      const isActive = state.activeNodeId !== null && (edge.from === state.activeNodeId || edge.to === state.activeNodeId);
      graphDom.edgeElements.get(edge)?.classList.toggle("active", isActive);
    });
  });
  graphDom.highlightedNodeId = state.activeNodeId;
}

function updateGraphHighlight() {
  // Only while the drawn graph shows the current state; otherwise the next
  // renderGraph brings the highlight along (syncGraphHighlight).
  if (graphDom.example === currentExample() && graphDom.view === currentGraphView()) {
    syncGraphHighlight();
  }

  if (specGraphDom && specGraphDom.example === currentExample() && specGraphDom.hoveredNodeId !== state.activeNodeId) {
    specGraphDom.nodeElements.get(specGraphDom.hoveredNodeId)?.classList.remove("active");
    specGraphDom.nodeElements.get(state.activeNodeId)?.classList.add("active");
    specGraphDom.hoveredNodeId = state.activeNodeId;
  }

  if (polyDom.highlightedNodeId !== state.activeNodeId) {
    polyDom.elements.get(polyDom.highlightedNodeId)?.classList.remove("active-link");
    const row = polyDom.elements.get(state.activeNodeId);
    if (row) {
      row.classList.add("active-link");
      row.scrollIntoView({ block: "nearest" });
    }
    polyDom.highlightedNodeId = state.activeNodeId;
  }
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

// The circuit as preprocessing left it (eliminated gates hidden), drawn once
// per example and zoom; stepping only restyles the nodes that change and
// redraws the cut.
let specGraphDom = null;

function buildSpecGraph(model) {
  const example = currentExample();
  const overlay = finalOverlay();
  const nodes = example.nodes.filter((node) => !overlay.dimmedSet.has(node.id));
  const ids = new Set(nodes.map((node) => node.id));
  const edges = (overlay.rootUpdates.length ? overlay.edges : example.edges).filter(
    (edge) => ids.has(edge.from) && ids.has(edge.to)
  );
  const map = new Map(nodes.map((node) => [node.id, node]));
  const box = graphViewBox(nodes, edges);
  sizeGraphElement(specGraphElement, box);

  const showLabels = labelsShown(nodes.length);
  const noneDimmed = new Set();
  const noneRewritten = new Map();
  specGraphElement.innerHTML = `
    ${inversionMarkerDefs("specInversionBubble")}
    <g class="edge-layer">${edgeLayerMarkup(edges, map, "specInversionBubble")}</g>
    <path class="spec-cut" d=""></path>
    <g class="node-layer">${nodes.map((node) => nodeMarkup(node, noneDimmed, noneRewritten, showLabels)).join("")}</g>
  `;

  const nodeElements = new Map();
  specGraphElement.querySelectorAll("[data-node-id]").forEach((element) => {
    nodeElements.set(element.dataset.nodeId, element);
  });
  const edgeElements = [...specGraphElement.querySelectorAll("[data-edge-index]")];
  const edgeIndexesByFrom = new Map();
  edges.forEach((edge, index) => {
    if (!edgeIndexesByFrom.has(edge.from)) {
      edgeIndexesByFrom.set(edge.from, []);
    }
    edgeIndexesByFrom.get(edge.from).push(index);
  });

  specGraphDom = {
    example,
    model,
    zoom: state.zoom,
    showLabels,
    nodeCount: nodes.length,
    box,
    map,
    nodeElements,
    edgeElements,
    edgeIndexesByFrom,
    cutPath: specGraphElement.querySelector(".spec-cut"),
    cut: prepareSpecCut(nodes),
    shownStep: 0,
    currentGate: null,
    cutVariables: new Set(),
    hoveredNodeId: state.activeNodeId
  };
  updatePannable(specGraphCard);
}

function updateSpecGraph(model, step, terms) {
  const dom = specGraphDom;
  const steps = model.spec.steps;

  // Substituted gates (and the edges into their children) fade.
  const low = Math.min(dom.shownStep, step);
  const high = Math.max(dom.shownStep, step);
  for (let index = low; index < high; index += 1) {
    const gate = steps[index].gate;
    const substituted = index < step;
    dom.nodeElements.get(gate)?.classList.toggle("spec-rewritten", substituted);
    (dom.edgeIndexesByFrom.get(gate) ?? []).forEach((edgeIndex) => {
      dom.edgeElements[edgeIndex].classList.toggle("spec-rewritten", substituted);
    });
  }

  const currentGate = step > 0 ? steps[step - 1].gate : null;
  if (dom.currentGate !== currentGate) {
    dom.nodeElements.get(dom.currentGate)?.classList.remove("spec-current");
    dom.nodeElements.get(currentGate)?.classList.add("spec-current");
    dom.currentGate = currentGate;
  }

  // The variables the polynomial is currently written in.
  const cutVariables = specCutVariables(terms);
  dom.cutVariables.forEach((id) => {
    if (!cutVariables.has(id)) {
      dom.nodeElements.get(id)?.classList.remove("spec-in-cut");
    }
  });
  cutVariables.forEach((id) => {
    if (!dom.cutVariables.has(id)) {
      dom.nodeElements.get(id)?.classList.add("spec-in-cut");
    }
  });
  dom.cutVariables = cutVariables;
  dom.shownStep = step;

  dom.cutPath.setAttribute("d", specCutPath(dom.cut, (id) => (model.stepOfGate.get(id) ?? Infinity) <= step));
  scrollSpecGraphTo(dom.map.get(currentGate));
}

// Keep the gate just substituted on screen when stepping through a graph
// larger than its card.
function scrollSpecGraphTo(node) {
  if (!node) {
    return;
  }
  const margin = 60;
  const x = (node.x - specGraphDom.box.minX) * state.zoom;
  const y = (node.y - specGraphDom.box.minY) * state.zoom;
  if (x < specGraphCard.scrollLeft + margin || x > specGraphCard.scrollLeft + specGraphCard.clientWidth - margin) {
    specGraphCard.scrollLeft = Math.max(0, x - specGraphCard.clientWidth / 2);
  }
  if (y < specGraphCard.scrollTop + margin || y > specGraphCard.scrollTop + specGraphCard.clientHeight - margin) {
    specGraphCard.scrollTop = Math.max(0, y - specGraphCard.clientHeight / 2);
  }
}

// The left panel on the Specification rewrite tab: the preprocessed
// polynomials in the order they are substituted. Rows already used fade,
// the one just used is marked, and clicking a row jumps to its step.
let specRowsDom = { rows: [], shownStep: 0, currentRow: null };

function renderSpecPolynomialList() {
  const model = specModel();
  if (!model) {
    renderPolynomialEntries("Rewrite order", []);
    specRowsDom = { rows: [], shownStep: 0, currentRow: null };
    return;
  }
  const map = nodeMap();
  const entries = model.spec.steps.map((step, index) => ({
    label: map.get(step.gate)?.label ?? step.gate,
    expression: formatPolynomialExpression(step.polynomial),
    nodeId: step.gate,
    step: index + 1
  }));
  // Gates that survive preprocessing but are never substituted, e.g. the one
  // the fault in sp-ar-rc-4_faulty disconnects from every output.
  const overlay = finalOverlay();
  currentExample().nodes.forEach((node) => {
    if (node.type !== "input" && !overlay.dimmedSet.has(node.id) && !model.stepOfGate.has(node.id)) {
      entries.push({
        label: node.label,
        expression: formatPolynomialExpression(overlay.rootUpdatesMap.get(node.id) ?? node.polynomial),
        nodeId: node.id
      });
    }
  });
  renderPolynomialEntries("Rewrite order", entries);
  specRowsDom = { rows: [...polynomialList.querySelectorAll("[data-spec-step]")], shownStep: 0, currentRow: null };
}

function updateSpecPolynomialRows(step) {
  const dom = specRowsDom;
  const low = Math.min(dom.shownStep, step);
  const high = Math.max(dom.shownStep, step);
  for (let index = low; index < high; index += 1) {
    dom.rows[index]?.classList.toggle("spec-used", index < step);
  }
  dom.shownStep = step;
  const currentRow = step > 0 ? dom.rows[step - 1] ?? null : null;
  if (dom.currentRow !== currentRow) {
    dom.currentRow?.classList.remove("spec-current");
    currentRow?.classList.add("spec-current");
    currentRow?.scrollIntoView({ block: "nearest" });
    dom.currentRow = currentRow;
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
    specGraphElement.innerHTML = "";
    specGraphDom = null;
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

  // Like the preprocessing graph: a zoom only resizes the drawing, unless
  // labels come or go with it.
  if (!specGraphDom || specGraphDom.example !== currentExample() || specGraphDom.showLabels !== labelsShown(specGraphDom.nodeCount)) {
    buildSpecGraph(model);
  } else if (specGraphDom.zoom !== state.zoom) {
    sizeGraphElement(specGraphElement, specGraphDom.box);
    specGraphDom.zoom = state.zoom;
    updatePannable(specGraphCard);
  }
  updateSpecGraph(model, step, terms);
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

// Hovering a node of the specification graph highlights its row, as on the
// preprocessing graph.
specGraphElement.addEventListener("mouseover", (event) => {
  const element = graphNodeOf(event.target);
  if (element && !isPanning()) {
    setActiveNode(element.dataset.nodeId);
  }
});
specGraphElement.addEventListener("mouseleave", () => setActiveNode(null));

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