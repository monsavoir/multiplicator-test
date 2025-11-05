import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import type { JSX } from "react";
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
  const [roundTime, setRoundTime] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(roundTime);
  const [timeNow, setTimeNow] = useState(Date.now());

  function generatePairs() {
    const pairs: Array<[number, number]> = [];
    for (let i = 2; i <= 9; i++) {
      for (let j = i; j <= 9; j++) {
        pairs.push([i, j]);
      }
    }
    return shuffleArray(pairs);
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const [remainingPairs, setRemainingPairs] = useState<Array<[number, number]>>(
    () => (isClassicMode(gameMode) ? generatePairs() : [])
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

  function computeRoundTime(s: number): number {
    if (s >= 20) return 2;
    if (s >= 10) return 3;
    if (s >= 5) return 4;
    return 5;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = answer.trim();
    if (!value) return;
    const num = Number(value);
    if (Number.isNaN(num)) return;

    const isCorrect = num === correct;
    setFeedback(isCorrect);

    if (isCorrect) {
      if (isSurvieMode(gameMode)) {
        setScore((prev: number) => {
          const newScore = prev + 1;
          const newTime = computeRoundTime(newScore);
          setRoundTime(newTime);
          setSecondsLeft(newTime);
          return newScore;
        });
      } else {
        setScore((prev: number) => prev + 1);
      }
    } else if (isSurvieMode(gameMode)) {
      setWrongAttempts((prev) => prev + 1);
      setLives((prev) => {
        const newLives = Math.max(0, prev - 1);
        if (newLives === 0) setGameOver(true);
        return newLives;
      });
      setSecondsLeft(roundTime);
    }

    setAnswer("");

    if (isCorrect && !gameOver) {
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
        setA(Math.floor(Math.random() * 8) + 2);
        setB(Math.floor(Math.random() * 8) + 2);
      }
      setFeedback(null);
      if (isSurvieMode(gameMode)) setSecondsLeft(roundTime);
      if (inputRef.current) inputRef.current.focus();
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  useEffect(() => {
    if (gameOver || !isSurvieMode(gameMode)) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timeoutRef.current) return 5;
          timeoutRef.current = true;
          setFeedback(false);
          setAnswer("");
          setWrongAttempts((w) => w + 1);
          setLives((prev) => {
            const newLives = Math.max(0, prev - 1);
            if (newLives === 0) setGameOver(true);
            return newLives;
          });
          setTimeout(() => {
            setA(Math.floor(Math.random() * 8) + 2);
            setB(Math.floor(Math.random() * 8) + 2);
            setFeedback(null);
            setSecondsLeft(roundTime);
            inputRef.current?.focus();
            timeoutRef.current = false;
          }, 600);
          return roundTime;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, gameMode, roundTime]);

  return (
    <>
      {!gameOver &&
        (isSurvieMode(gameMode) ? (
          <div className="survie-panel" aria-label="Statut mode survie">
            <div
              className="timer-row"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={roundTime}
              aria-valuenow={secondsLeft}
              aria-label={`Temps restant: ${secondsLeft} secondes`}
            >
              <div className="timer-bar">
                <div
                  className={`timer-fill ${
                    secondsLeft <= 1
                      ? "warn-1"
                      : secondsLeft <= 2
                      ? "warn-2"
                      : ""
                  }`}
                  style={{ width: `${(secondsLeft / roundTime) * 100}%` }}
                />
              </div>
            </div>
            <div className="survie-header">
              <div
                className="lives-list"
                aria-label={`Vies restantes: ${lives}`}
              >
                {[...Array(lives)].map((_, i) => (
                  <img
                    key={i}
                    src="heart.png"
                    alt="vie"
                    width={22}
                    height={22}
                    style={{ opacity: 0.95 }}
                  />
                ))}
              </div>
              <div className="score-box" aria-label={`Score actuel ${score}`}>
                Score: {score}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
            Progression: {score}/{remainingPairs.length + score}
          </div>
        ))}

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
            onClick={() => window.location.reload()}
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
            aria-label={`Réponse pour ${a} fois ${b}`}
            className={
              isSurvieMode(gameMode) && feedback === false ? "input-shake" : ""
            }
            style={{
              padding: "6px 8px",
              fontSize: 16,
              width: 60,
              marginLeft: 12,
              border: `1px solid ${feedback === false ? "#ff6b6b" : "#ccc"}`,
              borderRadius: "4px",
              outline: "none",
              transition: "border-color 0.2s ease-in-out",
            }}
          />
        </form>
      )}
    </>
  );
}
