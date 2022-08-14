import { useEffect } from 'react'
import './app.css'
import { Bookmarks } from './components/Bookmarks'
import { Sidebar } from './components/Sidebar'

function App() {

  return (
    <div className='bg-gray-50'>
      <Sidebar />
      <Bookmarks />
    </div>
  )
}

export default App
