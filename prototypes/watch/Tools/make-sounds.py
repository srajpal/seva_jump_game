"""Generate original short, quiet mono effects for this Watch prototype only."""
from pathlib import Path
import math, struct, wave, random
root = Path(__file__).resolve().parents[1] / 'Resources'
random.seed(13)
for name, frequency, duration in [('landing',740,.10),('crumble',240,.16),('rescue',520,.32),('finish',440,.28)]:
    samples=[];rate=22050
    for i in range(int(rate*duration)):
        t=i/rate; envelope=min(1,t/.008)*max(0,1-t/duration)**2
        pitch=frequency*(1+t*2 if name=='rescue' else 1-t*.5)
        tone=math.sin(2*math.pi*pitch*t)
        if name=='crumble': tone=.45*tone+.55*random.uniform(-1,1)
        samples.append(struct.pack('<h',int(32767*.22*envelope*tone)))
    with wave.open(str(root/(name+'.wav')),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b''.join(samples))

# Original 8-second pentatonic loop; sustained quiet notes with smooth edges.
rate=22050; duration=8; notes=[261.63,329.63,392.0,440.0,392.0,329.63,293.66,329.63,
    261.63,293.66,329.63,392.0,329.63,293.66,261.63,293.66]
frames=[]
for i in range(rate*duration):
    t=i/rate; beat=int(t/.5); local=t%0.5; f=notes[beat]
    envelope=math.sin(math.pi*local/.5)**2
    tone=(math.sin(2*math.pi*f*local)+.18*math.sin(2*math.pi*2*f*local))/1.18
    frames.append(struct.pack('<h',int(32767*.12*envelope*tone)))
with wave.open(str(root/'watch-theme.wav'),'wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b''.join(frames))
