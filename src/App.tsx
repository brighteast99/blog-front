import { useLayoutEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { throttle } from 'throttle-debounce'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'app/hooks'
import { selectBreakpoint, updateSize } from 'features/window/windowSlice'
import { Sidebar, SidebarHandle } from 'features/sidebar/Sidebar'
import { CategoryPage } from 'pages/category'
import { MainPage } from 'pages/main'

function App() {
  const dispatch = useAppDispatch()
  const breakpoint = useSelector(selectBreakpoint)

  useLayoutEffect(() => {
    const dispatchSizeUpdate = throttle(250, () => {
      dispatch(
        updateSize({
          size: { height: window.innerHeight, width: window.innerWidth }
        })
      )
    })

    window.addEventListener('resize', dispatchSizeUpdate)

    return () => {
      window.removeEventListener('resize', dispatchSizeUpdate)
    }
  }, [dispatch])

  return (
    <div className='flex size-full min-h-[720px] bg-background text-foreground'>
      <Sidebar foldable={breakpoint !== 'desktop'} />

      <div className='relative h-full min-w-0 shrink grow'>
        <Routes>
          <Route path='/' element={<MainPage />} />
          <Route path='/category/:categoryId' element={<CategoryPage />} />
        </Routes>

        {breakpoint !== 'desktop' && (
          <SidebarHandle className='absolute inset-y-0 left-4 my-auto' />
        )}
      </div>
    </div>
  )
}

export default App
