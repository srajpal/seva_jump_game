import SwiftUI
import ImageIO

@main
struct SevaWatchPrototypeApp: App {
    var body: some Scene { WindowGroup { WatchGameView() } }
}

struct WatchGameView: View {
    @State private var game = WatchGame()
    @State private var crown = 0.5
    @State private var frame = 0
    @State private var clock = WatchFrameClock()
    @State private var showSettings = false
    @State private var sampleStatus = ""
    @State private var feedback = WatchFeedback()
    @AppStorage("watchPrototype.music") private var music = true
    @AppStorage("watchPrototype.sound") private var sound = true
    @AppStorage("watchPrototype.haptics") private var haptics = true
    @FocusState private var crownFocused: Bool
    @Environment(\.scenePhase) private var scenePhase
    private let timer = Timer.publish(every: 1.0 / 30, on: .main, in: .common).autoconnect()
    private let art = WatchArt()

    var body: some View {
        let _ = frame
        return GeometryReader { geometry in
            ZStack {
                Color.black
                if let background = art.background {
                    Image(decorative: background, scale: 1).resizable().scaledToFill()
                        .frame(width: geometry.size.width, height: geometry.size.height).clipped()
                }
                if game.phase == .playing || game.phase == .paused {
                    playfield
                    VStack {
                        HStack {
                            Text("\(game.score)").accessibilityIdentifier("watch-score")
                                .accessibilityLabel("Score")
                                .accessibilityValue("\(game.score), music \(feedback.musicIsPlaying ? "playing" : "off")").font(.system(.body, design: .rounded).bold())
                                .padding(.horizontal, 7).padding(.vertical, 3)
                                .background(.black.opacity(0.65), in: Capsule())
                            Spacer()
                            Button { game.pause(); clock.reset(at: ProcessInfo.processInfo.systemUptime); feedback.stop(); frame += 1 } label: { Image(systemName: "pause.fill") }
                                .buttonStyle(.plain).accessibilityLabel("Pause game")
                                .frame(width: 38, height: 38).background(.black.opacity(0.65), in: Circle())
                        }
                        Spacer()
                        Text("Parshad \(game.bowls) · Save \(game.rescueAvailable ? "✓" : "—")").font(.caption2.bold())
                            .padding(.horizontal, 6).padding(.vertical, 2).background(.black.opacity(0.65), in: Capsule())
                    }.padding(.horizontal, 12).padding(.top, 36).padding(.bottom, 6)
                    if game.phase == .paused { pauseMenu }
                } else {
                    menu
                }
            }
            .foregroundStyle(.white)
            .frame(width: geometry.size.width, height: geometry.size.height)
            .clipped()
            .contentShape(Rectangle())
            .focusable()
            .focused($crownFocused)
            .digitalCrownRotation($crown, from: 0, through: 1, by: 0.02, sensitivity: .low, isContinuous: false, isHapticFeedbackEnabled: false)
            .onChange(of: crown) { _, value in game.steer(value) }
            .gesture(DragGesture(minimumDistance: 2).onChanged { value in
                guard game.phase == .playing else { return }
                crown = min(1, max(0, value.location.x / geometry.size.width))
                game.drag(crown)
                frame += 1
            })
        }
        .ignoresSafeArea()
        .onReceive(timer) { _ in
            if showSettings { frame += 1 }
            if game.phase == .playing {
                let steps = clock.steps(at: ProcessInfo.processInfo.systemUptime)
                for _ in 0..<steps {
                    let hadRescue = game.rescueAvailable
                    game.tick(WatchFrameClock.step)
                    if hadRescue && !game.rescueAvailable { crown = game.x / 200 }
                    for event in game.events { _ = feedback.play(event, sound: sound, haptics: haptics) }
                    if game.phase == .finished { feedback.stopMusic(); break }
                    frame += 1
                }
            } else {
                clock.reset(at: ProcessInfo.processInfo.systemUptime)
            }
        }
        .onChange(of: scenePhase) { _, phase in if phase != .active { game.pause(); clock.reset(at: ProcessInfo.processInfo.systemUptime); feedback.stop(); frame += 1 } }
        .onAppear { crownFocused = true }
        .sheet(isPresented: $showSettings, onDismiss: { feedback.stop(); crownFocused = true }) {
            ScrollView {
                VStack(spacing: 6) {
                    Toggle("Music", isOn: $music).onChange(of: music) { _, enabled in if !enabled { feedback.stopMusic() } }
                    Toggle("Sound", isOn: $sound).onChange(of: sound) { _, enabled in if !enabled { feedback.stopEffects() } }
                    Toggle("Haptics", isOn: $haptics)
                    Button("Preview music") { sampleStatus = feedback.startMusic() ? "Music started" : "Music unavailable" }
                    Button("Test sound") { sampleStatus = feedback.play(.landing, sound: true, haptics: haptics) ? "Sample started" : "Sound unavailable" }
                    if !sampleStatus.isEmpty { Text(sampleStatus).font(.caption2).accessibilityValue(feedback.musicIsPlaying ? "Music playing" : "Music off") }
                    Button("Done") { feedback.stop(); showSettings = false; crownFocused = true }
                }.padding(.horizontal, 6)
            }
        }
    }
    private var playfield: some View {
        let _ = frame
        return Canvas { context, size in
            context.clip(to: Path(CGRect(x: 0, y: 70, width: size.width, height: max(1, size.height - 88))))
            let sx = size.width / 200, sy = (size.height - 70) / 160
            for platform in game.platforms {
                let age = platform.brokenAge ?? 0
                let screenY = size.height - 18 - (platform.y - game.camera) * sy + age * 80
                var platformContext = context
                platformContext.opacity = max(0, 1 - age / 0.45)
                if let image = platform.isBreakable ? art.breakable : art.platform {
                    platformContext.draw(Image(decorative: image, scale: 1), in: CGRect(x: (platform.x - platform.width / 2) * sx, y: screenY - 4, width: platform.width * sx, height: 16 * sy))
                }
                if platform.hasParshad && !platform.collected, let bowl = art.bowl {
                    context.draw(Image(decorative: bowl, scale: 1), in: CGRect(x: platform.x * sx - 9, y: screenY - 22, width: 18, height: 18))
                }
            }
            for bird in game.birds {
                if !art.birds.isEmpty {
                    var birdContext = context
                    birdContext.translateBy(x: bird.x * sx, y: size.height - 18 - (bird.y - game.camera) * sy)
                    birdContext.scaleBy(x: bird.speed < 0 ? -1 : 1, y: 1)
                    birdContext.draw(Image(decorative: art.birds[(frame / 3) % art.birds.count], scale: 1), in: CGRect(x: -15, y: -12, width: 30, height: 24))
                }
            }
            if game.protection > 0 {
                let rect = CGRect(x: CGFloat(game.x) * sx - 20, y: size.height - 18 - CGFloat(game.y - game.camera) * sy - 43, width: 40, height: 46)
                context.stroke(Path(ellipseIn: rect), with: .color(.yellow), lineWidth: 2)
            }
            if let player = art.player {
                let h = 39.0, w = h * 360 / 545
                context.draw(Image(decorative: player, scale: 1), in: CGRect(x: game.x * sx - w / 2, y: size.height - 18 - (game.y - game.camera) * sy - h, width: w, height: h))
            }
        }
        .accessibilityElement()
        .accessibilityIdentifier("watch-playfield")
         .accessibilityValue("Horizontal position \(Int(game.x / 2)) percent; next platform \(Int((game.nextPlatform?.x ?? game.x) / 2)) percent")
        .accessibilityLabel("Jumping play area. Turn the Digital Crown or drag to steer.")
    }
    private func start() {
        feedback.stop(); crown = 0.5; game.start(); clock.reset(at: ProcessInfo.processInfo.systemUptime); if music { _ = feedback.startMusic() }; crownFocused = true; frame += 1
    }
    private var menu: some View {
        VStack(spacing: 5) {
            if let logo = art.logo { Image(decorative: logo, scale: 1).resizable().scaledToFit().frame(height: 38) }
            if game.phase == .finished {
                Text(game.newRecord ? "New high score!" : "Safe landing").font(.headline)
                Text("Score \(game.score) · Parshad \(game.bowls)").font(.caption2)
                Button("Try again") { start() }.tint(.teal)
                Button("Main screen") { game.home(); frame += 1 }
            } else {
                Text("Crown or drag · One rescue").font(.system(size: 10))
                Button("Play Endless") { start() }
                    .buttonStyle(.plain).font(.headline).frame(maxWidth: .infinity).frame(height: 42)
                    .background(Color(red: 0.03, green: 0.47, blue: 0.43), in: Capsule())
                Text("Solid + crumbling platforms").font(.system(size: 10))
            }
            Button("Sound & feel") { sampleStatus = ""; showSettings = true }.buttonStyle(.plain).font(.caption)
            Text("High score \(game.best)").font(.system(size: 10))
        }
        .padding(.horizontal, 10).padding(.top, 24).padding(.bottom, 6)
        .background(.black.opacity(0.28), in: RoundedRectangle(cornerRadius: 18))
    }
    private var pauseMenu: some View {
        VStack(spacing: 3) {
            Text("Take a breath").font(.headline)
            Button("Resume") { game.resume(); clock.reset(at: ProcessInfo.processInfo.systemUptime); if music { _ = feedback.startMusic() }; crownFocused = true; frame += 1 }.tint(.teal)
            Button("Sound & feel") { sampleStatus = ""; showSettings = true }.buttonStyle(.plain).font(.caption).frame(height: 28)
            Button("Main screen") { game.home(); frame += 1 }
        }.padding(10).background(.black.opacity(0.88), in: RoundedRectangle(cornerRadius: 18)).padding(.top, 18)
    }
}

private struct WatchArt {
    let background = Self.load("gurdwara-sunset-pixel-v1")
    let logo = Self.load("seva-jump-logo")
    let player: CGImage? = Self.load("player-girl-poses-v2")?.cropping(to: CGRect(x: 80, y: 0, width: 360, height: 545))
    let breakable = Self.load("platform-break-wood-pixel-v1")
    let platform: CGImage? = Self.load("platform-grass-pixel-v1")
    let birds: [CGImage] = {
        guard let sheet = Self.load("bird-pigeon-flap-pixel-v1") else { return [] }
        let width = sheet.width / 3
        return (0..<3).compactMap { sheet.cropping(to: CGRect(x: $0 * width, y: 0, width: width, height: sheet.height)) }
    }()
    let bowl: CGImage? = Self.load("parshad-bowl-pixel-v3")
    private static func load(_ name: String) -> CGImage? {
        guard let url = Bundle.main.url(forResource: name, withExtension: "png"),
              let source = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
        return CGImageSourceCreateImageAtIndex(source, 0, nil)
    }
}
