import AVFoundation
import WatchKit

/// Short local effects; no streaming, recording or background playback.
final class WatchFeedback {
    private var players: [String: AVAudioPlayer] = [:]
    private var active = false
    private var music: AVAudioPlayer?
    var musicIsPlaying: Bool { music?.isPlaying ?? false }
    func startMusic() -> Bool {
        do {
            try activate()
            if music == nil {
                guard let url = Bundle.main.url(forResource: "watch-theme", withExtension: "wav") else { return false }
                music = try AVAudioPlayer(contentsOf: url)
                music?.numberOfLoops = -1
                music?.volume = 0.3
                music?.prepareToPlay()
            }
            if music?.isPlaying == true { return true }
            return music?.play() ?? false
        } catch { return false }
    }
    func stopMusic() { music?.pause() }
    func stopEffects() { players.values.forEach { $0.stop() } }
    private func activate() throws {
        if !active {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try session.setActive(true)
            active = true
        }
    }
    func play(_ event: WatchGame.FeedbackEvent, sound: Bool, haptics: Bool) -> Bool {
        if haptics {
            let type: WKHapticType = event == .rescue ? .notification : event == .finish ? .success : .click
            WKInterfaceDevice.current().play(type)
        }
        guard sound else { return true }
        let name: String
        switch event {
        case .landing: name = "landing"
        case .breaking: name = "crumble"
        case .rescue: name = "rescue"
        case .finish: name = "finish"
        }
        do {
            try activate()
            if players[name] == nil {
                guard let url = Bundle.main.url(forResource: name, withExtension: "wav") else { return false }
                players[name] = try AVAudioPlayer(contentsOf: url)
                players[name]?.volume = 0.35
                players[name]?.prepareToPlay()
            }
            players[name]?.currentTime = 0
            return players[name]?.play() ?? false
        } catch { return false }
    }
    func stop() {
        stopEffects(); stopMusic()
        if active { try? AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation]); active = false }
    }
}
