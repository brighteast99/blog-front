import { useAppSelector } from 'store/hooks'
import { selectBreakpoint } from 'store/slices/window/windowSlice'

import Icon from '@mdi/react'
import { mdiChevronLeft } from '@mdi/js'

export default function MainPage() {
  const breakpoint = useAppSelector(selectBreakpoint)
  return (
    <div className='relative size-full'>
      <span className='absolute inset-x-0 top-20 mx-auto size-fit text-5xl font-bold'>
        Welcome!
      </span>
      {breakpoint === 'mobile' && (
        <div className='absolute inset-y-0 left-8 my-auto flex size-fit animate-pulse items-center'>
          <Icon path={mdiChevronLeft} size={2} />
          <span className='text-xl'>Check here!</span>
        </div>
      )}
    </div>
  )
}
