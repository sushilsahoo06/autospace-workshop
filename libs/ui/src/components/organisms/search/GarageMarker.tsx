import { SearchGaragesQuery } from '@autospace/network/src/gql/generated'
import { useKeypress } from '@autospace/util/hooks/keys'
import { useState } from 'react'
import { Marker } from '../map/MapMarker'
import { BottomSheet } from '../../atoms/BottomSheet'
import { ParkingIcon } from '../../atoms/ParkingIcon'
import { FormProviderBookSlot } from '@autospace/forms/src/bookSlot'
import { useWatch } from 'react-hook-form'
import { FormTypeSearchGarage } from '@autospace/forms/src/searchGarages'
import { BookSlotPopup } from '../BookSlotPopup'

export const GarageMarker = ({
  marker,
}: {
  marker: SearchGaragesQuery['searchGarages'][number]
}) => {
  const [showPopup, setShowPopup] = useState(false)
  useKeypress(['Escape'], () => setShowPopup(false))

  const { endTime, startTime } = useWatch<FormTypeSearchGarage>()

  if (!marker.address?.lat || !marker.address.lng) {
    return null
  }

  return (
    <>
      <BottomSheet
        title={`Reserve Slot — ${marker.displayName || 'Garage'}`}
        widthClassName="max-w-3xl"
        open={showPopup}
        setOpen={setShowPopup}
      >
        <FormProviderBookSlot defaultValues={{ endTime, startTime }}>
          <BookSlotPopup garage={marker} />
        </FormProviderBookSlot>
      </BottomSheet>

      <Marker
        latitude={marker.address.lat}
        longitude={marker.address.lng}
        onClick={(e) => {
          e.originalEvent.stopPropagation()
          setShowPopup((state) => !state)
        }}
      >
        <ParkingIcon />
      </Marker>
    </>
  )
}
