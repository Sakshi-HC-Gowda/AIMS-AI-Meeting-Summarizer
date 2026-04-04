import wave, math, struct, requests
from pathlib import Path

def generate_tone(path, seconds=2, freq=440, rate=16000):
    n = int(rate * seconds)
    with wave.open(str(path), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        for i in range(n):
            value = int(32767 * 0.1 * math.sin(2 * math.pi * freq * i / rate))
            wf.writeframes(struct.pack('<h', value))

if __name__ == '__main__':
    p = Path('tmp_test.wav')
    generate_tone(p, seconds=2)
    with open(p, 'rb') as f:
        files = {'audio': ('tmp_test.wav', f, 'audio/wav')}
        data = {'session_id': 'test-001', 'language': 'en'}
        r = requests.post('http://localhost:5000/api/recording/transcribe', files=files, data=data)
    print('status', r.status_code)
    try:
        print(r.json())
    except Exception as e:
        print('non-json', r.text)
    p.unlink()
