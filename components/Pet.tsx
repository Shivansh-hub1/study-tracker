"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useFetch } from "@/lib/client";
import { soundEngine } from "@/lib/sounds";

const CLICK_LINES: Record<string, string[]> = {
  pet_chick: ["cheep cheep!", "let's go!", "you got this"],
  pet_penguin: ["waddle waddle", "stay cool", "slide into focus"],
  pet_frog: ["ribbit!", "hop to it", "stay green"],
  pet_owl: ["hoo's studying?", "wise choice", "night focus"],
  pet_turtle: ["slow is fine", "steady wins", "one step at a time"],
  pet_octopus: ["8 arms, 8 subjects", "flexible day", "ink-redible"],
  pet_alien: ["beep boop", "cosmic focus", "take me to your subjects"],
  pet_ghost: ["boo!", "spooky focus", "scary productive"],
  pet_unicorn: ["sparkle time!", "magic is consistency", "believe ✨"],
  pet_phoenix: ["rise again!", "burn bright", "every day is a comeback"],
  pet_wizard: ["you shall pass!", "casting deep work", "+100 focus"],
};
const SAVE_LINES = ["GG! 🎉", "nice session!", "+XP, nice", "streak material", "logged and proud"];

export default function Pet() {
  const pathname = usePathname();
  const { data: shopData } = useFetch("/api/shop");
  const [petKey, setPetKey] = useState("");
  const [mood, setMood] = useState<"idle" | "jump" | "happy">("idle");
  const [bubble, setBubble] = useState("");

  // Re-read selection when navigating or when it changes in Settings
  useEffect(() => {
    try { setPetKey(localStorage.getItem("ff_pet") || ""); } catch {}
  }, [pathname]);

  useEffect(() => {
    const read = () => { try { setPetKey(localStorage.getItem("ff_pet") || ""); } catch {} };
    window.addEventListener("ff:flair", read);
    return () => window.removeEventListener("ff:flair", read);
  }, []);

  // Hide bubble after a moment
  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(""), 2600);
    return () => clearTimeout(t);
  }, [bubble]);

  // Celebrate whenever a session is saved anywhere in the app
  useEffect(() => {
    const onSave = () => {
      setMood("happy");
      setBubble(SAVE_LINES[Math.floor(Math.random() * SAVE_LINES.length)]);
      setTimeout(() => setMood("idle"), 1900);
    };
    window.addEventListener("ff:session-saved", onSave);
    return () => window.removeEventListener("ff:session-saved", onSave);
  }, []);

  const petItem = petKey ? (shopData?.items || []).find((i: any) => i.key === petKey && i.owned) : null;
  if (!petItem) return null;

  const poke = () => {
    soundEngine.petBoop();
    setMood("jump");
    const lines = CLICK_LINES[petKey] || ["hi!"];
    setBubble(lines[Math.floor(Math.random() * lines.length)]);
    setTimeout(() => setMood("idle"), 700);
  };

  return (
    <div className="pet-wrap no-print">
      {bubble && <div className="pet-bubble">{bubble}</div>}
      <div className={`pet ${mood}`} onClick={poke} role="button" aria-label="Your pet" title="Poke your pet">
        {petItem.icon}
      </div>
    </div>
  );
}
