

const CONFIG = {
FLEE_RADIUS: 110,
  MAX_ESCAPES: 4,
  PUSH_MULTIPLIER: 1.8,
  PUSH_MIN: 30,
  PUSH_MAX: 160,
  COUNT_THRESHOLD: 0.5,
  TAUNTS: [
    "Too slow!",
    "Catch me!",
    "Hehe 😜",
    "Nope!",
    "Almost...",
    "Nuh-uh!",
    "Nice try 😏",
    "Zoom!",
  ],

  BELL_WIDTH: 100,
  BELL_HEIGHT: 130,
};


let escapes      = 0;      
let surrendered  = false;  
let tauntTimeout = null;   

let pos = { x: 70, y: 100 };

const area    = document.getElementById('bell-area');   
const wrapper = document.getElementById('bell-wrapper'); 
const taunt   = document.getElementById('taunt');        // speech bubble above the bell
const status  = document.getElementById('status');       // hint text at the bottom
const panel   = document.getElementById('panel');        // the notifications panel
const closeBtn= document.getElementById('close-btn');    // button inside the panel
const badge = document.getElementById('badge');


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function randomTaunt() {
  const i = Math.floor(Math.random() * CONFIG.TAUNTS.length);
  return CONFIG.TAUNTS[i];
}


function placeBellAtCenter() {
  const areaWidth  = area.offsetWidth;
  const areaHeight = area.offsetHeight;

  
  pos.x = (areaWidth  - CONFIG.BELL_WIDTH)  / 2;
  pos.y = (areaHeight - CONFIG.BELL_HEIGHT) / 2;

  wrapper.style.left = pos.x + 'px';
  wrapper.style.top  = pos.y + 'px';
}



function wiggleBell() {
  wrapper.classList.remove('bell-wiggle');
  void wrapper.offsetHeight;
  wrapper.classList.add('bell-wiggle');
}


function showTaunt(message) {
  taunt.textContent = message;
  taunt.style.animation = 'none';
  void taunt.offsetHeight; 
  taunt.style.animation = 'taunt-pop 1.4s ease forwards';

  clearTimeout(tauntTimeout);
  tauntTimeout = setTimeout(() => {
    taunt.style.opacity = '0';
  }, 1400);
}

function setCheekyFace(on) {
  const mouthNormal = document.getElementById('mouth-normal');
  const mouthCheeky = document.getElementById('mouth-cheeky');
  if (mouthNormal) mouthNormal.setAttribute('opacity', on ? '0' : '1');
  if (mouthCheeky) mouthCheeky.setAttribute('opacity', on ? '1' : '0');
}




function flee(cursorX, cursorY) {
  if (surrendered) return; 

  const areaRect = area.getBoundingClientRect();

  // Cursor position relative to the top-left of bell-area
  const cursorRelX = cursorX - areaRect.left;
  const cursorRelY = cursorY - areaRect.top;

  // Current center of the bell (relative to bell-area)
  const bellCenterX = pos.x + CONFIG.BELL_WIDTH  / 2;
  const bellCenterY = pos.y + CONFIG.BELL_HEIGHT / 2;

  // Vector from cursor to bell center
  const dx = bellCenterX - cursorRelX;
  const dy = bellCenterY - cursorRelY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist >= CONFIG.FLEE_RADIUS) return;


  const angle = Math.atan2(dy, dx); 

  const pushStrength = clamp(
    (CONFIG.FLEE_RADIUS - dist) * CONFIG.PUSH_MULTIPLIER,
    CONFIG.PUSH_MIN,
    CONFIG.PUSH_MAX
  );

  let newX = pos.x + Math.cos(angle) * pushStrength;
  let newY = pos.y + Math.sin(angle) * pushStrength;

  const areaWidth  = area.offsetWidth;
  const areaHeight = area.offsetHeight;
  newX = clamp(newX, 0, areaWidth  - CONFIG.BELL_WIDTH);
  newY = clamp(newY, 0, areaHeight - CONFIG.BELL_HEIGHT);

 
  if (newX === pos.x && newY === pos.y) return;

  pos.x = newX;
  pos.y = newY;
  wrapper.style.left = pos.x + 'px';
  wrapper.style.top  = pos.y + 'px';


  if (dist < CONFIG.FLEE_RADIUS * CONFIG.COUNT_THRESHOLD) {
    escapes++;
    wiggleBell();
    showTaunt(randomTaunt());
    setCheekyFace(true);
    setTimeout(() => setCheekyFace(false), 600);

    if (escapes >= CONFIG.MAX_ESCAPES) {
     
      surrender();
    } else {
      
      const remaining = CONFIG.MAX_ESCAPES - escapes;
      if (escapes === 1) {
        status.textContent = "Oh it's getting cheeky! " + remaining + " more tries...";
      } else if (remaining === 1) {
        status.textContent = "So close! One more try...";
      } else {
        status.textContent = remaining + " more tries left...";
      }
    }
  }
}



function surrender() {
  surrendered = true;
   setCheekyFace(true);
   taunt.style.opacity = '0';
  setCheekyFace(false);

  
  wrapper.style.transition = 'left 0.55s ease, top 0.55s ease';

  
  const areaWidth  = area.offsetWidth;
  const areaHeight = area.offsetHeight;
  pos.x = (areaWidth  - CONFIG.BELL_WIDTH)  / 2;
  pos.y = (areaHeight - CONFIG.BELL_HEIGHT) / 2;
  wrapper.style.left = pos.x + 'px';
  wrapper.style.top  = pos.y + 'px';

  status.textContent = "Fine, fine... you can click me now.";

  setTimeout(() => {
    wrapper.style.transition = 'left 0.25s cubic-bezier(.22,.68,0,1.4), top 0.25s cubic-bezier(.22,.68,0,1.4)';
  }, 600);
  badge.textContent = '3';   // or whatever count you want
  badge.classList.add('visible');
}



function openPanel() {
   
  if (!surrendered) return; 
  panel.classList.add('show');
  status.textContent = '';
}

function closePanel() {
  panel.classList.remove('show');

  // Full reset
  surrendered = false;
  escapes     = 0;

  // Restore normal transition speed
  wrapper.style.transition = 'left 0.25s cubic-bezier(.22,.68,0,1.4), top 0.25s cubic-bezier(.22,.68,0,1.4)';

  placeBellAtCenter();
  status.textContent = 'Move your cursor toward the bell...';
    badge.classList.remove('visible');
}

area.addEventListener('mousemove', function(event) {
  flee(event.clientX, event.clientY);
});


wrapper.addEventListener('click', openPanel);

closeBtn.addEventListener('click', closePanel);

  placeBellAtCenter();
