import { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { sonarPop } from '../utils/data/sonidos';

export default function CapaFullCanvas({ dibujo, zIndex, activa, enArrastre, onFrente, onDragState, onRegistrarMapa }) {
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