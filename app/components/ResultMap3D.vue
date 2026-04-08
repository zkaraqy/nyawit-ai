<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'

const props = defineProps<{
  province: string
  score: number
  sizeHectares: number
  geoJsonData?: any[]
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null

// Simple mapping of provinces to rough coordinates (longitude, latitude)
const provinceCoords: Record<string, [number, number]> = {
  'Aceh': [96.7369, 4.3685],
  'Sumatera Utara': [99.0558, 2.1851],
  'Sumatera Barat': [100.4651, -0.7399],
  'Riau': [101.6841, 0.2933],
  'Jambi': [102.7373, -1.6116],
  'Sumatera Selatan': [104.1680, -3.1267],
  'Bengkulu': [102.2666, -3.7928],
  'Lampung': [105.0214, -4.5586],
  'Kepulauan Bangka Belitung': [106.1009, -2.7153],
  'Kepulauan Riau': [104.5363, 3.9456],
  'Kalimantan Barat': [111.1149, -0.2787],
  'Kalimantan Tengah': [113.8184, -1.6815],
  'Kalimantan Selatan': [115.3253, -3.0926],
  'Kalimantan Timur': [116.4275, 0.4646],
  'Kalimantan Utara': [116.1950, 3.0731],
  'Papua': [138.0804, -4.2699],
  'Papua Barat': [132.9768, -1.3361]
}

const getCenter = (prov: string): [number, number] => {
  return provinceCoords[prov] || [113.9213, -0.7893] // Default to center of Indonesia
}

const getColor = (score: number) => {
  if (score > 80) return '#10b981' // emerald-500
  if (score > 60) return '#facc15' // yellow-400
  return '#ef4444' // red-500
}

onMounted(() => {
  if (!mapContainer.value) return

  const center = getCenter(props.province)

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS Community'
        }
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    },
    center: center,
    zoom: 7,
    pitch: 45,
    bearing: -17.6
  })

  map.on('load', () => {
    if (!map) return

    // JIKA ADA DATA GEOJSON ASLI DARI ML PYTHON
    if (props.geoJsonData && props.geoJsonData.length > 0) {
      
      const features = props.geoJsonData.map((pt: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [pt.lon, pt.lat]
        },
        properties: {
          id: pt.id,
          class: pt.class,
          confidence: pt.confidence,
          color: pt.color
        }
      }))

      map.addSource('ml-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        }
      })

      // Add points as circles
      map.addLayer({
        id: 'ml-points-layer',
        type: 'circle',
        source: 'ml-points',
        paint: {
          // Gunakan warna dari property (biasanya #0000FF, #00FF00, #FF0000 dari Python)
          'circle-color': ['get', 'color'],
          'circle-radius': 6,
          'circle-opacity': 0.8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFFFFF'
        }
      })

      // Add small text label indicating confidence score
      map.addLayer({
        id: 'ml-points-labels',
        type: 'symbol',
        source: 'ml-points',
        layout: {
          'text-field': ['concat', ['round', ['*', ['get', 'confidence'], 100]], '%'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      })

      // Center map on the first point
      if (features.length > 0) {
        map.flyTo({
          center: features[0].geometry.coordinates,
          zoom: 12,
          speed: 1.5
        });
      }

    } else {
      // DEFAULT MOCK POLYGON (Jika Tidak Ada Data GeoJson dari Python)
      const offset = Math.sqrt(props.sizeHectares) * 0.0001
      
      const polygon = [
        [center[0] - offset, center[1] - offset],
        [center[0] + offset, center[1] - offset],
        [center[0] + offset, center[1] + offset],
        [center[0] - offset, center[1] + offset],
        [center[0] - offset, center[1] - offset]
      ]

      map.addSource('land-area', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [polygon]
          },
          properties: {}
        }
      })

      const color = getColor(props.score)

      // Fill layer
      map.addLayer({
        id: 'land-area-fill',
        type: 'fill',
        source: 'land-area',
        paint: {
          'fill-color': color,
          'fill-opacity': 0.4
        }
      })

      // Outline layer
      map.addLayer({
        id: 'land-area-line',
        type: 'line',
        source: 'land-area',
        paint: {
          'line-color': color,
          'line-width': 3
        }
      })

      // Add a pulsing point in the middle
      map.addSource('center-point', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: center
          },
          properties: {}
        }
      })

      map.addLayer({
        id: 'center-point-layer',
        type: 'circle',
        source: 'center-point',
        paint: {
          'circle-radius': 8,
          'circle-color': color,
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      })
    }
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<template>
  <div class="relative w-full h-[500px] min-h-[400px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
    <div ref="mapContainer" class="absolute inset-0 z-0 w-full h-full"></div>
    
    <!-- Floating overlay ui overlay for map -->
    <div class="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl pointer-events-none">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-inner shadow-white/20" 
             :class="score > 80 ? 'bg-emerald-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'">
          {{ score }}
        </div>
        <div>
          <p class="text-white font-bold leading-tight">{{ province }}</p>
          <p class="text-slate-400 text-xs font-medium">{{ sizeHectares }} Ha Area</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import 'maplibre-gl/dist/maplibre-gl.css';
</style>
