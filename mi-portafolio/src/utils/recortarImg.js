const cargarImagen = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });

export async function generarRecortes(rutasIndividuales, parMusica) {
  const resultado = {};

  await Promise.all(
    [...new Set(rutasIndividuales)].map(async (ruta) => {
      const img = await cargarImagen(ruta);
      if (!img) return;

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
        resultado[ruta] = recorte.toDataURL('image/png');
      }
    })
  );

  if (parMusica) {
    const [imgOff, imgOn] = await Promise.all([
      cargarImagen(parMusica.archivoOff),
      cargarImagen(parMusica.archivoOn)
    ]);

    if (imgOff && imgOn) {
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
        const recorteUnificado = (img) => {
          const c = document.createElement('canvas');
          c.width = rw;
          c.height = rh;
          c.getContext('2d').drawImage(img, minX, minY, rw, rh, 0, 0, rw, rh);
          return c.toDataURL('image/png');
        };
        resultado[parMusica.archivoOff] = recorteUnificado(imgOff);
        resultado[parMusica.archivoOn] = recorteUnificado(imgOn);
      }
    }
  }

  return resultado;
}