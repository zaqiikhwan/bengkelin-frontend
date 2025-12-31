import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { HealthStatus } from '../types/api';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

const HealthPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthStatus();
  }, []);

  const loadHealthStatus = async () => {
    try {
      const response = await apiService.getHealthStatus();
      if (response.success && response.data) {
        setHealthStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load health status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return CheckCircleIcon;
      case 'unhealthy':
      case 'error':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return 'text-success-600 bg-success-100';
      case 'unhealthy':
      case 'error':
        return 'text-danger-600 bg-danger-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">System Health</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor the health and status of backend services.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={loadHealthStatus}
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {healthStatus ? (
        <div className="mt-8">
          {/* Overall Status */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Overall Status</h2>
                <p className="text-sm text-gray-600">
                  Last updated: {new Date(healthStatus.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {React.createElement(getStatusIcon(healthStatus.status), {
                  className: `h-6 w-6 ${healthStatus.status.toLowerCase() === 'healthy' ? 'text-success-600' : 'text-danger-600'}`
                })}
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(healthStatus.status)}`}>
                  {healthStatus.status}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Version</p>
                <p className="text-lg font-semibold text-gray-900">{healthStatus.version}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Environment</p>
                <p className="text-lg font-semibold text-gray-900">{healthStatus.environment}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">{healthStatus.uptime}</p>
              </div>
            </div>
          </div>

          {/* Service Checks */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Checks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Database */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CircleStackIcon className="h-6 w-6 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Database</h3>
                  </div>
                  {React.createElement(getStatusIcon(healthStatus.checks.database.status), {
                    className: `h-5 w-5 ${healthStatus.checks.database.status.toLowerCase() === 'healthy' ? 'text-success-600' : 'text-danger-600'}`
                  })}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${healthStatus.checks.database.status.toLowerCase() === 'healthy' ? 'text-success-600' : 'text-danger-600'}`}>
                      {healthStatus.checks.database.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-900">{healthStatus.checks.database.duration}</span>
                  </div>
                  {healthStatus.checks.database.message && (
                    <div className="text-sm">
                      <span className="text-gray-500">Message:</span>
                      <p className="text-gray-900 mt-1">{healthStatus.checks.database.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Redis */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <ServerIcon className="h-6 w-6 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Redis</h3>
                  </div>
                  {React.createElement(getStatusIcon(healthStatus.checks.redis.status), {
                    className: `h-5 w-5 ${healthStatus.checks.redis.status.toLowerCase() === 'healthy' ? 'text-success-600' : 'text-danger-600'}`
                  })}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${healthStatus.checks.redis.status.toLowerCase() === 'healthy' ? 'text-success-600' : 'text-danger-600'}`}>
                      {healthStatus.checks.redis.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-900">{healthStatus.checks.redis.duration}</span>
                  </div>
                  {healthStatus.checks.redis.message && (
                    <div className="text-sm">
                      <span className="text-gray-500">Message:</span>
                      <p className="text-gray-900 mt-1">{healthStatus.checks.redis.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* System */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CpuChipIcon className="h-6 w-6 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">System</h3>
                  </div>
                  {React.createElement(getStatusIcon(healthStatus.checks.system.status), {
                    className: `h-5 w-5 ${healthStatus.checks.system.status.toLowerCase() === 'healthy' ? 'text-success-600' : 'text-danger-600'}`
                  })}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${healthStatus.checks.system.status.toLowerCase() === 'healthy' ? 'text-success-600' : 'text-danger-600'}`}>
                      {healthStatus.checks.system.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-900">{healthStatus.checks.system.duration}</span>
                  </div>
                  {healthStatus.checks.system.message && (
                    <div className="text-sm">
                      <span className="text-gray-500">Message:</span>
                      <p className="text-gray-900 mt-1">{healthStatus.checks.system.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Unable to load health status</h3>
          <p className="mt-1 text-sm text-gray-500">
            There was an error connecting to the backend service.
          </p>
          <div className="mt-6">
            <button onClick={loadHealthStatus} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthPage;