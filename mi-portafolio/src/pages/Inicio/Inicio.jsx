import { useState, useRef, useEffect } from 'react';
import CapaFullCanvas from '../../components/CapaFull';
import EstampillaItem from '../../components/Estampilla';
import { DIBUJOS } from './inicio.contenido';
import './Inicio.css';

export default function Inicio({ lienzoRef, recortes, resetKey }) {
  const [ordenDibujos, setOrdenDibujos] = useState(DIBUJOS.map((d) => d.id));
  const [capaHover, setCapaHover] = useState(null);
  const [capaArrastrando, setCapaArrastrando] = useState(null);
  const [itemNormalHover, setItemNormalHover] = useState(null);
  const mapasPixelesRef = useRef({});

  useEffect(() => {
    setOrdenDibujos(DIBUJOS.map((d) => d.id));
    setCapaHover(null);
  }, [resetKey]);

  const traerAlFrente = (id) => {
    setOrdenDibujos((prev) => [...prev.filter((item) => item !== id), id]);
  };

  const registrarMapa = (id, info) => {
    mapasPixelesRef.current[id] = info;
  };

  useEffect(() => {
    const manejarMove = (e) => {
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
          if (mapa.data[(py * mapa.w + px) * 4 + 3] > 20) {
            encontrada = id;
            break;
          }
        }
      }

      if (encontrada !== capaHover) {
        setCapaHover(encontrada);
      }
    };

    window.addEventListener('pointermove', manejarMove);
    return () => window.removeEventListener('pointermove', manejarMove);
  }, [capaArrastrando, itemNormalHover, ordenDibujos, capaHover, lienzoRef]);

  return (
    <>
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
              onFrente={traerAlFrente}
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
            onFrente={traerAlFrente}
          />
        );
      })}
    </>
  );
}