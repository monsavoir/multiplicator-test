import Rules from "./Rules";
import "../App.css";
import { useState } from "react";
import type { GameMode } from "../types/GameMode";

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>();

  return (
    <div className="flex flex-col justify-between">
      <main className="container mx-auto px-4 py-2">
        <div className="flex flex-col gap-3">
          {!gameMode && (
            <>
              <h1>Math Quiz</h1>
              <p className="text-sm italic text-gray-600">
                Une lumière étrange remplit la pièce... Le crépuscule brille à
                travers la barrière... Il semble que ton voyage soit enfin
                terminé... Tu es rempli de DÉTERMINATION.
              </p>
              <button
                onClick={() => setGameMode("classic")}
                style={{
                  padding: "8px 16px",
                  fontSize: "16px",
                  borderRadius: "4px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Classique
              </button>
              <button
                onClick={() => setGameMode("survie")}
                style={{
                  padding: "8px 16px",
                  fontSize: "16px",
                  borderRadius: "4px",
                  backgroundColor: "#af4c4cff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Survie
              </button>
            </>
          )}
          {gameMode && (
            <>
              <div className="card">
                <Rules gameMode={gameMode} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
