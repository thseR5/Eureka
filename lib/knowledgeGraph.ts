export interface KGNode {
  id: string;
  label: string;
  status: 'undiscovered' | 'discovered' | 'mastered';
  group: string;
  description?: string;
  keyFacts?: string[];
  formula?: string;
  doubtFlow?: {
    initialDoubt: string;
    steps: string[];
    resolution: string;
  };
}

export interface KGLink {
  source: string;
  target: string;
}

export interface KnowledgeGraphState {
  nodes: KGNode[];
  links: KGLink[];
}

const SUBJECT_NODES: Record<string, KGNode[]> = {
  physics: [
    {
      id: 'free_fall',
      label: 'Free Fall',
      status: 'discovered',
      group: 'mechanics',
      description: 'Objects in free fall accelerate at the same rate regardless of mass. Galileo disproved Aristotle\'s claim that heavier objects fall faster.',
      keyFacts: ['All objects fall at 9.8 m/s² near Earth', 'Air resistance is the only reason a feather falls slower than a ball', 'On the Moon (no air), a hammer and feather hit the ground together'],
      formula: 'h = ½gt²',
      doubtFlow: {
        initialDoubt: 'Heavier objects must fall faster because gravity pulls them harder.',
        steps: [
          'Isolate shape from weight by comparing identical flat and crumpled papers.',
          'Remove the atmosphere entirely through a thought experiment on the Moon.',
          'Recognize that gravity accelerates all objects at the exact same rate (9.8 m/s²).'
        ],
        resolution: 'All masses free-fall at the exact same rate when air resistance is ignored.'
      }
    },
    { id: 'inertia', label: "Newton's 1st", status: 'undiscovered', group: 'mechanics', description: 'An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force.', keyFacts: ['Also called the Law of Inertia', 'A hockey puck on frictionless ice would slide forever', 'Seatbelts protect you because your body wants to keep moving'], formula: 'If ΣF = 0, then Δv = 0' },
    { id: 'force', label: 'F = ma', status: 'undiscovered', group: 'mechanics', description: 'Force equals mass times acceleration. The heavier the object, the more force needed to accelerate it.', keyFacts: ['Measured in Newtons (N)', '1N = force to accelerate 1kg at 1 m/s²', 'Weight is a force: W = mg'], formula: 'F = ma' },
    { id: 'friction', label: 'Friction', status: 'undiscovered', group: 'mechanics', description: 'Friction is a force that opposes motion between surfaces in contact. It converts kinetic energy to thermal energy.', keyFacts: ['Static friction > kinetic friction', 'Depends on surface roughness and normal force', 'Without friction, you couldn\'t walk'], formula: 'f = μN' },
    { id: 'momentum', label: 'Momentum', status: 'undiscovered', group: 'mechanics', description: 'Momentum is the product of mass and velocity. It is always conserved in a closed system.', keyFacts: ['Conserved in all collisions', 'Impulse changes momentum: F×t = Δp', 'A truck at low speed can have more momentum than a bullet'], formula: 'p = mv' },
    { id: 'gravity', label: 'Gravity', status: 'undiscovered', group: 'fields', description: 'Every object with mass attracts every other object. Gravity is the weakest fundamental force but acts over infinite distance.', keyFacts: ['g = 9.8 m/s² on Earth\'s surface', 'Gravity keeps the Moon orbiting Earth', 'Your weight on Mars is ~38% of Earth weight'], formula: 'F = Gm₁m₂/r²' },
    { id: 'energy', label: 'Energy', status: 'undiscovered', group: 'fields', description: 'Energy cannot be created or destroyed, only transformed. The total energy of an isolated system remains constant.', keyFacts: ['Kinetic energy = energy of motion', 'Potential energy = stored energy', 'E is measured in Joules'], formula: 'KE = ½mv², PE = mgh' },
    { id: 'projectile', label: 'Projectile', status: 'undiscovered', group: 'kinematics', description: 'A projectile follows a parabolic path. Horizontal and vertical components of motion are independent.', keyFacts: ['Horizontal velocity stays constant (no air resistance)', 'Vertical acceleration = g downward', 'Maximum range at 45° launch angle'], formula: 'R = v₀²sin(2θ)/g' },
    { id: 'terminal_v', label: 'Terminal Velocity', status: 'undiscovered', group: 'kinematics', description: 'Terminal velocity is reached when air resistance equals gravitational force, so acceleration becomes zero.', keyFacts: ['Skydivers reach ~55 m/s (120 mph)', 'Depends on mass, cross-section area, and air density', 'A crumpled paper has higher terminal velocity than flat paper'], formula: 'v_t = √(2mg/ρAC_d)' },
    { id: 'waves', label: 'Wave Motion', status: 'undiscovered', group: 'waves', description: 'Waves transfer energy without transferring matter. They can be transverse (light) or longitudinal (sound).', keyFacts: ['Speed = frequency × wavelength', 'Sound waves need a medium; light doesn\'t', 'Interference: waves can add or cancel'], formula: 'v = fλ' },
  ],
  mathematics: [
    {
      id: 'sequences',
      label: 'Sequences',
      status: 'discovered',
      group: 'algebra',
      description: 'A sequence is an ordered list of numbers following a specific rule. Finding the pattern is the first step to general formulas.',
      keyFacts: ['Arithmetic: constant difference (e.g., 2, 5, 8)', 'Geometric: constant ratio (e.g., 3, 6, 12)', 'Fibonacci: recursive sum ($F_n = F_{n-1} + F_{n-2}$)'],
      doubtFlow: {
        initialDoubt: 'Sequences are just random numbers with no logical progression.',
        steps: [
          'Examine the Fibonacci sequence where each term is the sum of the two preceding terms.',
          'Observe the ratio of consecutive terms as the sequence grows.',
          'Discover the Golden Ratio convergence ($1.618...$).'
        ],
        resolution: 'Mathematical sequences follow explicit recursive or explicit rules, giving rise to natural constants like the Golden Ratio.'
      }
    },
    { id: 'limits', label: 'Limits', status: 'undiscovered', group: 'calculus' },
    { id: 'derivatives', label: 'Derivatives', status: 'undiscovered', group: 'calculus' },
    { id: 'integrals', label: 'Integrals', status: 'undiscovered', group: 'calculus' },
    { id: 'patterns', label: 'Patterns', status: 'undiscovered', group: 'algebra' },
    { id: 'proofs', label: 'Proofs', status: 'undiscovered', group: 'logic' },
    { id: 'infinity', label: 'Infinity', status: 'undiscovered', group: 'logic' },
    { id: 'functions', label: 'Functions', status: 'undiscovered', group: 'algebra' },
  ],
  chemistry: [
    {
      id: 'states',
      label: 'States of Matter',
      status: 'discovered',
      group: 'fundamentals',
      description: 'Matter exists as solid, liquid, gas, or plasma. State depends on temperature and pressure — molecules behave differently in each.',
      keyFacts: ['Solid: fixed shape and volume', 'Liquid: fixed volume, takes container shape', 'Gas: fills entire container', 'Plasma: ionized gas, found in stars'],
      formula: 'PV = nRT (ideal gas)',
      doubtFlow: {
        initialDoubt: 'Molecules change identity or break down when they boil or freeze.',
        steps: [
          'Examine how water molecules behave as solid ice versus liquid and gas steam.',
          'Recognize that thermal energy changes molecular spacing and movement, not molecular structure.',
          'Explore the role of pressure and intermolecular forces on phase transitions.'
        ],
        resolution: 'Phase changes are physical transitions where molecular arrangement and kinetic energy shift while the chemical identity remains unchanged.'
      }
    },
    { id: 'bonds', label: 'Chemical Bonds', status: 'undiscovered', group: 'fundamentals', description: 'Atoms bond by sharing (covalent) or transferring (ionic) electrons. Bond type determines material properties.', keyFacts: ['Ionic bonds: metal + nonmetal (e.g., NaCl)', 'Covalent bonds: nonmetal + nonmetal (e.g., H₂O)', 'Metallic bonds: electron sea model', 'Bond strength determines melting point'] },
    { id: 'reactions', label: 'Reactions', status: 'undiscovered', group: 'reactions', description: 'Chemical reactions rearrange atoms to form new substances. Atoms are conserved — nothing is created or destroyed.', keyFacts: ['Reactants → Products', 'Balanced equations: same atoms on both sides', 'Exothermic releases heat, endothermic absorbs heat', 'Catalyst speeds up without being consumed'] },
    { id: 'equilibrium', label: 'Equilibrium', status: 'undiscovered', group: 'reactions', description: 'At equilibrium, forward and reverse reactions occur at equal rates. The concentrations remain constant but reactions don\'t stop.', keyFacts: ['Dynamic, not static — reactions still happening', 'Le Chatelier\'s principle predicts shifts', 'K > 1 favors products, K < 1 favors reactants'], formula: 'K = [products]/[reactants]' },
    { id: 'electrons', label: 'Electron Config', status: 'undiscovered', group: 'atomic', description: 'Electrons occupy orbitals in specific patterns. Configuration determines chemical behavior and placement on periodic table.', keyFacts: ['Aufbau principle: fill lowest energy first', 'Pauli exclusion: max 2 electrons per orbital', 'Hund\'s rule: spread before pairing', 'Valence electrons determine reactivity'] },
    { id: 'molarity', label: 'Molarity', status: 'undiscovered', group: 'solutions', description: 'Molarity measures concentration — moles of solute per liter of solution. Essential for stoichiometry and lab work.', keyFacts: ['M = mol/L', 'Dilution: M₁V₁ = M₂V₂', '1 mole = 6.022 × 10²³ particles', 'Standard solutions have known molarity'], formula: 'M = n/V' },
    { id: 'thermo', label: 'Thermodynamics', status: 'undiscovered', group: 'energy', description: 'Energy flows from hot to cold. Entropy always increases in the universe. These laws govern every chemical and physical process.', keyFacts: ['1st law: energy is conserved', '2nd law: entropy always increases', 'Gibbs free energy predicts spontaneity', 'ΔG < 0 means spontaneous'], formula: 'ΔG = ΔH - TΔS' },
  ],
  biology: [
    {
      id: 'cells',
      label: 'Cell Theory',
      status: 'discovered',
      group: 'cell',
      description: 'All living things are made of cells. Cells are the basic unit of life and come from pre-existing cells.',
      keyFacts: ['Prokaryotic: no nucleus (bacteria)', 'Eukaryotic: has nucleus (animals, plants, fungi)', 'Cell membrane controls what enters/exits', 'Mitochondria = powerhouse of the cell'],
      doubtFlow: {
        initialDoubt: 'Living things can spontaneously generate from non-living matter.',
        steps: [
          'Analyze Pasteur\'s swan-neck flask experiments showing no growth without exposure.',
          'Understand that all living organisms are composed of cells as fundamental units.',
          'Conclude that cells only arise from pre-existing cells through cell division.'
        ],
        resolution: 'All living organisms are made of cells, cells are the basic unit of life, and all cells come from pre-existing cells.'
      }
    },
    { id: 'dna', label: 'DNA/RNA', status: 'undiscovered', group: 'molecular', description: 'DNA stores genetic instructions as a double helix. RNA reads and executes those instructions to build proteins.', keyFacts: ['DNA: A-T, G-C base pairs', 'RNA: single-stranded, uses U instead of T', 'Central dogma: DNA → RNA → Protein', 'Human genome: ~3 billion base pairs'] },
    { id: 'evolution', label: 'Evolution', status: 'undiscovered', group: 'macro', description: 'Species change over time through natural selection. Individuals with advantageous traits survive and reproduce more.', keyFacts: ['Darwin\'s theory of natural selection', 'Mutations create genetic variation', 'Fossils provide physical evidence', 'All life shares common ancestors'] },
    { id: 'ecology', label: 'Ecology', status: 'undiscovered', group: 'macro', description: 'Ecology studies interactions between organisms and their environment. Energy flows through food chains and nutrients cycle.', keyFacts: ['Producers → Consumers → Decomposers', 'Only ~10% energy transfers between trophic levels', 'Biodiversity increases ecosystem resilience', 'Keystone species have outsized impact'] },
    { id: 'genetics', label: 'Genetics', status: 'undiscovered', group: 'molecular', description: 'Genetics studies how traits are inherited from parents to offspring through genes on chromosomes.', keyFacts: ['Mendel\'s laws: dominance, segregation, independent assortment', 'Genotype = genetic makeup, Phenotype = observable trait', 'Punnett squares predict offspring ratios', 'Humans have 23 pairs of chromosomes'] },
    { id: 'photosynthesis', label: 'Photosynthesis', status: 'undiscovered', group: 'cell', description: 'Plants convert sunlight, CO₂, and water into glucose and oxygen. This is the foundation of most food chains on Earth.', keyFacts: ['Occurs in chloroplasts', 'Light reactions → Calvin cycle', 'Produces O₂ as a byproduct', 'Reverse of cellular respiration'], formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' },
    { id: 'homeostasis', label: 'Homeostasis', status: 'undiscovered', group: 'cell', description: 'The body maintains stable internal conditions (temperature, pH, glucose) through feedback loops despite external changes.', keyFacts: ['Negative feedback: counteracts change (most common)', 'Positive feedback: amplifies change (e.g., childbirth)', 'Body temperature regulated at ~37°C', 'Failure of homeostasis → disease'] },
  ],
  'computer-science': [
    {
      id: 'algorithms',
      label: 'Algorithms',
      status: 'discovered',
      group: 'theory',
      description: 'An algorithm is a step-by-step procedure to solve a problem. Efficiency is measured by time and space complexity.',
      keyFacts: ['Must be finite, definite, and effective', 'Sorting: bubble, merge, quick sort', 'Searching: linear vs binary search', 'Binary search: O(log n) — extremely fast'],
      doubtFlow: {
        initialDoubt: 'Computers process data instantly, so algorithm efficiency doesn\'t matter.',
        steps: [
          'Compare searching for a name in a sorted phonebook line-by-line vs splitting it in half.',
          'Discover that binary search scales logarithmically O(log n) while linear search scales linearly O(n).',
          'Realize that for large data, linear search crashes while logarithmic search takes milliseconds.'
        ],
        resolution: 'Algorithms determine how execution time scales with input size. Logarithmic scaling is essential for processing big data.'
      }
    },
    { id: 'data_structures', label: 'Data Structures', status: 'undiscovered', group: 'theory', description: 'Data structures organize data for efficient access. Choosing the right structure is often more important than the algorithm.', keyFacts: ['Array: O(1) access, O(n) insert', 'Linked List: O(1) insert, O(n) access', 'Hash Table: O(1) average for get/set', 'Tree: O(log n) search if balanced'] },
    { id: 'networking', label: 'Networking', status: 'undiscovered', group: 'systems', description: 'Computers communicate over networks using protocols. The internet is a network of networks using TCP/IP.', keyFacts: ['OSI model: 7 layers', 'TCP: reliable, ordered delivery', 'UDP: fast, no guarantee', 'HTTP/HTTPS: web communication'] },
    { id: 'recursion', label: 'Recursion', status: 'undiscovered', group: 'theory', description: 'A function that calls itself. Every recursive problem has a base case (stop condition) and a recursive case.', keyFacts: ['Must have a base case to avoid infinite loops', 'Call stack stores each function call', 'Fibonacci, factorial, tree traversal', 'Can always be converted to iteration'] },
    { id: 'complexity', label: 'Big O', status: 'undiscovered', group: 'theory', description: 'Big O notation describes how algorithm performance scales with input size. It measures worst-case growth rate.', keyFacts: ['O(1): constant — best possible', 'O(log n): logarithmic — very fast', 'O(n): linear — reasonable', 'O(n²): quadratic — slow for large input', 'O(2ⁿ): exponential — impractical'] },
    { id: 'databases', label: 'Databases', status: 'undiscovered', group: 'systems', description: 'Databases store and retrieve data efficiently. SQL databases use tables and relationships; NoSQL uses flexible schemas.', keyFacts: ['ACID: Atomicity, Consistency, Isolation, Durability', 'SQL: structured, relational (PostgreSQL, MySQL)', 'NoSQL: flexible, scalable (MongoDB, Redis)', 'Indexes speed up queries dramatically'] },
    { id: 'security', label: 'Security', status: 'undiscovered', group: 'systems', description: 'Security protects data and systems from unauthorized access. Encryption, authentication, and authorization are core pillars.', keyFacts: ['Encryption: symmetric (AES) vs asymmetric (RSA)', 'Hashing: one-way function (SHA-256)', 'HTTPS uses TLS for encrypted web traffic', 'Zero-trust: verify everything, trust nothing'] },
  ],
  engineering: [
    {
      id: 'forces_struct',
      label: 'Structural Forces',
      status: 'discovered',
      group: 'mechanics',
      description: 'Structures must resist tension (pulling), compression (pushing), and shear (sliding). Design balances strength with material cost.',
      keyFacts: ['Tension: cables, ropes', 'Compression: columns, pillars', 'Shear: bolts, rivets', 'Trusses distribute forces efficiently'],
      doubtFlow: {
        initialDoubt: 'Making a structure heavier is the only way to make it stronger.',
        steps: [
          'Compare simple flat beams to trusses and triangular distributions.',
          'Understand how tension and compression forces balance throughout a structure.',
          'Analyze structural shapes (like arches) that distribute loads efficiently without adding dead weight.'
        ],
        resolution: 'Structural strength depends on shape and force distribution (tension vs compression) rather than material mass.'
      }
    },
    { id: 'materials', label: 'Materials', status: 'undiscovered', group: 'mechanics', description: 'Material selection determines a structure\'s strength, weight, cost, and lifespan. Each material has unique stress-strain behavior.', keyFacts: ['Steel: high strength, heavy', 'Aluminum: lightweight, corrosion-resistant', 'Concrete: excellent in compression', 'Composites: tailored properties (carbon fiber)'] },
    { id: 'thermo_eng', label: 'Thermodynamics', status: 'undiscovered', group: 'energy', description: 'Engineering thermodynamics governs engines, refrigerators, and power plants. Heat flows from hot to cold; work is extracted in the process.', keyFacts: ['Carnot efficiency: theoretical maximum', 'Heat engines: convert heat to work', 'Refrigerators: move heat against gradient', 'Entropy always increases'], formula: 'η = 1 - T_cold/T_hot' },
    { id: 'circuits', label: 'Circuits', status: 'undiscovered', group: 'electrical', description: 'Electrical circuits are closed loops through which current flows. Voltage drives current; resistance opposes it.', keyFacts: ['Ohm\'s Law: V = IR', 'Series: same current, voltage divides', 'Parallel: same voltage, current divides', 'Power: P = IV'], formula: 'V = IR' },
    { id: 'design', label: 'Design Process', status: 'undiscovered', group: 'method', description: 'Engineering design is iterative: define the problem, brainstorm, prototype, test, and refine. Constraints drive creative solutions.', keyFacts: ['Define → Ideate → Prototype → Test → Iterate', 'Constraints: cost, weight, safety, time', 'Trade-offs are inevitable', 'Failure analysis improves future designs'] },
    { id: 'optimization', label: 'Optimization', status: 'undiscovered', group: 'method', description: 'Optimization finds the best solution within constraints. Engineers minimize cost, weight, or waste while maximizing performance.', keyFacts: ['Linear programming for resource allocation', 'Finite element analysis for structural design', 'Trade-off between performance and cost', 'Pareto optimal: can\'t improve one without worsening another'] },
  ],
};

const SUBJECT_LINKS: Record<string, KGLink[]> = {
  physics: [
    { source: 'free_fall', target: 'inertia' },
    { source: 'free_fall', target: 'gravity' },
    { source: 'inertia', target: 'force' },
    { source: 'force', target: 'momentum' },
    { source: 'force', target: 'friction' },
    { source: 'gravity', target: 'projectile' },
    { source: 'gravity', target: 'terminal_v' },
    { source: 'momentum', target: 'energy' },
    { source: 'energy', target: 'waves' },
  ],
  mathematics: [
    { source: 'sequences', target: 'limits' },
    { source: 'sequences', target: 'patterns' },
    { source: 'limits', target: 'derivatives' },
    { source: 'derivatives', target: 'integrals' },
    { source: 'patterns', target: 'proofs' },
    { source: 'proofs', target: 'infinity' },
    { source: 'functions', target: 'derivatives' },
    { source: 'functions', target: 'patterns' },
  ],
  chemistry: [
    { source: 'states', target: 'bonds' },
    { source: 'states', target: 'thermo' },
    { source: 'bonds', target: 'reactions' },
    { source: 'bonds', target: 'electrons' },
    { source: 'reactions', target: 'equilibrium' },
    { source: 'equilibrium', target: 'molarity' },
    { source: 'thermo', target: 'equilibrium' },
  ],
  biology: [
    { source: 'cells', target: 'dna' },
    { source: 'cells', target: 'photosynthesis' },
    { source: 'cells', target: 'homeostasis' },
    { source: 'dna', target: 'genetics' },
    { source: 'genetics', target: 'evolution' },
    { source: 'evolution', target: 'ecology' },
  ],
  'computer-science': [
    { source: 'algorithms', target: 'data_structures' },
    { source: 'algorithms', target: 'recursion' },
    { source: 'algorithms', target: 'complexity' },
    { source: 'data_structures', target: 'databases' },
    { source: 'networking', target: 'security' },
    { source: 'recursion', target: 'complexity' },
  ],
  engineering: [
    { source: 'forces_struct', target: 'materials' },
    { source: 'forces_struct', target: 'design' },
    { source: 'materials', target: 'optimization' },
    { source: 'thermo_eng', target: 'circuits' },
    { source: 'design', target: 'optimization' },
  ],
};

export function getInitialGraph(subject: string): KnowledgeGraphState {
  const nodes = SUBJECT_NODES[subject] || SUBJECT_NODES.physics;
  const links = SUBJECT_LINKS[subject] || SUBJECT_LINKS.physics;
  return { nodes: nodes.map((n) => ({ ...n })), links: [...links] };
}

const KEYWORD_TRIGGERS: Record<string, Record<string, string[]>> = {
  physics: {
    free_fall: ['fall', 'gravity', 'dropping', 'dropped', 'drop'],
    force: ['force', 'push', 'pull', 'acceleration'],
    friction: ['friction', 'rough', 'resistance', 'drag'],
    inertia: ['inertia', 'rest', 'constant speed', 'keep going'],
    momentum: ['momentum', 'collision', 'impact'],
    gravity: ['gravity', 'gravitational', 'weight', 'pull down'],
    energy: ['energy', 'kinetic', 'potential', 'conservation'],
    projectile: ['projectile', 'parabola', 'trajectory', 'arc'],
    terminal_v: ['terminal velocity', 'top speed', 'max speed'],
    waves: ['wave', 'frequency', 'wavelength', 'oscillation'],
  },
  mathematics: {
    sequences: ['sequence', 'series', 'term', 'arithmetic', 'geometric'],
    limits: ['limit', 'approach', 'bound', 'infinity'],
    derivatives: ['derivative', 'slope', 'rate of change', 'tangent', 'differentiate'],
    integrals: ['integral', 'area under', 'accumulate', 'integrate'],
    patterns: ['pattern', 'fibonacci', 'golden ratio'],
    proofs: ['proof', 'prove', 'theorem', 'induction', 'contradiction'],
    infinity: ['infinity', 'infinite', 'unbound'],
    functions: ['function', 'input', 'output', 'mapping'],
  },
  chemistry: {
    states: ['solid', 'liquid', 'gas', 'plasma', 'boil', 'freeze', 'melt', 'molecule'],
    bonds: ['bond', 'covalent', 'ionic', 'metallic', 'share electron', 'transfer electron'],
    reactions: ['reaction', 'reactant', 'product', 'equation', 'balance', 'exothermic', 'endothermic'],
    equilibrium: ['equilibrium', 'balance', 'reverse', 'forward', 'rate', 'dynamic'],
    electrons: ['electron', 'configuration', 'orbital', 'shell', 'subshell'],
    molarity: ['molarity', 'mole', 'concentration', 'solute', 'solvent', 'dilute'],
    thermo: ['entropy', 'enthalpy', 'gibbs', 'free energy', 'heat', 'thermodynamics'],
  },
  biology: {
    cells: ['cell', 'prokaryote', 'eukaryote', 'membrane', 'organelle', 'mitochondria'],
    dna: ['dna', 'rna', 'gene', 'double helix', 'base pair', 'transcription', 'translation'],
    evolution: ['evolution', 'natural selection', 'adaptation', 'mutation', 'species'],
    ecology: ['ecology', 'food chain', 'ecosystem', 'producer', 'consumer', 'decomposer'],
    genetics: ['genetics', 'inherit', 'chromosome', 'allele', 'dominant', 'recessive'],
    photosynthesis: ['photosynthesis', 'chloroplast', 'sunlight', 'glucose', 'oxygen'],
    homeostasis: ['homeostasis', 'feedback loop', 'body temp', 'regulation', 'stable'],
  },
  'computer-science': {
    algorithms: ['algorithm', 'procedure', 'sort', 'search', 'binary search'],
    data_structures: ['structure', 'array', 'list', 'hash', 'tree', 'stack', 'queue'],
    networking: ['network', 'protocol', 'tcp', 'ip', 'internet', 'http', 'server', 'client'],
    recursion: ['recursion', 'recursive', 'call itself', 'base case', 'stack overflow'],
    complexity: ['complexity', 'big o', 'time', 'space', 'scale', 'grow'],
    databases: ['database', 'sql', 'query', 'table', 'nosql', 'index'],
    security: ['security', 'encrypt', 'decrypt', 'hash', 'auth', 'zero-trust'],
  },
  engineering: {
    forces_struct: ['force', 'tension', 'compression', 'shear', 'truss', 'bridge', 'build'],
    materials: ['material', 'steel', 'concrete', 'strength', 'weight', 'alloy'],
    thermo_eng: ['thermodynamic', 'engine', 'heat', 'work', 'efficiency', 'carnot'],
    circuits: ['circuit', 'voltage', 'current', 'resistance', 'ohm', 'series', 'parallel'],
    design: ['design', 'prototype', 'iterate', 'test', 'constraint'],
    optimization: ['optimize', 'linear programming', 'trade-off', 'best solution'],
  },
};

export function updateNodeFromMessage(
  nodes: KGNode[],
  message: string,
  subject: string
): KGNode[] {
  const lower = message.toLowerCase();
  const triggers = KEYWORD_TRIGGERS[subject] || KEYWORD_TRIGGERS.physics;

  return nodes.map((node) => {
    if (node.status !== 'undiscovered') return node;
    const keywords = triggers[node.id];
    if (keywords && keywords.some((k) => lower.includes(k))) {
      return { ...node, status: 'discovered' as const };
    }
    return node;
  });
}

export function masterNode(nodes: KGNode[], nodeId: string): KGNode[] {
  return nodes.map((node) =>
    node.id === nodeId ? { ...node, status: 'mastered' as const } : node
  );
}

export function extractMasteredConcept(text: string): string | null {
  const match = text.match(/\[MASTERED:\s*(\w+)\]/);
  return match ? match[1] : null;
}
