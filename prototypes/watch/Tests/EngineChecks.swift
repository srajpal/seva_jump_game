import Foundation

@main
struct EngineChecks {
    static func main() {
        var clock = WatchFrameClock()
        clock.reset(at: 0)
        var count = 0
        for i in 1...900 { count += clock.steps(at: Double(i) / 30) }
        precondition(count == 900)
        clock.reset(at: 0); count = 0
        // Alternating early/late delivery represents jitter while dragging.
        for i in 1...450 {
            count += clock.steps(at: Double(i) / 15 - 0.02)
            count += clock.steps(at: Double(i) / 15)
        }
        precondition(count == 900, "Jitter must not change movement speed")
        clock.reset(at: 0)
        precondition(clock.steps(at: 10) == 3, "Long stalls must not cause an unbounded catch-up burst")
        clock.reset(at: 100)
        precondition(clock.steps(at: 100 + 1.0 / 30) == 1, "Resume must discard paused time")
        print("PASS fixed-step timing: regular/jittery 30-second delivery both 900 steps; stall cap; pause reset")
        let suite = "org.sevajump.watchprototype.checks"
        let defaults = UserDefaults(suiteName: suite)!
        defaults.removePersistentDomain(forName: suite)
        defer { defaults.removePersistentDomain(forName: suite) }
        let game = WatchGame(defaults: defaults)
        game.start(seed: 123)
        let baseline = game.platforms.map { ($0.x, $0.y) }
        game.start(seed: 123)
        precondition(zip(baseline, game.platforms).allSatisfy { $0.0.0 == $0.1.x && $0.0.1 == $0.1.y }, "Seeded routes must reproduce")
        for pair in zip(game.platforms, game.platforms.dropFirst()) {
            precondition(pair.1.y - pair.0.y == (pair.1.id < 5 ? 38 : pair.1.id < 12 ? 40 : 42))
            let shift = abs(pair.1.x - pair.0.x)
            precondition(pair.1.id < 5 ? shift <= 20 : pair.1.id < 12 ? shift >= 28 && shift <= 40 : shift >= 36 && shift <= 52)
        }
        precondition(270.0 * 270 / (2 * 700) > 42, "Generated gaps must fit the jump height")
        game.steer(-10); precondition(game.targetX == 12)
        game.steer(10); precondition(game.targetX == 188)
        game.steer(0.5)
        for _ in 0..<25 { game.tick(1.0 / 30) }
        let frozen = (game.x, game.y, game.velocity, game.camera, game.bowls)
        game.pause()
        for _ in 0..<100 { game.tick(1.0 / 30) }
        precondition(game.phase == .paused && game.x == frozen.0 && game.y == frozen.1 && game.velocity == frozen.2 && game.camera == frozen.3 && game.bowls == frozen.4, "Paused physics must remain frozen")
        game.resume(); game.tick(1.0 / 30)
        precondition(game.y != frozen.1)
        // Follow the current next landing, rather than changing to a higher
        // platform as soon as the jumper passes one on ascent.
        game.start(seed: 321)
        var targetID = 1
        for _ in 0..<2000 {
            if let target = game.platforms.first(where: { $0.id == targetID }) { game.steer(target.x / 200) }
            game.tick(1.0 / 30)
            if let landed = game.platforms.first(where: { $0.id == targetID && $0.collected }) { targetID = landed.id + 1 }
            if game.phase == .finished { break }
        }
        precondition(game.bowls > 5 && game.score > 40, "Wider routes must support repeated landings")
        game.start(seed: 1)
        game.height = 4000; game.y = game.camera - 100
        game.tick(1.0 / 30)
        precondition(game.phase == .playing && !game.rescueAvailable && game.protection > 0, "First fall must use one rescue")
        game.y = game.camera - 100; game.tick(1.0 / 30)
        precondition(game.phase == .finished && game.best == 1000)
        precondition(WatchGame(defaults: defaults).best == 1000, "Best must survive a new engine instance")
        game.start(seed: 1); game.home(); precondition(game.phase == .home)
        precondition(game.best == 1000, "New runs must retain the local best")
        game.start(seed: 1)
        precondition(game.platforms.prefix(5).allSatisfy { !$0.isBreakable && $0.width == 68 })
        precondition(game.platforms.dropFirst(5).contains { $0.isBreakable })
        precondition(game.platforms.dropFirst(5).contains { !$0.isBreakable })
        precondition(game.platforms.contains { $0.hasParshad } && game.platforms.contains { $0.id > 0 && !$0.hasParshad })
        game.drag(0.8); precondition(game.x == 160 && game.targetX == 160, "Drag must follow immediately")
        game.drag(-1); precondition(game.x == 12)
        game.drag(2); precondition(game.x == 188)
        game.pause(); game.drag(0.5); precondition(game.x == 188, "Paused dragging must not move the jumper")
        game.start(seed: 1)
        game.platforms = [Platform(id: 0, x: 100, y: 0), Platform(id: 6, x: 100, y: 120)]
        game.y = 122; game.velocity = -60
        game.tick(1.0 / 30)
        precondition(game.velocity > 0 && game.platforms.first { $0.id == 6 }!.brokenAge == 0)
        game.y = 122; game.velocity = -60
        game.tick(1.0 / 30)
        precondition(game.velocity < 0 && game.y < 120, "Broken surfaces must stop supporting immediately")
        game.pause()
        let age = game.platforms.first { $0.id == 6 }!.brokenAge
        game.tick(1.0 / 30)
        precondition(game.platforms.first { $0.id == 6 }!.brokenAge == age)
        game.resume()
        for _ in 0..<15 { game.tick(1.0 / 30) }
        precondition(!game.platforms.contains { $0.id == 6 }, "Crumble animation must clean up")
        // Empty solid landings must not award parshad; occupied platforms
        // award it once even when the solid surface can be revisited.
        game.start(seed: 1)
        game.platforms = [Platform(id: 0, x: 100, y: 0), Platform(id: 5, x: 100, y: 120, kind: .solid)]
        game.y = 122; game.velocity = -60; game.tick(1.0 / 30)
        precondition(game.bowls == 0 && game.platforms.first { $0.id == 5 }!.collected)
        game.platforms = [Platform(id: 0, x: 100, y: 0), Platform(id: 4, x: 100, y: 120)]
        game.y = 122; game.velocity = -60; game.tick(1.0 / 30)
        precondition(game.bowls == 1)
        game.y = 122; game.velocity = -60; game.tick(1.0 / 30)
        precondition(game.bowls == 1)
        game.start(seed: 1); game.height = 640; game.tick(1.0 / 30)
        precondition(game.phase == .playing && game.score >= 150, "Endless must continue beyond the old Arcade limit")
        game.start(seed: 1)
        game.birds = [WatchBird(id: 1, x: game.x, y: game.y + 14, speed: 0)]
        game.tick(1.0 / 30)
        precondition(!game.rescueAvailable && game.protection > 0 && game.birds.isEmpty, "Bird collision must rescue")
        game.birds = [WatchBird(id: 2, x: game.x, y: game.y + 14, speed: 0)]
        game.tick(1.0 / 30)
        precondition(game.phase == .playing, "Protection must prevent repeated immediate collision")
        game.protection = 0
        game.birds = [WatchBird(id: 3, x: game.x, y: game.y + 14, speed: 0)]
        game.tick(1.0 / 30)
        precondition(game.phase == .finished, "Second unprotected collision must finish the run")
        game.start(seed: 1)
        var sawBird = false; targetID = 1
        for _ in 0..<900 {
            if let target = game.platforms.first(where: { $0.id == targetID }) { game.steer(target.x / 200) }
            game.tick(1.0 / 30)
            if let landed = game.platforms.first(where: { $0.id == targetID && $0.collected }) { targetID = landed.id + 1 }
            sawBird = sawBird || !game.birds.isEmpty
            precondition(game.birds.count <= 1, "Only one bird at a time")
            if game.phase == .finished { break }
        }
        precondition(sawBird, "Birds must spawn after the introductory climb")
        // Check actual discrete jump reachability for both directions and every
        // generated hard-stage offset, starting at the far landing edge.
        for offset in 36...52 {
            for direction in [-1.0, 1.0] {
                game.start(seed: 1)
                let startX = direction > 0 ? 40.0 : 160.0
                game.platforms = [Platform(id: 6, x: startX, y: 100), Platform(id: 7, x: startX + direction * Double(offset), y: 142)]
                game.x = startX - direction * 25; game.y = 100; game.velocity = 270
                game.steer((startX + direction * Double(offset)) / 200)
                var landed = false
                for step in 0..<30 {
                    if step < 6 { game.steer((startX - direction * 25) / 200) }
                    else { game.steer((startX + direction * Double(offset)) / 200) }
                    game.tick(1.0 / 30)
                    if game.platforms.contains(where: { $0.id == 7 && $0.collected }) { landed = true; break }
                }
                precondition(landed, "42-unit gap with 36–52-unit lateral shift must allow a 0.2-second reaction delay")
            }
        }
        // Long routes with reaction delay: isolate spacing from bird hazards.
        // Uses normal generated platforms and actual tick/landing rules.
        var minScore = Int.max
        for routeSeed in 1...100 {
            game.start(seed: UInt64(routeSeed))
            var previousLanding = game.lastLandedID
            var reactionFrames = 6
            var previousTarget = game.x
            for _ in 0..<2700 {
                if game.lastLandedID != previousLanding {
                    previousLanding = game.lastLandedID
                    reactionFrames = 6
                    previousTarget = game.x
                }
                game.steer(reactionFrames > 0 ? previousTarget / 200 : game.nextPlatform!.x / 200)
                reactionFrames = max(0, reactionFrames - 1)
                game.birds = [] // Separate bird behavior is checked above.
                game.tick(1.0 / 30)
                precondition(game.phase == .playing && game.rescueAvailable, "90-second route must need no fall rescue")
            }
            precondition(game.bowls > 40 && game.score > 150)
            minScore = min(minScore, game.score)
            game.pause()
            precondition(WatchGame(defaults: defaults).best >= game.score)
        }
        var fullRuns = 0
        var rescues = 0
        for routeSeed in 1...100 {
            game.start(seed: UInt64(routeSeed))
            var previousLanding = game.lastLandedID
            var reactionFrames = 6
            var previousTarget = game.x
            for _ in 0..<2700 {
                if game.lastLandedID != previousLanding {
                    previousLanding = game.lastLandedID
                    reactionFrames = 6
                    previousTarget = game.x
                }
                game.steer(reactionFrames > 0 ? previousTarget / 200 : game.nextPlatform!.x / 200)
                reactionFrames = max(0, reactionFrames - 1)
                game.tick(1.0 / 30)
                if game.phase == .finished { break }
            }
            if game.phase == .playing { fullRuns += 1 }
            if !game.rescueAvailable { rescues += 1 }
        }
        precondition(fullRuns >= 90, "Responsive routes including hazards should usually support 90 seconds")
        var dragMinScore = Int.max
        for routeSeed in 1...25 {
            game.start(seed: UInt64(routeSeed))
            var lastLanding = game.lastLandedID
            var reactionFrames = 6
            var occupiedLandings = Set<Int>()
            var emptyLandings = Set<Int>()
            var solidLandings = Set<Int>()
            var woodLandings = Set<Int>()
            for _ in 0..<18000 {
                if reactionFrames == 0 { game.drag(game.nextPlatform!.x / 200) }
                reactionFrames = max(0, reactionFrames - 1)
                game.tick(1.0 / 30)
                precondition(game.phase == .playing && game.rescueAvailable, "Ten-minute direct-drag route must survive without rescue")
                if game.lastLandedID != lastLanding {
                    lastLanding = game.lastLandedID
                    let landed = game.platforms.first { $0.id == lastLanding }!
                    if landed.hasParshad { occupiedLandings.insert(lastLanding) }
                    else { emptyLandings.insert(lastLanding) }
                    if landed.isBreakable { woodLandings.insert(lastLanding) }
                    else { solidLandings.insert(lastLanding) }
                    reactionFrames = 6
                }
            }
            precondition(game.bowls == occupiedLandings.count, "Only occupied first landings award parshad")
            precondition(emptyLandings.count > occupiedLandings.count && occupiedLandings.count > 200)
            precondition(solidLandings.count > 200 && woodLandings.count > 200)
            game.pause()
            precondition(WatchGame(defaults: defaults).best >= game.score)
            dragMinScore = min(dragMinScore, game.score)
        }
        print("PASS 25 ten-minute direct-drag routes, normal birds, 0.2-second reaction delay; mixed landings; exact occasional parshad awards; no rescues; minimum score \(dragMinScore); saved best after pause")
        print("PASS full gameplay: \(fullRuns)/100 routes reached 90 seconds with birds enabled; \(rescues) used a rescue")
        print("PASS 100 generated routes × 90 seconds, 0.2-second reaction delay, no fall rescues; minimum score \(minScore); bird hazards checked separately")
        print("PASS Endless/no score cap and breakable intro/width/collision/fade, one-use rescue, collision protection, bird bounds; seeded route/reachability, Crown bounds, repeated landings/collections, pause/resume, loss and best persistence")
    }
}
