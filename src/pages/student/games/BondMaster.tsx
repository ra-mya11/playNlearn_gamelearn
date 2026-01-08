import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameBadge } from "@/components/ui/game-badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  Link2,
  CheckCircle,
  RotateCcw,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface BondMasterProps {
  onComplete: (score: number, maxScore: number) => void;
}

interface Atom {
  id: string;
  symbol: string;
  valence: number;
  color: string;
}

interface BondingChallenge {
  id: string;
  name: string;
  atoms: Atom[];
  correctBonds: { atomA: string; atomB: string; bondType: "single" | "double" | "triple" }[];
  bondType: "covalent" | "ionic";
  points: number;
}

const challenges: BondingChallenge[] = [
  {
    id: "1",
    name: "Water (H₂O)",
    atoms: [
      { id: "h1", symbol: "H", valence: 1, color: "bg-blue-300" },
      { id: "o", symbol: "O", valence: 2, color: "bg-red-400" },
      { id: "h2", symbol: "H", valence: 1, color: "bg-blue-300" },
    ],
    correctBonds: [
      { atomA: "h1", atomB: "o", bondType: "single" },
      { atomA: "o", atomB: "h2", bondType: "single" },
    ],
    bondType: "covalent",
    points: 50,
  },
  {
    id: "2",
    name: "Methane (CH₄)",
    atoms: [
      { id: "c", symbol: "C", valence: 4, color: "bg-gray-500" },
      { id: "h1", symbol: "H", valence: 1, color: "bg-blue-300" },
      { id: "h2", symbol: "H", valence: 1, color: "bg-blue-300" },
      { id: "h3", symbol: "H", valence: 1, color: "bg-blue-300" },
      { id: "h4", symbol: "H", valence: 1, color: "bg-blue-300" },
    ],
    correctBonds: [
      { atomA: "c", atomB: "h1", bondType: "single" },
      { atomA: "c", atomB: "h2", bondType: "single" },
      { atomA: "c", atomB: "h3", bondType: "single" },
      { atomA: "c", atomB: "h4", bondType: "single" },
    ],
    bondType: "covalent",
    points: 60,
  },
];

interface Bond {
  atomA: string;
  atomB: string;
  bondType: "single" | "double" | "triple";
}

export default function BondMaster({ onComplete }: BondMasterProps) {
  const { playCorrect, playIncorrect, playSuccess } = useSoundEffects();

  const [showTutorial, setShowTutorial] = useState(true);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null);
  const [atomStates, setAtomStates] = useState<Record<string, number>>(
    challenges[0].atoms.reduce((acc, atom) => ({ ...acc, [atom.id]: atom.valence }), {})
  );

  const challenge = challenges[currentChallenge];

  const handleAtomClick = (atomId: string) => {
    if (gameOver) return;

    if (selectedAtom === atomId) {
      setSelectedAtom(null);
      return;
    }

    if (selectedAtom) {
      // Try to bond the selected atom with this atom
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const atom1 = challenge.atoms.find(a => a.id === selectedAtom)!;
      const atomMsg = `Bonding ${atom1.symbol} with...`; // Used for debug if needed

      // Check if bond is possible (both atoms have available valence)
      if (atomStates[selectedAtom] > 0 && atomStates[atomId] > 0) {
        const newBonds = [...bonds, { atomA: selectedAtom, atomB: atomId, bondType: "single" as const }];
        setBonds(newBonds);

        // Update valence states
        const newStates = { ...atomStates };
        newStates[selectedAtom] -= 1;
        newStates[atomId] -= 1;
        setAtomStates(newStates);

        playCorrect();
        toast({ title: "🔗 Bond formed!", description: "Atoms connected!", className: "bg-green-500 text-white" });
        setSelectedAtom(null);

        // Check if complete
        setTimeout(() => checkMoleculeComplete(newBonds), 500);
      } else {
        playIncorrect();
        toast({
          title: "Can't bond",
          description: "One or both atoms have no available valence.",
          variant: "destructive",
        });
      }
    } else {
      setSelectedAtom(atomId);
    }
  };

  const checkMoleculeComplete = (currentBonds: Bond[]) => {
    // Check if all atoms have their valence satisfied
    const allSatisfied = challenge.atoms.every(atom => {
      const bondCount = currentBonds.filter(b => b.atomA === atom.id || b.atomB === atom.id).length;
      return bondCount === atom.valence;
    });

    if (allSatisfied && currentBonds.length >= challenge.correctBonds.length) {
      handleChallengeComplete();
    }
  };

  const handleChallengeComplete = () => {
    playSuccess();
    const newScore = score + challenge.points;
    setScore(newScore);
    setChallengesCompleted(challengesCompleted + 1);

    toast({
      title: "🎉 Molecule Complete!",
      description: `${challenge.name} is stable! +${challenge.points} points`,
      className: "bg-green-500 text-white border-none"
    });

    if (currentChallenge < challenges.length - 1) {
      setTimeout(() => {
        const nextChallenge = challenges[currentChallenge + 1];
        setCurrentChallenge(currentChallenge + 1);
        setBonds([]);
        setSelectedAtom(null);
        setAtomStates(
          nextChallenge.atoms.reduce((acc, atom) => ({ ...acc, [atom.id]: atom.valence }), {})
        );
      }, 1500);
    } else {
      handleWin(newScore);
    }
  };

  const handleWin = (finalScore: number) => {
    setGameOver(true);
    setTimeout(() => {
      const maxScore = challenges.reduce((acc, c) => acc + c.points, 0);
      onComplete(finalScore, maxScore);
    }, 1500);
  };

  const resetChallenge = () => {
    setBonds([]);
    setSelectedAtom(null);
    setAtomStates(
      challenge.atoms.reduce((acc, atom) => ({ ...acc, [atom.id]: atom.valence }), {})
    );
  };

  if (gameOver) {
    return <div className="p-8 text-center">Completing Bonding...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Helper Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>{/* Spacer */}</div>
        <GameBadge variant="accent" size="sm">
          Score: {score}
        </GameBadge>
      </div>

      {/* Start Popup */}
      {showTutorial && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 slide-up">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">📘 Bond Master</h4>
              <div className="text-sm space-y-2 mb-3">
                <p><strong>What You'll Discover:</strong> Why atoms bond with each other</p>
                <p><strong>What You Need To Do:</strong> Click atoms to bond them together. Each atom needs to satisfy its valence.</p>
                <p><strong>What Success Looks Like:</strong> A stable molecule where all atoms are bonded! 🔗</p>
              </div>
              <Button size="sm" onClick={() => setShowTutorial(false)}>
                Start Bonding! 🚀
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "50ms" }}>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Link2 className="mx-auto mb-1 h-5 w-5 text-secondary" />
          <p className="font-heading text-lg font-bold">{score}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <CheckCircle className="mx-auto mb-1 h-5 w-5 text-secondary" />
          <p className="font-heading text-lg font-bold">{challengesCompleted}/{challenges.length}</p>
          <p className="text-xs text-muted-foreground">Molecules</p>
        </div>
      </div>

      {/* Challenge Info */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-heading font-semibold text-lg">{challenge.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {challenge.bondType === "covalent" ? "⚛️ Covalent Bonding" : "🔌 Ionic Bonding"}
            </p>
          </div>
          <GameBadge variant="accent" size="sm">
            +{challenge.points} 🪙
          </GameBadge>
        </div>
      </div>

      {/* Molecule Builder */}
      <div className="mb-4 rounded-xl border border-border bg-card p-6 slide-up" style={{ animationDelay: "150ms" }}>
        <h4 className="mb-6 font-heading font-semibold text-center">Build the Molecule</h4>

        <div className="relative mb-6">
          <div className="flex flex-wrap gap-4 justify-center items-center md:gap-6 lg:gap-8">
            {challenge.atoms.map((atom) => (
              <button
                key={atom.id}
                onClick={() => handleAtomClick(atom.id)}
                className={cn(
                  "relative transition-all duration-300",
                  selectedAtom === atom.id && "scale-125"
                )}
              >
                <div className={cn(
                  "h-24 w-24 rounded-full flex flex-col items-center justify-center text-white font-bold cursor-pointer transition-all hover:scale-110 active:scale-95",
                  atom.color,
                  selectedAtom === atom.id && "ring-4 ring-yellow-300 scale-110"
                )}>
                  <span className="text-3xl">{atom.symbol}</span>
                  <span className="text-xs mt-1">v:{atomStates[atom.id]}</span>
                </div>

                {/* Valence electrons indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {Array.from({ length: atom.valence }).map((_, i) => {
                    const angle = (360 / atom.valence) * i;
                    const x = Math.cos((angle * Math.PI) / 180) * 35;
                    const y = Math.sin((angle * Math.PI) / 180) * 35;
                    return (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      />
                    );
                  })}
                </div>
              </button>
            ))}
          </div>

          {/* Bond visualization */}
          {bonds.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Bonds formed: {bonds.length}/{challenge.correctBonds.length}</p>
              <div className="space-y-1">
                {bonds.map((bond, idx) => {
                  const atom1 = challenge.atoms.find(a => a.id === bond.atomA);
                  const atom2 = challenge.atoms.find(a => a.id === bond.atomB);
                  return (
                    <p key={idx} className="text-sm text-muted-foreground">
                      🔗 {atom1?.symbol} - {atom2?.symbol}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            {selectedAtom ? "Click another atom to bond" : "Click an atom to start"}
          </p>
          <Button
            onClick={resetChallenge}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 p-4 slide-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold mb-1">💡 Tip:</p>
            <p className="text-muted-foreground">
              Each atom has a valence (v). When valence reaches 0, the atom is satisfied!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
