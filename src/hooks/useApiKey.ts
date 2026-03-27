import { useState, useEffect } from 'react';

export function useApiKey() {
  const [hasKey, setHasKey] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // @ts-ignore
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          // @ts-ignore
          const has = await window.aistudio.hasSelectedApiKey();
          setHasKey(has);
        } else {
          // Fallback if not in AI Studio environment or API not available yet
          setHasKey(!!process.env.GEMINI_API_KEY);
        }
      } catch (e) {
        console.error(e);
        setHasKey(!!process.env.GEMINI_API_KEY);
      } finally {
        setIsChecking(false);
      }
    };
    checkKey();
  }, []);

  const selectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race condition
        setHasKey(true);
      } else {
        alert("API key selection is only available in the AI Studio environment.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return { hasKey, isChecking, selectKey, setHasKey };
}
