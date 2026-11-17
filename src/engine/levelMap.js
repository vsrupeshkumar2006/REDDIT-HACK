/**
 * KarmaCrunch: Interactive 100-Level World Map Engine
 * Built by Rupesh Kumar, Eshwar Kartik, and Prashant
 */

export class LevelMapEngine {
  constructor(containerId, onSelectLevel) {
    this.container = document.getElementById(containerId);
    this.onSelectLevel = onSelectLevel;
    this.unlockedLevel = 1;
    this.levelStars = {}; // { levelNum: starsCount (1-3) }
  }

  setUnlockedLevel(level) {
    this.unlockedLevel = Math.max(this.unlockedLevel, level);
    this.render();
  }

  setLevelStars(level, stars) {
    this.levelStars[level] = Math.max(this.levelStars[level] || 0, stars);
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const mapScroll = document.createElement('div');
    mapScroll.className = 'level-map-scroll-track';

    for (let lvl = 1; lvl <= 100; lvl++) {
      const node = document.createElement('div');
      const isUnlocked = lvl <= this.unlockedLevel;
      const isCurrent = lvl === this.unlockedLevel;
      const isBoss = (lvl % 10 === 0) || lvl === 100;

      node.className = `level-node-item ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''} ${isBoss ? 'boss' : ''}`;
      
      const starsEarned = this.levelStars[lvl] || (isUnlocked && lvl < this.unlockedLevel ? 3 : 0);
      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += `<span style="color:${s <= starsEarned ? '#ffd700' : '#444'}; font-size:10px;">★</span>`;
      }

      node.innerHTML = `
        <div class="node-icon">${isBoss ? '👑' : lvl}</div>
        <div class="node-stars">${starsHtml}</div>
        <div class="node-label">Lvl ${lvl}</div>
      `;

      if (isUnlocked) {
        node.addEventListener('click', () => {
          if (this.onSelectLevel) this.onSelectLevel(lvl);
        });
      }

      mapScroll.appendChild(node);
    }

    this.container.appendChild(mapScroll);
  }
}
