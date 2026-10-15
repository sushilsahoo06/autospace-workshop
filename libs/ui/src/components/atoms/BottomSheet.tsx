'use client'
import React, {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react'
import {
  Dialog as HeadlessUIDialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { IconX } from '@tabler/icons-react'

export interface BottomSheetProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  children: ReactNode
  title?: string
  className?: string
  widthClassName?: string
}

export const BottomSheet = ({
  open,
  setOpen,
  children,
  title = 'Booking Details',
  className = '',
  widthClassName = 'max-w-3xl',
}: BottomSheetProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return
    const currentY = e.targetTouches[0].clientY
    const diff = currentY - touchStart
    // Only allow dragging downwards
    if (diff > 0) {
      setDragOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (dragOffset > 90) {
      // Dismiss if pulled down more than 90px
      setOpen(false)
    }
    setDragOffset(0)
    setTouchStart(null)
  }

  const closeModal = useCallback(() => {
    setOpen(false)
    setDragOffset(0)
  }, [setOpen])

  return (
    <Transition appear show={open} as={Fragment}>
      <HeadlessUIDialog
        as="div"
        className="relative z-50 select-none"
        onClose={closeModal}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          {/* Mobile Bottom Sheet (slides up from bottom on mobile; centers on md+) */}
          <div className="flex min-h-full items-end justify-center md:items-center p-0 md:p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="translate-y-full md:translate-y-0 md:opacity-0 md:scale-95"
              enterTo="translate-y-0 md:opacity-100 md:scale-100"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-y-0 md:opacity-100 md:scale-100"
              leaveTo="translate-y-full md:translate-y-0 md:opacity-0 md:scale-95"
            >
              <DialogPanel
                style={{
                  transform:
                    dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
                className={`w-full ${widthClassName} ${className} bg-white rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] text-left align-middle border border-slate-100`}
              >
                {/* Touch Drag Handle on Mobile */}
                <div
                  className="w-full pt-3 pb-2 cursor-grab active:cursor-grabbing flex flex-col items-center justify-center md:hidden bg-slate-50 border-b border-slate-100"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="w-12 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors" />
                  <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
                    Swipe down to close
                  </span>
                </div>

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-semibold text-slate-900 flex items-center gap-2"
                  >
                    {title}
                  </DialogTitle>
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <IconX size={20} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </HeadlessUIDialog>
    </Transition>
  )
}
