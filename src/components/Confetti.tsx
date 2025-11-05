import { useEffect, useState } from "react";
import "./Confetti.css";

export default function Confetti() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Remove the confetti after 5 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="confetti">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="confetti-piece" />
      ))}
    </div>
  );
}
