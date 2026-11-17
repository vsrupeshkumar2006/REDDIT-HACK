/**
 * ONLYSONS Arcade & Dynasty Saga: 8 Fully Working Interactive Mini-Games
 * Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
 * 
 * Features:
 *  1. 🎲 KARMA DICE (Son III: Wholesome Doge) - 3D Dice roll & prediction slider
 *  2. 💣 AUTOMOD MINES (Son II: Chaos Cat) - 5x5 Grid with Upvote Diamonds & Downvote Bombs
 *  3. 🟡 PLINKO OF DESTINY (Son III: Wholesome Doge) - Physics pegboard with canvas collisions
 *  4. 🚀 MOON CRASH (Son IV: WSB Ape) - Real-time rocket multiplier curve & cash out
 *  5. 🐔 CHICKEN HIGHWAY (Son II: Chaos Cat) - Multi-lane road crossing & multiplier stepping
 *  6. 🔮 MOD TAROT (Son I: Mod Wizard) - 3D Card flip divination with Reddit Arcana
 *  7. 💎 STONK KENO (Son IV: WSB Ape) - 40-tile number board with live winning draws
 *  8. 🎯 LIMBO MULTIPLIER (Son I: Mod Wizard) - High-roller target multiplier roll
 */

export class OnlySonsArcade {
  constructor(containerId, gameEngine) {
    this.container = document.getElementById(containerId);
    this.game = gameEngine;
    this.sound = gameEngine ? gameEngine.sound : null;
    this.activeGameId = null; // null = in Lobby
    this.filterSon = 'all';

    // Game Definitions & Metas
    this.gamesList = [
      {
        id: 'dice',
        title: 'DICE',
        son: 'Son III: Wholesome Doge',
        emoji: '🎲',
        tag: 'DOGE ORIGINAL',
        players: '2,764',
        accent: '#9b59b6',
        desc: 'Roll the 3D Karma Dice. Set your target slider to predict Over or Under.'
      },
      {
        id: 'mines',
        title: 'MINES',
        son: 'Son II: Chaos Cat',
        emoji: '💣',
        tag: 'CAT ORIGINAL',
        players: '3,637',
        accent: '#2980b9',
        desc: 'Uncover Upvote Diamonds on a 5x5 grid. Avoid the AutoMod Downvote Bombs!'
      },
      {
        id: 'plinko',
        title: 'PLINKO',
        son: 'Son III: Wholesome Doge',
        emoji: '🟡',
        tag: 'DOGE ORIGINAL',
        players: '1,795',
        accent: '#e84393',
        desc: 'Drop golden Karma Coins through the peg pyramid into high multiplier buckets.'
      },
      {
        id: 'chicken',
        title: 'CHICKEN',
        son: 'Son II: Chaos Cat',
        emoji: '🐔',
        tag: 'CAT ORIGINAL',
        players: '1,002',
        accent: '#00b894',
        desc: 'Cross 6 hazardous highway lanes. Each successful step doubles your reward!'
      },
      {
        id: 'tarot',
        title: 'TAROT',
        son: 'Son I: Mod Wizard',
        emoji: '🔮',
        tag: 'WIZARD ORIGINAL',
        players: '254',
        accent: '#fdcb6e',
        desc: 'Draw 3 mystical Reddit Arcana cards to divine father PatriarchPrime’s fate.'
      },
      {
        id: 'crash',
        title: 'CRASH',
        son: 'Son IV: WSB Ape',
        emoji: '🚀',
        tag: 'APE ORIGINAL',
        players: '1,827',
        accent: '#f39c12',
        desc: 'Watch the WSB rocket soar! Cash out before the Hedge Fund rug pull!'
      },
      {
        id: 'keno',
        title: 'KENO',
        son: 'Son IV: WSB Ape',
        emoji: '💎',
        tag: 'APE ORIGINAL',
        players: '1,376',
        accent: '#0984e3',
        desc: 'Select 10 lucky stonks from 40 tiles. Hit the winning numbers for huge combos.'
      },
      {
        id: 'limbo',
        title: 'LIMBO',
        son: 'Son I: Mod Wizard',
        emoji: '🎯',
        tag: 'WIZARD ORIGINAL',
        players: '2,543',
        accent: '#d63031',
        desc: 'Target high-roller multipliers up to 1000x in an instant hyper-speed roll.'
      }
    ];

    // State for individual games
    this.minesState = { active: false, bet: 50, minesCount: 3, grid: [], revealed: [], multiplier: 1.0 };
    this.crashState = { active: false, bet: 100, multiplier: 1.0, bustPoint: 2.0, animId: null, cashedOut: false };
    this.chickenState = { active: false, bet: 50, currentStep: 0, multipliers: [1.35, 1.95, 3.2, 6.5, 15.0, 50.0] };
    this.plinkoState = { bet: 25, balls: [], animId: null };
    this.kenoState = { bet: 50, selected: [], drawn: [] };
  }

  init() {
    this.renderLobby();
  }

  // ===========================================================================
  // 1. ARCADE LOBBY VIEW (Matches User Screenshot & Reddit Dark UX)
  // ===========================================================================
  renderLobby() {
    if (!this.container) return;
    this.activeGameId = null;

    let cardsHtml = '';
    const filtered = this.gamesList.filter(g => {
      if (this.filterSon === 'all') return true;
      return g.son.toLowerCase().includes(this.filterSon.toLowerCase());
    });

    filtered.forEach(game => {
      cardsHtml += `
        <div class="arcade-game-card" data-game="${game.id}">
          <div class="card-hero-visual" style="background: linear-gradient(145deg, ${game.accent}22, ${game.accent}dd);">
            <div class="game-big-emoji">${game.emoji}</div>
            <div class="game-card-title">${game.title}</div>
            <div class="game-sub-tag">${game.tag}</div>
          </div>
          <div class="card-footer-info">
            <div class="online-dot-row">
              <span class="live-green-dot"></span>
              <span class="player-count">${game.players} playing</span>
            </div>
            <div class="son-owner-name">${game.son}</div>
          </div>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="onlysons-arcade-wrapper">
        <!-- Top Arcade Search & Navigation Bar (Matches Screenshot) -->
        <div class="arcade-top-bar">
          <div class="arcade-search-box">
            <span class="search-lens">🔍</span>
            <input type="text" id="arcadeSearchInput" placeholder="Search your game (Dice, Mines, Plinko, Crash...)" />
          </div>
          <div class="arcade-dynasty-badge">
            <span class="dynasty-k-icon">👑</span>
            <span>ONLYSONS DYNASTY ARCADE</span>
          </div>
        </div>

        <!-- Filter Pills Bar (Lobby, Originals, Son Archetypes) -->
        <div class="arcade-filter-pills">
          <button class="pill-btn ${this.filterSon === 'all' ? 'active' : ''}" data-son="all">
            <span class="pill-icon">⊞</span> Lobby & All Games
          </button>
          <button class="pill-btn ${this.filterSon === 'wizard' ? 'active' : ''}" data-son="wizard">
            <span class="pill-icon">🧙‍♂️</span> Son I: Mod Wizard
          </button>
          <button class="pill-btn ${this.filterSon === 'cat' ? 'active' : ''}" data-son="cat">
            <span class="pill-icon">🐈</span> Son II: Chaos Cat
          </button>
          <button class="pill-btn ${this.filterSon === 'doge' ? 'active' : ''}" data-son="doge">
            <span class="pill-icon">🐕</span> Son III: Wholesome Doge
          </button>
          <button class="pill-btn ${this.filterSon === 'ape' ? 'active' : ''}" data-son="ape">
            <span class="pill-icon">🦍</span> Son IV: WSB Ape
          </button>
        </div>

        <!-- Section Title with Flame Icon -->
        <div class="arcade-section-header">
          <div class="section-title-wrap">
            <span class="flame-icon">🔥</span>
            <h2>Only Sons Originals</h2>
          </div>
          <div class="section-arrows">
            <span class="scroll-arrow" id="btnScrollLeft">‹</span>
            <span class="scroll-arrow" id="btnScrollRight">›</span>
          </div>
        </div>

        <!-- Games Grid / Carousel -->
        <div class="arcade-cards-grid" id="arcadeCardsContainer">
          ${cardsHtml}
        </div>
      </div>
    `;

    // Bind card click events
    this.container.querySelectorAll('.arcade-game-card').forEach(card => {
      card.addEventListener('click', () => {
        const gid = card.getAttribute('data-game');
        this.openGame(gid);
      });
    });

    // Bind filter pills
    this.container.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterSon = btn.getAttribute('data-son');
        this.renderLobby();
      });
    });

    // Search input
    const searchInput = document.getElementById('arcadeSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        this.container.querySelectorAll('.arcade-game-card').forEach(card => {
          const gid = card.getAttribute('data-game');
          const title = card.querySelector('.game-card-title').innerText.toLowerCase();
          if (title.includes(val) || gid.includes(val)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }

    // Scroll arrows
    const scrollContainer = document.getElementById('arcadeCardsContainer');
    document.getElementById('btnScrollLeft')?.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: -320, behavior: 'smooth' });
    });
    document.getElementById('btnScrollRight')?.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }

  // ===========================================================================
  // 2. DISPATCHER: OPEN SPECIFIC MINI-GAME
  // ===========================================================================
  openGame(gameId) {
    this.activeGameId = gameId;
    const gMeta = this.gamesList.find(g => g.id === gameId);
    if (!gMeta) return;

    if (this.sound) this.sound.upvote();

    // Render Game Container Shell with "Back to Lobby"
    this.container.innerHTML = `
      <div class="active-game-wrapper">
        <div class="game-header-bar">
          <button class="back-to-lobby-btn" id="btnBackToLobby">
            ‹ BACK TO LOBBY
          </button>
          <div class="game-meta-badge">
            <span class="game-icon-bubble">${gMeta.emoji}</span>
            <div>
              <div class="game-headline">${gMeta.title}</div>
              <div class="game-owner-sub">${gMeta.son}</div>
            </div>
          </div>
          <div class="karma-balance-pill">
            <span style="color:#ff4500;">▲</span>
            <span id="activeKarmaDisplay">${(this.game ? this.game.points : 1420).toLocaleString()}</span> KARMA
          </div>
        </div>

        <div class="game-workspace" id="gameWorkspace">
          <!-- Dynamic Game Board Injected Here -->
        </div>
      </div>
    `;

    document.getElementById('btnBackToLobby').addEventListener('click', () => {
      this.renderLobby();
    });

    // Mount specific game
    const workspace = document.getElementById('gameWorkspace');
    switch (gameId) {
      case 'dice': this.mountDice(workspace); break;
      case 'mines': this.mountMines(workspace); break;
      case 'plinko': this.mountPlinko(workspace); break;
      case 'crash': this.mountCrash(workspace); break;
      case 'chicken': this.mountChicken(workspace); break;
      case 'tarot': this.mountTarot(workspace); break;
      case 'keno': this.mountKeno(workspace); break;
      case 'limbo': this.mountLimbo(workspace); break;
      default: this.renderLobby();
    }
  }

  updateKarmaDisplay() {
    const disp = document.getElementById('activeKarmaDisplay');
    if (disp && this.game) {
      disp.innerText = this.game.points.toLocaleString();
    }
  }

  // ===========================================================================
  // GAME 1: 🎲 KARMA DICE (Son III: Wholesome Doge)
  // ===========================================================================
  mountDice(container) {
    let target = 50.5;
    let mode = 'under'; // 'under' or 'over'
    let bet = 50;

    const calcMultiplier = () => {
      const winChance = mode === 'under' ? target : (100 - target);
      return (99.0 / winChance).toFixed(2);
    };

    container.innerHTML = `
      <div class="dice-game-layout">
        <!-- Control Sidebar -->
        <div class="game-control-panel">
          <label class="control-label">BET AMOUNT (KARMA)</label>
          <div class="bet-input-row">
            <input type="number" id="diceBetInput" value="${bet}" min="10" max="5000" />
            <button class="quick-bet-btn" id="btnDiceHalf">½</button>
            <button class="quick-bet-btn" id="btnDiceDouble">2×</button>
          </div>

          <div class="dice-mode-toggle">
            <button class="mode-btn active" id="btnRollUnder">ROLL UNDER</button>
            <button class="mode-btn" id="btnRollOver">ROLL OVER</button>
          </div>

          <div class="stat-readout-grid">
            <div class="stat-readout">
              <span>MULTIPLIER</span>
              <strong id="diceMultiplierText">${calcMultiplier()}×</strong>
            </div>
            <div class="stat-readout">
              <span>WIN CHANCE</span>
              <strong id="diceChanceText">${target.toFixed(1)}%</strong>
            </div>
          </div>

          <button class="action-play-btn" id="btnRollDice">
            🎲 ROLL DICE
          </button>
        </div>

        <!-- Center 3D Rolling Stage -->
        <div class="game-stage-panel">
          <div class="dice-stage-visual">
            <div class="dice-result-sphere" id="diceResultBox">50.00</div>
            <div class="dice-slider-track">
              <input type="range" id="diceSlider" min="2" max="98" step="0.5" value="${target}" />
              <div class="slider-fill" id="diceSliderFill" style="width: 50%;"></div>
            </div>
            <div class="slider-scale-row">
              <span>0</span>
              <span id="sliderMidLabel">Target: ${target}</span>
              <span>100</span>
            </div>
            <div class="dice-status-banner" id="diceStatusBanner">
              Place your bet and roll to earn Karma with Wholesome Doge!
            </div>
          </div>
        </div>
      </div>
    `;

    // Sliders and controls
    const slider = document.getElementById('diceSlider');
    const betInput = document.getElementById('diceBetInput');
    const multText = document.getElementById('diceMultiplierText');
    const chanceText = document.getElementById('diceChanceText');
    const resultBox = document.getElementById('diceResultBox');
    const statusBanner = document.getElementById('diceStatusBanner');
    const fill = document.getElementById('diceSliderFill');
    const midLabel = document.getElementById('sliderMidLabel');

    const updateDiceOdds = () => {
      target = parseFloat(slider.value);
      fill.style.width = target + '%';
      midLabel.innerText = `Target: ${target.toFixed(1)}`;
      const chance = mode === 'under' ? target : (100 - target);
      chanceText.innerText = `${chance.toFixed(1)}%`;
      multText.innerText = `${calcMultiplier()}×`;
    };

    slider.addEventListener('input', updateDiceOdds);

    document.getElementById('btnRollUnder').addEventListener('click', (e) => {
      mode = 'under';
      e.target.classList.add('active');
      document.getElementById('btnRollOver').classList.remove('active');
      updateDiceOdds();
    });

    document.getElementById('btnRollOver').addEventListener('click', (e) => {
      mode = 'over';
      e.target.classList.add('active');
      document.getElementById('btnRollUnder').classList.remove('active');
      updateDiceOdds();
    });

    document.getElementById('btnDiceHalf').addEventListener('click', () => {
      betInput.value = Math.max(10, Math.floor(parseInt(betInput.value) / 2));
    });
    document.getElementById('btnDiceDouble').addEventListener('click', () => {
      betInput.value = Math.floor(parseInt(betInput.value) * 2);
    });

    // Roll Action
    document.getElementById('btnRollDice').addEventListener('click', () => {
      const currentBet = parseInt(betInput.value) || 50;
      if (this.game && !this.game.spendPoints(currentBet)) {
        statusBanner.innerHTML = `<span style="color:#ff3b30;">Not enough Karma! You need ${currentBet} Karma.</span>`;
        return;
      }
      this.updateKarmaDisplay();

      // Rolling animation
      let counter = 0;
      const rollInterval = setInterval(() => {
        resultBox.innerText = (Math.random() * 100).toFixed(2);
        counter++;
        if (counter > 14) {
          clearInterval(rollInterval);
          const finalRoll = parseFloat((Math.random() * 100).toFixed(2));
          resultBox.innerText = finalRoll.toFixed(2);

          const won = mode === 'under' ? (finalRoll < target) : (finalRoll > target);
          if (won) {
            const mult = parseFloat(calcMultiplier());
            const wonAmount = Math.floor(currentBet * mult);
            resultBox.style.borderColor = '#2ecc71';
            resultBox.style.color = '#2ecc71';
            statusBanner.innerHTML = `<span style="color:#2ecc71; font-weight:800;">🎉 DOGE BLESSING! Won ${wonAmount} Karma (${mult}×)!</span>`;
            if (this.game) this.game.addPoints(wonAmount);
            if (this.sound) this.sound.award();
          } else {
            resultBox.style.borderColor = '#e74c3c';
            resultBox.style.color = '#e74c3c';
            statusBanner.innerHTML = `<span style="color:#e74c3c;">Downvoted! Rolled ${finalRoll.toFixed(2)}. Better luck next roll!</span>`;
            if (this.sound) this.sound.hit();
          }
          this.updateKarmaDisplay();
        }
      }, 35);
    });
  }

  // ===========================================================================
  // GAME 2: 💣 AUTOMOD MINES (Son II: Chaos Cat)
  // ===========================================================================
  mountMines(container) {
    let bet = 50;
    let minesCount = 3;
    let state = this.minesState;
    state.active = false;

    container.innerHTML = `
      <div class="mines-game-layout">
        <div class="game-control-panel">
          <label class="control-label">BET AMOUNT (KARMA)</label>
          <div class="bet-input-row">
            <input type="number" id="minesBetInput" value="${bet}" min="10" />
            <button class="quick-bet-btn" id="btnMinesHalf">½</button>
            <button class="quick-bet-btn" id="btnMinesDouble">2×</button>
          </div>

          <label class="control-label" style="margin-top:14px;">DOWNVOTE BOMBS</label>
          <select id="minesCountSelect" class="mines-select">
            <option value="1">1 Bomb (Casual)</option>
            <option value="3" selected>3 Bombs (Standard)</option>
            <option value="5">5 Bombs (Risky)</option>
            <option value="10">10 Bombs (Extreme)</option>
            <option value="24">24 Bombs (Impossible)</option>
          </select>

          <div class="stat-readout-grid" style="margin-top:16px;">
            <div class="stat-readout">
              <span>CURRENT MULTIPLIER</span>
              <strong id="minesMultText" style="color:#00d2d3;">1.00×</strong>
            </div>
            <div class="stat-readout">
              <span>SAFE TILES</span>
              <strong id="minesSafeText">22</strong>
            </div>
          </div>

          <button class="action-play-btn" id="btnStartMines" style="margin-top:18px;">
            START INFILTRATION
          </button>
          <button class="action-cashout-btn hidden" id="btnCashoutMines" style="margin-top:10px;">
            CASH OUT (0 Karma)
          </button>
        </div>

        <div class="game-stage-panel">
          <div class="mines-grid-5x5" id="minesGrid">
            ${Array.from({ length: 25 }).map((_, i) => `
              <div class="mine-tile" data-index="${i}">
                <div class="tile-inner">
                  <div class="tile-front">🐾</div>
                  <div class="tile-back">💎</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="dice-status-banner" id="minesStatusBanner">
            Infiltrate AutoMod fortress with Son II: Chaos Cat. Uncover Diamonds and Cash Out!
          </div>
        </div>
      </div>
    `;

    const startBtn = document.getElementById('btnStartMines');
    const cashBtn = document.getElementById('btnCashoutMines');
    const multText = document.getElementById('minesMultText');
    const safeText = document.getElementById('minesSafeText');
    const statusBanner = document.getElementById('minesStatusBanner');
    const betInput = document.getElementById('minesBetInput');
    const select = document.getElementById('minesCountSelect');
    const tiles = container.querySelectorAll('.mine-tile');

    startBtn.addEventListener('click', () => {
      bet = parseInt(betInput.value) || 50;
      minesCount = parseInt(select.value);

      if (this.game && !this.game.spendPoints(bet)) {
        statusBanner.innerText = `Need ${bet} Karma to start!`;
        return;
      }
      this.updateKarmaDisplay();

      // Initialize Grid
      state.active = true;
      state.bet = bet;
      state.minesCount = minesCount;
      state.multiplier = 1.0;
      state.revealed = [];

      // Place bombs randomly
      state.grid = Array(25).fill('gem');
      let placed = 0;
      while (placed < minesCount) {
        const idx = Math.floor(Math.random() * 25);
        if (state.grid[idx] !== 'bomb') {
          state.grid[idx] = 'bomb';
          placed++;
        }
      }

      // Reset tile UI
      tiles.forEach(t => {
        t.className = 'mine-tile';
        t.querySelector('.tile-back').innerText = '💎';
      });

      startBtn.classList.add('hidden');
      cashBtn.classList.remove('hidden');
      cashBtn.innerText = `CASH OUT (${bet} Karma)`;
      multText.innerText = '1.00×';
      safeText.innerText = (25 - minesCount);
      statusBanner.innerText = 'Fortress entered! Pick a tile carefully.';
      if (this.sound) this.sound.upvote();
    });

    // Tile Click Handler
    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (!state.active) return;
        const idx = parseInt(tile.getAttribute('data-index'));
        if (state.revealed.includes(idx)) return;

        state.revealed.push(idx);
        const tileType = state.grid[idx];

        if (tileType === 'bomb') {
          // BOMB DETONATION!
          state.active = false;
          tile.classList.add('detonated');
          tile.querySelector('.tile-back').innerText = '💣';
          statusBanner.innerHTML = `<span style="color:#e74c3c; font-weight:800;">💥 AUTOMOD BANHAMMER DETONATED! Lost ${state.bet} Karma!</span>`;
          if (this.sound) this.sound.hit();

          // Reveal all other bombs
          tiles.forEach((t, i) => {
            if (state.grid[i] === 'bomb') {
              t.classList.add('revealed-bomb');
              t.querySelector('.tile-back').innerText = '💣';
            }
          });

          cashBtn.classList.add('hidden');
          startBtn.classList.remove('hidden');
          startBtn.innerText = 'PLAY AGAIN';
        } else {
          // GEM UNCOVERED!
          tile.classList.add('revealed-gem');
          tile.querySelector('.tile-back').innerText = '💎';
          if (this.sound) this.sound.upvote();

          // Multiplier formula
          const remainingGems = (25 - state.minesCount) - state.revealed.length + 1;
          const remainingTiles = 25 - state.revealed.length + 1;
          state.multiplier *= (remainingTiles / remainingGems) * 0.96;

          const currentPayout = Math.floor(state.bet * state.multiplier);
          multText.innerText = `${state.multiplier.toFixed(2)}×`;
          safeText.innerText = (25 - state.minesCount - state.revealed.length);
          cashBtn.innerText = `CASH OUT (${currentPayout} Karma)`;
          statusBanner.innerText = `💎 Diamond found! Current Payout: ${currentPayout} Karma.`;
        }
      });
    });

    // Cash Out Handler
    cashBtn.addEventListener('click', () => {
      if (!state.active) return;
      state.active = false;
      const won = Math.floor(state.bet * state.multiplier);
      if (this.game) this.game.addPoints(won);
      this.updateKarmaDisplay();
      if (this.sound) this.sound.award();

      statusBanner.innerHTML = `<span style="color:#2ecc71; font-weight:800;">🏆 INFILTRATION SUCCESSFUL! Cashed out +${won} Karma (${state.multiplier.toFixed(2)}×)!</span>`;

      // Reveal grid
      tiles.forEach((t, i) => {
        if (!state.revealed.includes(i)) {
          t.classList.add(state.grid[i] === 'bomb' ? 'revealed-bomb' : 'revealed-gem');
          t.querySelector('.tile-back').innerText = state.grid[i] === 'bomb' ? '💣' : '💎';
        }
      });

      cashBtn.classList.add('hidden');
      startBtn.classList.remove('hidden');
      startBtn.innerText = 'START NEXT INFILTRATION';
    });
  }

  // ===========================================================================
  // GAME 3: 🟡 PLINKO OF DESTINY (Son III: Wholesome Doge)
  // ===========================================================================
  mountPlinko(container) {
    let bet = 50;
    const multipliers = [12.0, 3.5, 1.8, 0.6, 0.2, 0.6, 1.8, 3.5, 12.0];

    container.innerHTML = `
      <div class="plinko-game-layout">
        <div class="game-control-panel">
          <label class="control-label">BET AMOUNT PER COIN</label>
          <div class="bet-input-row">
            <input type="number" id="plinkoBetInput" value="${bet}" min="10" />
            <button class="quick-bet-btn" id="btnPlinkoHalf">½</button>
            <button class="quick-bet-btn" id="btnPlinkoDouble">2×</button>
          </div>

          <div class="stat-readout-grid" style="margin-top:16px;">
            <div class="stat-readout">
              <span>JACKPOT SLOT</span>
              <strong style="color:#f1c40f;">12.0×</strong>
            </div>
            <div class="stat-readout">
              <span>PIN ROWS</span>
              <strong>8 Rows</strong>
            </div>
          </div>

          <button class="action-play-btn" id="btnDropPlinko" style="margin-top:20px;">
            🟡 DROP KARMA COIN
          </button>
        </div>

        <div class="game-stage-panel">
          <div class="plinko-board-wrap">
            <canvas id="plinkoCanvas" width="480" height="420"></canvas>
            <div class="plinko-buckets-row" id="plinkoBuckets">
              ${multipliers.map(m => `
                <div class="bucket-cell ${m >= 3.0 ? 'gold' : ''}">
                  ${m}×
                </div>
              `).join('')}
            </div>
          </div>
          <div class="dice-status-banner" id="plinkoStatusBanner">
            Click DROP KARMA COIN to watch physics chip bounce down Wholesome Doge's pyramid!
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById('plinkoCanvas');
    const ctx = canvas.getContext('2d');
    const statusBanner = document.getElementById('plinkoStatusBanner');
    const betInput = document.getElementById('plinkoBetInput');

    // Peg Pyramid Setup
    const rows = 8;
    const pegs = [];
    const startY = 50;
    const spacingY = 38;

    for (let r = 0; r < rows; r++) {
      const count = r + 3;
      const spacingX = 40;
      const startX = 240 - ((count - 1) * spacingX) / 2;
      for (let c = 0; c < count; c++) {
        pegs.push({ x: startX + c * spacingX, y: startY + r * spacingY, radius: 4.5 });
      }
    }

    const balls = [];

    const drawPlinko = () => {
      ctx.clearRect(0, 0, 480, 420);

      // Draw Pegs
      pegs.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00d2d3';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and Draw Balls
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.vy += 0.32; // Gravity
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.98;

        // Collision with pegs
        pegs.forEach(p => {
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < p.radius + b.radius) {
            // Deflect ball
            const angle = Math.atan2(dy, dx);
            const bounce = (Math.random() - 0.5) * 1.8;
            b.vx = Math.cos(angle) * 2.2 + bounce;
            b.vy = Math.sin(angle) * 1.8 + 0.8;
            if (this.sound && Math.random() < 0.25) this.sound.playTone(600 + Math.random() * 300, 'sine', 0.05, 0.1);
          }
        });

        // Draw ball
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check if landed at bottom
        if (b.y >= 380) {
          const bucketWidth = 480 / multipliers.length;
          const slot = Math.max(0, Math.min(multipliers.length - 1, Math.floor(b.x / bucketWidth)));
          const mult = multipliers[slot];
          const won = Math.floor(b.bet * mult);

          if (this.game) this.game.addPoints(won);
          this.updateKarmaDisplay();
          if (this.sound) {
            if (mult >= 3.0) this.sound.award();
            else this.sound.upvote();
          }

          statusBanner.innerHTML = `<span style="color:#f1c40f; font-weight:800;">🟡 COIN LANDED IN ${mult}× BUCKET! Won ${won} Karma!</span>`;
          balls.splice(i, 1);
        }
      }

      requestAnimationFrame(drawPlinko);
    };

    drawPlinko();

    document.getElementById('btnDropPlinko').addEventListener('click', () => {
      bet = parseInt(betInput.value) || 25;
      if (this.game && !this.game.spendPoints(bet)) {
        statusBanner.innerText = `Need ${bet} Karma to drop a coin!`;
        return;
      }
      this.updateKarmaDisplay();

      // Spawn ball with small horizontal jitter
      balls.push({
        x: 240 + (Math.random() - 0.5) * 16,
        y: 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1.5,
        radius: 7.5,
        bet
      });
    });
  }

  // ===========================================================================
  // GAME 4: 🚀 MOON CRASH (Son IV: WSB Ape)
  // ===========================================================================
  mountCrash(container) {
    let bet = 100;
    let state = this.crashState;

    container.innerHTML = `
      <div class="crash-game-layout">
        <div class="game-control-panel">
          <label class="control-label">BET AMOUNT (KARMA)</label>
          <div class="bet-input-row">
            <input type="number" id="crashBetInput" value="${bet}" min="10" />
            <button class="quick-bet-btn" id="btnCrashHalf">½</button>
            <button class="quick-bet-btn" id="btnCrashDouble">2×</button>
          </div>

          <div class="stat-readout-grid" style="margin-top:16px;">
            <div class="stat-readout">
              <span>CURRENT PAYOUT</span>
              <strong id="crashPayoutText" style="color:#2ecc71;">0 Karma</strong>
            </div>
            <div class="stat-readout">
              <span>STATUS</span>
              <strong id="crashStatusText">READY</strong>
            </div>
          </div>

          <button class="action-play-btn" id="btnLaunchCrash" style="margin-top:20px;">
            🚀 LAUNCH TO THE MOON
          </button>
          <button class="action-cashout-btn hidden" id="btnCashoutCrash" style="margin-top:12px; background:linear-gradient(135deg, #2ecc71, #27ae60);">
            CASH OUT (1.00×)
          </button>
        </div>

        <div class="game-stage-panel">
          <div class="crash-stage-canvas-wrap">
            <canvas id="crashCanvas" width="520" height="340"></canvas>
            <div class="crash-center-multiplier" id="crashBigMultiplier">1.00×</div>
          </div>
          <div class="dice-status-banner" id="crashStatusBanner">
            Diamond hands with Son IV: WSB Ape! Watch the rocket soar and cash out before the SEC rug pull!
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById('crashCanvas');
    const ctx = canvas.getContext('2d');
    const bigMult = document.getElementById('crashBigMultiplier');
    const launchBtn = document.getElementById('btnLaunchCrash');
    const cashBtn = document.getElementById('btnCashoutCrash');
    const payoutText = document.getElementById('crashPayoutText');
    const statusText = document.getElementById('crashStatusText');
    const statusBanner = document.getElementById('crashStatusBanner');
    const betInput = document.getElementById('crashBetInput');

    const drawCrashBackground = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, 520, 340);

      // Grid Lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let y = 40; y < 340; y += 45) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(520, y); ctx.stroke();
      }
    };

    drawCrashBackground();

    launchBtn.addEventListener('click', () => {
      bet = parseInt(betInput.value) || 100;
      if (this.game && !this.game.spendPoints(bet)) {
        statusBanner.innerText = `Need ${bet} Karma to launch rocket!`;
        return;
      }
      this.updateKarmaDisplay();

      state.active = true;
      state.bet = bet;
      state.multiplier = 1.0;
      state.cashedOut = false;

      // Realistic Crash distribution with 4% house edge
      const r = Math.random();
      state.bustPoint = Math.max(1.05, 0.96 / (1 - r));
      if (Math.random() < 0.05) state.bustPoint = 1.0; // Instant crash shock

      launchBtn.classList.add('hidden');
      cashBtn.classList.remove('hidden');
      statusText.innerText = 'SOARING 🚀';
      statusText.style.color = '#f39c12';
      statusBanner.innerText = 'Rocket is ascending! Cash out when ready.';

      let startTime = performance.now();

      const updateCrashTick = (now) => {
        if (!state.active) return;
        const elapsedSec = (now - startTime) / 1000;
        // Exponential multiplier curve: e^(0.075 * t)
        state.multiplier = Math.pow(Math.E, 0.12 * elapsedSec);

        // Update UI
        bigMult.innerText = `${state.multiplier.toFixed(2)}×`;
        const currentPayout = Math.floor(state.bet * state.multiplier);
        cashBtn.innerText = `CASH OUT (+${currentPayout} Karma)`;
        payoutText.innerText = `${currentPayout} Karma`;

        // Draw soaring rocket curve
        drawCrashBackground();
        ctx.beginPath();
        ctx.moveTo(30, 300);
        const progressX = Math.min(480, 30 + elapsedSec * 35);
        const progressY = Math.max(40, 300 - (state.multiplier - 1.0) * 35);
        ctx.lineTo(progressX, progressY);
        ctx.strokeStyle = '#00d2d3';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00d2d3';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Rocket Icon
        ctx.font = '24px sans-serif';
        ctx.fillText('🚀', progressX - 10, progressY - 10);

        // Check if bust
        if (state.multiplier >= state.bustPoint) {
          state.active = false;
          bigMult.style.color = '#e74c3c';
          bigMult.innerText = `CRASHED @ ${state.bustPoint.toFixed(2)}×`;
          statusText.innerText = 'CRASHED 💥';
          statusText.style.color = '#e74c3c';
          statusBanner.innerHTML = `<span style="color:#e74c3c; font-weight:800;">💥 RUG PULL! The Hedge Funds crashed the stock at ${state.bustPoint.toFixed(2)}×!</span>`;
          if (this.sound) this.sound.defeat();

          cashBtn.classList.add('hidden');
          launchBtn.classList.remove('hidden');
          launchBtn.innerText = 'LAUNCH NEXT ROCKET';
          return;
        }

        state.animId = requestAnimationFrame(updateCrashTick);
      };

      state.animId = requestAnimationFrame(updateCrashTick);
    });

    // Cash Out Handler
    cashBtn.addEventListener('click', () => {
      if (!state.active || state.cashedOut) return;
      state.cashedOut = true;
      const won = Math.floor(state.bet * state.multiplier);
      if (this.game) this.game.addPoints(won);
      this.updateKarmaDisplay();
      if (this.sound) this.sound.award();

      statusBanner.innerHTML = `<span style="color:#2ecc71; font-weight:800;">🎉 APE CASHOUT! Secured +${won} Karma at ${state.multiplier.toFixed(2)}×!</span>`;
      cashBtn.classList.add('hidden');
      launchBtn.classList.remove('hidden');
      launchBtn.innerText = 'PLAY AGAIN';
    });
  }

  // ===========================================================================
  // GAME 5: 🐔 CHICKEN HIGHWAY (Son II: Chaos Cat)
  // ===========================================================================
  mountChicken(container) {
    let bet = 50;
    let state = this.chickenState;
    state.active = false;
    state.currentStep = 0;

    container.innerHTML = `
      <div class="chicken-game-layout">
        <div class="game-control-panel">
          <label class="control-label">BET AMOUNT (KARMA)</label>
          <div class="bet-input-row">
            <input type="number" id="chickenBetInput" value="${bet}" min="10" />
            <button class="quick-bet-btn" id="btnChickenHalf">½</button>
            <button class="quick-bet-btn" id="btnChickenDouble">2×</button>
          </div>

          <div class="stat-readout-grid" style="margin-top:16px;">
            <div class="stat-readout">
              <span>CURRENT MULTIPLIER</span>
              <strong id="chickenMultText" style="color:#00b894;">1.00×</strong>
            </div>
            <div class="stat-readout">
              <span>NEXT STEP</span>
              <strong id="chickenNextText">1.35×</strong>
            </div>
          </div>

          <button class="action-play-btn" id="btnStartChicken" style="margin-top:20px;">
            🐔 CROSS THE ROAD
          </button>
          <button class="action-cashout-btn hidden" id="btnStepChicken" style="margin-top:12px; background:linear-gradient(135deg, #0984e3, #00cec9);">
            🐾 STEP FORWARD
          </button>
          <button class="action-cashout-btn hidden" id="btnCashoutChicken" style="margin-top:8px;">
            CASH OUT (0 Karma)
          </button>
        </div>

        <div class="game-stage-panel">
          <div class="chicken-highway-track" id="chickenTrack">
            ${state.multipliers.map((m, idx) => `
              <div class="highway-lane" data-lane="${idx}">
                <div class="lane-num">LANE ${idx + 1} (${m}×)</div>
                <div class="lane-status" id="laneStatus${idx}">SAFE</div>
              </div>
            `).join('')}
          </div>
          <div class="dice-status-banner" id="chickenStatusBanner">
            Help Chaos Cat/Chicken hop across 6 dangerous highway lanes. Avoid speeding Downvote trucks!
          </div>
        </div>
      </div>
    `;

    const startBtn = document.getElementById('btnStartChicken');
    const stepBtn = document.getElementById('btnStepChicken');
    const cashBtn = document.getElementById('btnCashoutChicken');
    const multText = document.getElementById('chickenMultText');
    const nextText = document.getElementById('chickenNextText');
    const statusBanner = document.getElementById('chickenStatusBanner');
    const betInput = document.getElementById('chickenBetInput');

    startBtn.addEventListener('click', () => {
      bet = parseInt(betInput.value) || 50;
      if (this.game && !this.game.spendPoints(bet)) {
        statusBanner.innerText = `Need ${bet} Karma to start cross!`;
        return;
      }
      this.updateKarmaDisplay();

      state.active = true;
      state.bet = bet;
      state.currentStep = 0;

      // Reset lanes
      for (let i = 0; i < 6; i++) {
        const lane = document.getElementById(`laneStatus${i}`);
        lane.innerText = 'READY';
        lane.parentElement.className = 'highway-lane';
      }

      startBtn.classList.add('hidden');
      stepBtn.classList.remove('hidden');
      cashBtn.classList.remove('hidden');
      cashBtn.innerText = `CASH OUT (${bet} Karma)`;
      multText.innerText = '1.00×';
      nextText.innerText = `${state.multipliers[0]}×`;
      statusBanner.innerText = 'Ready on the curb! Press STEP FORWARD to cross Lane 1.';
    });

    stepBtn.addEventListener('click', () => {
      if (!state.active) return;
      const step = state.currentStep;

      // 20% chance of Downvote Truck collision
      const hitTruck = Math.random() < 0.22;
      const laneEl = document.getElementById(`laneStatus${step}`);

      if (hitTruck) {
        state.active = false;
        laneEl.innerText = '💥 TRUCK HIT!';
        laneEl.parentElement.classList.add('crashed');
        statusBanner.innerHTML = `<span style="color:#e74c3c; font-weight:800;">💥 DOWNVOTE TRUCK SPLASH! Lost ${state.bet} Karma in Lane ${step + 1}!</span>`;
        if (this.sound) this.sound.defeat();

        stepBtn.classList.add('hidden');
        cashBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
        startBtn.innerText = 'TRY AGAIN';
      } else {
        laneEl.innerText = '🐾 CROSSED';
        laneEl.parentElement.classList.add('cleared');
        if (this.sound) this.sound.upvote();

        const curMult = state.multipliers[step];
        multText.innerText = `${curMult}×`;
        const currentPayout = Math.floor(state.bet * curMult);
        cashBtn.innerText = `CASH OUT (${currentPayout} Karma)`;
        state.currentStep++;

        if (state.currentStep >= state.multipliers.length) {
          // Cleared all 6 lanes!
          state.active = false;
          statusBanner.innerHTML = `<span style="color:#2ecc71; font-weight:900;">🏆 HIGHWAY MASTERED! Reached final lane for ${curMult}×!</span>`;
          if (this.game) this.game.addPoints(currentPayout);
          this.updateKarmaDisplay();
          if (this.sound) this.sound.award();

          stepBtn.classList.add('hidden');
          cashBtn.classList.add('hidden');
          startBtn.classList.remove('hidden');
          startBtn.innerText = 'PLAY AGAIN';
        } else {
          nextText.innerText = `${state.multipliers[state.currentStep]}×`;
          statusBanner.innerText = `Step ${state.currentStep} safe! Payout: ${currentPayout} Karma. Step again or Cash Out?`;
        }
      }
    });

    cashBtn.addEventListener('click', () => {
      if (!state.active) return;
      state.active = false;
      const curMult = state.currentStep > 0 ? state.multipliers[state.currentStep - 1] : 1.0;
      const won = Math.floor(state.bet * curMult);
      if (this.game) this.game.addPoints(won);
      this.updateKarmaDisplay();
      if (this.sound) this.sound.award();

      statusBanner.innerHTML = `<span style="color:#2ecc71; font-weight:800;">💰 CASHED OUT SAFE! Won +${won} Karma (${curMult}×)!</span>`;
      stepBtn.classList.add('hidden');
      cashBtn.classList.add('hidden');
      startBtn.classList.remove('hidden');
      startBtn.innerText = 'START NEXT RUN';
    });
  }

  // ===========================================================================
  // GAME 6: 🔮 MOD TAROT (Son I: Mod Wizard)
  // ===========================================================================
  mountTarot(container) {
    let bet = 75;
    const cardsDeck = [
      { name: 'The Upvote Sun', emoji: '☀️', mult: 2.5, desc: 'Bountiful Karma +2.5x' },
      { name: 'Patriarch Prime', emoji: '👑', mult: 8.0, desc: 'Ancestral Dynasty Blessing +8.0x' },
      { name: 'Automod Aegis', emoji: '🛡️', mult: 1.8, desc: 'Shield of Moderation +1.8x' },
      { name: 'Viral Spike', emoji: '⚡', mult: 3.5, desc: 'Trending Frontpage +3.5x' },
      { name: 'Lurker Moon', emoji: '🌙', mult: 1.2, desc: 'Silent Observer +1.2x' },
      { name: 'Karma Empress', emoji: '👸', mult: 4.0, desc: 'Abundance of Upvotes +4.0x' },
      { name: 'Cosmic Ternion', emoji: '🌌', mult: 15.0, desc: 'Grand Celestial Award +15.0x' },
      { name: 'Shadowban Void', emoji: '💀', mult: 0.2, desc: 'Curse of Silence (Downvote)' }
    ];

    container.innerHTML = `
      <div class="tarot-game-layout">
        <div class="game-control-panel">
          <label class="control-label">DIVINATION OFFERING (KARMA)</label>
          <div class="bet-input-row">
            <input type="number" id="tarotBetInput" value="${bet}" min="20" />
            <button class="quick-bet-btn" id="btnTarotHalf">½</button>
            <button class="quick-bet-btn" id="btnTarotDouble">2×</button>
          </div>

          <button class="action-play-btn" id="btnDrawTarot" style="margin-top:20px;">
            🔮 DRAW 3 CARDS
          </button>
        </div>

        <div class="game-stage-panel">
          <div class="tarot-cards-stage" id="tarotStage">
            <div class="tarot-card" id="tCard0">
              <div class="card-back">🧙‍♂️<br>ONLYSONS</div>
              <div class="card-front"></div>
            </div>
            <div class="tarot-card" id="tCard1">
              <div class="card-back">🧙‍♂️<br>ONLYSONS</div>
              <div class="card-front"></div>
            </div>
            <div class="tarot-card" id="tCard2">
              <div class="card-back">🧙‍♂️<br>ONLYSONS</div>
              <div class="card-front"></div>
            </div>
          </div>
          <div class="dice-status-banner" id="tarotStatusBanner">
            Draw 3 mystical Reddit cards with Son I: Mod Wizard to foresee your fortune!
          </div>
        </div>
      </div>
    `;

    const drawBtn = document.getElementById('btnDrawTarot');
    const statusBanner = document.getElementById('tarotStatusBanner');
    const betInput = document.getElementById('tarotBetInput');

    drawBtn.addEventListener('click', () => {
      bet = parseInt(betInput.value) || 75;
      if (this.game && !this.game.spendPoints(bet)) {
        statusBanner.innerText = `Need ${bet} Karma for divination!`;
        return;
      }
      this.updateKarmaDisplay();

      // Reset card flips
      for (let i = 0; i < 3; i++) {
        const c = document.getElementById(`tCard${i}`);
        c.classList.remove('flipped');
      }

      // Pick 3 random cards
      const drawn = [
        cardsDeck[Math.floor(Math.random() * cardsDeck.length)],
        cardsDeck[Math.floor(Math.random() * cardsDeck.length)],
        cardsDeck[Math.floor(Math.random() * cardsDeck.length)]
      ];

      statusBanner.innerText = 'Channeling the Mod Council...';

      // Animate flip one by one
      drawn.forEach((card, idx) => {
        setTimeout(() => {
          const el = document.getElementById(`tCard${idx}`);
          const front = el.querySelector('.card-front');
          front.innerHTML = `
            <div style="font-size:32px;">${card.emoji}</div>
            <div style="font-size:12px; font-weight:800; margin-top:6px;">${card.name}</div>
            <div style="font-size:14px; color:#ffd700; font-weight:900; margin-top:4px;">${card.mult}×</div>
            <div style="font-size:10px; color:#95afc0; margin-top:2px;">${card.desc}</div>
          `;
          el.classList.add('flipped');
          if (this.sound) this.sound.playTone(550 + idx * 200, 'triangle', 0.15, 0.2);

          // After all 3 cards flip
          if (idx === 2) {
            const combinedMult = parseFloat(((drawn[0].mult + drawn[1].mult + drawn[2].mult) / 3.0).toFixed(2));
            const won = Math.floor(bet * combinedMult);
            if (this.game) this.game.addPoints(won);
            this.updateKarmaDisplay();
            if (this.sound) this.sound.award();

            statusBanner.innerHTML = `<span style="color:#ffd700; font-weight:800;">✨ PROPHECY REVEALED! Combined Multiplier: ${combinedMult}× (+${won} Karma)!</span>`;
          }
        }, (idx + 1) * 650);
      });
    });
  }

  // ===========================================================================
  // GAME 7: 💎 STONK KENO (Son IV: WSB Ape)
  // ===========================================================================
  mountKeno(container) {
    let bet = 50;
    let selected = [];

    container.innerHTML = `
      <div class="keno-game-layout">
        <div class="game-control-panel">
          <label class="control-label">BET AMOUNT (KARMA)</label>
          <div class="bet-input-row">
            <input type="number" id="kenoBetInput" value="${bet}" min="10" />
            <button class="quick-bet-btn" id="btnKenoHalf">½</button>
            <button class="quick-bet-btn" id="btnKenoDouble">2×</button>
          </div>

          <div class="stat-readout-grid" style="margin-top:16px;">
            <div class="stat-readout">
              <span>SELECTED</span>
              <strong id="kenoSelectedCount">0 / 10</strong>
            </div>
            <div class="stat-readout">
              <span>MATCHES</span>
              <strong id="kenoMatchCount" style="color:#2ecc71;">0</strong>
            </div>
          </div>

          <button class="action-play-btn" id="btnDrawKeno" style="margin-top:20px;">
            💎 DRAW 10 NUMBERS
          </button>
          <button class="action-cashout-btn" id="btnClearKeno" style="margin-top:8px; background:rgba(255,255,255,0.1);">
            CLEAR SELECTION
          </button>
        </div>

        <div class="game-stage-panel">
          <div class="keno-grid-40" id="kenoGrid">
            ${Array.from({ length: 40 }).map((_, i) => `
              <div class="keno-tile" data-val="${i + 1}">${i + 1}</div>
            `).join('')}
          </div>
          <div class="dice-status-banner" id="kenoStatusBanner">
            Pick 1 to 10 lucky numbers on WSB Ape's board, then click DRAW 10 NUMBERS!
          </div>
        </div>
      </div>
    `;

    const grid = document.getElementById('kenoGrid');
    const drawBtn = document.getElementById('btnDrawKeno');
    const clearBtn = document.getElementById('btnClearKeno');
    const selCount = document.getElementById('kenoSelectedCount');
    const matchCount = document.getElementById('kenoMatchCount');
    const statusBanner = document.getElementById('kenoStatusBanner');
    const betInput = document.getElementById('kenoBetInput');
    const tiles = grid.querySelectorAll('.keno-tile');

    tiles.forEach(t => {
      t.addEventListener('click', () => {
        const val = parseInt(t.getAttribute('data-val'));
        if (selected.includes(val)) {
          selected = selected.filter(x => x !== val);
          t.classList.remove('selected');
        } else if (selected.length < 10) {
          selected.push(val);
          t.classList.add('selected');
          if (this.sound) this.sound.upvote();
        }
        selCount.innerText = `${selected.length} / 10`;
      });
    });

    clearBtn.addEventListener('click', () => {
      selected = [];
      tiles.forEach(t => t.className = 'keno-tile');
      selCount.innerText = '0 / 10';
      matchCount.innerText = '0';
    });

    drawBtn.addEventListener('click', () => {
      if (selected.length === 0) {
        statusBanner.innerText = 'Please select at least 1 number first!';
        return;
      }
      bet = parseInt(betInput.value) || 50;
      if (this.game && !this.game.spendPoints(bet)) {
        statusBanner.innerText = `Need ${bet} Karma to play Keno!`;
        return;
      }
      this.updateKarmaDisplay();

      // Reset tile drawings
      tiles.forEach(t => {
        if (!selected.includes(parseInt(t.getAttribute('data-val')))) {
          t.className = 'keno-tile';
        }
      });

      // Draw 10 random numbers
      const drawn = [];
      while (drawn.length < 10) {
        const n = Math.floor(Math.random() * 40) + 1;
        if (!drawn.includes(n)) drawn.push(n);
      }

      let matches = 0;
      drawn.forEach((num, idx) => {
        setTimeout(() => {
          const tile = grid.querySelector(`[data-val="${num}"]`);
          if (selected.includes(num)) {
            tile.className = 'keno-tile match';
            matches++;
            matchCount.innerText = matches;
            if (this.sound) this.sound.award();
          } else {
            tile.className = 'keno-tile drawn';
            if (this.sound) this.sound.hit();
          }

          if (idx === 9) {
            // Calculate payout
            let mult = 0;
            if (matches === 1) mult = 1.2;
            else if (matches === 2) mult = 2.0;
            else if (matches === 3) mult = 5.0;
            else if (matches === 4) mult = 15.0;
            else if (matches >= 5) mult = 50.0;

            const won = Math.floor(bet * mult);
            if (won > 0) {
              if (this.game) this.game.addPoints(won);
              this.updateKarmaDisplay();
              statusBanner.innerHTML = `<span style="color:#2ecc71; font-weight:800;">🎉 ${matches} MATCHES! Won +${won} Karma (${mult}×)!</span>`;
            } else {
              statusBanner.innerHTML = `<span style="color:#e74c3c;">No winning matches this draw. Roll again!</span>`;
            }
          }
        }, idx * 120);
      });
    });
  }

  // ===========================================================================
  // GAME 8: 🎯 LIMBO MULTIPLIER (Son I: Mod Wizard)
  // ===========================================================================
  mountLimbo(container) {
    let bet = 50;
    let target = 2.0;

    container.innerHTML = `
      <div class="limbo-game-layout">
        <div class="game-control-panel">
          <label class="control-label">BET AMOUNT (KARMA)</label>
          <div class="bet-input-row">
            <input type="number" id="limboBetInput" value="${bet}" min="10" />
            <button class="quick-bet-btn" id="btnLimboHalf">½</button>
            <button class="quick-bet-btn" id="btnLimboDouble">2×</button>
          </div>

          <label class="control-label" style="margin-top:14px;">TARGET MULTIPLIER</label>
          <input type="number" id="limboTargetInput" value="${target}" min="1.05" max="1000" step="0.1" class="mines-select" />

          <div class="stat-readout-grid" style="margin-top:16px;">
            <div class="stat-readout">
              <span>WIN CHANCE</span>
              <strong id="limboChanceText">${(98 / target).toFixed(1)}%</strong>
            </div>
            <div class="stat-readout">
              <span>PROFIT ON WIN</span>
              <strong id="limboProfitText" style="color:#2ecc71;">+${Math.floor(bet * (target - 1))} Karma</strong>
            </div>
          </div>

          <button class="action-play-btn" id="btnSpinLimbo" style="margin-top:20px;">
            🎯 SPIN LIMBO
          </button>
        </div>

        <div class="game-stage-panel">
          <div class="limbo-visual-stage">
            <div class="limbo-big-roll" id="limboRollDisplay">1.00×</div>
            <div class="limbo-target-badge" id="limboTargetBadge">TARGET: ${target.toFixed(2)}×</div>
          </div>
          <div class="dice-status-banner" id="limboStatusBanner">
            Target high multipliers up to 1000x with Son I: Mod Wizard!
          </div>
        </div>
      </div>
    `;

    const rollDisplay = document.getElementById('limboRollDisplay');
    const spinBtn = document.getElementById('btnSpinLimbo');
    const statusBanner = document.getElementById('limboStatusBanner');
    const betInput = document.getElementById('limboBetInput');
    const targetInput = document.getElementById('limboTargetInput');
    const chanceText = document.getElementById('limboChanceText');
    const profitText = document.getElementById('limboProfitText');
    const badge = document.getElementById('limboTargetBadge');

    targetInput.addEventListener('input', () => {
      target = parseFloat(targetInput.value) || 2.0;
      bet = parseInt(betInput.value) || 50;
      chanceText.innerText = `${Math.min(95, (98 / target)).toFixed(1)}%`;
      profitText.innerText = `+${Math.floor(bet * (target - 1))} Karma`;
      badge.innerText = `TARGET: ${target.toFixed(2)}×`;
    });

    spinBtn.addEventListener('click', () => {
      bet = parseInt(betInput.value) || 50;
      target = parseFloat(targetInput.value) || 2.0;
      if (this.game && !this.game.spendPoints(bet)) {
        statusBanner.innerText = `Need ${bet} Karma to spin Limbo!`;
        return;
      }
      this.updateKarmaDisplay();

      // Quick rolling animation
      let tick = 0;
      const interval = setInterval(() => {
        rollDisplay.innerText = `${(1 + Math.random() * (target * 1.5)).toFixed(2)}×`;
        tick++;
        if (tick > 12) {
          clearInterval(interval);
          // Roll generation: 98% edge
          const roll = parseFloat((0.98 / (1 - Math.random())).toFixed(2));
          rollDisplay.innerText = `${roll.toFixed(2)}×`;

          if (roll >= target) {
            const won = Math.floor(bet * target);
            rollDisplay.style.color = '#2ecc71';
            statusBanner.innerHTML = `<span style="color:#2ecc71; font-weight:800;">🎉 TARGET SURPASSED! Rolled ${roll.toFixed(2)}× (Won +${won} Karma)!</span>`;
            if (this.game) this.game.addPoints(won);
            this.updateKarmaDisplay();
            if (this.sound) this.sound.award();
          } else {
            rollDisplay.style.color = '#e74c3c';
            statusBanner.innerHTML = `<span style="color:#e74c3c;">Under target! Rolled ${roll.toFixed(2)}×. Try again!</span>`;
            if (this.sound) this.sound.hit();
          }
        }
      }, 30);
    });
  }
}
