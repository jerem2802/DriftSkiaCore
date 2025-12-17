// src/game/hooks/useShieldSystem.ts
// Système de bouclier Safe Miss – 100 % Reanimated (pas d'état React)
// + Fly-to-BottomPanel (même pattern que coin, easing linéaire)

import {
  useDerivedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import type { GameState } from './useGameState';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/gameplay';

const SHIELD_ORB_OFFSET = -Math.PI / 2;
const MAX_CHARGES = 3;
const PICKUP_DIST = 625;

// --- BottomPanel layout (doit matcher src/components/BottomPanel.tsx)
const BTN_SIZE = 76;
const BTN_RADIUS = BTN_SIZE / 2;
const BTN_GAP = 24;
const PANEL_BOTTOM_OFFSET = 100;

// --- "curseur" vitesse fly
const SHIELD_FLY_DURATION_MS = 950;

interface UseShieldSystemParams {
  gameState: GameState;
}

const resolveShieldTargetX = (hasAutoPlayVisible: boolean) => {
  'worklet';
  // Si AutoPlay visible -> 2 boutons centrés, Shield = bouton de droite
  if (hasAutoPlayVisible) {
    const rowW = BTN_SIZE + BTN_GAP + BTN_SIZE;
    const left = (CANVAS_WIDTH - rowW) / 2;
    return left + BTN_SIZE + BTN_GAP + BTN_RADIUS;
  }

  // Sinon Shield seul -> centré
  const left = (CANVAS_WIDTH - BTN_SIZE) / 2;
  return left + BTN_RADIUS;
};

const resolveShieldTargetY = () => {
  'worklet';
  // container bottom:100, bouton 76px => centre = H - 100 - 38
  return CANVAS_HEIGHT - PANEL_BOTTOM_OFFSET - BTN_RADIUS;
};

export const useShieldSystem = ({ gameState }: UseShieldSystemParams) => {
  // 0 = attached (sur ring), 1 = flying (vers BottomPanel)
  const flying = useSharedValue(0);
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);

  // Visible : orbe spawn (si pas full) OU en vol
  const shieldOrbVisible = useDerivedValue(() => {
    const isFull = gameState.shieldChargesLeft.value >= MAX_CHARGES;
    if (flying.value === 1) return 1;
    return gameState.currentHasShield.value && !isFull ? 1 : 0;
  });

  const shieldOrbAngle = useDerivedValue(
    () => gameState.gateAngle.value + SHIELD_ORB_OFFSET
  );

  // Position attachée (sur le ring)
  const attachedX = useDerivedValue(
    () =>
      gameState.currentX.value +
      gameState.currentR.value * Math.cos(shieldOrbAngle.value)
  );

  const attachedY = useDerivedValue(
    () =>
      gameState.currentY.value +
      gameState.currentR.value * Math.sin(shieldOrbAngle.value)
  );

  // Position rendue : attachée OU vol
  const shieldOrbX = useDerivedValue(() => (flying.value === 1 ? flyX.value : attachedX.value));
  const shieldOrbY = useDerivedValue(() => (flying.value === 1 ? flyY.value : attachedY.value));

  // Halo autour de la bille quand bouclier armé
  const shieldHaloVisible = useDerivedValue(() => (gameState.shieldArmed.value ? 1 : 0));

  // Charges affichées (3 points)
  const shieldCharge1Visible = useDerivedValue(() => (gameState.shieldChargesLeft.value >= 1 ? 1 : 0.2));
  const shieldCharge2Visible = useDerivedValue(() => (gameState.shieldChargesLeft.value >= 2 ? 1 : 0.2));
  const shieldCharge3Visible = useDerivedValue(() => (gameState.shieldChargesLeft.value >= 3 ? 1 : 0.2));

  // Sync robuste : shieldAvailable reflète TOUJOURS chargesLeft
  useAnimatedReaction(
    () => gameState.shieldChargesLeft.value,
    (charges) => {
      'worklet';
      const hasAny = charges > 0;

      gameState.shieldAvailable.value = hasAny;

      if (!hasAny && gameState.shieldArmed.value) {
        gameState.shieldArmed.value = false;
      }
    }
  );

  // Cleanup dur si game over / restart (évite orbe qui reste dans le vide)
  useAnimatedReaction(
    () => gameState.alive.value,
    (alive, prevAlive) => {
      'worklet';
      if (alive === prevAlive) return;

      // à chaque transition, on neutralise un vol en cours
      cancelAnimation(flyX);
      cancelAnimation(flyY);
      flying.value = 0;

      if (!alive) {
        gameState.currentHasShield.value = false;
      }
    }
  );

  // Pickup + fly
  useAnimatedReaction(
    () => ({
      hasShieldOrb: gameState.currentHasShield.value,
      bx: gameState.ballX.value,
      by: gameState.ballY.value,
      cx: gameState.currentX.value,
      cy: gameState.currentY.value,
      r: gameState.currentR.value,
      gateAngle: gameState.gateAngle.value,
      charges: gameState.shieldChargesLeft.value,
      flying: flying.value,
      alive: gameState.alive.value,

      // layout BottomPanel (même logique que le composant)
      hasAutoPlayVisible: gameState.autoPlayInInventory.value || gameState.autoPlayActive.value,
    }),
    (s) => {
      'worklet';
      if (!s.alive) return;
      if (!s.hasShieldOrb) return;
      if (s.flying === 1) return;

      // Si full, on ne propose pas l'orbe
      if (s.charges >= MAX_CHARGES) {
        gameState.currentHasShield.value = false;
        return;
      }

      // Position exacte de l'orbe sur le ring (source de vérité)
      const orbAngle = s.gateAngle + SHIELD_ORB_OFFSET;
      const orbX = s.cx + s.r * Math.cos(orbAngle);
      const orbY = s.cy + s.r * Math.sin(orbAngle);

      const dx = s.bx - orbX;
      const dy = s.by - orbY;
      const distSq = dx * dx + dy * dy;
      if (distSq > PICKUP_DIST) return;

      // --- pickup logique immédiat (pas de délai gameplay)
      gameState.currentHasShield.value = false;
      const newCharges = Math.min(MAX_CHARGES, s.charges + 1);
      gameState.shieldChargesLeft.value = newCharges;
      // shieldAvailable sera sync par la réaction chargesLeft

      // --- fly visuel vers BottomPanel
      flying.value = 1;
      flyX.value = orbX;
      flyY.value = orbY;

      const tx = resolveShieldTargetX(s.hasAutoPlayVisible);
      const ty = resolveShieldTargetY();

      flyX.value = withTiming(
        tx,
        { duration: SHIELD_FLY_DURATION_MS, easing: Easing.linear },
        (finished) => {
          if (!finished) return;
          flying.value = 0;
        }
      );

      flyY.value = withTiming(ty, { duration: SHIELD_FLY_DURATION_MS, easing: Easing.linear });
    }
  );

  const onActivateShield = () => {
    'worklet';
    if (gameState.shieldArmed.value) return;
    if (gameState.shieldChargesLeft.value <= 0) return;
    if (!gameState.shieldAvailable.value) return;

    gameState.shieldArmed.value = true;
  };

  return {
    shieldOrbVisible,
    shieldOrbX,
    shieldOrbY,
    shieldHaloVisible,
    shieldCharge1Visible,
    shieldCharge2Visible,
    shieldCharge3Visible,
    onActivateShield,
  };
};
