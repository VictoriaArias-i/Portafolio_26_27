import { useRef } from 'react';
import { motion } from 'framer-motion';

export default function BotonMovible({ boton, src, lienzoRef, onHoverChange, onAccion, title, hoverProps, tapProps }) {
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
    if (!lienzoRef?.current || !elementoRef.current) return;
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
      onPointerEnter={() => onHoverChange?.(boton.id)}
      onPointerLeave={() => onHoverChange?.(null)}
      onPointerDown={manejarPointerDown}
      onPointerUp={manejarPointerUp}
      onDragEnd={manejarDragEnd}
      title={title}
    >
      <img src={src} alt={boton.nombre} />
    </motion.div>
  );
}