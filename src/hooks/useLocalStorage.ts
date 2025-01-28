import {Dispatch, SetStateAction, useEffect, useState} from 'react'

/**
 * A custom hook to manage state with localStorage.
 * @param key The key in localStorage where the value will be stored.
 * @param initialValue The initial value for the state.
 * @returns A tuple with the state value and a setter function.
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // Get the initial value from localStorage or use the provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window?.localStorage === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage whenever the state changes
  useEffect(() => {
    if (typeof window?.localStorage === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export default useLocalStorage
