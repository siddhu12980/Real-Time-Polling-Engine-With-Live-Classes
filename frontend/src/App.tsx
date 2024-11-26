import './App.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Join from './components/Join'
import PdfView from './components/PdfView'
import Videolayout from './components/Videolayout'
import Home from './components/Home'
import VideoUserLayout from './components/VideoUserLayout'

import { RecoilRoot } from 'recoil';

function App() {
  return (

    <RecoilRoot>

      < BrowserRouter >
        <Routes>
          <Route path='/' element={<Join />} />
          <Route path='/home' element={<Home />} />
          <Route path='/video-admin/:roomId' element={<Videolayout />} />
          <Route path='/video-user/:roomId' element={<VideoUserLayout />} />

        </Routes>
      </BrowserRouter >


    </RecoilRoot>

  )
}

export default App

