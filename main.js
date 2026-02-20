async function main() {
  const save_picker = document.getElementById("save-picker");
  const board = document.getElementById("board");
  const pc_picker = document.getElementById("pc-picker");

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
      };
    });

    const disable_all = document.getElementById("save-picker-header");
    disable_all.onclick = () => {
      saves.forEach((save) => {
        save.classList.add("off");
        save.classList.remove("on");
      });
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
      };
    });

    const disable_all = document.getElementById("pc-picker-header");
    disable_all.onclick = () => {
      pcs.forEach((pc) => {
        pc.classList.add("off");
        pc.classList.remove("on");
      });
    };
  }

  await load();
}

function toggle_cell(i, j) {
  const element = document.getElementById(`cell-${i}-${j}`);
  element.classList.toggle("off");
  element.classList.toggle("on");
}

function set_cell(i, j, state) {
  const element = document.getElementById(`cell-${i}-${j}`);
  element.classList.remove("off", "on");
  element.classList.add(state);
}

function reset() {
  const cells = document.querySelectorAll(".board-cell");
  cells.forEach((cell) => {
    cell.classList.remove("on");
    cell.classList.add("off");
  });

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
}

function submit() {
  const q = document.getElementById("queue");
  if (q.value === "") {
    return;
  }
}

let writable = true;
document.onkeydown = (e) => {
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

  if (e.key === "Enter") {
    submit();
    document.getElementById("fn_submit").style.color = `var(--text)`;
  }

  if (e.key === "t" || e.key === "T") {
    e.preventDefault();
    writable = false;
    document.getElementById("queue").focus();
  }
};

document.onkeyup = (e) => {
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

  if (e.key === "Enter") {
    document.getElementById("fn_submit").style.color = `var(--overlay0)`;
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
    }
  };
}

main();
