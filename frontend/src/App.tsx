import './App.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Live from './components/Live'
import Join from './components/Join'
import PdfView from './components/PdfView'
import User from './components/User'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/**/}
        {/* <Route path='/' element={<Home />} />  */}
        {/**/}
        <Route path='/' element={<Join />} />
        <Route path='/doc' element={<PdfView />} />




        <Route path='/live' element={<Live />} />
        <Route path='/user' element={<User />} />


      </Routes>
    </BrowserRouter>
  )
}


export default App
