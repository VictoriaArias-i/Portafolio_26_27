import { motion } from 'framer-motion';
import { sonarPop } from '../utils/data/sonidos';

export default function BarraPestanas({
  pestanas,
  ordenPestanas,
  recortes,
  vistaActiva,
  resetKey,
  onTraerAlFrente,
  onCambiarVista,
  onHoverChange
}) {
  return (
    <>
      {pestanas.map((tab, index) => {
        const zIndex = ordenPestanas.indexOf(tab.id) + 50;
        const srcFinal = recortes[tab.archivo] || tab.archivo;
        const destino = tab.vista || (index === 0 ? 'inicio' : index === 1 ? 'sobre-mi' : null);
        const esActiva = destino === vistaActiva;

        return (
          <motion.div
            key={`${tab.id}-${resetKey}`}
            className="pestana-movible"
            style={{
              left: tab.left,
              zIndex
            }}
            animate={{ y: esActiva ? -14 : 0 }}
            whileHover={{ y: -22 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onPointerEnter={() => {
              onHoverChange?.(tab.id);
              onTraerAlFrente(tab.id);
            }}
            onPointerLeave={() => onHoverChange?.(null)}
            onPointerDown={() => {
              sonarPop();
              onTraerAlFrente(tab.id);
              if (destino) onCambiarVista(destino);
            }}
          >
            <img src={srcFinal} alt={tab.nombre} />
          </motion.div>
        );
      })}
    </>
  );
}