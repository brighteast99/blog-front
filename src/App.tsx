import { Route, Routes } from 'react-router-dom'
import { MainPage } from 'pages'

function App () {
  return (
    <div className='size-full'>
      <Routes>
        <Route path='/' element={<MainPage />} />
      </Routes>
    </div>
  )
}

export default App
