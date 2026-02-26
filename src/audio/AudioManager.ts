import { Howl, Howler } from 'howler';

// 1. Định nghĩa Interface cho cấu hình âm thanh
interface SoundConfig {
    src: string;
    loop?: boolean;
    volume?: number;
}

//Đường dẫn gốc 
const BASE_PATH = 'assets/audio/';

// Ánh xạ ID âm thanh và cấu hình chi tiết
const SOUND_MAP: Record<string, SoundConfig> = {

    // ---- SFX Chung ----
    'sfx-correct': { src: `${BASE_PATH}sfx/correct_answer.mp3`, volume: 1.0 },
    'sfx-correct_s2': { src: `${BASE_PATH}sfx/correct_color.mp3`, volume: 1.0 },
    'sfx-wrong': { src: `${BASE_PATH}sfx/wrong.mp3`, volume: 0.5 },
    'sfx-click': { src: `${BASE_PATH}sfx/click.mp3`, volume: 0.5 },
    'sfx-ting': { src: `${BASE_PATH}sfx/correct.mp3`, volume: 0.6 },

    // ---- Prompt Voice ----
    'voice-rotate': { src: `${BASE_PATH}prompt/rotate.mp3`, volume: 0.8 },
    'voice_intro_s2': { src: `${BASE_PATH}prompt/instruction_s2.mp3`, volume: 1.0 },
    'hint': { src: `${BASE_PATH}prompt/hint.mp3`, volume: 1.0 },

    // ---- Correct Answer Variations ----
    'complete': { src: `${BASE_PATH}sfx/complete.mp3`, volume: 1.0 },
    'fireworks': { src: `${BASE_PATH}sfx/fireworks.mp3`, volume: 1.0 },
    'applause': { src: `${BASE_PATH}sfx/applause.mp3`, volume: 1.0 },

    // ---- SpeakScene: Prompt & Score ----
    'intro-speak': { src: `${BASE_PATH}prompt/IntroSpeak.mp3`, volume: 1.0 },
    'intro-voice': { src: `${BASE_PATH}prompt/IntroVoice.mp3`, volume: 1.0 },
    'voice-speaking': { src: `${BASE_PATH}prompt/Speak.mp3`, volume: 1.0 },
    'begin-line2': { src: `${BASE_PATH}prompt/begin_line2.mp3`, volume: 1.0 },
    'begin-line3': { src: `${BASE_PATH}prompt/begin_line3.mp3`, volume: 1.0 },
    'begin-line4': { src: `${BASE_PATH}prompt/begin_line4.mp3`, volume: 1.0 },
    'wait-grading': { src: `${BASE_PATH}prompt/wait_grading.mp3`, volume: 1.0 },
    'score-4': { src: `${BASE_PATH}score/score_4.mp3`, volume: 1.0 },
    'score-5': { src: `${BASE_PATH}score/score_5.mp3`, volume: 1.0 },
    'score-6': { src: `${BASE_PATH}score/score_6.mp3`, volume: 1.0 },
    'score-7': { src: `${BASE_PATH}score/score_7.mp3`, volume: 1.0 },
    'score-8': { src: `${BASE_PATH}score/score_8.mp3`, volume: 1.0 },
    'score-9': { src: `${BASE_PATH}score/score_9.mp3`, volume: 1.0 },
    'score-10': { src: `${BASE_PATH}score/score_10.mp3`, volume: 1.0 },


};



class AudioManager {
    // Khai báo kiểu dữ liệu cho Map chứa các đối tượng Howl
    private sounds: Record<string, Howl> = {};
    private isLoaded: boolean = false;

    // Chỉ dùng html5 mode trên iOS/Safari (cần cho autoplay policy)
    private useHtml5: boolean = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'));

    constructor() {
        // Cấu hình quan trọng cho iOS
        Howler.autoUnlock = true;
        Howler.volume(1.0);
    }

    /**
     * Tải tất cả âm thanh
     * @returns {Promise<void>}
     */
    loadAll(): Promise<void> {

        if (this.isLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const keys = Object.keys(SOUND_MAP);
            let loadedCount = 0;
            const total = keys.length;

            if (total === 0) return resolve();

            keys.forEach((key) => {
                const config = SOUND_MAP[key];

                this.sounds[key] = new Howl({
                    src: [config.src],
                    loop: config.loop || false,
                    volume: config.volume || 1.0,
                    html5: this.useHtml5, // Chỉ dùng html5 trên iOS/Safari

                    onload: () => {
                        loadedCount++;
                        if (loadedCount === total) {
                            this.isLoaded = true;
                            resolve();
                        }
                    },
                    onloaderror: (id: number, error: unknown) => {
                        // Chúng ta vẫn có thể chuyển nó sang string để ghi log nếu muốn
                        const errorMessage =
                            error instanceof Error
                                ? error.message
                                : String(error);

                        console.error(
                            `[Howler Load Error] Key: ${key}, ID: ${id}, Msg: ${errorMessage}. Check file path: ${config.src}`
                        );

                        loadedCount++;
                        if (loadedCount === total) {
                            this.isLoaded = true;
                            resolve();
                        }
                    },
                });
            });
        });
    }

    /**
     * Phát một âm thanh
     * @param {string} id - ID âm thanh
     * @returns {number | undefined} - Sound ID của Howler
     */
    play(id: string): number | undefined {
        if (!this.isLoaded || !this.sounds[id]) {
            console.warn(
                `[AudioManager] Sound ID not found or not loaded: ${id}`
            );
            return;
        }
        return this.sounds[id].play();
    }

    /**
     * Dừng một âm thanh
     * @param {string} id - ID âm thanh
     */
    stop(id: string): void {
        if (!this.isLoaded || !this.sounds[id]) return;
        this.sounds[id].stop();
    }

    stopSound(id: string): void {
        if (this.sounds[id]) {
            this.sounds[id].stop();
        }
    }

    stopAll(): void {
        Howler.stop();
    }


    // Dừng TẤT CẢ các Prompt và Feedback 

    stopAllVoicePrompts(): void {
        const voiceKeys = Object.keys(SOUND_MAP).filter(
            (key) =>
                key.startsWith('prompt_') || key.startsWith('correct_answer_')
        );

        voiceKeys.forEach((key) => {
            this.stopSound(key);
        });

        // Hoặc dùng: Howler.stop(); để dừng TẤT CẢ âm thanh (thận trọng khi dùng)
    }

    // Kiểm tra nếu audio đã được unlock
    get isUnlocked(): boolean {
        return Howler.ctx && Howler.ctx.state === 'running';
    }

    unlockAudio(): void {
        if (!Howler.usingWebAudio) return;

        // Tạo một âm thanh dummy và play/stop ngay lập tức
        const dummySound = new Howl({
            src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA=='], // 1-frame silent WAV
            volume: 0,
            html5: true
        });
        dummySound.once('play', () => {
            dummySound.stop();
            console.log('[Howler] Audio context unlocked manually.');
        });

        // Chỉ play nếu context đang ở trạng thái suspended/locked
        if (Howler.ctx && Howler.ctx.state !== 'running') {
            dummySound.play();
        }
    }

    public getDuration(key: string): number {
        const sound = this.sounds[key];

        if (sound) {
            return sound.duration();
        }

        console.warn(`[AudioManager] Không tìm thấy duration cho key: "${key}"`);
        return 0;
    }

    /**
     * Đảm bảo AudioContext đang chạy (cần cho iOS sau khi ghi âm)
     */
    ensureContextRunning(): void {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
                console.log('[AudioManager] AudioContext resumed');
            });
        }
    }

    /**
     * Unlock audio context bất đồng bộ, trả về Promise
     */
    unlockAudioAsync(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!Howler.ctx || Howler.ctx.state === 'running') {
                resolve();
                return;
            }
            Howler.ctx.resume().then(() => {
                console.log('[AudioManager] AudioContext unlocked async');
                resolve();
            }).catch(() => resolve());
        });
    }

    /**
     * Khôi phục audio sau khi ghi âm (Mobile workaround)
     * Mobile browsers duck audio khi mic hoạt động, cần thời gian để phục hồi.
     * Method này resume context + phát silent sound để kick audio pipeline.
     * @returns Promise resolve sau khi audio đã sẵn sàng phát lại bình thường
     */
    async restoreAudioAfterRecording(): Promise<void> {
        this.ensureContextRunning();
        await this.unlockAudioAsync();

        // Phát silent sound để warm-up audio pipeline sau khi mic tắt
        return this.warmUpAudio();
    }

    /**
     * Phát 1 âm thanh câm ngắn để "warm-up" audio pipeline
     * Giúp browser re-route audio output về full volume sau mic ducking
     */
    private warmUpAudio(): Promise<void> {
        return new Promise<void>((resolve) => {
            try {
                const silent = new Howl({
                    src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA=='],
                    volume: 0.01,
                    html5: false,
                });
                silent.once('end', () => {
                    silent.unload();
                    resolve();
                });
                // Fallback nếu sound không play được
                setTimeout(() => resolve(), 200);
                silent.play();
            } catch {
                resolve();
            }
        });
    }

    /**
     * Tạm dừng tất cả âm thanh đang phát
     */
    private pausedSoundIds: Set<string> = new Set();

    pauseAll(): void {
        this.pausedSoundIds.clear();
        Object.entries(this.sounds).forEach(([key, sound]) => {
            if (sound.playing()) {
                sound.pause();
                this.pausedSoundIds.add(key);
            }
        });
    }

    /**
     * Tiếp tục phát tất cả âm thanh đã tạm dừng (chỉ những sound đã pause)
     */
    resumeAll(): void {
        // Đảm bảo AudioContext đang chạy trước khi resume
        this.ensureContextRunning();

        this.pausedSoundIds.forEach(key => {
            const sound = this.sounds[key];
            if (sound) {
                sound.play();
            }
        });
        this.pausedSoundIds.clear();
    }

    /**
     * Lắng nghe sự kiện kết thúc phát (một lần) cho một sound ID
     */
    onceEnd(id: string, callback: () => void): void {
        if (!this.sounds[id]) return;
        this.sounds[id].once('end', callback);
    }
}

// Xuất phiên bản duy nhất (Singleton)
export default new AudioManager();