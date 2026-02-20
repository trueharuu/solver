async function main() {
  // initialize theme based on system preference or saved setting
  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButton(theme);
  };

  const updateThemeButton = (theme) => {
    const button = document.getElementById("displaymode");
    if (button) {
      button.textContent = theme === "dark" ? "light mode?" : "dark mode?";
    }
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeButton(newTheme);
  };

  initTheme();

  // add click handler for theme toggle
  const themeButton = document.getElementById("displaymode");
  if (themeButton) {
    themeButton.addEventListener("click", toggleTheme);
  }

  // load saved saves
  const saved_saves = localStorage.getItem("saves");
  if (saved_saves) {
    saved_saves.split("").forEach((save) => {
      const save_to_select = document.getElementById(`save-picker-${save}`);
      if (save_to_select) {
        save_to_select.classList.remove("off");
        save_to_select.classList.add("on");
      }
    });
  }

  const board = document.getElementById("board");
  // load saved pc selection
  const saved_pc = localStorage.getItem("selected_pc");
  if (saved_pc) {
    const pc_to_select = document.getElementById(saved_pc);
    if (pc_to_select) {
      pc_to_select.classList.remove("off");
      pc_to_select.classList.add("on");
    }
  }

  // load saved physics selection
  const saved_physics = localStorage.getItem("selected_physics");
  if (saved_physics) {
    const physics_to_select = document.getElementById(
      `physics-${saved_physics.toLowerCase()}`,
    );
    if (physics_to_select) {
      physics_to_select.classList.remove("off");
      physics_to_select.classList.add("on");
    }
  }

  // load saved hold setting
  const saved_hold = localStorage.getItem("hold_enabled");
  if (saved_hold === "true") {
    const hold_button = document.getElementById("hold-toggle");
    if (hold_button) {
      hold_button.classList.remove("off");
      hold_button.classList.add("on");
    }
  }

  let isMouseDown = false;
  let paintMode = null; // 'on' or 'off'

  // fill `board` with a 10x4 table
  {
    const table = document.createElement("div");
    table.classList.add("board-table");
    for (let i = 0; i < 4; i++) {
      const row = document.createElement("div");
      row.classList.add("board-row");
      for (let j = 0; j < 10; j++) {
        const cell = document.createElement("button");
        cell.id = `cell-${i}-${j}`;
        cell.classList.add("board-cell", "off");
        cell.onmousedown = (e) => {
          e.preventDefault();
          isMouseDown = true;
          toggle_cell(i, j);
          paintMode = document
            .getElementById(`cell-${i}-${j}`)
            .classList.contains("on")
            ? "on"
            : "off";
        };
        cell.onmouseenter = () => {
          if (isMouseDown) {
            set_cell(i, j, paintMode);
          }
        };
        cell.onclick = (e) => {
          e.preventDefault();
        };
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    board.appendChild(table);

    if (localStorage.getItem("board")) {
      const garbage = BigInt(localStorage.getItem("board"));
      const decoded = decode(garbage);
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 10; j++) {
          set_cell(i, j, decoded[i][j] === "1" ? "on" : "off");
        }
      }
    }

    const input = document.createElement("input");
    input.id = "queue";
    input.disabled = true;
    input.addEventListener("input", (e) => {
      const cursorPos = input.selectionStart;
      const value = input.value;
      const filtered = value.toUpperCase().replace(/[^TIJLOSZ]/g, "");
      if (value !== filtered) {
        const beforeFiltered = value
          .substring(0, cursorPos)
          .toUpperCase()
          .replace(/[^TIJLOSZ]/g, "");
        input.value = filtered;
        input.setSelectionRange(beforeFiltered.length, beforeFiltered.length);
      }
    });
    board.appendChild(input);
  }

  document.addEventListener("mouseup", () => {
    isMouseDown = false;
    paintMode = null;
  });

  // enable save toggling
  {
    const saves = document.querySelectorAll(".save");
    saves.forEach((save) => {
      save.classList.add("off");
      save.onclick = () => {
        if (save.classList.contains("disabled")) return;
        save.classList.toggle("off");
        save.classList.toggle("on");
        localStorage.setItem(
          "saves",
          [...document.querySelectorAll(".save.on")]
            .map((el) => el.id.split("-")[2])
            .join(","),
        );
        submit();
      };
    });

    const disable_all = document.getElementById("save-picker-header");
    disable_all.onclick = () => {
      saves.forEach((save) => {
        save.classList.add("off");
        save.classList.remove("on");
      });

      localStorage.setItem(
        "saves",
        [...document.querySelectorAll(".save.on")]
          .map((el) => el.id.split("-")[2])
          .join(","),
      );
      submit();
    };
  }

  // enable pc toggling
  {
    const pcs = document.querySelectorAll(".pc");

    pcs.forEach((pc) => {
      pc.classList.add("off");
      pc.onclick = () => {
        if (pc.classList.contains("disabled")) return;

        pcs.forEach((otherPc) => {
          if (otherPc !== pc) {
            otherPc.classList.add("off");
            otherPc.classList.remove("on");
          }
        });
        pc.classList.toggle("off");
        pc.classList.toggle("on");
        submit();
        localStorage.setItem(
          "selected_pc",
          pc.classList.contains("on") ? pc.id : undefined,
        );
      };
    });

    const disable_all = document.getElementById("pc-picker-header");
    disable_all.onclick = () => {
      pcs.forEach((pc) => {
        pc.classList.add("off");
        pc.classList.remove("on");
      });
      submit();
      localStorage.setItem("selected_pc", undefined);
    };
  }

  // enable physics toggling
  {
    const physicsButtons = document.querySelectorAll(".physics");

    physicsButtons.forEach((button) => {
      button.onclick = () => {
        // Toggle off all other physics buttons
        physicsButtons.forEach((otherButton) => {
          if (otherButton !== button) {
            otherButton.classList.add("off");
            otherButton.classList.remove("on");
          }
        });
        button.classList.toggle("off");
        button.classList.toggle("on");

        localStorage.setItem(
          "selected_physics",
          button.classList.contains("on") ? button.id : undefined,
        );

        submit();
      };
    });

    const holdButton = document.getElementById("physics-hold");
    if (holdButton) {
      holdButton.onclick = () => {
        holdButton.classList.toggle("off");
        holdButton.classList.toggle("on");

        localStorage.setItem(
          "hold_enabled",
          holdButton.classList.contains("on") ? "true" : "false",
        );
        submit();
      };
    }
  }

  await load();
}

function toggle_cell(i, j) {
  const element = document.getElementById(`cell-${i}-${j}`);
  element.classList.toggle("off");
  element.classList.toggle("on");
  localStorage.setItem("board", encode());
}

function set_cell(i, j, state) {
  const element = document.getElementById(`cell-${i}-${j}`);
  element.classList.remove("off", "on");
  element.classList.add(state);
  localStorage.setItem("board", encode());
}

function reset() {
  const cells = document.querySelectorAll(".board-cell");
  cells.forEach((cell) => {
    cell.classList.remove("on");
    cell.classList.add("off");
  });
  localStorage.setItem("board", encode());
  const saves = document.querySelectorAll(".save");
  saves.forEach((save) => {
    save.classList.remove("on");
    save.classList.add("off");
  });

  const pcs = document.querySelectorAll(".pc");
  pcs.forEach((pc) => {
    pc.classList.remove("on");
    pc.classList.add("off");
  });

  const queue = document.getElementById("queue");
  queue.value = "";

  localStorage.setItem("saves", "");
  localStorage.setItem("selected_pc", undefined);

  const output = document.getElementById("output");
  output.innerHTML = "";
  
}

function mirror() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 5; j++) {
      const leftCell = document.getElementById(`cell-${i}-${j}`);
      const rightCell = document.getElementById(`cell-${i}-${9 - j}`);

      const leftIsOn = leftCell.classList.contains("on");
      const rightIsOn = rightCell.classList.contains("on");

      // Swap the states
      leftCell.classList.remove("on", "off");
      rightCell.classList.remove("on", "off");

      leftCell.classList.add(rightIsOn ? "on" : "off");
      rightCell.classList.add(leftIsOn ? "on" : "off");
    }
  }

  localStorage.setItem("board", encode());
}

function encode() {
  let garbage = 0n;
  for (let i = 3; i >= 0; i--) {
    for (let j = 0; j < 10; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      if (cell && cell.classList.contains("on")) {
        const index = (3 - i) * 10 + j;
        garbage |= 1n << BigInt(index);
      }
    }
  }
  return garbage;
}

function decode(garbage) {
  let board = [];
  for (let i = 0; i < 4; i++) {
    let row = [];
    for (let j = 0; j < 10; j++) {
      const index = (3 - i) * 10 + j;
      row.push((garbage & (1n << BigInt(index))) !== 0n ? "1" : "0");
    }
    board.push(row);
  }
  return board;
}

let stored = new Map();
function submit() {
  const q = document.getElementById("queue");
  if (q.value === "") {
    return;
  }

  // if the amount of bits on the board is not %4=0 then do nothing

  // Get board state as 64-bit value
  let garbage = encode();

  let count_ones = 0n;
  for (let i = 0n; i < 40n; i++) {
    if ((garbage & (1n << i)) !== 0n) {
      count_ones++;
    }
  }

  if (count_ones % 4n !== 0n) {
    return;
  }

  // Check if we need to append an extra piece
  let queue_value = q.value;
  const mino_count = Number(count_ones);
  const pc_elements = document.querySelectorAll(".pc.on");

  if (pc_elements.length > 0) {
    const pc_num = Number(pc_elements[0].id.split("-")[2]);

    // Edge case: 2nd PC with 12 minos and 7-piece queue
    if (pc_num === 2 && mino_count === 12 && queue_value.length === 7) {
      const last_six = queue_value.slice(-6);
      const reference = "TIJLOSZ";
      const missing = reference
        .split("")
        .find((letter) => !last_six.includes(letter));
      if (missing) {
        queue_value = queue_value + missing;
      }
    }
    // Edge case: 7th PC with 8 minos and 7-piece queue
    else if (pc_num === 7 && mino_count === 8 && queue_value.length === 7) {
      const last_six = queue_value.slice(-6);
      const reference = "TIJLOSZ";
      const missing = reference
        .split("")
        .find((letter) => !last_six.includes(letter));
      if (missing) {
        queue_value = queue_value + missing;
      }
    }
  }

  document.getElementById("queue").value = queue_value;

  // Get physics setting from UI
  let physics = "SRS"; // default
  const physicsButtons = document.querySelectorAll(".physics.on");
  if (physicsButtons.length > 0) {
    const physicsId = physicsButtons[0].id;
    if (physicsId === "physics-srs") {
      physics = "SRS";
    } else if (physicsId === "physics-jstris") {
      physics = "Jstris";
    } else if (physicsId === "physics-tetrio") {
      physics = "TETRIO";
    }
  }

  // Get hold setting from UI
  const holdButton = document.getElementById("physics-hold");
  let canHold = holdButton ? holdButton.classList.contains("on") : true;

  const key =
    q.value +
    "|" +
    garbage.toString() +
    "|" +
    physics +
    "|" +
    canHold.toString();

  if (stored.has(key)) {
    handleSolutions(stored.get(key));
    return;
  }

  // Send solve request to worker
  worker.postMessage({
    type: "solve",
    queue: queue_value,
    garbage: garbage.toString(),
    hold: canHold,
    physics: physics,
  });

  console.log("Solve request sent:", {
    queue: queue_value,
    garbage: garbage.toString(),
    hold: canHold,
    physics,
  });
}

function handleSolutions(solutions) {
  const output = document.getElementById("output");
  output.innerHTML = ""; // Clear previous solutions

  for (let solution of solutions) {
    solution = solution.split("|")[0]?.trim() || "";
    console.log(solution);
    const solutionElement = sol(solution);

    output.appendChild(solutionElement);
  }
}

function sol(s) {
  const el = document.createElement("table");
  el.classList.add("solution");
  const save = get_save_of(s);
  const piece = saved_piece(s);
  if (save) {
    const save_header = document.createElement("tr");
    const save_el = document.createElement("td");
    save_el.textContent = `${save}`;
    save_el.classList.add(`c${piece}`, "save-c");
    el.classList.add(`s${piece}`, "s");
    save_header.appendChild(save_el);
    el.appendChild(save_header);
  }

  const active_saves = [...document.querySelectorAll(".save.on")].map(
    (el) => el.id.split("-")[2],
  );
  console.log("Active saves:", active_saves, piece);
  if (save && active_saves.length > 0 && !active_saves.includes(piece)) {
    el.classList.add("hidden");
  }

  const sol_header = document.createElement("tr");
  const table = document.createElement("table");
  table.classList.add("sol-table");
  table.setAttribute("cellspacing", "0");
  const rows = s.match(/.{10}/g);
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.classList.add("sol-row");
    for (const cell of row) {
      const td = document.createElement("td");
      td.classList.add(`c${cell}`, "sol-cell");
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  sol_header.appendChild(table);
  el.appendChild(sol_header);
  return el;
}

let writable = true;
document.onkeydown = (e) => {
  if (e.key === "Enter") {
    submit();
    document.getElementById("fn_submit").style.color = `var(--text)`;
  }

  if (document.activeElement.id === "queue") {
    if (!writable) {
      e.preventDefault();
    }

    writable = true;
    return;
  }
  if (e.key === "r" || e.key === "R") {
    if (e.ctrlKey) {
      return;
    }
    reset();
    document.getElementById("fn_clear").style.color = `var(--text)`;
  }

  if (e.key === "m" || e.key === "M") {
    mirror();
    document.getElementById("fn_mirror").style.color = `var(--text)`;
  }

  if (e.key === "t" || e.key === "T") {
    e.preventDefault();
    writable = false;
    document.getElementById("queue").focus();
  }
};

document.onkeyup = (e) => {
  if (e.key === "Enter") {
    document.getElementById("fn_submit").style.color = `var(--overlay0)`;
  }

  if (document.activeElement.id === "queue") {
    if (!writable) {
      e.preventDefault();
    }

    writable = true;
    return;
  }
  if (e.key === "r" || e.key === "R") {
    if (e.ctrlKey) {
      return;
    }
    document.getElementById("fn_clear").style.color = `var(--overlay0)`;
  }

  if (e.key === "m" || e.key === "M") {
    document.getElementById("fn_mirror").style.color = `var(--overlay0)`;
  }
};

function validate(s) {
  if (/[^TIJLOSZ]/g.test(s)) {
    return false;
  }
  return true;
}

let legal_boards;
let worker;
function ready() {
  const q = document.getElementById("queue");
  q.disabled = false;
  q.placeholder = "";
}
async function load() {
  const q = document.getElementById("queue");
  q.placeholder = "loading";
  worker = new Worker("./worker.js");
  worker.onmessage = (e) => {
    if (e.data.type === "ready") {
      ready();
    } else if (e.data.type === "solutions") {
      const garbage = encode();
      let physics = "SRS"; // default
      const physicsButtons = document.querySelectorAll(".physics.on");
      if (physicsButtons.length > 0) {
        const physicsId = physicsButtons[0].id;
        if (physicsId === "physics-srs") {
          physics = "SRS";
        } else if (physicsId === "physics-jstris") {
          physics = "Jstris";
        } else if (physicsId === "physics-tetrio") {
          physics = "TETRIO";
        }
      }

      const holdButton = document.getElementById("physics-hold");
      let canHold = holdButton ? holdButton.classList.contains("on") : true;
      const key =
        q.value +
        "|" +
        garbage.toString() +
        "|" +
        physics +
        "|" +
        canHold.toString();

      stored.set(key, e.data.solutions);

      handleSolutions(e.data.solutions);
    }
  };
}

main();
