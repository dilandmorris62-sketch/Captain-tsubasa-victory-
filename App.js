here// App Manager - Gestor de la Aplicación
class App {
    constructor() {
        this.currentScreen = 'splash';
        this.selectedTeam = 'nankatsu';
        this.game = null;
        this.controls = null;
        
        this.init();
    }
    
    init() {
        console.log('📱 Iniciando Captain Tsubasa Mobile...');
        
        // Ocultar splash después de 3 segundos
        setTimeout(() => {
            this.showScreen('menu');
        }, 3000);
        
        // Configurar selección de equipo
        this.setupTeamSelection();
        
        // Configurar botones del menú
        this.setupMenuButtons();
        
        // Configurar botones de pausa
        this.setupPauseButtons();
        
        // Configurar ayuda
        this.setupHelp();
        
        // Manejar cambio de tamaño de pantalla
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.width = window.innerWidth;
                this.game.height = window.innerHeight;
                this.game.canvas.width = this.game.width;
                this.game.canvas.height = this.game.height;
            }
        });
    }
    
    setupTeamSelection() {
        document.querySelectorAll('.team-card').forEach(card => {
            card.addEventListener('click', () => {
                // Remover selección anterior
                document.querySelectorAll('.team-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Seleccionar nuevo equipo
                card.classList.add('selected');
                this.selectedTeam = card.dataset.team;
                
                // Actualizar color en tiempo real
                const teams = document.querySelectorAll('.score .team');
                if (this.selectedTeam === 'nankatsu') {
                    teams[0].style.color = '#FF6B6B';
                    teams[1].style.color = '#4ECDC4';
                } else {
                    teams[0].style.color = '#4ECDC4';
                    teams[1].style.color = '#FF6B6B';
                }
            });
        });
    }
    
    setupMenuButtons() {
        // Iniciar juego
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        // Cómo jugar
        document.getElementById('how-to-play').addEventListener('click', () => {
            this.showScreen('help');
        });
    }
    
    setupPauseButtons() {
        // Botón de pausa en juego
        document.getElementById('pause-btn').addEventListener('click', () => {
            if (this.game) {
                this.game.pause();
                this.showScreen('pause');
            }
        });
        
        // Continuar desde pausa
        document.getElementById('resume').addEventListener('click', () => {
            if (this.game) {
                this.game.resume();
                this.showScreen('game');
            }
        });
        
        // Reiniciar partido
        document.getElementById('restart').addEventListener('click', () => {
            if (this.game) {
                this.game.restart();
                this.showScreen('game');
            }
        });
        
        // Salir al menú
        document.getElementById('quit').addEventListener('click', () => {
            if (this.game) {
                this.game.state.running = false;
                this.game = null;
                this.controls = null;
            }
            this.showScreen('menu');
        });
    }
    
    setupHelp() {
        document.getElementById('close-help').addEventListener('click', () => {
            this.showScreen('menu');
        });
    }
    
    showScreen(screenName) {
        // Ocultar pantalla actual
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar nueva pantalla
        document.getElementById(screenName).classList.add('active');
        this.currentScreen = screenName;
        
        // Ajustar orientación si es necesario
        this.adjustOrientation(screenName);
    }
    
    adjustOrientation(screenName) {
        if (screenName === 'game') {
            // Bloquear orientación landscape para el juego
            if (window.screen.orientation && window.screen.orientation.lock) {
                window.screen.orientation.lock('landscape').catch(() => {
                    console.log('No se pudo bloquear la orientación');
                });
            }
        } else {
            // Liberar orientación
            if (window.screen.orientation && window.screen.orientation.unlock) {
                window.screen.orientation.unlock();
            }
        }
    }
    
    startGame() {
        console.log('🚀 Iniciando partido...');
        
        // Inicializar juego
        this.game = new Game();
        this.game.selectedTeam = this.selectedTeam;
        
        // Inicializar controles
        this.controls = new Controls(this.game);
        
        // Mostrar pantalla del juego
        this.showScreen('game');
        
        // Forzar landscape
        this.adjustOrientation('game');
    }
}

// Inicializar aplicación
let app = null;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// Manejar botón atrás en Android
if (window.history && window.history.pushState) {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function(event) {
        window.history.go(1);
    };
  }
