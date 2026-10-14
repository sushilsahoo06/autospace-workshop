import MapGl, { useMap } from 'react-map-gl'

type MapProps = React.ComponentProps<typeof MapGl> & { height?: string }

export const Map = ({ height = 'calc(100vh - 4rem)', ...props }: MapProps) => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!token) {
    return (
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-700 space-y-4"
      >
        <div className="text-5xl">🗺️</div>
        <h3 className="text-xl font-semibold text-gray-900">
          Mapbox Token Required
        </h3>
        <p className="max-w-md text-sm text-gray-600">
          The interactive map requires a Mapbox public access token. Add your
          token to{' '}
          <code className="px-1.5 py-0.5 bg-gray-200 rounded font-mono text-xs text-black">
            apps/web/.env
          </code>{' '}
          under{' '}
          <code className="px-1.5 py-0.5 bg-gray-200 rounded font-mono text-xs text-black">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{' '}
          and restart the server.
        </p>
        <a
          href="https://account.mapbox.com/access-tokens/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition"
        >
          Get Free Mapbox Token →
        </a>
      </div>
    )
  }

  return (
    <MapGl
      {...props}
      projection={{ name: 'globe' }}
      mapStyle={props.mapStyle || 'mapbox://styles/mapbox/streets-v12'}
      mapboxAccessToken={token}
      style={{ height }}
      scrollZoom={false}
    >
      <StyleMap />
      {props.children}
    </MapGl>
  )
}

export const StyleMap = () => {
  const { current } = useMap()

  current?.on('style.load', () => {
    current?.getMap().setFog({
      color: 'rgb(255, 255, 255)', // Lower atmosphere
      range: [1, 10],
      //   @ts-ignore
      'high-color': 'rgb(200, 200, 200)', // Upper atmosphere
      'horizon-blend': 0.05, // Atmosphere thickness (default 0.2 at low zooms)
      'space-color': 'rgb(150, 150, 150)', // Background color
      'star-intensity': 0.5, // Background star brightness (default 0.35 at low zoooms )
    })
  })
  return null
}
