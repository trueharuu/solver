importScripts("./gomen.js");

function progress(piece_count, stage, board_idx, board_total) {
}

async function main() {
  const response = await fetch("./legal-boards.leb128");

  if (response.ok) {
    legal_boards = new Uint8Array(await response.arrayBuffer());
  } else {
    console.log("couldn't load legal boards");
  }

  await wasm_bindgen("./gomen_bg.wasm");
  const solver = new wasm_bindgen.Solver(legal_boards);

  postMessage({ type: 'ready' });

  // Set up message handler for solve requests
  onmessage = (message) => {
    const data = message.data;
    
    if (data.type === 'solve') {
      const queue = new wasm_bindgen.Queue();
      for (const piece of data.queue) {
        queue.add_shape(piece);
      }

      
      const garbage = BigInt(data.garbage);
      const solutions = solver.solve(queue, garbage, data.hold, data.physics);
      const solutionArray = solutions === "" ? [] : solutions.split(",");
      
      postMessage({ 
        type: 'solutions', 
        solutions: solutionArray 
      });
    }
  };
}

main();

