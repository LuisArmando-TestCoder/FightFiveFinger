"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MiniKit } from "@worldcoin/minikit-js";
import Lobby from "@/components/game/Lobby";
import Training from "@/components/game/Training";
import Match from "@/components/game/Match";
import Challenge from "@/components/game/Challenge";
import ScreenTransition from "@/components/ui/ScreenTransition";

type Screen = 'lobby' | 'training' | 'match' | 'results' | 'challenge';

export default function Home() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('lobby');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check for a room_id in the URL to handle challenges
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');
    if (roomId) {
      console.log(`Joining room: ${roomId}`);
      // We need to be logged in to join a match
      if (userAddress) {
        setScreen('match');
      } else {
        // If not logged in, we could potentially store the room ID
        // and redirect after login, but for now we'll just log it.
        console.log("User must log in to join the match.");
      }
    }
  }, [userAddress]); // Rerun this effect if the user logs in

  const signInWithWallet = async () => {
    if (isMounted && !MiniKit.isInstalled()) {
      alert("Please open this app in the World App to sign in.");
      return;
    }

    try {
      // 1. Get nonce from the server
      const nonceRes = await fetch(`/api/nonce`);
      if (!nonceRes.ok) throw new Error("Failed to get nonce.");
      const { nonce } = await nonceRes.json();

      // 2. Prompt user to sign the message via World App
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        statement: "Sign in to World Click Fight",
      });

      if (finalPayload.status === "error") {
        console.error("Wallet auth error payload:", finalPayload);
        throw new Error("Wallet authentication failed. Please try again.");
      }

      // 3. Send the signed payload to the server for verification
      const verifyRes = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.message || "Verification failed.");
      }

      const { isValid } = await verifyRes.json();

      if (isValid) {
        console.log("Authentication successful!");
        setUserAddress(finalPayload.address);
      } else {
        throw new Error("SIWE verification returned invalid.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert(`Sign-in failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const renderScreen = () => {
    if (!userAddress) return null;

    // The key prop is crucial for AnimatePresence to detect when a component changes.
    switch (screen) {
      case 'training':
        return <ScreenTransition key="training"><Training setScreen={setScreen} /></ScreenTransition>;
      case 'match':
        return <ScreenTransition key="match"><Match setScreen={setScreen} /></ScreenTransition>;
      case 'challenge':
        return <ScreenTransition key="challenge"><Challenge setScreen={setScreen} /></ScreenTransition>;
      case 'lobby':
      default:
        return <ScreenTransition key="lobby"><Lobby userAddress={userAddress} setScreen={setScreen} /></ScreenTransition>;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-12 md:p-24 gap-y-4 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">World Click Fight</h1>
      {userAddress ? (
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          onClick={signInWithWallet}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Enter with World ID
        </motion.button>
      )}
    </main>
  );
}
