const remaining_pieces = [4, 1, 5, 2, 6, 3, 7];
const pieces_used = [3, 6, 2, 5, 1, 4, 0];
const pieces = ["T", "I", "J", "L", "O", "S", "Z"];
function get_save_of(sol) {
  const queue = document.getElementById("queue").value;
  const queue_pieces = pieces.map((piece) => {
    return queue.split(piece).length - 1;
  });

  if (document.querySelectorAll(".pc.on").length === 0 && saved_piece(sol) !== undefined) {
    return "Save " + saved_piece(sol);
  }

  const pc_num = Number(
    document.querySelectorAll(".pc.on")[0].id.split("-")[2],
  );

  const sol_pieces = pieces.map((piece) => {
    return (sol.split(piece).length - 1) / 4;
  });

  let different_index = -1;
  for (let i = 0; i < queue_pieces.length; i++) {
    if (queue_pieces[i] !== sol_pieces[i]) {
      different_index = i;
    }
  }

  const bag = new Set(["T", "I", "J", "L", "O", "S", "Z"]);
  const current_pc_num = pc_num - 1;

  let save;
  let nth = "";
  if (different_index !== -1) {
    for (let j = 1; j < pieces_used[current_pc_num] + 2; j++) {
      bag.delete(queue[queue.length - j]);
    }

    save = Array.from(bag).join("");

    save += pieces[different_index];

    save = sort(save);
  } else {
    for (let j = 1; j < pieces_used[current_pc_num] + 1; j++) {
      bag.delete(queue[queue.length - j]);
    }

    save = Array.from(bag).join("");
  }

  if (pc_num === 1) {
    nth = "2nd";
  }

  if (pc_num === 2) {
    if (queue.length === 6) {
      const reference = "TIJLOSZ";
      const missing = reference
        .split("")
        .filter((letter) => !queue.includes(letter));
      if (missing.length === 1) {
        save = missing[0];
      }
    } else {
      save = pieces[different_index];
    }
    nth = "3rd";
  }

  if (pc_num === 3) {
    const reference = "TIJLOSZ";

    const missing = reference
      .split("")
      .filter((letter) => !save.includes(letter));
    let dupe = "";
    if (save.includes("TT")) {
      dupe = "T";
    } else if (save.includes("II")) {
      dupe = "I";
    } else if (save.includes("JJ")) {
      dupe = "J";
    } else if (save.includes("LL")) {
      dupe = "L";
    } else if (save.includes("OO")) {
      dupe = "O";
    } else if (save.includes("SS")) {
      dupe = "S";
    } else if (save.includes("ZZ")) {
      dupe = "Z";
    }

    if (missing.length > 0 && dupe === "") {
      save = `no ${missing.join("")}`;
    } else {
      save = `${dupe}>${missing.join("")}`;
    }

    nth = "4th";
  }
  if (pc_num === 4) {
    nth = "5th";
  }

  if (pc_num === 5) {
    const reference = "TIJLOSZ";

    const missing = reference
      .split("")
      .filter((letter) => !save.includes(letter));
    let dupe = "";
    if (save.includes("TT")) {
      dupe = "T";
    } else if (save.includes("II")) {
      dupe = "I";
    } else if (save.includes("JJ")) {
      dupe = "J";
    } else if (save.includes("LL")) {
      dupe = "L";
    } else if (save.includes("OO")) {
      dupe = "O";
    } else if (save.includes("SS")) {
      dupe = "S";
    } else if (save.includes("ZZ")) {
      dupe = "Z";
    }

    if (missing.length > 0 && dupe === "") {
      save = `no ${missing.join("")}`;
    } else {
      save = `${dupe}>${missing.join("")}`;
    }

    nth = "6th";
  }

  if (pc_num === 6) {
    nth = "7th";
  }

  if (pc_num === 7) {
    const reference = "TIJLOSZ";

    const missing = reference
      .split("")
      .filter((letter) => !save.includes(letter));
    let dupe = "";
    if (save.includes("TT")) {
      dupe = "T";
    } else if (save.includes("II")) {
      dupe = "I";
    } else if (save.includes("JJ")) {
      dupe = "J";
    } else if (save.includes("LL")) {
      dupe = "L";
    } else if (save.includes("OO")) {
      dupe = "O";
    } else if (save.includes("SS")) {
      dupe = "S";
    } else if (save.includes("ZZ")) {
      dupe = "Z";
    }

    if (missing.length === 0) {
      save = "";
      nth = "1st";
    } else {
      save = `${dupe}>${missing.join("")}`;
      nth = "8th";
    }
  }

  return (save + " " + nth).trim();
}

function saved_piece(sol) {
  const queue = document.getElementById("queue").value;
  const queue_pieces = pieces.map((piece) => {
    return queue.split(piece).length - 1;
  });

  const sol_pieces = pieces.map((piece) => {
    return (sol.split(piece).length - 1) / 4;
  });

  const used = queue_pieces.map((count, index) => count - sol_pieces[index]);
  let different_index = -1;
  for (let i = 0; i < used.length; i++) {
    if (used[i] !== 0) {
      different_index = i;
    }
  }

  return pieces[different_index];
  // console.log(used);
  // return 'T';
}

function sort(t) {
  const order = "TIJLOSZ";
  const freq = {};
  for (const char of t) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return order
    .split("")
    .sort((a, b) => {
      if ((freq[b] || 0) === (freq[a] || 0)) {
        return order.indexOf(a) - order.indexOf(b);
      }
      return (freq[b] || 0) - (freq[a] || 0);
    })
    .map((char) => char.repeat(freq[char] || 0))
    .join("");
}
