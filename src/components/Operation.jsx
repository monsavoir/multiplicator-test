import { useState, useRef, useEffect } from "react";
import "./Operation.css";

export default function Operation() {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);

  const [a, setA] = useState(() => Math.floor(Math.random() * 10));
  const [b, setB] = useState(() => Math.floor(Math.random() * 10));
  const correct = a * b;
  const inputRef = useRef(null);
  const timeoutRef = useRef(false);

  function handleSubmit(event) {
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
      // reset timer when correct
      setSecondsLeft(5);
    } else {
      setWrongAttempts((prev) => prev + 1); // increment wrong attempts to trigger shake

      // compute new lives and update. Use explicit value so we can react immediately
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      if (newLives === 0) {
        setGameOver(true);
      } else {
        // keep focus on the input after the remount/animation starts
        // small timeout lets the DOM update and animation begin
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 50);
        // reset timer for the next attempt/question
        setSecondsLeft(5);
      }
    }

    setAnswer("");

    if (isCorrect && !gameOver) {
      setTimeout(() => {
        setA(() => Math.floor(Math.random() * 10));
        setB(() => Math.floor(Math.random() * 10));
        setFeedback(null);
        setSecondsLeft(5);
        if (inputRef.current) inputRef.current.focus();
      }, 700);
    }
  }

  // handle countdown timer
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // avoid double-handling the same timeout (can happen in StrictMode/dev)
          if (timeoutRef.current) return 5;
          timeoutRef.current = true;
          // time's up: treat as wrong answer
          // increment wrongAttempts, lose a life, show feedback, then next question
          setWrongAttempts((w) => w + 1);
          setFeedback(false);
          setAnswer("");
          setLives((prev) => {
            const newLives = Math.max(0, prev - 1);
            if (newLives === 0) setGameOver(true);
            return newLives;
          });

          // generate next question after brief delay so user sees feedback
          setTimeout(() => {
            setA(() => Math.floor(Math.random() * 10));
            setB(() => Math.floor(Math.random() * 10));
            setFeedback(null);
            setSecondsLeft(5);
            if (inputRef.current) inputRef.current.focus();
            // allow future timeouts to be processed
            timeoutRef.current = false;
          }, 700);

          return 5; // reset timer (will be set to 5 for next question)
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
          <div className="timer-row">
            <div className="timer-bar" aria-hidden>
              <div
                className="timer-fill"
                style={{ width: `${(secondsLeft / 5) * 100}%` }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
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
                    style={{ width: "24px", height: "24px" }}
                  />
                </span>
              ))}
            </div>
            <div style={{ fontSize: 18 }}>Score: {score}</div>
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
          <h2>Game Over!</h2>
          <p>Score Final: {score}</p>
          <button
            onClick={() => {
              setLives(3);
              setWrongAttempts(0);
              setScore(0);
              setGameOver(false);
              setFeedback(null);
              setA(Math.floor(Math.random() * 10));
              setB(Math.floor(Math.random() * 10));
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
            onChange={(e) => setAnswer(e.target.value)}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            inputMode="numeric"
            type="tel"
            pattern="[0-9]*"
            aria-label={`Answer for ${a} times ${b}`}
            className={
              feedback === false
                ? "input-shake"
                : feedback === true
                ? "input-success"
                : ""
            }
            style={{
              padding: "6px 8px",
              fontSize: 16,
              width: 100,
              marginLeft: 12,
              border: "1px solid #ccc",
              borderRadius: "4px",
              outline: "none",
            }}
          />
        </form>
      )}
    </>
  );
}
