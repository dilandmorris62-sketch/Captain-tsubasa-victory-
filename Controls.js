here// Controls Manager - Gestor de Controles
class Controls {
    constructor(game) {
        this.game = game;
        this.setupKeyboard();
        this.setupTouch();
        this.setupButtons();
    }
    
    setupKeyboard() {
        // Teclado
        window.addEventListener('keydown', (e) => {
            this.game.keys[e.key] = true;
            
            // Disparar con espacio
            if (e.key === ' ' && this.game.userPlayer) {
                this.game.shootBall(this.game.userPlayer, 1, 0);
            }
            
            // Pasar con 'p'
            if (e.key === 'p' && this.game.userPlayer) {
                this.game.passBall(this.game.userPlayer);
            }
            
            // Tiro especial con 'e'
            if (e.key === 'e' && this.game.userPlayer && this.game.userPlayer.specialCharge >= 100) {
                this.game.shootBall(this.game.userPlayer, 1.5, 0);
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.game.keys[e.key] = false;
        });
    }
    
    setupTouch() {
        const joystick = document.getElementById('move-joystick');
        const joystickHandle = joystick.querySelector('.joystick');
        let touchId = null;
        let startX = 0, startY = 0;
        
        // Iniciar touch
        joystick.addEventListener('touchstart', (e) => {
            if (touchId === null) {
                const touch = e.touches[0];
                touchId = touch.identifier;
                startX = touch.clientX;
                startY = touch.clientY;
                this.game.touch.active = true;
                
                // Mover joystick visual
                joystickHandle.style.transform = 'translate(0, 0)';
            }
        }, { passive: true });
        
        // Mover joystick
        joystick.addEventListener('touchmove', (e) => {
            if (!this.game.touch.active) return;
            
            for (let touch of e.touches) {
                if (touch.identifier === touchId) {
                    const deltaX = touch.clientX - startX;
                    const deltaY = touch.clientY - startY;
                    
                    // Limitar movimiento del joystick
                    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    const maxDistance = 50;
                    
                    let moveX = deltaX;
                    let moveY = deltaY;
                    
                    if (distance > maxDistance) {
                        moveX = (deltaX / distance) * maxDistance;
                        moveY = (deltaY / distance) * maxDistance;
                    }
                    
                    // Actualizar posición visual
                    joystickHandle.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    
                    // Normalizar para movimiento del jugador
                    this.game.touch.x = moveX / maxDistance;
                    this.game.touch.y = moveY / maxDistance;
                    
                    break;
                }
            }
        }, { passive: true });
        
        // Terminar touch
        joystick.addEventListener('touchend', (e) => {
            for (let touch of e.changedTouches) {
                if (touch.identifier === touchId) {
                    touchId = null;
                    this.game.touch.active = false;
                    this.game.touch.x = 0;
                    this.game.touch.y = 0;
                    
                    // Resetear joystick visual
                    joystickHandle.style.transform = 'translate(0, 0)';
                    break;
                }
            }
        }, { passive: true });
    }
    
    setupButtons() {
        // Botón de disparo
        document.querySelector('.action.shoot').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.game.userPlayer) {
                this.game.shootBall(this.game.userPlayer, 1, 0);
            }
        }, { passive: false });
        
        // Botón de pase
        document.querySelector('.action.pass').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.game.userPlayer) {
                this.game.passBall(this.game.userPlayer);
            }
        }, { passive: false });
        
        // Botón de tiro especial
        document.querySelector('.action.special').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.game.userPlayer && this.game.userPlayer.specialCharge >= 100) {
                this.game.shootBall(this.game.userPlayer, 1.5, 0);
            }
        }, { passive: false });
        
        // Prevenir zoom con doble tap
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Prevenir scroll
        document.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('joystick-area') || 
                e.target.classList.contains('action')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
                }
