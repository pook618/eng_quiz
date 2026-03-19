import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Anti-Cheat Security Hook
 * 
 * Design Philosophy: Warm Supportive Learning Environment
 * - Prevents copy/paste with user-friendly warnings
 * - Detects screenshot attempts and alerts students
 * - Blocks right-click and keyboard shortcuts
 * - Uses encouraging messaging rather than punitive tone
 */

export function useAntiCheat() {
  // Prevent copy/paste
  const handleCopy = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    toast.warning("Copying is disabled during the quiz. You're doing great—focus on the questions!");
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    toast.warning("Pasting is disabled during the quiz. You've got this!");
  }, []);

  // Prevent right-click
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    toast.info("Right-click is disabled to maintain quiz integrity.");
  }, []);

  // Detect keyboard shortcuts (Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+S, Ctrl+P, etc.)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // Block common shortcuts
    if (isCtrlOrCmd && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      toast.warning("Copying is disabled. Stay focused on your quiz!");
      return;
    }

    if (isCtrlOrCmd && (e.key === 'x' || e.key === 'X')) {
      e.preventDefault();
      toast.warning("Cut is disabled. You're doing great!");
      return;
    }

    if (isCtrlOrCmd && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      toast.warning("Pasting is disabled. Trust yourself!");
      return;
    }

    // Block print (Ctrl+P)
    if (isCtrlOrCmd && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      toast.info("Printing is disabled during the quiz.");
      return;
    }

    // Block save (Ctrl+S)
    if (isCtrlOrCmd && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return;
    }

    // Block F12 (Developer Tools)
    if (e.key === 'F12') {
      e.preventDefault();
      toast.info("Developer tools are disabled during the quiz.");
      return;
    }

    // Block Ctrl+Shift+I (Inspect Element)
    if (isCtrlOrCmd && e.shiftKey && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      toast.info("Inspect is disabled during the quiz.");
      return;
    }

    // Block Ctrl+Shift+J (Console)
    if (isCtrlOrCmd && e.shiftKey && (e.key === 'j' || e.key === 'J')) {
      e.preventDefault();
      toast.info("Console access is disabled during the quiz.");
      return;
    }
  }, []);

  // Detect screenshot attempts using various methods
  const detectScreenshot = useCallback(() => {
    // Method 1: Detect Print Screen key
    document.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        toast.warning("Screenshots are not allowed during the quiz. Please focus on answering the questions.");
        // Clear clipboard on screenshot attempt
        navigator.clipboard.writeText('');
      }
    });

    // Method 2: Detect visibility changes (common in some screenshot tools)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        toast.info("Please keep the quiz window active. Switching tabs may be recorded.");
      }
    });

    // Method 3: Detect window blur (switching to another window)
    window.addEventListener('blur', () => {
      toast.warning("You've switched away from the quiz. Please return to focus on your answers.");
    });
  }, []);

  // Disable text selection (makes copying harder)
  const disableTextSelection = useCallback(() => {
    const style = document.createElement('style');
    style.textContent = `
      body {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      input, textarea {
        user-select: text;
        -webkit-user-select: text;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Disable drag and drop
  const disableDragDrop = useCallback(() => {
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
    document.addEventListener('drop', (e) => {
      e.preventDefault();
    });
  }, []);

  // Initialize all security features
  useEffect(() => {
    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Initialize screenshot detection
    detectScreenshot();

    // Disable text selection
    disableTextSelection();

    // Disable drag and drop
    disableDragDrop();

    // Cleanup
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCopy, handlePaste, handleContextMenu, handleKeyDown, detectScreenshot, disableTextSelection, disableDragDrop]);
}
