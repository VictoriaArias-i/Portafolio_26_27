import { useState, useRef, useEffect } from 'react';
import BarraPestanas from './components/BarraPest';
import BotonMovible from './components/BotonMov';
import Inicio from './pages/Inicio/Inicio';
import SobreMi from './pages/Sobre_Mi/SobreMi';
import { DIBUJOS } from './pages/Inicio/inicio.contenido';
import { DIBUJOS_SOBRE_MI } from './pages/Sobre_Mi/sobremi.contenido';
import { PESTANAS_PATRON, BOTONES_UI, MUSICA_ARCHIVO } from './utils/data/contenido';
import { MUSICA_FONDO, sonarOrdenar } from './utils/data/sonidos';
import { generarRecortes } from './utils/recortarImg';
import './App.css';

export default function App() {
  const ordenInicialPestanas = [...PESTANAS_PATRON].reverse().map((p) => p.id);

  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [ordenPestanas, setOrdenPestanas] = useState(ordenInicialPestanas);
  const [recortes, setRecortes] = useState({});
  const [musicaActiva, setMusicaActiva] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const lienzoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const rutaAudio = MUSICA_FONDO?.ruta || MUSICA_ARCHIVO;
    const audio = new Audio(rutaAudio);
    audio.loop = true;
    audio.volume = MUSICA_FONDO?.volumen ?? 0.45;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const rutas = [
      ...PESTANAS_PATRON.map((p) => p.archivo),
      ...DIBUJOS.filter((d) => !d.capaCompleta).map((d) => d.archivo),
      ...DIBUJOS_SOBRE_MI.map((d) => d.archivo),
      BOTONES_UI.reverse.archivo
    ];

    generarRecortes(rutas, BOTONES_UI.musica).then(setRecortes);
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

  const reiniciarTodo = () => {
    sonarOrdenar();
    setOrdenPestanas([...PESTANAS_PATRON].reverse().map((p) => p.id));
    setResetKey((k) => k + 1);
  };

  const traerPestanaAlFrente = (id) => {
    setOrdenPestanas((prev) => [...prev.filter((item) => item !== id), id]);
  };

  const srcReverse = recortes[BOTONES_UI.reverse.archivo] || BOTONES_UI.reverse.archivo;
  const srcMusicaActual = musicaActiva
    ? (recortes[BOTONES_UI.musica.archivoOn] || BOTONES_UI.musica.archivoOn)
    : (recortes[BOTONES_UI.musica.archivoOff] || BOTONES_UI.musica.archivoOff);

  return (
    <div className="pantalla-contenedor">
      <main ref={lienzoRef} className={`lienzo-fondo pagina-${vistaActiva}`}>
        {vistaActiva === 'inicio' && (
          <Inicio
            lienzoRef={lienzoRef}
            recortes={recortes}
            resetKey={resetKey}
          />
        )}

        {vistaActiva === 'sobre-mi' && (
          <SobreMi
            lienzoRef={lienzoRef}
            recortes={recortes}
            resetKey={resetKey}
          />
        )}

        <BotonMovible
          boton={BOTONES_UI.reverse}
          src={srcReverse}
          lienzoRef={lienzoRef}
          onAccion={reiniciarTodo}
          title="Ordenar dibujos"
          hoverProps={{ scale: 1.1, rotate: -8 }}
          tapProps={{ scale: 0.92, rotate: -25 }}
        />

        <BotonMovible
          boton={BOTONES_UI.musica}
          src={srcMusicaActual}
          lienzoRef={lienzoRef}
          onAccion={alternarMusica}
          title={musicaActiva ? 'Apagar música' : 'Encender música'}
          hoverProps={{ scale: 1.08, rotate: 3 }}
          tapProps={{ scale: 0.93 }}
        />
      </main>

      <BarraPestanas
        pestanas={PESTANAS_PATRON}
        ordenPestanas={ordenPestanas}
        recortes={recortes}
        vistaActiva={vistaActiva}
        resetKey={resetKey}
        onTraerAlFrente={traerPestanaAlFrente}
        onCambiarVista={setVistaActiva}
      />
    </div>
  );
}