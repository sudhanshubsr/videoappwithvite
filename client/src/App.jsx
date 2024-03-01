import { Route, Routes } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import VideoAppPage from './Pages/VideoAppPage'
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/room/:roomId' element={<VideoAppPage />} />
      </Routes>
    </>
  )
}

export default App
