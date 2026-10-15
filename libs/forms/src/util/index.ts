export const isStartTimeValid = (startTime: string) => {
  const startDate = new Date(startTime)
  const currentDate = new Date()
  // Allow a 30-minute grace window so the form doesn't become invalid while browsing
  return startDate.getTime() >= currentDate.getTime() - 30 * 60 * 1000
}

export const isEndTimeValid = ({
  endTime,
  startTime,
}: {
  startTime: string
  endTime: string
}) => {
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  return endDate > startDate
}
