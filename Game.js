here// Game Engine - Motor del Juego
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Estado del juego
        this.state = {
            running: false,
            paused: false,
            time: 0,
            maxTime: 300, // 5 minutos en segundos
            score: { nankatsu: 0, toho: 0 },
            possession: { nankatsu: 0, toho: 0 }
        };
        
        // Jugadores
        this.players = [];
        this.ball = null;
        this.selectedTeam = 'nankatsu';
        this.userPlayer = null;
        
        // Física
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Controles
        this.keys = {};
        this.touch = { x: 0, y: 0, active: false };
        
        this.init();
    }
    
    init() {
        console.log('🎮 Inicializando juego...');
        
        // Crear campo
        this.createField();
        
        // Crear jugadores
        this.createPlayers();
        
        // Crear balón
        this.createBall();
        
        // Iniciar bucle del juego
        this.start();
    }
    
    createField() {
        // Configuración del campo
        this.field = {
            width: this.width,
            height: this.height,
            centerX: this.width / 2,
            centerY: this.height / 2,
            goalWidth: 100,
            goalHeight: 200,
            lineWidth: 4,
            grassColor: '#2E7D32',
            lineColor: '#FFFFFF'
        };
    }
    
    createPlayers() {
        this.players = [];
        
        // Jugadores Nankatsu (rojo)
        const nankatsuPlayers = [
            { x: 100, y: this.height/2, number: 10, name: 'Tsubasa', team: 'nankatsu', color: '#FF6B6B' },
            { x: 150, y: this.height/2 - 100, number: 1, name: 'Wakabayashi', team: 'nankatsu', color: '#FF6B6B' },
            { x: 150, y: this.height/2 + 100, number: 9, name: 'Hyuga', team: 'nankatsu', color: '#FF6B6B' },
            { x: 200, y: this.height/2 - 50, number: 11, name: 'Misaki', team: 'nankatsu', color: '#FF6B6B' },
            { x: 200, y: this.height/2 + 50, number: 2, name: 'Ishizaki', team: 'nankatsu', color: '#FF6B6B' }
        ];
        
        // Jugadores Toho (verde)
        const tohoPlayers = [
            { x: this.width - 100, y: this.height/2, number: 1, name: 'Wakashimazu', team: 'toho', color: '#4ECDC4' },
            { x: this.width - 150, y: this.height/2 - 100, number: 6, name: 'Misugi', team: 'toho', color: '#4ECDC4' },
            { x: this.width - 150, y: this.height/2 + 100, number: 5, name: 'Takasugi', team: 'toho', color: '#4ECDC4' },
            { x: this.width - 200, y: this.height/2 - 50, number: 8, name: 'Izawa', team: 'toho', color: '#4ECDC4' },
            { x: this.width - 200, y: this.height/2 + 50, number: 7, name: 'Kisugi', team: 'toho', color: '#4ECDC4' }
        ];
        
        // Crear todos los jugadores
        [...nankatsuPlayers, ...tohoPlayers].forEach(playerData => {
            const player = {
                x: playerData.x,
                y: playerData.y,
                vx: 0,
                vy: 0,
                radius: 20,
                speed: 2,
                number: playerData.number,
                name: playerData.name,
                team: playerData.team,
                color: playerData.color,
                hasBall: false,
                stamina: 100,
                specialCharge: 0,
                isUser: playerData.team === this.selectedTeam && playerData.number === 10
            };
            
            if (player.isUser) this.userPlayer = player;
            this.players.push(player);
        });
    }
    
    createBall() {
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            vx: 0,
            vy: 0,
            radius: 10,
            color: '#FFFFFF',
            owner: null,
            inGoal: false
        };
    }
    
    start() {
        this.state.running = true;
        this.gameLoop();
    }
    
    pause() {
        this.state.paused = true;
    }
    
    resume() {
        this.state.paused = false;
        this.gameLoop();
    }
    
    restart() {
        this.state.time = 0;
        this.state.score = { nankatsu: 0, toho: 0 };
        this.createPlayers();
        this.createBall();
        this.resume();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.state.running) return;
        
        this.deltaTime = (currentTime - this.lastTime) / 16; // Normalizado a 60fps
        this.lastTime = currentTime;
        
        if (!this.state.paused) {
            // Actualizar estado
            this.update();
            
            // Renderizar
            this.render();
            
            // Actualizar UI
            this.updateUI();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Actualizar tiempo
        this.state.time += this.deltaTime / 60; // Segundos
        
        // Terminar partido si se acaba el tiempo
        if (this.state.time >= this.state.maxTime) {
            this.endGame();
            return;
        }
        
        // Actualizar jugador controlado por usuario
        this.updateUserPlayer();
        
        // Actualizar IA
        this.updateAI();
        
        // Actualizar balón
        this.updateBall();
        
        // Actualizar posesión
        this.updatePossession();
        
        // Verificar goles
        this.checkGoals();
    }
    
    updateUserPlayer() {
        if (!this.userPlayer) return;
        
        // Movimiento con teclado
        let moveX = 0, moveY = 0;
        
        if (this.keys['ArrowUp'] || this.keys['w']) moveY = -1;
        if (this.keys['ArrowDown'] || this.keys['s']) moveY = 1;
        if (this.keys['ArrowLeft'] || this.keys['a']) moveX = -1;
        if (this.keys['ArrowRight'] || this.keys['d']) moveX = 1;
        
        // Movimiento con touch
        if (this.touch.active) {
            moveX = this.touch.x;
            moveY = this.touch.y;
        }
        
        // Normalizar movimiento diagonal
        if (moveX !== 0 && moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }
        
        // Aplicar movimiento
        this.userPlayer.x += moveX * this.userPlayer.speed;
        this.userPlayer.y += moveY * this.userPlayer.speed;
        
        // Limitar al campo
        this.userPlayer.x = Math.max(50, Math.min(this.width - 50, this.userPlayer.x));
        this.userPlayer.y = Math.max(50, Math.min(this.height - 50, this.userPlayer.y));
        
        // Actualizar stamina
        if ((moveX !== 0 || moveY !== 0) && this.userPlayer.stamina > 0) {
            this.userPlayer.stamina -= 0.1;
        } else if (this.userPlayer.stamina < 100) {
            this.userPlayer.stamina += 0.05;
        }
        
        // Cargar tiro especial
        if (this.userPlayer.specialCharge < 100) {
            this.userPlayer.specialCharge += 0.1;
        }
        
        // Si tiene el balón, moverlo con él
        if (this.userPlayer.hasBall && this.ball) {
            this.ball.x = this.userPlayer.x;
            this.ball.y = this.userPlayer.y - 30;
            this.ball.owner = this.userPlayer;
        }
    }
    
    updateAI() {
        this.players.forEach(player => {
            if (!player.isUser) {
                // IA simple: seguir el balón
                const dx = this.ball.x - player.x;
                const dy = this.ball.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 300) { // Radio de detección
                    // Mover hacia el balón
                    if (distance > 30) {
                        player.x += (dx / distance) * player.speed * 0.8;
                        player.y += (dy / distance) * player.speed * 0.8;
                    }
                    
                    // Tomar el balón si está cerca
                    if (distance < 40 && !this.ball.owner) {
                        player.hasBall = true;
                        this.ball.owner = player;
                        this.ball.vx = 0;
                        this.ball.vy = 0;
                    }
                }
                
                // Si tiene el balón, disparar
                if (player.hasBall) {
                    const goalX = player.team === 'nankatsu' ? this.width - 50 : 50;
                    const goalY = this.height / 2;
                    
                    const dx = goalX - player.x;
                    const dy = goalY - player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Disparar aleatoriamente
                    if (Math.random() < 0.01) {
                        this.shootBall(player, dx/distance * 5, dy/distance * 5);
                    }
                }
            }
        });
    }
    
    updateBall() {
        // Aplicar velocidad
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Aplicar fricción
        this.ball.vx *= 0.98;
        this.ball.vy *= 0.98;
        
        // Rebotes en los bordes
        if (this.ball.x < 20 || this.ball.x > this.width - 20) {
            this.ball.vx *= -0.8;
            this.ball.x = Math.max(20, Math.min(this.width - 20, this.ball.x));
        }
        
        if (this.ball.y < 20 || this.ball.y > this.height - 20) {
            this.ball.vy *= -0.8;
            this.ball.y = Math.max(20, Math.min(this.height - 20, this.ball.y));
        }
        
        // Colisiones con jugadores
        this.players.forEach(player => {
            const dx = this.ball.x - player.x;
            const dy = this.ball.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < player.radius + this.ball.radius) {
                // El jugador toma el balón
                if (!this.ball.owner) {
                    player.hasBall = true;
                    this.ball.owner = player;
                    this.ball.vx = 0;
                    this.ball.vy = 0;
                }
                
                // Rebote
                this.ball.vx = dx / distance * 2;
                this.ball.vy = dy / distance * 2;
            }
        });
    }
    
    updatePossession() {
        if (this.ball.owner) {
            const team = this.ball.owner.team;
            this.state.possession[team] += 1;
        }
    }
    
    checkGoals() {
        // Verificar si el balón entró en la portería
        const inLeftGoal = this.ball.x < 50 && 
                          this.ball.y > this.height/2 - 100 && 
                          this.ball.y < this.height/2 + 100;
        
        const inRightGoal = this.ball.x > this.width - 50 && 
                           this.ball.y > this.height/2 - 100 && 
                           this.ball.y < this.height/2 + 100;
        
        if (inLeftGoal) {
            this.scoreGoal('toho');
        } else if (inRightGoal) {
            this.scoreGoal('nankatsu');
        }
    }
    
    scoreGoal(team) {
        this.state.score[team]++;
        
        // Mostrar notificación
        this.showGoalNotification(team);
        
        // Resetear balón
        this.resetBall();
        
        // Resetear jugadores
        this.resetPlayers();
        
        // Actualizar marcador
        this.updateScoreboard();
    }
    
    showGoalNotification(team) {
        const notification = document.createElement('div');
        notification.className = 'notification show';
        notification.innerHTML = `
            <div style="font-size: 3rem">⚽</div>
            <div style="font-size: 2rem; color: #ffd700">GOOOOOOOL!</div>
            <div style="font-size: 1.5rem; margin-top: 10px">
                ${team === 'nankatsu' ? 'NANKATSU' : 'TOHO'}
            </div>
        `;
        
        document.getElementById('game').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.owner = null;
        
        this.players.forEach(p => p.hasBall = false);
    }
    
    resetPlayers() {
        this.createPlayers();
    }
    
    shootBall(player, powerX, powerY) {
        if (!player.hasBall) return;
        
        this.ball.vx = powerX * 8;
        this.ball.vy = powerY * 8;
        player.hasBall = false;
        this.ball.owner = null;
        
        // Consumir stamina
        player.stamina = Math.max(0, player.stamina - 20);
        
        // Reiniciar special si es tiro especial
        if (player.specialCharge >= 100) {
            player.specialCharge = 0;
            this.ball.vx *= 1.5;
            this.ball.vy *= 1.5;
        }
    }
    
    passBall(player) {
        if (!player.hasBall) return;
        
        // Encontrar compañero más cercano
        let nearestTeammate = null;
        let minDistance = Infinity;
        
        this.players.forEach(p => {
            if (p.team === player.team && p !== player) {
                const dx = p.x - player.x;
                const dy = p.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance && distance < 200) {
                    minDistance = distance;
                    nearestTeammate = p;
                }
            }
        });
        
        if (nearestTeammate) {
            const dx = nearestTeammate.x - player.x;
            const dy = nearestTeammate.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.ball.vx = (dx / distance) * 6;
            this.ball.vy = (dy / distance) * 6;
            player.hasBall = false;
            this.ball.owner = null;
        }
    }
    
    endGame() {
        this.state.running = false;
        
        // Determinar ganador
        let winner = '';
        if (this.state.score.nankatsu > this.state.score.toho) {
            winner = 'NANKATSU SC GANA!';
        } else if (this.state.score.toho > this.state.score.nankatsu) {
            winner = 'TOHO ACADEMY GANA!';
        } else {
            winner = 'EMPATE!';
        }
        
        // Mostrar pantalla de resultados
        setTimeout(() => {
            alert(`FIN DEL PARTIDO\n\nNankatsu: ${this.state.score.nankatsu}\nToho: ${this.state.score.toho}\n\n${winner}`);
            app.showScreen('menu');
        }, 1000);
    }
    
    render() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Dibujar campo
        this.drawField();
        
        // Dibujar jugadores
        this.players.forEach(player => this.drawPlayer(player));
        
        // Dibujar balón
        this.drawBall();
        
        // Dibujar porterías
        this.drawGoals();
        
        // Dibujar líneas del campo
        this.drawFieldLines();
    }
    
    drawField() {
        // Césped
        this.ctx.fillStyle = this.field.grassColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Líneas del campo
        this.ctx.strokeStyle = this.field.lineColor;
        this.ctx.lineWidth = this.field.lineWidth;
        
        // Línea central
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        
        // Círculo central
        this.ctx.beginPath();
        this.ctx.arc(this.width / 2, this.height / 2, 80, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawPlayer(player) {
        // Cuerpo del jugador
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borde
        this.ctx.strokeStyle = player.isUser ? '#FFD700' : '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Número
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(player.number, player.x, player.y);
        
        // Nombre (solo jugador controlado)
        if (player.isUser) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(player.name, player.x, player.y - 25);
        }
    }
    
    drawBall() {
        // Balón
        this.ctx.fillStyle = this.ball.color;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Patrón de balón
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Líneas del balón
        this.ctx.beginPath();
        this.ctx.moveTo(this.ball.x - 8, this.ball.y);
        this.ctx.lineTo(this.ball.x + 8, this.ball.y);
        this.ctx.moveTo(this.ball.x, this.ball.y - 8);
        this.ctx.lineTo(this.ball.x, this.ball.y + 8);
        this.ctx.stroke();
    }
    
    drawGoals() {
        // Portería izquierda
        this.ctx.strokeStyle = '#4ECDC4';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.rect(0, this.height/2 - 100, 10, 200);
        this.ctx.stroke();
        
        // Portería derecha
        this.ctx.strokeStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.rect(this.width - 10, this.height/2 - 100, 10, 200);
        this.ctx.stroke();
    }
    
    drawFieldLines() {
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        // Líneas de área
        this.ctx.beginPath();
        this.ctx.rect(0, this.height/2 - 150, 100, 300);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.rect(this.width - 100, this.height/2 - 150, 100, 300);
        this.ctx.stroke();
    }
    
    updateUI() {
        // Actualizar tiempo
        const minutes = Math.floor(this.state.time / 60);
        const seconds = Math.floor(this.state.time % 60);
        document.getElementById('game-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Actualizar marcador
        document.getElementById('score-nankatsu').textContent = this.state.score.nankatsu;
        document.getElementById('score-toho').textContent = this.state.score.toho;
        
        // Actualizar jugador actual
        if (this.userPlayer) {
            document.getElementById('current-player').textContent = this.userPlayer.name;
            document.getElementById('stamina-bar').style.width = `${this.userPlayer.stamina}%`;
            document.getElementById('special-bar').style.width = `${this.userPlayer.specialCharge}%`;
        }
    }
    
    updateScoreboard() {
        document.getElementById('score-nankatsu').textContent = this.state.score.nankatsu;
        document.getElementById('score-toho').textContent = this.state.score.toho;
    }
}

// Inicializar juego global
let game = null;
