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
      { id: "a0", label: "a0", type: "input", x: 90, y: 86, role: "Primary input", signal: "Bit a0", polynomial: "a0 - a0 = 0", stageNote: "Inputs remain symbolic anchors throughout preprocessing." },
      { id: "a1", label: "a1", type: "input", x: 90, y: 166, role: "Primary input", signal: "Bit a1", polynomial: "a1 - a1 = 0", stageNote: "High-order multiplicand bit." },
      { id: "b0", label: "b0", type: "input", x: 90, y: 246, role: "Primary input", signal: "Bit b0", polynomial: "b0 - b0 = 0", stageNote: "Multiplier bit reused in two partial products." },
      { id: "b1", label: "b1", type: "input", x: 90, y: 326, role: "Primary input", signal: "Bit b1", polynomial: "b1 - b1 = 0", stageNote: "High-order multiplier bit." },
      { id: "n1", label: "n1", type: "and", x: 260, y: 76, role: "Partial product", signal: "a0 AND b0", polynomial: "n1 - a0*b0 = 0", stageNote: "A direct multiplicative monomial; often preserved until late substitution." },
      { id: "n2", label: "n2", type: "and", x: 260, y: 156, role: "Partial product", signal: "a0 AND b1", polynomial: "n2 - a0*b1 = 0", stageNote: "Shares a0 with n1; structural hashing can expose common support." },
      { id: "n3", label: "n3", type: "and", x: 260, y: 236, role: "Partial product", signal: "a1 AND b0", polynomial: "n3 - a1*b0 = 0", stageNote: "Combined with n2 during middle-bit rewriting." },
      { id: "n4", label: "n4", type: "and", x: 260, y: 316, role: "Partial product", signal: "a1 AND b1", polynomial: "n4 - a1*b1 = 0", stageNote: "Feeds the final carry relation." },
      { id: "n5", label: "m1", type: "and", x: 440, y: 186, role: "Merged middle support", signal: "Encoded support for n2 and n3", polynomial: "m1 - (n2 + n3 - 2*n2*n3) = 0", stageNote: "Boolean normalization turns XOR-like behavior into a polynomial identity." },
      { id: "n6", label: "c1", type: "and", x: 440, y: 286, role: "Carry support", signal: "carry from n2 and n3", polynomial: "c1 - n2*n3 = 0", stageNote: "This term is frequently isolated and then eliminated by substitution." },
      { id: "p0", label: "p0", type: "output", x: 636, y: 80, role: "Output bit", signal: "Least significant product bit", polynomial: "p0 - n1 = 0", stageNote: "Output rewrites usually start with direct equalities like this." },
      { id: "p1", label: "p1", type: "output", x: 636, y: 182, role: "Output bit", signal: "Middle product bit", polynomial: "p1 - m1 = 0", stageNote: "Middle bit is where polynomial simplification becomes visible in the demo." },
      { id: "p2", label: "p2", type: "output", x: 636, y: 284, role: "Output bit", signal: "Third product bit", polynomial: "p2 - (n4 + c1 - 2*n4*c1) = 0", stageNote: "Carry-aware relation before final specification matching." },
      { id: "p3", label: "p3", type: "output", x: 636, y: 364, role: "Output bit", signal: "Most significant product bit", polynomial: "p3 - n4*c1 = 0", stageNote: "Final carry-out relation closes the bit-level structure." }
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
    ],
    specification: {
      polynomial: "p0 + 2*p1 + 4*p2 + 8*p3 - (a0 + 2*a1)*(b0 + 2*b1) = 0",
      result: "CORRECT MULTIPLIER",
      steps: [
        { type: "slice-start", slice: 3 },
        { type: "reduce", polynomial: "p3 - a0*a1*b0*b1 = 0", remainder: "p0 + 2*p1 + 4*p2 + 8*a0*a1*b0*b1 - (a0 + 2*a1)*(b0 + 2*b1)" },
        { type: "slice-end", slice: 3, remainder: "p0 + 2*p1 + 4*p2 + 8*a0*a1*b0*b1 - (a0 + 2*a1)*(b0 + 2*b1)" },
        { type: "slice-start", slice: 2 },
        { type: "reduce", polynomial: "p2 - a1*b1 + a0*a1*b0*b1 = 0", remainder: "p0 + 2*p1 + 4*a1*b1 + 4*a0*a1*b0*b1 - (a0 + 2*a1)*(b0 + 2*b1)" },
        { type: "slice-end", slice: 2, remainder: "p0 + 2*p1 + 4*a1*b1 + 4*a0*a1*b0*b1 - (a0 + 2*a1)*(b0 + 2*b1)" },
        { type: "slice-start", slice: 1 },
        { type: "reduce", polynomial: "p1 - a0*b1 - a1*b0 + 2*a0*a1*b0*b1 = 0", remainder: "p0 + 2*a0*b1 + 2*a1*b0 + 4*a1*b1 - (a0 + 2*a1)*(b0 + 2*b1)" },
        { type: "slice-end", slice: 1, remainder: "p0 + 2*a0*b1 + 2*a1*b0 + 4*a1*b1 - (a0 + 2*a1)*(b0 + 2*b1)" },
        { type: "slice-start", slice: 0 },
        { type: "reduce", polynomial: "p0 - a0*b0 = 0", remainder: "a0*b0 + 2*a0*b1 + 2*a1*b0 + 4*a1*b1 - (a0 + 2*a1)*(b0 + 2*b1)" },
        { type: "reduce", polynomial: "(a0 + 2*a1)*(b0 + 2*b1) - a0*b0 - 2*a0*b1 - 2*a1*b0 - 4*a1*b1 = 0", remainder: "0" },
        { type: "slice-end", slice: 0, remainder: "0" }
      ]
    }
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
      { id: "a0", label: "a0", type: "input", x: 76, y: 66, role: "Primary input", signal: "Bit a0", polynomial: "a0 - a0 = 0", stageNote: "Low-order multiplicand bit." },
      { id: "a1", label: "a1", type: "input", x: 76, y: 134, role: "Primary input", signal: "Bit a1", polynomial: "a1 - a1 = 0", stageNote: "Middle multiplicand bit." },
      { id: "a2", label: "a2", type: "input", x: 76, y: 202, role: "Primary input", signal: "Bit a2", polynomial: "a2 - a2 = 0", stageNote: "High-order multiplicand bit." },
      { id: "b0", label: "b0", type: "input", x: 76, y: 286, role: "Primary input", signal: "Bit b0", polynomial: "b0 - b0 = 0", stageNote: "Multiplier LSB." },
      { id: "b1", label: "b1", type: "input", x: 76, y: 354, role: "Primary input", signal: "Bit b1", polynomial: "b1 - b1 = 0", stageNote: "Multiplier MSB." },
      { id: "n1", label: "u0", type: "and", x: 224, y: 60, role: "Partial product", signal: "a0 AND b0", polynomial: "u0 - a0*b0 = 0", stageNote: "Direct monomial support." },
      { id: "n2", label: "u1", type: "and", x: 224, y: 126, role: "Partial product", signal: "a1 AND b0", polynomial: "u1 - a1*b0 = 0", stageNote: "Used in the second weight position." },
      { id: "n3", label: "u2", type: "and", x: 224, y: 192, role: "Partial product", signal: "a2 AND b0", polynomial: "u2 - a2*b0 = 0", stageNote: "Carries into higher weights." },
      { id: "n4", label: "v0", type: "and", x: 224, y: 272, role: "Partial product", signal: "a0 AND b1", polynomial: "v0 - a0*b1 = 0", stageNote: "Second-row partial product." },
      { id: "n5", label: "v1", type: "and", x: 224, y: 338, role: "Partial product", signal: "a1 AND b1", polynomial: "v1 - a1*b1 = 0", stageNote: "Combines with u2 later." },
      { id: "n6", label: "v2", type: "and", x: 224, y: 404, role: "Partial product", signal: "a2 AND b1", polynomial: "v2 - a2*b1 = 0", stageNote: "Highest direct partial product." },
      { id: "s1", label: "s1", type: "and", x: 404, y: 126, role: "Weight-1 sum", signal: "support for u1 and v0", polynomial: "s1 - (u1 + v0 - 2*u1*v0) = 0", stageNote: "Booleanized sum node at weight 2^1." },
      { id: "c1", label: "c1", type: "and", x: 404, y: 214, role: "Weight-1 carry", signal: "carry from u1 and v0", polynomial: "c1 - u1*v0 = 0", stageNote: "Carry isolation shrinks later equations." },
      { id: "s2", label: "s2", type: "and", x: 404, y: 300, role: "Weight-2 sum", signal: "support for u2, v1, c1", polynomial: "s2 - (u2 + v1 + c1 - 2*u2*v1 - 2*u2*c1 - 2*v1*c1 + 4*u2*v1*c1) = 0", stageNote: "This is the densest local polynomial in the demo." },
      { id: "c2", label: "c2", type: "and", x: 404, y: 388, role: "Weight-2 carry", signal: "carry support into top weight", polynomial: "c2 - (u2*v1 + u2*c1 + v1*c1 - 2*u2*v1*c1) = 0", stageNote: "High-weight carry support before output rewriting." },
      { id: "p0", label: "p0", type: "output", x: 640, y: 64, role: "Output bit", signal: "Weight 2^0", polynomial: "p0 - u0 = 0", stageNote: "Direct output mapping." },
      { id: "p1", label: "p1", type: "output", x: 640, y: 140, role: "Output bit", signal: "Weight 2^1", polynomial: "p1 - s1 = 0", stageNote: "Derived after the first local rewrite." },
      { id: "p2", label: "p2", type: "output", x: 640, y: 244, role: "Output bit", signal: "Weight 2^2", polynomial: "p2 - s2 = 0", stageNote: "This bit shows the benefit of eliminating c1 first." },
      { id: "p3", label: "p3", type: "output", x: 640, y: 334, role: "Output bit", signal: "Weight 2^3", polynomial: "p3 - (v2 + c2 - 2*v2*c2) = 0", stageNote: "Final non-trivial output relation." },
      { id: "p4", label: "p4", type: "output", x: 640, y: 404, role: "Output bit", signal: "Weight 2^4", polynomial: "p4 - v2*c2 = 0", stageNote: "Top carry output." }
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
    ],
    specification: {
      polynomial: "p0 + 2*p1 + 4*p2 + 8*p3 + 16*p4 - (a0 + 2*a1 + 4*a2)*(b0 + 2*b1) = 0",
      result: "CORRECT MULTIPLIER",
      steps: [
        { type: "slice-start", slice: 4 },
        { type: "reduce", polynomial: "p4 - a1*a2*b0*b1 + higher-order Boolean-normalized support = 0", remainder: "weight 2^4 term absorbed into the running remainder" },
        { type: "slice-end", slice: 4, remainder: "remainder now carries only weights 2^0..2^3" },
        { type: "slice-start", slice: 3 },
        { type: "reduce", polynomial: "p3 - arithmetic support at weight 2^3 in a0,a1,a2,b0,b1", remainder: "weight 2^3 term absorbed into the running remainder" },
        { type: "slice-end", slice: 3, remainder: "remainder now carries only weights 2^0..2^2" },
        { type: "slice-start", slice: 2 },
        { type: "reduce", polynomial: "p2 - arithmetic support at weight 2^2 in a0,a1,a2,b0,b1", remainder: "weight 2^2 term absorbed into the running remainder" },
        { type: "slice-end", slice: 2, remainder: "remainder now carries only weights 2^0..2^1" },
        { type: "slice-start", slice: 1 },
        { type: "reduce", polynomial: "p1 - a1*b0 - a0*b1 + 2*a0*a1*b0*b1 = 0", remainder: "a0*b0 + 2*a1*b0 + 2*a0*b1 - (a0 + 2*a1 + 4*a2)*(b0 + 2*b1)" },
        { type: "slice-end", slice: 1, remainder: "a0*b0 + 2*a1*b0 + 2*a0*b1 - (a0 + 2*a1 + 4*a2)*(b0 + 2*b1)" },
        { type: "slice-start", slice: 0 },
        { type: "reduce", polynomial: "p0 - a0*b0 = 0", remainder: "a0*b0 + 2*a1*b0 + 2*a0*b1 - (a0 + 2*a1 + 4*a2)*(b0 + 2*b1)" },
        { type: "reduce", polynomial: "(a0 + 2*a1 + 4*a2)*(b0 + 2*b1) - a0*b0 - 2*a1*b0 - 2*a0*b1 - higher terms = 0", remainder: "0" },
        { type: "slice-end", slice: 0, remainder: "0" }
      ]
    }
  }
];

let examples = fallbackExamples;

const REDUNDANT_STAGE_NAMES = new Set([
  "Detect partial products",
  "Identify xor support"
]);

const STAGE_NAMES_WITHOUT_EXTRA_EQUATIONS = new Set(["Initialize slices"]);

// Only stages at or after "Initialize slices" in the toolbar should group the
// polynomial list by slice - "Remove internal xor gates" now runs *before*
// slices exist (see the step-2/step-3 swap), so even though it carries
// microSteps like the later reduction stages, grouping it by slice would show
// "Slice N" headers before slices have actually been initialized.
const GROUP_BY_SLICE_STAGE_NAMES = new Set([
  "Initialize slices",
  "Eliminate single-occurrence nodes",
  "Remove gates without a slice"
]);


const state = {
  exampleIndex: 0,
  stageIndex: 0,
  microStepIndex: null,
  activeNodeId: null,
  zoom: null,
  viewMode: "full",
  sliceIndex: null,
  phase: "preprocessing",
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
const specStepLog = document.querySelector("#specStepLog");
const specStepLabel = document.querySelector("#specStepLabel");
const specStepBack = document.querySelector("#specStepBack");
const specStepForward = document.querySelector("#specStepForward");
const specSliceBack = document.querySelector("#specSliceBack");
const specSliceForward = document.querySelector("#specSliceForward");
const specStepRunAll = document.querySelector("#specStepRunAll");
const specStepReset = document.querySelector("#specStepReset");

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
const nodeStageNote = document.querySelector("#nodeStageNote");
const nodeInspector = document.querySelector("#nodeInspector");
const zoomOut = document.querySelector("#zoomOut");
const zoomIn = document.querySelector("#zoomIn");
const zoomReset = document.querySelector("#zoomReset");
const zoomLabel = document.querySelector("#zoomLabel");
const graphCard = document.querySelector(".graph-card");

function currentExample() {
  return examples[state.exampleIndex];
}

function activeNodes() {
  return currentExample().nodes;
}

function activeEdges() {
  const overlay = currentOverlay();
  // Nothing has been eliminated yet: show the original, graphviz-laid-out
  // AIG edges (with their pretty stored bezier points) instead of an empty
  // computed set.
  return overlay.rootUpdates.length ? overlay.edges : currentExample().edges;
}

function normalizeExample(example) {
  const stages = Array.isArray(example.stages)
    ? example.stages.filter((stage) => !REDUNDANT_STAGE_NAMES.has(stage.name))
    : [];

  return {
    ...example,
    stages: stages.length ? stages : example.stages
  };
}

function currentStage() {
  return currentExample().stages[state.stageIndex];
}

function currentSpecification() {
  return currentExample().specification;
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

let overlayCache = { exampleIndex: null, stageIndex: null, microStepLimit: null, overlay: null };

// Reduction-phase stages (Remove internal xor gates / Eliminate
// single-occurrence nodes / Remove gates without a slice) don't carry a full
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
  const stages = currentExample().stages;
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

  const aliveIds = new Set(currentExample().nodes.map((node) => node.id).filter((id) => !dimmed.has(id)));
  const edges = [];

  // Edge convention (matches the original AIG data): `from` is the
  // consuming gate, `to` is the child it depends on - e.g. l18's
  // polynomial "-l18+b0*a0" produces edges {from:l18,to:a0} and
  // {from:l18,to:b0}. A gate that was never touched (never absorbed a
  // child - only single-fanout children ever get eliminated, so this is
  // exactly the gates whose fan-in hasn't changed) still has its original,
  // unrewired edges: keep those as-is rather than dropping them just
  // because they aren't in the delta trail.
  currentExample().edges.forEach((edge) => {
    if (!live.has(edge.from) && aliveIds.has(edge.from)) {
      edges.push(edge);
    }
  });

  live.forEach((expression, name) => {
    variableTokens(expression).forEach((token) => {
      if (token === name || !aliveIds.has(token)) {
        return;
      }
      edges.push({ from: name, to: token, inverted: false });
    });
  });

  return {
    dimmedNodes: [...dimmed],
    rootUpdates: [...live.entries()].map(([nodeId, expression]) => ({ nodeId, expression })),
    edges
  };
}

function currentOverlay() {
  const microLimit = currentMicroStepLimit();
  if (
    overlayCache.exampleIndex === state.exampleIndex &&
    overlayCache.stageIndex === state.stageIndex &&
    overlayCache.microStepLimit === microLimit
  ) {
    return overlayCache.overlay;
  }

  const overlay = computeOverlayForStage(state.stageIndex, microLimit);
  overlayCache = { exampleIndex: state.exampleIndex, stageIndex: state.stageIndex, microStepLimit: microLimit, overlay };
  return overlay;
}

// The complete, fully-rewritten polynomial set once every preprocessing
// stage has run to completion - independent of wherever state.stageIndex /
// state.microStepIndex happen to be, so the Specification rewrite tab can
// always show the finished set rather than a mid-preprocessing snapshot.
function finalOverlay() {
  const stages = currentExample().stages;
  const lastIndex = stages.length - 1;
  const microSteps = stages[lastIndex].microSteps ?? [];
  return computeOverlayForStage(lastIndex, microSteps.length);
}

function currentStageDimmedSet() {
  return new Set(currentOverlay().dimmedNodes);
}

function currentStageRootUpdatesMap() {
  const updates = currentOverlay().rootUpdates;
  return new Map(updates.map((update) => [update.nodeId, update.expression]));
}

// Slices are only meaningful in the "Initialize slices" stage, and only
// hovering the slice's own output gate (s_i) should reveal its members.
function hoveredSliceValue() {
  if (!state.activeNodeId || currentStage().name !== "Initialize slices") {
    return null;
  }
  const node = nodeMap().get(state.activeNodeId);
  if (!node || node.type !== "output" || typeof node.slice !== "number") {
    return null;
  }
  return node.slice;
}

function currentSlices() {
  return currentExample().slices ?? [];
}

function ensureSliceSelection() {
  const slices = currentSlices();
  if (!slices.length) {
    state.sliceIndex = null;
    return;
  }

  if (!slices.includes(state.sliceIndex)) {
    state.sliceIndex = slices[slices.length - 1];
  }
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

function shouldAppendStagePolynomials(stage) {
  return !STAGE_NAMES_WITHOUT_EXTRA_EQUATIONS.has(stage.name);
}

function buildExamplePicker() {
  examplePicker.innerHTML = examples
    .map(
      (example, index) => `
        <button
          class="pill-button ${index === state.exampleIndex ? "active" : ""}"
          type="button"
          data-example-index="${index}"
        >
          ${escapeHtml(example.label)}
        </button>
      `
    )
    .join("");

  examplePicker.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.exampleIndex = Number(button.dataset.exampleIndex);
      state.stageIndex = 0;
      state.microStepIndex = null;
      state.activeNodeId = null;
      state.zoom = null;
      state.specStepIndex = 0;
      ensureSliceSelection();
      render();
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

function visibleNodeIds() {
  if (state.viewMode !== "slice") {
    return new Set(activeNodes().map((node) => node.id));
  }

  ensureSliceSelection();
  const activeSlice = state.sliceIndex;
  return new Set(
    activeNodes()
      .filter((node) => node.type === "input" || node.slice === activeSlice)
      .map((node) => node.id)
  );
}

function visibleNodes() {
  const ids = visibleNodeIds();
  return activeNodes().filter((node) => ids.has(node.id));
}

function visibleEdges() {
  const ids = visibleNodeIds();
  return activeEdges().filter((edge) => ids.has(edge.from) && ids.has(edge.to));
}

function compactSliceNodes(nodes, edges) {
  const levelById = new Map();
  const outgoing = new Map(nodes.map((node) => [node.id, []]));
  const incomingCount = new Map(nodes.map((node) => [node.id, 0]));

  edges.forEach((edge) => {
    outgoing.get(edge.from)?.push(edge.to);
    incomingCount.set(edge.to, (incomingCount.get(edge.to) ?? 0) + 1);
  });

  const queue = nodes
    .filter((node) => (incomingCount.get(node.id) ?? 0) === 0)
    .sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }));

  queue.forEach((node) => levelById.set(node.id, 0));

  while (queue.length) {
    const node = queue.shift();
    const level = levelById.get(node.id) ?? 0;
    (outgoing.get(node.id) ?? []).forEach((childId) => {
      const nextLevel = level + 1;
      levelById.set(childId, Math.max(levelById.get(childId) ?? 0, nextLevel));
      incomingCount.set(childId, (incomingCount.get(childId) ?? 1) - 1);
      if ((incomingCount.get(childId) ?? 0) === 0) {
        const childNode = nodes.find((candidate) => candidate.id === childId);
        if (childNode) {
          queue.push(childNode);
        }
      }
    });
  }

  const layers = new Map();
  nodes.forEach((node) => {
    const level = levelById.get(node.id) ?? 0;
    if (!layers.has(level)) {
      layers.set(level, []);
    }
    layers.get(level).push(node);
  });

  const laidOut = [];
  const sortedLevels = [...layers.keys()].sort((left, right) => left - right);
  sortedLevels.forEach((level) => {
    const layer = layers.get(level).sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }));
    const baseX = 80;
    const spacingX = 92;
    const y = 70 + level * 110;
    layer.forEach((node, index) => {
      laidOut.push({
        ...node,
        x: baseX + index * spacingX,
        y
      });
    });
  });

  return laidOut;
}

function renderGraphToolbar() {
  zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
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

function buildPolynomialEntries(dimmedNodes, rootUpdates, extraPolynomials, options = {}) {
  const { groupBySlice = false, decreasing = false } = options;
  const entries = [];
  const seen = new Set();

  const polynomialNodes = activeNodes()
    .filter((node) => !dimmedNodes.has(node.id) && node.type !== "input")
    .sort((left, right) => left.label.localeCompare(right.label, undefined, { numeric: true }));

  polynomialNodes.forEach((node) => {
    const isRewritten = rootUpdates.has(node.id);
    const slice = typeof node.slice === "number" ? node.slice : null;
    // A gate that absorbed an eliminated child's polynomial (e.g. during xor
    // removal) but still has no slice is only transiently "ungrouped" - it
    // hasn't been through slicing yet, so it's not a real standing member of
    // the Ungrouped bucket. Drop it there instead of cluttering that group.
    if (groupBySlice && slice === null && isRewritten) {
      return;
    }
    const baseExpression = rootUpdates.get(node.id) ?? node.polynomial;
    const expression = formatPolynomialExpression(baseExpression);
    if (!expression) {
      return;
    }
    const label = node.label;
    const dedupeKey = `${label}::${expression}`;
    if (seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    entries.push({ label, expression, nodeId: node.id, slice });
  });

  // Keep stage-level equations like spec/goals visible when they do not map to a node equation.
  extraPolynomials.forEach((entry) => {
    const formattedExpression = formatPolynomialExpression(entry.expression);
    const dedupeKey = `${entry.label}::${formattedExpression}`;
    if (seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);
    entries.push({ label: entry.label, expression: formattedExpression, nodeId: null, slice: null });
  });

  if (groupBySlice) {
    // Decreasing slice order, matching the order the reduce step later
    // consumes them in (most-significant slice first); ungrouped nodes last.
    // Within a slice, gates are also listed in decreasing label order.
    entries.sort((left, right) => {
      const leftSlice = left.slice ?? -Infinity;
      const rightSlice = right.slice ?? -Infinity;
      if (leftSlice !== rightSlice) {
        return rightSlice - leftSlice;
      }
      return right.label.localeCompare(left.label, undefined, { numeric: true });
    });
  } else if (decreasing) {
    entries.reverse();
  }

  return entries;
}

function renderPolynomialEntries(title, entries, options = {}) {
  const { showSliceGroups = false } = options;
  polynomialTitle.textContent = title;
  polynomialCount.textContent = `${entries.length} eqs`;

  const rows = [];
  let previousSlice;
  entries.forEach((entry) => {
    if (showSliceGroups && entry.slice !== previousSlice) {
      previousSlice = entry.slice;
      const heading = entry.slice === null ? "Ungrouped" : `Slice ${entry.slice}`;
      rows.push(`<p class="poly-slice-header">${escapeHtml(heading)}</p>`);
    }
    rows.push(`
      <article class="poly-item compact-line"${entry.nodeId ? ` data-poly-node-id="${entry.nodeId}" tabindex="0" role="button" aria-label="highlight ${escapeHtml(entry.label)}"` : ""}>
        <h4>${escapeHtml(entry.label)}</h4>
        <p>${escapeHtml(entry.expression)}</p>
      </article>
    `);
  });

  polynomialList.innerHTML = rows.join("");

  bindPolynomialInteractions();
}

function renderPolynomialList() {
  const stage = currentStage();
  const dimmedNodes = currentStageDimmedSet();
  const rootUpdates = currentStageRootUpdatesMap();
  const extraPolynomials = shouldAppendStagePolynomials(stage) ? stage.polynomials : [];
  // Reduction-phase stages after slicing (single-occurrence elimination /
  // decomposition / unassigned-gate removal) whittle the same slice-grouped
  // set down node by node, so keep the slice grouping visible there too -
  // but not for "Remove internal xor gates", which now runs before slices
  // exist.
  const groupBySlice = GROUP_BY_SLICE_STAGE_NAMES.has(stage.name);
  // Descending order applies everywhere: within slice groups when grouped,
  // or as a flat reversed list on stages before slices exist (currently just
  // "Extract gate constraints" and "Remove internal xor gates").
  const decreasing = !groupBySlice;
  const entries = buildPolynomialEntries(dimmedNodes, rootUpdates, extraPolynomials, { groupBySlice, decreasing });
  renderPolynomialEntries(`${stage.name} active set`, entries, { showSliceGroups: groupBySlice });
}

// Used by the Specification rewrite tab: always the complete, fully-applied
// preprocessed polynomial set for the selected multiplier, regardless of
// which preprocessing stage/microstep was last active.
function renderFinalPolynomialList() {
  const overlay = finalOverlay();
  const dimmedNodes = new Set(overlay.dimmedNodes);
  const rootUpdates = new Map(overlay.rootUpdates.map((update) => [update.nodeId, update.expression]));
  const entries = buildPolynomialEntries(dimmedNodes, rootUpdates, [], { groupBySlice: true });
  renderPolynomialEntries("Complete preprocessed set", entries, { showSliceGroups: true });
}

function bindPolynomialInteractions() {
  polynomialList.querySelectorAll("[data-poly-node-id]").forEach((element) => {
    const { polyNodeId } = element.dataset;

    const activate = () => {
      state.activeNodeId = polyNodeId;
      updateGraphHighlight();
      renderInspector();
    };

    const clear = () => {
      state.activeNodeId = null;
      updateGraphHighlight();
      renderInspector();
    };

    element.addEventListener("mouseenter", activate);
    element.addEventListener("focus", activate);
    element.addEventListener("mouseleave", clear);
    element.addEventListener("blur", clear);
    element.addEventListener("click", activate);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
      if (event.key === "Escape") {
        clear();
      }
    });
  });
}

function nodeMap() {
  return new Map(activeNodes().map((node) => [node.id, node]));
}

function nodeParentsFor(nodeId) {
  const map = nodeMap();
  return visibleEdges()
    .filter((edge) => edge.to === nodeId)
    .map((edge) => map.get(edge.from)?.label || edge.from);
}

function nodeChildrenFor(nodeId) {
  const map = nodeMap();
  return visibleEdges()
    .filter((edge) => edge.from === nodeId)
    .map((edge) => `${edge.inverted ? "!" : ""}${map.get(edge.to)?.label || edge.to}`);
}

function renderInspector() {
  const example = currentExample();
  const activeNode = activeNodes().find((node) => node.id === state.activeNodeId);
  const rootUpdates = currentStageRootUpdatesMap();
  const dimmedNodes = currentStageDimmedSet();

  if (!activeNode) {
    nodeInspector.classList.add("is-empty");
    nodeName.textContent = "Hover over a node to examine details";
    nodeRole.textContent = example.stageNote;
    const firstRoot = [...rootUpdates.entries()][0];
    nodePolynomial.textContent = firstRoot
      ? `${firstRoot[0]}: ${firstRoot[1]}`
      : "The underlying circuit polynomial will appear here.";
    nodeSignal.textContent = "-";
    nodeParents.textContent = "-";
    nodeChildren.textContent = "-";
    nodeStageNote.textContent = currentStage().summary;
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
  const sliceValue = hoveredSliceValue();
  if (sliceValue !== null && activeNode.type === "output") {
    const members = activeNodes()
      .filter((node) => node.slice === sliceValue && node.id !== activeNode.id)
      .map((node) => node.label)
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
    nodeStageNote.textContent = members.length
      ? `Slice ${sliceValue} also includes: ${members.join(", ")}.`
      : `Slice ${sliceValue} has no other supporting nodes.`;
  } else if (dimmedNodes.has(activeNode.id)) {
    nodeStageNote.textContent = "Eliminated/decomposed at this stage and rendered faded in the graph.";
  } else if (stagePolynomial) {
    nodeStageNote.textContent = "Root polynomial updated by the active rewrite step.";
  } else {
    nodeStageNote.textContent = activeNode.stageNote;
  }
}

function renderHeader() {
  const example = currentExample();
  const stage = currentStage();

  stageSummary.textContent = stage.summary;
  exampleTitle.textContent = example.title;
  exampleDescription.textContent = example.description;
}

function edgeClassNames(edge, map, sliceValue) {
  const classes = ["graph-edge"];
  if (edge.inverted) {
    classes.push("inverted");
  }
  const isActive = state.activeNodeId && (edge.from === state.activeNodeId || edge.to === state.activeNodeId);
  const isSliceMember =
    sliceValue !== null && map.get(edge.from)?.slice === sliceValue && map.get(edge.to)?.slice === sliceValue;
  if (isActive) {
    classes.push("active");
  } else if (isSliceMember) {
    classes.push("slice-focus");
  } else if (sliceValue !== null) {
    classes.push("slice-dim");
  }
  return classes.join(" ");
}

function nodeMarkup(node, sliceValue) {
  const isActive = node.id === state.activeNodeId;
  const isDimmed = currentStageDimmedSet().has(node.id);
  const isRootUpdated = currentStageRootUpdatesMap().has(node.id);
  const isSliceMember = sliceValue !== null && node.slice === sliceValue;
  const isSliceFocus = isSliceMember && !isActive;
  const isSliceDim = sliceValue !== null && !isSliceMember && !isActive;
  const classes = [
    "graph-node",
    node.type,
    isActive ? "active" : "",
    isDimmed ? "dimmed" : "",
    isRootUpdated ? "root-updated" : "",
    isSliceFocus ? "slice-focus" : "",
    isSliceDim ? "slice-dim" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const width = node.width ?? (node.type === "output" ? 60 : 48);
  const height = node.height ?? 36;
  const label = escapeHtml(node.label);
  const ariaLabel = escapeHtml(node.label);
  const shape = node.shape ?? (node.type === "output" ? "rect" : "circle");

  if (shape === "triangle") {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return `
      <g class="${classes}" data-node-id="${node.id}" tabindex="0" role="button" aria-label="${ariaLabel}" transform="translate(${node.x}, ${node.y})">
        <polygon points="0,${-halfHeight} ${halfWidth},${halfHeight} ${-halfWidth},${halfHeight}"></polygon>
        <text y="6">${label}</text>
      </g>
    `;
  }

  if (shape === "box" || node.type === "output") {
    return `
      <g class="${classes}" data-node-id="${node.id}" tabindex="0" role="button" aria-label="${ariaLabel}" transform="translate(${node.x}, ${node.y})">
        <rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}"></rect>
        <text y="1">${label}</text>
      </g>
    `;
  }

  return `
    <g class="${classes}" data-node-id="${node.id}" tabindex="0" role="button" aria-label="${ariaLabel}" transform="translate(${node.x}, ${node.y})">
      <ellipse rx="${width / 2}" ry="${height / 2}"></ellipse>
      <text y="1">${label}</text>
    </g>
  `;
}

function bindGraphInteractions() {
  graphElement.querySelectorAll("[data-node-id]").forEach((element) => {
    const { nodeId } = element.dataset;

    const focusNode = () => {
      state.activeNodeId = nodeId;
      updateGraphHighlight();
      renderInspector();
    };

    element.addEventListener("mouseenter", focusNode);
    element.addEventListener("focus", focusNode);
    element.addEventListener("click", focusNode);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        focusNode();
      }
    });
  });
}

graphElement.addEventListener("mouseleave", () => {
  state.activeNodeId = null;
  updateGraphHighlight();
  renderInspector();
});

function edgePath(edge, map, useStoredPoints = true) {
  if (useStoredPoints && edge.points?.length) {
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

function currentGraphSize() {
  const example = currentExample();
  const edges = visibleEdges();
  const useStoredPoints = state.viewMode === "full";
  const baseNodes = visibleNodes();
  const nodes = useStoredPoints ? baseNodes : compactSliceNodes(baseNodes, edges);

  if (useStoredPoints && example.graphWidth && example.graphHeight) {
    return {
      width: example.graphWidth,
      height: example.graphHeight
    };
  }

  const bounds = visibleGraphBounds(nodes, edges);
  return {
    width: bounds.width,
    height: bounds.height
  };
}

function ensureZoomInitialized() {
  if (typeof state.zoom === "number") {
    return;
  }

  const graphSize = currentGraphSize();
  const availableWidth = Math.max(260, graphCard.clientWidth - 24);
  const availableHeight = Math.max(220, graphCard.clientHeight - 24);
  const fit = Math.min(availableWidth / graphSize.width, availableHeight / graphSize.height, 1);
  state.zoom = Math.max(0.2, fit * 0.98);
}

function renderGraph() {
  const example = currentExample();
  const sourceMap = nodeMap();
  const baseNodes = visibleNodes();
  const edges = visibleEdges();
  const useStoredPoints = state.viewMode === "full";
  const nodes = useStoredPoints ? baseNodes : compactSliceNodes(baseNodes, edges);
  const map = new Map(nodes.map((node) => [node.id, node]));

  if (useStoredPoints && example.graphWidth && example.graphHeight) {
    graphElement.setAttribute("viewBox", `0 0 ${example.graphWidth} ${example.graphHeight}`);
    graphElement.style.width = `${example.graphWidth * state.zoom}px`;
    graphElement.style.height = `${example.graphHeight * state.zoom}px`;
  } else {
    const bounds = visibleGraphBounds(nodes, edges);
    graphElement.setAttribute("viewBox", `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`);
    graphElement.style.width = `${bounds.width * state.zoom}px`;
    graphElement.style.height = `${bounds.height * state.zoom}px`;
  }

  const sliceValue = hoveredSliceValue();

  const edgeMarkup = edges
    .map((edge, index) => {
      const path = edgePath(edge, map, useStoredPoints);
      const marker = edge.inverted ? " marker-end=\"url(#inversionBubble)\"" : "";
      return `<path class="${edgeClassNames(edge, map, sliceValue)}" data-edge-index="${index}" d="${path}"${marker}></path>`;
    })
    .join("");

  const nodeLayer = nodes.map((node) => nodeMarkup(node, sliceValue)).join("");

  graphElement.innerHTML = `
    <defs>
      <marker id="inversionBubble" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto" markerUnits="userSpaceOnUse">
        <circle cx="6" cy="6" r="4.2" fill="var(--surface-strong)" stroke="var(--ink)" stroke-width="1.4"></circle>
      </marker>
    </defs>
    <g class="edge-layer">${edgeMarkup}</g>
    <g class="node-layer">${nodeLayer}</g>
  `;

  bindGraphInteractions();

  if (state.viewMode === "slice") {
    graphCard.scrollTop = 0;
    graphCard.scrollLeft = 0;
  }
}

function updateGraphHighlight() {
  const edges = visibleEdges();
  const map = nodeMap();
  const sliceValue = hoveredSliceValue();

  graphElement.querySelectorAll("[data-node-id]").forEach((element) => {
    const { nodeId } = element.dataset;
    const isActive = nodeId === state.activeNodeId;
    const isSliceMember = sliceValue !== null && map.get(nodeId)?.slice === sliceValue;
    element.classList.toggle("active", isActive);
    element.classList.toggle("slice-focus", isSliceMember && !isActive);
    element.classList.toggle("slice-dim", sliceValue !== null && !isSliceMember && !isActive);
  });

  edges.forEach((edge, index) => {
    const edgeElement = graphElement.querySelector(`[data-edge-index="${index}"]`);
    const isActive = state.activeNodeId && (edge.from === state.activeNodeId || edge.to === state.activeNodeId);
    const isSliceMember =
      sliceValue !== null && map.get(edge.from)?.slice === sliceValue && map.get(edge.to)?.slice === sliceValue;
    edgeElement?.classList.toggle("active", Boolean(isActive));
    edgeElement?.classList.toggle("slice-focus", Boolean(!isActive && isSliceMember));
    edgeElement?.classList.toggle("slice-dim", Boolean(!isActive && sliceValue !== null && !isSliceMember));
  });

  polynomialList.querySelectorAll("[data-poly-node-id]").forEach((element) => {
    const isActive = element.dataset.polyNodeId === state.activeNodeId;
    element.classList.toggle("active-link", isActive);
    if (isActive) {
      element.scrollIntoView({ block: "nearest" });
    }
  });
}

function renderSpecStepEntry(step) {
  if (step.type === "slice-start") {
    const header = `<div class="spec-log-entry spec-log-slice-header">Reducing by slice ${step.slice}</div>`;

    if (!step.localSpecification) {
      return header;
    }

    // AMulet builds this slice's share of the specification (the weighted
    // output bit, plus the partial products that must cancel against it)
    // before reducing it node-by-node with the gate constraints below -
    // surface that split explicitly instead of only showing the result.
    const outputRow = step.outputTerm
      ? `<p class="spec-log-split-row"><span class="spec-log-split-label">output gate</span>${escapeHtml(formatPolynomialExpression(step.outputTerm))}</p>`
      : "";
    const partialProductsRow = step.partialProducts
      ? `<p class="spec-log-split-row"><span class="spec-log-split-label">partial products</span>${escapeHtml(formatPolynomialExpression(step.partialProducts))}</p>`
      : "";

    return `
      ${header}
      <div class="spec-log-entry spec-log-split">
        <p class="spec-log-split-title">Split specification for slice ${step.slice}</p>
        ${outputRow}
        ${partialProductsRow}
        <p class="spec-log-remainder">local specification = ${escapeHtml(formatPolynomialExpression(step.localSpecification))}</p>
      </div>
    `;
  }

  if (step.type === "slice-end") {
    return `
      <div class="spec-log-entry spec-log-slice-footer">
        <p>After reducing by slice ${step.slice}</p>
        <p class="spec-log-remainder">remainder = ${escapeHtml(formatPolynomialExpression(step.remainder))}</p>
      </div>
    `;
  }

  return `
    <div class="spec-log-entry spec-log-step">
      <p class="spec-log-divisor">reducing by ${escapeHtml(formatPolynomialExpression(step.polynomial))}</p>
      <p class="spec-log-remainder">remainder = ${escapeHtml(formatPolynomialExpression(step.remainder))}</p>
    </div>
  `;
}

// "slice-start"/"slice-end" entries are bookkeeping, not actual polynomial
// rewrites - only "reduce" steps substitute a gate's polynomial into the
// remainder, so only those should count towards the step label. This count
// matches the number of polynomials in the Complete preprocessed set: every
// gate alive at the end of preprocessing is substituted in exactly once.
function countRewriteSteps(steps) {
  return steps.reduce((count, step) => count + (step.type === "reduce" ? 1 : 0), 0);
}

function renderSpecView() {
  const spec = currentSpecification();
  if (!spec) {
    specPolynomial.textContent = "No specification data available for this example.";
    specStepLog.innerHTML = "";
    specStepLabel.textContent = "0 / 0";
    specStepBack.disabled = true;
    specStepForward.disabled = true;
    specSliceBack.disabled = true;
    specSliceForward.disabled = true;
    return;
  }

  specPolynomial.textContent = formatPolynomialExpression(spec.polynomial);

  const totalSteps = spec.steps.length;
  state.specStepIndex = Math.max(0, Math.min(state.specStepIndex, totalSteps));
  specStepBack.disabled = state.specStepIndex === 0;
  specStepForward.disabled = state.specStepIndex === totalSteps;
  specSliceBack.disabled = state.specStepIndex === 0;
  specSliceForward.disabled = state.specStepIndex === totalSteps;

  const revealedSteps = spec.steps.slice(0, state.specStepIndex);
  specStepLabel.textContent = `${countRewriteSteps(revealedSteps)} / ${countRewriteSteps(spec.steps)}`;

  const logMarkup = revealedSteps.map(renderSpecStepEntry).join("");
  const resultMarkup =
    state.specStepIndex === totalSteps && totalSteps > 0
      ? `<div class="spec-log-entry spec-log-result">${escapeHtml(spec.result ?? "")}</div>`
      : "";

  specStepLog.innerHTML =
    logMarkup ||
    `<p class="muted-copy">Step forward to reduce the specification polynomial by each remaining gate constraint, slice by slice, until the remainder collapses to zero.</p>`;
  specStepLog.insertAdjacentHTML("beforeend", resultMarkup);
  const scrollContainer = specStepLog.closest(".graph-card") ?? specStepLog;
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

function render() {
  if (!examples.length) {
    return;
  }

  ensureSliceSelection();
  ensureZoomInitialized();
  if (state.activeNodeId && !visibleNodeIds().has(state.activeNodeId)) {
    state.activeNodeId = null;
  }

  buildExamplePicker();
  buildPhaseTabs();
  preprocessingView.hidden = state.phase !== "preprocessing";
  specificationView.hidden = state.phase !== "specification";

  renderHeader();

  if (state.phase === "specification") {
    renderFinalPolynomialList();
    renderSpecView();
    return;
  }

  renderStageList();
  renderPipelineControls();
  renderPolynomialList();
  renderGraphToolbar();
  renderGraph();
  renderInspector();
}

zoomOut.addEventListener("click", () => {
  ensureZoomInitialized();
  state.zoom = Math.max(0.45, state.zoom - 0.15);
  renderGraphToolbar();
  renderGraph();
  renderInspector();
});

zoomIn.addEventListener("click", () => {
  ensureZoomInitialized();
  state.zoom = Math.min(2.5, state.zoom + 0.15);
  renderGraphToolbar();
  renderGraph();
  renderInspector();
});

zoomReset.addEventListener("click", () => {
  state.zoom = null;
  render();
});

specStepBack.addEventListener("click", () => {
  state.specStepIndex = Math.max(0, state.specStepIndex - 1);
  renderSpecView();
});

specStepForward.addEventListener("click", () => {
  const total = currentSpecification()?.steps.length ?? 0;
  state.specStepIndex = Math.min(total, state.specStepIndex + 1);
  renderSpecView();
});

// Jump a whole slice at a time instead of one gate substitution at a time.
specSliceBack.addEventListener("click", () => {
  const steps = currentSpecification()?.steps ?? [];
  let target = 0;
  for (let index = 0; index < state.specStepIndex - 1; index++) {
    if (steps[index].type === "slice-start") {
      target = index + 1;
    }
  }
  state.specStepIndex = target;
  renderSpecView();
});

specSliceForward.addEventListener("click", () => {
  const steps = currentSpecification()?.steps ?? [];
  const nextSliceEnd = steps.findIndex(
    (step, index) => step.type === "slice-end" && index >= state.specStepIndex
  );
  state.specStepIndex = nextSliceEnd === -1 ? steps.length : nextSliceEnd + 1;
  renderSpecView();
});

specStepRunAll.addEventListener("click", () => {
  state.specStepIndex = currentSpecification()?.steps.length ?? 0;
  renderSpecView();
});

specStepReset.addEventListener("click", () => {
  state.specStepIndex = 0;
  renderSpecView();
});

document.addEventListener("keydown", (event) => {
  if (state.phase === "specification") {
    const total = currentSpecification()?.steps.length ?? 0;
    if (event.key === "ArrowLeft") {
      state.specStepIndex = Math.max(0, state.specStepIndex - 1);
      renderSpecView();
    }

    if (event.key === "ArrowRight") {
      state.specStepIndex = Math.min(total, state.specStepIndex + 1);
      renderSpecView();
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
  try {
    const response = await fetch("./data/generated/examples.json", { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length) {
      examples = data.map(normalizeExample);
      state.exampleIndex = 0;
      state.stageIndex = 0;
      state.microStepIndex = null;
      state.activeNodeId = null;
      state.zoom = null;
      state.viewMode = "full";
      state.sliceIndex = null;
      state.specStepIndex = 0;
    }
  } catch {
    examples = fallbackExamples;
  }
}

loadGeneratedExamples().finally(render);