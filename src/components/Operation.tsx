import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
  type JSX,
} from "react";
import "./Operation.css";
import Confetti from "./Confetti";
import type { GameMode } from "../types/GameMode";

interface OperationProps {
  gameMode: GameMode;
}

function isClassicMode(mode: GameMode): mode is "classic" {
  return mode === "classic";
}

function isSurvieMode(mode: GameMode): mode is "survie" {
  return mode === "survie";
}

export default function Operation({ gameMode }: OperationProps): JSX.Element {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [timeNow, setTimeNow] = useState(Date.now());

  // Function to generate all possible pairs and shuffle them
  function generatePairs() {
    const pairs: Array<[number, number]> = [];
    for (let i = 2; i <= 3; i++) {
      for (let j = i; j <= 3; j++) {
        pairs.push([i, j]);
      }
    }
    console.log("Generated pairs:", pairs);
    console.log(pairs.length);
    return shuffleArray(pairs);
  }

  // Fisher-Yates shuffle algorithm
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const [remainingPairs, setRemainingPairs] = useState<Array<[number, number]>>(
    () => {
      if (isClassicMode(gameMode)) {
        return generatePairs();
      }
      return [];
    }
  );

  const [a, setA] = useState(() => {
    if (isClassicMode(gameMode) && remainingPairs.length > 0) {
      return remainingPairs[0][0];
    }
    return isSurvieMode(gameMode) ? Math.floor(Math.random() * 8) + 2 : 0;
  });

  const [b, setB] = useState(() => {
    if (isClassicMode(gameMode) && remainingPairs.length > 0) {
      return remainingPairs[0][1];
    }
    return isSurvieMode(gameMode) ? Math.floor(Math.random() * 8) + 2 : 0;
  });

  const correct = a * b;

  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = answer.trim();
    if (value === "") {
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      return;
    }

    const isCorrect = num === correct;
    setFeedback(isCorrect);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (isSurvieMode(gameMode)) {
        setSecondsLeft(5);
      }
    } else {
      if (isSurvieMode(gameMode)) {
        setWrongAttempts((prev) => prev + 1);
        const newLives = Math.max(0, lives - 1);
        setLives(newLives);
        if (newLives === 0) {
          setGameOver(true);
        }
        setSecondsLeft(5);
      }
      // Reset focus regardless of mode
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }

    setAnswer("");

    if (isCorrect && !gameOver) {
      if (isClassicMode(gameMode)) {
        // Remove the current pair and get the next one
        const newPairs = remainingPairs.slice(1);
        setRemainingPairs(newPairs);

        // If we've used all pairs, game is complete
        if (newPairs.length === 0) {
          setGameOver(true);
          return;
        }

        // Set the next pair
        setA(newPairs[0][0]);
        setB(newPairs[0][1]);
      } else {
        // Survival mode random numbers
        setA(() => Math.floor(Math.random() * 8) + 2);
        setB(() => Math.floor(Math.random() * 8) + 2);
      }
      setFeedback(null);
      setSecondsLeft(5);
      if (inputRef.current) inputRef.current.focus();
    }
  }

  // handle countdown timer
  useEffect(() => {
    if (gameOver || gameMode !== "survie") return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timeoutRef.current) return 5;
          timeoutRef.current = true;
          setFeedback(false);
          setAnswer("");

          if (isSurvieMode(gameMode)) {
            setWrongAttempts((w) => w + 1);
            setLives((prev) => {
              const newLives = Math.max(0, prev - 1);
              if (newLives === 0) setGameOver(true);
              return newLives;
            });
          }

          setTimeout(() => {
            if (isClassicMode(gameMode)) {
              const newPairs = remainingPairs.slice(1);
              setRemainingPairs(newPairs);

              if (newPairs.length === 0) {
                setGameOver(true);
                return;
              }

              setA(newPairs[0][0]);
              setB(newPairs[0][1]);
            } else {
              setA(() => Math.floor(Math.random() * 8) + 2);
              setB(() => Math.floor(Math.random() * 8) + 2);
            }
            setFeedback(null);
            setSecondsLeft(5);
            if (inputRef.current) inputRef.current.focus();
            timeoutRef.current = false;
          }, 700);

          return 5;
        }

        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  return (
    <>
      {!gameOver && (
        <>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {isSurvieMode(gameMode) && (
              <>
                <div className="timer-row">
                  <div className="timer-bar" aria-hidden>
                    <div
                      className="timer-fill"
                      style={{ width: `${(secondsLeft / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[...Array(3 - wrongAttempts)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        color: i < lives ? "red" : "#ccc",
                        fontSize: "24px",
                      }}
                    >
                      <img
                        src="heart.png"
                        alt="heart"
                        style={{ width: "20px", height: "20px" }}
                      />
                    </span>
                  ))}
                </div>
              </>
            )}
            <div style={{ fontSize: 18 }}>
              {isClassicMode(gameMode)
                ? `Restant: ${score}/${remainingPairs.length + score}`
                : `Score: ${score}`}
            </div>
          </div>
        </>
      )}

      {gameOver ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            border: "2px solid #ccc",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {isClassicMode(gameMode) && remainingPairs.length === 0 ? (
            <>
              <Confetti />
              <h2 className="text-2xl font-bold mb-4">
                Félicitations! Tu as complété le mode Classique! 🎉
              </h2>
              <p className="text-lg mb-4">
                Tu as mis : {Math.round((Date.now() - timeNow) / 100) / 10}{" "}
                secondes
              </p>
            </>
          ) : (
            <>
              <h2>Game Over!</h2>
              <p>Score Final: {score}</p>
            </>
          )}

          <button
            onClick={() => {
              setLives(3);
              setWrongAttempts(0);
              setScore(0);
              setGameOver(false);
              setFeedback(null);
              setTimeNow(Date.now());

              if (isClassicMode(gameMode)) {
                const newPairs = generatePairs();
                setRemainingPairs(newPairs);
                setA(newPairs[0][0]);
                setB(newPairs[0][1]);
              } else {
                setA(Math.floor(Math.random() * 8) + 2);
                setB(Math.floor(Math.random() * 8) + 2);
              }
            }}
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
            Rejouer
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              borderRadius: "4px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Retour au menu
          </button>
        </div>
      ) : (
        <div>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <span style={{ fontSize: 18 }}>
              {a} × {b} =
            </span>

            <input
              key={`input-${wrongAttempts}`}
              name="answer"
              value={answer}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAnswer(e.target.value)
              }
              ref={inputRef}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(e as any as FormEvent<HTMLFormElement>);
                }
              }}
              inputMode="numeric"
              type="tel"
              pattern="[0-9]*"
              aria-label={`Answer for ${a} times ${b}`}
              className={
                gameMode === "survie" && feedback === false ? "input-shake" : ""
              }
              style={{
                padding: "6px 8px",
                fontSize: 16,
                width: 100,
                marginLeft: 12,
                border: `1px solid ${feedback === false ? "#ff6b6b" : "#ccc"}`,
                borderRadius: "4px",
                outline: "none",
                transition: "border-color 0.2s ease-in-out",
              }}
            />
          </form>
        </div>
      )}
    </>
  );
}
