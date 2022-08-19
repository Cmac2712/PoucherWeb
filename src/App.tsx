import { useEffect } from 'react'
import './app.css'
import { Bookmarks } from './components/Bookmarks'
import { Sidebar } from './components/Sidebar'

function App() {

  return (
    <div className='flex bg-gray-50'>
        <Sidebar />
        <div className='h-screen overflow-scroll'>
          <Bookmarks />
        </div>
    </div>
  )
}

export default App
