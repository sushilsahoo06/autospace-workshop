import { ManageValets } from '@autospace/ui/src/components/templates/ManageValets'
import { IsLoggedIn } from '@autospace/ui/src/components/organisms/IsLoggedIn'
import { IsManager } from '@autospace/ui/src/components/organisms/IsManager'

export default function Page() {
  return (
    <IsLoggedIn>
      <IsManager>
        <ManageValets />
      </IsManager>
    </IsLoggedIn>
  )
}
