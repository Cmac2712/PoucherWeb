import logo from './logo.svg'
import './app.css'
import { Bookmarks } from './components/Bookmarks'
import { CreateBookmark } from './components/CreateBookmark'

function App() {

  return (
    <div className='bg-gray-50 p-4 h-screen'>
      <h1 className={`text-2xl text-center font-bold text-zinc-700 mb-4`}>
        App
      </h1>  

      <Bookmarks />
      <CreateBookmark />
    </div>
  )
}

export default App
