import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { DIBUJOS, PESTANAS_PATRON, BOTONES_UI } from './utils/data/contenido';
import { MUSICA_FONDO, sonarPop, sonarOrdenar } from './utils/data/sonidos';
import './App.css';

function CapaFullCanvas({ dibujo, zIndex, activa, enArrastre, onFrente, onDragState, onRegistrarMapa }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [centro, setCentro] = useState('50% 50%');

  useEffect(() => {
    const img = new Image();
    img.src = dibujo.archivo;
    img.onload = () => {
      const w = 384;
      const h = 216;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;

      let minX = w, minY = h, maxX = 0, maxY = 0, encontrado = false;
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          if (data[(py * w + px) * 4 + 3] > 20) {
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
            encontrado = true;
          }
        }
      }

      if (encontrado) {
        const cx = (((minX + maxX) / 2) / w) * 100;
        const cy = (((minY + maxY) / 2) / h) * 100;
        setCentro(`${cx.toFixed(1)}% ${cy.toFixed(1)}%`);
      }

      onRegistrarMapa(dibujo.id, { data, w, h, x, y });
    };
  }, [dibujo.archivo, dibujo.id]);

  return (
    <motion.div
      className={`capa-completa ${activa ? 'en-hover' : ''}`}
      style={{
        x,
        y,
        zIndex,
        transformOrigin: centro,
        pointerEvents: activa || enArrastre ? 'auto' : 'none'
      }}
      drag
      dragMomentum={false}
      animate={activa ? { scale: 1.03, rotate: -1 } : { scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onPointerDown={() => {
        sonarPop();
        onFrente(dibujo.id);
      }}
      onDragStart={() => onDragState(dibujo.id)}
      onDragEnd={() => onDragState(null)}
    >
      <img src={dibujo.archivo} alt={dibujo.nombre} />
    </motion.div>
  );
}

function EstampillaItem({ dibujo, srcFinal, zIndex, lienzoRef, onHoverChange, onFrente }) {
  const inicioClickRef = useRef({ x: 0, y: 0 });

  const manejarPointerDown = (e) => {
    inicioClickRef.current = { x: e.clientX, y: e.clientY };
    sonarPop();
    onFrente(dibujo.id);
  };

  const manejarPointerUp = (e) => {
    if (!dibujo.link) return;
    const distancia = Math.hypot(
      e.clientX - inicioClickRef.current.x,
      e.clientY - inicioClickRef.current.y
    );
    if (distancia < 6) {
      window.open(dibujo.link, '_blank', 'noopener,noreferrer');
    }
  };

  if (!srcFinal) return null;

  return (
    <motion.div
      className={`estampilla-movible ${dibujo.link ? 'con-link' : ''}`}
      style={{
        left: dibujo.x,
        top: dibujo.y,
        height: dibujo.alto,
        zIndex
      }}
      drag
      dragConstraints={lienzoRef}
      dragMomentum={false}
      whileHover={{ scale: 1.06, rotate: -2 }}
      whileTap={{ scale: 0.97 }}
      onPointerEnter={() => onHoverChange(dibujo.id)}
      onPointerLeave={() => onHoverChange(null)}
      onPointerDown={manejarPointerDown}
      onPointerUp={manejarPointerUp}
    >
      <img src={srcFinal} alt={dibujo.nombre} />
    </motion.div>
  );
}

function BotonMovible({ boton, src, lienzoRef, onHoverChange, onAccion, title, hoverProps, tapProps }) {
  const inicioClickRef = useRef({ x: 0, y: 0 });
  const elementoRef = useRef(null);

  const manejarPointerDown = (e) => {
    inicioClickRef.current = { x: e.clientX, y: e.clientY };
  };

  const manejarPointerUp = (e) => {
    const distancia = Math.hypot(
      e.clientX - inicioClickRef.current.x,
      e.clientY - inicioClickRef.current.y
    );
    if (distancia < 6 && onAccion) {
      onAccion();
    }
  };

  const manejarDragEnd = () => {
    if (!lienzoRef.current || !elementoRef.current) return;
    const rectLienzo = lienzoRef.current.getBoundingClientRect();
    const rectBoton = elementoRef.current.getBoundingClientRect();
    const xPct = (((rectBoton.left - rectLienzo.left) / rectLienzo.width) * 100).toFixed(1);
    const yPct = (((rectBoton.top - rectLienzo.top) / rectLienzo.height) * 100).toFixed(1);
    console.log(`Posición de ${boton.nombre} -> x: '${xPct}%', y: '${yPct}%'`);
  };

  return (
    <motion.div
      ref={elementoRef}
      className="boton-dibujo"
      style={{
        left: boton.x,
        top: boton.y,
        width: boton.ancho
      }}
      drag
      dragConstraints={lienzoRef}
      dragMomentum={false}
      whileHover={hoverProps}
      whileTap={tapProps}
      onPointerEnter={() => onHoverChange(boton.id)}
      onPointerLeave={() => onHoverChange(null)}
      onPointerDown={manejarPointerDown}
      onPointerUp={manejarPointerUp}
      onDragEnd={manejarDragEnd}
      title={title}
    >
      <img src={src} alt={boton.nombre} />
    </motion.div>
  );
}

export default function App() {
  const ordenInicialPestanas = [...PESTANAS_PATRON].reverse().map((p) => p.id);

  const [ordenDibujos, setOrdenDibujos] = useState(DIBUJOS.map((d) => d.id));
  const [ordenPestanas, setOrdenPestanas] = useState(ordenInicialPestanas);
  const [capaHover, setCapaHover] = useState(null);
  const [capaArrastrando, setCapaArrastrando] = useState(null);
  const [itemNormalHover, setItemNormalHover] = useState(null);
  const [recortes, setRecortes] = useState({});
  const [musicaActiva, setMusicaActiva] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const pantallaRef = useRef(null);
  const lienzoRef = useRef(null);
  const mapasPixelesRef = useRef({});
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(MUSICA_FONDO.ruta);
    audio.loop = true;
    audio.volume = MUSICA_FONDO.volumen ?? 0.45;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const alternarMusica = async () => {
    if (!audioRef.current) return;
    if (musicaActiva) {
      audioRef.current.pause();
      setMusicaActiva(false);
    } else {
      try {
        await audioRef.current.play();
        setMusicaActiva(true);
      } catch (error) {
        console.error('No se pudo reproducir el audio:', error);
        setMusicaActiva(false);
      }
    }
  };

  useEffect(() => {
    const cargarImagen = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });

    const procesarImagenes = async () => {
      const rutasIndividuales = [
        ...new Set([
          ...PESTANAS_PATRON.map((p) => p.archivo),
          ...DIBUJOS.filter((d) => !d.capaCompleta).map((d) => d.archivo),
          BOTONES_UI.reverse.archivo
        ])
      ];

      for (const ruta of rutasIndividuales) {
        const img = await cargarImagen(ruta);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, w, h).data;

        let minX = w, minY = h, maxX = 0, maxY = 0, encontrado = false;
        for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            if (data[(py * w + px) * 4 + 3] > 15) {
              if (px < minX) minX = px;
              if (px > maxX) maxX = px;
              if (py < minY) minY = py;
              if (py > maxY) maxY = py;
              encontrado = true;
            }
          }
        }

        if (encontrado) {
          const rw = maxX - minX + 1;
          const rh = maxY - minY + 1;
          const recorte = document.createElement('canvas');
          recorte.width = rw;
          recorte.height = rh;
          recorte.getContext('2d').drawImage(canvas, minX, minY, rw, rh, 0, 0, rw, rh);
          setRecortes((prev) => ({ ...prev, [ruta]: recorte.toDataURL('image/png') }));
        }
      }

      const [imgOff, imgOn] = await Promise.all([
        cargarImagen(BOTONES_UI.musica.archivoOff),
        cargarImagen(BOTONES_UI.musica.archivoOn)
      ]);

      const w = imgOff.naturalWidth;
      const h = imgOff.naturalHeight;
      let minX = w, minY = h, maxX = 0, maxY = 0, encontrado = false;

      [imgOff, imgOn].forEach((img) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            if (data[(py * w + px) * 4 + 3] > 15) {
              if (px < minX) minX = px;
              if (px > maxX) maxX = px;
              if (py < minY) minY = py;
              if (py > maxY) maxY = py;
              encontrado = true;
            }
          }
        }
      });

      if (encontrado) {
        const rw = maxX - minX + 1;
        const rh = maxY - minY + 1;

        const generarRecorte = (img) => {
          const c = document.createElement('canvas');
          c.width = rw;
          c.height = rh;
          c.getContext('2d').drawImage(img, minX, minY, rw, rh, 0, 0, rw, rh);
          return c.toDataURL('image/png');
        };

        setRecortes((prev) => ({
          ...prev,
          [BOTONES_UI.musica.archivoOff]: generarRecorte(imgOff),
          [BOTONES_UI.musica.archivoOn]: generarRecorte(imgOn)
        }));
      }
    };

    procesarImagenes();
  }, []);

  const traerDibujoAlFrente = (id) => {
    setOrdenDibujos((prev) => [...prev.filter((item) => item !== id), id]);
  };

  const traerPestanaAlFrente = (id) => {
    setOrdenPestanas((prev) => [...prev.filter((item) => item !== id), id]);
  };

  const registrarMapa = (id, info) => {
    mapasPixelesRef.current[id] = info;
  };

  const manejarMovimientoCursor = (e) => {
    if (capaArrastrando || itemNormalHover || !lienzoRef.current) {
      if (capaHover) setCapaHover(null);
      return;
    }

    const rect = lienzoRef.current.getBoundingClientRect();
    let encontrada = null;

    for (let i = ordenDibujos.length - 1; i >= 0; i--) {
      const id = ordenDibujos[i];
      const mapa = mapasPixelesRef.current[id];
      if (!mapa) continue;

      const relX = e.clientX - rect.left - mapa.x.get();
      const relY = e.clientY - rect.top - mapa.y.get();
      const px = Math.floor((relX / rect.width) * mapa.w);
      const py = Math.floor((relY / rect.height) * mapa.h);

      if (px >= 0 && px < mapa.w && py >= 0 && py < mapa.h) {
        const alpha = mapa.data[(py * mapa.w + px) * 4 + 3];
        if (alpha > 20) {
          encontrada = id;
          break;
        }
      }
    }

    if (encontrada !== capaHover) {
      setCapaHover(encontrada);
    }
  };

  const reiniciarTodo = () => {
    sonarOrdenar();
    setOrdenPestanas([...PESTANAS_PATRON].reverse().map((p) => p.id));
    setOrdenDibujos(DIBUJOS.map((d) => d.id));
    setResetKey((k) => k + 1);
  };

  const srcReverse = recortes[BOTONES_UI.reverse.archivo];
  const srcMusicaActual = musicaActiva
    ? recortes[BOTONES_UI.musica.archivoOn]
    : recortes[BOTONES_UI.musica.archivoOff];

  return (
    <div
      ref={pantallaRef}
      className="pantalla-contenedor"
      onPointerMove={manejarMovimientoCursor}
    >
      <main ref={lienzoRef} className="lienzo-fondo">
        {/* Estampillas y Victoria */}
        {DIBUJOS.map((dibujo) => {
          const zIndex = ordenDibujos.indexOf(dibujo.id) + 10;

          if (dibujo.capaCompleta) {
            return (
              <CapaFullCanvas
                key={`${dibujo.id}-${resetKey}`}
                dibujo={dibujo}
                zIndex={zIndex}
                activa={capaHover === dibujo.id}
                enArrastre={capaArrastrando === dibujo.id}
                onFrente={traerDibujoAlFrente}
                onDragState={setCapaArrastrando}
                onRegistrarMapa={registrarMapa}
              />
            );
          }

          return (
            <EstampillaItem
              key={`${dibujo.id}-${resetKey}`}
              dibujo={dibujo}
              srcFinal={recortes[dibujo.archivo]}
              zIndex={zIndex}
              lienzoRef={lienzoRef}
              onHoverChange={setItemNormalHover}
              onFrente={traerDibujoAlFrente}
            />
          );
        })}

        {/* Botones Reverse y Música */}
        {srcReverse && (
          <BotonMovible
            boton={BOTONES_UI.reverse}
            src={srcReverse}
            lienzoRef={lienzoRef}
            onHoverChange={setItemNormalHover}
            onAccion={reiniciarTodo}
            title="Ordenar dibujos"
            hoverProps={{ scale: 1.1, rotate: -8 }}
            tapProps={{ scale: 0.92, rotate: -25 }}
          />
        )}

        {srcMusicaActual && (
          <BotonMovible
            boton={BOTONES_UI.musica}
            src={srcMusicaActual}
            lienzoRef={lienzoRef}
            onHoverChange={setItemNormalHover}
            onAccion={alternarMusica}
            title={musicaActiva ? 'Apagar música' : 'Encender música'}
            hoverProps={{ scale: 1.08, rotate: 3 }}
            tapProps={{ scale: 0.93 }}
          />
        )}
      </main>

      {/* Pestañas inferiores fijas en su lugar */}
      {PESTANAS_PATRON.map((tab) => {
        const zIndex = ordenPestanas.indexOf(tab.id) + 50;
        const srcFinal = recortes[tab.archivo];
        if (!srcFinal) return null;

        return (
          <motion.div
            key={`${tab.id}-${resetKey}`}
            className="pestana-movible"
            style={{
              left: tab.left,
              zIndex
            }}
            whileHover={{ y: -20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onPointerEnter={() => {
              setItemNormalHover(tab.id);
              traerPestanaAlFrente(tab.id);
            }}
            onPointerLeave={() => setItemNormalHover(null)}
            onPointerDown={() => {
              sonarPop();
              traerPestanaAlFrente(tab.id);
            }}
          >
            <img src={srcFinal} alt={tab.nombre} />
          </motion.div>
        );
      })}
    </div>
  );
}