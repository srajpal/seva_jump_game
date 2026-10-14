import Foundation

struct Platform: Identifiable {
    let id: Int
    let x: Double
    let y: Double
    var collected = false
    var brokenAge: Double? = nil
    enum Kind { case solid, smallSolid, breakable }
    var kind: Kind = .breakable
    var isBreakable: Bool { kind == .breakable }
    var width: Double { kind == .solid ? 68 : 42 }
    var hasParshad: Bool { id > 0 && id % 3 == 1 }
    init(id: Int, x: Double, y: Double, kind: Kind? = nil) {
        self.id = id; self.x = x; self.y = y
        self.kind = kind ?? (id < 5 ? .solid : .breakable)
    }
}

struct WatchBird: Identifiable {
    let id: Int
    var x: Double
    let y: Double
    let speed: Double
}

/// Watch-only physics. Coordinates use a fixed 200 × 250 world, y increasing upward.
final class WatchGame {
    enum Phase { case home, playing, paused, finished }
    enum FeedbackEvent { case landing, breaking, rescue, finish }
    var events: [FeedbackEvent] = []
    var newRecord = false
    private var startingBest = 0
    var rescueAvailable = true
    var protection = 0.0
    var birds: [WatchBird] = []
    private var birdTimer = 0.0
    private var nextBirdID = 0
    var phase: Phase = .home
    var x = 100.0
    var targetX = 100.0
    var y = 28.0
    var velocity = 270.0
    var camera = 0.0
    var height = 0.0
    var bowls = 0
    var best: Int
    var platforms: [Platform] = []
    private(set) var lastLandedID = 0
    var nextPlatform: Platform? { platforms.first { $0.id > lastLandedID && $0.brokenAge == nil } }
    private var nextID = 0
    private var seed: UInt64 = 1
    private let defaults: UserDefaults
    var score: Int { Int(height / 4) }
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        best = defaults.integer(forKey: "watchPrototype.best")
    }
    func start(seed: UInt64 = UInt64.random(in: 1...UInt64.max)) {
        startingBest = best; newRecord = false; events = []; rescueAvailable = true; protection = 0; birds = []; birdTimer = 0; nextBirdID = 0
        self.seed = max(1, seed)
        x = 100; targetX = 100; y = 28; velocity = 270
        camera = 0; height = 0; bowls = 0; nextID = 0; lastLandedID = 0; platforms = []
        appendPlatform(x: 100, y: 16)
        while platforms.last!.y < 350 { generatePlatform() }
        phase = .playing
    }
    func steer(_ fraction: Double) { targetX = min(188, max(12, fraction * 200)) }
    /// Touch follows the finger immediately; Crown retains paced steering.
    func drag(_ fraction: Double) {
        guard phase == .playing else { return }
        steer(fraction); x = targetX
    }
    func pause() { if phase == .playing { saveBest(); phase = .paused } }
    func resume() { if phase == .paused { phase = .playing } }
    func home() { pause(); phase = .home }
    func tick(_ elapsed: Double) {
        guard phase == .playing else { return }
        events = []
        let dt = min(1.0 / 30, max(0, elapsed))
        x += min(180 * dt, max(-180 * dt, targetX - x))
        for i in platforms.indices {
            if let age = platforms[i].brokenAge { platforms[i].brokenAge = age + dt }
        }
        platforms.removeAll { ($0.brokenAge ?? -1) >= 0.45 }
        protection = max(0, protection - dt)
        birdTimer += dt
        if score >= 35 && birdTimer >= 7 && birds.isEmpty {
            birdTimer = 0
            let speed = nextBirdID % 2 == 0 ? 32.0 : -32.0
            birds.append(WatchBird(id: nextBirdID, x: speed > 0 ? -20 : 220, y: camera + 110, speed: speed))
            nextBirdID += 1
        }
        for i in birds.indices { birds[i].x += birds[i].speed * dt }
        birds.removeAll { $0.x < -35 || $0.x > 235 || $0.y < camera - 30 }
        let oldY = y
        velocity -= 700 * dt
        y += velocity * dt
        if velocity < 0 {
            for i in platforms.indices.reversed() {
                let p = platforms[i]
                if p.brokenAge == nil && oldY >= p.y && y <= p.y && abs(x - p.x) < p.width / 2 + 5 {
                    lastLandedID = p.id
                    y = p.y; velocity = 270
                    if p.isBreakable { platforms[i].brokenAge = 0; events.append(.breaking) }
                    else { events.append(.landing) }
                    if p.id > 0 && !p.collected {
                        platforms[i].collected = true
                        if p.hasParshad { bowls += 1 }
                    }
                    break
                }
            }
        }
        height = max(height, y - 28)
        camera = max(camera, y - 90)
        while platforms.last!.y < camera + 320 { generatePlatform() }
        platforms.removeAll { $0.y < camera - 70 }
        if protection == 0 && birds.contains(where: { abs($0.x - x) < 18 && abs($0.y - (y + 14)) < 16 }) {
            handleHazard()
        }
        if phase == .playing && y < camera - 28 { handleHazard() }
    }
    private func handleHazard() {
        guard rescueAvailable else { finish(); return }
        events.append(.rescue)
        rescueAvailable = false; protection = 2.5; birds = []
        let safe = platforms.filter { $0.brokenAge == nil }.min { abs($0.y - (camera + 55)) < abs($1.y - (camera + 55)) }!
        lastLandedID = safe.id
        x = safe.x; targetX = x; y = safe.y; velocity = 270
    }
    private func finish() {
        phase = .finished
        newRecord = score > startingBest
        events.append(.finish)
        saveBest()
    }
    private func saveBest() {
        if score > best { best = score; defaults.set(best, forKey: "watchPrototype.best") }
    }
    private func appendPlatform(x: Double, y: Double) {
        let kind: Platform.Kind = nextID < 5 || nextID % 5 == 0 ? .solid : nextID % 5 == 2 ? .smallSolid : .breakable
        platforms.append(Platform(id: nextID, x: x, y: y, kind: kind)); nextID += 1
    }
    private func generatePlatform() {
        seed = seed &* 6364136223846793005 &+ 1442695040888963407
        let last = platforms.last!
        let intro = nextID < 5
        let early = nextID < 12
        let magnitude = intro ? Double((seed >> 32) % 21) : early ? 28 + Double((seed >> 32) % 13) : 36 + Double((seed >> 32) % 17)
        var direction = (seed >> 40) & 1 == 0 ? 1.0 : -1.0
        if last.x + direction * magnitude > 172 || last.x + direction * magnitude < 28 { direction = -direction }
        appendPlatform(x: last.x + direction * magnitude, y: last.y + (intro ? 38 : early ? 40 : 42))
    }
}

/// Keeps physics at 30 Hz despite ordinary timer jitter. Large stalls drop
/// excess time rather than teleporting through several jumps on recovery.
struct WatchFrameClock {
    static let step = 1.0 / 30
    private var last: Double?
    private var remainder = 0.0
    mutating func reset(at time: Double) { last = time; remainder = 0 }
    mutating func steps(at time: Double) -> Int {
        guard let previous = last else { reset(at: time); return 0 }
        last = time
        remainder += min(0.1, max(0, time - previous))
        let count = min(3, Int((remainder + 1e-9) / Self.step))
        remainder = max(0, remainder - Double(count) * Self.step)
        return count
    }
}
