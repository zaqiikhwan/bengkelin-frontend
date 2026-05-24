import React, { useState, useEffect } from 'react';
import { webSocketService } from '../services/websocket';
import type { WebSocketDebugInfo, ConnectionDiagnostics } from '../services/websocket';
import {
  WifiIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface WebSocketDebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const WebSocketDebugPanel: React.FC<WebSocketDebugPanelProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics | null>(null);
  const [debugLogs, setDebugLogs] = useState<WebSocketDebugInfo[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    // Update diagnostics every 2 seconds
    const interval = setInterval(() => {
      setDiagnostics(webSocketService.getDiagnostics());
    }, 2000);

    // Listen to debug events
    const handleDebug = (debugInfo: WebSocketDebugInfo) => {
      setDebugLogs(prev => [...prev.slice(-19), debugInfo]); // Keep last 20 logs
    };

    webSocketService.on('debug', handleDebug);

    // Initial load
    setDiagnostics(webSocketService.getDiagnostics());

    return () => {
      clearInterval(interval);
      webSocketService.off('debug', handleDebug);
    };
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await webSocketService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleForceReconnect = () => {
    webSocketService.forceReconnect();
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'OPEN': return 'text-green-600';
      case 'CONNECTING': return 'text-yellow-600';
      case 'CLOSING': return 'text-orange-600';
      case 'CLOSED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'OPEN': return <CheckCircleIcon className="w-4 h-4" />;
      case 'CONNECTING': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Show WebSocket Debug Panel"
      >
        <WifiIcon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <WifiIcon className="w-4 h-4 mr-2" />
          WebSocket Debug
        </h3>
        <button
          onClick={onToggle}
          aria-label="Toggle debug panel"
          className="text-gray-400 hover:text-gray-600"
        >
          <EyeSlashIcon className="w-4 h-4" />
        </button>
      </div>

      {diagnostics && (
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="bg-gray-50 rounded p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Connection Status</span>
              <div className={`flex items-center space-x-1 ${getStatusColor(diagnostics.readyState)}`}>
                {getStatusIcon(diagnostics.readyState)}
                <span className="text-xs font-medium">{diagnostics.readyState}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <div>URL: {diagnostics.url}</div>
              <div>User Type: {diagnostics.userType}</div>
              <div>Has Token: {diagnostics.hasToken ? '✓' : '✗'}</div>
              <div>Reconnect Attempts: {diagnostics.reconnectAttempts}/{diagnostics.maxReconnectAttempts}</div>
              {diagnostics.lastError && (
                <div className="text-red-600">Error: {diagnostics.lastError}</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleForceReconnect}
              className="flex-1 bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700"
            >
              Force Reconnect
            </button>
          </div>

          {/* WebSocket Control */}
          <div className="flex space-x-2">
            <button
              onClick={() => webSocketService.connect()}
              disabled={diagnostics.readyState === 'OPEN' || diagnostics.readyState === 'CONNECTING'}
              className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
            >
              Connect WS
            </button>
            <button
              onClick={() => webSocketService.disconnect()}
              disabled={diagnostics.readyState === 'CLOSED'}
              className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`p-2 rounded text-xs ${
              testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <div className="font-medium">
                Test Result: {testResult.success ? 'Success' : 'Failed'}
              </div>
              {testResult.error && <div>Error: {testResult.error}</div>}
              {testResult.networkTest && (
                <div>
                  Network: {testResult.networkTest.canReachHost ? 'Reachable' : 'Unreachable'}
                  {testResult.networkTest.error && ` (${testResult.networkTest.error})`}
                </div>
              )}
            </div>
          )}

          {/* Connection History */}
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs font-medium text-gray-700 mb-2">Recent Events</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {diagnostics.connectionHistory.slice(-5).map((event, index) => (
                <div key={index} className="text-xs text-gray-600">
                  <span className="font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  {' '}
                  <span className={`font-medium ${
                    event.event === 'connected' ? 'text-green-600' :
                    event.event === 'error' ? 'text-red-600' :
                    event.event === 'disconnected' ? 'text-orange-600' :
                    'text-blue-600'
                  }`}>
                    {event.event}
                  </span>
                  {event.details && (
                    <span className="text-gray-500">
                      {' '}({JSON.stringify(event.details).substring(0, 30)}...)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Debug Logs */}
          {debugLogs.length > 0 && (
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs font-medium text-gray-700 mb-2">Debug Logs</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {debugLogs.slice(-10).map((log, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-mono text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    {' '}
                    <span className={`font-medium ${
                      log.level === 'error' ? 'text-red-600' :
                      log.level === 'warn' ? 'text-orange-600' :
                      log.level === 'info' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      [{log.category}]
                    </span>
                    {' '}
                    <span className="text-gray-700">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSocketDebugPanel;