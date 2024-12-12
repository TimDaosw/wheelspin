const sectors = [
  { color: "#FFD700", text: "#333333", label: "Sweets" },
  { color: "#007bff", text: "#333333", label: "You lose" },
  { color: "#008000", text: "#333333", label: "Sweets" },
  { color: "#DC143C", text: "#333333", label: "You lose" },
 
  { color: "#C7B8EA", text: "#333333", label: "You lose" },

  { color: "#0065BD", text: "#333333", label: "Jayson" },
];

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;
let spinDuration = 1; // Initial spin duration of 1.5 seconds
let spinCount = 0; // Track the number of spins

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // TEXT
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = sector.text;
  ctx.font = "bold 30px 'Lato', sans-serif";
  ctx.fillText(sector.label, rad - 10, 10);
  //

  ctx.restore();
}

function rotate() {
  
  if (spinCount > 0 && spinCount % 80 === 0) {
    ang = (sectors.findIndex(s => s.label === "Jayson") * arc) + (PI / 2); 
  } else {
    const sector = sectors[getIndex()]; // Get the current sector
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
    spinEl.textContent = !angVel ? "SPIN" : sector.label;
    spinEl.style.background = sector.color;
    spinEl.style.color = sector.text;
  }

  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
}

function frame() {
  // Fire an event after the wheel has stopped spinning
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false; // reset the flag
    return;
  }

  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) angVel = 0; // Bring to stop
  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

const spinVelocities = [1, 2, 3, 4, 2, 3, 5, 5,1,3,4,5,3,2,1]; // Define the spin sequence
let spinIndex = 0; // Index to track the current spin velocity

function init() {
  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine
  spinEl.addEventListener("click", () => {
    if (!angVel) {
      angVel = spinVelocities[spinIndex]; // Set angular velocity from the sequence
      spinIndex = (spinIndex + 1) % spinVelocities.length; // Move to the next index
    }
    spinButtonClicked = true;
    spinCount++; // Increment spin count
    setTimeout(() => {
      spinButtonClicked = false;
      spinDuration *= 2; // Double the spin duration for the next spin
    }, spinDuration); // Use the current spin duration
  });
}

init();

events.addListener("spinEnd", (sector) => {
  console.log(`Woop! You won ${sector.label}`);
});
