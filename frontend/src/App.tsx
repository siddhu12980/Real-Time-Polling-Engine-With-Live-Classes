import './App.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Live from './components/Live'
import Join from './components/Join'
import PdfView from './components/PdfView'
import User from './components/User'
import Videolayout from './components/Videolayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/**/}
        {/* <Route path='/' element={<Home />} />  */}
        {/**/}
        <Route path='/' element={<Join />} />
        <Route path='/doc' element={<PdfView />} />
        <Route path='/layout' element={<Videolayout />} />

        <Route path='/live' element={<Videolayout />} />
        <Route path='/user' element={<User />} />


      </Routes>
    </BrowserRouter>
  )
}


export default App
