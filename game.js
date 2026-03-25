// 魔法跳跃 - Magic Jump v4.0
// 新增：8-bit BGM系统 + 三种新道具（二段跳靴子/无敌药水/减速时间）

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ==================== 游戏配置 ====================
const GROUND_Y = 330;
const CANVAS_W = 800;
const CANVAS_H = 420;

// 关卡配置
const LEVELS = {
    forest: {
        name: '🌲 魔法森林',
        skyColors: ['#0d0221', '#1a0536', '#2d1b69'],
        groundColor: '#1a3a1a',
        groundTopColor: '#2d5a2d',
        glowColor: '#7fff7f',
        obstacleTypes: ['spike', 'rock', 'mushroom', 'spider', 'venus'],
        gameSpeed: 4.5,
        targetDistance: 500,
        bgElements: 'forest',
        bgmScale: [262, 294, 330, 349, 392, 440, 494, 523], // C大调
        bgmTempo: 180
    },
    desert: {
        name: '🏜️ 炽热沙漠',
        skyColors: ['#1a0a00', '#3d1f00', '#8B4513'],
        groundColor: '#5a3a00',
        groundTopColor: '#c8860a',
        glowColor: '#ffaa44',
        obstacleTypes: ['cactus', 'rock', 'flame', 'scorpion', 'cactusBall'],
        gameSpeed: 5.5,
        targetDistance: 800,
        bgElements: 'desert',
        bgmScale: [220, 247, 262, 294, 330, 370, 392, 440], // A小调
        bgmTempo: 160
    },
    ice: {
        name: '❄️ 冰雪王国',
        skyColors: ['#000510', '#001833', '#003a6e'],
        groundColor: '#1a3a5c',
        groundTopColor: '#5ab4e8',
        glowColor: '#88ddff',
        obstacleTypes: ['icicle', 'snowball', 'iceblock', 'penguin', 'crystal'],
        gameSpeed: 6.5,
        targetDistance: 1000,
        bgElements: 'ice',
        bgmScale: [294, 330, 370, 392, 440, 494, 554, 587], // G大调
        bgmTempo: 200
    },
    ocean: {
        name: '🌊 深海秘境',
        skyColors: ['#000814', '#001d3d', '#003566'],
        groundColor: '#0a2540',
        groundTopColor: '#1e6091',
        glowColor: '#00b4d8',
        obstacleTypes: ['coral', 'jellyfish', 'mine', 'shark', 'seaweed'],
        gameSpeed: 5.0,
        targetDistance: 1200,
        bgElements: 'ocean',
        bgmScale: [196, 220, 247, 262, 294, 330, 370, 392], // G小调
        bgmTempo: 140
    },
    space: {
        name: '🚀 星际穿越',
        skyColors: ['#000000', '#0a0a2e', '#1a1a3e'],
        groundColor: '#2d1b4e',
        groundTopColor: '#4a148c',
        glowColor: '#e040fb',
        obstacleTypes: ['asteroid', 'laser', 'ufo', 'satellite', 'comet'],
        gameSpeed: 7.0,
        targetDistance: 1500,
        bgElements: 'space',
        bgmScale: [165, 196, 220, 262, 294, 330, 392, 440], // E小调
        bgmTempo: 220
    }
};

// 技能配置
const SKILLS = {
    doubleJump: { name: '二段跳', key: 'KeyZ', cost: 30, duration: 0, color: '#3498db' },
    shield: { name: '魔法护盾', key: 'KeyX', cost: 50, duration: 300, color: '#2ecc71' },
    dash: { name: '冲刺', key: 'KeyC', cost: 40, duration: 30, color: '#e74c3c' }
};

// 道具配置（新增三种！）
const POWERUPS = {
    magnet: { 
        name: '磁铁', duration: 300, color: '#e91e63',
        icon: '🧲', desc: '自动吸附星星'
    },
    speed: { 
        name: '疾风靴', duration: 180, color: '#ff9800',
        icon: '⚡', desc: '移动速度+50%'
    },
    multiplier: { 
        name: '双倍星', duration: 300, color: '#9c27b0',
        icon: '✨', desc: '星星价值×2'
    },
    // ===== 三种新道具 =====
    boots: {
        name: '跳跃靴', duration: 400, color: '#00bcd4',
        icon: '👟', desc: '永久二段跳'
    },
    invincible: {
        name: '无敌药水', duration: 240, color: '#ff5722',
        icon: '🔥', desc: '无敌+彩虹残影'
    },
    slowmo: {
        name: '时间减速', duration: 300, color: '#607d8b',
        icon: '⏱️', desc: '世界减速，我不变'
    }
};

// 机关配置
const MECHANISMS = {
    platform: {
        name: '移动平台',
        width: 80,
        height: 12,
        color: '#8b5cf6',
        moveRange: 100,
        speed: 1.5
    },
    spring: {
        name: '弹簧',
        width: 36,
        height: 24,
        color: '#fbbf24',
        bounceForce: -18
    },
    portal: {
        name: '传送门',
        width: 50,
        height: 80,
        color: '#06b6d4',
        teleportDistance: 200
    }
};

// Boss配置
const BOSSES = {
    forest: {
        name: '古树精',
        health: 100,
        width: 100,
        height: 120,
        color: '#5d4037',
        attacks: ['vineWhip', 'sporeCloud', 'rootSpike'],
        attackInterval: 120
    },
    desert: {
        name: '沙虫王',
        health: 120,
        width: 120,
        height: 80,
        color: '#d4a574',
        attacks: ['burrow', 'sandStorm', 'tailSwipe'],
        attackInterval: 100
    },
    ice: {
        name: '冰霜巨人',
        health: 150,
        width: 110,
        height: 130,
        color: '#4fc3f7',
        attacks: ['iceBeam', 'groundSmash', 'frostNova'],
        attackInterval: 110
    },
    ocean: {
        name: '深海章鱼',
        health: 130,
        width: 100,
        height: 100,
        color: '#7c4dff',
        attacks: ['tentacle', 'inkCloud', 'suction'],
        attackInterval: 90
    },
    space: {
        name: '机械母舰',
        health: 180,
        width: 140,
        height: 90,
        color: '#ff5722',
        attacks: ['laserSweep', 'droneSummon', 'missile'],
        attackInterval: 80
    }
};

// ==================== 游戏状态 ====================
let gameState = 'menu';
let currentLevel = 'forest';
let score = 0;
let distance = 0;
let gameSpeed = 4.5;
let frameCount = 0;
let starCount = 0;
let screenShake = 0;

let playerData = {
    unlockedLevels: ['forest'],
    unlockedSkills: [],
    achievements: [],
    totalStars: 0,
    highScore: 0,
    
    // 成长系统
    level: 1,
    exp: 0,
    expToNext: 100,
    statPoints: 0,
    
    // 属性加成
    stats: {
        jumpPower: 0,      // 跳跃高度加成
        moveSpeed: 0,      // 移动速度加成
        shieldDuration: 0, // 护盾持续时间加成
        energyRegen: 0,    // 能量恢复速度加成
        starValue: 0       // 星星价值加成
    }
};

// 成长系统配置
const LEVEL_CONFIG = {
    maxLevel: 50,
    expMultiplier: 1.2,  // 每级经验需求增长倍数
    baseExp: 100         // 基础经验需求
};

// 经验获取配置
const EXP_REWARDS = {
    star: 5,           // 收集星星
    obstacle: 10,      // 躲避障碍
    bossHit: 20,       // 击中BOSS
    bossDefeat: 200,   // 击败BOSS
    levelComplete: 100 // 完成关卡
};

// 属性升级配置
const STAT_UPGRADES = {
    jumpPower: { name: '跳跃强化', max: 10, cost: 1, bonus: 0.5 },
    moveSpeed: { name: '疾风步', max: 10, cost: 1, bonus: 0.3 },
    shieldDuration: { name: '护盾精通', max: 10, cost: 1, bonus: 30 },
    energyRegen: { name: '能量恢复', max: 10, cost: 1, bonus: 2 },
    starValue: { name: '财富之手', max: 5, cost: 2, bonus: 0.2 }
};

// 游戏对象数组
let obstacles = [];
let stars = [];
let powerupItems = [];
let mechanisms = []; // 机关数组
let boss = null; // Boss对象
let bossProjectiles = []; // Boss投射物
let particles = [];
let bgParticles = [];
let meteors = [];
let floatingTexts = [];
let bgStars = [];
let bgClouds = [];
let bgTrees = [];

// ==================== 玩家对象 ====================
const player = {
    x: 120,
    y: GROUND_Y - 56,
    width: 38,
    height: 52,
    velocityX: 0,
    velocityY: 0,
    jumping: false,
    jumpCount: 0,
    maxJumps: 1,
    jumpPower: -15,
    gravity: 0.75,
    speed: 4.5,
    trail: [],
    facingRight: true,
    walkFrame: 0,
    walkTimer: 0,
    rainbowHue: 0,
    
    skills: {
        doubleJump: { unlocked: false, energy: 100 },
        shield: { unlocked: false, active: false, timer: 0 },
        dash: { unlocked: false, active: false, timer: 0 }
    },
    powerups: {
        magnet: { active: false, timer: 0 },
        speed: { active: false, timer: 0 },
        multiplier: { active: false, timer: 0 },
        boots: { active: false, timer: 0 },
        invincible: { active: false, timer: 0 },
        slowmo: { active: false, timer: 0 }
    },
    shieldActive: false,
    shieldTimer: 0
};

const keys = { left: false, right: false, up: false };

// ==================== 音频系统 v4.0 ====================
let audioContext;
let bgmNodes = [];
let bgmPlaying = false;
let bgmEnabled = true;
let sfxEnabled = true;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

// ---- 音效 ----
function playSound(type) {
    if (!sfxEnabled) return;
    try {
        const ac = getAudioContext();
        
        // 使用复合音效（多个振荡器叠加）
        const t = ac.currentTime;
        
        const sounds = {
            jump: () => {
                // 跳跃：上扫音+轻弹
                const osc1 = ac.createOscillator();
                const gain1 = ac.createGain();
                osc1.connect(gain1); gain1.connect(ac.destination);
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(300, t);
                osc1.frequency.exponentialRampToValueAtTime(650, t + 0.1);
                gain1.gain.setValueAtTime(0.22, t);
                gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc1.start(t); osc1.stop(t + 0.15);
                // 短噪音弹起感
                const osc2 = ac.createOscillator();
                const gain2 = ac.createGain();
                osc2.connect(gain2); gain2.connect(ac.destination);
                osc2.type = 'square';
                osc2.frequency.setValueAtTime(180, t);
                osc2.frequency.exponentialRampToValueAtTime(90, t + 0.05);
                gain2.gain.setValueAtTime(0.08, t);
                gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
                osc2.start(t); osc2.stop(t + 0.06);
            },
            
            doubleJump: () => {
                // 二段跳：魔法音阶往上跑
                [0, 1, 2].forEach((i) => {
                    const osc = ac.createOscillator();
                    const gain = ac.createGain();
                    osc.connect(gain); gain.connect(ac.destination);
                    osc.type = 'triangle';
                    const freq = 500 * Math.pow(1.3, i);
                    osc.frequency.setValueAtTime(freq, t + i * 0.05);
                    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + i * 0.05 + 0.08);
                    gain.gain.setValueAtTime(0.18, t + i * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.12);
                    osc.start(t + i * 0.05);
                    osc.stop(t + i * 0.05 + 0.12);
                });
            },
            
            collect: () => {
                // 收集：明快的叮咚声
                const freqs = [880, 1108, 1320];
                freqs.forEach((freq, i) => {
                    const osc = ac.createOscillator();
                    const gain = ac.createGain();
                    osc.connect(gain); gain.connect(ac.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t + i * 0.03);
                    gain.gain.setValueAtTime(0.15, t + i * 0.03);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.1);
                    osc.start(t + i * 0.03);
                    osc.stop(t + i * 0.03 + 0.12);
                });
            },
            
            powerup: () => {
                // 道具：上行琶音
                const scale = [523, 659, 784, 1047, 1319];
                scale.forEach((freq, i) => {
                    const osc = ac.createOscillator();
                    const gain = ac.createGain();
                    osc.connect(gain); gain.connect(ac.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t + i * 0.06);
                    gain.gain.setValueAtTime(0.2, t + i * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
                    osc.start(t + i * 0.06);
                    osc.stop(t + i * 0.06 + 0.18);
                });
            },
            
            gameover: () => {
                // 死亡：下沉音+噼啪
                const osc1 = ac.createOscillator();
                const gain1 = ac.createGain();
                osc1.connect(gain1); gain1.connect(ac.destination);
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(400, t);
                osc1.frequency.exponentialRampToValueAtTime(60, t + 0.7);
                gain1.gain.setValueAtTime(0.3, t);
                gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
                osc1.start(t); osc1.stop(t + 0.8);
                // 碰撞噪音
                [0, 0.08, 0.18].forEach(delay => {
                    const osc2 = ac.createOscillator();
                    const gain2 = ac.createGain();
                    osc2.connect(gain2); gain2.connect(ac.destination);
                    osc2.type = 'square';
                    osc2.frequency.setValueAtTime(80 + Math.random() * 40, t + delay);
                    gain2.gain.setValueAtTime(0.15, t + delay);
                    gain2.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
                    osc2.start(t + delay); osc2.stop(t + delay + 0.12);
                });
            },
            
            shield: () => {
                // 护盾激活：金属光晕音
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                const reverb = ac.createDelay(0.5);
                osc.connect(gain); gain.connect(reverb); reverb.connect(ac.destination); gain.connect(ac.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, t);
                osc.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
                osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                reverb.delayTime.setValueAtTime(0.08, t);
                osc.start(t); osc.stop(t + 0.4);
            },
            
            dash: () => {
                // 冲刺：音量爆发
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                osc.connect(gain); gain.connect(ac.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                osc.start(t); osc.stop(t + 0.2);
            },
            
            invincible: () => {
                // 无敌：英雄号角
                [262, 330, 392, 523].forEach((freq, i) => {
                    const osc = ac.createOscillator();
                    const gain = ac.createGain();
                    osc.connect(gain); gain.connect(ac.destination);
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, t + i * 0.07);
                    gain.gain.setValueAtTime(0.15, t + i * 0.07);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.2);
                    osc.start(t + i * 0.07);
                    osc.stop(t + i * 0.07 + 0.25);
                });
            },
            
            slowmo: () => {
                // 时间减速：低沉拉伸音
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                osc.connect(gain); gain.connect(ac.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, t);
                osc.frequency.exponentialRampToValueAtTime(110, t + 0.5);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                osc.start(t); osc.stop(t + 0.6);
            },
            
            boots: () => {
                // 跳跃靴：弹簧音
                [500, 750, 600, 900].forEach((freq, i) => {
                    const osc = ac.createOscillator();
                    const gain = ac.createGain();
                    osc.connect(gain); gain.connect(ac.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, t + i * 0.04);
                    gain.gain.setValueAtTime(0.15, t + i * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.08);
                    osc.start(t + i * 0.04);
                    osc.stop(t + i * 0.04 + 0.1);
                });
            },
            
            levelComplete: () => {
                // 过关：胜利音阶
                const melody = [523, 659, 784, 659, 784, 880, 1047];
                melody.forEach((freq, i) => {
                    const osc = ac.createOscillator();
                    const gain = ac.createGain();
                    osc.connect(gain); gain.connect(ac.destination);
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, t + i * 0.1);
                    gain.gain.setValueAtTime(0.2, t + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.15);
                    osc.start(t + i * 0.1);
                    osc.stop(t + i * 0.1 + 0.18);
                });
            }
        };
        
        if (sounds[type]) sounds[type]();
        
    } catch(e) {}
}

// ---- BGM 系统 ----
// 每个关卡有独特的8-bit旋律
const BGM_MELODIES = {
    forest: {
        notes: [0, 2, 4, 5, 4, 2, 0, 2, 4, 7, 5, 4, 2, 4, 5, 4],
        bass:  [0, 0, 4, 4, 3, 3, 0, 0, 5, 5, 4, 4, 2, 2, 0, 0],
        durations: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4]
    },
    desert: {
        notes: [0, 3, 5, 3, 0, 5, 3, 0, 2, 5, 3, 2, 0, 3, 5, 7],
        bass:  [0, 0, 3, 3, 5, 5, 3, 3, 0, 0, 2, 2, 5, 5, 3, 0],
        durations: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5, 0.25]
    },
    ice: {
        notes: [0, 2, 4, 2, 0, 4, 5, 4, 2, 0, 2, 4, 7, 5, 4, 2],
        bass:  [0, 0, 0, 4, 4, 4, 5, 5, 3, 3, 2, 2, 7, 7, 5, 0],
        durations: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.3, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.3, 0.6]
    }
};

let bgmLoop = null;
let bgmGainNode = null;
let bgmVolume = 0.12;

function startBGM(level) {
    if (!bgmEnabled) return;
    stopBGM();
    
    try {
        const ac = getAudioContext();
        const levelData = LEVELS[level];
        const melody = BGM_MELODIES[level];
        const scale = levelData.bgmScale;
        
        bgmGainNode = ac.createGain();
        bgmGainNode.gain.setValueAtTime(bgmVolume, ac.currentTime);
        bgmGainNode.connect(ac.destination);
        
        let noteIdx = 0;
        let nextNoteTime = ac.currentTime + 0.1;
        
        // 调度未来的音符
        function scheduleBGM() {
            // 预调度0.5秒内的音符
            while (nextNoteTime < ac.currentTime + 0.5) {
                const idx = noteIdx % melody.notes.length;
                const duration = melody.durations[idx];
                const baseNote = melody.notes[idx];
                const bassNote = melody.bass[idx];
                
                if (scale[baseNote] !== undefined) {
                    // 主旋律
                    const osc1 = ac.createOscillator();
                    const gain1 = ac.createGain();
                    osc1.connect(gain1); gain1.connect(bgmGainNode);
                    osc1.type = 'square';
                    osc1.frequency.setValueAtTime(scale[baseNote], nextNoteTime);
                    gain1.gain.setValueAtTime(0.0, nextNoteTime);
                    gain1.gain.linearRampToValueAtTime(0.6, nextNoteTime + 0.01);
                    gain1.gain.setValueAtTime(0.5, nextNoteTime + duration * 0.8);
                    gain1.gain.linearRampToValueAtTime(0.0, nextNoteTime + duration);
                    osc1.start(nextNoteTime);
                    osc1.stop(nextNoteTime + duration + 0.02);
                    bgmNodes.push(osc1);
                }
                
                // 低音（低八度，更柔和的三角波）
                if (scale[bassNote % scale.length] !== undefined) {
                    const osc2 = ac.createOscillator();
                    const gain2 = ac.createGain();
                    osc2.connect(gain2); gain2.connect(bgmGainNode);
                    osc2.type = 'triangle';
                    osc2.frequency.setValueAtTime(scale[bassNote % scale.length] / 2, nextNoteTime);
                    gain2.gain.setValueAtTime(0.0, nextNoteTime);
                    gain2.gain.linearRampToValueAtTime(0.4, nextNoteTime + 0.01);
                    gain2.gain.setValueAtTime(0.3, nextNoteTime + duration * 0.5);
                    gain2.gain.linearRampToValueAtTime(0.0, nextNoteTime + duration);
                    osc2.start(nextNoteTime);
                    osc2.stop(nextNoteTime + duration + 0.02);
                    bgmNodes.push(osc2);
                }
                
                nextNoteTime += duration;
                noteIdx++;
                
                // 清理过多节点
                if (bgmNodes.length > 60) {
                    bgmNodes.splice(0, 30);
                }
            }
            
            if (bgmPlaying) {
                bgmLoop = setTimeout(scheduleBGM, 200);
            }
        }
        
        bgmPlaying = true;
        scheduleBGM();
    } catch(e) {}
}

function stopBGM() {
    bgmPlaying = false;
    if (bgmLoop) { clearTimeout(bgmLoop); bgmLoop = null; }
    bgmNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    bgmNodes = [];
    if (bgmGainNode) {
        try { bgmGainNode.disconnect(); } catch(e) {}
        bgmGainNode = null;
    }
}

function toggleBGM() {
    bgmEnabled = !bgmEnabled;
    if (bgmEnabled && gameState === 'playing') startBGM(currentLevel);
    else stopBGM();
    const btn = document.getElementById('bgmBtn');
    if (btn) btn.textContent = bgmEnabled ? '🎵' : '🔇';
}

function toggleSFX() {
    sfxEnabled = !sfxEnabled;
    const btn = document.getElementById('sfxBtn');
    if (btn) btn.textContent = sfxEnabled ? '🔊' : '🔕';
}

// ==================== 初始化背景 ====================
function initBackground() {
    bgStars = [];
    for (let i = 0; i < 120; i++) {
        bgStars.push({
            x: Math.random() * CANVAS_W,
            y: Math.random() * GROUND_Y * 0.85,
            size: Math.random() * 2.5 + 0.5,
            speed: Math.random() * 0.3 + 0.05,
            twinkle: Math.random() * Math.PI * 2,
            layer: Math.floor(Math.random() * 3)
        });
    }
    
    bgClouds = [];
    for (let i = 0; i < 6; i++) {
        bgClouds.push({
            x: Math.random() * CANVAS_W,
            y: 40 + Math.random() * 100,
            width: 80 + Math.random() * 120,
            height: 30 + Math.random() * 30,
            speed: 0.3 + Math.random() * 0.5,
            alpha: 0.05 + Math.random() * 0.1
        });
    }
    
    bgTrees = [];
    for (let i = 0; i < 10; i++) {
        bgTrees.push({
            x: Math.random() * CANVAS_W,
            y: GROUND_Y,
            size: 40 + Math.random() * 60,
            speed: 1.5 + Math.random() * 1.5,
            type: Math.floor(Math.random() * 3)
        });
    }
}

// ==================== 创建游戏对象 ====================
function createObstacle() {
    const level = LEVELS[currentLevel];
    const types = level.obstacleTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width, height, y;
    switch(type) {
        case 'spike': width = 32; height = 36; y = GROUND_Y - 36; break;
        case 'rock': width = 40; height = 44; y = GROUND_Y - 44; break;
        case 'mushroom': width = 36; height = 48; y = GROUND_Y - 48; break;
        case 'cactus': width = 32; height = 56; y = GROUND_Y - 56; break;
        case 'flame': width = 28; height = 40; y = GROUND_Y - 40; break;
        case 'icicle': width = 28; height = 50; y = GROUND_Y - 50; break;
        case 'snowball': width = 42; height = 42; y = GROUND_Y - 42; break;
        case 'iceblock': width = 44; height = 44; y = GROUND_Y - 44; break;
        // 新障碍物
        case 'spider': width = 38; height = 30; y = GROUND_Y - 30; break;
        case 'venus': width = 34; height = 52; y = GROUND_Y - 52; break;
        case 'scorpion': width = 44; height = 28; y = GROUND_Y - 28; break;
        case 'cactusBall': width = 36; height = 36; y = GROUND_Y - 36; break;
        case 'penguin': width = 32; height = 46; y = GROUND_Y - 46; break;
        case 'crystal': width = 30; height = 54; y = GROUND_Y - 54; break;
        default: width = 32; height = 36; y = GROUND_Y - 36;
    }
    
    obstacles.push({ x: CANVAS_W + 20, y, width, height, type, passed: false, animFrame: 0 });
}

function createStar() {
    const isAir = Math.random() > 0.45;
    const y = isAir ? GROUND_Y - 90 - Math.random() * 80 : GROUND_Y - 28;
    stars.push({
        x: CANVAS_W + 10,
        y,
        size: 14,
        collected: false,
        rotation: 0,
        value: player.powerups.multiplier.active ? 20 : 10,
        glowPulse: Math.random() * Math.PI * 2,
        floatOffset: Math.random() * Math.PI * 2
    });
}

function createPowerup() {
    const types = Object.keys(POWERUPS);
    const type = types[Math.floor(Math.random() * types.length)];
    const isAir = Math.random() > 0.3;
    powerupItems.push({
        x: CANVAS_W + 10,
        y: isAir ? GROUND_Y - 110 - Math.random() * 60 : GROUND_Y - 36,
        size: 18,
        type,
        collected: false,
        rotation: 0,
        glowPulse: 0,
        bobOffset: Math.random() * Math.PI * 2
    });
}

// ==================== 机关系统 ====================
function createMechanism() {
    const types = ['platform', 'spring', 'portal'];
    const type = types[Math.floor(Math.random() * types.length)];
    const config = MECHANISMS[type];
    
    let y;
    switch(type) {
        case 'platform': y = GROUND_Y - 80 - Math.random() * 60; break;
        case 'spring': y = GROUND_Y - 30; break;
        case 'portal': y = GROUND_Y - 100 - Math.random() * 40; break;
    }
    
    mechanisms.push({
        x: CANVAS_W + 30,
        y: y,
        width: config.width,
        height: config.height,
        type: type,
        used: false,
        animFrame: 0,
        // 移动平台特有
        origX: CANVAS_W + 30,
        origY: y,
        moveDir: 1,
        // 传送门特有
        targetX: 0,
        targetY: 0
    });
}

// ==================== Boss系统 ====================
function spawnBoss() {
    const config = BOSSES[currentLevel];
    boss = {
        x: CANVAS_W - 150,
        y: GROUND_Y - config.height - 20,
        width: config.width,
        height: config.height,
        health: config.health,
        maxHealth: config.health,
        name: config.name,
        color: config.color,
        attacks: config.attacks,
        attackInterval: config.attackInterval,
        attackTimer: 0,
        phase: 1,
        animFrame: 0,
        hitFlash: 0,
        state: 'idle',
        timeLimit: 600,  // Boss存在时间限制（10秒 * 60帧）
        timeCounter: 0
    };
    createFloatingText(CANVAS_W/2, 60, 'BOSS战！击败 ' + boss.name, '#ffd700');
}

function bossAttack() {
    if (!boss) return;
    
    boss.attackTimer++;
    if (boss.attackTimer < boss.attackInterval) return;
    boss.attackTimer = 0;
    
    const attack = boss.attacks[Math.floor(Math.random() * boss.attacks.length)];
    
    switch(attack) {
        case 'vineWhip': // 古树精 - 藤蔓鞭打
            bossProjectiles.push({
                x: boss.x - 20,
                y: boss.y + boss.height/2,
                vx: -8,
                vy: 0,
                width: 60,
                height: 12,
                type: 'vine',
                life: 60,
                damage: 15
            });
            break;
        case 'sporeCloud': // 古树精 - 孢子云
            for (let i = 0; i < 5; i++) {
                bossProjectiles.push({
                    x: boss.x,
                    y: boss.y + 20 + i * 15,
                    vx: -3 - Math.random() * 2,
                    vy: (Math.random() - 0.5) * 2,
                    width: 20,
                    height: 20,
                    type: 'spore',
                    life: 120,
                    damage: 10
                });
            }
            break;
        case 'rootSpike': // 古树精 - 地刺
            bossProjectiles.push({
                x: player.x + 100,
                y: GROUND_Y,
                vx: 0,
                vy: -12,
                width: 40,
                height: 60,
                type: 'root',
                life: 90,
                damage: 20
            });
            break;
        case 'burrow': // 沙虫王 - 地下突袭
            boss.state = 'burrow';
            setTimeout(() => {
                if (boss) {
                    boss.x = player.x + 200;
                    boss.state = 'emerge';
                    setTimeout(() => { if (boss) boss.state = 'idle'; }, 500);
                }
            }, 800);
            break;
        case 'sandStorm': // 沙虫王 - 沙尘暴
            for (let i = 0; i < 8; i++) {
                bossProjectiles.push({
                    x: CANVAS_W + i * 50,
                    y: GROUND_Y - 50 - Math.random() * 100,
                    vx: -6 - Math.random() * 3,
                    vy: (Math.random() - 0.5) * 4,
                    width: 15,
                    height: 15,
                    type: 'sand',
                    life: 100,
                    damage: 8
                });
            }
            break;
        case 'tailSwipe': // 沙虫王 - 尾击
            bossProjectiles.push({
                x: boss.x - 30,
                y: boss.y + boss.height - 20,
                vx: -10,
                vy: -3,
                width: 80,
                height: 25,
                type: 'tail',
                life: 40,
                damage: 25
            });
            break;
        case 'iceBeam': // 冰霜巨人 - 冰冻射线
            bossProjectiles.push({
                x: boss.x - 10,
                y: boss.y + 40,
                vx: -7,
                vy: 0,
                width: 100,
                height: 8,
                type: 'iceBeam',
                life: 50,
                damage: 15
            });
            break;
        case 'groundSmash': // 冰霜巨人 - 砸地冰刺
            for (let i = 0; i < 3; i++) {
                bossProjectiles.push({
                    x: player.x + 80 + i * 60,
                    y: GROUND_Y,
                    vx: 0,
                    vy: -15,
                    width: 30,
                    height: 50,
                    type: 'iceSpike',
                    life: 80,
                    damage: 20
                });
            }
            break;
        case 'frostNova': // 冰霜巨人 - 冰霜新星
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                bossProjectiles.push({
                    x: boss.x + boss.width/2,
                    y: boss.y + boss.height/2,
                    vx: Math.cos(angle) * 4,
                    vy: Math.sin(angle) * 4,
                    width: 18,
                    height: 18,
                    type: 'frost',
                    life: 100,
                    damage: 12
                });
            }
            break;
        case 'tentacle': // 深海章鱼 - 触手攻击
            for (let i = 0; i < 3; i++) {
                bossProjectiles.push({
                    x: boss.x - 20,
                    y: boss.y + 20 + i * 25,
                    vx: -6 - i,
                    vy: Math.sin(i) * 2,
                    width: 50,
                    height: 12,
                    type: 'tentacle',
                    life: 70,
                    damage: 15
                });
            }
            break;
        case 'inkCloud': // 深海章鱼 - 墨汁遮蔽
            for (let i = 0; i < 6; i++) {
                bossProjectiles.push({
                    x: boss.x - 30 - i * 40,
                    y: boss.y + Math.random() * boss.height,
                    vx: -2,
                    vy: (Math.random() - 0.5) * 1,
                    width: 40 + Math.random() * 20,
                    height: 40 + Math.random() * 20,
                    type: 'ink',
                    life: 180,
                    damage: 5
                });
            }
            break;
        case 'suction': // 深海章鱼 - 吸力
            bossProjectiles.push({
                x: boss.x - 100,
                y: boss.y + boss.height/2 - 50,
                vx: 0,
                vy: 0,
                width: 100,
                height: 100,
                type: 'suction',
                life: 120,
                damage: 0,
                pullForce: 3
            });
            break;
        case 'laserSweep': // 机械母舰 - 激光扫射
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (boss) {
                        bossProjectiles.push({
                            x: boss.x - 20,
                            y: boss.y + 20 + i * 15,
                            vx: -12,
                            vy: 0,
                            width: 120,
                            height: 4,
                            type: 'laser',
                            life: 30,
                            damage: 18
                        });
                    }
                }, i * 150);
            }
            break;
        case 'droneSummon': // 机械母舰 - 召唤无人机
            for (let i = 0; i < 3; i++) {
                bossProjectiles.push({
                    x: boss.x - 30,
                    y: boss.y - 30 - i * 25,
                    vx: -4,
                    vy: 2 + Math.random(),
                    width: 25,
                    height: 20,
                    type: 'drone',
                    life: 200,
                    damage: 10
                });
            }
            break;
        case 'missile': // 机械母舰 - 导弹
            bossProjectiles.push({
                x: boss.x - 20,
                y: boss.y + boss.height/2,
                vx: -5,
                vy: -2,
                width: 30,
                height: 14,
                type: 'missile',
                life: 150,
                damage: 30,
                tracking: true
            });
            break;
    }
}

function createParticles(x, y, color, count = 10, options = {}) {
    for (let i = 0; i < count; i++) {
        const angle = options.angle !== undefined ? options.angle + (Math.random() - 0.5) * (options.spread || Math.PI * 2) : Math.random() * Math.PI * 2;
        const speed = (options.speed || 4) * (0.5 + Math.random() * 0.8);
        particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (options.upBias || 0),
            life: options.life || 35,
            maxLife: options.life || 35,
            color,
            size: options.size || (Math.random() * 4 + 2),
            type: options.type || 'square',
            gravity: options.gravity !== undefined ? options.gravity : 0.15
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 55, vy: -1.5, scale: 1.5 });
}

function createMeteor() {
    meteors.push({
        x: Math.random() * CANVAS_W + CANVAS_W * 0.3,
        y: -20,
        vx: -6 - Math.random() * 4,
        vy: 4 + Math.random() * 3,
        life: 60,
        size: Math.random() * 2 + 1
    });
}

// ==================== 绘制函数库 ====================
// 绘制精美魔法师
function drawMagician(x, y, w, h, facingRight, walkFrame, jumping, shieldActive, dashActive) {
    ctx.save();
    if (!facingRight) {
        ctx.translate(x + w, 0);
        ctx.scale(-1, 1);
        x = 0;
    }
    
    const bobY = jumping ? 0 : Math.sin(walkFrame * 0.2) * 2;
    const legSwing = jumping ? 0 : Math.sin(walkFrame * 0.25) * 8;
    const armSwing = jumping ? -20 : Math.sin(walkFrame * 0.25 + Math.PI) * 12;
    
    const px = x;
    const py = y + bobY;
    
    // 无敌彩虹效果
    const isInvincible = player.powerups.invincible.active;
    if (isInvincible) {
        player.rainbowHue = (player.rainbowHue + 5) % 360;
        ctx.shadowColor = `hsl(${player.rainbowHue}, 100%, 60%)`;
        ctx.shadowBlur = 20;
    }
    
    // 袍子底部（裙摆）
    ctx.fillStyle = isInvincible ? `hsl(${player.rainbowHue}, 80%, 50%)` : '#7c3aed';
    ctx.beginPath();
    ctx.ellipse(px + w/2, py + h - 8, w/2 + 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 身体袍子
    const robeGrad = ctx.createLinearGradient(px, py + 10, px + w, py + 10);
    if (isInvincible) {
        robeGrad.addColorStop(0, `hsl(${player.rainbowHue}, 100%, 55%)`);
        robeGrad.addColorStop(0.5, `hsl(${(player.rainbowHue + 60) % 360}, 100%, 60%)`);
        robeGrad.addColorStop(1, `hsl(${(player.rainbowHue + 120) % 360}, 100%, 50%)`);
    } else {
        robeGrad.addColorStop(0, '#9333ea');
        robeGrad.addColorStop(0.5, '#a855f7');
        robeGrad.addColorStop(1, '#7c3aed');
    }
    ctx.fillStyle = robeGrad;
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 20, w - 8, h - 26, 5);
    ctx.fill();
    
    // 袍子装饰纹
    ctx.strokeStyle = isInvincible ? '#fff' : '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px + w/2, py + 22);
    ctx.lineTo(px + w/2, py + h - 14);
    ctx.stroke();
    
    // 星形装饰
    ctx.fillStyle = '#fbbf24';
    drawStarShape(ctx, px + w/2, py + 30, 5, 6, 3);
    
    // 腿部
    if (!jumping) {
        ctx.fillStyle = isInvincible ? `hsl(${(player.rainbowHue + 180) % 360}, 80%, 40%)` : '#6d28d9';
        ctx.save();
        ctx.translate(px + w/2 - 7, py + h - 16);
        ctx.rotate(legSwing * Math.PI / 180);
        ctx.fillRect(-5, 0, 10, 18);
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-6, 14, 13, 6);
        ctx.restore();
        
        ctx.fillStyle = isInvincible ? `hsl(${(player.rainbowHue + 180) % 360}, 80%, 40%)` : '#6d28d9';
        ctx.save();
        ctx.translate(px + w/2 + 7, py + h - 16);
        ctx.rotate(-legSwing * Math.PI / 180);
        ctx.fillRect(-5, 0, 10, 18);
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-6, 14, 13, 6);
        ctx.restore();
    }
    
    // 手臂/魔法杖（右臂）
    ctx.save();
    ctx.translate(px + w - 4, py + 24);
    ctx.rotate(armSwing * Math.PI / 180);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(-4, 0, 8, 20);
    
    ctx.fillStyle = '#92400e';
    ctx.fillRect(0, 12, 4, 22);
    
    const orbPulse = Math.sin(frameCount * 0.08) * 0.3 + 0.7;
    ctx.fillStyle = isInvincible ? `hsla(${player.rainbowHue}, 100%, 70%, ${orbPulse})` : `rgba(167, 243, 208, ${orbPulse})`;
    ctx.beginPath();
    ctx.arc(2, 10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 左臂
    ctx.save();
    ctx.translate(px + 4, py + 24);
    ctx.rotate(-armSwing * Math.PI / 180 * 0.6);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(-4, 0, 8, 18);
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, 18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 头部
    const headGrad = ctx.createRadialGradient(px + w/2 - 3, py + 10, 2, px + w/2, py + 14, 14);
    headGrad.addColorStop(0, '#fef3c7');
    headGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(px + w/2, py + 15, 14, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const eyeOpen = frameCount % 120 < 110;
    ctx.fillStyle = '#1e1b4b';
    if (eyeOpen) {
        ctx.beginPath();
        ctx.ellipse(px + w/2 + 5, py + 13, 3.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px + w/2 + 6, py + 12, 1.2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(px + w/2 + 2, py + 13);
        ctx.lineTo(px + w/2 + 9, py + 13);
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px + w/2 + 4, py + 18, 3, 0.1, Math.PI - 0.1);
    ctx.stroke();
    
    // 魔法帽
    const hatGrad = ctx.createLinearGradient(px, py - 10, px + w, py - 10);
    hatGrad.addColorStop(0, '#4c1d95');
    hatGrad.addColorStop(1, '#6d28d9');
    ctx.fillStyle = hatGrad;
    ctx.beginPath();
    ctx.ellipse(px + w/2, py + 3, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = hatGrad;
    ctx.beginPath();
    ctx.moveTo(px + 9, py + 2);
    ctx.lineTo(px + w/2 + 2, py - 28);
    ctx.lineTo(px + w - 9, py + 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#fbbf24';
    drawStarShape(ctx, px + w/2 + 2, py - 16, 5, 4, 2);
    
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 11, py + 2);
    ctx.lineTo(px + w/2 + 2, py - 26);
    ctx.lineTo(px + w - 11, py + 2);
    ctx.stroke();
    
    ctx.restore();
    ctx.shadowBlur = 0;
    
    // 护盾效果
    if (shieldActive) {
        const shieldAlpha = 0.3 + Math.sin(frameCount * 0.15) * 0.15;
        const shieldGrad = ctx.createRadialGradient(x + w/2, y + h/2, 10, x + w/2, y + h/2, 50);
        shieldGrad.addColorStop(0, `rgba(46, 204, 113, 0)`);
        shieldGrad.addColorStop(0.7, `rgba(46, 204, 113, ${shieldAlpha * 0.5})`);
        shieldGrad.addColorStop(1, `rgba(46, 204, 113, ${shieldAlpha})`);
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = `rgba(46, 204, 113, ${0.6 + Math.sin(frameCount * 0.15) * 0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, 50, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(46, 204, 113, 0.3)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + frameCount * 0.02;
            ctx.beginPath();
            ctx.arc(x + w/2 + Math.cos(angle) * 40, y + h/2 + Math.sin(angle) * 40, 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 冲刺残影
    if (dashActive) {
        for (let i = 1; i <= 3; i++) {
            ctx.globalAlpha = 0.15 * (4 - i) / 3;
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x - i * 12, y + 15, w - 6, h - 20);
            ctx.globalAlpha = 1;
        }
    }
    
    // 无敌彩虹残影
    if (player.powerups.invincible.active) {
        for (let i = 1; i <= 4; i++) {
            const hue = (player.rainbowHue + i * 30) % 360;
            ctx.globalAlpha = 0.1 * (5 - i) / 4;
            ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            ctx.fillRect(x - i * 10, y + 10, w, h - 15);
        }
        ctx.globalAlpha = 1;
    }
    
    // 跳跃靴特效（靴子光圈）
    if (player.powerups.boots.active && player.jumping) {
        ctx.strokeStyle = `rgba(0, 188, 212, ${0.4 + Math.sin(frameCount * 0.2) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h - 5, 25, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // 时间减速特效（蓝色时间光环）
    if (player.powerups.slowmo.active) {
        const slowAlpha = 0.15 + Math.sin(frameCount * 0.1) * 0.08;
        ctx.strokeStyle = `rgba(96, 125, 139, ${slowAlpha + 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, 60 + Math.sin(frameCount * 0.05) * 5, 0, Math.PI * 2);
        ctx.stroke();
        // 时钟指针动画
        const tickAngle = (frameCount * 0.05) % (Math.PI * 2);
        ctx.strokeStyle = `rgba(96, 125, 139, ${slowAlpha + 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w/2, y + h/2);
        ctx.lineTo(x + w/2 + Math.cos(tickAngle) * 12, y + h/2 + Math.sin(tickAngle) * 12);
        ctx.stroke();
    }
}

// ==================== 机关绘制函数 ====================
function drawMechanism(mech) {
    const x = mech.x, y = mech.y, w = mech.width, h = mech.height;
    ctx.save();
    
    switch(mech.type) {
        case 'platform': {
            // 移动平台 - 紫色魔法平台
            const grad = ctx.createLinearGradient(x, y, x, y + h);
            grad.addColorStop(0, '#a78bfa');
            grad.addColorStop(0.5, '#8b5cf6');
            grad.addColorStop(1, '#7c3aed');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 6);
            ctx.fill();
            // 边缘发光
            ctx.strokeStyle = '#c4b5fd';
            ctx.lineWidth = 2;
            ctx.stroke();
            // 魔法符文
            ctx.fillStyle = '#ddd6fe';
            ctx.font = '10px serif';
            ctx.textAlign = 'center';
            ctx.fillText('✦', x + w/2, y + h/2 + 3);
            break;
        }
        case 'spring': {
            // 弹簧 - 黄色螺旋
            const compress = mech.used ? 0.6 : 1;
            ctx.fillStyle = '#fbbf24';
            for (let i = 0; i < 4; i++) {
                const sy = y + h - (i + 1) * (h/4) * compress;
                const sw = w * (0.5 + i * 0.15);
                ctx.fillRect(x + (w - sw)/2, sy, sw, (h/4) * compress - 2);
            }
            // 顶部发光
            ctx.fillStyle = '#fde68a';
            ctx.fillRect(x + 4, y, w - 8, 4);
            // 底座
            ctx.fillStyle = '#d97706';
            ctx.fillRect(x - 2, y + h - 4, w + 4, 4);
            break;
        }
        case 'portal': {
            // 传送门 - 青色漩涡
            const pulse = 1 + Math.sin(mech.animFrame * 0.1) * 0.1;
            // 外圈
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2, (w/2) * pulse, (h/2) * pulse, 0, 0, Math.PI * 2);
            ctx.stroke();
            // 内圈
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2, (w/2 - 8) * pulse, (h/2 - 12) * pulse, mech.animFrame * 0.05, 0, Math.PI * 2);
            ctx.stroke();
            // 中心
            ctx.fillStyle = '#cffafe';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, 6 * pulse, 0, Math.PI * 2);
            ctx.fill();
            // 粒子效果
            if (mech.animFrame % 10 === 0) {
                createParticles(x + w/2, y + h/2, '#06b6d4', 2, { speed: 2, life: 20 });
            }
            break;
        }
    }
    ctx.restore();
}

// ==================== Boss绘制函数 ====================
function drawBoss() {
    if (!boss) return;
    const b = boss;
    const x = b.x, y = b.y, w = b.width, h = b.height;
    
    ctx.save();
    
    // 受伤闪烁
    if (b.hitFlash > 0) {
        ctx.globalAlpha = 0.6;
    }
    
    switch(currentLevel) {
        case 'forest': {
            // 古树精 - 棕色树形
            // 树干
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(x + w/2 - 20, y + 40, 40, h - 40);
            // 树冠
            const leafGrad = ctx.createRadialGradient(x + w/2, y + 30, 5, x + w/2, y + 40, w/2);
            leafGrad.addColorStop(0, '#66bb6a');
            leafGrad.addColorStop(0.6, '#2e7d32');
            leafGrad.addColorStop(1, '#1b5e20');
            ctx.fillStyle = leafGrad;
            ctx.beginPath();
            ctx.arc(x + w/2, y + 40, w/2 - 5, 0, Math.PI * 2);
            ctx.fill();
            // 眼睛
            ctx.fillStyle = '#ff5722';
            ctx.beginPath(); ctx.arc(x + w/2 - 15, y + 35, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 15, y + 35, 5, 0, Math.PI * 2); ctx.fill();
            // 嘴巴
            ctx.fillStyle = '#3e2723';
            ctx.beginPath();
            ctx.arc(x + w/2, y + 55, 12, 0, Math.PI);
            ctx.fill();
            break;
        }
        case 'desert': {
            // 沙虫王 - 沙色蠕虫
            const segCount = 4;
            const segW = w / segCount;
            for (let i = 0; i < segCount; i++) {
                const segX = x + i * segW;
                const segH = h - Math.abs(i - 1.5) * 15;
                const segY = y + h - segH;
                ctx.fillStyle = i % 2 === 0 ? '#d4a574' : '#c49a6c';
                ctx.beginPath();
                ctx.ellipse(segX + segW/2, segY + segH/2, segW/2 - 2, segH/2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // 眼睛
            ctx.fillStyle = '#ff1744';
            ctx.beginPath(); ctx.arc(x + 15, y + h/2, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 35, y + h/2, 6, 0, Math.PI * 2); ctx.fill();
            // 牙齿
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(x + 10 + i * 8, y + h/2 + 10);
                ctx.lineTo(x + 14 + i * 8, y + h/2 + 18);
                ctx.lineTo(x + 18 + i * 8, y + h/2 + 10);
                ctx.fill();
            }
            break;
        }
        case 'ice': {
            // 冰霜巨人 - 蓝色冰块人形
            // 身体
            const iceGrad = ctx.createLinearGradient(x, y, x + w, y + h);
            iceGrad.addColorStop(0, '#81d4fa');
            iceGrad.addColorStop(0.5, '#4fc3f7');
            iceGrad.addColorStop(1, '#0288d1');
            ctx.fillStyle = iceGrad;
            ctx.fillRect(x + 15, y + 30, w - 30, h - 30);
            // 头部
            ctx.fillStyle = '#b3e5fc';
            ctx.beginPath();
            ctx.arc(x + w/2, y + 25, 25, 0, Math.PI * 2);
            ctx.fill();
            // 眼睛
            ctx.fillStyle = '#01579b';
            ctx.beginPath(); ctx.arc(x + w/2 - 10, y + 22, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 10, y + 22, 5, 0, Math.PI * 2); ctx.fill();
            // 冰晶装饰
            ctx.fillStyle = '#e1f5fe';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x + 20 + i * 25, y + 60);
                ctx.lineTo(x + 25 + i * 25, y + 50);
                ctx.lineTo(x + 30 + i * 25, y + 60);
                ctx.fill();
            }
            break;
        }
        case 'ocean': {
            // 深海章鱼 - 紫色章鱼
            // 头部
            ctx.fillStyle = '#7c4dff';
            ctx.beginPath();
            ctx.arc(x + w/2, y + 35, 30, 0, Math.PI * 2);
            ctx.fill();
            // 触手
            ctx.strokeStyle = '#651fff';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI + Math.PI;
                const tentX = x + w/2 + Math.cos(angle) * 25;
                const tentY = y + 50;
                const wave = Math.sin(b.animFrame * 0.1 + i) * 10;
                ctx.beginPath();
                ctx.moveTo(tentX, tentY);
                ctx.quadraticCurveTo(tentX + Math.cos(angle) * 20, tentY + 30, tentX + Math.cos(angle) * 15 + wave, tentY + 50);
                ctx.stroke();
            }
            // 眼睛
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x + w/2 - 10, y + 30, 7, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 10, y + 30, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(x + w/2 - 10, y + 30, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 10, y + 30, 3, 0, Math.PI * 2); ctx.fill();
            break;
        }
        case 'space': {
            // 机械母舰 - 橙色机械
            // 主体
            ctx.fillStyle = '#ff5722';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2, w/2 - 5, h/2 - 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // 机械细节
            ctx.fillStyle = '#bf360c';
            ctx.fillRect(x + 20, y + 25, w - 40, 8);
            ctx.fillRect(x + 25, y + h - 35, w - 50, 8);
            // 核心
            const corePulse = 1 + Math.sin(b.animFrame * 0.15) * 0.2;
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, 12 * corePulse, 0, Math.PI * 2);
            ctx.fill();
            // 侧边推进器
            ctx.fillStyle = '#795548';
            ctx.fillRect(x + 5, y + 20, 15, 20);
            ctx.fillRect(x + w - 20, y + 20, 15, 20);
            ctx.fillRect(x + 5, y + h - 40, 15, 20);
            ctx.fillRect(x + w - 20, y + h - 40, 15, 20);
            // 火焰
            ctx.fillStyle = '#ff9800';
            const flameH = 8 + Math.sin(b.animFrame * 0.3) * 4;
            ctx.fillRect(x + 8, y + 15, 9, flameH);
            ctx.fillRect(x + w - 17, y + 15, 9, flameH);
            break;
        }
    }
    
    // 血条
    const barW = w + 20;
    const barH = 8;
    const barX = x - 10;
    const barY = y - 20;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX, barY, barW, barH);
    const healthPct = b.health / b.maxHealth;
    const healthGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    healthGrad.addColorStop(0, '#ef4444');
    healthGrad.addColorStop(0.5, '#f97316');
    healthGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = healthGrad;
    ctx.fillRect(barX, barY, barW * healthPct, barH);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
    
    // Boss名称
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(b.name, x + w/2, barY - 5);
    
    ctx.restore();
}

// ==================== Boss投射物绘制 ====================
function drawBossProjectile(proj) {
    const x = proj.x, y = proj.y, w = proj.width, h = proj.height;
    ctx.save();
    
    switch(proj.type) {
        case 'vine':
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x + w, y + h/2);
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(x + w - (i+1) * (w/5), y + h/2 + Math.sin(i * 0.8) * 4);
            }
            ctx.stroke();
            break;
        case 'spore':
            ctx.fillStyle = 'rgba(139, 195, 74, 0.7)';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8bc34a';
            ctx.beginPath();
            ctx.arc(x + w/2 - 2, y + h/2 - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'root':
            ctx.fillStyle = '#5d4037';
            ctx.beginPath();
            ctx.moveTo(x + w/2, y);
            ctx.lineTo(x + w - 5, y + h);
            ctx.lineTo(x + 5, y + h);
            ctx.fill();
            break;
        case 'sand':
            ctx.fillStyle = '#d4a574';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'tail':
            ctx.fillStyle = '#c49a6c';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(x + w - 10, y, 10, h);
            break;
        case 'iceBeam':
            ctx.fillStyle = 'rgba(129, 212, 250, 0.8)';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#e1f5fe';
            ctx.fillRect(x, y + 1, w, 2);
            break;
        case 'iceSpike':
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.moveTo(x + w/2, y);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x, y + h);
            ctx.fill();
            break;
        case 'frost':
            ctx.fillStyle = 'rgba(179, 229, 252, 0.8)';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#81d4fa';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
        case 'tentacle':
            ctx.strokeStyle = '#7c4dff';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x + w, y + h/2);
            ctx.quadraticCurveTo(x + w/2, y + h/2 + 10, x, y + h/2);
            ctx.stroke();
            break;
        case 'ink':
            ctx.fillStyle = 'rgba(33, 33, 33, 0.6)';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'suction':
            ctx.strokeStyle = 'rgba(124, 77, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/3, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'laser':
            ctx.fillStyle = '#ff1744';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(x, y + 1, w, 2);
            break;
        case 'drone':
            ctx.fillStyle = '#ff5722';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'missile':
            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.moveTo(x + w, y + h/2);
            ctx.lineTo(x, y);
            ctx.lineTo(x, y + h);
            ctx.fill();
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(x + 5, y + h/2 - 2, 8, 4);
            break;
    }
    ctx.restore();
}

// 绘制精美障碍物
function drawObstacle(obs) {
    const x = obs.x, y = obs.y, w = obs.width, h = obs.height;
    
    ctx.save();
    switch(obs.type) {
        case 'spike': {
            const sg = ctx.createLinearGradient(x, y, x + w, y + h);
            sg.addColorStop(0, '#ff6b6b');
            sg.addColorStop(0.5, '#ff0000');
            sg.addColorStop(1, '#8b0000');
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + w/2, y);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,150,150,0.5)';
            ctx.beginPath();
            ctx.moveTo(x + 5, y + h - 5);
            ctx.lineTo(x + w/2 - 2, y + 6);
            ctx.lineTo(x + w/2 + 5, y + 10);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#4a0000';
            ctx.fillRect(x - 3, y + h - 5, w + 6, 5);
            break;
        }
        case 'mushroom': {
            ctx.fillStyle = '#f5e6d3';
            ctx.fillRect(x + w/2 - 8, y + h/2, 16, h/2);
            const mg = ctx.createRadialGradient(x + w/2, y + h/3, 3, x + w/2, y + h/3, w/2);
            mg.addColorStop(0, '#ff6b6b');
            mg.addColorStop(1, '#c0392b');
            ctx.fillStyle = mg;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2 + 3, Math.PI, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x + w/2 - 8, y + h/3, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 7, y + h/2 - 2, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2, y + h/4, 3, 0, Math.PI * 2); ctx.fill();
            break;
        }
        case 'rock': {
            const rg = ctx.createRadialGradient(x + w*0.35, y + h*0.3, 3, x + w/2, y + h/2, w/2);
            rg.addColorStop(0, '#aaa');
            rg.addColorStop(0.7, '#666');
            rg.addColorStop(1, '#333');
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.moveTo(x + 8, y + h);
            ctx.lineTo(x, y + h * 0.6);
            ctx.lineTo(x + 5, y + h * 0.3);
            ctx.lineTo(x + w * 0.35, y);
            ctx.lineTo(x + w * 0.7, y + h * 0.1);
            ctx.lineTo(x + w, y + h * 0.4);
            ctx.lineTo(x + w - 4, y + h);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(200,200,200,0.35)';
            ctx.beginPath();
            ctx.moveTo(x + 10, y + h * 0.5);
            ctx.lineTo(x + w * 0.4, y + 5);
            ctx.lineTo(x + w * 0.6, y + h * 0.15);
            ctx.lineTo(x + 20, y + h * 0.55);
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'cactus': {
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.roundRect(x + w/2 - 7, y + 10, 14, h - 10, 4);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(x, y + 20, 14, 10, 4);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(x, y + 12, 10, 18, 4);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(x + w - 14, y + 14, 14, 10, 4);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(x + w - 10, y + 8, 10, 22, 4);
            ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.roundRect(x + w/2 - 3, y + 12, 4, h - 14, 2);
            ctx.fill();
            break;
        }
        case 'flame': {
            obs.animFrame = (obs.animFrame || 0) + 1;
            const flicker = Math.sin(obs.animFrame * 0.3) * 3;
            const fg = ctx.createLinearGradient(x + w/2, y + h, x + w/2, y);
            fg.addColorStop(0, '#ff8c00');
            fg.addColorStop(0.5, '#ff4500');
            fg.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.moveTo(x + 3, y + h);
            ctx.bezierCurveTo(x - 4, y + h/2 + flicker, x + w/3, y + h/3, x + w/2, y + flicker);
            ctx.bezierCurveTo(x + w*2/3, y + h/3, x + w + 4, y + h/2 - flicker, x + w - 3, y + h);
            ctx.closePath();
            ctx.fill();
            const ifg = ctx.createLinearGradient(x + w/2, y + h, x + w/2, y + h/3);
            ifg.addColorStop(0, '#ffff00');
            ifg.addColorStop(1, 'rgba(255,200,0,0)');
            ctx.fillStyle = ifg;
            ctx.beginPath();
            ctx.moveTo(x + 8, y + h);
            ctx.bezierCurveTo(x + 4, y + h*0.6, x + w*0.4, y + h*0.4 + flicker, x + w/2, y + h/3 + flicker);
            ctx.bezierCurveTo(x + w*0.6, y + h*0.4 - flicker, x + w - 4, y + h*0.6, x + w - 8, y + h);
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'icicle': {
            const ig = ctx.createLinearGradient(x, y, x + w, y + h);
            ig.addColorStop(0, '#e0f7ff');
            ig.addColorStop(0.4, '#7dd3fc');
            ig.addColorStop(1, '#0ea5e9');
            ctx.fillStyle = ig;
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + w/2, y);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.moveTo(x + 5, y + h - 10);
            ctx.lineTo(x + w/2 - 3, y + 8);
            ctx.lineTo(x + w/2 + 4, y + 14);
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'snowball': {
            const sbg = ctx.createRadialGradient(x + w*0.4, y + h*0.35, 3, x + w/2, y + h/2, w/2);
            sbg.addColorStop(0, '#fff');
            sbg.addColorStop(0.8, '#dbeafe');
            sbg.addColorStop(1, '#93c5fd');
            ctx.fillStyle = sbg;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(200,230,255,0.4)';
            ctx.lineWidth = 1;
            for (let a = 0; a < 6; a++) {
                const angle = (a / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(x + w/2, y + h/2);
                ctx.lineTo(x + w/2 + Math.cos(angle) * (w/2 - 3), y + h/2 + Math.sin(angle) * (w/2 - 3));
                ctx.stroke();
            }
            break;
        }
        case 'iceblock': {
            const ibg = ctx.createLinearGradient(x, y, x + w, y + h);
            ibg.addColorStop(0, '#bae6fd');
            ibg.addColorStop(1, '#0284c7');
            ctx.fillStyle = ibg;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 4);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 8);
            ctx.lineTo(x + w/2, y + h/2);
            ctx.lineTo(x + w - 8, y + h - 10);
            ctx.stroke();
            break;
        }
        // ===== 新障碍物：森林关卡 =====
        case 'spider': {
            // 🕷️ 毒蜘蛛 - 亮黄色+黑色条纹，在深紫背景上非常醒目
            obs.animFrame = (obs.animFrame || 0) + 1;
            const legMove = Math.sin(obs.animFrame * 0.3) * 3;
            // 身体 - 亮黄色
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2, w/2 - 2, h/2 - 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // 黑色条纹
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(x + 6, y + 8, w - 12, 4);
            ctx.fillRect(x + 4, y + 16, w - 8, 3);
            // 腿 - 动态摆动
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            for (let i = 0; i < 4; i++) {
                const legY = y + 10 + i * 4;
                const offset = (i % 2 === 0 ? legMove : -legMove);
                ctx.beginPath();
                ctx.moveTo(x + 4, legY);
                ctx.lineTo(x - 6 + offset, legY - 3);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + w - 4, legY);
                ctx.lineTo(x + w + 6 - offset, legY - 3);
                ctx.stroke();
            }
            // 红色眼睛
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(x + w/2 - 6, y + 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 6, y + 10, 3, 0, Math.PI * 2); ctx.fill();
            // 毒牙
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(x + w/2 - 4, y + 18);
            ctx.lineTo(x + w/2 - 2, y + 24);
            ctx.lineTo(x + w/2, y + 18);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + w/2, y + 18);
            ctx.lineTo(x + w/2 + 2, y + 24);
            ctx.lineTo(x + w/2 + 4, y + 18);
            ctx.fill();
            break;
        }
        case 'venus': {
            // 🌿 食人花 - 粉红色+绿色，与深绿背景形成对比
            // 茎
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(x + w/2 - 4, y + h/2, 8, h/2);
            // 叶子
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.ellipse(x + 6, y + h - 10, 10, 5, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + w - 6, y + h - 12, 10, 5, 0.5, 0, Math.PI * 2);
            ctx.fill();
            // 花朵头部 - 粉红色
            const headGrad = ctx.createRadialGradient(x + w/2, y + 12, 2, x + w/2, y + 15, w/2);
            headGrad.addColorStop(0, '#f472b6');
            headGrad.addColorStop(0.7, '#ec4899');
            headGrad.addColorStop(1, '#be185d');
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.arc(x + w/2, y + 18, w/2 - 2, Math.PI, 0);
            ctx.fill();
            // 嘴巴内部 - 深红色
            ctx.fillStyle = '#7f1d1d';
            ctx.beginPath();
            ctx.arc(x + w/2, y + 18, w/2 - 8, Math.PI, 0);
            ctx.fill();
            // 牙齿 - 白色尖牙
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 4; i++) {
                const tx = x + 10 + i * 6;
                ctx.beginPath();
                ctx.moveTo(tx, y + 18);
                ctx.lineTo(tx + 3, y + 26);
                ctx.lineTo(tx + 6, y + 18);
                ctx.fill();
            }
            // 眼睛
            ctx.fillStyle = '#fef08a';
            ctx.beginPath(); ctx.arc(x + w/2 - 8, y + 10, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 8, y + 10, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(x + w/2 - 8, y + 10, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 8, y + 10, 2, 0, Math.PI * 2); ctx.fill();
            break;
        }
        // ===== 新障碍物：沙漠关卡 =====
        case 'scorpion': {
            // 🦂 蝎子 - 紫色+橙色，在棕黄背景上很醒目
            obs.animFrame = (obs.animFrame || 0) + 1;
            const tailCurve = Math.sin(obs.animFrame * 0.15) * 5;
            // 身体 - 紫色
            ctx.fillStyle = '#9333ea';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2 + 4, w/2 - 4, h/2 - 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // 橙色条纹
            ctx.fillStyle = '#f97316';
            ctx.fillRect(x + 6, y + 10, w - 12, 3);
            ctx.fillRect(x + 8, y + 16, w - 16, 3);
            // 尾巴 - 弯曲的弧形
            ctx.strokeStyle = '#9333ea';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x + w - 8, y + h/2);
            ctx.quadraticCurveTo(x + w + 10, y + 5 + tailCurve, x + w + 4, y - 2);
            ctx.stroke();
            // 尾刺
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(x + w + 4, y - 2);
            ctx.lineTo(x + w + 8, y - 8);
            ctx.lineTo(x + w, y - 4);
            ctx.fill();
            // 钳子
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 4, y + h/2 + 2);
            ctx.lineTo(x - 4, y + h/2 - 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 4, y + h/2 + 6);
            ctx.lineTo(x - 4, y + h/2 + 10);
            ctx.stroke();
            // 腿
            ctx.strokeStyle = '#7e22ce';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const ly = y + 12 + i * 4;
                ctx.beginPath();
                ctx.moveTo(x + 8, ly);
                ctx.lineTo(x + 2, ly + 6);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + w - 8, ly);
                ctx.lineTo(x + w - 2, ly + 6);
                ctx.stroke();
            }
            // 眼睛 - 发光绿
            ctx.fillStyle = '#4ade80';
            ctx.beginPath(); ctx.arc(x + 8, y + 10, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 16, y + 10, 2.5, 0, Math.PI * 2); ctx.fill();
            break;
        }
        case 'cactusBall': {
            // 🌵 仙人掌球 - 青色+粉色花朵，与沙漠暖色对比
            // 主球体 - 青色
            const cg = ctx.createRadialGradient(x + w/2 - 4, y + h/2 - 4, 2, x + w/2, y + h/2, w/2);
            cg.addColorStop(0, '#67e8f9');
            cg.addColorStop(0.6, '#22d3ee');
            cg.addColorStop(1, '#0891b2');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // 刺 - 白色
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const sx = x + w/2 + Math.cos(angle) * (w/2 - 4);
                const sy = y + h/2 + Math.sin(angle) * (h/2 - 4);
                ctx.beginPath();
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            // 粉色花朵装饰
            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2 - 6, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fce7f3';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2 - 6, 2, 0, Math.PI * 2);
            ctx.fill();
            // 阴影高光
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(x + w/2 - 6, y + h/2 - 6, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        // ===== 新障碍物：冰雪关卡 =====
        case 'penguin': {
            // 🐧 冰企鹅 - 橙色+黑白，在蓝色冰雪背景上非常醒目
            // 身体 - 黑色
            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2 + 4, w/2 - 2, h/2 - 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // 白色肚子
            ctx.fillStyle = '#f9fafb';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2 + 8, w/2 - 8, h/2 - 10, 0, 0, Math.PI * 2);
            ctx.fill();
            // 橙色嘴巴 - 非常醒目
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(x + w/2 - 6, y + 14);
            ctx.lineTo(x + w/2 + 6, y + 14);
            ctx.lineTo(x + w/2, y + 22);
            ctx.fill();
            // 眼睛 - 白色底+黑色眼珠
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(x + w/2 - 5, y + 10, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 5, y + 10, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(x + w/2 - 5, y + 10, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w/2 + 5, y + 10, 2.5, 0, Math.PI * 2); ctx.fill();
            // 橙色脚
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.ellipse(x + w/2 - 8, y + h - 4, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + w/2 + 8, y + h - 4, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // 翅膀
            ctx.fillStyle = '#374151';
            ctx.beginPath();
            ctx.ellipse(x + 6, y + h/2 + 4, 4, 10, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + w - 6, y + h/2 + 4, 4, 10, -0.3, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'crystal': {
            // ❄️ 冰晶刺 - 红色+橙色渐变，在蓝色背景上形成强烈对比
            // 主体 - 红色到橙色的尖锐晶体
            const crysGrad = ctx.createLinearGradient(x, y + h, x + w, y);
            crysGrad.addColorStop(0, '#dc2626');
            crysGrad.addColorStop(0.4, '#f97316');
            crysGrad.addColorStop(0.8, '#fbbf24');
            crysGrad.addColorStop(1, '#fef3c7');
            ctx.fillStyle = crysGrad;
            ctx.beginPath();
            ctx.moveTo(x + w/2, y);
            ctx.lineTo(x + w - 4, y + h - 8);
            ctx.lineTo(x + w/2 + 4, y + h);
            ctx.lineTo(x + w/2 - 4, y + h);
            ctx.lineTo(x + 4, y + h - 8);
            ctx.closePath();
            ctx.fill();
            // 内部裂纹 - 深色
            ctx.strokeStyle = '#991b1b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + w/2, y + 8);
            ctx.lineTo(x + w/2 - 4, y + 20);
            ctx.moveTo(x + w/2, y + 8);
            ctx.lineTo(x + w/2 + 3, y + 25);
            ctx.stroke();
            // 发光边缘
            ctx.strokeStyle = '#fcd34d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + w/2, y);
            ctx.lineTo(x + w - 4, y + h - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + w/2, y);
            ctx.lineTo(x + 4, y + h - 8);
            ctx.stroke();
            // 底部阴影
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h, w/2, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        // ===== 海底关卡障碍物 =====
        case 'coral': {
            // 珊瑚 - 粉红色+橙色
            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.moveTo(x + w/2, y + h);
            ctx.quadraticCurveTo(x + w/2 - 10, y + h/2, x + 5, y + 10);
            ctx.quadraticCurveTo(x + w/2, y + h/3, x + w - 5, y + 15);
            ctx.quadraticCurveTo(x + w/2 + 10, y + h/2, x + w/2, y + h);
            ctx.fill();
            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.arc(x + 8, y + 12, 4, 0, Math.PI * 2);
            ctx.arc(x + w - 8, y + 18, 5, 0, Math.PI * 2);
            ctx.arc(x + w/2, y + 8, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'jellyfish': {
            // 水母 - 半透明紫色，会上下浮动
            obs.animFrame = (obs.animFrame || 0) + 1;
            const float = Math.sin(obs.animFrame * 0.1) * 5;
            ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2 + float, w/2, Math.PI, 0);
            ctx.lineTo(x + w, y + h/2 + 10 + float);
            ctx.fill();
            // 触手
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const tx = x + 6 + i * 8;
                const wave = Math.sin(obs.animFrame * 0.2 + i) * 5;
                ctx.beginPath();
                ctx.moveTo(tx, y + h/2 + 10 + float);
                ctx.quadraticCurveTo(tx + wave, y + h - 10, tx, y + h);
                ctx.stroke();
            }
            break;
        }
        case 'mine': {
            // 水雷 - 黑色球体带红色尖刺
            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            // 尖刺
            ctx.fillStyle = '#dc2626';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const sx = x + w/2 + Math.cos(angle) * (w/2);
                const sy = y + h/2 + Math.sin(angle) * (h/2);
                ctx.beginPath();
                ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            // 中心红点
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, 6, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'shark': {
            // 鲨鱼 - 灰色流线型
            ctx.fillStyle = '#6b7280';
            ctx.beginPath();
            ctx.moveTo(x + w, y + h/2);
            ctx.quadraticCurveTo(x + w/2, y - 5, x, y + h/2);
            ctx.quadraticCurveTo(x + w/2, y + h + 5, x + w, y + h/2);
            ctx.fill();
            // 背鳍
            ctx.beginPath();
            ctx.moveTo(x + w/2 + 5, y + 5);
            ctx.lineTo(x + w/2 + 15, y - 10);
            ctx.lineTo(x + w/2 + 20, y + 5);
            ctx.fill();
            // 眼睛
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + 12, y + h/2 - 3, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x + 10, y + h/2 - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            // 牙齿
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x + 5 + i * 4, y + h/2 + 5);
                ctx.lineTo(x + 7 + i * 4, y + h/2 + 12);
                ctx.lineTo(x + 9 + i * 4, y + h/2 + 5);
                ctx.fill();
            }
            break;
        }
        case 'seaweed': {
            // 海草 - 绿色摆动
            obs.animFrame = (obs.animFrame || 0) + 1;
            ctx.fillStyle = '#16a34a';
            for (let i = 0; i < 3; i++) {
                const sx = x + 8 + i * 10;
                const sway = Math.sin(obs.animFrame * 0.1 + i) * 8;
                ctx.beginPath();
                ctx.moveTo(sx - 3, y + h);
                ctx.quadraticCurveTo(sx + sway, y + h/2, sx - 2, y);
                ctx.quadraticCurveTo(sx + sway + 4, y + h/2, sx + 3, y + h);
                ctx.fill();
            }
            break;
        }
        // ===== 太空关卡障碍物 =====
        case 'asteroid': {
            // 小行星 - 灰色不规则岩石
            ctx.fillStyle = '#6b7280';
            ctx.beginPath();
            ctx.moveTo(x + 8, y + h - 5);
            ctx.lineTo(x + 3, y + h * 0.4);
            ctx.lineTo(x + 12, y + 8);
            ctx.lineTo(x + w * 0.6, y + 3);
            ctx.lineTo(x + w - 5, y + h * 0.3);
            ctx.lineTo(x + w - 3, y + h - 8);
            ctx.lineTo(x + w * 0.5, y + h - 3);
            ctx.closePath();
            ctx.fill();
            // 陨石坑
            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.arc(x + w * 0.4, y + h * 0.4, 5, 0, Math.PI * 2);
            ctx.arc(x + w * 0.7, y + h * 0.6, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'laser': {
            // 激光栅栏 - 红色光束
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(x + w/2 - 2, y, 4, h);
            // 发光效果
            ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.fillRect(x + w/2 - 6, y, 12, h);
            // 顶部和底部发射器
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(x + 2, y, w - 4, 6);
            ctx.fillRect(x + 2, y + h - 6, w - 4, 6);
            break;
        }
        case 'ufo': {
            // UFO - 飞碟
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2 + 5, w/2, h/3, 0, 0, Math.PI * 2);
            ctx.fill();
            // 驾驶舱
            ctx.fillStyle = '#22d3ee';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/3, w/3, Math.PI, 0);
            ctx.fill();
            // 灯光
            ctx.fillStyle = '#fbbf24';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(x + 8 + i * 10, y + h/2 + 5, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }
        case 'satellite': {
            // 卫星 - 带太阳能板
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(x + w/2 - 6, y + 5, 12, h - 10);
            // 太阳能板
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(x, y + 8, 15, h - 16);
            ctx.fillRect(x + w - 15, y + 8, 15, h - 16);
            // 天线
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + w/2, y + 5);
            ctx.lineTo(x + w/2, y - 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + w/2, y - 5, 4, 0, Math.PI * 2);
            ctx.stroke();
            break;
        }
        case 'comet': {
            // 彗星 - 带尾巴
            const tailGrad = ctx.createLinearGradient(x, y + h/2, x + w + 30, y + h/2);
            tailGrad.addColorStop(0, '#3b82f6');
            tailGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)');
            tailGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = tailGrad;
            ctx.beginPath();
            ctx.moveTo(x + w/2, y + h/2 - 5);
            ctx.lineTo(x + w + 40, y + h/2);
            ctx.lineTo(x + w/2, y + h/2 + 5);
            ctx.fill();
            // 彗核
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dbeafe';
            ctx.beginPath();
            ctx.arc(x + w/2 - 3, y + h/2 - 3, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
    }
    ctx.restore();
}

// 绘制精美星星
function drawCollectStar(star) {
    const pulse = Math.sin(star.glowPulse + frameCount * 0.08) * 0.3 + 0.7;
    const floatY = Math.sin(star.floatOffset + frameCount * 0.05) * 4;
    
    ctx.save();
    ctx.translate(star.x, star.y + floatY);
    ctx.rotate(star.rotation);
    
    const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, star.size * 2.5);
    glow.addColorStop(0, `rgba(255, 230, 50, ${pulse * 0.4})`);
    glow.addColorStop(1, 'rgba(255, 200, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, star.size * 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    const starGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, star.size);
    starGrad.addColorStop(0, '#fff9c4');
    starGrad.addColorStop(0.4, '#ffd700');
    starGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = starGrad;
    drawStarShape(ctx, 0, 0, 5, star.size, star.size * 0.45);
    
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    drawStarShape(ctx, -2, -3, 5, star.size * 0.35, star.size * 0.15);
    
    ctx.restore();
}

// 绘制道具（升级版，不同道具有独特外观）
function drawPowerupItem(pu) {
    const pd = POWERUPS[pu.type];
    const color = pd.color;
    const pulse = Math.sin(pu.glowPulse + frameCount * 0.1) * 0.15 + 0.85;
    const bobY = Math.sin(pu.bobOffset + frameCount * 0.06) * 5;
    
    ctx.save();
    ctx.translate(pu.x, pu.y + bobY);
    
    // 外光晕
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, pu.size * 2.5);
    glow.addColorStop(0, color + '55');
    glow.addColorStop(1, color + '00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, pu.size * 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 根据道具类型绘制不同形状
    switch(pu.type) {
        case 'boots':
        case 'speed': {
            // 六边形底座
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
                const r = pu.size * pulse;
                i === 0 ? ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r) : ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
        }
        case 'invincible': {
            // 火焰形状
            ctx.rotate(pu.rotation);
            const fireGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, pu.size * pulse);
            fireGrad.addColorStop(0, '#fff');
            fireGrad.addColorStop(0.4, color);
            fireGrad.addColorStop(1, color + '00');
            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            ctx.arc(0, 0, pu.size * pulse, 0, Math.PI * 2);
            ctx.fill();
            // 5角星轮廓
            ctx.fillStyle = color;
            drawStarShape(ctx, 0, 0, 5, pu.size * pulse, pu.size * pulse * 0.4);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            break;
        }
        case 'slowmo': {
            // 时钟形状
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, pu.size * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            // 时钟指针
            const handAngle = frameCount * 0.08;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(handAngle) * pu.size * 0.7, Math.sin(handAngle) * pu.size * 0.7);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(handAngle * 12) * pu.size * 0.5, Math.sin(handAngle * 12) * pu.size * 0.5);
            ctx.stroke();
            break;
        }
        case 'magnet': {
            // 马蹄磁铁形
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, pu.size * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
        }
        default: {
            // 普通圆形
            const cg = ctx.createRadialGradient(-3, -3, 2, 0, 0, pu.size);
            cg.addColorStop(0, '#fff');
            cg.addColorStop(0.3, color);
            cg.addColorStop(1, color + 'aa');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(0, 0, pu.size * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    // Emoji图标
    ctx.font = `${Math.floor(pu.size * 0.9)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pd.icon, 0, 1);
    
    ctx.restore();
    
    // 道具名称标签（悬停在道具上方）
    const labelAlpha = 0.6 + Math.sin(frameCount * 0.05) * 0.2;
    ctx.fillStyle = `rgba(0,0,0,${labelAlpha * 0.6})`;
    ctx.beginPath();
    ctx.roundRect(pu.x - 28, pu.y + bobY - pu.size - 22, 56, 16, 4);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pd.name, pu.x, pu.y + bobY - pu.size - 14);
}

// 辅助：绘制星形
function drawStarShape(context, cx, cy, spikes, outer, inner) {
    let rot = -Math.PI / 2;
    const step = Math.PI / spikes;
    context.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        context.lineTo(cx + Math.cos(rot) * r, cy + Math.sin(rot) * r);
        rot += step;
    }
    context.closePath();
    context.fill();
}

// ==================== 绘制背景元素 ====================
function drawBackground() {
    const level = LEVELS[currentLevel];
    
    // 时间减速时，轻微蓝色遮罩
    const isSlowmo = player.powerups.slowmo.active;
    
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    level.skyColors.forEach((c, i) => {
        skyGrad.addColorStop(i / (level.skyColors.length - 1), c);
    });
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    if (isSlowmo) {
        ctx.fillStyle = 'rgba(50, 80, 120, 0.12)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    
    // 流星
    meteors.forEach(m => {
        const alpha = m.life / 60;
        ctx.strokeStyle = `rgba(255, 220, 180, ${alpha})`;
        ctx.lineWidth = m.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 6, m.y - m.vy * 6);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 180, 100, ${alpha * 0.3})`;
        ctx.lineWidth = m.size * 3;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10);
        ctx.stroke();
    });
    
    // 背景星星
    bgStars.forEach(s => {
        const twinkle = 0.4 + Math.sin(s.twinkle + frameCount * 0.04) * 0.6;
        if (s.layer === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.6})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else if (s.layer === 1) {
            const gstarGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
            gstarGrad.addColorStop(0, `rgba(255,255,255,${twinkle * 0.8})`);
            gstarGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gstarGrad;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
            ctx.fillRect(s.x - s.size, s.y - 1, s.size * 2, 2);
            ctx.fillRect(s.x - 1, s.y - s.size, 2, s.size * 2);
        } else {
            ctx.fillStyle = `rgba(200, 220, 255, ${twinkle * 0.5})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    bgClouds.forEach(c => {
        ctx.fillStyle = `rgba(180, 160, 255, ${c.alpha})`;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.width, c.height, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    if (level.bgElements === 'forest') {
        bgTrees.forEach(t => drawBgTree(t.x, t.y, t.size, t.type));
    } else if (level.bgElements === 'desert') {
        bgTrees.forEach(t => drawBgDune(t.x, t.y, t.size));
    } else if (level.bgElements === 'ice') {
        bgTrees.forEach(t => drawBgIceMountain(t.x, t.y, t.size));
    } else if (level.bgElements === 'ocean') {
        bgTrees.forEach(t => drawBgCoral(t.x, t.y, t.size));
        // 海底气泡效果
        if (frameCount % 30 === 0) {
            bgParticles.push({
                x: Math.random() * CANVAS_W,
                y: CANVAS_H,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -1 - Math.random(),
                size: 2 + Math.random() * 4,
                life: 200,
                type: 'bubble'
            });
        }
    } else if (level.bgElements === 'space') {
        bgTrees.forEach(t => drawBgPlanet(t.x, t.y, t.size));
        // 太空星云效果
        if (frameCount % 60 === 0) {
            bgParticles.push({
                x: Math.random() * CANVAS_W,
                y: Math.random() * GROUND_Y,
                vx: -0.2,
                vy: 0,
                size: 20 + Math.random() * 30,
                life: 300,
                type: 'nebula'
            });
        }
    }
    
    // 更新和绘制背景粒子
    for (let i = bgParticles.length - 1; i >= 0; i--) {
        const p = bgParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.type === 'bubble') {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.life / 200 * 0.3})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${p.life / 200 * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        } else if (p.type === 'nebula') {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grad.addColorStop(0, `rgba(167, 139, 250, ${p.life / 300 * 0.2})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if (p.life <= 0 || p.y < 0) bgParticles.splice(i, 1);
    }
    
    const fogGrad = ctx.createLinearGradient(0, GROUND_Y - 40, 0, GROUND_Y);
    fogGrad.addColorStop(0, 'rgba(0,0,0,0)');
    fogGrad.addColorStop(1, level.skyColors[level.skyColors.length - 1] + 'aa');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, GROUND_Y - 40, CANVAS_W, 40);
    
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
    groundGrad.addColorStop(0, isSlowmo ? '#3a5a7a' : level.groundTopColor);
    groundGrad.addColorStop(0.15, isSlowmo ? '#1a3050' : level.groundColor);
    groundGrad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    
    ctx.strokeStyle = isSlowmo ? '#6ab3ff' : level.glowColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = isSlowmo ? '#6ab3ff' : level.glowColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = `rgba(255,255,255,0.04)`;
    ctx.lineWidth = 1;
    const gridScroll = frameCount * gameSpeed * 0.5 % 40;
    for (let x = -gridScroll; x < CANVAS_W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, GROUND_Y); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = GROUND_Y; y < CANVAS_H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }
}

function drawBgTree(x, y, size, type) {
    ctx.globalAlpha = 0.2;
    if (type === 0) {
        ctx.fillStyle = '#1a472a';
        ctx.beginPath();
        ctx.moveTo(x, y - size); ctx.lineTo(x - size * 0.45, y); ctx.lineTo(x + size * 0.45, y);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - size * 1.3); ctx.lineTo(x - size * 0.3, y - size * 0.5); ctx.lineTo(x + size * 0.3, y - size * 0.5);
        ctx.closePath(); ctx.fill();
    } else if (type === 1) {
        ctx.fillStyle = '#2d6a2d';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.6, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 5, y - size * 0.3, 10, size * 0.4);
    } else {
        ctx.fillStyle = '#1b4d1b';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x, y - size - i * size * 0.3);
            ctx.lineTo(x - size * (0.5 - i * 0.1), y - size * (0.5 - i * 0.15));
            ctx.lineTo(x + size * (0.5 - i * 0.1), y - size * (0.5 - i * 0.15));
            ctx.closePath(); ctx.fill();
        }
    }
    ctx.globalAlpha = 1;
}

function drawBgDune(x, y, size) {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#c8860a';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.8, size * 0.3, 0, Math.PI, 0);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawBgIceMountain(x, y, size) {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(x, y - size); ctx.lineTo(x - size * 0.5, y); ctx.lineTo(x + size * 0.5, y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x, y - size); ctx.lineTo(x - size * 0.15, y - size * 0.6); ctx.lineTo(x + size * 0.12, y - size * 0.65);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
}

function drawBgCoral(x, y, size) {
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - size * 0.3, y - size * 0.5, x - size * 0.2, y - size);
    ctx.quadraticCurveTo(x, y - size * 0.7, x + size * 0.2, y - size * 0.9);
    ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.4, x, y);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawBgPlanet(x, y, size) {
    ctx.globalAlpha = 0.08;
    const colors = ['#a855f7', '#22d3ee', '#f472b6', '#fbbf24'];
    const color = colors[Math.floor(x / 100) % colors.length];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.5, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // 行星环
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.5, size * 0.6, size * 0.15, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

// ==================== 主绘制函数 ====================
function draw() {
    if (screenShake > 0) {
        ctx.save();
        const sx = (Math.random() - 0.5) * screenShake;
        const sy = (Math.random() - 0.5) * screenShake;
        ctx.translate(sx, sy);
        screenShake = Math.max(0, screenShake - 1);
    }
    
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawBackground();
    
    // 玩家拖尾
    if (player.trail.length > 2) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < player.trail.length; i++) {
            const t = i / player.trail.length;
            let trailColor;
            if (player.powerups.invincible.active) {
                const hue = (player.rainbowHue + i * 20) % 360;
                trailColor = `hsla(${hue}, 100%, 60%, ${t * 0.7})`;
            } else if (player.skills.dash.active) {
                trailColor = `rgba(239,68,68,${t * 0.7})`;
            } else {
                trailColor = `rgba(167,139,250,${t * 0.5})`;
            }
            ctx.strokeStyle = trailColor;
            ctx.lineWidth = (player.skills.dash.active ? 14 : 10) * t;
            ctx.shadowColor = player.skills.dash.active ? '#ef4444' : '#a78bfa';
            ctx.shadowBlur = player.skills.dash.active ? 15 : 8;
            ctx.beginPath();
            ctx.moveTo(player.trail[i - 1].x, player.trail[i - 1].y);
            ctx.lineTo(player.trail[i].x, player.trail[i].y);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
    
    // 障碍物
    obstacles.forEach(obs => {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width/2, GROUND_Y + 4, obs.width/2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        drawObstacle(obs);
    });
    
    // 机关
    mechanisms.forEach(mech => drawMechanism(mech));
    
    // Boss
    if (boss) drawBoss();
    
    // Boss投射物
    bossProjectiles.forEach(proj => drawBossProjectile(proj));
    
    stars.forEach(s => drawCollectStar(s));
    powerupItems.forEach(p => drawPowerupItem(p));
    
    drawMagician(
        player.x, player.y, player.width, player.height,
        player.facingRight, player.walkFrame, player.jumping,
        player.shieldActive, player.skills.dash.active
    );
    
    // 玩家阴影
    const shadowW = player.width + 10;
    const shadowAlpha = 0.2 + (1 - (player.y - (GROUND_Y - player.height)) / 200) * 0.3;
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0.05, shadowAlpha)})`;
    ctx.beginPath();
    ctx.ellipse(player.x + player.width/2, GROUND_Y + 5, shadowW/2, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 磁铁磁场
    if (player.powerups.magnet.active) {
        const magnetAlpha = 0.1 + Math.sin(frameCount * 0.1) * 0.05;
        ctx.strokeStyle = `rgba(233, 30, 99, ${magnetAlpha + 0.15})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 8]);
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // 粒子
    particles.forEach(p => {
        const lifeRatio = p.life / p.maxLife;
        ctx.globalAlpha = lifeRatio;
        if (p.type === 'circle') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'star') {
            ctx.fillStyle = p.color;
            drawStarShape(ctx, p.x, p.y, 4, p.size * lifeRatio, p.size * lifeRatio * 0.5);
        } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.roundRect(p.x - p.size/2 * lifeRatio, p.y - p.size/2 * lifeRatio, p.size * lifeRatio, p.size * lifeRatio, 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    });
    
    // 浮动文字（带缩放动画）
    floatingTexts.forEach(t => {
        const alpha = t.life / 55;
        const scale = t.scale ? Math.max(1, t.scale * (t.life / 55)) : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(t.x, t.y);
        ctx.scale(scale, scale);
        ctx.fillStyle = t.color;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 8;
        ctx.fillText(t.text, 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.globalAlpha = 1;
    });
    
    drawProgressBar();
    
    if (screenShake > 0) ctx.restore();
}

function drawProgressBar() {
    const level = LEVELS[currentLevel];
    const progress = Math.min(1, distance / level.targetDistance);
    const barX = 180, barY = 8, barW = 440, barH = 10;
    
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fill();
    
    if (progress > 0) {
        const pg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        pg.addColorStop(0, '#a78bfa');
        pg.addColorStop(0.5, '#f59e0b');
        pg.addColorStop(1, '#10b981');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * progress, barH, 5);
        ctx.fill();
        ctx.shadowColor = '#a78bfa';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = 'rgba(167,139,250,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW * progress, barH);
        ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = '#f59e0b';
    ctx.font = '14px serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏁', barX + barW + 5, barY + barH + 3);
    
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(distance)}m / ${level.targetDistance}m`, barX + barW/2, barY + barH + 14);
}

// ==================== 更新函数 ====================
function update() {
    if (gameState !== 'playing') return;
    
    frameCount++;
    
    const speedMultiplier = player.powerups.speed.active ? 1.5 : 1;
    const dashMultiplier = player.skills.dash.active ? 2.2 : 1;
    // 时间减速：敌人和世界变慢，玩家不变
    const slowmoMultiplier = player.powerups.slowmo.active ? 0.4 : 1;
    const worldSpeed = gameSpeed * speedMultiplier * dashMultiplier * slowmoMultiplier;
    const effectiveSpeed = worldSpeed;
    
    distance += gameSpeed * speedMultiplier * dashMultiplier / 10; // 玩家距离不受减速影响
    
    if (distance >= LEVELS[currentLevel].targetDistance) {
        levelComplete();
        return;
    }
    
    if (frameCount % 500 === 0) {
        gameSpeed = Math.min(gameSpeed + 0.3, 11);
    }
    
    if (frameCount % 50 === 0) {
        Object.keys(player.skills).forEach(sk => {
            if (player.skills[sk].energy < 100) {
                player.skills[sk].energy = Math.min(100, player.skills[sk].energy + 4);
            }
        });
    }
    
    // 左右移动
    const moveSpeed = player.skills.dash.active ? player.speed * 2.2 : player.speed;
    if (keys.left) {
        player.velocityX = -moveSpeed;
        player.facingRight = false;
        player.walkTimer++;
    } else if (keys.right) {
        player.velocityX = moveSpeed;
        player.facingRight = true;
        player.walkTimer++;
    } else {
        player.velocityX *= 0.7;
        if (Math.abs(player.velocityX) < 0.3) player.velocityX = 0;
    }
    
    if (!player.jumping && Math.abs(player.velocityX) > 0.5) player.walkFrame++;
    
    player.x += player.velocityX;
    player.x = Math.max(0, Math.min(CANVAS_W - player.width, player.x));
    
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    if (player.y >= GROUND_Y - player.height) {
        player.y = GROUND_Y - player.height;
        player.velocityY = 0;
        player.jumping = false;
        player.jumpCount = 0;
        if (!player.skills.doubleJump.unlocked && !player.powerups.boots.active) {
            player.maxJumps = 1;
        }
    }
    
    player.trail.push({ x: player.x + player.width/2, y: player.y + player.height/2 });
    if (player.trail.length > 12) player.trail.shift();
    
    if (player.shieldActive) {
        player.shieldTimer--;
        if (player.shieldTimer <= 0) player.shieldActive = false;
    }
    
    if (player.skills.dash.active) {
        player.skills.dash.timer--;
        if (player.skills.dash.timer <= 0) player.skills.dash.active = false;
        if (frameCount % 3 === 0) {
            createParticles(player.x, player.y + player.height/2, '#ef4444', 3, {
                angle: Math.PI, spread: 0.6, speed: 3, life: 15, size: 3, gravity: 0
            });
        }
    }
    
    // 更新道具计时
    Object.keys(player.powerups).forEach(pu => {
        if (player.powerups[pu].active) {
            player.powerups[pu].timer--;
            if (player.powerups[pu].timer <= 0) {
                player.powerups[pu].active = false;
                // 道具消失时的提示
                onPowerupExpired(pu);
            }
        }
    });
    
    // 磁铁吸附
    if (player.powerups.magnet.active) {
        stars.forEach(s => {
            const dx = (player.x + player.width/2) - s.x;
            const dy = (player.y + player.height/2) - s.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 160 && dist > 8) {
                s.x += dx * 0.06;
                s.y += dy * 0.06;
            }
        });
    }
    
    // 生成对象
    const spawnInterval = Math.max(40, 80 - Math.floor(distance / 50));
    if (frameCount % spawnInterval === 0) createObstacle();
    if (frameCount % 60 === 0) createStar();
    if (frameCount % 250 === 0) createPowerup();
    if (frameCount % 200 === 0 && Math.random() < 0.6) createMeteor();
    
    // 生成机关（每400帧，30%概率）
    if (frameCount % 400 === 0 && Math.random() < 0.3) createMechanism();
    
    // Boss战检测 - 到达90%距离时触发
    const levelConfig = LEVELS[currentLevel];
    if (!boss && distance >= levelConfig.targetDistance * 0.9) {
        spawnBoss();
    }
    
    // 更新Boss
    if (boss) {
        boss.animFrame++;
        bossAttack();
        
        // Boss计时器
        boss.timeCounter++;
        if (boss.timeCounter >= boss.timeLimit) {
            // Boss时间到，自动消失
            createFloatingText(boss.x + boss.width/2, boss.y - 30, boss.name + ' 逃跑了！', '#ffd700');
            boss = null;
            bossProjectiles = [];
        }
        
        // Boss受伤闪烁
        if (boss.hitFlash > 0) boss.hitFlash--;
        
        // 玩家攻击Boss检测
        if (player.x + player.width > boss.x && 
            player.x < boss.x + boss.width &&
            player.y + player.height > boss.y + 10 &&  // 只攻击Boss身体部分
            player.y < boss.y + boss.height - 10) {
            
            // 玩家跳跃到Boss上方（跳跃攻击）
            if (player.velocityY > 0 && player.y < boss.y + boss.height/3) {
                damageBoss(25);
                player.velocityY = -12;  // 弹跳
                playSound('jump');
                createParticles(boss.x + boss.width/2, boss.y + 10, boss.color, 20, { type: 'star', speed: 6, life: 30 });
                createFloatingText(boss.x + boss.width/2, boss.y - 10, '踩踏攻击！', '#ff6b6b');
                addExp(EXP_REWARDS.bossHit);
            }
            // 玩家冲刺攻击
            else if (player.skills.dash.active) {
                damageBoss(15);
                playSound('dash');
                createParticles(boss.x + boss.width/2, boss.y + boss.height/2, '#ef4444', 25, { type: 'circle', speed: 8, life: 35 });
                createFloatingText(boss.x + boss.width/2, boss.y - 10, '冲刺攻击！', '#ef4444');
                addExp(EXP_REWARDS.bossHit);
            }
            // 玩家碰到Boss（受伤）
            else if (!player.powerups.invincible.active && !player.shieldActive) {
                screenShake = 15;
                createParticles(player.x + player.width/2, player.y + player.height/2, '#ef4444', 25, { type: 'circle', life: 40, speed: 6 });
                playSound('gameover');
                setTimeout(() => gameOver(), 300);
                gameState = 'dying';
            }
        }
        
        // 检查Boss是否被击败
        if (boss.health <= 0) {
            defeatBoss();
        }
    }
    
    // 更新Boss投射物
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const proj = bossProjectiles[i];
        
        // 导弹追踪
        if (proj.tracking && proj.type === 'missile') {
            const dx = (player.x + player.width/2) - proj.x;
            const dy = (player.y + player.height/2) - proj.y;
            proj.vx += dx * 0.001;
            proj.vy += dy * 0.001;
            const speed = Math.sqrt(proj.vx*proj.vx + proj.vy*proj.vy);
            if (speed > 6) {
                proj.vx = (proj.vx/speed) * 6;
                proj.vy = (proj.vy/speed) * 6;
            }
        }
        
        // 吸力效果
        if (proj.type === 'suction') {
            const dx = proj.x - (player.x + player.width/2);
            const dy = proj.y - (player.y + player.height/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 120 && dist > 10) {
                player.x += (dx/dist) * proj.pullForce;
                player.y += (dy/dist) * proj.pullForce;
            }
        }
        
        proj.x += proj.vx * slowmoMultiplier;
        proj.y += proj.vy * slowmoMultiplier;
        proj.life--;
        
        // 碰撞检测
        if (proj.life > 0 &&
            player.x < proj.x + proj.width &&
            player.x + player.width > proj.x &&
            player.y < proj.y + proj.height &&
            player.y + player.height > proj.y) {
            
            if (!player.powerups.invincible.active && !player.shieldActive) {
                screenShake = 12;
                createParticles(player.x + player.width/2, player.y + player.height/2, '#ef4444', 20, { type: 'circle', life: 35, speed: 5 });
                playSound('gameover');
                setTimeout(() => gameOver(), 300);
                gameState = 'dying';
            } else if (player.shieldActive) {
                player.shieldActive = false;
                createFloatingText(player.x + player.width/2, player.y - 20, '护盾格挡！', '#2ecc71');
            }
        }
        
        if (proj.life <= 0 || proj.x + proj.width < 0 || proj.y > CANVAS_H) {
            bossProjectiles.splice(i, 1);
        }
    }
    
    // 更新障碍物（受减速影响）
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= effectiveSpeed;
        
        if (!obs.passed &&
            player.x < obs.x + obs.width - 6 &&
            player.x + player.width > obs.x + 6 &&
            player.y < obs.y + obs.height - 4 &&
            player.y + player.height > obs.y + 4) {
            
            // 无敌状态直接穿过！
            if (player.powerups.invincible.active) {
                obs.passed = true;
                createParticles(obs.x + obs.width/2, obs.y + obs.height/2, '#ff5722', 15, { type: 'star', speed: 5, life: 25 });
                createFloatingText(obs.x + obs.width/2, obs.y - 10, '无敌穿越！', '#ff5722');
            } else if (player.shieldActive) {
                player.shieldActive = false;
                obs.passed = true;
                playSound('shield');
                screenShake = 8;
                createParticles(player.x + player.width/2, player.y + player.height/2, '#2ecc71', 20, { type: 'circle', life: 40, speed: 5 });
                createFloatingText(player.x + player.width/2, player.y - 20, '护盾格挡！', '#2ecc71');
            } else {
                screenShake = 15;
                createParticles(player.x + player.width/2, player.y + player.height/2, '#ef4444', 25, { type: 'circle', life: 40, speed: 6 });
                playSound('gameover');
                setTimeout(() => gameOver(), 300);
                gameState = 'dying';
            }
        }
        
        if (obs.x + obs.width < 0) obstacles.splice(i, 1);
    }
    
    // 更新机关
    for (let i = mechanisms.length - 1; i >= 0; i--) {
        const mech = mechanisms[i];
        mech.x -= effectiveSpeed;
        mech.animFrame++;
        
        // 移动平台动画
        if (mech.type === 'platform') {
            const config = MECHANISMS.platform;
            mech.y = mech.origY + Math.sin(mech.animFrame * 0.03) * config.moveRange;
        }
        
        // 碰撞检测
        if (!mech.used &&
            player.x < mech.x + mech.width &&
            player.x + player.width > mech.x &&
            player.y < mech.y + mech.height &&
            player.y + player.height > mech.y) {
            
            switch(mech.type) {
                case 'platform':
                    // 站在平台上
                    if (player.velocityY >= 0 && player.y + player.height <= mech.y + mech.height + 10) {
                        player.y = mech.y - player.height;
                        player.velocityY = 0;
                        player.jumping = false;
                        player.jumpCount = 0;
                    }
                    break;
                case 'spring':
                    // 弹簧弹跳
                    player.velocityY = MECHANISMS.spring.bounceForce;
                    player.jumping = true;
                    mech.used = true;
                    playSound('jump');
                    createParticles(mech.x + mech.width/2, mech.y + mech.height/2, '#fbbf24', 15, { type: 'star', speed: 5, life: 25 });
                    createFloatingText(mech.x + mech.width/2, mech.y - 20, '弹跳！', '#fbbf24');
                    break;
                case 'portal':
                    // 传送门
                    if (!mech.used) {
                        player.x += MECHANISMS.portal.teleportDistance;
                        mech.used = true;
                        playSound('powerup');
                        createParticles(mech.x + mech.width/2, mech.y + mech.height/2, '#06b6d4', 25, { type: 'circle', speed: 6, life: 40 });
                        createFloatingText(mech.x + mech.width/2, mech.y - 30, '传送！', '#06b6d4');
                    }
                    break;
            }
        }
        
        if (mech.x + mech.width < 0) mechanisms.splice(i, 1);
    }
    
    // 更新星星
    for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x -= effectiveSpeed;
        s.rotation += 0.04;
        
        if (!s.collected &&
            player.x < s.x + s.size &&
            player.x + player.width > s.x - s.size &&
            player.y < s.y + s.size &&
            player.y + player.height > s.y - s.size) {
            
            s.collected = true;
            const val = getStarValue();
            score += val;
            starCount++;
            addExp(EXP_REWARDS.star);
            playSound('collect');
            createParticles(s.x, s.y, '#ffd700', 12, { type: 'star', life: 30, speed: 4 });
            createFloatingText(s.x, s.y - 10, '+' + val, '#ffd700');
            stars.splice(i, 1);
        }
        
        if (s.x + s.size < 0) stars.splice(i, 1);
    }
    
    // 更新道具
    for (let i = powerupItems.length - 1; i >= 0; i--) {
        const pu = powerupItems[i];
        pu.x -= effectiveSpeed;
        pu.rotation += 0.025;
        pu.glowPulse += 0.1;
        
        if (!pu.collected &&
            player.x < pu.x + pu.size &&
            player.x + player.width > pu.x - pu.size &&
            player.y < pu.y + pu.size &&
            player.y + player.height > pu.y - pu.size) {
            
            pu.collected = true;
            activatePowerup(pu.type);
            
            // 每种道具播放不同音效
            if (pu.type === 'invincible') playSound('invincible');
            else if (pu.type === 'slowmo') playSound('slowmo');
            else if (pu.type === 'boots') playSound('boots');
            else playSound('powerup');
            
            createParticles(pu.x, pu.y, POWERUPS[pu.type].color, 20, { type: 'circle', life: 40, speed: 5 });
            createFloatingText(pu.x, pu.y - 15, POWERUPS[pu.type].icon + ' ' + POWERUPS[pu.type].name + '！', POWERUPS[pu.type].color);
            powerupItems.splice(i, 1);
        }
        
        if (pu.x + pu.size < 0) powerupItems.splice(i, 1);
    }
    
    // 更新粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    // 更新浮动文字
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const t = floatingTexts[i];
        t.y += t.vy;
        t.life--;
        if (t.life <= 0) floatingTexts.splice(i, 1);
    }
    
    // 更新背景
    bgStars.forEach(s => {
        s.x -= s.speed * speedMultiplier * slowmoMultiplier * 0.5;
        if (s.x < 0) s.x = CANVAS_W;
    });
    bgClouds.forEach(c => {
        c.x -= c.speed * speedMultiplier * slowmoMultiplier;
        if (c.x + c.width < 0) c.x = CANVAS_W + c.width;
    });
    bgTrees.forEach(t => {
        t.x -= t.speed * speedMultiplier * slowmoMultiplier;
        if (t.x < -100) t.x = CANVAS_W + 50 + Math.random() * 100;
    });
    
    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx * slowmoMultiplier;
        m.y += m.vy * slowmoMultiplier;
        m.life--;
        if (m.life <= 0 || m.y > GROUND_Y || m.x < -50) meteors.splice(i, 1);
    }
    
    updateUI();
}

function activatePowerup(type) {
    player.powerups[type].active = true;
    player.powerups[type].timer = POWERUPS[type].duration;
    
    // 特殊道具的额外效果
    if (type === 'boots') {
        player.maxJumps = 2; // 立即激活二段跳
    }
}

function onPowerupExpired(type) {
    if (type === 'boots' && !player.skills.doubleJump.unlocked) {
        player.maxJumps = 1; // 靴子消失，取消二段跳
    }
}

// ==================== 跳跃和技能 ====================
function jump() {
    if (gameState !== 'playing') return;
    if (player.jumpCount < player.maxJumps) {
        player.velocityY = player.jumpPower;
        player.jumpCount++;
        player.jumping = true;
        
        if (player.jumpCount === 1) {
            playSound('jump');
            createParticles(player.x + player.width/2, player.y + player.height, '#a78bfa', 8, {
                angle: -Math.PI / 2, spread: 1.2, upBias: 2, speed: 3, life: 20, type: 'circle'
            });
        } else {
            playSound('doubleJump');
            createParticles(player.x + player.width/2, player.y + player.height/2, '#00bcd4', 18, {
                type: 'circle', speed: 4, life: 28
            });
            createFloatingText(player.x + player.width/2, player.y - 10, '✦ 二段跳！', '#00bcd4');
        }
    }
}

function activateSkill(skillName) {
    if (gameState !== 'playing') return;
    if (!player.skills[skillName].unlocked) return;
    const skill = SKILLS[skillName];
    
    switch(skillName) {
        case 'doubleJump':
            if (player.skills.doubleJump.energy >= skill.cost) {
                player.maxJumps = 2;
                player.skills.doubleJump.energy -= skill.cost;
            }
            break;
        case 'shield':
            if (player.skills.shield.energy >= skill.cost && !player.shieldActive) {
                player.shieldActive = true;
                player.shieldTimer = skill.duration;
                player.skills.shield.energy -= skill.cost;
                playSound('shield');
                createParticles(player.x + player.width/2, player.y + player.height/2, '#2ecc71', 18, { type: 'circle', speed: 4 });
            }
            break;
        case 'dash':
            if (player.skills.dash.energy >= skill.cost && !player.skills.dash.active) {
                player.skills.dash.active = true;
                player.skills.dash.timer = skill.duration;
                player.skills.dash.energy -= skill.cost;
                playSound('dash');
                createParticles(player.x, player.y + player.height/2, '#ef4444', 12, { angle: Math.PI, speed: 5, spread: 0.8 });
            }
            break;
    }
}

// ==================== UI ====================
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('distance').textContent = Math.floor(distance);
    document.getElementById('starCount').textContent = starCount;
    
    Object.keys(SKILLS).forEach(sk => {
        const energy = player.skills[sk].energy;
        const bar = document.getElementById(`energy-${sk}`);
        if (bar) {
            bar.style.width = energy + '%';
            bar.style.background = player.skills[sk].unlocked ?
                (energy >= SKILLS[sk].cost ? SKILLS[sk].color : '#555') : '#333';
        }
        const slot = document.getElementById(`skill-${sk}`);
        if (slot) {
            slot.style.opacity = player.skills[sk].unlocked ? '1' : '0.4';
        }
    });
    
    const pc = document.getElementById('activePowerups');
    if (pc) {
        pc.innerHTML = Object.keys(player.powerups)
            .filter(t => player.powerups[t].active)
            .map(t => {
                const secs = Math.ceil(player.powerups[t].timer / 60);
                const pd = POWERUPS[t];
                const timerPct = player.powerups[t].timer / pd.duration * 100;
                return `<div class="powerup-badge-v2" style="border-color:${pd.color}">
                    <span>${pd.icon}</span>
                    <span style="color:${pd.color}">${pd.name}</span>
                    <div class="powerup-timer-bar" style="background:${pd.color};width:${timerPct}%"></div>
                </div>`;
            }).join('');
    }
}

// ==================== 游戏状态 ====================
function levelComplete() {
    gameState = 'levelComplete';
    stopBGM();
    playSound('levelComplete');
    
    const levelOrder = ['forest', 'desert', 'ice', 'ocean', 'space'];
    const idx = levelOrder.indexOf(currentLevel);
    if (idx < levelOrder.length - 1) {
        const next = levelOrder[idx + 1];
        if (!playerData.unlockedLevels.includes(next)) {
            playerData.unlockedLevels.push(next);
        }
    }
    playerData.totalStars += starCount;
    const total = score + Math.floor(distance);
    if (total > playerData.highScore) playerData.highScore = total;
    
    document.getElementById('levelCompleteScore').textContent = total;
    document.getElementById('levelCompleteStars').textContent = starCount;
    document.getElementById('levelCompleteScreen').style.display = 'flex';
}

// ==================== Boss系统函数 ====================
function damageBoss(amount) {
    if (!boss) return;
    
    boss.health -= amount;
    boss.hitFlash = 10;  // 受伤闪烁效果
    
    // 受伤音效
    playSound('invincible');
    
    // 显示伤害数字
    createFloatingText(boss.x + boss.width/2, boss.y - 40, '-' + amount, '#ff6b6b');
    
    // 如果Boss血量低于50%进入第二阶段
    if (boss.health <= boss.maxHealth * 0.5 && boss.phase === 1) {
        boss.phase = 2;
        boss.attackInterval = Math.floor(boss.attackInterval * 0.7);  // 攻击间隔缩短
        createFloatingText(boss.x + boss.width/2, boss.y - 60, '第二阶段！', '#ff5722');
    }
}

function defeatBoss() {
    if (!boss) return;
    
    // Boss死亡特效
    createParticles(boss.x + boss.width/2, boss.y + boss.height/2, boss.color, 50, {
        type: 'circle', speed: 8, life: 60
    });
    createFloatingText(boss.x + boss.width/2, boss.y - 30, boss.name + ' 被击败！', '#ffd700');
    
    // 奖励
    score += 500;
    starCount += 10;
    createFloatingText(boss.x + boss.width/2, boss.y - 50, '+500分 +10⭐', '#ffd700');
    
    // 清除Boss和投射物
    boss = null;
    bossProjectiles = [];
    
    playSound('levelComplete');
    
    // 继续跑酷到终点
}

function gameOver() {
    gameState = 'gameover';
    stopBGM();
    playerData.totalStars += starCount;
    const total = score + Math.floor(distance);
    if (total > playerData.highScore) playerData.highScore = total;
    
    // 结算经验
    const expGained = Math.floor(total / 10);
    addExp(expGained);
    
    document.getElementById('finalScore').textContent = total;
    document.getElementById('finalStars').textContent = starCount;
    document.getElementById('highScore').textContent = playerData.highScore;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// ==================== 成长系统 ====================
function addExp(amount) {
    if (playerData.level >= LEVEL_CONFIG.maxLevel) return;
    
    playerData.exp += amount;
    
    // 检查升级
    while (playerData.exp >= playerData.expToNext && playerData.level < LEVEL_CONFIG.maxLevel) {
        playerData.exp -= playerData.expToNext;
        levelUp();
    }
    
    saveGameData();
}

function levelUp() {
    playerData.level++;
    playerData.statPoints++;
    playerData.expToNext = Math.floor(LEVEL_CONFIG.baseExp * Math.pow(LEVEL_CONFIG.expMultiplier, playerData.level - 1));
    
    // 升级特效
    createFloatingText(CANVAS_W / 2, CANVAS_H / 2, '等级提升！', '#ffd700');
    playSound('powerup');
    
    // 显示升级提示
    showLevelUpNotification();
}

function showLevelUpNotification() {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        padding: 20px 40px;
        border-radius: 16px;
        font-size: 24px;
        font-weight: bold;
        z-index: 1000;
        animation: levelUpAnim 2s ease-out forwards;
        box-shadow: 0 0 40px rgba(245, 158, 11, 0.5);
    `;
    notif.innerHTML = `🎉 等级 ${playerData.level}！<br><span style="font-size:14px">获得1点属性点</span>`;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 2000);
}

function upgradeStat(statName) {
    const stat = STAT_UPGRADES[statName];
    if (!stat) return;
    
    if (playerData.statPoints >= stat.cost && playerData.stats[statName] < stat.max) {
        playerData.statPoints -= stat.cost;
        playerData.stats[statName]++;
        applyStatBonuses();
        saveGameData();
        updateGrowthUI();
        playSound('powerup');
    }
}

function applyStatBonuses() {
    const s = playerData.stats;
    
    // 应用属性加成到玩家
    player.jumpPower = -15 - (s.jumpPower * STAT_UPGRADES.jumpPower.bonus);
    player.speed = 4.5 + (s.moveSpeed * STAT_UPGRADES.moveSpeed.bonus);
    
    // 护盾持续时间加成在技能激活时计算
    // 能量恢复在 update 中计算
    // 星星价值在收集时计算
}

function getStarValue() {
    const baseValue = player.powerups.multiplier.active ? 20 : 10;
    const bonus = playerData.stats.starValue * STAT_UPGRADES.starValue.bonus;
    return Math.floor(baseValue * (1 + bonus));
}

function saveGameData() {
    localStorage.setItem('magicJumpData', JSON.stringify(playerData));
}

function loadGameData() {
    const saved = localStorage.getItem('magicJumpData');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(playerData, data);
        applyStatBonuses();
    }
}

function resetGame() {
    gameState = 'playing';
    score = 0; distance = 0; starCount = 0; frameCount = 0; screenShake = 0;
    gameSpeed = LEVELS[currentLevel].gameSpeed;
    
    player.x = 120;
    player.y = GROUND_Y - player.height;
    player.velocityX = 0; player.velocityY = 0;
    player.jumping = false; player.jumpCount = 0;
    player.maxJumps = player.skills.doubleJump.unlocked ? 2 : 1;
    player.trail = []; player.facingRight = true;
    player.walkFrame = 0; player.walkTimer = 0;
    player.shieldActive = false;
    player.skills.dash.active = false;
    player.rainbowHue = 0;
    
    Object.keys(player.skills).forEach(sk => { player.skills[sk].energy = 100; });
    Object.keys(player.powerups).forEach(pu => { player.powerups[pu].active = false; player.powerups[pu].timer = 0; });
    
    obstacles = []; stars = []; powerupItems = []; particles = []; meteors = []; floatingTexts = [];
    mechanisms = []; boss = null; bossProjectiles = [];
    
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('levelCompleteScreen').style.display = 'none';
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('shopScreen').style.display = 'none';
    
    initBackground();
    
    // 立即生成一些初始障碍物和星星
    createObstacle();
    createStar();
    createStar();
    
    // 开始BGM
    setTimeout(() => startBGM(currentLevel), 100);
}

function startLevel(level) {
    if (!playerData.unlockedLevels.includes(level)) return;
    currentLevel = level;
    resetGame();
}

// ==================== 商店 ====================
function openShop() {
    gameState = 'shop';
    stopBGM();
    document.getElementById('shopScreen').style.display = 'flex';
    document.getElementById('shopStars').textContent = playerData.totalStars;
    updateShopUI();
}

function updateShopUI() {
    document.getElementById('shopStars').textContent = playerData.totalStars;
    const costs = { doubleJump: 100, shield: 150, dash: 200 };
    Object.keys(SKILLS).forEach(sk => {
        const btn = document.getElementById(`buy-${sk}`);
        if (btn) {
            if (player.skills[sk].unlocked) {
                btn.textContent = '✓ 已解锁';
                btn.disabled = true;
                btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            } else {
                btn.textContent = `${costs[sk]} ⭐ 解锁`;
                btn.disabled = playerData.totalStars < costs[sk];
                btn.style.background = playerData.totalStars >= costs[sk] ?
                    'linear-gradient(135deg, #e74c3c, #c0392b)' : '#444';
            }
        }
    });
}

// ==================== 成长系统界面 ====================
function openGrowth() {
    gameState = 'growth';
    stopBGM();
    // 隐藏主菜单，显示成长界面
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const gs = document.getElementById('growthScreen');
    gs.style.cssText = 'display:flex; flex-direction:column; justify-content:flex-start; align-items:center; overflow-y:auto; padding:10px; box-sizing:border-box;';
    updateGrowthUI();
}

function updateGrowthUI() {
    // 更新等级和经验
    document.getElementById('growthLevel').textContent = playerData.level;
    document.getElementById('growthExp').textContent = playerData.exp;
    document.getElementById('growthExpToNext').textContent = playerData.expToNext;
    document.getElementById('growthStatPoints').textContent = playerData.statPoints;
    
    // 更新经验条
    const expPercent = (playerData.exp / playerData.expToNext) * 100;
    document.getElementById('growthExpFill').style.width = expPercent + '%';
    
    // 更新各属性卡片
    document.querySelectorAll('.growth-card').forEach(card => {
        const statName = card.dataset.stat;
        const stat = STAT_UPGRADES[statName];
        const currentLevel = playerData.stats[statName];
        
        // 更新等级显示
        const levelSpan = card.querySelector('.stat-level');
        if (levelSpan) levelSpan.textContent = currentLevel;
        
        // 更新按钮状态
        const btn = card.querySelector('.upgrade-btn');
        if (btn) {
            const canUpgrade = playerData.statPoints >= stat.cost && currentLevel < stat.max;
            btn.disabled = !canUpgrade;
            
            if (currentLevel >= stat.max) {
                btn.textContent = '已满级';
                btn.disabled = true;
                card.classList.add('maxed');
            } else {
                btn.textContent = `升级 (${stat.cost}点)`;
            }
        }
    });
}

function buySkill(skillName) {
    const costs = { doubleJump: 100, shield: 150, dash: 200 };
    const cost = costs[skillName];
    if (playerData.totalStars >= cost && !player.skills[skillName].unlocked) {
        playerData.totalStars -= cost;
        player.skills[skillName].unlocked = true;
        playerData.unlockedSkills.push(skillName);
        playSound('powerup');
        updateShopUI();
    }
}

// ==================== 事件监听 ====================
document.addEventListener('keydown', e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    if (gameState === 'playing') {
        if (e.code === 'KeyZ') activateSkill('doubleJump');
        if (e.code === 'KeyX') activateSkill('shield');
        if (e.code === 'KeyC') activateSkill('dash');
        if (e.code === 'ArrowLeft') keys.left = true;
        if (e.code === 'ArrowRight') keys.right = true;
        if (e.code === 'Space' || e.code === 'ArrowUp') jump();
    }
    // 音乐/音效切换
    if (e.code === 'KeyM') toggleBGM();
    if (e.code === 'KeyN') toggleSFX();
});

document.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});

document.getElementById('startBtn')?.addEventListener('click', () => {
    document.getElementById('menuScreen').style.display = 'none';
    resetGame();
});

document.getElementById('shopBtn')?.addEventListener('click', openShop);
document.getElementById('closeShopBtn')?.addEventListener('click', () => {
    document.getElementById('shopScreen').style.display = 'none';
    gameState = 'menu';
});

// 成长系统
document.getElementById('growthBtn')?.addEventListener('click', openGrowth);
document.getElementById('closeGrowthBtn')?.addEventListener('click', () => {
    document.getElementById('growthScreen').style.display = 'none';
    document.getElementById('menuScreen').style.display = 'flex';
    gameState = 'menu';
});

document.querySelectorAll('.upgrade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const stat = btn.dataset.stat;
        upgradeStat(stat);
    });
});

document.getElementById('restartBtn')?.addEventListener('click', resetGame);
document.getElementById('menuBtn')?.addEventListener('click', () => {
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('menuScreen').style.display = 'flex';
    gameState = 'menu';
    stopBGM();
});

document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
    const levelOrder = ['forest', 'desert', 'ice', 'ocean', 'space'];
    const idx = levelOrder.indexOf(currentLevel);
    if (idx < levelOrder.length - 1) startLevel(levelOrder[idx + 1]);
});
document.getElementById('replayLevelBtn')?.addEventListener('click', resetGame);

// 关卡卡片点击事件
document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
        const level = card.dataset.level;
        if (playerData.unlockedLevels.includes(level)) {
            currentLevel = level;
            document.getElementById('menuScreen').style.display = 'none';
            resetGame();
        }
    });
});
document.querySelectorAll('.buy-skill-btn').forEach(btn => {
    btn.addEventListener('click', () => buySkill(btn.dataset.skill));
});

canvas.addEventListener('click', e => {
    if (gameState === 'playing') jump();
});
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (gameState === 'playing') jump();
});

// BGM/SFX 按钮
document.getElementById('bgmBtn')?.addEventListener('click', toggleBGM);
document.getElementById('sfxBtn')?.addEventListener('click', toggleSFX);

// ==================== 游戏循环 ====================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

loadGameData();
initBackground();
gameLoop();
