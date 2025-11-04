import Operation from '../components/Operation'
import '../App.css'
import { useState } from 'react'

export default function Home() {
    const [gameMode, setGameMode] = useState<string>('');

  return (
    <>
      
      <div className="flex flex-col gap-4">
        {gameMode === '' && (
            <>
            <h1>Math Quiz</h1>
        <button
          onClick={() => setGameMode('survie')}
          className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Survie
        </button>
        </>
        )}
        {gameMode === 'survie' && (
            <>
        <div className="card">
            <Operation />
        </div>
        </>)}
      </div>
    </>
  )
}