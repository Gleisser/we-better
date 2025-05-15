import { useState, useEffect } from 'react';
import { runDatabaseTests } from '@/core/database/tests/databaseTests';

/**
 * Debug component for testing IndexedDB functionality.
 *
 * IMPORTANT: This component should only be used in development and
 * should not be included in production builds.
 */
export const DatabaseTester = (): JSX.Element => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Override console logs to capture test output
  useEffect(() => {
    if (!isRunning) return;

    const originalLog = console.info;
    const originalError = console.error;
    const originalGroup = console.info;
    const originalGroupEnd = console.info;

    // Capture log output
    console.info = (...args) => {
      originalLog(...args);
      setTestResults(prev => [
        ...prev,
        args
          .map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(' '),
      ]);
    };

    console.error = (...args) => {
      originalError(...args);
      setTestResults(prev => [
        ...prev,
        `❌ ERROR: ${args
          .map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(' ')}`,
      ]);
    };

    console.info = label => {
      originalGroup(label);
      setTestResults(prev => [...prev, `📂 ${label}`]);
    };

    console.info = () => {
      originalGroupEnd();
      setTestResults(prev => [...prev, '📂 ---']);
    };

    return () => {
      // Restore original console methods
      console.info = originalLog;
      console.error = originalError;
      console.info = originalGroup;
      console.info = originalGroupEnd;
    };
  }, [isRunning]);

  const runTests = async (): Promise<void> => {
    setTestResults([]);
    setIsRunning(true);

    try {
      await runDatabaseTests();
    } catch (error) {
      console.error('Tests failed with error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-4">
      <h2 className="text-xl font-semibold mb-4">IndexedDB Tester</h2>

      <button
        onClick={runTests}
        disabled={isRunning}
        className={`px-4 py-2 rounded-md text-white font-medium ${
          isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isRunning ? 'Running Tests...' : 'Run Database Tests'}
      </button>

      {testResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Test Results:</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-auto max-h-96">
            {testResults.map((result, index) => (
              <div key={index} className="whitespace-pre-wrap mb-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Note: This is a development tool and should not be included in production builds.
      </p>
    </div>
  );
};
