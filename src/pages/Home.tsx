import Operation from '../components/Operation'
import '../App.css'
import { useState } from 'react'


export default function Home() {
    const [gameMode, setGameMode] = useState<string>('');

  return (
    <div className="flex flex-col justify-between">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          {gameMode === '' && (
              <>
              <h1>Math Quiz</h1>
              <p className="text-sm italic text-gray-600">Une lumière étrange remplit la pièce... Le crépuscule brille à travers la barrière... Il semble que ton voyage soit enfin terminé... Tu es rempli de DÉTERMINATION.</p>
          <button
            onClick={() => setGameMode('survie')}
            className="px-6 py-2 rounded-lg bg-gray-500 text-white hover:bg-grey-800 transition-colors"
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
      </main>
    </div>
  )
}