import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { sonarPop } from '../utils/data/sonidos';

const cacheCajas = {};

function calcularCajaDesdeBG(rutaArchivo) {
  if (cacheCajas[rutaArchivo]) {
    return Promise.resolve(cacheCajas[rutaArchivo]);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.src = rutaArchivo;

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const { data } = ctx.getImageData(0, 0, w, h);
      let minX = w, minY = h, maxX = 0, maxY = 0;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const alpha = data[(y * w + x) * 4 + 3];
          if (alpha > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        resolve(null);
        return;
      }

      const resultado = {
        x: `${((minX / w) * 100).toFixed(2)}%`,
        y: `${((minY / h) * 100).toFixed(2)}%`,
        alto: `${(((maxY - minY + 1) / h) * 100).toFixed(2)}%`
      };

      cacheCajas[rutaArchivo] = resultado;
      resolve(resultado);
    };

    img.onerror = () => resolve(null);
  });
}

export default function EstampillaItem({ dibujo, srcFinal, zIndex, lienzoRef, onHoverChange, onFrente }) {
  const [expandido, setExpandido] = useState(false);
  const [cajaAuto, setCajaAuto] = useState(() => cacheCajas[dibujo.archivo] || null);
  const inicioClickRef = useRef({ x: 0, y: 0 });
  const elementoRef = useRef(null);

  useEffect(() => {
    if (dibujo.x && dibujo.y && dibujo.alto) return;
    let activo = true;
    calcularCajaDesdeBG(dibujo.archivo).then((caja) => {
      if (activo && caja) setCajaAuto(caja);
    });
    return () => {
      activo = false;
    };
  }, [dibujo.archivo, dibujo.x, dibujo.y, dibujo.alto]);

  const manejarPointerDown = (e) => {
    inicioClickRef.current = { x: e.clientX, y: e.clientY };
    sonarPop();
    onFrente(dibujo.id);
  };

  const manejarPointerUp = (e) => {
    const distancia = Math.hypot(
      e.clientX - inicioClickRef.current.x,
      e.clientY - inicioClickRef.current.y
    );

    if (distancia < 6) {
      if (dibujo.link) {
        window.open(dibujo.link, '_blank', 'noopener,noreferrer');
      } else if (dibujo.expandible) {
        setExpandido((prev) => !prev);
      }
    }
  };

const manejarDragEnd = () => {
    if (!lienzoRef?.current || !elementoRef.current) return;
    const rectLienzo = lienzoRef.current.getBoundingClientRect();
    const rectItem = elementoRef.current.getBoundingClientRect();
    const xPct = (((rectItem.left - rectLienzo.left) / rectLienzo.width) * 100).toFixed(1);
    const yPct = (((rectItem.top - rectLienzo.top) / rectLienzo.height) * 100).toFixed(1);
    const altoPct = (((rectItem.height / escalaActual) / rectLienzo.height) * 100).toFixed(1);
    console.log(`Posición de ${dibujo.nombre} -> x: '${xPct}%', y: '${yPct}%', alto: '${altoPct}%'`);
  };

  const posX = dibujo.x ?? cajaAuto?.x;
  const posY = dibujo.y ?? cajaAuto?.y;
  const altoFinal = dibujo.alto ?? cajaAuto?.alto;
  const listo = Boolean(posX && posY && altoFinal);

  const escalaActual = expandido ? (dibujo.escalaExpandida || 1.5) : 1;
  const esInteractivo = Boolean(dibujo.link || dibujo.expandible);

  return (
    <motion.div
      ref={elementoRef}
      className={`estampilla-movible ${esInteractivo ? 'con-link' : ''}`}
      style={{
        left: posX || '0%',
        top: posY || '0%',
        height: altoFinal || 'auto',
        visibility: listo ? 'visible' : 'hidden',
        zIndex: expandido ? 45 : zIndex
      }}
      drag
      dragConstraints={lienzoRef}
      dragMomentum={false}
      animate={{ scale: escalaActual, rotate: 0 }}
      whileHover={expandido ? { scale: escalaActual * 1.02 } : { scale: 1.04, rotate: -1.5 }}
      whileTap={{ scale: escalaActual * 0.96 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      onPointerEnter={() => onHoverChange?.(dibujo.id)}
      onPointerLeave={() => onHoverChange?.(null)}
      onPointerDown={manejarPointerDown}
      onPointerUp={manejarPointerUp}
      onDragEnd={manejarDragEnd}
    >
      <img src={srcFinal || dibujo.archivo} alt={dibujo.nombre} />
    </motion.div>
  );
}