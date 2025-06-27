import { Route, Routes } from 'react-router-dom'
import './App.css'
import IndexPage from './pages/IndexPage'
import RegisterPage from './pages/RegisterPage'
import Layout from './Layout'
import LoginPage from './pages/LoginPage'
import axios from 'axios'
import { UserContextProvider } from './UserContext'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EventPage from './pages/EventPage'
import CreateEvent from './pages/CreateEvent'
import EventsPage from './pages/EventsPage'
import EditEventPage from './pages/EditEventPage';
import { Toaster } from 'react-hot-toast';

axios.defaults.baseURL = 'http://localhost:4000/';
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Toaster /> {/* This allows toasts to appear globally */}
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path='/createEvent' element={<CreateEvent />} />
          <Route path='/event/:id' element={<EventPage />} />
          <Route path='/events' element={<EventsPage />} />
          <Route path="/edit-event/:id" element={<EditEventPage />} />
        </Route>

        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/forgotpassword' element={<ForgotPassword />} />
        <Route path='/resetpassword' element={<ResetPassword />} />
      </Routes>
    </UserContextProvider>
  )
}

export default App
