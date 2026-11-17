import { useState, useEffect } from 'react';
import EstampillaItem from '../../components/Estampilla';
import { DIBUJOS_SOBRE_MI } from './sobremi.contenido';
import './SobreMi.css';

export default function SobreMi({ lienzoRef, recortes, resetKey }) {
  const [ordenDibujos, setOrdenDibujos] = useState(DIBUJOS_SOBRE_MI.map((d) => d.id));

  useEffect(() => {
    setOrdenDibujos(DIBUJOS_SOBRE_MI.map((d) => d.id));
  }, [resetKey]);

  const traerAlFrente = (id) => {
    setOrdenDibujos((prev) => [...prev.filter((item) => item !== id), id]);
  };

  return (
    <>
      {DIBUJOS_SOBRE_MI.map((dibujo) => {
        const zIndex = ordenDibujos.indexOf(dibujo.id) + 10;
        return (
          <EstampillaItem
            key={`${dibujo.id}-${resetKey}`}
            dibujo={dibujo}
            srcFinal={recortes[dibujo.archivo]}
            zIndex={zIndex}
            lienzoRef={lienzoRef}
            onFrente={traerAlFrente}
          />
        );
      })}
    </>
  );
}