import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RegistrationForm from './components/RegistrationForm'
import Admin from './Admin'
import ScorePage from './ScorePage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/score" element={<ScorePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App