import './App.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'
import Live from './components/Live'
import Join from './components/Join'
import PdfView from './components/PdfView'
import Draw from './components/Draw'
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

        <Route path='/draw' element={<Draw />} />


        <Route path='/live' element={<Live />} />
        <Route path='/user' element={<User />} />

        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App
