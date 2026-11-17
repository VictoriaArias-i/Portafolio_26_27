export const MUSICA_FONDO = {
  ruta: '/musica/GoAway.mp3',
  volumen: 0.45
};

let audioCtx = null;

function obtenerContexto() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function sonarPop(silenciado = false) {
  if (silenciado) return;
  try {
    const ctx = obtenerContexto();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {}
}

export function sonarVentana(abrir = true, silenciado = false) {
  if (silenciado) return;
  try {
    const ctx = obtenerContexto();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const inicio = abrir ? 330 : 490;
    const fin = abrir ? 550 : 280;
    osc.frequency.setValueAtTime(inicio, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(fin, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

export function sonarOrdenar(silenciado = false) {
  if (silenciado) return;
  [440, 554, 659].forEach((nota, i) => {
    setTimeout(() => {
      try {
        const ctx = obtenerContexto();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(nota, ctx.currentTime);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch {}
    }, i * 55);
  });
}