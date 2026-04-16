import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Clock, ChevronLeft, CheckCircle, HelpCircle } from 'lucide-react';
import { checkAnswer, fetchStudentHistory, submitPuzzle } from '../api';

const keyForCell = (row, col) => `${row}:${col}`;

const GridCell = memo(function GridCell({
  cell,
  value,
  isActiveCell,
  isActiveWord,
  isCrossingWord,
  validationState,
  onClick,
  size,
}) {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  if (!cell) {
    return <div className="bg-[#070606] rounded-lg border border-white/[0.04]" style={sizeStyle} />;
  }

  let bgClass =
    'bg-[#f3f0ea] border border-stone-300/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]';
  if (validationState === 'correct') bgClass = 'bg-emerald-300/45 border border-emerald-600/40 shadow-none';
  if (validationState === 'incorrect') bgClass = 'bg-rose-300/50 border border-rose-600/40 shadow-none';
  if (isCrossingWord) bgClass = 'bg-amber-200/55 border border-amber-600/35 shadow-none';
  if (isActiveWord) bgClass = 'bg-sky-200/55 border border-sky-600/35 shadow-none';
  if (isActiveCell)
    bgClass =
      'bg-[#fff8e7] border-2 border-[#e63946] shadow-[0_0_0_3px_rgba(230,57,70,0.25),0_8px_24px_-12px_rgba(230,57,70,0.35)] z-[1]';

  return (
    <button
      type="button"
      onClick={onClick}
      style={sizeStyle}
      className={`relative rounded-lg flex items-center justify-center overflow-hidden transition-all duration-150 ease-out ${bgClass}`}
    >
      {cell.number ? (
        <span className="absolute top-1 left-1.5 text-[10px] sm:text-xs font-bold text-black select-none">
          {cell.number}
        </span>
      ) : null}
      <span className="text-center font-bold text-2xl sm:text-3xl text-black">
        {value || ''}
      </span>
    </button>
  );
});

const CrosswordPlayer = ({
  selectedPuzzle,
  allPuzzles = [],
  onPuzzleSubmitted,
  studentRegNo: currentStudentRegNo = '',
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [wordValidation, setWordValidation] = useState({});
  const [answerStatus, setAnswerStatus] = useState({});
  const [studentRegNo, setStudentRegNo] = useState(currentStudentRegNo || '21CS001');
  const [checkingClueId, setCheckingClueId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [activeDirection, setActiveDirection] = useState('across');
  const [activeClueId, setActiveClueId] = useState(null);
  const [pageVisible, setPageVisible] = useState(true);
  const boardRef = useRef(null);
  const lastPuzzleIdRef = useRef(null);

  const puzzleClues = useMemo(
    () => (Array.isArray(selectedPuzzle?.clues) ? selectedPuzzle.clues : []),
    [selectedPuzzle]
  );
  const gridCells = useMemo(
    () => (Array.isArray(selectedPuzzle?.cells) ? selectedPuzzle.cells : [[null]]),
    [selectedPuzzle]
  );
  const gridSize = Number(selectedPuzzle?.grid_size || 1);
  const validationMode = selectedPuzzle?.validation_mode || 'on_submit';
  const isLocked = Boolean(existingAttempt || isSubmitted);

  const clueById = useMemo(
    () => Object.fromEntries(puzzleClues.map((clue) => [clue.id, clue])),
    [puzzleClues]
  );

  const orderedClues = useMemo(
    () =>
      [...puzzleClues].sort((a, b) => {
        const aNum = Number(a.number || 0);
        const bNum = Number(b.number || 0);
        if (aNum !== bNum) return aNum - bNum;
        if (a.direction !== b.direction) return a.direction === 'across' ? -1 : 1;
        return a.id - b.id;
      }),
    [puzzleClues]
  );

  const wordCellsByClue = useMemo(() => {
    const map = {};
    for (const clue of puzzleClues) {
      const length = Number(clue.answer_length || 0);
      map[clue.id] = Array.from({ length }).map((_, idx) => ({
        row: clue.row + (clue.direction === 'down' ? idx : 0),
        col: clue.col + (clue.direction === 'across' ? idx : 0),
      }));
    }
    return map;
  }, [puzzleClues]);

  const cellToClues = useMemo(() => {
    const map = {};
    for (const clue of puzzleClues) {
      for (const cell of wordCellsByClue[clue.id] || []) {
        const key = keyForCell(cell.row, cell.col);
        map[key] = map[key] || [];
        map[key].push(clue.id);
      }
    }
    return map;
  }, [puzzleClues, wordCellsByClue]);

  const fillableCellSet = useMemo(() => {
    const set = new Set();
    for (let r = 0; r < gridCells.length; r += 1) {
      for (let c = 0; c < gridCells[r].length; c += 1) {
        if (gridCells[r][c]) {
          set.add(keyForCell(r, c));
        }
      }
    }
    return set;
  }, [gridCells]);

  const gridBounds = useMemo(() => {
    let minRow = Infinity;
    let minCol = Infinity;
    let maxRow = -Infinity;
    let maxCol = -Infinity;
    for (let r = 0; r < gridCells.length; r += 1) {
      for (let c = 0; c < gridCells[r].length; c += 1) {
        if (gridCells[r][c]) {
          if (r < minRow) minRow = r;
          if (c < minCol) minCol = c;
          if (r > maxRow) maxRow = r;
          if (c > maxCol) maxCol = c;
        }
      }
    }
    if (!Number.isFinite(minRow)) {
      return {
        minRow: 0,
        minCol: 0,
        maxRow: Math.max(0, gridCells.length - 1),
        maxCol: Math.max(0, (gridCells[0] || []).length - 1),
        rows: gridCells.length || 1,
        cols: (gridCells[0] || []).length || 1,
      };
    }
    return {
      minRow,
      minCol,
      maxRow,
      maxCol,
      rows: maxRow - minRow + 1,
      cols: maxCol - minCol + 1,
    };
  }, [gridCells]);

  const cellSize = useMemo(() => {
    const maxDim = Math.max(gridBounds.rows, gridBounds.cols);
    return maxDim <= 12 ? 40 : 36;
  }, [gridBounds]);

  useEffect(() => {
    if (!selectedPuzzle) return;
    let mismatch = false;
    puzzleClues.forEach((clue) => {
      const cells = wordCellsByClue[clue.id] || [];
      cells.forEach((cell) => {
        const row = cell.row;
        const col = cell.col;
        const gridRow = gridCells[row];
        const gridCell = gridRow ? gridRow[col] : null;
        if (!gridCell) {
          mismatch = true;
          console.error('Grid mismatch', {
            puzzleId: selectedPuzzle.id,
            clueId: clue.id,
            row,
            col,
            gridSize,
          });
        }
      });
    });
    if (mismatch) {
      setActionError(
        'Grid mismatch detected. Please regenerate the crossword layout or refresh the puzzle.'
      );
    }
  }, [gridCells, gridSize, puzzleClues, selectedPuzzle, wordCellsByClue]);

  const cellValues = useMemo(() => {
    const values = {};
    for (const clue of puzzleClues) {
      const cells = wordCellsByClue[clue.id] || [];
      const answer = answers[clue.id] || '';
      cells.forEach((cell, idx) => {
        const key = keyForCell(cell.row, cell.col);
        if (!values[key] && answer[idx] && answer[idx] !== ' ') {
          values[key] = answer[idx];
        }
      });
    }
    return values;
  }, [answers, puzzleClues, wordCellsByClue]);

  const cellValidation = useMemo(() => {
    const statusMap = {};
    for (const clue of puzzleClues) {
      const states = wordValidation[clue.id];
      if (!states) continue;
      const cells = wordCellsByClue[clue.id] || [];
      cells.forEach((cell, idx) => {
        if (states[idx] === null || states[idx] === undefined) return;
        const key = keyForCell(cell.row, cell.col);
        const current = statusMap[key];
        const next = states[idx] ? 'correct' : 'incorrect';
        if (current === 'incorrect' || next === 'incorrect') {
          statusMap[key] = 'incorrect';
        } else {
          statusMap[key] = 'correct';
        }
      });
    }
    return statusMap;
  }, [puzzleClues, wordCellsByClue, wordValidation]);

  const activeWordCells = useMemo(() => {
    if (!activeClueId) return new Set();
    return new Set((wordCellsByClue[activeClueId] || []).map((c) => keyForCell(c.row, c.col)));
  }, [activeClueId, wordCellsByClue]);

  const crossingWordCells = useMemo(() => {
    if (!activeCell) return new Set();
    const key = keyForCell(activeCell.row, activeCell.col);
    const clueIds = cellToClues[key] || [];
    const crossing = new Set();
    clueIds.forEach((clueId) => {
      if (clueId === activeClueId) return;
      (wordCellsByClue[clueId] || []).forEach((cell) => crossing.add(keyForCell(cell.row, cell.col)));
    });
    return crossing;
  }, [activeCell, activeClueId, cellToClues, wordCellsByClue]);

  const clues = useMemo(
    () => ({
      across: orderedClues.filter((clue) => clue.direction === 'across'),
      down: orderedClues.filter((clue) => clue.direction === 'down'),
    }),
    [orderedClues]
  );

  useEffect(() => {
    const puzzleId = selectedPuzzle?.id ?? null;
    if (!selectedPuzzle || !Array.isArray(selectedPuzzle.clues)) {
      setAnswers({});
      setWordValidation({});
      setAnswerStatus({});
      setSubmitMessage('');
      setActionError('');
      setActiveCell(null);
      setActiveClueId(null);
      setElapsedSeconds(0);
      setIsSubmitted(false);
      setSubmitResult(null);
      setExistingAttempt(null);
      lastPuzzleIdRef.current = null;
      return;
    }
    if (lastPuzzleIdRef.current === puzzleId) return;
    lastPuzzleIdRef.current = puzzleId;

    const nextAnswers = {};
    selectedPuzzle.clues.forEach((clue) => {
      const len = Number(clue.answer_length || 0);
      nextAnswers[clue.id] = ' '.repeat(len);
    });
    setAnswers(nextAnswers);
    setWordValidation({});
    setAnswerStatus({});
    setSubmitMessage('');
    setActionError('');
    setElapsedSeconds(0);
    setIsSubmitted(false);
    setSubmitResult(null);
    setExistingAttempt(null);

    const firstClue = orderedClues[0];
    if (firstClue) {
      setActiveClueId(firstClue.id);
      setActiveDirection(firstClue.direction);
      setActiveCell({ row: firstClue.row, col: firstClue.col });
    }
  }, [selectedPuzzle?.id, orderedClues]);

  useEffect(() => {
    let mounted = true;
    const loadAttempt = async () => {
      if (!selectedPuzzle || !studentRegNo) {
        if (mounted) setExistingAttempt(null);
        return;
      }
      try {
        const history = await fetchStudentHistory(studentRegNo);
        if (!mounted) return;
        const attempt = Array.isArray(history)
          ? history.find((item) => item.puzzle_id === selectedPuzzle.id)
          : null;
        if (attempt) {
          setExistingAttempt(attempt);
          setSubmitResult({
            score: attempt.score,
            completion_time: attempt.completion_time,
            solved_words_count: attempt.solved_words_count,
            rank: attempt.rank,
            correct_words: attempt.solved_words_count,
            total_words: selectedPuzzle.clues?.length || 0,
            incorrect_words: Math.max(0, (selectedPuzzle.clues?.length || 0) - (attempt.solved_words_count || 0)),
          });
          setIsSubmitted(true);
        } else {
          setExistingAttempt(null);
        }
      } catch (error) {
        console.error('Attempt history load failed', error);
      }
    };
    loadAttempt();
    return () => {
      mounted = false;
    };
  }, [selectedPuzzle, studentRegNo]);

  useEffect(() => {
    if (currentStudentRegNo) {
      setStudentRegNo(currentStudentRegNo);
    }
  }, [currentStudentRegNo]);

  useEffect(() => {
    const handler = () => setPageVisible(document.visibilityState === 'visible');
    handler();
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  useEffect(() => {
    if (!selectedPuzzle || isSubmitted || !pageVisible) return undefined;
    const timer = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [selectedPuzzle, isSubmitted, pageVisible]);

  useEffect(() => {
    if (activeCell) {
      boardRef.current?.focus();
    }
  }, [activeCell]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getWordString = (clueId) => (answers[clueId] || '').replace(/\s+/g, '');

  const setWordFromInput = (clueId, next) => {
    const clue = clueById[clueId];
    if (!clue) return;
    const maxLen = Number(clue.answer_length || 0);
    const sanitized = String(next).toUpperCase().replace(/[^A-Z]/g, '').slice(0, maxLen);
    const padded = sanitized.padEnd(maxLen, ' ');
    setAnswers((prev) => ({ ...prev, [clueId]: padded }));
  };

  const updateCellChar = (row, col, char) => {
    const key = keyForCell(row, col);
    const cluesForCell = cellToClues[key] || [];
    if (!cluesForCell.length) return;

    setAnswers((prev) => {
      const next = { ...prev };
      cluesForCell.forEach((clueId) => {
        const clue = clueById[clueId];
        if (!clue) return;
        const cells = wordCellsByClue[clueId] || [];
        const idx = cells.findIndex((cell) => cell.row === row && cell.col === col);
        if (idx < 0) return;
        const current = (prev[clueId] || '').padEnd(clue.answer_length, ' ');
        const updated = current.split('');
        updated[idx] = char || ' ';
        next[clueId] = updated.join('');
      });
      return next;
    });

    setWordValidation((prev) => {
      const next = { ...prev };
      cluesForCell.forEach((clueId) => {
        next[clueId] = null;
      });
      return next;
    });
    setAnswerStatus((prev) => {
      const next = { ...prev };
      cluesForCell.forEach((clueId) => {
        next[clueId] = '';
      });
      return next;
    });
  };

  const findClueAtCell = (row, col, preferredDirection = activeDirection) => {
    const ids = cellToClues[keyForCell(row, col)] || [];
    if (!ids.length) return null;
    const preferred = ids.find((id) => clueById[id]?.direction === preferredDirection);
    return preferred || ids[0];
  };

  const setActiveByClue = (clueId) => {
    const clue = clueById[clueId];
    if (!clue) return;
    setActiveClueId(clue.id);
    setActiveDirection(clue.direction);
    setActiveCell({ row: clue.row, col: clue.col });
    boardRef.current?.focus();
  };

  const moveInsideActiveWord = (step) => {
    if (!activeClueId || !activeCell) return false;
    const cells = wordCellsByClue[activeClueId] || [];
    const idx = cells.findIndex((cell) => cell.row === activeCell.row && cell.col === activeCell.col);
    if (idx < 0) return false;
    const nextIdx = idx + step;
    if (nextIdx < 0 || nextIdx >= cells.length) return false;
    setActiveCell(cells[nextIdx]);
    return true;
  };

  const moveByArrow = (dr, dc, nextDirection) => {
    if (!activeCell) return;
    const nr = activeCell.row + dr;
    const nc = activeCell.col + dc;
    const key = keyForCell(nr, nc);
    if (!fillableCellSet.has(key)) return;
    const clueId = findClueAtCell(nr, nc, nextDirection);
    if (clueId) {
      setActiveClueId(clueId);
      setActiveDirection(nextDirection);
    }
    setActiveCell({ row: nr, col: nc });
  };

  const validateClue = async (clue, answerOverride) => {
    if (!selectedPuzzle || !clue) return null;
    const answer = typeof answerOverride === 'string' ? answerOverride : getWordString(clue.id);
    setCheckingClueId(clue.id);
    try {
      const response = await checkAnswer({
        puzzle: selectedPuzzle.id,
        row: clue.row,
        col: clue.col,
        direction: clue.direction,
        answer,
      });
      setWordValidation((prev) => ({ ...prev, [clue.id]: response?.letter_states || null }));
      setAnswerStatus((prev) => ({ ...prev, [clue.id]: response?.valid ? 'correct' : 'incorrect' }));
      return response;
    } catch (error) {
      console.error('Validation failed:', error);
      setActionError('Validation failed. Please retry.');
      return null;
    } finally {
      setCheckingClueId(null);
    }
  };

  const handleWordInputChange = (clueId, value) => {
    setWordFromInput(clueId, value);
    setActionError('');
    setSubmitMessage('');
    if (validationMode === 'instant') {
      const clue = clueById[clueId];
      const sanitized = String(value).toUpperCase().replace(/[^A-Z]/g, '').slice(0, clue?.answer_length || value.length);
      if (clue) validateClue(clue, sanitized);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPuzzle || isLocked) return;

    const preparedAnswers = {};
    orderedClues.forEach((clue) => {
      const value = getWordString(clue.id);
      if (value) preparedAnswers[String(clue.id)] = value;
    });

    if (Object.keys(preparedAnswers).length === 0) {
      setActionError('Enter at least one answer before submission.');
      return;
    }

    setIsSubmitting(true);
    setActionError('');

    try {
      if (validationMode === 'on_submit') {
        await Promise.all(orderedClues.map((clue) => validateClue(clue)));
      }
      const response = await submitPuzzle({
        student_reg_no: studentRegNo.trim() || '21CS001',
        puzzle: selectedPuzzle.id,
        answers: preparedAnswers,
        completion_time: elapsedSeconds,
      });
      setIsSubmitted(true);
      setExistingAttempt({
        puzzle_id: selectedPuzzle.id,
        score: response?.score,
        completion_time: response?.completion_time,
        solved_words_count: response?.solved_words_count,
        rank: response?.rank,
      });
      const scoreLabel = response?.score ?? 0;
      setSubmitMessage(`Submitted successfully. Score: ${scoreLabel}`);
      setSubmitResult(response);
      if (typeof onPuzzleSubmitted === 'function') {
        await onPuzzleSubmitted();
      }
    } catch (error) {
      console.error('Error submitting puzzle:', error);
      const msg = error?.message || 'Submission failed. Please try again.';
      setActionError(msg);
      if (msg.toLowerCase().includes('already submitted')) {
        try {
          const history = await fetchStudentHistory(studentRegNo);
          const attempt = Array.isArray(history)
            ? history.find((item) => item.puzzle_id === selectedPuzzle.id)
            : null;
          if (attempt) {
            setExistingAttempt(attempt);
            setSubmitResult({
              score: attempt.score,
              completion_time: attempt.completion_time,
              solved_words_count: attempt.solved_words_count,
              rank: attempt.rank,
              correct_words: attempt.solved_words_count,
              total_words: selectedPuzzle.clues?.length || 0,
              incorrect_words: Math.max(0, (selectedPuzzle.clues?.length || 0) - (attempt.solved_words_count || 0)),
            });
            setIsSubmitted(true);
          }
        } catch (historyError) {
          console.error('Failed to load existing attempt', historyError);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event) => {
    if (!activeCell || isLocked) return;

    if (event.key === 'Tab') {
      event.preventDefault();
      if (!orderedClues.length) return;
      const idx = orderedClues.findIndex((c) => c.id === activeClueId);
      const next = orderedClues[(idx + 1 + orderedClues.length) % orderedClues.length];
      setActiveByClue(next.id);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveByArrow(0, 1, 'across');
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveByArrow(0, -1, 'across');
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveByArrow(1, 0, 'down');
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveByArrow(-1, 0, 'down');
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      const cells = wordCellsByClue[activeClueId] || [];
      const idx = cells.findIndex((cell) => cell.row === activeCell.row && cell.col === activeCell.col);
      const currentWord = answers[activeClueId] || '';
      const hadValue = idx >= 0 && currentWord[idx] && currentWord[idx] !== ' ';
      if (hadValue) {
        updateCellChar(activeCell.row, activeCell.col, '');
      } else {
        const moved = moveInsideActiveWord(-1);
        if (moved) {
          setTimeout(() => {
            if (activeCell) {
              updateCellChar(activeCell.row, activeCell.col, '');
            }
          }, 0);
        }
      }
      return;
    }

    if (/^[A-Za-z]$/.test(event.key)) {
      event.preventDefault();
      updateCellChar(activeCell.row, activeCell.col, event.key.toUpperCase());
      moveInsideActiveWord(1);
    }
  };

  const onCellClick = (row, col) => {
    if (isLocked) return;
    const clueId = findClueAtCell(row, col, activeDirection);
    if (clueId) {
      setActiveClueId(clueId);
      setActiveDirection(clueById[clueId]?.direction || activeDirection);
    }
    setActiveCell({ row, col });
    boardRef.current?.focus();
  };

  return (
    <div className="w-full max-w-6xl font-sans text-white flex flex-col h-[calc(100vh-120px)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-6 bg-gradient-to-r from-[#141212] via-[#101010] to-[#0c0a0a] p-4 sm:p-5 rounded-2xl border border-white/[0.07] shadow-[0_20px_50px_-28px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-4 min-w-0">
          <button className="p-2.5 hover:bg-white/[0.08] rounded-xl transition-colors text-gray-400 border border-transparent hover:border-white/10 shrink-0">
            <ChevronLeft size={24} />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-semibold m-0 mb-1">Playing</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0 truncate">
              {selectedPuzzle?.title || 'Select a puzzle from Dashboard'}
            </h2>
            <p className="text-gray-500 text-xs m-0 mt-1 font-medium">
              {selectedPuzzle ? `Puzzle ${allPuzzles.findIndex((p) => p.id === selectedPuzzle.id) + 1} of ${allPuzzles.length}` : 'Puzzle 0 of 0'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl font-bold text-2xl tabular-nums tracking-tight border bg-[#080808] text-white border-[#e63946]/35 shadow-[0_0_0_1px_rgba(230,57,70,0.12),inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_-18px_rgba(230,57,70,0.35)]">
            <Clock size={22} className="text-[#e63946]" />
            {formatTime(elapsedSeconds)}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedPuzzle || isSubmitting || isLocked}
            className="flex items-center gap-2 bg-gradient-to-r from-[#e63946] to-[#c62f3a] hover:brightness-110 text-white px-7 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-[0_14px_40px_-14px_rgba(230,57,70,0.75)] border border-white/10 disabled:opacity-50 disabled:hover:brightness-100"
          >
            <CheckCircle size={18} /> {isSubmitting ? 'Submitting...' : 'Submit Grid'}
          </button>
        </div>
      </div>

      <div className="mb-4 bg-[#0c0a0a]/90 p-3 sm:p-4 rounded-2xl border border-white/[0.06] shadow-inner">
        <input
          type="text"
          value={studentRegNo}
          onChange={(e) => setStudentRegNo(e.target.value)}
          placeholder="Student Registration Number"
          disabled={isLocked}
          className="w-full bg-[#080808] border border-white/[0.08] rounded-xl p-3.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#e63946]/25 focus:border-[#e63946]/45"
        />
      </div>

      {submitMessage && (
        <div className="mb-4 bg-emerald-500/10 text-emerald-200 p-4 rounded-2xl border border-emerald-500/25 text-sm font-medium">
          {submitMessage}
        </div>
      )}
      {submitResult && (
        <div className="mb-4 bg-[#0c0a0a] text-gray-200 p-4 rounded-2xl border border-white/[0.08] text-sm shadow-inner">
          Rank: {submitResult.rank ?? '-'} | Completion: {submitResult.completion_time ?? 0}s | Solved:
          {` ${submitResult.correct_words ?? 0}/${submitResult.total_words ?? 0}`} | Incorrect:
          {` ${submitResult.incorrect_words ?? 0}`}
        </div>
      )}
      {actionError && (
        <div className="mb-4 bg-red-500/10 text-red-200 p-4 rounded-2xl border border-red-500/25 text-sm font-medium">
          {actionError}
        </div>
      )}

      {isLocked ? (
        <div className="flex-1 flex items-center justify-center bg-[#080808] rounded-3xl border border-white/[0.06] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="max-w-xl w-full bg-gradient-to-br from-[#141212] to-[#0c0a0a] rounded-2xl p-8 border border-white/[0.08] text-center shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85)]">
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Puzzle <span className="text-[#e63946]">Submitted</span>
            </h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              This puzzle is locked. Your result is shown below.
            </p>
            <div className="text-sm text-gray-200 font-medium tabular-nums">
              Score: {submitResult?.score ?? 0} | Time: {submitResult?.completion_time ?? 0}s | Solved:{' '}
              {submitResult?.solved_words_count ?? submitResult?.correct_words ?? 0}
              {submitResult?.total_words ? `/${submitResult.total_words}` : ''}
              {submitResult?.rank ? ` | Rank: ${submitResult.rank}` : ''}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
          <div className="flex-1 flex items-center justify-center bg-[#080808] rounded-3xl border border-white/[0.06] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
            <div
              ref={boardRef}
              role="application"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              className="grid gap-1 w-full max-w-[640px] bg-zinc-900/90 p-3 rounded-2xl outline-none border border-white/[0.08] shadow-[0_20px_50px_-28px_rgba(0,0,0,0.9)] focus:ring-2 focus:ring-[#e63946]/30"
              style={{
                gridTemplateColumns: `repeat(${gridBounds.cols || 1}, ${cellSize}px)`,
                gridAutoRows: `${cellSize}px`,
              }}
            >
              {Array.from({ length: gridBounds.rows || 1 }).map((_, rowOffset) => {
                const rIdx = gridBounds.minRow + rowOffset;
                return Array.from({ length: gridBounds.cols || 1 }).map((_, colOffset) => {
                  const cIdx = gridBounds.minCol + colOffset;
                  const cell = gridCells[rIdx]?.[cIdx] || null;
                  const key = keyForCell(rIdx, cIdx);
                  return (
                    <GridCell
                      key={key}
                      cell={cell}
                      value={cellValues[key]}
                      isActiveCell={Boolean(activeCell && activeCell.row === rIdx && activeCell.col === cIdx)}
                      isActiveWord={activeWordCells.has(key)}
                      isCrossingWord={crossingWordCells.has(key)}
                      validationState={cellValidation[key]}
                      onClick={() => onCellClick(rIdx, cIdx)}
                      size={cellSize}
                    />
                  );
                });
              })}
            </div>
          </div>

          <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-1">
            <div className="bg-gradient-to-b from-[#141212] to-[#0c0a0a] rounded-2xl p-6 border border-white/[0.07] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.85)]">
              <h3 className="text-sm font-bold text-white border-b border-white/[0.08] pb-3 mb-4 uppercase tracking-[0.2em] flex justify-between items-center">
                Across
                <HelpCircle size={18} className="text-gray-500 cursor-pointer hover:text-[#e63946] transition-colors" />
              </h3>
              <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {clues.across.length === 0 ? (
                  <li className="text-gray-500 text-sm">No across clues</li>
                ) : (
                  clues.across.map((clue) => (
                    <li
                      key={clue.id}
                      onClick={() => setActiveByClue(clue.id)}
                      className={`flex flex-col gap-2 p-3 rounded-xl transition-all group cursor-pointer border ${
                        activeClueId === clue.id
                          ? 'bg-[#e63946]/[0.12] border-[#e63946]/35 shadow-[0_0_0_1px_rgba(230,57,70,0.12)]'
                          : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        <span className="font-bold text-gray-500 group-hover:text-[#e63946] tabular-nums">{clue.number}</span>
                        <span className="text-gray-300 group-hover:text-white text-sm leading-snug">{clue.clue || clue.question}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={getWordString(clue.id)}
                          onChange={(e) => handleWordInputChange(clue.id, e.target.value)}
                          placeholder="Answer"
                          disabled={isLocked}
                          className="flex-1 bg-[#080808] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946]/40"
                        />
                        <button
                          type="button"
                          onClick={() => validateClue(clue)}
                          disabled={checkingClueId === clue.id || !selectedPuzzle || isLocked}
                          className="bg-white/[0.06] px-3 py-2 rounded-lg text-xs font-semibold text-gray-100 border border-white/10 hover:bg-[#e63946]/20 hover:border-[#e63946]/35 disabled:opacity-50"
                        >
                          {checkingClueId === clue.id ? '...' : 'Check'}
                        </button>
                      </div>
                      {answerStatus[clue.id] === 'correct' && <span className="text-xs text-green-400">Correct</span>}
                      {answerStatus[clue.id] === 'incorrect' && <span className="text-xs text-red-400">Incorrect</span>}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="bg-gradient-to-b from-[#141212] to-[#0c0a0a] rounded-2xl p-6 border border-white/[0.07] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.85)]">
              <h3 className="text-sm font-bold text-white border-b border-white/[0.08] pb-3 mb-4 uppercase tracking-[0.2em] flex justify-between items-center">
                Down
                <HelpCircle size={18} className="text-gray-500 cursor-pointer hover:text-[#e63946] transition-colors" />
              </h3>
              <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {clues.down.length === 0 ? (
                  <li className="text-gray-500 text-sm">No down clues</li>
                ) : (
                  clues.down.map((clue) => (
                    <li
                      key={clue.id}
                      onClick={() => setActiveByClue(clue.id)}
                      className={`flex flex-col gap-2 p-3 rounded-xl transition-all group cursor-pointer border ${
                        activeClueId === clue.id
                          ? 'bg-[#e63946]/[0.12] border-[#e63946]/35 shadow-[0_0_0_1px_rgba(230,57,70,0.12)]'
                          : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        <span className="font-bold text-gray-500 group-hover:text-[#e63946] tabular-nums">{clue.number}</span>
                        <span className="text-gray-300 group-hover:text-white text-sm leading-snug">{clue.clue || clue.question}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={getWordString(clue.id)}
                          onChange={(e) => handleWordInputChange(clue.id, e.target.value)}
                          placeholder="Answer"
                          disabled={isLocked}
                          className="flex-1 bg-[#080808] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946]/40"
                        />
                        <button
                          type="button"
                          onClick={() => validateClue(clue)}
                          disabled={checkingClueId === clue.id || !selectedPuzzle || isLocked}
                          className="bg-white/[0.06] px-3 py-2 rounded-lg text-xs font-semibold text-gray-100 border border-white/10 hover:bg-[#e63946]/20 hover:border-[#e63946]/35 disabled:opacity-50"
                        >
                          {checkingClueId === clue.id ? '...' : 'Check'}
                        </button>
                      </div>
                      {answerStatus[clue.id] === 'correct' && <span className="text-xs text-green-400">Correct</span>}
                      {answerStatus[clue.id] === 'incorrect' && <span className="text-xs text-red-400">Incorrect</span>}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrosswordPlayer;
