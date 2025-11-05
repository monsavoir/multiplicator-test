import { useState, type JSX } from "react";
import Operation from "../components/Operation";
import type { GameMode } from "../types/GameMode";

interface RulesProps {
  gameMode: GameMode;
}

export default function Rules({ gameMode }: RulesProps): JSX.Element {
  const [play, setPlay] = useState(false);

  return (
    <div className="flex flex-col justify-between align-items-flex-start">
      <main
        className={`container mx-auto ${
          play
            ? "min-h-screen flex flex-col justify-start overflow-hidden pt-8"
            : ""
        }`}
        style={play ? { touchAction: "none" } : undefined}
      >
        {!play && (
          <div className="flex flex-col gap-4">
            <h1>Règles du jeu</h1>
            {gameMode === "classic" && (
              <>
                <p>
                  Dans ce mode, le but est de répondre le plus rapidement
                  possible à chaque question. Toutes les combinaisons
                  n'apparaitront qu'une fois.
                </p>
              </>
            )}
            {gameMode === "survie" && (
              <>
                <p>
                  Dans ce mode, les questions sont infinies. Vous commencez avec
                  3 vies et perdez une vie à chaque mauvaise réponse. Le jeu se
                  termine lorsque vous n'avez plus de vies.
                </p>
              </>
            )}
            <button
              onClick={() => setPlay(true)}
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
              Démarrer le jeu
            </button>
          </div>
        )}
        {play && <Operation gameMode={gameMode} />}
      </main>
    </div>
  );
}
