'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Reorder, motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, HelpCircle } from 'lucide-react'
import dictionary from '@/app/dictionary.json'

interface LetterItem {
  id: string;
  letter: string;
  originalIndex: number;
}

interface DictionaryEntry {
  word: string;
  wordLength: number;
  hint: string;
}

const DraggableWords: React.FC = () => {
  const randomizedDictionary = useMemo(() => {
    return [...dictionary].sort(() => Math.random() - 0.5)
  }, [])

  const words = useMemo(() => randomizedDictionary.map(entry => entry.word), [randomizedDictionary])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [items, setItems] = useState<LetterItem[]>([])
  const [isCorrect, setIsCorrect] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentHint, setCurrentHint] = useState("")
  const [showHint, setShowHint] = useState(false)

  const initializeWord = (word: string) => {
    return word.toUpperCase().split('').map((letter, index) => ({
      id: `${index}-${letter}`,
      letter,
      originalIndex: index
    }))
  }

  const scrambleWord = (letterItems: LetterItem[]) => {
    if (letterItems.length <= 2) return letterItems;
    
    const firstLetter = letterItems[0];
    const lastLetter = letterItems[letterItems.length - 1];
    const middleLetters = letterItems.slice(1, -1);
    
    let scrambledMiddle;
    let isInOriginalOrder;
    
    do {
      scrambledMiddle = [...middleLetters].sort(() => Math.random() - 0.5);
      
      // Check if middle letters are in original order
      isInOriginalOrder = scrambledMiddle.every((letter, index) => 
        letter === middleLetters[index]
      );
    } while (isInOriginalOrder && middleLetters.length > 1);
    
    return [firstLetter, ...scrambledMiddle, lastLetter];
  }

  const handleReorder = (reorderedItems: LetterItem[]) => {
    const firstLetter = items[0];
    const lastLetter = items[items.length - 1];
    const reorderedMiddle = reorderedItems.filter(
      item => item.id !== firstLetter.id && item.id !== lastLetter.id
    );
    setItems([firstLetter, ...reorderedMiddle, lastLetter]);
  }

  useEffect(() => {
    const initialItems = initializeWord(words[currentWordIndex])
    setItems(scrambleWord(initialItems))
    setIsCorrect(false)
    setTimer(0)
    setIsTimerRunning(true)
    setCurrentHint(randomizedDictionary[currentWordIndex].hint)
  }, [currentWordIndex, words, randomizedDictionary])

  useEffect(() => {
    const currentWord = items.map(item => item.letter).join('')
    const correctWord = words[currentWordIndex].toUpperCase()
    if (currentWord === correctWord) {
      setIsCorrect(true)
      setIsTimerRunning(false)
    }
  }, [items, currentWordIndex, words])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  const handleNextWord = () => {
    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
    setIsCorrect(false)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="h-[100dvh] w-full p-2 sm:p-24 overflow-hidden fixed inset-0"
        animate={{ backgroundColor: isCorrect ? '#70e000' : '#ffffff' }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-8">
          <h1 className={`text-4xl font-bold mb-4 transition-colors duration-500 ${isCorrect ? 'text-white' : 'text-[#008000]'}`}>
            What&apos;s the Word?
          </h1>

          <div className={`flex items-center space-x-2 rounded-full px-4 py-2 shadow-md transition-colors duration-500 ${
            isCorrect ? 'bg-[#008000] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="text-xl font-semibold">{formatTime(timer)}</span>
          </div>
        </div>

        <div className="h-full flex flex-col items-center justify-center">
          {items.length > 0 && (
            <Reorder.Group 
              axis="x" 
              values={items.slice(1, -1)} 
              onReorder={(reorderedItems) => handleReorder(reorderedItems)}
              className="w-full max-w-[95vw] sm:max-w-[600px] flex justify-center gap-[1vw] sm:gap-4 mb-8"
            >
              <div key={items[0].id}>
                <Card className={`w-[10vw] h-[13vw] sm:w-16 sm:h-20 flex items-center justify-center transition-colors duration-500 border-2
                  bg-gray-100 min-w-[30px]
                  ${isCorrect ? 'bg-[#008000] border-[#008000]' : 'border-gray-200'}`}>
                  <CardContent className={`p-0 text-[3vw] sm:text-3xl font-bold ${isCorrect ? 'text-white' : ''}`}>
                    {items[0].letter}
                  </CardContent>
                </Card>
              </div>

              {items.slice(1, -1).map((item) => (
                <Reorder.Item key={item.id} value={item}>
                  <motion.div
                    className="cursor-move"
                    whileDrag={{
                      scale: 1.1,
                      zIndex: 1,
                      boxShadow: "0px 10px 25px rgba(0,0,0,0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className={`w-[10vw] h-[13vw] sm:w-16 sm:h-20 flex items-center justify-center transition-colors duration-500 border-2 min-w-[30px]
                      ${isCorrect ? 'bg-[#008000] border-[#008000]' : 'border-gray-200'}`}>
                      <CardContent className={`p-0 text-[3vw] sm:text-3xl font-bold ${isCorrect ? 'text-white' : ''}`}>
                        {item.letter}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Reorder.Item>
              ))}

              <div key={items[items.length - 1].id}>
                <Card className={`w-[10vw] h-[13vw] sm:w-16 sm:h-20 flex items-center justify-center transition-colors duration-500 border-2
                  bg-gray-100 min-w-[30px]
                  ${isCorrect ? 'bg-[#008000] border-[#008000]' : 'border-gray-200'}`}>
                  <CardContent className={`p-0 text-[3vw] sm:text-3xl font-bold ${isCorrect ? 'text-white' : ''}`}>
                    {items[items.length - 1].letter}
                  </CardContent>
                </Card>
              </div>
            </Reorder.Group>
          )}

          <Button
            onClick={handleNextWord}
            className={`mt-4 transition-all duration-300 ${
              isCorrect 
                ? 'opacity-100 visible bg-[#008000] text-white hover:bg-[#006400]' 
                : 'opacity-0 invisible'
            }`}
          >
            Next
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8">
          <AnimatePresence>
            {showHint && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-center max-w-xs text-lg font-medium px-4 py-2 mb-4 rounded-lg transition-colors duration-500 ${
                  isCorrect ? 'text-white' : 'text-gray-700'
                }`}
              >
                {currentHint}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHint(!showHint)}
            className={`${isCorrect ? 'bg-[#008000] hover:bg-[#008000]/90 border-[#008000]' : ''}`}
          >
            <HelpCircle className={`h-5 w-5 ${isCorrect ? 'text-white' : ''}`} />
          </Button>
        </div>

      </motion.div>
    </AnimatePresence>
  )
}

export default DraggableWords

