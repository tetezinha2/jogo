@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* {
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  margin: 0;
  padding: 0;
}

body {
  background-color: #0b0908;
  color: #fff;
  font-family: 'Press Start 2P', monospace, cursive;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

#game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 640px;
  padding: 10px;
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  background-color: #1a1c23;
  border: 4px solid #3a3f58;
  padding: 10px;
  font-size: 10px;
  margin-bottom: 8px;
  box-shadow: 0 4px 0 #000;
}

.hud-item {
  color: #fbf5ef;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 4px solid #3a3f58;
  box-shadow: 0 8px 0 #000;
  background: #000;
  overflow: hidden;
}

/* Efeito CRT Retro e Scanlines */
.canvas-wrapper::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 2;
}

canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: block;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 9, 8, 0.88);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 3;
  padding: 20px;
  text-align: center;
}

.overlay h1 {
  font-size: 16px;
  color: #f2e200;
  margin-bottom: 16px;
  text-shadow: 2px 2px #ac3232;
}

.overlay p {
  font-size: 9px;
  color: #c0cbd1;
  margin-bottom: 24px;
  line-height: 1.6;
}

button#start-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  padding: 12px 20px;
  background-color: #6abe30;
  color: #000;
  border: none;
  border-bottom: 4px solid #37946e;
  cursor: pointer;
  box-shadow: 0 4px 0 #000;
}

button#start-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #000;
}

/* Controles de Toque para Mobile */
#controls {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  touch-action: manipulation;
}

.dpad, .actions {
  display: flex;
  gap: 10px;
}

.btn {
  width: 50px;
  height: 50px;
  background-color: #2c354d;
  color: #fff;
  border: 3px solid #5a6988;
  border-radius: 8px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 0 #000;
}

.btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #000;
  background-color: #4b5d88;
}

.btn-red {
  background-color: #ac3232;
  border-color: #d95763;
}

.btn-blue {
  background-color: #306082;
  border-color: #639bff;
}

/* Esconder botões em telas grandes se preferir ou mantê-los para testes */
@media (min-width: 768px) {
  #controls {
    display: flex; /* Mantenha 'none' se quiser ocultar no PC */
  }
}
