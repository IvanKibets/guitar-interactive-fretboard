import React, { useState, useRef, useEffect } from 'react';
import { Download, Volume2, VolumeX, Plus, Trash2, Menu, X } from 'lucide-react';

const GuitarFretboard = () => {
  const FRETS = 24;

  // Preset tunings
  const DEFAULT_TUNINGS = {
    'Стандартный': ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    'Drop D': ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    'Drop C': ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'],
    'DADGAD': ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'],
    'Open G': ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
    'Open D': ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4']
  };

  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Circle of fifths with relative minors
  const CIRCLE_DATA = [
    { major: 'C', minor: 'Am', angle: 0 },
    { major: 'G', minor: 'Em', angle: 30 },
    { major: 'D', minor: 'Bm', angle: 60 },
    { major: 'A', minor: 'F#m', angle: 90 },
    { major: 'E', minor: 'C#m', angle: 120 },
    { major: 'B', minor: 'G#m', angle: 150 },
    { major: 'F#', minor: 'D#m', angle: 180 },
    { major: 'C#', minor: 'A#m', angle: 210 },
    { major: 'G#', minor: 'Fm', angle: 240 },
    { major: 'D#', minor: 'Cm', angle: 270 },
    { major: 'A#', minor: 'Gm', angle: 300 },
    { major: 'F', minor: 'Dm', angle: 330 }
  ];

  // Major scale intervals
  const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
  // Minor scale intervals (natural minor)
  const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

  const ALL_NOTES = [];
  for (let octave = 0; octave <= 8; octave++) {
    NOTES.forEach(note => ALL_NOTES.push(`${note}${octave}`));
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [customTunings, setCustomTunings] = useState({});
  const [allTunings, setAllTunings] = useState(DEFAULT_TUNINGS);
  const [tuning, setTuning] = useState([...DEFAULT_TUNINGS['Стандартный']].reverse());
  const [selectedTuning, setSelectedTuning] = useState('Стандартный');
  const [capo, setCapo] = useState(0);
  const [hiddenFrets, setHiddenFrets] = useState(new Set());
  const [hiddenNotes, setHiddenNotes] = useState(new Set());
  const [showHarmonics, setShowHarmonics] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isMinor, setIsMinor] = useState(false);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [playMode, setPlayMode] = useState(false);
  const [showAddTuning, setShowAddTuning] = useState(false);
  const [newTuningName, setNewTuningName] = useState('');
  const [showCircle, setShowCircle] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const fretboardRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    // Initialize Web Audio API on user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudio, { once: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getNoteFromString = (stringNote, fret) => {
    const noteIndex = ALL_NOTES.indexOf(stringNote);
    if (noteIndex === -1) return stringNote;
    return ALL_NOTES[noteIndex + fret] || stringNote;
  };

  const getNoteNameOnly = (fullNote) => {
    return fullNote.replace(/[0-9]/g, '');
  };

  const getScaleNotes = (rootNote, minor = false) => {
    if (!rootNote) return new Set(NOTES);

    const cleanRoot = rootNote.replace('m', '');
    const rootIndex = NOTES.indexOf(cleanRoot);
    if (rootIndex === -1) return new Set(NOTES);

    const intervals = minor ? MINOR_SCALE_INTERVALS : MAJOR_SCALE_INTERVALS;
    const scaleNotes = intervals.map(interval => {
      return NOTES[(rootIndex + interval) % 12];
    });

    return new Set(scaleNotes);
  };

  const getNoteFrequency = (note) => {
    const A4_INDEX = ALL_NOTES.indexOf('A4');
    const noteIndex = ALL_NOTES.indexOf(note);

    if (noteIndex === -1 || A4_INDEX === -1) return 440;

    const semitonesFromA4 = noteIndex - A4_INDEX;
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  };

  const playNote = (note) => {
    if (!audioContextRef.current || !playMode) return;

    const ctx = audioContextRef.current;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        playNoteInternal(ctx, note);
      });
    } else {
      playNoteInternal(ctx, note);
    }
  };

  const playNoteInternal = (ctx, note) => {
    const frequency = getNoteFrequency(note);
    const now = ctx.currentTime;

    const harmonics = [
      { freq: 1.0, gain: 1.0 },
      { freq: 2.0, gain: 0.5 },
      { freq: 3.0, gain: 0.3 },
      { freq: 4.0, gain: 0.2 },
      { freq: 5.0, gain: 0.15 },
      { freq: 6.0, gain: 0.1 },
    ];

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    harmonics.forEach(({ freq, gain }) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.frequency.value = frequency * freq;
      osc.type = 'triangle';

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(gain * 0.15, now + 0.005);
      oscGain.gain.exponentialRampToValueAtTime(gain * 0.08, now + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.start(now);
      osc.stop(now + 2.5);
    });

    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.gain.exponentialRampToValueAtTime(0.5, now + 0.2);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
  };

  const toggleFret = (fret) => {
    const newHidden = new Set(hiddenFrets);
    if (newHidden.has(fret)) {
      newHidden.delete(fret);
    } else {
      newHidden.add(fret);
    }
    setHiddenFrets(newHidden);
  };

  const handleNoteClick = (stringIdx, displayFret, note) => {
    if (playMode) {
      playNote(note);
    } else {
      toggleNote(stringIdx, displayFret);
    }
  };

  const toggleNote = (stringIdx, fret) => {
    const key = `${stringIdx}-${fret}`;
    const newHidden = new Set(hiddenNotes);
    if (newHidden.has(key)) {
      newHidden.delete(key);
    } else {
      newHidden.add(key);
    }
    setHiddenNotes(newHidden);
  };

  const updateStringTuning = (stringIdx, newNote) => {
    const newTuning = [...tuning];
    newTuning[stringIdx] = newNote;
    setTuning(newTuning);
    setSelectedTuning('Настраиваемый');
  };

  const changeTuningPreset = (preset) => {
    setSelectedTuning(preset);
    setTuning([...allTunings[preset]].reverse());
  };

  const addCustomTuning = () => {
    if (!newTuningName.trim()) return;

    const newTunings = {
      ...customTunings,
      [newTuningName]: [...tuning].reverse()
    };

    setCustomTunings(newTunings);
    setAllTunings({...DEFAULT_TUNINGS, ...newTunings});
    setSelectedTuning(newTuningName);
    setNewTuningName('');
    setShowAddTuning(false);
  };

  const deleteCustomTuning = (name) => {
    const newCustom = {...customTunings};
    delete newCustom[name];
    setCustomTunings(newCustom);
    setAllTunings({...DEFAULT_TUNINGS, ...newCustom});

    if (selectedTuning === name) {
      setSelectedTuning('Стандартный');
      setTuning([...DEFAULT_TUNINGS['Стандартный']].reverse());
    }
  };

  const selectKey = (key, minor = false) => {
    if (selectedKey === key && isMinor === minor) {
      setSelectedKey(null);
      setIsMinor(false);
      setHiddenNotes(new Set());
    } else {
      setSelectedKey(key);
      setIsMinor(minor);
      const newHidden = new Set();

      tuning.forEach((stringNote, stringIdx) => {
        for (let displayFret = 0; displayFret <= FRETS; displayFret++) {
          const note = getNoteFromString(stringNote, displayFret);
          const noteName = getNoteNameOnly(note);
          const scaleNotes = getScaleNotes(key, minor);

          if (!scaleNotes.has(noteName)) {
            newHidden.add(`${stringIdx}-${displayFret}`);
          }
        }
      });

      setHiddenNotes(newHidden);
    }
    setShowCircle(false);
  };

  const getHarmonicNote = (openStringNote, fretRelativeToCapo) => {
    const noteIndex = ALL_NOTES.indexOf(openStringNote);
    if (noteIndex === -1) return openStringNote;

    if (fretRelativeToCapo === 5) {
      return ALL_NOTES[noteIndex + 24] || openStringNote;
    } else if (fretRelativeToCapo === 7) {
      return ALL_NOTES[noteIndex + 19] || openStringNote;
    } else if (fretRelativeToCapo === 12) {
      return ALL_NOTES[noteIndex + 12] || openStringNote;
    } else if (fretRelativeToCapo === 19) {
      return ALL_NOTES[noteIndex + 19] || openStringNote;
    } else if (fretRelativeToCapo === 24) {
      return ALL_NOTES[noteIndex + 24] || openStringNote;
    }

    return openStringNote;
  };

  const getHarmonicInfo = (fretRelativeToCapo) => {
    const harmonics = {
      5: { difficulty: 2, color: '#ff6b35' },
      7: { difficulty: 1, color: '#ffd700' },
      12: { difficulty: 0, color: '#4ade80' },
      19: { difficulty: 1, color: '#ffd700' },
      24: { difficulty: 0, color: '#4ade80' }
    };
    return harmonics[fretRelativeToCapo] || null;
  };

  const exportSnapshot = () => {
    if (!fretboardRef.current) return;

    const html2canvas = window.html2canvas;
    if (!html2canvas) {
      alert('Библиотека html2canvas не загружена');
      return;
    }

    html2canvas(fretboardRef.current, {
      backgroundColor: '#3e2723',
      scale: 2
    }).then(canvas => {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `fretboard-${timestamp}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }).catch(err => {
      console.error('Ошибка экспорта:', err);
      alert('Не удалось экспортировать изображение');
    });
  };

  const isNoteVisible = (stringIdx, displayFret) => {
    if (hiddenFrets.has(displayFret)) return false;
    if (hiddenNotes.has(`${stringIdx}-${displayFret}`)) return false;
    return true;
  };

  // Render desktop version
  const renderDesktop = () => (
      <div
          className="min-h-screen p-8 relative"
          style={{
            background: `
          linear-gradient(rgba(62, 39, 35, 0.85), rgba(62, 39, 35, 0.85)),
          repeating-linear-gradient(90deg, 
            rgba(139, 90, 43, 0.3) 0px, 
            rgba(101, 67, 33, 0.3) 2px, 
            rgba(139, 90, 43, 0.3) 4px,
            rgba(160, 82, 45, 0.3) 40px,
            rgba(139, 90, 43, 0.3) 42px,
            rgba(101, 67, 33, 0.3) 44px,
            rgba(139, 90, 43, 0.3) 46px
          ),
          repeating-linear-gradient(0deg,
            rgba(101, 67, 33, 0.2) 0px,
            rgba(139, 90, 43, 0.2) 1px,
            rgba(160, 82, 45, 0.2) 2px
          ),
          linear-gradient(180deg, #4a2c1c 0%, #3e2723 50%, #2d1a14 100%)
        `
          }}
      >
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-amber-200 mb-2 drop-shadow-lg">Интерактивный гитарный гриф</h1>
            <p className="text-amber-300">
              {playMode ? 'Режим прослушивания: кликай по нотам чтобы услышать их звук' : 'Кликай по нотам чтобы скрыть/показать их'}
            </p>
          </div>

          {/* Top controls */}
          <div className="flex justify-center items-center gap-6 mb-6 p-4 rounded-lg shadow-xl flex-wrap" style={{
            background: 'linear-gradient(135deg, rgba(101, 67, 33, 0.9) 0%, rgba(139, 90, 43, 0.9) 100%)',
            border: '3px solid rgba(160, 82, 45, 0.8)'
          }}>
            <div className="flex items-center gap-3">
              <label className="font-semibold text-amber-100">Строй:</label>
              <select
                  value={selectedTuning}
                  onChange={(e) => changeTuningPreset(e.target.value)}
                  className="px-4 py-2 border-2 border-amber-700 rounded-lg bg-amber-50 font-semibold"
              >
                {Object.keys(allTunings).map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                ))}
                <option value="Настраиваемый">Настраиваемый</option>
              </select>
              <button
                  onClick={() => setShowAddTuning(true)}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Добавить строй"
              >
                <Plus size={20} />
              </button>
              {selectedTuning !== 'Настраиваемый' && customTunings[selectedTuning] && (
                  <button
                      onClick={() => deleteCustomTuning(selectedTuning)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Удалить строй"
                  >
                    <Trash2 size={20} />
                  </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="font-semibold text-amber-100">Каподастр:</label>
              <select
                  value={capo}
                  onChange={(e) => setCapo(Number(e.target.value))}
                  className="px-4 py-2 border-2 border-amber-700 rounded-lg bg-amber-50 font-semibold"
              >
                <option value={0}>Нет</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(f => (
                    <option key={f} value={f}>Лад {f}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 relative">
              <label className="font-semibold text-amber-100">Тональность:</label>
              <button
                  onClick={() => setShowCircle(!showCircle)}
                  className="px-4 py-2 border-2 border-amber-700 rounded-lg bg-amber-50 font-semibold hover:bg-amber-100 transition-colors"
              >
                {selectedKey ? `${selectedKey}${isMinor ? ' минор' : ' мажор'}` : 'Выбрать'}
              </button>
              {selectedKey && (
                  <button
                      onClick={() => {
                        setSelectedKey(null);
                        setIsMinor(false);
                        setHiddenNotes(new Set());
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Сбросить
                  </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="font-semibold text-amber-100">Флажолеты:</label>
              <button
                  onClick={() => setShowHarmonics(!showHarmonics)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all shadow-md ${
                      showHarmonics
                          ? 'bg-green-600 text-white shadow-green-900/50'
                          : 'bg-gray-400 text-gray-800'
                  }`}
              >
                {showHarmonics ? 'Вкл' : 'Выкл'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-semibold text-amber-100">Режим:</label>
              <button
                  onClick={() => setPlayMode(!playMode)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all shadow-md ${
                      playMode
                          ? 'bg-purple-600 text-white shadow-purple-900/50'
                          : 'bg-gray-400 text-gray-800'
                  }`}
              >
                {playMode ? <><Volume2 size={18} /> Прослушивание</> : <><VolumeX size={18} /> Редактирование</>}
              </button>
            </div>

            <button
                onClick={exportSnapshot}
                className="flex items-center gap-2 px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg"
            >
              <Download size={20} />
              Сохранить PNG
            </button>
          </div>

          <div className="flex gap-4 items-start">
            {/* String tuning selectors */}
            <div className="flex flex-col gap-3">
              <div className="h-8"></div>
              {tuning.map((note, idx) => (
                  <div key={idx} className="h-12 flex items-center">
                    <select
                        value={note}
                        onChange={(e) => updateStringTuning(idx, e.target.value)}
                        className="w-20 px-2 py-1 border-2 border-amber-700 rounded bg-amber-50 text-sm font-bold shadow-md"
                    >
                      {ALL_NOTES.map(n => (
                          <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
              ))}
            </div>

            {/* Fretboard */}
            <div className="flex-1" ref={fretboardRef}>
              <div className="rounded-xl shadow-2xl p-6 relative overflow-visible" style={{
                background: `
                repeating-linear-gradient(90deg,
                  #D4A574 0px,
                  #C19A6B 1px,
                  #B8956A 2px,
                  #D4A574 3px,
                  #E8C9A0 4px,
                  #D4A574 5px,
                  #C19A6B 8px,
                  #A68860 10px,
                  #C19A6B 12px,
                  #D4A574 15px
                ),
                repeating-linear-gradient(0deg,
                  rgba(139, 90, 43, 0.1) 0px,
                  rgba(160, 82, 45, 0.15) 1px,
                  rgba(139, 90, 43, 0.1) 2px,
                  transparent 3px,
                  transparent 8px
                ),
                linear-gradient(180deg, #D4A574 0%, #C19A6B 30%, #B8956A 50%, #A68860 70%, #947556 100%)
              `,
                boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)'
              }}>
                {/* Strings */}
                <div className="space-y-3 relative">
                  {tuning.map((stringNote, stringIdx) => (
                      <div key={stringIdx} className="flex items-center relative">
                        {/* String line */}
                        <div
                            className="absolute w-full rounded-full"
                            style={{
                              height: `${2.5 - stringIdx * 0.3}px`,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: `linear-gradient(180deg, 
                          rgba(220, 220, 220, 1) 0%, 
                          rgba(192, 192, 192, 1) 30%,
                          rgba(150, 150, 150, 1) 50%,
                          rgba(192, 192, 192, 1) 70%,
                          rgba(220, 220, 220, 1) 100%
                        )`,
                              boxShadow: `0 ${1 + stringIdx * 0.2}px 3px rgba(0,0,0,0.5), 0 -1px 1px rgba(255,255,255,0.4)`
                            }}
                        ></div>

                        {/* Frets */}
                        <div className="flex w-full relative z-10">
                          {Array.from({length: FRETS + 1}, (_, displayFret) => {
                            const fretRelativeToCapo = displayFret - capo;
                            const effectiveStringNote = capo > 0 ? getNoteFromString(stringNote, capo) : stringNote;
                            const note = getNoteFromString(stringNote, displayFret);
                            const harmonicInfo = showHarmonics ? getHarmonicInfo(fretRelativeToCapo) : null;
                            const harmonicNote = harmonicInfo ? getHarmonicNote(effectiveStringNote, fretRelativeToCapo) : note;
                            const visible = isNoteVisible(stringIdx, displayFret);

                            return (
                                <div
                                    key={displayFret}
                                    className="flex-1 flex items-center justify-center relative"
                                    style={{ minWidth: '50px' }}
                                >
                                  {/* Fret wire */}
                                  {displayFret > 0 && (
                                      <div className="absolute left-0 h-16 w-2 rounded-sm z-0" style={{
                                        background: 'linear-gradient(90deg, #9e9e9e 0%, #d0d0d0 20%, #f5f5f5 40%, #d0d0d0 60%, #9e9e9e 80%, #707070 100%)',
                                        boxShadow: '3px 0 6px rgba(0,0,0,0.6), -1px 0 3px rgba(255,255,255,0.4), inset 1px 0 1px rgba(255,255,255,0.5)'
                                      }}></div>
                                  )}

                                  {/* Fret markers */}
                                  {displayFret > 0 && [3, 5, 7, 9, 15, 17, 19, 21].includes(displayFret) && stringIdx === 2 && (
                                      <div className="absolute w-3 h-3 rounded-full z-0" style={{
                                        background: 'radial-gradient(circle at 35% 35%, #ffffff, #e8e8e8, #c0c0c0)',
                                        boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(0,0,0,0.2)'
                                      }}></div>
                                  )}
                                  {displayFret > 0 && [12, 24].includes(displayFret) && [1, 4].includes(stringIdx) && (
                                      <div className="absolute w-3 h-3 rounded-full z-0" style={{
                                        background: 'radial-gradient(circle at 35% 35%, #ffffff, #e8e8e8, #c0c0c0)',
                                        boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(0,0,0,0.2)'
                                      }}></div>
                                  )}

                                  {/* Note display */}
                                  {displayFret >= 0 && (
                                      <button
                                          onClick={() => handleNoteClick(stringIdx, displayFret, harmonicInfo ? harmonicNote : note)}
                                          className={`
                                  w-11 h-11 flex items-center justify-center text-xs font-bold rounded-full
                                  transition-all hover:scale-110 relative z-20
                                  ${playMode ? 'cursor-pointer' : 'cursor-pointer'}
                                  ${visible && !harmonicInfo ? 'shadow-lg' : ''}
                                  ${harmonicInfo && visible ? 'shadow-lg' : ''}
                                  ${!visible ? 'opacity-0' : ''}
                                  ${!visible && !playMode ? 'cursor-default' : ''}
                                `}
                                          style={
                                            harmonicInfo && visible ? {
                                              backgroundColor: harmonicInfo.color,
                                              color: 'white',
                                              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                              border: '2px solid rgba(0,0,0,0.3)'
                                            } : visible ? {
                                              background: playMode ? 'radial-gradient(circle at 30% 30%, #dda0dd, #da70d6)' : 'radial-gradient(circle at 30% 30%, #fffacd, #ffd700)',
                                              color: playMode ? '#4a0e4e' : '#654321',
                                              border: playMode ? '2px solid #8b008b' : '2px solid #b8860b',
                                              boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)'
                                            } : {}
                                          }
                                      >
                                        {visible && (harmonicInfo ? harmonicNote : note)}
                                      </button>
                                  )}
                                </div>
                            );
                          })}
                        </div>
                      </div>
                  ))}

                  {/* Capo overlay */}
                  {capo > 0 && (
                      <div
                          className="absolute top-0 left-0 h-full rounded-lg flex items-center justify-center"
                          style={{
                            width: `${(1 / (FRETS + 1)) * 100}%`,
                            marginLeft: `${((capo) / (FRETS + 1)) * 100}%`,
                            background: 'rgba(20, 20, 20, 0.6)',
                            border: '2px solid rgba(60, 60, 60, 0.8)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
                            zIndex: 30
                          }}
                      >
                    <span className="text-white font-bold text-xs rotate-90 whitespace-nowrap" style={{fontSize: '10px'}}>
                      CAPO
                    </span>
                      </div>
                  )}
                </div>
              </div>

              {/* Fret numbers */}
              <div className="flex mt-4 ml-1">
                {Array.from({length: FRETS + 1}, (_, displayFret) => {
                  const fretRelativeToCapo = displayFret - capo;
                  const displayNumber = capo > 0 && displayFret >= capo ? fretRelativeToCapo : displayFret;

                  return (
                      <div
                          key={displayFret}
                          className="flex-1 flex flex-col items-center gap-1"
                          style={{ minWidth: '50px' }}
                      >
                        <label className="flex flex-col items-center gap-1 cursor-pointer">
                          <input
                              type="checkbox"
                              checked={hiddenFrets.has(displayFret)}
                              onChange={() => toggleFret(displayFret)}
                              className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-amber-200 drop-shadow">{displayNumber}</span>
                        </label>
                      </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          {showHarmonics && (
              <div className="mt-6 p-4 rounded-lg shadow-xl" style={{
                background: 'linear-gradient(135deg, rgba(139, 90, 43, 0.9) 0%, rgba(101, 67, 33, 0.9) 100%)',
                border: '2px solid rgba(160, 82, 45, 0.8)'
              }}>
                <h3 className="font-bold text-amber-100 mb-2 text-lg">Легенда флажолетов:</h3>
                <div className="flex gap-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded shadow-md" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
                    <span className="text-amber-100 font-semibold">Легко (12, 24 лады) - октава выше</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded shadow-md" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
                    <span className="text-amber-100 font-semibold">Средне (7, 19 лады) - октава + квинта</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded shadow-md" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
                    <span className="text-amber-100 font-semibold">Сложно (5 лад) - две октавы выше</span>
                  </div>
                </div>
              </div>
          )}

          {selectedKey && (
              <div className="mt-4 p-3 rounded-lg shadow-xl text-center" style={{
                background: 'linear-gradient(135deg, rgba(34, 139, 34, 0.9) 0%, rgba(46, 125, 50, 0.9) 100%)',
                border: '2px solid rgba(76, 175, 80, 0.8)'
              }}>
                <p className="text-white font-semibold">
                  Отображается тональность: {selectedKey} {isMinor ? 'минор' : 'мажор'}.
                  {playMode ? ' Кликай по нотам чтобы услышать их звук.' : ' Кликай по пустым местам на грифе чтобы вернуть ноты.'}
                </p>
              </div>
          )}
        </div>
      </div>
  );

  // Render mobile version with vertical fretboard
  const renderMobile = () => (
      <div
          className="min-h-screen relative overflow-x-hidden"
          style={{
            background: `
          linear-gradient(rgba(62, 39, 35, 0.85), rgba(62, 39, 35, 0.85)),
          linear-gradient(180deg, #4a2c1c 0%, #3e2723 50%, #2d1a14 100%)
        `
          }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-amber-200 mb-1 drop-shadow-lg">🎸 Гитарный гриф</h1>
            <p className="text-amber-300 text-sm">
              {playMode ? '🔊 Тап для звука' : '👆 Тап чтобы скрыть/показать'}
            </p>
          </div>

          {/* Mobile Controls - Group 1 */}
          <div className="mb-3 p-3 rounded-lg shadow-xl" style={{
            background: 'linear-gradient(135deg, rgba(101, 67, 33, 0.95) 0%, rgba(139, 90, 43, 0.95) 100%)',
            border: '2px solid rgba(160, 82, 45, 0.8)'
          }}>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-amber-100 text-xs font-semibold mb-1 block">Строй</label>
                <select
                    value={selectedTuning}
                    onChange={(e) => changeTuningPreset(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-amber-700 rounded-lg bg-amber-50 font-semibold text-sm"
                >
                  {Object.keys(allTunings).map(preset => (
                      <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-amber-100 text-xs font-semibold mb-1 block">Капо</label>
                <select
                    value={capo}
                    onChange={(e) => setCapo(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-amber-700 rounded-lg bg-amber-50 font-semibold text-sm"
                >
                  <option value={0}>Нет</option>
                  {Array.from({length: 12}, (_, i) => i + 1).map(f => (
                      <option key={f} value={f}>Лад {f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Controls - Group 2 */}
          <div className="mb-3 p-3 rounded-lg shadow-xl" style={{
            background: 'linear-gradient(135deg, rgba(101, 67, 33, 0.95) 0%, rgba(139, 90, 43, 0.95) 100%)',
            border: '2px solid rgba(160, 82, 45, 0.8)'
          }}>
            <div className="mb-2">
              <label className="text-amber-100 text-xs font-semibold mb-1 block">Тональность</label>
              <div className="flex gap-2">
                <button
                    onClick={() => setShowCircle(!showCircle)}
                    className="flex-1 px-3 py-2 border-2 border-amber-700 rounded-lg bg-amber-50 font-semibold hover:bg-amber-100 transition-colors text-sm"
                >
                  {selectedKey ? `${selectedKey}${isMinor ? 'm' : 'M'}` : 'Выбрать'}
                </button>
                {selectedKey && (
                    <button
                        onClick={() => {
                          setSelectedKey(null);
                          setIsMinor(false);
                          setHiddenNotes(new Set());
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                    >
                      ✕
                    </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                  onClick={() => setShowHarmonics(!showHarmonics)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all shadow-md text-sm ${
                      showHarmonics
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-400 text-gray-800'
                  }`}
              >
                {showHarmonics ? '🎵 Флажолеты' : 'Флажолеты'}
              </button>
            </div>
          </div>

          {/* Mobile Controls - Group 3 */}
          <div className="mb-4 p-3 rounded-lg shadow-xl" style={{
            background: 'linear-gradient(135deg, rgba(101, 67, 33, 0.95) 0%, rgba(139, 90, 43, 0.95) 100%)',
            border: '2px solid rgba(160, 82, 45, 0.8)'
          }}>
            <div className="flex gap-2">
              <button
                  onClick={() => setPlayMode(!playMode)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all shadow-md ${
                      playMode
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-400 text-gray-800'
                  }`}
              >
                {playMode ? <><Volume2 size={18} /> Слушать</> : <><VolumeX size={18} /> Править</>}
              </button>
              <button
                  onClick={exportSnapshot}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Fretboard - Vertical */}
          <div ref={fretboardRef} className="relative rounded-xl shadow-2xl overflow-y-auto" style={{
            height: 'calc(100vh - 420px)',
            background: `
            repeating-linear-gradient(0deg,
              #D4A574 0px,
              #C19A6B 1px,
              #B8956A 2px,
              #D4A574 3px,
              #E8C9A0 4px,
              #D4A574 5px,
              #C19A6B 8px,
              #A68860 10px,
              #C19A6B 12px,
              #D4A574 15px
            ),
            linear-gradient(180deg, #D4A574 0%, #C19A6B 30%, #B8956A 50%, #A68860 70%, #947556 100%)
          `,
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.2)'
          }}>
            {/* String labels at top */}
            <div className="sticky top-0 z-40 flex justify-around py-2 px-2" style={{
              background: 'rgba(139, 90, 43, 0.95)',
              borderBottom: '2px solid rgba(101, 67, 33, 0.8)'
            }}>
              {[...tuning].reverse().map((note, idx) => (
                  <div key={idx} className="text-amber-100 font-bold text-xs text-center" style={{flex: 1}}>
                    {note}
                  </div>
              ))}
            </div>

            <div className="p-2">
              {/* Frets vertically */}
              {Array.from({length: FRETS + 1}, (_, displayFret) => {
                const fretRelativeToCapo = displayFret - capo;
                const displayNumber = capo > 0 && displayFret >= capo ? fretRelativeToCapo : displayFret;
                const isCapoFret = displayFret === capo && capo > 0;

                return (
                    <div key={displayFret} className="relative mb-1">
                      {/* Fret wire */}
                      {displayFret > 0 && (
                          <div className="absolute top-0 left-0 right-0 h-1 rounded-sm z-0" style={{
                            background: 'linear-gradient(90deg, #9e9e9e 0%, #d0d0d0 20%, #f5f5f5 40%, #d0d0d0 60%, #9e9e9e 80%, #707070 100%)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.6)'
                          }}></div>
                      )}

                      {/* Capo overlay */}
                      {isCapoFret && (
                          <div className="absolute top-0 left-0 right-0 h-16 z-30 flex items-center justify-center rounded" style={{
                            background: 'rgba(20, 20, 20, 0.7)',
                            border: '2px solid rgba(60, 60, 60, 0.9)'
                          }}>
                            <span className="text-white font-bold text-xs">CAPO</span>
                          </div>
                      )}

                      {/* String notes row */}
                      <div className="flex justify-around items-center py-2 relative z-10">
                        {/* Fret number on left */}
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2">
                          <label className="flex flex-col items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hiddenFrets.has(displayFret)}
                                onChange={() => toggleFret(displayFret)}
                                className="w-5 h-5 cursor-pointer mb-1"
                            />
                            <span className="text-xs font-bold text-amber-200">{displayNumber}</span>
                          </label>
                        </div>

                        {[...tuning].reverse().map((stringNote, stringIdx) => {
                          const actualStringIdx = tuning.length - 1 - stringIdx;
                          const note = getNoteFromString(stringNote, displayFret);
                          const effectiveStringNote = capo > 0 ? getNoteFromString(stringNote, capo) : stringNote;
                          const harmonicInfo = showHarmonics ? getHarmonicInfo(fretRelativeToCapo) : null;
                          const harmonicNote = harmonicInfo ? getHarmonicNote(effectiveStringNote, fretRelativeToCapo) : note;
                          const visible = isNoteVisible(actualStringIdx, displayFret);

                          return (
                              <div key={stringIdx} className="relative" style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
                                {/* String line */}
                                <div
                                    className="absolute left-0 right-0 rounded-full"
                                    style={{
                                      height: `${2.5 - actualStringIdx * 0.3}px`,
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      background: `linear-gradient(90deg, 
                                rgba(220, 220, 220, 1) 0%, 
                                rgba(192, 192, 192, 1) 30%,
                                rgba(150, 150, 150, 1) 50%,
                                rgba(192, 192, 192, 1) 70%,
                                rgba(220, 220, 220, 1) 100%
                              )`,
                                      boxShadow: `0 ${1 + actualStringIdx * 0.2}px 3px rgba(0,0,0,0.5)`
                                    }}
                                ></div>

                                {/* Note */}
                                <button
                                    onClick={() => handleNoteClick(actualStringIdx, displayFret, harmonicInfo ? harmonicNote : note)}
                                    className={`
                              w-12 h-12 flex items-center justify-center text-xs font-bold rounded-full
                              transition-all active:scale-95 relative z-20
                              ${visible && !harmonicInfo ? 'shadow-lg' : ''}
                              ${harmonicInfo && visible ? 'shadow-lg' : ''}
                              ${!visible ? 'opacity-0' : ''}
                            `}
                                    style={
                                      harmonicInfo && visible ? {
                                        backgroundColor: harmonicInfo.color,
                                        color: 'white',
                                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                                        border: '2px solid rgba(0,0,0,0.3)'
                                      } : visible ? {
                                        background: playMode ? 'radial-gradient(circle at 30% 30%, #dda0dd, #da70d6)' : 'radial-gradient(circle at 30% 30%, #fffacd, #ffd700)',
                                        color: playMode ? '#4a0e4e' : '#654321',
                                        border: playMode ? '2px solid #8b008b' : '2px solid #b8860b',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)'
                                      } : {}
                                    }
                                >
                                  {visible && (harmonicInfo ? harmonicNote : note)}
                                </button>
                              </div>
                          );
                        })}
                      </div>

                      {/* Fret markers */}
                      {[3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(displayFret) && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <div className="w-2 h-2 rounded-full" style={{
                              background: 'radial-gradient(circle at 35% 35%, #ffffff, #e8e8e8, #c0c0c0)',
                              boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)'
                            }}></div>
                            {[12, 24].includes(displayFret) && (
                                <div className="w-2 h-2 rounded-full" style={{
                                  background: 'radial-gradient(circle at 35% 35%, #ffffff, #e8e8e8, #c0c0c0)',
                                  boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)'
                                }}></div>
                            )}
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </div>

          {/* Mobile info banner */}
          {selectedKey && (
              <div className="mt-3 p-2 rounded-lg shadow-xl text-center text-sm" style={{
                background: 'linear-gradient(135deg, rgba(34, 139, 34, 0.95) 0%, rgba(46, 125, 50, 0.95) 100%)',
                border: '2px solid rgba(76, 175, 80, 0.8)'
              }}>
                <p className="text-white font-semibold">
                  {selectedKey} {isMinor ? 'минор' : 'мажор'}
                </p>
              </div>
          )}
        </div>
      </div>
  );

  return (
      <>
        {isMobile ? renderMobile() : renderDesktop()}

        {/* Circle of Fifths Modal */}
        {showCircle && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowCircle(false)}>
              <div className="bg-amber-50 p-4 md:p-8 rounded-xl shadow-2xl max-w-full" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl md:text-2xl font-bold text-amber-900 mb-4 md:mb-6 text-center">Кварто-квинтовый круг</h2>
                <svg width={isMobile ? "300" : "500"} height={isMobile ? "300" : "500"} viewBox="0 0 500 500" className="max-w-full">
                  {/* Outer circle (Major keys) */}
                  {CIRCLE_DATA.map((data, idx) => {
                    const startAngle = (data.angle - 15) * Math.PI / 180;
                    const endAngle = (data.angle + 15) * Math.PI / 180;
                    const outerRadius = 200;
                    const innerRadius = 140;

                    const x1 = 250 + outerRadius * Math.cos(startAngle);
                    const y1 = 250 + outerRadius * Math.sin(startAngle);
                    const x2 = 250 + outerRadius * Math.cos(endAngle);
                    const y2 = 250 + outerRadius * Math.sin(endAngle);
                    const x3 = 250 + innerRadius * Math.cos(endAngle);
                    const y3 = 250 + innerRadius * Math.sin(endAngle);
                    const x4 = 250 + innerRadius * Math.cos(startAngle);
                    const y4 = 250 + innerRadius * Math.sin(startAngle);

                    const isSelected = selectedKey === data.major && !isMinor;
                    const isHovered = hoveredKey === data.major;

                    return (
                        <g key={`major-${idx}`}>
                          <path
                              d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`}
                              fill={isSelected ? 'rgba(34, 139, 34, 0.9)' : isHovered ? 'rgba(34, 139, 34, 0.5)' : 'rgba(212, 165, 116, 0.8)'}
                              stroke="#8B6F47"
                              strokeWidth="2"
                              className="cursor-pointer transition-all"
                              onMouseEnter={() => setHoveredKey(data.major)}
                              onMouseLeave={() => setHoveredKey(null)}
                              onClick={() => selectKey(data.major, false)}
                          />
                          <text
                              x={250 + 170 * Math.cos(data.angle * Math.PI / 180)}
                              y={250 + 170 * Math.sin(data.angle * Math.PI / 180)}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="font-bold text-lg fill-amber-900 pointer-events-none"
                          >
                            {data.major}
                          </text>
                        </g>
                    );
                  })}

                  {/* Inner circle (Minor keys) */}
                  {CIRCLE_DATA.map((data, idx) => {
                    const startAngle = (data.angle - 15) * Math.PI / 180;
                    const endAngle = (data.angle + 15) * Math.PI / 180;
                    const outerRadius = 140;
                    const innerRadius = 80;

                    const x1 = 250 + outerRadius * Math.cos(startAngle);
                    const y1 = 250 + outerRadius * Math.sin(startAngle);
                    const x2 = 250 + outerRadius * Math.cos(endAngle);
                    const y2 = 250 + outerRadius * Math.sin(endAngle);
                    const x3 = 250 + innerRadius * Math.cos(endAngle);
                    const y3 = 250 + innerRadius * Math.sin(endAngle);
                    const x4 = 250 + innerRadius * Math.cos(startAngle);
                    const y4 = 250 + innerRadius * Math.sin(startAngle);

                    const minorKey = data.minor.replace('m', '');
                    const isSelected = selectedKey === minorKey && isMinor;
                    const isHovered = hoveredKey === data.major;

                    return (
                        <g key={`minor-${idx}`}>
                          <path
                              d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`}
                              fill={isSelected ? 'rgba(34, 139, 34, 0.9)' : isHovered ? 'rgba(34, 139, 34, 0.5)' : 'rgba(160, 130, 90, 0.8)'}
                              stroke="#6B563F"
                              strokeWidth="2"
                              className="cursor-pointer transition-all"
                              onMouseEnter={() => setHoveredKey(data.major)}
                              onMouseLeave={() => setHoveredKey(null)}
                              onClick={() => selectKey(minorKey, true)}
                          />
                          <text
                              x={250 + 110 * Math.cos(data.angle * Math.PI / 180)}
                              y={250 + 110 * Math.sin(data.angle * Math.PI / 180)}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="font-bold text-sm fill-amber-100 pointer-events-none"
                          >
                            {data.minor}
                          </text>
                        </g>
                    );
                  })}

                  {/* Center circle */}
                  <circle cx="250" cy="250" r="80" fill="rgba(139, 90, 43, 0.9)" stroke="#6B563F" strokeWidth="3" />
                  <text x="250" y="235" textAnchor="middle" className="font-bold text-sm md:text-base fill-amber-100">Внешний:</text>
                  <text x="250" y="255" textAnchor="middle" className="font-bold text-sm md:text-base fill-amber-100">мажор</text>
                  <text x="250" y="275" textAnchor="middle" className="font-bold text-xs md:text-sm fill-amber-200">Внутренний:</text>
                  <text x="250" y="290" textAnchor="middle" className="font-bold text-xs md:text-sm fill-amber-200">минор</text>
                </svg>
                <p className="text-center text-amber-800 mt-4 text-sm">{isMobile ? 'Тап для выбора' : 'Наведи для предпросмотра, кликни для выбора'}</p>
              </div>
            </div>
        )}

        {/* Add Tuning Modal */}
        {showAddTuning && !isMobile && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowAddTuning(false)}>
              <div className="bg-amber-50 p-8 rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Добавить свой строй</h2>
                <p className="text-amber-700 mb-4">Текущий строй (от низкой к высокой): {[...tuning].reverse().join(', ')}</p>
                <input
                    type="text"
                    placeholder="Название строя..."
                    value={newTuningName}
                    onChange={(e) => setNewTuningName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTuning()}
                    className="w-full px-4 py-2 border-2 border-amber-700 rounded-lg mb-4"
                />
                <div className="flex gap-3">
                  <button
                      onClick={addCustomTuning}
                      className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                      onClick={() => {
                        setShowAddTuning(false);
                        setNewTuningName('');
                      }}
                      className="flex-1 px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );
};

export default GuitarFretboard;