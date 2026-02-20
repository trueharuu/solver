importScripts("./gomen.js");
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
}

main();
