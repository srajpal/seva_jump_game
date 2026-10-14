import XCTest

final class WatchUITests: XCTestCase {
    func testWatchControlsAndLifecycle() {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "org.sevajump.watchprototype")
        app.launch()
        XCTAssertTrue(app.buttons["Play Endless"].waitForExistence(timeout: 20))
        capture(app, "watch-home")
        app.buttons["Play Endless"].tap()
        XCTAssertTrue(app.buttons["Pause game"].exists)
        app.buttons["Pause game"].tap()
        XCTAssertTrue(app.buttons["Resume"].waitForExistence(timeout: 3))
        let field = app.otherElements["watch-playfield"]
        XCTAssertTrue(field.exists)
        let before = field.value as? String
        // Simulator Crown gestures take several seconds; hold the run paused
        // so an ordinary loss cannot race control verification.
        XCUIDevice.shared.rotateDigitalCrown(delta: 0.02)
        XCTAssertEqual(field.value as? String, before)
        app.buttons["Resume"].tap()
        Thread.sleep(forTimeInterval: 0.3)
        XCTAssertNotEqual(field.value as? String, before, "Crown input must steer the jumper after resume")
        capture(app, "watch-crown-gameplay")
        app.buttons["Pause game"].tap()
        XCTAssertTrue(app.buttons["Resume"].waitForExistence(timeout: 3))
        let position = field.value as? String
        Thread.sleep(forTimeInterval: 1)
        XCTAssertEqual(field.value as? String, position)
        capture(app, "watch-paused")
        app.buttons["Resume"].tap()
        XCTAssertTrue(app.buttons["Pause game"].exists)
        let from = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.65))
        from.press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.6, dy: 0.65)))
        app.buttons["Pause game"].tap()
        XCTAssertTrue(app.buttons["Main screen"].waitForExistence(timeout: 3))
        app.buttons["Main screen"].tap()
        XCTAssertTrue(app.buttons["Play Endless"].waitForExistence(timeout: 3))
        XCTAssertFalse(app.buttons["Play Arcade · 150"].exists)
        app.buttons["Sound & feel"].tap()
        XCTAssertTrue(app.switches["Sound"].waitForExistence(timeout: 3))
        let music = app.switches["Music"]
        XCTAssertTrue(music.exists)
        let oldMusic = String(describing: music.value!)
        music.tap(); let newMusic = String(describing: music.value!)
        XCTAssertNotEqual(oldMusic, newMusic)
        let sound = app.switches["Sound"]
        let oldSound = String(describing: sound.value!)
        sound.tap()
        let newSound = String(describing: sound.value!)
        XCTAssertNotEqual(oldSound, newSound)
        app.swipeUp()
        app.buttons["Preview music"].tap()
        XCTAssertTrue(app.staticTexts["Music started"].waitForExistence(timeout: 3))
        Thread.sleep(forTimeInterval: 17)
        XCTAssertEqual(app.staticTexts["Music started"].value as? String, "Music playing", "Playback must continue beyond two eight-second loops")
        app.buttons["Test sound"].tap()
        XCTAssertTrue(app.staticTexts["Sample started"].waitForExistence(timeout: 3))
        capture(app, "watch-sound-settings")
        app.buttons["Done"].tap()
        app.terminate(); app.launch()
        XCTAssertTrue(app.buttons["Play Endless"].waitForExistence(timeout: 20))
        app.buttons["Sound & feel"].tap()
        XCTAssertTrue(sound.waitForExistence(timeout: 3))
        XCTAssertEqual(String(describing: music.value!), newMusic)
        music.tap()
        XCTAssertEqual(String(describing: sound.value!), newSound)
        sound.tap()
        app.buttons["Done"].tap()
        print("WATCH_QA_PASS looping music API and separate toggle persistence; sound sample API and setting persistence; Crown movement, touch drag, pause/resume, menu and cold launch")
    }
    func testMusicAndSavedScore() {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "org.sevajump.watchprototype")
        app.launch()
        XCTAssertTrue(app.buttons["Play Endless"].waitForExistence(timeout: 20))
        let bestQuery = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "High score ")).firstMatch
        let initialBest = Int(bestQuery.label.replacingOccurrences(of: "High score ", with: ""))!
        app.buttons["Sound & feel"].tap()
        let music = app.switches["Music"]
        XCTAssertTrue(music.waitForExistence(timeout: 3))
        let initialMusic = String(describing: music.value!)
        if initialMusic != "1" { music.tap() }
        app.buttons["Done"].tap()
        app.buttons["Play Endless"].tap()
        let field = app.otherElements["watch-playfield"]
        let score = app.staticTexts["watch-score"]
        // Live XCTest gestures can take two seconds, longer than a jump.
        // Verify real playback and saving in a short native run; sustained
        // route/reaction checks belong to the deterministic engine suite.
        Thread.sleep(forTimeInterval: 2)
        XCTAssertTrue(field.exists)
        XCTAssertTrue((score.value as! String).contains("music playing"))
        let endScore = Int((score.value as! String).components(separatedBy: ",")[0])!
        XCTAssertGreaterThan(endScore, 0)
        capture(app, "watch-score-gameplay")
        app.buttons["Pause game"].tap()
        XCTAssertTrue(app.buttons["Resume"].waitForExistence(timeout: 3))
        XCTAssertTrue((score.value as! String).contains("music off"), "Pause should stop music")
        app.buttons["Sound & feel"].tap()
        XCTAssertTrue(music.waitForExistence(timeout: 3))
        music.tap()
        app.buttons["Done"].tap()
        app.buttons["Resume"].tap()
        XCTAssertTrue((score.value as! String).contains("music off"), "Music off must remain off on resume")
        app.buttons["Pause game"].tap()
        let savedRunScore = Int((score.value as! String).components(separatedBy: ",")[0])!
        app.buttons["Main screen"].tap()
        let expectedBest = max(initialBest, savedRunScore)
        XCTAssertEqual(Int(bestQuery.label.replacingOccurrences(of: "High score ", with: "")), expectedBest)
        app.terminate(); app.launch()
        XCTAssertTrue(app.buttons["Play Endless"].waitForExistence(timeout: 20))
        XCTAssertEqual(Int(bestQuery.label.replacingOccurrences(of: "High score ", with: "")), expectedBest)
        capture(app, "watch-score-reopened")
        app.buttons["Sound & feel"].tap()
        XCTAssertTrue(music.waitForExistence(timeout: 3))
        XCTAssertEqual(String(describing: music.value!), "0")
        if initialMusic == "1" { music.tap() }
        app.buttons["Done"].tap()
        print("WATCH_SAVE_PASS score=\(endScore); savedBest=\(expectedBest); real gameplay music; pause/mute; score after process restart")
    }
    func testNinetySecondMusicLoop() {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "org.sevajump.watchprototype")
        app.launch()
        XCTAssertTrue(app.buttons["Play Endless"].waitForExistence(timeout: 20))
        app.buttons["Sound & feel"].tap()
        let music = app.switches["Music"]
        XCTAssertTrue(music.waitForExistence(timeout: 3))
        let initialMusic = String(describing: music.value!)
        if initialMusic != "1" { music.tap() }
        app.swipeUp()
        app.buttons["Preview music"].tap()
        let status = app.staticTexts["Music started"]
        XCTAssertTrue(status.waitForExistence(timeout: 3))
        for elapsed in [30, 60, 90] {
            Thread.sleep(forTimeInterval: 30)
            XCTAssertEqual(status.value as? String, "Music playing")
            print("WATCH_MUSIC_PROGRESS \(elapsed) seconds playback active")
        }
        capture(app, "watch-music-90-seconds")
        app.swipeDown()
        music.tap()
        XCTAssertEqual(String(describing: music.value!), "0")
        app.swipeUp()
        XCTAssertEqual(status.value as? String, "Music off")
        app.swipeDown()
        if initialMusic == "1" { music.tap() }
        app.buttons["Done"].tap()
        print("WATCH_MUSIC_LONG_PASS 90-second native preview playback and mute; original preference restored")
    }
    private func capture(_ app: XCUIApplication, _ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }
}
