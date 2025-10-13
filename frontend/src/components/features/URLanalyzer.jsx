import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, AlertTriangle, CheckCircle, Search, Clock, 
  TrendingUp, Loader, Globe, ExternalLink, Flag,
  Bug, Zap, Eye 
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import { analyzeURL } from '../../services/api';
import { validateURL } from '../../utils/helpers';

export default function URLAnalyzer() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  const handleAnalyze = useCallback(async () => {
    setError('');
    setAnalysis(null);

    const validation = validateURL(url);
    if (!validation.isValid) {
      setError(validation.error);
      toast.error(validation.error);
      return;
    }

    setLoading(true);
    
    try {
      const result = await analyzeURL(url.trim());
      setAnalysis(result);
      
      setRecentAnalyses(prev => [
        { url: url.trim(), result, timestamp: new Date() },
        ...prev.slice(0, 4)
      ]);
      
      const riskEmoji = {
        'Benign': '🟢',
        'Defacement': '🟡',
        'Malware': '🔴',
        'Phishing': '🟠'
      };
      
      toast.success(`${riskEmoji[result.riskLevel] || '🔍'} Analysis complete: ${result.riskLevel}`);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error.response?.data?.error || 'Failed to analyze URL. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && url.trim()) {
      handleAnalyze();
    }
  };

  const getThreatConfig = (riskLevel) => {
    const configs = {
      'Benign': {
        color: 'text-success-600',
        bgColor: 'bg-success-50',
        borderColor: 'border-success-200',
        icon: CheckCircle,
        description: 'Safe to visit'
      },
      'Defacement': {
        color: 'text-warning-600',
        bgColor: 'bg-warning-50',
        borderColor: 'border-warning-200',
        icon: Eye,
        description: 'Website may be altered'
      },
      'Malware': {
        color: 'text-danger-600',
        bgColor: 'bg-danger-50',
        borderColor: 'border-danger-200',
        icon: Bug,
        description: 'Contains malicious software'
      },
      'Phishing': {
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: Zap,
        description: 'Attempts to steal information'
      }
    };
    
    return configs[riskLevel] || configs['Benign'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Shield className="w-12 h-12 text-primary-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">CyberSentinel</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced URL threat detection powered by machine learning
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Analysis Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Clean URL Input Card */}
            <Card className="p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <Search className="w-8 h-8 text-primary-600 mr-4" />
                <h2 className=" text-2xl font-semibold text-gray-900">Analyze URL</h2>
              </div>
              
              <div className="space-y-6">
                {/* Input Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Enter website URL to analyze
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      disabled={loading}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
                
                {/* Button */}
                <Button
                  onClick={handleAnalyze}
                  loading={loading}
                  disabled={!url.trim()}
                  size="lg"
                  className="w-full bg-blue-500 text-amber-800 sm:w-auto px-8"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5  bg-blue-400 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 caret-amber-500 h-5 mr-2" />
                      Analyze URL
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Results Card */}
            {analysis && (
              <Card className={`p-6 border-l-4 ${getThreatConfig(analysis.riskLevel).borderColor} shadow-lg`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${getThreatConfig(analysis.riskLevel).bgColor} mr-4`}>
                      {React.createElement(getThreatConfig(analysis.riskLevel).icon, {
                        className: `w-8 h-8 ${getThreatConfig(analysis.riskLevel).color}`
                      })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {analysis.riskLevel}
                      </h3>
                      <p className={`text-base ${getThreatConfig(analysis.riskLevel).color} font-medium`}>
                        {getThreatConfig(analysis.riskLevel).description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right bg-gray-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {analysis.confidence}%
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Confidence</div>
                  </div>
                </div>
                
                {/* URL Display */}
                <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6 border">
                  <Globe className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 truncate flex-1 font-mono text-sm">{analysis.analyzedUrl}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-3" />
                </div>
                
                {/* Analysis Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg">Analysis Details:</h4>
                  {analysis.details?.map((detail, index) => (
                    <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.riskScore || 0}</div>
                    <div className="text-sm text-gray-500 font-medium">Risk Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{analysis.responseTime}ms</div>
                    <div className="text-sm text-gray-500 font-medium">Analysis Time</div>
                  </div>
                </div>

                {/* Feedback Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Help Improve Detection</h4>
                      <p className="text-blue-700 text-sm">Was this result incorrect? Report it to help train our AI.</p>
                    </div>
                    <Button
                      onClick={() => navigate('/reporturl')}
                      variant="secondary"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report Result
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Threat Categories */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Categories</h3>
              <div className="space-y-3">
                {[
                  { name: 'Benign', icon: CheckCircle, color: 'text-success-600', count: '1,247' },
                  { name: 'Defacement', icon: Eye, color: 'text-warning-600', count: '89' },
                  { name: 'Malware', icon: Bug, color: 'text-danger-600', count: '156' },
                  { name: 'Phishing', icon: Zap, color: 'text-purple-600', count: '186' }
                ].map((threat) => (
                  <div key={threat.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <threat.icon className={`w-5 h-5 mr-3 ${threat.color}`} />
                      <span className="text-sm font-medium text-gray-700">{threat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{threat.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Analyses */}
            {recentAnalyses.length > 0 && (
              <Card className="p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Scans</h3>
                </div>
                <div className="space-y-3">
                  {recentAnalyses.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getThreatConfig(item.result.riskLevel).bgColor
                        } ${getThreatConfig(item.result.riskLevel).color}`}>
                          {item.result.riskLevel}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{item.url}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Security Tips */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Security Tips</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Always verify URLs before visiting</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Look for HTTPS and valid certificates</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Be cautious of URL shorteners</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                  <span>Check for spelling errors in domains</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
