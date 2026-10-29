// ============================================================================
// servicios/mapa_servicios.js
// Junta las 3 tablas de Supabase (busines, events, places) en una sola lista
// de "puntos de mapa" con la forma que ya espera el frontend
// (frontend/html/mapa.php -> función normalize() del script del mapa):
//   { id, nombre, tipo, categorias[], lat, lng, imagen, direccion,
//     resumen/descripcion, enlace }
// ============================================================================
import supabase from "../config/supabase.js";

function aPunto(row, tipo, camposNombre) {
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  const nombre = row[camposNombre.nombre] ?? "Punto de interés";
  return {
    id: `${tipo}-${row.id}`,
    nombre,
    tipo,
    categorias: row.categories?.length ? row.categories : row.category ? [row.category] : row.type ? [row.type] : [],
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    imagen: row.image_url || null,
    direccion: row.address || row.location || null,
    descripcion: row[camposNombre.descripcion] || null,
    enlace: row.link || null,
  };
}

export async function obtenerPuntosDeMapa({ tipo } = {}) {
  const consultas = [];

  if (!tipo || tipo === "company") {
    consultas.push(
      supabase
        .from("busines")
        .select("id,name,category,categories,description,location,address,image_url,link,latitude,longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .then(({ data, error }) => (error ? [] : data.map((r) => aPunto(r, "company", { nombre: "name", descripcion: "description" })).filter(Boolean)))
    );
  }

  if (!tipo || tipo === "event") {
    consultas.push(
      supabase
        .from("events")
        .select("id,title,categories,description,location,address,image_url,link,latitude,longitude,date_start,date_end,event_time,price")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .then(({ data, error }) =>
          (error ? [] : data).map((r) =>
            error
              ? null
              : {
                  ...aPunto(r, "event", { nombre: "title", descripcion: "description" }),
                  fechaInicio: r.date_start,
                  fechaFin: r.date_end,
                  horario: r.event_time,
                  precio: r.price,
                }
          ).filter(Boolean)
        )
    );
  }

  if (!tipo || tipo === "place" || tipo === "cultural") {
    consultas.push(
      supabase
        .from("places")
        .select("id,name,type,categories,description,location,address,image_url,link,latitude,longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .then(({ data, error }) => (error ? [] : data.map((r) => aPunto(r, "place", { nombre: "name", descripcion: "description" })).filter(Boolean)))
    );
  }

  const resultados = await Promise.all(consultas);
  return resultados.flat().filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)));
}
