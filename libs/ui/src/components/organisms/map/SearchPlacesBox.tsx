import { LocationInfo, ViewState } from '@autospace/util/types'
import { useMap } from 'react-map-gl'
import { Autocomplete } from '../../atoms/Autocomplete'
import { useSearchLocation } from '@autospace/util/hooks/location'
import { majorCitiesLocationInfo } from '@autospace/util/constants'

import { useMemo, useState } from 'react'

export const SearchPlaceBox = ({
  onLocationChange,
}: {
  onLocationChange?: (location: ViewState) => void
}) => {
  const { current: map } = useMap()
  const { loading, locationInfo, searchText, setLoading, setSearchText } =
    useSearchLocation()
  const [selectedPlace, setSelectedPlace] = useState<LocationInfo | null>(null)

  const options = useMemo(() => {
    const list = locationInfo?.length
      ? [...locationInfo]
      : [...majorCitiesLocationInfo]
    if (
      selectedPlace &&
      !list.some((o) => o.placeName === selectedPlace.placeName)
    ) {
      list.unshift(selectedPlace)
    }
    return list
  }, [locationInfo, selectedPlace])

  return (
    <Autocomplete<LocationInfo>
      options={options}
      value={selectedPlace}
      isOptionEqualToValue={(option, value) =>
        !value || option.placeName === value.placeName
      }
      noOptionsText={searchText ? 'No options.' : 'Type something...'}
      getOptionLabel={(x) => (typeof x === 'string' ? x : x?.placeName || '')}
      onInputChange={(_, v) => {
        setLoading(true)
        setSearchText(v)
      }}
      loading={loading}
      onChange={async (_, v) => {
        setSelectedPlace(v || null)
        if (v) {
          const { latLng } = v
          await map?.flyTo({
            center: { lat: latLng[0], lng: latLng[1] },
            zoom: 12,
            // essential: true,
          })
          if (onLocationChange) {
            onLocationChange({ latitude: latLng[0], longitude: latLng[1] })
          }
        }
      }}
    />
  )
}
