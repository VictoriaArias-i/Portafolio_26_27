import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { sonarPop } from '../utils/data/sonidos';

export default function EstampillaItem({ dibujo, srcFinal, zIndex, lienzoRef, onHoverChange, onFrente }) {
  const [expandido, setExpandido] = useState(false);
  const inicioClickRef = useRef({ x: 0, y: 0 });
  const elementoRef = useRef(null);

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
    console.log(`Posición de ${dibujo.nombre} -> x: '${xPct}%', y: '${yPct}%'`);
  };

  const escalaActual = expandido ? (dibujo.escalaExpandida || 1.45) : 1;
  const esInteractivo = Boolean(dibujo.link || dibujo.expandible);

  return (
    <motion.div
      ref={elementoRef}
      className={`estampilla-movible ${esInteractivo ? 'con-link' : ''}`}
      style={{
        left: dibujo.x,
        top: dibujo.y,
        height: dibujo.alto,
        zIndex: expandido ? 45 : zIndex
      }}
      drag
      dragConstraints={lienzoRef}
      dragMomentum={false}
      animate={{ scale: escalaActual, rotate: 0 }}
      whileHover={expandido ? { scale: escalaActual * 1.02 } : { scale: 1.06, rotate: -2 }}
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